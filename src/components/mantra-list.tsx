'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mantra } from '@/lib/types'
import { addSession, getTodaysSessions, getTotalSessions } from '@/lib/mantra-service'
import { Play, RotateCcw, Target } from 'lucide-react'

interface MantraListProps {
  mantras: Mantra[]
  onUpdate: (updatedMantras: Mantra[]) => void
}

export function MantraList({ mantras, onUpdate }: MantraListProps) {
  const [sessions, setSessions] = useState<Record<string, number>>({})

  // Initialize session counts
  useEffect(() => {
    const initialSessions: Record<string, number> = {}
    mantras.forEach(mantra => {
      const todaySessions = getTodaysSessions(mantra.id)
      const todayCount = todaySessions.reduce((sum, session) => sum + session.count, 0)
      initialSessions[mantra.id] = todayCount
    })
    setSessions(initialSessions)
  }, [mantras])

  const handleAddRepetition = (mantraId: string) => {
    // Add session to storage
    addSession({
      mantraId,
      count: 1,
      date: new Date(),
    })
    
    // Update local state
    setSessions(prev => ({
      ...prev,
      [mantraId]: (prev[mantraId] || 0) + 1
    }))
    
    // Notify parent to refresh data
    setTimeout(() => {
      onUpdate(mantras)
    }, 100)
  }

  const handleResetRepetitions = (mantraId: string) => {
    setSessions(prev => ({
      ...prev,
      [mantraId]: 0
    }))
  }

  if (mantras.length === 0) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Your Mantras</CardTitle>
          <CardDescription>
            You haven't created any mantras yet. Start by adding your first mantra.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            No mantras found
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Your Mantras</CardTitle>
        <CardDescription>
          Track your progress and continue your practice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {mantras.map(mantra => {
          const todayCount = sessions[mantra.id] || 0
          const totalCount = getTotalSessions(mantra.id)
          const progress = mantra.goal > 0 ? Math.min(100, (todayCount / mantra.goal) * 100) : 0
          
          return (
            <div key={mantra.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{mantra.title}</h3>
                  <p className="text-muted-foreground text-sm">{mantra.text}</p>
                </div>
                <Badge variant="secondary">{mantra.category}</Badge>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Today: {todayCount} / {mantra.goal}</span>
                  <span>Total: {totalCount}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleAddRepetition(mantra.id)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Add Repetition
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleResetRepetitions(mantra.id)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}