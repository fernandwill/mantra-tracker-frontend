'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { calculateMantraStats, getMostPracticedMantras } from '@/lib/stats-service'
import { MantraStats } from '@/lib/stats-service'
import { SimpleBarChart } from '@/components/simple-bar-chart'
import { Achievements } from '@/components/achievements'
import { Target, Clock, TrendingUp, CheckCircle, Calendar, Trophy } from 'lucide-react'

export function Dashboard() {
  const [stats, setStats] = useState<MantraStats | null>(null)
  const [mostPracticed, setMostPracticed] = useState<any[]>([])

  useEffect(() => {
    refreshStats()
  }, [])

  const refreshStats = () => {
    setStats(calculateMantraStats())
    setMostPracticed(getMostPracticedMantras(5))
  }

  if (!stats) {
    return <div>Loading...</div>
  }

  // Prepare data for charts
  const dailyData = stats.dailyProgress.map(item => ({
    name: item.date.toLocaleDateString('en-US', { weekday: 'short' }),
    value: item.count
  }))

  const categoryData = stats.categoryBreakdown.map(item => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.count
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Total Mantras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalMantras}</div>
            <p className="text-sm text-muted-foreground mt-1">Active practices</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalSessions}</div>
            <p className="text-sm text-muted-foreground mt-1">Repetitions tracked</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.currentStreak}</div>
            <p className="text-sm text-muted-foreground mt-1">Days in a row</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
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

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Target className="w-5 h-5 mr-2 text-emerald-500" />
              Category Distribution
            </CardTitle>
            <CardDescription>
              How your practice is distributed across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={categoryData} color="#34d399" />
          </CardContent>
        </Card>
      </div>

      {/* Most Practiced Mantras */}
      <Card className="border-0 shadow-lg">
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
                      <p className="text-sm text-muted-foreground">{mantra.category}</p>
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

      {/* Completion Progress */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Goal Progress</CardTitle>
          <CardDescription>
            How close you are to completing your mantra goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.categoryBreakdown.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{category.category}</span>
                <span>{Math.round(category.completionRate)}% completed</span>
              </div>
              <Progress value={category.completionRate} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-0 shadow-lg">
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