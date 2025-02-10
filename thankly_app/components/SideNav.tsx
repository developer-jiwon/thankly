'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Search, Users, Bookmark, ChevronRight, ChevronLeft, Settings, LogOut } from 'lucide-react'

const navItems = [
  { icon: Calendar, label: 'Home' },
  { icon: Search, label: 'Search' },
  { icon: Users, label: 'Feed' },
  { icon: Bookmark, label: 'Saved' },
  { icon: Settings, label: 'Settings' },
  { icon: LogOut, label: 'Logout' },
]

export function SideNav({ onNavItemClick, onLogout }: { onNavItemClick: (label: string) => void, onLogout: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.nav
      className="fixed left-0 top-0 h-full bg-white dark:bg-[#1e1e1e] shadow-lg z-10"
      initial={{ width: '40px' }}
      animate={{ width: isExpanded ? '160px' : '40px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {navItems.map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333]"
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (item.label === 'Logout') {
                  onLogout()
                } else {
                  onNavItemClick(item.label)
                  if (window.innerWidth < 640) {
                    setIsExpanded(false)
                  }
                }
              }}
            >
              <item.icon size={20} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    className="ml-2 text-sm font-medium whitespace-nowrap"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333]"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.nav>
  )
}

