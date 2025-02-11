'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface MinimalDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  message: string
}

export function MinimalDialog({ isOpen, onClose, onConfirm, message }: MinimalDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     bg-white dark:bg-black
                     text-black dark:text-white
                     px-6 py-4 text-sm font-light
                     rounded-lg z-50"
          >
            <p className="mb-4">{message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-3 py-1 text-xs bg-black dark:bg-white 
                         text-white dark:text-black rounded-full"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 