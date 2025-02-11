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
    <div className="min-h-screen bg-white/5 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white/5 rounded-2xl shadow-2xl 
                   backdrop-blur-sm border border-[#8B2252]/20 text-center"
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
          className="text-4xl font-bold mb-4 text-[#8B2252] tracking-wide"
        >
          Thankly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[#8B2252]/80 mb-8 text-lg"
        >
          Your daily gratitude journal
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            onClick={handleJournalStart}
            className="w-full bg-[#8B2252]/80 hover:bg-[#8B2252] text-white 
                     transition-all duration-300 backdrop-blur-sm
                     border border-[#8B2252]/20
                     text-lg py-6 rounded-xl"
          >
            Start Journal
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

