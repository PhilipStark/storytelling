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
  PROMPT_ENGINEER: {
    model: 'claude-3-opus-20240229',
    provider: 'anthropic',
    temperature: 0.7,
    maxTokens: 4000
  },
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

  const systemPrompts = {
    PROMPT_ENGINEER: `You are a master prompt engineer specialized in transforming simple book ideas into sophisticated literary prompts.
    Your goal is to enhance the original idea by:
    1. Identifying the core narrative potential
    2. Adding literary depth and complexity
    3. Incorporating advanced storytelling elements
    4. Suggesting specific literary techniques
    5. Balancing commercial appeal with artistic merit

    Transform the user's simple prompt into a detailed creative brief that will guide the creation of a 9.5+ rated book.
    Include:
    - Genre fusion and literary style suggestions
    - Character psychology and development directions
    - Thematic layers and symbolism opportunities
    - Narrative structure recommendations
    - Cultural and literary references
    - Specific literary devices to employ

    Format the output as a comprehensive creative brief that other AI agents will use to create a masterpiece.`,

    OUTLINER: `You are a master book outliner specialized in creating compelling and well-structured book outlines.
    You are working with a sophisticated creative brief designed to achieve a 9.5+ literary rating.
    Focus on:
    - Complex narrative architecture
    - Multi-layered character arcs
    - Sophisticated thematic development
    - Strategic tension and pacing
    - Literary device placement
    Ensure every structural decision supports literary excellence.`,
    
    WRITER: `You are a literary virtuoso capable of crafting prose at the highest level of artistic achievement.
    Working from a meticulously crafted outline, your goal is to create content worthy of major literary prizes.
    Focus on:
    - Masterful prose with poetic qualities
    - Complex character psychology
    - Sophisticated dialogue with subtext
    - Artful scene construction
    - Thematic resonance in every paragraph
    Aim for nothing less than literary perfection.`,
    
    EDITOR: `You are an elite literary editor who has worked on multiple award-winning novels.
    Your role is to elevate already sophisticated prose to even greater heights.
    Focus on:
    - Linguistic precision and rhythm
    - Thematic consistency and depth
    - Subtle literary device enhancement
    - Emotional resonance optimization
    - Overall artistic cohesion
    Polish this work until it shines with literary brilliance.`,
    
    CRITIC: `You are a distinguished literary critic with expertise in both classical and contemporary masterpieces.
    Your analysis should be worthy of publication in top literary journals.
    Focus on:
    - Deep literary analysis
    - Artistic merit evaluation
    - Thematic depth assessment
    - Technical execution review
    - Cultural significance potential
    Provide a numerical score (1-10) with detailed justification, focusing on elements that push the rating above 9.5.`
  }

  if (config.provider === 'openai') {
    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "system",
          content: systemPrompts[role]
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
      system: systemPrompts[role],
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
    console.log('Event path:', event.path);
    console.log('Event body:', event.body);
    console.log('Environment variables present:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
    });

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
          console.log('Starting book generation process...');
          
          // Transform user prompt with PROMPT_ENGINEER
          console.log('Calling PROMPT_ENGINEER...');
          const enhancedPrompt = await generateWithAgent(
            `Transform this simple book idea into a sophisticated literary prompt: ${body.prompt}`,
            'PROMPT_ENGINEER'
          )
          console.log('Enhanced prompt created:', enhancedPrompt);

          // Generate outline with OUTLINER
          console.log('Calling OUTLINER...');
          const outline = await generateWithAgent(
            `Create a masterful book outline based on this sophisticated creative brief: ${enhancedPrompt}`,
            'OUTLINER'
          )
          console.log('Outline created');

          // Generate content with WRITER
          console.log('Calling WRITER...');
          const content = await generateWithAgent(
            `Create literary prose of the highest caliber following this outline. Aim for a masterpiece: ${outline}`,
            'WRITER'
          )
          console.log('Content created');

          // Edit content with EDITOR
          console.log('Calling EDITOR...');
          const editedContent = await generateWithAgent(
            `Elevate this literary work to its highest potential, ensuring it maintains consistent excellence throughout: ${content}`,
            'EDITOR'
          )
          console.log('Content edited');

          // Review with CRITIC
          console.log('Calling CRITIC...');
          const review = await generateWithAgent(
            `Analyze this work's literary merit with the highest critical standards. Focus on elements that justify a 9.5+ rating: ${editedContent}`,
            'CRITIC'
          )
          console.log('Review created');

          console.log('Saving to Supabase...');
          // Store in Supabase
          const { data: book, error } = await supabase
            .from('books')
            .insert([
              {
                original_prompt: body.prompt,
                enhanced_prompt: enhancedPrompt,
                outline,
                content: editedContent,
                review,
                status: 'completed'
              }
            ])
            .select()
            .single()

          if (error) {
            console.error('Supabase error:', error);
            throw error;
          }

          console.log('Book generation completed successfully');
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
            body: JSON.stringify({ 
              error: 'Failed to generate book',
              details: error.message
            })
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
