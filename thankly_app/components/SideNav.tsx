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

        <motion.button
          onClick={() => onNavItemClick('Logout')}
          className="p-1 text-white group"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftRight size={14} className={iconClass} />
        </motion.button>
      </div>
    </motion.div>
  )
}

