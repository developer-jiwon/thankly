'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [mounted, setMounted] = useState(false)
  const [selectedNavItem, setSelectedNavItem] = useState('Home')
  const [userType, setUserType] = useState<'guest' | 'registered' | 'unauthenticated'>('unauthenticated')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const [newAppreciation, setNewAppreciation] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    setMounted(true)
    
    const hashUserId = window.location.hash.slice(1)
    const storedUserId = getUserId()

    // If has hash URL, prioritize it
    if (hashUserId && hashUserId.includes('-')) {
      localStorage.setItem('userId', hashUserId)
      localStorage.setItem('isAuthenticated', 'true')
      
      const storedAppreciations = localStorage.getItem(`appreciations_${hashUserId}`)
      if (storedAppreciations) {
        setAppreciations(JSON.parse(storedAppreciations))
      }
    } 
    // If no hash but has stored userId
    else if (storedUserId) {
      const storedAppreciations = localStorage.getItem(`appreciations_${storedUserId}`)
      if (storedAppreciations) {
        setAppreciations(JSON.parse(storedAppreciations))
      }
    }
    // No valid userId anywhere, then redirect to login
    else {
      router.push('/login')
    }
    
    setUserType(getUserType())
  }, [])

  useEffect(() => {
    const userId = getUserId()
    if (userId && appreciations.length > 0) {
      localStorage.setItem(`appreciations_${userId}`, JSON.stringify(appreciations))
    }
  }, [appreciations])

  const deleteAppreciation = (id: number) => {
    setAppreciations(appreciations.filter(a => a.id !== id))
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

  const handleEdit = (appreciation: Appreciation) => {
    setEditingId(appreciation.id)
    setEditText(appreciation.text)
  }

  const handleSaveEdit = (id: number) => {
    if (editText.trim()) {
      setAppreciations(appreciations.map(a => 
        a.id === id ? { ...a, text: editText.trim() } : a
      ))
      setEditingId(null)
      setEditText('')
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
          <div className="flex flex-col lg:flex-row w-full max-w-5xl 
                        bg-surface/95 backdrop-blur-lg
                        rounded-xl shadow-xl
                        h-full lg:h-auto lg:min-h-[600px]">
            
            {/* Calendar Section */}
            <div className="w-full 
                          lg:w-[500px] p-10
                          lg:border-r border-white/10
                          bg-transparent
                          flex-shrink-0 flex flex-col justify-center relative
                          lg:h-auto">
              <div className="max-w-sm mx-auto relative">
                <div className="flex items-center justify-between mb-10 px-2">
                  <h2 className="text-xl font-medium text-white">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-6">
                    <button onClick={() => changeMonth(-1)}
                              className="hover:bg-white/5 p-2 rounded-full transition-all duration-200"
                    >
                      <ChevronLeft size={24} className="text-white" />
                    </button>
                    <button onClick={() => changeMonth(1)}
                              className="hover:bg-white/5 p-2 rounded-full transition-all duration-200"
                    >
                      <ChevronRight size={24} className="text-white" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 
                              gap-2 lg:gap-3
                              text-base mb-auto">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-xs font-medium tracking-wider uppercase text-white/50">
                      {day.slice(0,1)}
                    </div>
                  ))}
                  
                  {daysInMonth.map((date, index) => (
                    <motion.div 
                      key={date.toString()}
                      className={`w-10 h-10 
                                flex items-center justify-center 
                                rounded-full
                                relative
                                ${isPastDate(date) ? 'opacity-40' : 'cursor-pointer'} 
                                ${selectedDate && formatDate(selectedDate) === formatDate(date) 
                                  ? 'bg-[#A7D8DE]/70 shadow-[0_0_20px_rgba(167,216,222,0.4)]' 
                                  : 'hover:bg-[#A7D8DE]/60 active:bg-[#A7D8DE]/70'}`}
                      onClick={() => !isPastDate(date) && handleDateClick(date)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-base font-medium text-white group-hover:text-white">
                        {date.getDate()}
                      </span>
                      
                      {(() => {
                        const count = appreciations.filter(a => a.date === formatDate(date)).length;
                        if (count > 0) {
                          return (
                            <div className={`absolute -top-1.5 ${count < 10 ? 'right-0.5' : '-right-0.5'}`}>
                              <span className="text-[10px] font-medium text-white/80">
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
                    {/* Simplified Input Form */}
                    <motion.form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newAppreciation.trim()) {
                          handleAddAppreciation(newAppreciation);
                          setNewAppreciation('');
                        }
                      }}
                      className="mb-6"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={newAppreciation}
                          onChange={(e) => setNewAppreciation(e.target.value)}
                          placeholder="What are you grateful for today?"
                          className="w-full pl-6 p-3 text-base
                                   bg-surface/40 backdrop-blur-md text-white
                                   rounded-lg border border-white/10
                                   focus:outline-none focus:border-white/20 
                                   placeholder-white/40 placeholder:text-sm"
                          autoFocus
                        />
                      </div>
                    </motion.form>

                    <div className="space-y-3">
                      {appreciations
                        .filter(a => a.date === formatDate(selectedDate))
                        .map((appreciation, index) => (
                          <motion.div
                            key={appreciation.id}
                            className="p-4 rounded-xl
                                     bg-white/5 backdrop-blur-md
                                     border border-white/10
                                     hover:bg-white/10 transition-all duration-300
                                     group relative"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            onDoubleClick={() => handleEdit(appreciation)}
                          >
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 
                                          bg-white/40 rounded-full opacity-0 group-hover:opacity-100
                                          transition-opacity duration-300" />
                            {editingId === appreciation.id ? (
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveEdit(appreciation.id);
                              }}>
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full bg-transparent text-sm text-white 
                                           focus:outline-none border-b border-white/20"
                                  autoFocus
                                  onBlur={() => handleSaveEdit(appreciation.id)}
                                />
                              </form>
                            ) : (
                              <p className="text-sm flex-1 text-white/90 leading-relaxed
                                          group-hover:text-white transition-colors duration-300">
                                {appreciation.text}
                              </p>
                            )}
                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAppreciation(appreciation.id);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2
                                       opacity-0 group-hover:opacity-100
                                       transition-opacity duration-300
                                       hover:scale-110 active:scale-95"
                            >
                              <div className="w-5 h-5 flex items-center justify-center
                                           group/icon transition-all duration-300
                                           hover:shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                <svg 
                                  viewBox="0 0 24 24" 
                                  className="w-4 h-4 text-white/40 group-hover/icon:text-white/60
                                           transition-colors duration-300"
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                >
                                  <path 
                                    d="M4 6h16l-1.58 14.22A2 2 0 0116.432 22H7.568a2 2 0 01-1.988-1.78L4 6z" 
                                    className="group-hover/icon:stroke-white/80"
                                  />
                                  <path 
                                    d="M7.345 3.147A2 2 0 019.154 2h5.692a2 2 0 011.81 1.147L18 6H6l1.345-2.853z" 
                                    className="group-hover/icon:stroke-white/80"
                                  />
                                  <path 
                                    d="M9 11v6M15 11v6" 
                                    className="group-hover/icon:stroke-white/80"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>
                            </button>
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
    </div>
  )
}

export default function AppreciationCalendar() {
  return implementUserTypeChanges()
}

