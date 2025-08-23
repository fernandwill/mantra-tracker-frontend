export interface Mantra {
  id: string
  userId?: string // Optional for frontend, required for backend
  title: string
  text: string
  goal: number
  createdAt: Date
  updatedAt: Date
}

export interface MantraSession {
  id: string
  userId?: string // Optional for frontend, required for backend
  mantraId: string
  count: number
  date: Date
}

export interface MantraWithProgress extends Mantra {
  currentCount: number
  completed: boolean
}