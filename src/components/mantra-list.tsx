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
import { Play, RotateCcw, Target, AlertTriangle, Edit, Trash2, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditMantraDialog } from '@/components/edit-mantra-dialog'
import { toast } from 'sonner'

interface MantraListProps {
  mantras: Mantra[]
  onUpdate: (updatedMantras: Mantra[]) => void
}

export function MantraList({ mantras, onUpdate }: MantraListProps) {
  const [sessions, setSessions] = useState<Record<string, number>>({})
  const [resetMantraId, setResetMantraId] = useState<string | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [editMantra, setEditMantra] = useState<Mantra | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [deleteMantraId, setDeleteMantraId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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

  const handleResetClick = (mantraId: string) => {
    setResetMantraId(mantraId)
    setShowResetDialog(true)
  }

  const handleResetConfirm = () => {
    if (!resetMantraId) return
    
    // Reset today's count
    setSessions(prev => ({
      ...prev,
      [resetMantraId]: 0
    }))
    
    // For a full reset, we would remove all sessions for this mantra
    // But we're only resetting today's count for safety
    // If you want to implement a full reset, we can add that as a separate feature
    
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
    setSessions(prev => ({
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

  // Edit mantra handlers
  const handleEditClick = (mantra: Mantra) => {
    setEditMantra(mantra)
    setShowEditDialog(true)
  }

  const handleMantraUpdated = () => {
    // Refresh mantras list
    onUpdate(mantras)
    setShowEditDialog(false)
    setEditMantra(null)
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
        setSessions(prev => {
          const newSessions = { ...prev }
          delete newSessions[deleteMantraId]
          return newSessions
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
      <Card className="border-0 shadow-xl">
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
                        <DropdownMenuItem onClick={() => handleEditClick(mantra)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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

      {/* Edit Mantra Dialog */}
      {editMantra && (
        <EditMantraDialog
          mantra={editMantra}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onMantraUpdated={handleMantraUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Mantra
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mantra? This will also delete all associated progress and sessions.
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