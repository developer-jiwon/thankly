'use client'

import { LoginForm } from '@/components/LoginForm'
import { ShinyHeart } from '@/components/ShinyHeart'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [showIdInput, setShowIdInput] = useState(false)
  const [loginMode, setLoginMode] = useState<'new' | 'existing'>('new')

  useEffect(() => {
    // If URL already has a hash, go to main page
    const hashUserId = window.location.hash.slice(1)
    if (hashUserId && hashUserId.includes('-')) {
      window.location.replace('/')
    }
  }, [])

  const generateUserId = (name: string) => {
    // Clean the name: lowercase and remove special characters
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    // Add a timestamp and random string for uniqueness
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 5)
    return `${cleanName}-${timestamp}-${randomStr}`
  }

  const handleGuestLogin = () => {
    if (loginMode === 'new') {
      if (!showNameInput) {
        setShowNameInput(true)
        setShowIdInput(false)
        return
      }
      
      if (!name.trim()) return

      const newUserId = generateUserId(name.trim())
      
      localStorage.setItem('isGuest', 'true')
      localStorage.setItem('userName', name.trim())
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userId', newUserId)
      
      // This is a new user, so set this as their original ID
      localStorage.setItem('originalUserId', newUserId)
      
      // Store the nickname for this user ID
      localStorage.setItem(`nickname_${newUserId}`, name.trim())
      
      // Use window.location.replace for consistent behavior across platforms
      window.location.replace(`/#${newUserId}`)
    } else {
      if (!showIdInput) {
        setShowIdInput(true)
        setShowNameInput(false)
        return
      }
      
      if (!userId.trim() || !userId.includes('-')) {
        alert('Please enter a valid User ID')
        return
      }

      const trimmedUserId = userId.trim()
      
      // Check if we already have a nickname stored for this user ID
      const existingNickname = localStorage.getItem(`nickname_${trimmedUserId}`)
      
      // If no nickname exists, use the first part of the user ID as a fallback
      // or create a default nickname
      if (!existingNickname) {
        // Extract the name part from the user ID (before the first hyphen)
        const namePart = trimmedUserId.split('-')[0]
        const defaultNickname = namePart || `User${Math.floor(Math.random() * 10000)}`
        localStorage.setItem(`nickname_${trimmedUserId}`, defaultNickname)
      }
      
      localStorage.setItem('isGuest', 'true')
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userId', trimmedUserId)
      
      // Set a flag to indicate this is the user's own journal
      localStorage.setItem('cameFromLogin', 'true')
      
      // Set this as the user's original ID
      localStorage.setItem('originalUserId', trimmedUserId)
      
      // Use window.location.replace for consistent behavior across platforms
      window.location.replace(`/#${trimmedUserId}`)
    }
  }

  const handleLogin = (name: string) => {
    const userId = generateUserId(name)
    localStorage.setItem('userId', userId)
    router.push('/')  // Don't add hash to URL
  }

  const toggleLoginMode = () => {
    setLoginMode(loginMode === 'new' ? 'existing' : 'new')
    setShowNameInput(false)
    setShowIdInput(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4
                   bg-gradient-app touch-manipulation">
      <div className="w-full max-w-sm 
                    bg-surface/95 backdrop-blur-lg
                    rounded-xl shadow-xl p-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3">
            <div className="animate-glow">
              <ShinyHeart 
                size={40} 
                className="text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              />
            </div>
          </div>
          <h1 className="text-2xl font-medium text-white mb-1">Thankly</h1>
          <p className="text-sm text-white/60">Your daily gratitude journal</p>
        </div>

        {/* Toggle between new and existing user */}
        <div className="flex mb-4 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setLoginMode('new')}
            className={`flex-1 py-2 text-sm rounded-md transition-all duration-300 ${
              loginMode === 'new' 
                ? 'bg-[#A7D8DE]/30 text-white' 
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            New Journal
          </button>
          <button
            onClick={() => setLoginMode('existing')}
            className={`flex-1 py-2 text-sm rounded-md transition-all duration-300 ${
              loginMode === 'existing' 
                ? 'bg-[#A7D8DE]/30 text-white' 
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Existing Journal
          </button>
        </div>

        {/* Name Input for new users */}
        {showNameInput && loginMode === 'new' && (
          <div className="mb-4">
            <input
              type="text"
              inputMode="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full py-2.5 px-4 rounded-lg
                       bg-white/5 backdrop-blur-md
                       text-white text-[16px]
                       border border-white/10
                       focus:outline-none focus:border-white/20
                       placeholder:text-white/40
                       touch-manipulation"
              autoFocus
              onKeyUp={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleGuestLogin()
                }
              }}
            />
          </div>
        )}

        {/* User ID Input for existing users */}
        {showIdInput && loginMode === 'existing' && (
          <div className="mb-4">
            <input
              type="text"
              inputMode="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              className="w-full py-2.5 px-4 rounded-lg
                       bg-white/5 backdrop-blur-md
                       text-white text-[16px]
                       border border-white/10
                       focus:outline-none focus:border-white/20
                       placeholder:text-white/40
                       touch-manipulation"
              autoFocus
              onKeyUp={(e) => {
                if (e.key === 'Enter' && userId.trim()) {
                  handleGuestLogin()
                }
              }}
            />
            <p className="text-xs text-white/40 mt-2">
              Enter the User ID you saved previously to access your journal.
            </p>
          </div>
        )}

        {/* Start Journal/Continue Button */}
        <button
          onClick={handleGuestLogin}
          className="w-full py-2.5 rounded-lg
                   bg-white/10 backdrop-blur-md
                   text-white text-sm font-medium
                   hover:bg-white/15 transition-all duration-300
                   border border-white/10
                   hover:scale-[1.02]
                   active:scale-[0.98]"
        >
          {showNameInput || showIdInput ? 'Continue' : loginMode === 'new' ? 'Start New Journal' : 'Access Journal'}
        </button>
      </div>
    </div>
  )
}

