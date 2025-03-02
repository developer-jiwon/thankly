'use client'

import { useState, useEffect } from 'react'
import { Search, User } from 'lucide-react'

interface UserSearchProps {
  onSelectUser: (userId: string) => void
}

interface UserProfile {
  userId: string
  nickname: string
  profilePicture?: string | null
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchUsers = async (term: string) => {
    setIsSearching(true)
    
    try {
      const currentUserId = localStorage.getItem('originalUserId')
      if (!currentUserId) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      const results: UserProfile[] = []
      const seen = new Set<string>() // To prevent duplicates

      // Search through localStorage for all users
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('nickname_')) {
          const userId = key.replace('nickname_', '')
          
          // Skip if it's the current user
          if (userId === currentUserId) continue
          
          const nickname = localStorage.getItem(key) || ''
          if (nickname.toLowerCase().includes(term.toLowerCase())) {
            results.push({
              userId,
              nickname,
              profilePicture: localStorage.getItem(`profilePicture_${userId}`)
            })
            seen.add(userId)
          }
        }
      }

      // Also check the current URL hash for a user
      const hashUserId = window.location.hash.slice(1)
      if (hashUserId && !seen.has(hashUserId) && hashUserId !== currentUserId) {
        const nickname = localStorage.getItem(`nickname_${hashUserId}`)
        if (nickname && nickname.toLowerCase().includes(term.toLowerCase())) {
          results.push({
            userId: hashUserId,
            nickname,
            profilePicture: localStorage.getItem(`profilePicture_${hashUserId}`)
          })
        }
      }

      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    }
    
    setIsSearching(false)
  }

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.length > 2) {
        searchUsers(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 300) // Add debounce to prevent too many searches

    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white/40" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg
                   bg-white/5 text-white placeholder-white/40 text-sm
                   focus:outline-none focus:border-white/20"
          placeholder="Search users by nickname..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isSearching && (
        <div className="mt-2 text-center text-sm text-white/60">
          Searching...
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="mt-2 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {searchResults.map((user) => (
            <button
              key={user.userId}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10
                       text-left border-b border-white/5 last:border-b-0
                       transition-colors duration-200"
              onClick={() => onSelectUser(user.userId)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={`${user.nickname}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white/60" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{user.nickname}</div>
                <div className="text-xs text-white/40">Click to view journal</div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {searchTerm.length > 2 && searchResults.length === 0 && !isSearching && (
        <div className="mt-2 text-center text-sm text-white/60 p-4 bg-white/5 rounded-lg">
          No users found with that nickname.
        </div>
      )}
    </div>
  )
} 