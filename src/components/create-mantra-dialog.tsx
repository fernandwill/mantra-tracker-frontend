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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

interface CreateMantraDialogProps {
  onCreate?: (mantra: {
    title: string
    text: string
    category: string
    goal: number
  }) => void
}

export function CreateMantraDialog({ onCreate }: CreateMantraDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [text, setText] = React.useState('')
  const [category, setCategory] = React.useState('mindfulness')
  const [goal, setGoal] = React.useState([108])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onCreate) {
      onCreate({
        title,
        text,
        category,
        goal: goal[0],
      })
    }
    setOpen(false)
    setTitle('')
    setText('')
    setCategory('mindfulness')
    setGoal([108])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="gratitude">Gratitude</SelectItem>
                  <SelectItem value="affirmation">Affirmation</SelectItem>
                  <SelectItem value="healing">Healing</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
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