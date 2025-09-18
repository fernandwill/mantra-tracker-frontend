'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Mantra } from '@/lib/types'
import { addSession, getTodaysSessions, getTotalSessions, saveSessions, getSessions, deleteMantra } from '@/lib/mantra-service'
import { Play, RotateCcw, Target, AlertTriangle, Trash2, MoreVertical, Check, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { toast } from 'sonner'

interface MantraListProps {
  mantras: Mantra[]
  onUpdate: (updatedMantras: Mantra[]) => void
}

export function MantraList({ mantras, onUpdate }: MantraListProps) {
  const [repetitions, setRepetitions] = useState<Record<string, number>>({})
  const [resetMantraId, setResetMantraId] = useState<string | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [deleteMantraId, setDeleteMantraId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [touchedButton, setTouchedButton] = useState<string | null>(null)

  // Initialize repetition counts
  useEffect(() => {
    const initialRepetitions: Record<string, number> = {}
    mantras.forEach(mantra => {
      const todayRepetitions = getTodaysSessions(mantra.id)
      const todayCount = todayRepetitions.reduce((sum, session) => sum + session.count, 0)
      initialRepetitions[mantra.id] = todayCount
    })
    setRepetitions(initialRepetitions)
  }, [mantras])

  const handleAddRepetition = (mantraId: string) => {
    // Add session to storage
    addSession({
      mantraId,
      count: 1,
      date: new Date(),
    })
    
    // Update local state
    setRepetitions(prev => ({
      ...prev,
      [mantraId]: (prev[mantraId] || 0) + 1
    }))
    
    // Notify parent to refresh data
    setTimeout(() => {
      onUpdate(mantras)
    }, 100)
  }

  const handleTouchStart = (mantraId: string) => {
    setTouchedButton(mantraId)
  }

  const handleTouchEnd = () => {
    setTimeout(() => setTouchedButton(null), 150) // Keep feedback for 150ms
  }

  const handleResetClick = (mantraId: string) => {
    setResetMantraId(mantraId)
    setShowResetDialog(true)
  }

  const handleResetConfirm = () => {
    if (!resetMantraId) return
    
    // Get today's date for comparison
    const today = new Date()
    const todayDateString = today.toDateString()
    
    // Get all sessions and filter out today's sessions for this mantra
    const allSessions = getSessions()
    const filteredSessions = allSessions.filter(session => {
      const sessionDate = new Date(session.date)
      const sessionDateString = sessionDate.toDateString()
      
      // Keep the session if it's either:
      // 1. Not for this mantra, OR
      // 2. For this mantra but not from today
      return session.mantraId !== resetMantraId || sessionDateString !== todayDateString
    })
    
    // Save the filtered sessions back to storage
    saveSessions(filteredSessions)
    
    // Reset today's count in local state
    setRepetitions(prev => ({
      ...prev,
      [resetMantraId]: 0
    }))
    
    // Notify parent to refresh data
    setTimeout(() => {
      onUpdate(mantras)
    }, 100)
    
    setShowResetDialog(false)
    setResetMantraId(null)
  }

  const handleResetCancel = () => {
    setShowResetDialog(false)
    setResetMantraId(null)
  }

  // Function to reset all progress for a mantra (with confirmation)
  const handleFullReset = () => {
    if (!resetMantraId) return
    
    // Get all sessions and filter out those for this mantra
    const allSessions = getSessions()
    const filteredSessions = allSessions.filter(session => session.mantraId !== resetMantraId)
    saveSessions(filteredSessions)
    
    // Reset today's count
    setRepetitions(prev => ({
      ...prev,
      [resetMantraId]: 0
    }))
    
    // Notify parent to refresh data
    setTimeout(() => {
      onUpdate(mantras)
    }, 100)
    
    setShowResetDialog(false)
    setResetMantraId(null)
  }



  // Delete mantra handlers
  const handleDeleteClick = (mantraId: string) => {
    setDeleteMantraId(mantraId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    if (!deleteMantraId) return
    
    try {
      // Delete the mantra
      const success = deleteMantra(deleteMantraId)
      
      if (success) {
        // Also delete all sessions for this mantra
        const allSessions = getSessions()
        const filteredSessions = allSessions.filter(session => session.mantraId !== deleteMantraId)
        saveSessions(filteredSessions)
        
        // Update local state
        setRepetitions(prev => {
          const newRepetitions = { ...prev }
          delete newRepetitions[deleteMantraId]
          return newRepetitions
        })
        
        toast.success('Mantra deleted successfully')
        onUpdate(mantras.filter(m => m.id !== deleteMantraId))
      } else {
        toast.error('Failed to delete mantra')
      }
    } catch (error) {
      console.error('Error deleting mantra:', error)
      toast.error('Something went wrong')
    }
    
    setShowDeleteDialog(false)
    setDeleteMantraId(null)
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setDeleteMantraId(null)
  }

  if (mantras.length === 0) {
    return (
      <Card className="border-0 shadow-xl gradient-surface">
        <CardHeader>
          <CardTitle className="text-xl">Your Mantras</CardTitle>
          <CardDescription>
            You haven&apos;t created any mantras yet. Start by adding your first mantra.
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
    <>
      <Card className="border-0 shadow-xl gradient-surface">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">Your Mantras</CardTitle>
            <CardDescription>
              Track your progress and continue your practice
            </CardDescription>
          </div>
          <Button 
            onClick={() => document.getElementById('create-mantra-button')?.click()}
            className="gradient-accent-bg text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Mantra
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {mantras.map(mantra => {
            const todayCount = repetitions[mantra.id] || 0
            const totalCount = getTotalSessions(mantra.id)
            const progress = mantra.goal > 0 ? Math.min(100, (todayCount / mantra.goal) * 100) : 0
            
            return (
              <div key={mantra.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{mantra.title}</h3>
                    <p className="text-muted-foreground text-sm">{mantra.text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">

                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(mantra.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      Today: {todayCount} / {mantra.goal}
                      {todayCount >= mantra.goal && (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </span>
                    <span>Total: {totalCount}</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-2 ${todayCount >= mantra.goal ? '[&>div]:bg-green-500' : ''}`} 
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAddRepetition(mantra.id)}
                    onTouchStart={() => handleTouchStart(mantra.id)}
                    onTouchEnd={handleTouchEnd}
                    className={`flex-1 transition-all duration-150 ${
                      touchedButton === mantra.id 
                        ? 'transform scale-95 bg-primary/90 shadow-sm' 
                        : 'active:scale-95 active:bg-primary/90'
                    }`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Add Repetition
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleResetClick(mantra.id)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirm Reset
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your progress for this mantra. 
              <span className="font-semibold"> This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleResetCancel}>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={handleResetConfirm}>
              Reset Today Only
            </Button>
            <Button variant="destructive" onClick={handleFullReset}>
              Reset All Progress
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this mantra and all its session data. 
              <span className="font-semibold"> This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Mantra
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

