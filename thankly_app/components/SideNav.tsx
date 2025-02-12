'use client'

import { motion } from 'framer-motion'
import { Calendar, Search, Users, ArrowLeftRight } from 'lucide-react'

export function SideNav({ onNavItemClick, onLogout }: { 
  onNavItemClick: (label: string) => void, 
  onLogout: () => void 
}) {
  const iconClass = `stroke-[1.5] text-white
                     filter drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]
                     group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]
                     group-hover:stroke-[2]
                     animate-glow
                     transition-all duration-300`

  return (
    <motion.div 
      className="fixed left-0 top-0 h-full w-[40px]
                 bg-black/95 dark:bg-black
                 shadow-[0_0_20px_rgba(0,0,0,0.8)]
                 backdrop-blur-sm"
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col items-center pt-4 gap-5">
        <motion.button
          onClick={() => onNavItemClick('Home')}
          className="p-1 text-white group"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Calendar size={14} className={iconClass} />
        </motion.button>

        <motion.button
          onClick={() => onNavItemClick('Search')}
          className="p-1 text-white group"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search size={14} className={iconClass} />
        </motion.button>

        <motion.button
          onClick={() => onNavItemClick('Users')}
          className="p-1 text-white group"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Users size={14} className={iconClass} />
        </motion.button>

        <button
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center
                   hover:bg-white/5 rounded-lg
                   transition-all duration-300
                   group"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 text-white/40 group-hover:text-white/60
                     transition-colors duration-300"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

