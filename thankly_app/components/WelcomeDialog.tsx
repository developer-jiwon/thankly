'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

interface WelcomeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  name: string
  setName: (name: string) => void
  onSubmit: () => string | undefined
}

export function WelcomeDialog({ isOpen, onOpenChange, name, setName, onSubmit }: WelcomeDialogProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  
  const handleSubmit = async () => {
    setShowConfirmation(true)
    const url = onSubmit()
    if (url) {
      setGeneratedUrl(url)
    }
  }

  const handleStartJournal = () => {
    // First copy the URL
    navigator.clipboard.writeText(generatedUrl)
    
    // Wait a brief moment to ensure copying is done
    setTimeout(() => {
      // Then redirect
      window.location.href = generatedUrl
    }, 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white backdrop-blur-sm 
                              border border-[#8B2252]/20 shadow-2xl rounded-2xl">
        <AnimatePresence mode="wait">
          {!showConfirmation ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="text-[#8B2252] text-center text-3xl font-bold tracking-wide">
                  Welcome to Thankly!
                </DialogTitle>
                <DialogDescription className="text-[#8B2252]/80 text-center text-lg mt-2">
                  Enter a name for your gratitude journal
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-4 text-lg border-b-2 
                              border-[#8B2252]/20
                              focus:outline-none focus:border-[#8B2252]/40
                              bg-white
                              text-[#8B2252]
                              placeholder-[#8B2252]/50
                              rounded-lg"
                    style={{ fontSize: '16px' }}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter' && name.trim()) {
                        handleSubmit()
                      }
                    }}
                    enterKeyHint="done"
                    autoFocus
                  />
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!name.trim()}
                  className="w-full bg-[#8B2252]/80 hover:bg-[#8B2252] text-white 
                           transition-all duration-300
                           border border-[#8B2252]/20
                           text-lg py-6 rounded-xl
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Journal
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <DialogHeader>
                <DialogTitle className="text-[#8B2252] text-center text-2xl font-bold">
                  Welcome, {name}!
                </DialogTitle>
                <DialogDescription className="text-[#8B2252]/80 text-center text-base mt-4">
                  Your own journey is generated & copied
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <Button
                  onClick={handleStartJournal}
                  className="w-full bg-[#8B2252]/80 hover:bg-[#8B2252] text-white 
                           transition-all duration-300
                           border border-[#8B2252]/20
                           text-lg py-5 rounded-xl"
                >
                  Start
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
} 