'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface ShinyHeartProps {
  size?: number
  className?: string
  color?: string
}

export function ShinyHeart({ size = 24, className = '', color = 'currentColor' }: ShinyHeartProps) {
  return (
    <div className="relative inline-block">
      <motion.div
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Enhanced glass effect background for better mobile visibility */}
        <motion.div
          className="absolute inset-0 blur-lg"
          initial={{ opacity: 0.4 }}
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart
            size={size}
            className="fill-white/20 stroke-white/40"
            strokeWidth={2}
          />
        </motion.div>

        {/* Main heart with enhanced contrast */}
        <Heart
          size={size}
          className={`fill-transparent stroke-white/80 backdrop-blur-sm ${className}`}
          strokeWidth={2}
        />

        {/* Enhanced shine effect */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart
            size={size}
            className="fill-white/10 stroke-white/40"
            strokeWidth={1.5}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

