import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const userData = await request.json()
    const { userId, nickname, profilePicture } = userData

    if (!userId || !nickname) {
      return NextResponse.json({ error: 'User ID and nickname are required' }, { status: 400 })
    }

    try {
      const redis = await getRedisClient()

      // Store user data in Redis
      await redis.hSet(`user:${userId}`, {
        nickname,
        profilePicture: profilePicture || null,
        lastUpdated: Date.now()
      })

      return NextResponse.json({ success: true })
    } catch (redisError) {
      console.error('Redis save failed:', redisError)
      // Even if Redis fails, the data is still in localStorage
      return NextResponse.json({ success: true, warning: 'Saved locally only' })
    }
  } catch (error) {
    console.error('Error saving user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 