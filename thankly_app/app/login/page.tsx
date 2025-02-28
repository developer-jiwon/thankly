'use client'

import { LoginForm } from '@/components/LoginForm'
import { ShinyHeart } from '@/components/ShinyHeart'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)

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
    if (!showNameInput) {
      setShowNameInput(true)
      return
    }
    
    if (!name.trim()) return

    const userId = generateUserId(name.trim())
    
    localStorage.setItem('isGuest', 'true')
    localStorage.setItem('userName', name.trim())
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userId', userId)
    
    // Use window.location.replace for consistent behavior across platforms
    window.location.replace(`/#${userId}`)
  }

  const handleLogin = (name: string) => {
    const userId = generateUserId(name)
    localStorage.setItem('userId', userId)
    router.push('/')  // Don't add hash to URL
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

        {/* Name Input */}
        {showNameInput && (
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
          {showNameInput ? 'Continue' : 'Start Journal'}
        </button>
      </div>
    </div>
  )
}

