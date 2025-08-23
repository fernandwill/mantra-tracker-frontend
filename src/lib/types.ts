export interface Mantra {
  id: string
  title: string
  text: string
  goal: number
  createdAt: Date
  updatedAt: Date
}

export interface MantraSession {
  id: string
  mantraId: string
  count: number
  date: Date
}

export interface MantraWithProgress extends Mantra {
  currentCount: number
  completed: boolean
}