'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { CreateMantraDialog } from '@/components/create-mantra-dialog'
import { MantraList } from '@/components/mantra-list'
import { UserProfileDropdown } from '@/components/user-profile-dropdown'
import { useAuth } from '@/lib/auth-context'
import { Download, Upload, Cloud, Sparkles, Target, Clock, TrendingUp, BarChart3, LogIn } from 'lucide-react'
import { getMantras, addMantra, getCurrentStreak, getTotalSessions } from '@/lib/mantra-service'
import { Mantra } from '@/lib/types'

export default function Home() {
  const [mantras, setMantras] = useState<Mantra[]>([])
  const [streak, setStreak] = useState(0)
  const [totalRepetitions, setTotalRepetitions] = useState(0)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      refreshData()
    }
  }, [user])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  const refreshData = () => {
    const updatedMantras = getMantras()
    setMantras(updatedMantras)
    setStreak(getCurrentStreak())
    
    // Calculate total repetitions across all mantras
    const total = updatedMantras.reduce((sum, mantra) => {
      return sum + getTotalSessions(mantra.id)
    }, 0)
    setTotalRepetitions(total)
  }

  const handleCreateMantra = (mantraData: Omit<Mantra, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMantra = addMantra(mantraData)
    setMantras([...mantras, newMantra])
    refreshData()
  }

  const handleUpdateMantras = (updatedMantras: Mantra[]) => {
    setMantras(updatedMantras)
    refreshData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <header className="flex justify-between items-start mb-12">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mantra Tracker
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Cultivate mindfulness and track your spiritual journey with intention and grace
            </p>
            {user && (
              <p className="mt-2 text-sm text-muted-foreground">
                Welcome back, {user.name}!
              </p>
            )}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <UserProfileDropdown />
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Active Mantras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{mantras.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {mantras.length === 0 ? 'Start your journey' : 
                 mantras.length === 1 ? '1 active mantra' : 
                 `${mantras.length} active mantras`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Total Repetitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalRepetitions}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalRepetitions === 0 ? 'Begin today' : 
                 totalRepetitions === 1 ? '1 repetition' : 
                 `${totalRepetitions} repetitions`}
              </p>
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
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{streak}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {streak === 0 ? 'Days in a row' : 
                 streak === 1 ? '1 day streak' : 
                 `${streak} days streak`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Begin your practice or manage your mantras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <CreateMantraDialog onCreate={handleCreateMantra} />
              
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-2 hover:bg-muted/50"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 hover:bg-muted/50"
                onClick={() => console.log('Export')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 hover:bg-muted/50"
                onClick={() => console.log('Import')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 hover:bg-muted/50"
                onClick={() => console.log('Google Drive')}
              >
                <Cloud className="w-4 h-4 mr-2" />
                Cloud Sync
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mantra List */}
        <MantraList mantras={mantras} onUpdate={handleUpdateMantras} />

        {/* Getting Started */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              Your Journey Begins
            </CardTitle>
            <CardDescription>
              Start by creating your first mantra. Each repetition brings you closer to inner peace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Create Your Mantra</p>
                  <p className="text-sm text-muted-foreground">Add a meaningful phrase or intention to focus on</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Set Your Goal</p>
                  <p className="text-sm text-muted-foreground">Define how many repetitions you&apos;d like to achieve</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Track Progress</p>
                  <p className="text-sm text-muted-foreground">Watch your practice grow with beautiful visualizations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex justify-center items-center gap-4 mb-4 md:hidden">
            <ThemeToggle />
            <UserProfileDropdown />
          </div>
          <p className="text-sm text-muted-foreground">
            Your data is synced to your account. Continue your mindfulness practice.
          </p>
        </footer>
      </main>
    </div>
  )
}