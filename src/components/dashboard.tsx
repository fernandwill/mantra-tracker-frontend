'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateMantraStats, getMostPracticedMantras } from '@/lib/stats-service'
import { MantraStats } from '@/lib/stats-service'
import { Mantra } from '@/lib/types'
import { SimpleBarChart } from '@/components/simple-bar-chart'
import { Achievements } from '@/components/achievements'
import { Target, Clock, TrendingUp, CheckCircle, Calendar, Trophy } from 'lucide-react'

export function Dashboard() {
  const [stats, setStats] = useState<MantraStats | null>(null)
  const [mostPracticed, setMostPracticed] = useState<(Mantra & { totalCount: number })[]>([])

  useEffect(() => {
    refreshStats()
  }, [])

  const refreshStats = () => {
    setStats(calculateMantraStats())
    setMostPracticed(getMostPracticedMantras(5))
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse">
          <div className="rounded-full gradient-accent-bg w-16 h-16" />
        </div>
      </div>
    )
  }

  // Prepare data for charts
  const dailyData = stats.dailyProgress.map(item => {
    // Handle case where item.date might be undefined or null
    if (!item.date) {
      return {
        name: 'Unknown',
        value: item.count || 0
      }
    }
    
    const date = new Date(item.date) // Convert string to Date
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: item.count
    }
  })

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg gradient-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Active Mantras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.totalMantras}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalMantras === 0
                ? 'Start your journey'
                : stats.totalMantras === 1
                ? '1 active mantra'
                : `${stats.totalMantras} active mantras`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg gradient-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Total Repetitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.totalSessions}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalSessions === 0
                ? 'Begin today'
                : stats.totalSessions === 1
                ? '1 repetition'
                : `${stats.totalSessions} repetitions`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg gradient-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.currentStreak}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.currentStreak === 0
                ? 'Days in a row'
                : stats.currentStreak === 1
                ? '1 day streak'
                : `${stats.currentStreak} days streak`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg gradient-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{Math.round(stats.completionRate)}%</div>
            <p className="text-sm text-muted-foreground mt-1">Goals achieved</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-lg gradient-surface">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
              Weekly Progress
            </CardTitle>
            <CardDescription>
              Your practice activity over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={dailyData} color="#818cf8" />
          </CardContent>
        </Card>
      </div>

      {/* Most Practiced Mantras */}
      <Card className="border-0 shadow-lg gradient-surface">
        <CardHeader>
          <CardTitle className="text-lg">Most Practiced Mantras</CardTitle>
          <CardDescription>
            Your top practices by repetition count
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mostPracticed.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No mantras practiced yet</p>
          ) : (
            <div className="space-y-4">
              {mostPracticed.map((mantra, index) => (
                <div key={mantra.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{mantra.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-xs">{mantra.text}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{mantra.totalCount}</p>
                    <p className="text-sm text-muted-foreground">repetitions</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Achievements */}
      <Card className="border-0 shadow-lg gradient-surface">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Achievements
          </CardTitle>
          <CardDescription>
            Celebrate your mindfulness milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Achievements />
        </CardContent>
      </Card>
    </div>
  )
}

