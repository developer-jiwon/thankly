'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatDate } from '../utils/dateUtils'
import { ShinyHeart } from './ShinyHeart'

interface SearchAppreciationsProps {
  appreciations: Array<{ id: number; text: string; date: string }>
  onSelect: (selectedIds: number[]) => void
  onClose: () => void
}

export function SearchAppreciations({ appreciations, onSelect, onClose }: SearchAppreciationsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: number; text: string; date: string }>>([])

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase()
    const filtered = appreciations.filter(
      appreciation => 
        appreciation.text.toLowerCase().includes(lowercasedTerm) ||
        appreciation.date.includes(lowercasedTerm)
    )
    setSearchResults(filtered)
  }, [searchTerm, appreciations])

  return (
    <motion.div 
      className="bg-white dark:bg-[#2a2a2a] p-4 rounded-lg shadow-lg max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <Search className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
        <Input
          type="text"
          placeholder="Search appreciations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
          autoFocus
        />
        {searchTerm && (
          <X
            className="w-5 h-5 ml-2 text-gray-500 dark:text-gray-400 cursor-pointer"
            onClick={() => setSearchTerm('')}
          />
        )}
      </div>
      <div className="max-h-96 overflow-y-auto mb-4">
        <AnimatePresence>
          {searchResults.map(appreciation => (
            <motion.div 
              key={appreciation.id} 
              className="flex items-start mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <ShinyHeart size={16} className="mr-2 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">{formatDate(new Date(appreciation.date))}</p>
                <p className="text-sm">{appreciation.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {searchResults.length === 0 && searchTerm && (
          <motion.p 
            className="text-center text-gray-500 dark:text-gray-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No results found for "{searchTerm}"
          </motion.p>
        )}
      </div>
      <Button onClick={onClose} className="w-full">
        Close Search
      </Button>
    </motion.div>
  )
}

