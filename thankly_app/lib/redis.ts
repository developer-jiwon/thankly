import { createClient } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

export async function getRedisClient() {
  if (!globalForRedis.redis) {
    try {
      // In development, we'll use a more tolerant configuration
      const options = {
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries: number) => {
            if (retries > 3) {
              console.warn('Redis connection failed, falling back to localStorage')
              return false
            }
            return Math.min(retries * 500, 3000)
          }
        }
      }

      const client = createClient(options)

      client.on('error', (err) => {
        console.warn('Redis Client Error (expected in development):', err.message)
      })

      await client.connect()
      globalForRedis.redis = client
    } catch (error) {
      console.warn('Redis connection failed (expected in development), using localStorage fallback')
      return null
    }
  }

  return globalForRedis.redis
} 