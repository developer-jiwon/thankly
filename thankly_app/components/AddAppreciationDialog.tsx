'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { motion } from 'framer-motion'
import { ShinyHeart } from './ShinyHeart'
import { useState } from 'react'

interface AddAppreciationDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (text: string) => void
}

export function AddAppreciationDialog({ isOpen, onClose, onAdd }: AddAppreciationDialogProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onAdd(text)
      setText('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <ShinyHeart 
              size={16} 
              className="absolute left-3 top-3 text-primary/40" 
            />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add new appreciation..."
              className="w-full pl-10 p-2 text-sm bg-transparent border-b
                        focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs hover:bg-primary/5 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-primary text-white rounded-full"
              disabled={!text.trim()}
            >
              Add
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 