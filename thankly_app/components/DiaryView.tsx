import { motion } from 'framer-motion'
import { formatDate } from '../utils/dateUtils'
import { ShinyHeart } from './ShinyHeart'
import { Trash2 } from 'lucide-react'

interface Appreciation {
  id: number
  text: string
  date: string
}

interface DiaryViewProps {
  selectedDate: Date | null
  appreciations: Appreciation[]
  deleteAppreciation?: (id: number) => void
}

export function DiaryView({ selectedDate, appreciations, deleteAppreciation }: DiaryViewProps) {
  if (!selectedDate) {
    return (
      <motion.div 
        className="mt-8 bg-white dark:bg-[#2a2a2a] p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <p className="text-gray-500 dark:text-gray-400 italic text-center">Please select a date.</p>
      </motion.div>
    )
  }

  const formattedDate = formatDate(selectedDate)
  const dayAppreciations = appreciations.filter(a => a.date === formattedDate)

  return (
    <motion.div 
      className="mt-8 bg-white dark:bg-[#2a2a2a] p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h3 className="text-2xl font-light mb-4 border-b pb-2 dark:border-gray-700">
        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </h3>
      {dayAppreciations.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">No appreciations recorded for this day.</p>
      ) : (
        <ul className="space-y-4">
          {dayAppreciations.map((appreciation, index) => (
            <motion.li 
              key={appreciation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start border-b pb-2 last:border-b-0 dark:border-gray-700 group"
            >
              <ShinyHeart size={18} className="mr-2 mt-1 flex-shrink-0" />
              <p className="text-lg font-light leading-relaxed flex-grow">{appreciation.text}</p>
              {deleteAppreciation && (
                <motion.button
                  onClick={() => deleteAppreciation(appreciation.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-gray-400 hover:text-red-500"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={18} />
                </motion.button>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

