export function getUserType(): 'guest' | 'registered' | 'unauthenticated' {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const isGuest = localStorage.getItem('isGuest') === 'true'

  if (isAuthenticated) return 'registered'
  if (isGuest) return 'guest'
  return 'unauthenticated'
}

export function getFeatureLimits(userType: 'guest' | 'registered' | 'unauthenticated') {
  const limits = {
    maxAppreciationsPerDay: userType === 'registered' ? Infinity : 5,
    dataRetentionDays: userType === 'registered' ? Infinity : 30,
    canExport: userType === 'registered',
    canShare: userType === 'registered',
    canCustomize: userType === 'registered',
  }
  return limits
}

