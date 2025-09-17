'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'

interface CreateMantraDialogProps {
  onCreate?: (mantra: {
    title: string
    text: string
    goal: number
  }) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  id?: string
}

export function CreateMantraDialog({ onCreate, open, onOpenChange, id }: CreateMantraDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen
  
  const [title, setTitle] = React.useState('')
  const [text, setText] = React.useState('')
  const [goal, setGoal] = React.useState([108])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onCreate) {
      onCreate({
        title,
        text,
        goal: goal[0],
      })
    }
    setIsOpen(false)
    setTitle('')
    setText('')
    setGoal([108])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
          {...(id && { id })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Mantra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Mantra</DialogTitle>
            <DialogDescription>
              Add a meaningful phrase or intention to focus on during your practice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Gratitude"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="text">Mantra Text</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., I am grateful for this new day"
                className="min-h-[80px]"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="goal">
                Daily Goal: {goal[0]} repetitions
              </Label>
              <Slider
                id="goal"
                min={1}
                max={1008}
                step={1}
                value={goal}
                onValueChange={setGoal}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>108</span>
                <span>1008</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Mantra</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}