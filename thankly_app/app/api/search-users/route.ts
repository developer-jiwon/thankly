import { NextResponse } from 'next/server'

interface UserProfile {
  userId: string
  nickname: string
  profilePicture?: string | null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const term = searchParams.get('term')

    if (!term) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 })
    }

    // Get all users from localStorage on the server side
    const users: UserProfile[] = []
    
    // Return empty array for now - the client-side search will handle the actual search
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 