'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export function GuestButton() {
  const router = useRouter()

  const handleGuestStart = async () => {
    try {
      // Set guest mode in localStorage
      localStorage.setItem('isGuest', 'true')
      
      // Set cookies for middleware
      document.cookie = 'isGuest=true; path=/'
      document.cookie = 'isAuthenticated=true; path=/'
      
      // Use router.push instead of window.location
      router.push('/')
    } catch (error) {
      console.error('Error starting guest session:', error)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleGuestStart} 
      className="w-full mt-4"
    >
      Start as Guest
    </Button>
  )
}

