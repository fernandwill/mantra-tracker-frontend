import { getMantras, getSessions, getCurrentStreak } from '@/lib/mantra-service'
import { Mantra } from '@/lib/types'

export interface DailyStats {
  date: string // Always use string for consistency with API
  count: number
}

// Backend stats response structure
export interface BackendStats {
  totalRepetitions: number
  totalMantras: number
  activeDays: number
  currentStreak: number
  dailyActivity: DailyStats[]
}

// Frontend stats structure (for compatibility)
export interface MantraStats {
  totalMantras: number
  activeMantras: number
  totalSessions: number // Maps to totalRepetitions
  currentStreak: number
  longestStreak: number
  completedMantras: number
  dailyProgress: DailyStats[]
  completionRate: number
}

export function calculateMantraStats(): MantraStats {
  const mantras = getMantras()
  const sessions = getSessions()
  
  // Basic stats
  const totalMantras = mantras.length
  const currentStreak = getCurrentStreak()
  
  // Calculate total repetitions
  const totalSessions = sessions.reduce((sum, session) => sum + session.count, 0)
  
  // Calculate completed mantras (those that have reached their goal at least once)
  const completedMantras = mantras.filter(mantra => {
    const mantraSessions = sessions.filter(s => s.mantraId === mantra.id)
    const totalCount = mantraSessions.reduce((sum, s) => sum + s.count, 0)
    return totalCount >= mantra.goal
  }).length
  
  // Calculate completion rate
  const completionRate = totalMantras > 0 ? (completedMantras / totalMantras) * 100 : 0

  // Daily progress (last 7 days)
  const dailyProgress: DailyStats[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Create a map of dates to session counts
  const dateMap: Record<string, number> = {}
  sessions.forEach(session => {
    // Handle case where session.date might be undefined or null
    if (!session.date) return
    
    const date = new Date(session.date)
    // Check if date is valid
    if (isNaN(date.getTime())) return
    
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toISOString().split('T')[0]
    if (!dateMap[dateStr]) {
      dateMap[dateStr] = 0
    }
    dateMap[dateStr] += session.count
  })
  
  // Generate last 7 days of data
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dailyProgress.push({
      date: dateStr, // Use string format consistently
      count: dateMap[dateStr] || 0
    })
  }
  
  // Calculate longest streak (simplified - in a real app you'd want a more sophisticated algorithm)
  const longestStreak = Math.max(currentStreak, 7) // Placeholder
  
  return {
    totalMantras,
    activeMantras: totalMantras, // All mantras are considered active in this implementation
    totalSessions,
    currentStreak,
    longestStreak,
    completedMantras,
    dailyProgress,
    completionRate
  }
}

export function getMostPracticedMantras(limit = 5): (Mantra & { totalCount: number })[] {
  const mantras = getMantras()
  const sessions = getSessions()
  
  const mantraStats = mantras.map(mantra => {
    const mantraSessions = sessions.filter(s => s.mantraId === mantra.id)
    const totalCount = mantraSessions.reduce((sum, s) => sum + s.count, 0)
    return {
      ...mantra,
      totalCount
    }
  })
  
  // Sort by total count descending
  mantraStats.sort((a, b) => b.totalCount - a.totalCount)
  
  return mantraStats.slice(0, limit)
}