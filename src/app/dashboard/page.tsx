'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Dashboard } from '@/components/dashboard'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your progress and insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </header>

        {/* Dashboard */}
        <Dashboard />

        {/* Insights Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
              Practice Insights
            </CardTitle>
            <CardDescription>
              Tips to enhance your mindfulness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <h3 className="font-semibold text-indigo-700 dark:text-indigo-300">Consistency Matters</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                  Even 5 minutes daily is better than longer, irregular sessions.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">Set Realistic Goals</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  Start with smaller goals and gradually increase them.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <h3 className="font-semibold text-amber-700 dark:text-amber-300">Celebrate Progress</h3>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  Acknowledge milestones to stay motivated on your journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}