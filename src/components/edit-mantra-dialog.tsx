'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Mantra } from '@/lib/types'
import { updateMantra } from '@/lib/mantra-service'
import { toast } from 'sonner'

interface EditMantraDialogProps {
  mantra: Mantra | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMantraUpdated: () => void
}

const categories = [
  'Healing',
  'Abundance',
  'Protection',
  'Love',
  'Peace',
  'Wisdom',
  'Gratitude',
  'Strength',
  'Other'
]

export function EditMantraDialog({ mantra, open, onOpenChange, onMantraUpdated }: EditMantraDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    category: '',
    goal: 108
  })
  const [isLoading, setIsLoading] = useState(false)

  // Update form data when mantra changes
  useEffect(() => {
    if (mantra) {
      setFormData({
        title: mantra.title,
        text: mantra.text,
        category: mantra.category,
        goal: mantra.goal
      })
    }
  }, [mantra])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!mantra) return
    
    if (!formData.title.trim() || !formData.text.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const updatedMantra = updateMantra(mantra.id, {
        title: formData.title.trim(),
        text: formData.text.trim(),
        category: formData.category,
        goal: formData.goal
      })

      if (updatedMantra) {
        toast.success('Mantra updated successfully!')
        onMantraUpdated()
        onOpenChange(false)
      } else {
        toast.error('Failed to update mantra')
      }
    } catch (error) {
      console.error('Error updating mantra:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (mantra) {
      setFormData({
        title: mantra.title,
        text: mantra.text,
        category: mantra.category,
        goal: mantra.goal
      })
    }
    onOpenChange(false)
  }

  if (!mantra) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Mantra</DialogTitle>
          <DialogDescription>
            Update your mantra details and practice goals.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Om Mani Padme Hum"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-text">Mantra Text *</Label>
            <Textarea
              id="edit-text"
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              placeholder="Enter the full mantra text..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-goal">Daily Goal</Label>
            <Input
              id="edit-goal"
              type="number"
              min="1"
              max="1000"
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Number of repetitions you want to complete daily
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Mantra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}