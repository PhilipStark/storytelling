import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

interface AgentConfig {
  model: string
  provider: 'openai' | 'anthropic'
  temperature: number
  maxTokens: number
}

const agentConfigs: Record<string, AgentConfig> = {
  OUTLINER: {
    model: 'claude-3-opus-20240229',
    provider: 'anthropic',
    temperature: 0.7,
    maxTokens: 4000
  },
  WRITER: {
    model: 'claude-3-opus-20240229',
    provider: 'anthropic',
    temperature: 0.8,
    maxTokens: 8000
  },
  EDITOR: {
    model: 'gpt-4',
    provider: 'openai',
    temperature: 0.7,
    maxTokens: 2000
  },
  CRITIC: {
    model: 'claude-3-opus-20240229',
    provider: 'anthropic',
    temperature: 0.7,
    maxTokens: 4000
  }
}

async function generateWithAgent(prompt: string, role: string): Promise<string> {
  const config = agentConfigs[role]
  if (!config) throw new Error(`Invalid agent role: ${role}`)

  if (config.provider === 'openai') {
    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "system",
          content: `You are a ${role.toLowerCase()} specialized in book creation.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })
    return completion.choices[0].message.content || ''
  } else {
    const message = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: `You are a ${role.toLowerCase()} specialized in book creation.`,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
    return message.content[0].text
  }
}

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    }
  }

  try {
    const path = event.path.replace('/.netlify/functions/api/', '')
    const body = event.body ? JSON.parse(event.body) : {}

    // Handle different API endpoints
    switch (path) {
      case 'books/generate':
        if (!body.prompt) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Prompt is required' })
          }
        }

        try {
          // Generate outline with OUTLINER
          const outline = await generateWithAgent(
            `Create a detailed book outline for the following idea: ${body.prompt}`,
            'OUTLINER'
          )

          // Generate content with WRITER
          const content = await generateWithAgent(
            `Create the book content following this outline: ${outline}`,
            'WRITER'
          )

          // Edit content with EDITOR
          const editedContent = await generateWithAgent(
            `Edit and improve this book content: ${content}`,
            'EDITOR'
          )

          // Review with CRITIC
          const review = await generateWithAgent(
            `Review this book and provide feedback: ${editedContent}`,
            'CRITIC'
          )

          // Store in Supabase
          const { data: book, error } = await supabase
            .from('books')
            .insert([
              {
                prompt: body.prompt,
                outline,
                content: editedContent,
                review,
                status: 'completed'
              }
            ])
            .select()
            .single()

          if (error) throw error

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(book)
          }
        } catch (error) {
          console.error('Book generation error:', error)
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to generate book' })
          }
        }

      case 'metrics/agents':
        const { data: metrics } = await supabase
          .from('agent_metrics')
          .select('*')
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(metrics)
        }

      case 'metrics/quality/trends':
        const { agent_type, days = 7 } = event.queryStringParameters || {}
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - Number(days))

        const { data: trends } = await supabase
          .from('analytics_events')
          .select('*')
          .eq('agent_type', agent_type)
          .eq('metric_type', 'QUALITY_SCORE')
          .gte('timestamp', startDate.toISOString())
          .order('timestamp')

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(trends)
        }

      case 'metrics/cache/performance':
        const { agent_type: cacheAgentType } = event.queryStringParameters || {}
        let query = supabase
          .from('analytics_events')
          .select('*')
          .in('metric_type', ['CACHE_HIT', 'CACHE_MISS'])

        if (cacheAgentType) {
          query = query.eq('agent_type', cacheAgentType)
        }

        const { data: cacheEvents } = await query
        const hits = cacheEvents?.filter(e => e.metric_type === 'CACHE_HIT').length || 0
        const misses = cacheEvents?.filter(e => e.metric_type === 'CACHE_MISS').length || 0
        const total = hits + misses

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            hit_rate: total > 0 ? (hits / total) * 100 : 0,
            miss_rate: total > 0 ? (misses / total) * 100 : 0,
            total_requests: total
          })
        }

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not Found' })
        }
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
}
