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
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   bg-white/20 backdrop-blur-sm
                   text-white
                   px-4 py-1.5 text-xs
                   rounded-full z-50"
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