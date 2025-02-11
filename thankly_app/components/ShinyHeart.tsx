'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface ShinyHeartProps {
  size?: number
  className?: string
}

export function ShinyHeart({ size = 24, className = '' }: ShinyHeartProps) {
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
        {/* Glass effect background */}
        <motion.div
          className="absolute inset-0 blur-xl"
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
            className="fill-[#8B2252]/10 stroke-[#8B2252]/20"
            strokeWidth={1}
          />
        </motion.div>

        {/* Main heart with glass effect */}
        <Heart
          size={size}
          className={`fill-transparent stroke-[#8B2252]/30 backdrop-blur-sm ${className}`}
          strokeWidth={1.5}
        />

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart
            size={size}
            className="fill-white/5 stroke-[#8B2252]/20"
            strokeWidth={1}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

