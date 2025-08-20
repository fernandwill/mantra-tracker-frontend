import { Mantra, MantraSession } from '@/lib/types'

const MANTRA_STORAGE_KEY = 'mantra-tracker-mantras'
const SESSION_STORAGE_KEY = 'mantra-tracker-sessions'

// Mantra functions
export function getMantras(): Mantra[] {
  try {
    const stored = localStorage.getItem(MANTRA_STORAGE_KEY)
    return stored ? JSON.parse(stored, dateReviver) : []
  } catch (error) {
    console.error('Error loading mantras from localStorage:', error)
    return []
  }
}

export function saveMantras(mantras: Mantra[]): void {
  try {
    localStorage.setItem(MANTRA_STORAGE_KEY, JSON.stringify(mantras))
  } catch (error) {
    console.error('Error saving mantras to localStorage:', error)
  }
}

export function addMantra(mantra: Omit<Mantra, 'id' | 'createdAt' | 'updatedAt'>): Mantra {
  const mantras = getMantras()
  const newMantra: Mantra = {
    id: generateId(),
    ...mantra,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mantras.push(newMantra)
  saveMantras(mantras)
  return newMantra
}

export function updateMantra(id: string, updates: Partial<Mantra>): Mantra | null {
  const mantras = getMantras()
  const index = mantras.findIndex(mantra => mantra.id === id)
  if (index === -1) return null
  
  const updatedMantra = {
    ...mantras[index],
    ...updates,
    updatedAt: new Date(),
  }
  mantras[index] = updatedMantra
  saveMantras(mantras)
  return updatedMantra
}

export function deleteMantra(id: string): boolean {
  const mantras = getMantras()
  const initialLength = mantras.length
  const filtered = mantras.filter(mantra => mantra.id !== id)
  saveMantras(filtered)
  return filtered.length !== initialLength
}

// Session functions
export function getSessions(): MantraSession[] {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored, dateReviver) : []
  } catch (error) {
    console.error('Error loading sessions from localStorage:', error)
    return []
  }
}

export function saveSessions(sessions: MantraSession[]): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving sessions to localStorage:', error)
  }
}

export function addSession(session: Omit<MantraSession, 'id'>): MantraSession {
  const sessions = getSessions()
  const newSession: MantraSession = {
    id: generateId(),
    ...session,
  }
  sessions.push(newSession)
  saveSessions(sessions)
  return newSession
}

export function getTodaysSessions(mantraId: string): MantraSession[] {
  const sessions = getSessions()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return sessions.filter(session => {
    if (session.mantraId !== mantraId) return false
    const sessionDate = new Date(session.date)
    sessionDate.setHours(0, 0, 0, 0)
    return sessionDate.getTime() === today.getTime()
  })
}

export function getTotalSessions(mantraId: string): number {
  const sessions = getSessions()
  return sessions
    .filter(session => session.mantraId === mantraId)
    .reduce((total, session) => total + session.count, 0)
}

export function getCurrentStreak(): number {
  const sessions = getSessions()
  if (sessions.length === 0) return 0
  
  // Sort sessions by date descending
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  // Create a set of dates with sessions for quick lookup
  const sessionDates = new Set<string>()
  sortedSessions.forEach(session => {
    const date = new Date(session.date)
    date.setHours(0, 0, 0, 0)
    sessionDates.add(date.toISOString().split('T')[0])
  })
  
  // Count consecutive days
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    if (sessionDates.has(dateStr)) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function dateReviver(key: string, value: any): any {
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
  if (typeof value === 'string' && dateRegex.test(value)) {
    return new Date(value)
  }
  return value
}