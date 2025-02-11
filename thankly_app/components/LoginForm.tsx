"use client"

import { motion } from 'framer-motion'
import { ShinyHeart } from './ShinyHeart'
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { setUserId } from '@/utils/userIdentifier'
import { WelcomeDialog } from './WelcomeDialog'

export function LoginForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState('')

  const handleJournalStart = () => {
    setIsDialogOpen(true)
  }

  const handleNameSubmit = (): string | undefined => {
    if (name.trim()) {
      const userId = setUserId(name.trim())
      
      // Set authentication state
      localStorage.setItem('isGuest', 'true')
      localStorage.setItem('isAuthenticated', 'true')
      document.cookie = 'isGuest=true; path=/'
      document.cookie = 'isAuthenticated=true; path=/'
      
      // Return the URL that will be used
      return `${window.location.origin}/${userId ? `#${userId}` : ''}`
    }
    return undefined
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B4D8E7] to-[#8B2252]/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white/80 rounded-3xl shadow-2xl 
                   backdrop-blur-sm border border-[#B4D8E7] text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <ShinyHeart size={80} className="mx-auto text-[#8B2252]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-light mb-4 text-[#8B2252] tracking-wide"
        >
          Thankly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[#8B2252]/80 mb-12 text-lg font-light"
        >
          Your daily gratitude journal
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-6"
        >
          <Button 
            onClick={handleJournalStart}
            className="w-full bg-[#8B2252] hover:bg-[#8B2252]/90 text-white 
                     transition-all duration-300 
                     text-lg py-6 rounded-xl
                     shadow-lg shadow-[#8B2252]/20"
          >
            Start Journal
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#B4D8E7]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-4 text-[#8B2252]/60">or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-[#B4D8E7] text-[#8B2252] hover:bg-[#B4D8E7]/10
                     transition-all duration-300 py-6 rounded-xl"
          >
            Google
          </Button>
        </motion.div>
      </motion.div>

      <WelcomeDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        name={name}
        setName={setName}
        onSubmit={handleNameSubmit}
      />
    </div>
  )
}

