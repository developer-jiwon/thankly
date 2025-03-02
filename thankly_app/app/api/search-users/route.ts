import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'

interface UserProfile {
  userId: string
  nickname: string
  profilePicture?: string | null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const term = searchParams.get('term')
    const currentUserId = searchParams.get('currentUserId')

    if (!term) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 })
    }

    let users: UserProfile[] = []
    const redis = await getRedisClient()

    if (redis) {
      // Redis is available (production)
      try {
        const userKeys = await redis.keys('user:*')
        
        for (const key of userKeys) {
          const userId = key.replace('user:', '')
          if (userId === currentUserId) continue

          const userData = await redis.hGetAll(key)
          if (userData && userData.nickname) {
            const nickname = String(userData.nickname)
            if (nickname.toLowerCase().includes(term.toLowerCase())) {
              users.push({
                userId,
                nickname,
                profilePicture: userData.profilePicture || null
              })
            }
          }
        }
      } catch (redisError) {
        console.error('Redis search failed:', redisError)
      }
    }

    // Always return the results array (empty if Redis fails)
    // The client-side will merge with localStorage results
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 