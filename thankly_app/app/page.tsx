'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getDaysInMonth, formatDate } from '../utils/dateUtils'
import { getUserType, getFeatureLimits } from '../utils/userUtils'
import { SideNav } from '../components/SideNav'
import { Settings } from '../components/Settings'
import { SearchAppreciations } from '../components/SearchAppreciations'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getUserId } from '../utils/userIdentifier'
import { Toast } from '@/components/Toast'

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedNavItem, setSelectedNavItem] = useState('Home')
  const [userType, setUserType] = useState<'guest' | 'registered' | 'unauthenticated'>('unauthenticated')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const [showDeleteToast, setShowDeleteToast] = useState(false)
  const [newAppreciation, setNewAppreciation] = useState('')

  useEffect(() => {
    setMounted(true)
    
    // First try to get userId from URL hash
    const hashUserId = window.location.hash.slice(1)
    // If no hash in URL, use stored userId
    const storedUserId = getUserId()
    const userId = hashUserId || storedUserId

    if (userId) {
      // If we have a userId from either source, load the data
      const storedAppreciations = localStorage.getItem(`appreciations_${userId}`)
      if (storedAppreciations) {
        setAppreciations(JSON.parse(storedAppreciations))
      }

      // Update URL if needed
      if (!hashUserId) {
        window.location.hash = userId
      }

      // Ensure userId is stored in localStorage
      if (!storedUserId) {
        localStorage.setItem('userId', userId)
      }
    }
    
    setUserType(getUserType())
  }, [])

  useEffect(() => {
    const userId = window.location.hash.slice(1) || getUserId()
    if (userId && appreciations.length > 0) {
      localStorage.setItem(`appreciations_${userId}`, JSON.stringify(appreciations))
    }
  }, [appreciations])

  const deleteAppreciation = (id: number) => {
    setAppreciations(appreciations.filter(a => a.id !== id))
    setShowDeleteToast(true)
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
    console.log('Selected appreciation IDs:', selectedIds)
    setIsSearchOpen(false)
  }

  const getShareableLink = () => {
    const userId = getUserId()
    return `${window.location.origin}${window.location.pathname}#${userId}`
  }

  const handleShare = async () => {
    const shareableLink = getShareableLink()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Thankly Journal',
          text: 'Check out my gratitude journal!',
          url: shareableLink
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(shareableLink)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleAddAppreciation = (text: string) => {
    const userId = getUserId()
    if (!userId) {
      toast.error('Session expired. Please login again.')
      router.push('/login')
      return
    }

    if (text.trim() && selectedDate) {
      const limits = getFeatureLimits(userType)
      const todayAppreciations = appreciations.filter(a => a.date === formatDate(new Date())).length

      if (todayAppreciations >= limits.maxAppreciationsPerDay) {
        toast.error(`You've reached the limit of ${limits.maxAppreciationsPerDay} appreciations per day.`)
        return
      }

      const newEntry: Appreciation = {
        id: Date.now(),
        text: text.trim(),
        date: formatDate(selectedDate)
      }
      setAppreciations([newEntry, ...appreciations])
    }
  }

  if (!mounted) return null
  if (userType === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="h-screen flex">
      <SideNav onNavItemClick={setSelectedNavItem} onLogout={handleLogout} />
      
      <div className="flex-1 pl-[40px]">
        <div className="h-screen flex flex-col lg:flex items-start lg:items-center lg:justify-center p-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white/50 
                        dark:bg-black/50 backdrop-blur-sm rounded-xl shadow-xl
                        h-full lg:h-auto lg:min-h-[600px]">
            
            {/* Calendar Section */}
            <div className="w-full lg:w-[320px] p-6 lg:border-r border-primary-light/10
                          bg-white/50 dark:bg-black/50 backdrop-blur-sm
                          flex-shrink-0 flex flex-col justify-center
                          lg:h-auto">
              <div className="max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)}>
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => changeMonth(1)}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs mb-auto">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-[10px] text-primary/60">
                      {day.slice(0,1)}
                    </div>
                  ))}
                  
                  {daysInMonth.map((date, index) => (
                    <motion.div 
                      key={date.toString()}
                      className={`aspect-square p-1 rounded-sm flex flex-col items-center
                                 ${isPastDate(date) ? 'opacity-40' : 'cursor-pointer'} 
                                 ${selectedDate && formatDate(selectedDate) === formatDate(date) 
                                   ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                      onClick={() => !isPastDate(date) && handleDateClick(date)}
                    >
                      <span className="text-xs">{date.getDate()}</span>
                      {(() => {
                        const count = appreciations.filter(a => a.date === formatDate(date)).length;
                        if (count > 0) {
                          return (
                            <div className="mt-0.5">
                              <span className="text-[10px] font-medium text-primary">
                                {count}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lists Section */}
            <div className="flex-1 overflow-y-auto h-[calc(100vh-400px)] lg:h-[600px]">
              <div className="max-w-md mx-auto p-6">
                {selectedDate && (
                  <>
                    <h2 className="text-sm font-medium mb-4">
                      {selectedDate.toLocaleDateString('en-US', { 
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h2>
                    
                    {/* New Inline Input Form */}
                    <motion.form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newAppreciation.trim()) {
                          handleAddAppreciation(newAppreciation);
                          setNewAppreciation('');
                        }
                      }}
                      className="mb-4"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-primary/40">
                          +
                        </span>
                        <input
                          type="text"
                          value={newAppreciation}
                          onChange={(e) => setNewAppreciation(e.target.value)}
                          placeholder="Add new appreciation..."
                          className="w-full pl-10 p-2 text-sm bg-white/50 dark:bg-black/50
                                    backdrop-blur-sm rounded-lg border border-primary/10
                                    focus:outline-none focus:border-primary/20"
                          autoFocus
                        />
                      </div>
                    </motion.form>

                    <div className="space-y-2">
                      {appreciations
                        .filter(a => a.date === formatDate(selectedDate))
                        .map(appreciation => (
                          <motion.div 
                            key={appreciation.id}
                            className="p-3 rounded-lg bg-white/50 dark:bg-black/50
                                     backdrop-blur-sm flex items-center gap-2"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <span className="text-primary/60">•</span>
                            <span className="text-sm flex-1">{appreciation.text}</span>
                          </motion.div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="bottom-right"
        className="text-sm sm:text-base"
      />
      <Toast 
        message="Appreciation deleted"
        isVisible={showDeleteToast}
        onClose={() => setShowDeleteToast(false)}
      />
    </div>
  )
}

export default function AppreciationCalendar() {
  return implementUserTypeChanges()
}

