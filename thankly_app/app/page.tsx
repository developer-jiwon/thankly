'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { getDaysInMonth, formatDate } from '../utils/dateUtils'
import { getUserType, getFeatureLimits } from '../utils/userUtils'
import { SideNav } from '../components/SideNav'
import { DiaryView } from '../components/DiaryView'
import { DiaryDialog } from '../components/DiaryDialog'
import { ShinyHeart } from '../components/ShinyHeart'
import { Settings } from '../components/Settings'
import { SearchAppreciations } from '../components/SearchAppreciations'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

interface Appreciation {
  id: number
  text: string
  date: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function implementUserTypeChanges() {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([])
  const [newAppreciation, setNewAppreciation] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedNavItem, setSelectedNavItem] = useState('Home')
  const [userType, setUserType] = useState<'guest' | 'registered' | 'unauthenticated'>('unauthenticated')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const storedAppreciations = localStorage.getItem('appreciations')
    if (storedAppreciations) {
      setAppreciations(JSON.parse(storedAppreciations))
    }
    setUserType(getUserType())
  }, [])

  useEffect(() => {
    localStorage.setItem('appreciations', JSON.stringify(appreciations))
  }, [appreciations])

  const addAppreciation = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAppreciation.trim() && selectedDate) {
      const limits = getFeatureLimits(userType)
      const todayAppreciations = appreciations.filter(a => a.date === formatDate(new Date())).length

      if (todayAppreciations >= limits.maxAppreciationsPerDay) {
        toast.error(`You've reached the limit of ${limits.maxAppreciationsPerDay} appreciations per day.`)
        return
      }

      const newEntry: Appreciation = {
        id: Date.now(),
        text: newAppreciation.trim(),
        date: formatDate(selectedDate)
      }
      setAppreciations([newEntry, ...appreciations])
      setNewAppreciation('')
      toast.success('Appreciation added successfully!')
    }
  }

  const deleteAppreciation = (id: number) => {
    setAppreciations(appreciations.filter(a => a.id !== id))
    toast.success('Appreciation deleted successfully!')
  }

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())

  const changeMonth = (increment: number) => {
    setCurrentMonth(prevDate => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + increment, 1);
      return newDate;
    });
  }

  const handleDateClick = (date: Date) => {
    if (!isPastDate(date)) {
      setSelectedDate(date);
    }
  };

  const handleDateDoubleClick = (date: Date) => {
    if (!isPastDate(date)) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('isGuest')
    setUserType('unauthenticated')
    router.push('/login')
  }

  const handleExportData = () => {
    const limits = getFeatureLimits(userType)
    if (!limits.canExport) {
      toast.error('Export feature is only available for registered users.')
      return
    }

    const dataStr = JSON.stringify(appreciations)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'appreciations.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast.success('Data exported successfully!')
  }

  const handleSearchSelect = (selectedIds: number[]) => {
    // Here you can implement what happens when appreciations are selected from the search
    // For now, let's just log the selected IDs and close the search
    console.log('Selected appreciation IDs:', selectedIds)
    setIsSearchOpen(false)
    // You could also highlight these appreciations in the calendar view, for example
  }

  if (!mounted) return null
  if (userType === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-[#1e1e1e] text-black dark:text-white transition-colors duration-500">
      <SideNav onNavItemClick={setSelectedNavItem} onLogout={handleLogout} />
      <div className="pl-[40px] sm:pl-[40px] h-full overflow-y-auto -webkit-overflow-scrolling-touch">
        {selectedNavItem === 'Home' ? (
          <div className="max-w-6xl mx-auto p-2 sm:p-4 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <motion.h1 
                className="text-xl sm:text-2xl md:text-3xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                Thankly
              </motion.h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full bg-gray-200 dark:bg-[#444] transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-[#555]"
                  title="Search Appreciations"
                >
                  <Search size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={handleExportData}
                  className="p-2 rounded-full bg-gray-200 dark:bg-[#444] transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-[#555]"
                  title="Export Data"
                >
                  <Download size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-200 dark:bg-[#444] transition-colors duration-200"
                >
                  {theme === 'dark' ? (
                    <Sun size={20} className="text-yellow-500" />
                  ) : (
                    <Moon size={20} className="text-blue-500" />
                  )}
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {isSearchOpen ? (
                <SearchAppreciations 
                  appreciations={appreciations}
                  onSelect={handleSearchSelect}
                  onClose={() => setIsSearchOpen(false)}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex justify-between items-center mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.button 
                      onClick={() => changeMonth(-1)} 
                      className="p-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft size={16} />
                    </motion.button>
                    <h2 className="text-sm sm:text-base md:text-lg font-light">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <motion.button 
                      onClick={() => changeMonth(1)} 
                      className="p-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight size={16} />
                    </motion.button>
                  </motion.div>

                  <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm md:text-base">
                    {WEEKDAYS.map(day => (
                      <div key={day} className="text-center font-light p-1">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                      </div>
                    ))}
                    {daysInMonth.map((date, index) => (
                      <motion.div 
                        key={date.toString()}
                        className={`p-1 border border-gray-200 dark:border-[#444] rounded-lg min-h-[60px] sm:min-h-[80px] ${
                          isPastDate(date) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          selectedDate && formatDate(selectedDate) === formatDate(date) ? 'bg-gray-100 dark:bg-[#333]' : ''
                        }`}
                        onClick={() => !isPastDate(date) && handleDateClick(date)}
                        onDoubleClick={() => !isPastDate(date) && handleDateDoubleClick(date)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.01 }}
                        whileHover={!isPastDate(date) ? { scale: 1.05 } : {}}
                        whileTap={!isPastDate(date) ? { scale: 0.95 } : {}}
                      >
                        <div className="text-xs sm:text-sm font-medium">
                          {date.getDate()}
                        </div>
                        <div className="h-[40px] sm:h-[60px] overflow-y-auto simple-scroll">
                          {appreciations
                            .filter(a => a.date === formatDate(date))
                            .map(appreciation => (
                              <motion.div 
                                key={appreciation.id} 
                                className="flex items-center text-[10px] sm:text-xs mb-1 font-light"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ShinyHeart size={8} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{appreciation.text}</span>
                              </motion.div>
                            ))
                          }
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.form 
                    onSubmit={addAppreciation} 
                    className="sticky bottom-0 bg-white dark:bg-[#1e1e1e] py-2 sm:py-4 px-2 sm:px-0"
                  >
                    <input
                      type="text"
                      value={newAppreciation}
                      onChange={(e) => setNewAppreciation(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAppreciation(e);
                        }
                      }}
                      enterKeyHint="done"
                      onKeyUp={(e) => {
                        if (e.key === 'Enter' || e.keyCode === 13) {
                          addAppreciation(e);
                        }
                      }}
                      placeholder={selectedDate ? `Thankful for on ${formatDate(selectedDate)}?` : 'Select a date'}
                      className="w-full p-2 text-base border-b-2 border-gray-300 dark:border-[#444] focus:outline-none focus:border-gray-500 dark:focus:border-[#666] bg-transparent"
                      style={{ fontSize: '16px' }}
                      disabled={!selectedDate}
                    />
                  </motion.form>

                  <DiaryDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    selectedDate={selectedDate}
                    appreciations={appreciations}
                    deleteAppreciation={deleteAppreciation}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : selectedNavItem === 'Settings' ? (
          <Settings userType={userType} />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <h2 className="text-lg sm:text-xl font-light">No feature implemented yet</h2>
          </div>
        )}
      </div>
      <ToastContainer 
        position="bottom-right"
        className="text-sm sm:text-base"
      />
    </div>
  )
}

export default function AppreciationCalendar() {
  return implementUserTypeChanges()
}

