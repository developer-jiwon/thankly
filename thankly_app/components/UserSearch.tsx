'use client'

import { useState, useEffect } from 'react'
import { Search, User } from 'lucide-react'

interface UserSearchProps {
  onSelectUser: (userId: string) => void
}

interface UserProfile {
  userId: string
  nickname: string
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // This is a mock implementation - in a real app, this would call an API
  const searchUsers = (term: string) => {
    setIsSearching(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // For now, we'll just search through localStorage for nicknames
      // In a real implementation, this would be a server API call
      const results: UserProfile[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('nickname_')) {
          const userId = key.replace('nickname_', '')
          const nickname = localStorage.getItem(key) || ''
          
          if (nickname.toLowerCase().includes(term.toLowerCase())) {
            results.push({ userId, nickname })
          }
        }
      }
      
      setSearchResults(results)
      setIsSearching(false)
    }, 500)
  }

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchUsers(searchTerm)
    } else {
      setSearchResults([])
    }
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60
                           flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
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