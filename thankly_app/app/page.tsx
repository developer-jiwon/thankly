'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search, Key, Info } from 'lucide-react'
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
import { UserSearch } from '../components/UserSearch'

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

// Function to mask user ID for display (showing only asterisks)
const maskUserIdForDisplay = (userId: string): string => {
  if (!userId) return '';
  
  // Return a fixed number of asterisks regardless of the actual ID length
  return '********************';
};

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
  const [copied, setCopied] = useState(false)
  const [maskedUserId, setMaskedUserId] = useState('')
  const [nickname, setNickname] = useState('')
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [newNickname, setNewNickname] = useState('')
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false)
  const [isUserIdModalOpen, setIsUserIdModalOpen] = useState(false)
  const [actualUserId, setActualUserId] = useState('')
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false)
  const [originalUserId, setOriginalUserId] = useState('')

  useEffect(() => {
    setMounted(true)
    
    const hashUserId = window.location.hash.slice(1)
    
    // Only allow access with valid hash
    if (hashUserId && hashUserId.includes('-')) {
      localStorage.setItem('userId', hashUserId)
      localStorage.setItem('isAuthenticated', 'true')
      
      // Store the actual user ID for the modal
      setActualUserId(hashUserId)
      
      // Check if we're viewing our own journal or someone else's
      const storedOriginalUserId = localStorage.getItem('originalUserId')
      
      // If we came from the login page with an existing user ID,
      // we should consider this our own journal, not someone else's
      const cameFromLogin = localStorage.getItem('cameFromLogin') === 'true'
      
      if (cameFromLogin) {
        // We just logged in with an existing ID, so this is our journal
        setIsReadOnlyMode(false)
        localStorage.setItem('originalUserId', hashUserId)
        setOriginalUserId(hashUserId)
        // Reset the flag
        localStorage.removeItem('cameFromLogin')
      } else if (storedOriginalUserId && storedOriginalUserId !== hashUserId) {
        // We're viewing someone else's journal
        setIsReadOnlyMode(true)
        setOriginalUserId(storedOriginalUserId)
      } else {
        // We're viewing our own journal
        setIsReadOnlyMode(false)
        // Store our original user ID if not already stored
        if (!storedOriginalUserId) {
          localStorage.setItem('originalUserId', hashUserId)
          setOriginalUserId(hashUserId)
        } else {
          setOriginalUserId(storedOriginalUserId)
        }
      }
      
      // Set masked user ID for display
      setMaskedUserId(maskUserIdForDisplay(hashUserId));
      
      // Load nickname if exists
      const storedNickname = localStorage.getItem(`nickname_${hashUserId}`)
      if (storedNickname) {
        setNickname(storedNickname)
      } else {
        // Generate a default nickname if none exists
        const defaultNickname = `User${Math.floor(Math.random() * 10000)}`
        setNickname(defaultNickname)
        localStorage.setItem(`nickname_${hashUserId}`, defaultNickname)
      }
      
      const storedAppreciations = localStorage.getItem(`appreciations_${hashUserId}`)
      if (storedAppreciations) {
        setAppreciations(JSON.parse(storedAppreciations))
      }
      setUserType('guest')
    } else {
      // No hash in URL = go to login
      window.location.replace('/login')
    }
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
    // Clear all storage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('isGuest')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    
    // Clear URL hash
    window.location.hash = ''
    
    // Redirect to login
    window.location.replace('/login')
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

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(actualUserId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveNickname = () => {
    if (newNickname.trim()) {
      const userId = getUserId()
      if (userId) {
        setNickname(newNickname.trim())
        localStorage.setItem(`nickname_${userId}`, newNickname.trim())
        setIsEditingNickname(false)
        setNewNickname('')
        toast.success('Nickname updated successfully!')
      }
    }
  }

  const handleUserSelect = (selectedUserId: string) => {
    // Store the original user ID before navigating
    const currentUserId = getUserId()
    if (currentUserId) {
      localStorage.setItem('originalUserId', currentUserId)
    }
    
    // Navigate to the selected user's journal
    window.location.href = `${window.location.origin}${window.location.pathname}#${selectedUserId}`
    window.location.reload() // Reload to apply the new hash
    setIsUserSearchOpen(false)
  }

  useEffect(() => {
    // Check for userId in hash on both mobile and desktop
    const hashUserId = window.location.hash.slice(1)
    if (!hashUserId) {
      // If no userId in hash, redirect to login
      window.location.href = '/login'
    }
  }, [])

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
                <div className="mb-6 flex justify-between items-center">
                  {/* Nickname display and edit */}
                  {isEditingNickname ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="Enter nickname"
                        className="px-3 py-1.5 text-xs bg-white/10 text-white rounded-full 
                                 border border-white/20 focus:outline-none focus:border-white/40"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveNickname}
                        className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 
                                 text-white rounded-full transition-all duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingNickname(false)
                          setNewNickname('')
                        }}
                        className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 
                                 text-white/60 rounded-full transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 
                               bg-white/5 rounded-full w-fit">
                        <p className="text-xs text-white/40 font-light whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[150px]">
                          {nickname}
                        </p>
                        {isReadOnlyMode && (
                          <span className="text-xs bg-[#A7D8DE]/20 text-[#A7D8DE] px-2 py-0.5 rounded-full">
                            Read Only
                          </span>
                        )}
                      </div>
                      {!isReadOnlyMode && (
                        <button
                          onClick={() => {
                            setIsEditingNickname(true)
                            setNewNickname(nickname)
                          }}
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300"
                          title="Edit nickname"
                        >
                          <svg 
                            viewBox="0 0 24 24" 
                            className="w-3 h-3 text-white/40"
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Add buttons container */}
                  <div className="flex items-center gap-2">
                    {/* Find Users button */}
                    <button
                      onClick={() => setIsUserSearchOpen(true)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 flex items-center gap-1"
                      title="Find users"
                    >
                      <Search className="w-4 h-4 text-white/60" />
                      <span className="text-xs text-white/60">Find Users</span>
                    </button>
                    
                    {/* Return to My Journal button (only in read-only mode) */}
                    {isReadOnlyMode && (
                      <button
                        onClick={() => {
                          window.location.href = `${window.location.origin}${window.location.pathname}#${originalUserId}`
                          window.location.reload()
                        }}
                        className="p-2 bg-[#A7D8DE]/20 hover:bg-[#A7D8DE]/30 rounded-full transition-all duration-300 flex items-center gap-1"
                        title="Return to my journal"
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          className="w-4 h-4 text-[#A7D8DE]"
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        >
                          <path d="M3 12h18M3 12l6-6M3 12l6 6" />
                        </svg>
                        <span className="text-xs text-[#A7D8DE]">My Journal</span>
                      </button>
                    )}
                    
                    {/* User ID Info button (only when not in read-only mode) */}
                    {!isReadOnlyMode && (
                      <button
                        onClick={() => setIsUserIdModalOpen(true)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 flex items-center gap-1"
                        title="Your User ID"
                      >
                        <Key className="w-4 h-4 text-white/60" />
                        <span className="text-xs text-white/60">Your ID</span>
                      </button>
                    )}
                  </div>
                </div>

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
                                ${isPastDate(date) || isReadOnlyMode ? 'opacity-40' : 'cursor-pointer'} 
                                ${selectedDate && formatDate(selectedDate) === formatDate(date) 
                                  ? 'bg-[#A7D8DE]/70 shadow-[0_0_20px_rgba(167,216,222,0.4)]' 
                                  : 'hover:bg-[#A7D8DE]/60 active:bg-[#A7D8DE]/70'}`}
                      onClick={() => !isPastDate(date) && !isReadOnlyMode && handleDateClick(date)}
                      whileHover={{ scale: isReadOnlyMode ? 1 : 1.15 }}
                      whileTap={{ scale: isReadOnlyMode ? 1 : 0.95 }}
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
                {selectedDate && !isReadOnlyMode && (
                  <>
                    {/* Simplified Input Form - only show when not in read-only mode */}
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
                          className="w-full pl-6 p-3 text-[16px]
                                   bg-surface/40 backdrop-blur-md text-white
                                   rounded-lg border border-white/10
                                   focus:outline-none focus:border-white/20 
                                   placeholder-white/40 placeholder:text-sm
                                   touch-manipulation"
                          autoFocus
                        />
                      </div>
                    </motion.form>
                  </>
                )}

                <div className="space-y-3">
                  {appreciations
                    .filter(a => !selectedDate || a.date === formatDate(selectedDate))
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
                        onDoubleClick={() => !isReadOnlyMode && handleEdit(appreciation)}
                      >
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 
                                      bg-white/40 rounded-full opacity-0 group-hover:opacity-100
                                      transition-opacity duration-300" />
                        {editingId === appreciation.id && !isReadOnlyMode ? (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveEdit(appreciation.id);
                          }}>
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full bg-transparent text-[16px] text-white 
                                       focus:outline-none border-b border-white/20
                                       touch-manipulation"
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
                        {/* Delete button - only show when not in read-only mode */}
                        {!isReadOnlyMode && (
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
                        )}
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Search Modal */}
      {isUserSearchOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface/95 rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Find Users</h3>
              <button
                onClick={() => setIsUserSearchOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <UserSearch onSelectUser={handleUserSelect} />
          </div>
        </div>
      )}

      {/* User ID Modal */}
      {isUserIdModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface/95 backdrop-blur-lg rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-[#A7D8DE]" />
                Your User ID
              </h3>
              <button
                onClick={() => setIsUserIdModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/80 font-mono break-all">{actualUserId}</p>
                <button
                  onClick={handleCopyUserId}
                  className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <span className="text-xs text-white/80 px-2">Copied!</span>
                  ) : (
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-4 h-4 text-white/60"
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-[#A7D8DE]/10 p-4 rounded-lg border border-[#A7D8DE]/20 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#A7D8DE] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Important Information</h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Your User ID is the key to accessing your journal. Save it somewhere safe! 
                    You'll need it to log back in and access your data in the future.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCopyUserId}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 rounded-lg transition-all duration-300 text-sm text-white"
              >
                Copy to Clipboard
              </button>
              
              <button
                onClick={() => {
                  // Create a text file with the user ID
                  const element = document.createElement('a');
                  const file = new Blob([`Your Thankly User ID: ${actualUserId}\n\nKeep this ID safe! You'll need it to access your journal in the future.`], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = "thankly-user-id.txt";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  toast.success('User ID saved to file');
                }}
                className="w-full py-2.5 bg-[#A7D8DE]/30 hover:bg-[#A7D8DE]/40 rounded-lg transition-all duration-300 text-sm text-white shadow-[0_0_10px_rgba(167,216,222,0.2)]"
              >
                Save to File
              </button>
            </div>
          </div>
        </div>
      )}

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

