import { getMantras, getSessions, getCurrentStreak } from '@/lib/mantra-service'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: Date
}

export function getAchievements(): Achievement[] {
  const mantras = getMantras()
  const sessions = getSessions()
  const streak = getCurrentStreak()
  
  // Calculate total repetitions
  const totalSessions = sessions.reduce((sum, session) => sum + session.count, 0)
  
  // Calculate completed mantras
  const completedMantras = mantras.filter(mantra => {
    const mantraSessions = sessions.filter(s => s.mantraId === mantra.id)
    const totalCount = mantraSessions.reduce((sum, s) => sum + s.count, 0)
    return totalCount >= mantra.goal
  }).length
  
  // Calculate total practice days
  const practiceDays = new Set<string>()
  sessions.forEach(session => {
    const date = new Date(session.date)
    date.setHours(0, 0, 0, 0)
    practiceDays.add(date.toISOString().split('T')[0])
  })
  const totalPracticeDays = practiceDays.size
  
  const achievements: Achievement[] = [
    {
      id: 'first-mantra',
      title: 'First Steps',
      description: 'Create your first mantra',
      icon: '🌱',
      earned: mantras.length > 0
    },
    {
      id: 'first-session',
      title: 'Begin Your Practice',
      description: 'Complete your first mantra session',
      icon: '🧘',
      earned: totalSessions > 0
    },
    {
      id: '10-sessions',
      title: 'Practice Makes Progress',
      description: 'Complete 10 mantra sessions',
      icon: '📈',
      earned: totalSessions >= 10
    },
    {
      id: '50-sessions',
      title: 'Dedicated Practitioner',
      description: 'Complete 50 mantra sessions',
      icon: '🔥',
      earned: totalSessions >= 50
    },
    {
      id: 'first-completion',
      title: 'Goal Achieved',
      description: 'Complete your first mantra goal',
      icon: '✅',
      earned: completedMantras > 0
    },
    {
      id: '3-day-streak',
      title: 'Building Consistency',
      description: 'Maintain a 3-day practice streak',
      icon: '🔁',
      earned: streak >= 3
    },
    {
      id: '7-day-streak',
      title: 'Weekly Warrior',
      description: 'Maintain a 7-day practice streak',
      icon: '🏆',
      earned: streak >= 7
    },
    {
      id: '30-day-streak',
      title: 'Monthly Master',
      description: 'Maintain a 30-day practice streak',
      icon: '👑',
      earned: streak >= 30
    },
    {
      id: '5-mantras',
      title: 'Mantra Collector',
      description: 'Create 5 different mantras',
      icon: '📚',
      earned: mantras.length >= 5
    },
    {
      id: '10-practice-days',
      title: 'Regular Practitioner',
      description: 'Practice on 10 different days',
      icon: '📅',
      earned: totalPracticeDays >= 10
    }
  ]
  
  return achievements
}