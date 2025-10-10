'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getSessions } from '@/lib/mantra-service'
import { 
  Flame, 
  Calendar, 
  Target, 
  Trophy, 
  Star, 
  Crown, 
  Zap,
  Heart,
  Sun,
  Moon
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  requirement: number
  current: number
  unlocked: boolean
  category: 'streak' | 'volume' | 'consistency' | 'special'
  color: string
}

interface AchievementsProps {
  className?: string
}

export function Achievements({ className }: AchievementsProps) {
  const sessions = getSessions()
  
  const stats = useMemo(() => {
    const base = {
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      totalDays: 0,
      morningPractices: 0,
      eveningPractices: 0
    }

    if (!sessions.length) return base

    const { practiceDates, totalSessions, morningPractices, eveningPractices } = sessions.reduce(
      (acc, session) => {
        const sessionDate = new Date(session.date)
        const hour = sessionDate.getHours()
        sessionDate.setHours(0, 0, 0, 0)
        acc.practiceDates.add(sessionDate.toISOString().split('T')[0])
        acc.totalSessions += session.count
        acc.morningPractices += Number(hour >= 6 && hour < 12)
        acc.eveningPractices += Number(hour >= 18 && hour < 23)
        return acc
      },
      { practiceDates: new Set<string>(), totalSessions: 0, morningPractices: 0, eveningPractices: 0 }
    )

    const sortedDates = [...practiceDates].sort()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(today)
    if (!practiceDates.has(today.toISOString().split('T')[0])) {
      startDate.setDate(startDate.getDate() - 1)
    }

    let currentStreak = 0
    for (
      const checkDate = new Date(startDate);
      practiceDates.has(checkDate.toISOString().split('T')[0]);
      checkDate.setDate(checkDate.getDate() - 1)
    ) {
      currentStreak++
    }

    let longestStreak = sortedDates.length ? 1 : 0
    let tempStreak = longestStreak

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / 86_400_000

      tempStreak = dayDiff === 1 ? tempStreak + 1 : 1
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    return {
      currentStreak,
      longestStreak,
      totalSessions,
      totalDays: practiceDates.size,
      morningPractices,
      eveningPractices
    }
  }, [sessions])
  
  const achievements: Achievement[] = useMemo(() => [
    // Streak Achievements
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Complete your first practice session',
      icon: <Star className="w-4 h-4" />,
      requirement: 1,
      current: Math.max(stats.currentStreak, stats.longestStreak),
      unlocked: stats.totalSessions > 0,
      category: 'streak',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    },
    {
      id: 'three-day-flame',
      title: 'Three Day Flame',
      description: 'Maintain a 3-day practice streak',
      icon: <Flame className="w-4 h-4" />,
      requirement: 3,
      current: stats.currentStreak,
      unlocked: stats.currentStreak >= 3,
      category: 'streak',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    },
    {
      id: 'week-warrior',
      title: 'Week Warrior',
      description: 'Practice for 7 consecutive days',
      icon: <Calendar className="w-4 h-4" />,
      requirement: 7,
      current: stats.currentStreak,
      unlocked: stats.currentStreak >= 7,
      category: 'streak',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    },
    {
      id: 'month-master',
      title: 'Month Master',
      description: 'Achieve a 30-day practice streak',
      icon: <Target className="w-4 h-4" />,
      requirement: 30,
      current: stats.currentStreak,
      unlocked: stats.currentStreak >= 30,
      category: 'streak',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      id: 'century-club',
      title: 'Century Club',
      description: 'Reach 100 consecutive days',
      icon: <Crown className="w-4 h-4" />,
      requirement: 100,
      current: stats.currentStreak,
      unlocked: stats.currentStreak >= 100,
      category: 'streak',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    },
    
    // Volume Achievements
    {
      id: 'dedicated-practitioner',
      title: 'Dedicated Practitioner',
      description: 'Complete 50 practice sessions',
      icon: <Zap className="w-4 h-4" />,
      requirement: 50,
      current: stats.totalSessions,
      unlocked: stats.totalSessions >= 50,
      category: 'volume',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
    },
    {
      id: 'session-master',
      title: 'Session Master',
      description: 'Complete 200 practice sessions',
      icon: <Trophy className="w-4 h-4" />,
      requirement: 200,
      current: stats.totalSessions,
      unlocked: stats.totalSessions >= 200,
      category: 'volume',
      color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
    },
    
    // Consistency Achievements
    {
      id: 'consistent-soul',
      title: 'Consistent Soul',
      description: 'Practice on 30 different days',
      icon: <Heart className="w-4 h-4" />,
      requirement: 30,
      current: stats.totalDays,
      unlocked: stats.totalDays >= 30,
      category: 'consistency',
      color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    },
    
    // Special Achievements
    {
      id: 'morning-light',
      title: 'Morning Light',
      description: 'Complete 10 morning practices',
      icon: <Sun className="w-4 h-4" />,
      requirement: 10,
      current: stats.morningPractices,
      unlocked: stats.morningPractices >= 10,
      category: 'special',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
    },
    {
      id: 'evening-peace',
      title: 'Evening Peace',
      description: 'Complete 10 evening practices',
      icon: <Moon className="w-4 h-4" />,
      requirement: 10,
      current: stats.eveningPractices,
      unlocked: stats.eveningPractices >= 10,
      category: 'special',
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  ], [stats])
  
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const nextAchievements = achievements
    .filter(a => !a.unlocked)
    .sort((a, b) => (a.requirement - a.current) - (b.requirement - b.current))
    .slice(0, 3)
  
  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
              🎉 Unlocked ({unlockedAchievements.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unlockedAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                >
                  <Badge className={achievement.color}>
                    {achievement.icon}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Next Achievements */}
        {nextAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              🎯 Next Goals
            </h4>
            <div className="space-y-3">
              {nextAchievements.map(achievement => {
                const progress = (achievement.current / achievement.requirement) * 100
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Badge variant="outline" className="opacity-60">
                      {achievement.icon}
                    </Badge>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {achievement.current}/{achievement.requirement}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {unlockedAchievements.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Start practicing to unlock achievements!</p>
          </div>
        )}
      </div>
    </div>
  )
}