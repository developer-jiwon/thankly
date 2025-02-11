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
        {/* Base heart with solid fill for better visibility */}
        <Heart
          size={size}
          className="absolute inset-0 fill-white/5 stroke-white"
          strokeWidth={2}
        />

        {/* Glowing overlay */}
        <motion.div
          className="absolute inset-0 filter blur-[2px]"
          initial={{ opacity: 0.5 }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart
            size={size}
            className="fill-white/20 stroke-white"
            strokeWidth={2}
          />
        </motion.div>

        {/* Main visible heart */}
        <Heart
          size={size}
          className={`relative z-10 fill-transparent stroke-white ${className}`}
          strokeWidth={2.5}
        />
      </motion.div>
    </div>
  )
}

