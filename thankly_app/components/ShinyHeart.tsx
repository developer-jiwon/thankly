import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export function ShinyHeart({ size = 18, className = '' }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="absolute inset-0 bg-blue-300 dark:bg-pink-300 rounded-full blur-sm"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.3, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <Heart 
        size={size} 
        className="relative z-10 text-blue-500 dark:text-pink-500 fill-current animate-pulse" 
      />
    </motion.div>
  )
}

