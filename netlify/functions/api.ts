import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

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
