'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { setUserId } from '@/utils/userIdentifier'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function GuestButton() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState('')

  const handleGuestStart = () => {
    setIsDialogOpen(true)
  }

  const handleNameSubmit = async () => {
    if (name.trim()) {
      const userId = setUserId(name.trim())
      
      // First set the localStorage items
      localStorage.setItem('isGuest', 'true')
      localStorage.setItem('isAuthenticated', 'true')
      
      // Then set cookies
      document.cookie = 'isGuest=true; path=/'
      document.cookie = 'isAuthenticated=true; path=/'
      
      // Close dialog
      setIsDialogOpen(false)
      
      // Use window.location instead of router for full page refresh with hash
      window.location.href = `/${userId ? `#${userId}` : ''}`
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleGuestStart} 
        className="w-full mt-4"
      >
        Start as Guest
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome to Thankly!</DialogTitle>
            <DialogDescription>
              Enter a name for your gratitude journal
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-2 text-base border-b-2 border-gray-300 dark:border-[#444] focus:outline-none focus:border-gray-500 dark:focus:border-[#666] bg-transparent"
                style={{ fontSize: '16px' }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    handleNameSubmit()
                  }
                }}
                enterKeyHint="done"
              />
            </div>
            <Button onClick={handleNameSubmit} disabled={!name.trim()}>
              Start Journal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

