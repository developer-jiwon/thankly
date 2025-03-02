'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search, Key, Info, Flame, Calendar } from 'lucide-react'
import { getDaysInMonth, formatDate, getFirstDayOfMonth } from '../utils/dateUtils'
import { getUserType, getFeatureLimits } from '../utils/userUtils'
import { SideNav } from '../components/SideNav'
import { Settings } from '../components/Settings'
import { SearchAppreciations } from '../components/SearchAppreciations'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { getUserId } from '../utils/userIdentifier'
import { Toast } from '@/components/Toast'
import { UserSearch } from '../components/UserSearch'

interface Appreciation {
  id: number
  title: string
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

// CSS for bookmark tabs only (removing toast customization)
const styles = `
  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes neonPulse {
    0% {
      box-shadow: 0 0 5px #A7D8DE,
                0 0 10px #A7D8DE,
                0 0 15px #A7D8DE;
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 10px #A7D8DE,
                0 0 20px #A7D8DE,
                0 0 30px #A7D8DE;
      transform: scale(1.1);
    }
    100% {
      box-shadow: 0 0 5px #A7D8DE,
                0 0 10px #A7D8DE,
                0 0 15px #A7D8DE;
      transform: scale(1);
    }
  }

  .date-hover {
    transition: all 0.3s ease;
  }

  .animate-slideDown {
    animation: slideDown 0.3s ease-out forwards;
  }
  
  .bookmark-tab {
    position: relative;
    width: 40px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px 0;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    transition: all 0.3s ease;
    flex-shrink: 0;
    margin: 0;
    transform-origin: bottom center;
  }
  
  .bookmark-tab::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .bookmark-tab:hover::after {
    opacity: 1;
  }
  
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1); }
    70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
  }
  
  .bookmark-tab:hover {
    animation: pulseGlow 1.5s infinite;
  }
`;

function implementUserTypeChanges() {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Initialize with current month/year
    return new Date()
  })
  const [mounted, setMounted] = useState(false)
  
  // Function to check if a date is in the past (moved inside component)
  const isPastDate = (date: Date) => {
    // Allow selection of any date in the current month or future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If it's the same month and year as the current view, allow selection
    if (date.getMonth() === currentMonth.getMonth() && 
        date.getFullYear() === currentMonth.getFullYear()) {
      return false;
    }
    
    // Otherwise, check if it's in the past
    return date < today;
  };
  
  const [selectedNavItem, setSelectedNavItem] = useState('Home')
  const [userType, setUserType] = useState<'guest' | 'registered' | 'unauthenticated'>('unauthenticated')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const [newAppreciation, setNewAppreciation] = useState({ title: '', text: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editText, setEditText] = useState('')
  const [copied, setCopied] = useState(false)
  const [maskedUserId, setMaskedUserId] = useState('')
  const [nickname, setNickname] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [newNickname, setNewNickname] = useState('')
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false)
  const [isUserIdModalOpen, setIsUserIdModalOpen] = useState(false)
  const [actualUserId, setActualUserId] = useState('')
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false)
  const [originalUserId, setOriginalUserId] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalDaysWritten, setTotalDaysWritten] = useState(0)

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
      
      // Load nickname and profile picture if exists
      const storedNickname = localStorage.getItem(`nickname_${hashUserId}`)
      const storedProfilePicture = localStorage.getItem(`profilePicture_${hashUserId}`)
      
      if (storedNickname) {
        setNickname(storedNickname)
      } else {
        // Generate a default nickname if none exists
        const defaultNickname = `User${Math.floor(Math.random() * 10000)}`
        setNickname(defaultNickname)
        localStorage.setItem(`nickname_${hashUserId}`, defaultNickname)
      }

      if (storedProfilePicture) {
        setProfilePicture(storedProfilePicture)
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
    setDeleteConfirmId(null)
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
      return
    }

    const dataStr = JSON.stringify(appreciations)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'appreciations.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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
    }
  }

  const handleAddAppreciation = (title: string, text: string) => {
    const userId = getUserId()
    if (!userId) {
      router.push('/login')
      return
    }

    if ((title.trim() || text.trim()) && selectedDate) {
      const limits = getFeatureLimits(userType)
      const todayAppreciations = appreciations.filter(a => a.date === formatDate(new Date())).length

      if (todayAppreciations >= limits.maxAppreciationsPerDay) {
        return
      }

      const newEntry: Appreciation = {
        id: Date.now(),
        title: title.trim(),
        text: text.trim(),
        date: formatDate(selectedDate)
      }
      setAppreciations([newEntry, ...appreciations])
    }
  }

  const handleEdit = (appreciation: Appreciation) => {
    setEditingId(appreciation.id)
    setEditTitle(appreciation.title)
    setEditText(appreciation.text)
  }

  const handleSaveEdit = (id: number) => {
    if (editTitle.trim()) {
      setAppreciations(appreciations.map(a => 
        a.id === id ? { ...a, title: editTitle.trim(), text: editText.trim() } : a
      ))
      setEditingId(null)
      setEditTitle('')
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
        
        // Handle profile picture save
        if (newProfilePicture) {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64String = reader.result as string
            setProfilePicture(base64String)
            localStorage.setItem(`profilePicture_${userId}`, base64String)
          }
          reader.readAsDataURL(newProfilePicture)
        }
        
        setIsEditingNickname(false)
        setNewNickname('')
        setNewProfilePicture(null)
        setPreviewUrl(null)
      }
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Please choose an image under 5MB')
        return
      }
      setNewProfilePicture(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
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

  // Calculate total days written when appreciations change or on mount
  useEffect(() => {
    if (appreciations.length === 0) return;
    
    // Get unique dates from all appreciations
    const uniqueDates = new Set(appreciations.map(a => a.date));
    const totalDays = uniqueDates.size;
    
    // Save to localStorage
    const userId = getUserId();
    if (userId) {
      localStorage.setItem(`totalDaysWritten_${userId}`, totalDays.toString());
    }
    
    setTotalDaysWritten(totalDays);
  }, [appreciations]);

  // Load total days written from localStorage on mount
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      const savedTotalDays = localStorage.getItem(`totalDaysWritten_${userId}`);
      if (savedTotalDays) {
        setTotalDaysWritten(parseInt(savedTotalDays, 10));
      }
    }
  }, []);

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!mounted) return null
  if (userType === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen">
      <style jsx>{styles}</style>
      <div className="flex-1">
        <div className="min-h-screen flex flex-col lg:items-center lg:justify-center p-4">
          <div className="flex flex-col lg:flex-row w-full max-w-5xl 
                        bg-surface/95 backdrop-blur-lg
                        rounded-xl shadow-xl
                        overflow-y-auto">
            
            {/* Calendar Section */}
            <div className="w-full 
                          lg:w-[500px] pt-16 pb-10 px-10
                          lg:border-r border-white/10
                          bg-transparent
                          flex items-center justify-center">
              <div className="max-w-sm relative">
                {/* Viewing Indicator - Above Bookmarks */}
                {isReadOnlyMode && (
                  <motion.div 
                    className="absolute -top-12 left-0 right-0 flex items-center justify-center z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.2, duration: 0.3 }
                    }}
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A7D8DE]/10 backdrop-blur-md border border-[#A7D8DE]/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A7D8DE] animate-pulse" />
                      <span className="text-xs text-white/90">Viewing {nickname}'s Journal</span>
                    </div>
                  </motion.div>
                )}

                {/* Total Days Written Counter - Centered both vertically and horizontally */}
                {!isReadOnlyMode && (
                  <motion.div 
                    className="mb-8 flex items-center justify-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.5, duration: 0.3 }
                    }}
                  >
                    <div className={`
                      inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                      ${totalDaysWritten > 0 ? 'bg-gradient-to-r from-[#A7D8DE]/20 to-[#86B4BA]/20 border border-[#A7D8DE]/30' : 'bg-white/5 border border-white/10'}
                    `}>
                      <motion.div
                        animate={totalDaysWritten > 0 ? {
                          scale: [1, 1.2, 1],
                          transition: { 
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 1.5,
                            ease: "easeInOut"
                          }
                        } : {}}
                      >
                        <Calendar className={`w-3.5 h-3.5 ${totalDaysWritten > 0 ? 'text-[#A7D8DE]' : 'text-white/40'}`} />
                      </motion.div>
                      <div className="flex items-center gap-1">
                        <span className="text-white/60">Total Days:</span>
                        <span className={`font-medium ${totalDaysWritten > 0 ? 'text-[#A7D8DE]' : 'text-white/60'}`}>
                          {totalDaysWritten}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mb-6 flex justify-between items-end">
                  {/* Single container for all bookmark tabs with consistent spacing */}
                  <div className="flex items-end space-x-0">
                    {/* User Profile/Nickname bookmark */}
                    <motion.div 
                      className="bookmark-tab bg-[#A7D8DE]/20 hover:bg-[#A7D8DE]/30
                               border-t border-l border-r border-[#A7D8DE]/30
                               shadow-[0_-5px_15px_rgba(167,216,222,0.1)]
                               cursor-pointer group relative"
                      onClick={() => {
                        if (!isReadOnlyMode) {
                          setIsEditingNickname(true);
                          setNewNickname(nickname);
                        }
                      }}
                      whileHover={{ 
                        y: -4, 
                        scale: 1.15,
                        boxShadow: "0 -10px 25px rgba(167,216,222,0.3)",
                        transition: { 
                          y: { type: "spring", stiffness: 400, damping: 10 },
                          scale: { type: "spring", stiffness: 300, damping: 8 },
                          boxShadow: { duration: 0.2 }
                        }
                      }}
                      whileTap={{ 
                        scale: 0.85, 
                        y: 2,
                        transition: { type: "spring", stiffness: 400, damping: 10 } 
                      }}
                    >
                      <div className="flex items-center justify-center relative">
                        {profilePicture ? (
                          <div className="w-5 h-5 rounded-full overflow-hidden">
                            <img 
                              src={profilePicture} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <motion.svg 
                            viewBox="0 0 24 24" 
                            className="w-4 h-4 text-[#A7D8DE]"
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <motion.path 
                              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                              initial={{ pathLength: 0 }}
                              animate={{ 
                                pathLength: 1,
                                transition: { delay: 0.3, duration: 0.8 }
                              }}
                            />
                            <motion.circle 
                              cx="12" 
                              cy="7" 
                              r="4"
                              initial={{ pathLength: 0 }}
                              animate={{ 
                                pathLength: 1,
                                transition: { delay: 0.5, duration: 0.8 }
                              }}
                            />
                          </motion.svg>
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Find Users button */}
                    <motion.button
                      onClick={() => setIsUserSearchOpen(true)}
                      className="bookmark-tab bg-white/5 hover:bg-white/10
                               border-t border-l border-r border-white/10
                               shadow-[0_-5px_15px_rgba(255,255,255,0.05)]"
                      title="Find Users"
                      whileHover={{ 
                        y: -4, 
                        boxShadow: "0 -8px 20px rgba(255,255,255,0.15)",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        transition: { 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 8 
                        }
                      }}
                      whileTap={{ 
                        scale: 0.85, 
                        y: 2,
                        transition: { type: "spring", stiffness: 400, damping: 10 } 
                      }}
                      initial={{ opacity: 0, y: 20, rotate: 5 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        rotate: 0,
                        transition: { 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 15,
                          delay: 0.2
                        }
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          transition: { delay: 0.4, duration: 0.3 }
                        }}
                        whileHover={{
                          filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
                        }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            transition: { 
                              duration: 15, 
                              repeat: Infinity,
                              ease: "linear"
                            }
                          }}
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              transition: { 
                                duration: 2, 
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                              }
                            }}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                transition: { 
                                  duration: 2, 
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  ease: "easeInOut"
                                }
                              }}
                            >
                              <Search className="w-4 h-4 text-white/60" />
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.button>
                    
                    {/* User ID Info button (only when not in read-only mode) */}
                    {!isReadOnlyMode && (
                      <motion.button
                        onClick={() => setIsUserIdModalOpen(true)}
                        className="bookmark-tab bg-white/5 hover:bg-white/10
                                 border-t border-l border-r border-white/10
                                 shadow-[0_-5px_15px_rgba(255,255,255,0.05)]"
                        title="Your User ID"
                        whileHover={{ 
                          y: -4, 
                          scale: 1.15,
                          backgroundColor: "rgba(255,255,255,0.15)",
                          boxShadow: "0 -8px 20px rgba(255,255,255,0.2), 0 0 0 1px rgba(255,255,255,0.2)",
                          transition: { 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 8 
                          }
                        }}
                        whileTap={{ 
                          scale: 0.85, 
                          y: 2,
                          transition: { type: "spring", stiffness: 400, damping: 10 } 
                        }}
                        initial={{ opacity: 0, y: 20, rotate: -5 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          rotate: 0,
                          transition: { 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 15,
                            delay: 0.3
                          }
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            transition: { delay: 0.5, duration: 0.3 }
                          }}
                        >
                          <motion.div
                            animate={{
                              y: [0, -2, 0, 2, 0],
                              transition: { 
                                duration: 4, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }
                            }}
                          >
                            <motion.div
                              whileHover={{
                                rotateY: 180,
                                transition: { duration: 0.4 }
                              }}
                              animate={{
                                rotateZ: [0, 5, 0, -5, 0],
                                transition: { 
                                  duration: 6, 
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }
                              }}
                            >
                              <motion.div
                                animate={{
                                  filter: ["drop-shadow(0 0 0px rgba(255,255,255,0))", "drop-shadow(0 0 3px rgba(255,255,255,0.6))", "drop-shadow(0 0 0px rgba(255,255,255,0))"],
                                  transition: { 
                                    duration: 2, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }
                                }}
                              >
                                <Key className="w-4 h-4 text-white/60" />
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </motion.button>
                    )}
                    
                    {/* Return to My Journal button (only in read-only mode) */}
                    {isReadOnlyMode && (
                      <motion.button
                        onClick={() => {
                          window.location.href = `${window.location.origin}${window.location.pathname}#${originalUserId}`
                          window.location.reload()
                        }}
                        className="bookmark-tab bg-[#A7D8DE]/20 hover:bg-[#A7D8DE]/30
                                 border-t border-l border-r border-[#A7D8DE]/30
                                 shadow-[0_-5px_15px_rgba(167,216,222,0.1)]"
                        title="Return to my journal"
                        whileHover={{ 
                          y: -4, 
                          x: -4,
                          boxShadow: "0 -8px 20px rgba(167,216,222,0.3), -4px 0 10px rgba(167,216,222,0.2)",
                          transition: { 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 8 
                          }
                        }}
                        whileTap={{ 
                          scale: 0.85, 
                          x: -8,
                          transition: { type: "spring", stiffness: 400, damping: 10 } 
                        }}
                        initial={{ opacity: 0, y: 20, x: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          x: 0,
                          transition: { 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 15,
                            delay: 0.3
                          }
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ 
                            opacity: 1,
                            x: 0,
                            transition: { 
                              delay: 0.5, 
                              duration: 0.3,
                              type: "spring",
                              stiffness: 200
                            }
                          }}
                        >
                          <motion.div
                            animate={{
                              x: [0, -5, 0],
                              transition: { 
                                duration: 1.5, 
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: [0.25, 0.1, 0.25, 1]
                              }
                            }}
                          >
                            <motion.div
                              whileHover={{
                                x: -5,
                                transition: { duration: 0.2 }
                              }}
                            >
                              <motion.svg 
                                viewBox="0 0 24 24" 
                                className="w-4 h-4 text-[#A7D8DE]"
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ 
                                  pathLength: 1, 
                                  opacity: 1,
                                  transition: { 
                                    pathLength: { delay: 0.6, duration: 0.8, ease: "easeInOut" },
                                    opacity: { delay: 0.6, duration: 0.3 }
                                  }
                                }}
                              >
                                <motion.path 
                                  d="M3 12h18M3 12l6-6M3 12l6 6"
                                  initial={{ pathLength: 0 }}
                                  animate={{ 
                                    pathLength: 1,
                                    transition: { delay: 0.7, duration: 0.8 }
                                  }}
                                />
                              </motion.svg>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </motion.button>
                    )}
                    
                    {/* Logout button */}
                    <motion.button
                      onClick={handleLogout}
                      className="bookmark-tab bg-white/5 hover:bg-red-500/20
                               border-t border-l border-r border-white/10
                               shadow-[0_-5px_15px_rgba(255,255,255,0.05)]"
                      title="Logout"
                      whileHover={{ 
                        y: -4, 
                        backgroundColor: "rgba(239,68,68,0.3)",
                        boxShadow: "0 -8px 20px rgba(239,68,68,0.2), 0 0 0 1px rgba(239,68,68,0.3)",
                        transition: { 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 8 
                        }
                      }}
                      whileTap={{ 
                        scale: 0.85, 
                        rotate: 5,
                        transition: { type: "spring", stiffness: 400, damping: 10 } 
                      }}
                      initial={{ opacity: 0, y: 20, rotate: 5 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        rotate: 0,
                        transition: { 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 15,
                          delay: 0.4
                        }
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          transition: { delay: 0.6, duration: 0.3 }
                        }}
                        whileHover={{
                          filter: "drop-shadow(0 0 2px rgba(239,68,68,0.6))",
                          transition: { duration: 0.2 }
                        }}
                      >
                        <motion.div
                          whileHover={{
                            x: 3,
                            transition: { 
                              type: "spring", 
                              stiffness: 400, 
                              damping: 10 
                            }
                          }}
                          animate={{
                            rotate: [0, 2, 0, -2, 0],
                            transition: { 
                              duration: 5, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }
                          }}
                        >
                          <motion.svg 
                            viewBox="0 0 24 24" 
                            className="w-4 h-4 text-white/60 group-hover:text-red-400"
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ 
                              pathLength: 1, 
                              opacity: 1,
                              transition: { 
                                pathLength: { delay: 0.7, duration: 1, ease: "easeInOut" },
                                opacity: { delay: 0.7, duration: 0.4 }
                              }
                            }}
                          >
                            <motion.path 
                              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                              initial={{ pathLength: 0 }}
                              animate={{ 
                                pathLength: 1,
                                transition: { delay: 0.8, duration: 0.8 }
                              }}
                            />
                            <motion.path 
                              d="M16 17l5-5-5-5"
                              initial={{ pathLength: 0 }}
                              animate={{ 
                                pathLength: 1,
                                transition: { delay: 0.9, duration: 0.8 }
                              }}
                            />
                            <motion.path 
                              d="M21 12H9"
                              initial={{ pathLength: 0 }}
                              animate={{ 
                                pathLength: 1,
                                transition: { delay: 1.0, duration: 0.8 }
                              }}
                              whileHover={{
                                x: 2,
                                transition: { duration: 0.3, repeat: Infinity, repeatType: "reverse" }
                              }}
                            />
                          </motion.svg>
                        </motion.div>
                      </motion.div>
                    </motion.button>
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
                    <div key={day} className="text-center text-sm font-medium tracking-wider uppercase text-white/50 mb-2">
                      {day.slice(0,1)}
                    </div>
                  ))}
                  
                  {/* Add empty cells for days before the first of the month */}
                  {(() => {
                    // Get the first day of the month
                    const firstDayOfWeek = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
                    
                    // Create empty cells for proper alignment
                    return Array.from({ length: firstDayOfWeek }).map((_, index) => (
                      <div key={`empty-${index}`} className="w-10 h-10"></div>
                    ));
                  })()}
                  
                  {daysInMonth.map((date, index) => (
                    <motion.div 
                      key={date.toString()}
                      className={`w-12 h-12 lg:w-14 lg:h-14
                                flex items-center justify-center 
                                rounded-full
                                relative
                                date-hover
                                ${isPastDate(date) ? 'opacity-40' : 'cursor-pointer'} 
                                ${selectedDate && formatDate(selectedDate) === formatDate(date) 
                                  ? 'bg-[#A7D8DE]/70 shadow-[0_0_20px_rgba(167,216,222,0.4)]' 
                                  : ''}`}
                      onClick={() => !isPastDate(date) && handleDateClick(date)}
                      whileHover={!isPastDate(date) ? {
                        scale: 1.2,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10
                        }
                      } : {}}
                      whileTap={!isPastDate(date) ? {
                        scale: 0.95,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10
                        }
                      } : {}}
                    >
                      <span className={`text-lg lg:text-xl font-medium ${
                        selectedDate && formatDate(selectedDate) === formatDate(date)
                          ? 'text-white'
                          : 'text-white/80'
                      }`}>
                        {date.getDate()}
                      </span>
                      
                      {(() => {
                        const count = appreciations.filter(a => a.date === formatDate(date)).length;
                        if (count > 0) {
                          return (
                            <div className={`absolute -top-2 ${count < 10 ? 'right-1' : '-right-0.5'}`}>
                              <span className="text-xs font-medium text-white/80">
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
            <div className="flex-1 lg:h-[600px] flex justify-center overflow-y-auto">
              <div className="w-full max-w-md p-6">
                {/* Total Days Written Milestone Message - Always show when there are days written */}
                {!isReadOnlyMode && totalDaysWritten > 0 && (
                  <motion.div 
                    className="mb-6 p-4 rounded-lg bg-gradient-to-r from-[#A7D8DE]/10 to-[#86B4BA]/10 border border-[#A7D8DE]/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: 0.2, duration: 0.3 }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <motion.div
                          animate={{
                            rotate: [-5, 5],
                            transition: { 
                              repeat: Infinity,
                              repeatType: "reverse",
                              duration: 0.5,
                              ease: "easeInOut"
                            }
                          }}
                        >
                          <Calendar className="w-5 h-5 text-[#A7D8DE]" />
                        </motion.div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white mb-1">
                          {totalDaysWritten === 1 ? "First day of gratitude!" : 
                           totalDaysWritten >= 100 ? "Gratitude master!" : 
                           totalDaysWritten >= 30 ? "Impressive dedication!" : 
                           totalDaysWritten >= 10 ? "Great progress!" : 
                           "Building your gratitude practice!"}
                        </h4>
                        <p className="text-xs text-white/70 leading-relaxed">
                          {totalDaysWritten === 1 ? "You've started your gratitude journey. Keep going!" : 
                           totalDaysWritten >= 100 ? `Incredible! You've written gratitude entries on ${totalDaysWritten} different days!` :
                           totalDaysWritten >= 30 ? `You've practiced gratitude on ${totalDaysWritten} different days. That's a solid habit!` : 
                           totalDaysWritten >= 10 ? `You've written entries on ${totalDaysWritten} different days. Your practice is growing!` :
                           `You've written gratitude entries on ${totalDaysWritten} different days. Every entry matters!`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedDate && (
                  <>
                    {/* Input Form - Only show when not in read-only mode */}
                    {!isReadOnlyMode && (
                      <motion.form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newAppreciation.title.trim() || newAppreciation.text.trim()) {
                            handleAddAppreciation(newAppreciation.title, newAppreciation.text);
                            setNewAppreciation({ title: '', text: '' });
                          }
                        }}
                        className="mb-6"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-white/60 text-sm mb-2 ml-1">
                          What are you grateful for today?
                        </label>
                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              type="text"
                              value={newAppreciation.title}
                              onChange={(e) => setNewAppreciation(prev => ({ ...prev, title: e.target.value }))}
                              maxLength={100}
                              placeholder="Title (required)"
                              className="w-full pl-6 p-3 text-[16px]
                                       bg-surface/40 backdrop-blur-md text-white
                                       rounded-lg border border-white/10
                                       focus:outline-none focus:border-[#A7D8DE]/50 
                                       touch-manipulation
                                       placeholder:text-white/30
                                       required:border-[#A7D8DE]/30"
                              required
                              autoFocus
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="text-xs text-white/40">
                                {newAppreciation.title.length}/100
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <textarea
                              value={newAppreciation.text}
                              onChange={(e) => setNewAppreciation(prev => ({ ...prev, text: e.target.value }))}
                              rows={3}
                              maxLength={280}
                              placeholder="Write your gratitude entry..."
                              className="w-full pl-6 p-4 text-[16px]
                                       bg-surface/40 backdrop-blur-md text-white
                                       rounded-lg border border-white/10
                                       focus:outline-none focus:border-white/20 
                                       touch-manipulation resize-none
                                       placeholder:text-white/30"
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                              <div className="text-xs text-white/40">
                                {newAppreciation.text.length}/280
                              </div>
                              <button
                                type="submit"
                                disabled={!newAppreciation.title.trim()}
                                className={`px-4 py-1.5 rounded-full text-sm
                                        transition-all duration-300
                                        ${newAppreciation.title.trim()
                                          ? 'bg-[#A7D8DE] text-gray-900 hover:bg-[#86B4BA]' 
                                          : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.form>
                    )}

                    {/* Entries List - Always show when date is selected */}
                    <div className="space-y-4">
                      {appreciations
                        .filter(a => a.date === formatDate(selectedDate))
                        .map((appreciation, index) => (
                          <motion.div
                            key={appreciation.id}
                            className="p-5 rounded-xl
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
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    maxLength={100}
                                    className="w-full bg-transparent text-[16px] text-white 
                                             focus:outline-none border-b border-white/20
                                             touch-manipulation"
                                    placeholder="Title (required)"
                                    required
                                    autoFocus
                                    onKeyDown={handleKeyDown}
                                  />
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={3}
                                    maxLength={280}
                                    className="w-full bg-transparent text-[16px] text-white 
                                             focus:outline-none border-b border-white/20
                                             touch-manipulation resize-none"
                                    placeholder="Write your gratitude entry..."
                                    onKeyDown={handleKeyDown}
                                  />
                                  <div className="flex justify-end gap-3 mt-3">
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      className="px-3 py-1.5 text-sm text-white/70 hover:text-white
                                               bg-white/10 hover:bg-white/20 rounded-full
                                               transition-all duration-300"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={!editTitle.trim()}
                                      className={`px-4 py-1.5 rounded-full text-sm
                                              transition-all duration-300
                                              ${editTitle.trim()
                                                ? 'bg-[#A7D8DE] text-gray-900 hover:bg-[#86B4BA]' 
                                                : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              <div>
                                {appreciation.title && (
                                  <motion.h3 
                                    className="text-base font-semibold text-[#A7D8DE] mb-2"
                                    initial={{ opacity: 0.8 }}
                                    animate={{ 
                                      opacity: [0.8, 1],
                                      transition: { 
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                      }
                                    }}
                                  >
                                    {appreciation.title}
                                  </motion.h3>
                                )}
                                <p className="text-sm flex-1 text-white/90 leading-relaxed
                                          group-hover:text-white transition-colors duration-300
                                          whitespace-pre-wrap break-words">
                                  {appreciation.text}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="text-xs text-white/40">
                                    {new Date(appreciation.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  {!isReadOnlyMode && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(appreciation.id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100
                                             transition-opacity duration-300
                                             hover:scale-110 active:scale-95"
                                    >
                                      <div className="p-1.5 rounded-full hover:bg-white/10
                                                   transition-all duration-300">
                                        <svg 
                                          viewBox="0 0 24 24" 
                                          className="w-4 h-4 text-white/40 hover:text-white/60
                                                 transition-colors duration-300"
                                          fill="none" 
                                          stroke="currentColor" 
                                          strokeWidth="2"
                                        >
                                          <path d="M4 6h16l-1.58 14.22A2 2 0 0116.432 22H7.568a2 2 0 01-1.988-1.78L4 6z" />
                                          <path d="M7.345 3.147A2 2 0 019.154 2h5.692a2 2 0 011.81 1.147L18 6H6l1.345-2.853z" />
                                          <path d="M9 11v6M15 11v6" strokeLinecap="round" />
                                        </svg>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div 
              className="bg-surface/95 backdrop-blur-lg rounded-xl shadow-xl p-6 w-full max-w-sm"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 400, damping: 15 }
              }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16l-1.58 14.22A2 2 0 0116.432 22H7.568a2 2 0 01-1.988-1.78L4 6z" />
                    <path d="M7.345 3.147A2 2 0 019.154 2h5.692a2 2 0 011.81 1.147L18 6H6l1.345-2.853z" />
                    <path d="M9 11v6M15 11v6" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Delete Entry</h3>
                <p className="text-sm text-white/70">
                  Are you sure you want to delete this entry? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg transition-all duration-300 text-sm text-white"
                  onClick={() => setDeleteConfirmId(null)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  className="flex-1 py-2.5 bg-red-500/70 hover:bg-red-500/80 rounded-lg transition-all duration-300 text-sm text-white"
                  onClick={() => deleteConfirmId && deleteAppreciation(deleteConfirmId)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            
            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-center">
                <p className="text-base md:text-lg font-mono text-white/90 break-all text-center">{actualUserId}</p>
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
                {copied ? "Copied!" : "Copy to Clipboard"}
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
                }}
                className="w-full py-2.5 bg-[#A7D8DE]/30 hover:bg-[#A7D8DE]/40 rounded-lg transition-all duration-300 text-sm text-white shadow-[0_0_10px_rgba(167,216,222,0.2)]"
              >
                Save to File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nickname Edit Modal */}
      <AnimatePresence>
        {isEditingNickname && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsEditingNickname(false)
              setNewNickname('')
              setNewProfilePicture(null)
              setPreviewUrl(null)
            }}
          >
            <motion.div 
              className="bg-surface/95 backdrop-blur-lg rounded-xl shadow-xl p-6 w-full max-w-sm"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 400, damping: 15 }
              }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Edit Profile</h3>
                <button
                  onClick={() => {
                    setIsEditingNickname(false)
                    setNewNickname('')
                    setNewProfilePicture(null)
                    setPreviewUrl(null)
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="relative group mx-auto">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition-all duration-300">
                    {(previewUrl || profilePicture) ? (
                      <img 
                        src={previewUrl || profilePicture || ''} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Choose profile picture from device"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] text-white/90 text-center px-1">
                      Tap to choose photo
                    </span>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="Enter nickname"
                    className="w-full px-4 py-2.5 text-sm bg-white/10 text-white rounded-lg 
                             border border-white/20 focus:outline-none focus:border-white/40"
                    autoFocus
                  />
                  <p className="text-xs text-white/60 mt-2 text-center">
                    Click the image above to upload a profile picture
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => {
                      setIsEditingNickname(false)
                      setNewNickname('')
                      setNewProfilePicture(null)
                      setPreviewUrl(null)
                    }}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg transition-all duration-300 text-sm text-white"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSaveNickname}
                    className="flex-1 py-2.5 bg-[#A7D8DE]/30 hover:bg-[#A7D8DE]/40 rounded-lg transition-all duration-300 text-sm text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AppreciationCalendar() {
  return implementUserTypeChanges()
}

