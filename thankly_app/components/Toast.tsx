'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 
                     bg-black dark:bg-white
                     text-white dark:text-black
                     px-4 py-1.5 text-xs font-light
                     rounded-full"
          onAnimationComplete={() => {
            setTimeout(onClose, 1000)
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 