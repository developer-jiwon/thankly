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

  const searchUsers = (term: string) => {
    setIsSearching(true)
    
    try {
      const currentUserId = localStorage.getItem('originalUserId')
      if (!currentUserId) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      // Get the global users list from localStorage
      let globalUsers = localStorage.getItem('globalUsers')
      let usersRegistry: UserProfile[] = []

      if (!globalUsers) {
        // Initialize global users list with current user
        const currentNickname = localStorage.getItem(`nickname_${currentUserId}`)
        const currentProfilePic = localStorage.getItem(`profilePicture_${currentUserId}`)
        
        if (currentNickname) {
          usersRegistry = [{
            userId: currentUserId,
            nickname: currentNickname,
            profilePicture: currentProfilePic
          }]
          localStorage.setItem('globalUsers', JSON.stringify(usersRegistry))
        }
      } else {
        usersRegistry = JSON.parse(globalUsers)
        
        // Update current user's info in the registry
        const currentNickname = localStorage.getItem(`nickname_${currentUserId}`)
        const currentProfilePic = localStorage.getItem(`profilePicture_${currentUserId}`)
        
        if (currentNickname) {
          const existingUserIndex = usersRegistry.findIndex(u => u.userId === currentUserId)
          const updatedUser = {
            userId: currentUserId,
            nickname: currentNickname,
            profilePicture: currentProfilePic
          }

          if (existingUserIndex === -1) {
            usersRegistry.push(updatedUser)
          } else {
            usersRegistry[existingUserIndex] = updatedUser
          }

          localStorage.setItem('globalUsers', JSON.stringify(usersRegistry))
        }
      }

      // When visiting another user's profile, add them to the registry
      const hashUserId = window.location.hash.slice(1)
      if (hashUserId && hashUserId !== currentUserId) {
        const visitedNickname = localStorage.getItem(`nickname_${hashUserId}`)
        const visitedProfilePic = localStorage.getItem(`profilePicture_${hashUserId}`)
        
        if (visitedNickname) {
          const existingUserIndex = usersRegistry.findIndex(u => u.userId === hashUserId)
          const visitedUser = {
            userId: hashUserId,
            nickname: visitedNickname,
            profilePicture: visitedProfilePic
          }

          if (existingUserIndex === -1) {
            usersRegistry.push(visitedUser)
          } else {
            usersRegistry[existingUserIndex] = visitedUser
          }

          localStorage.setItem('globalUsers', JSON.stringify(usersRegistry))
        }
      }

      // Filter users based on search term
      const results = usersRegistry.filter(user => 
        user.userId !== currentUserId && 
        user.nickname.toLowerCase().includes(term.toLowerCase())
      )

      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    }
    
    setIsSearching(false)
  }

  // Update global users list when component mounts and when profile changes
  useEffect(() => {
    const currentUserId = localStorage.getItem('originalUserId')
    if (currentUserId) {
      searchUsers('')  // This will update the global users list
    }
  }, [])

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