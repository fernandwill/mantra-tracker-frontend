import { Mantra, MantraSession } from '@/lib/types'
import { mantraApi, sessionApi } from '@/lib/api-service'

// Configuration to switch between API and localStorage
const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true' || process.env.NODE_ENV === 'production'

// LocalStorage fallback functions (from original mantra-service.ts)
const MANTRA_STORAGE_KEY = 'mantra-tracker-mantras'
const SESSION_STORAGE_KEY = 'mantra-tracker-sessions'

function dateReviver(key: string, value: unknown): unknown {
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
  if (typeof value === 'string' && dateRegex.test(value)) {
    return new Date(value)
  }
  return value
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// LocalStorage functions
const localStorage_getMantras = (): Mantra[] => {
  try {
    const stored = localStorage.getItem(MANTRA_STORAGE_KEY)
    return stored ? JSON.parse(stored, dateReviver) : []
  } catch (error) {
    console.error('Error loading mantras from localStorage:', error)
    return []
  }
}

const localStorage_saveMantras = (mantras: Mantra[]): void => {
  try {
    localStorage.setItem(MANTRA_STORAGE_KEY, JSON.stringify(mantras))
  } catch (error) {
    console.error('Error saving mantras to localStorage:', error)
  }
}

const localStorage_getSessions = (): MantraSession[] => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored, dateReviver) : []
  } catch (error) {
    console.error('Error loading sessions from localStorage:', error)
    return []
  }
}

const localStorage_saveSessions = (sessions: MantraSession[]): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving sessions to localStorage:', error)
  }
}

// Hybrid service that can use either API or localStorage
export const hybridMantraService = {
  async getMantras(): Promise<Mantra[]> {
    if (USE_API) {
      try {
        return await mantraApi.getMantras()
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error)
        return localStorage_getMantras()
      }
    }
    return localStorage_getMantras()
  },

  async addMantra(mantra: Omit<Mantra, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Mantra> {
    if (USE_API) {
      try {
        return await mantraApi.createMantra(mantra)
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error)
        // Fallback to localStorage
        const mantras = localStorage_getMantras()
        const newMantra: Mantra = {
          id: generateId(),
          ...mantra,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mantras.push(newMantra)
        localStorage_saveMantras(mantras)
        return newMantra
      }
    }
    
    // localStorage implementation
    const mantras = localStorage_getMantras()
    const newMantra: Mantra = {
      id: generateId(),
      ...mantra,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mantras.push(newMantra)
    localStorage_saveMantras(mantras)
    return newMantra
  },

  async updateMantra(id: string, updates: Partial<Mantra>): Promise<Mantra | null> {
    if (USE_API) {
      try {
        return await mantraApi.updateMantra(id, updates)
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error)
        // Fallback to localStorage
        const mantras = localStorage_getMantras()
        const index = mantras.findIndex(mantra => mantra.id === id)
        if (index === -1) return null
        
        const updatedMantra = {
          ...mantras[index],
          ...updates,
          updatedAt: new Date(),
        }
        mantras[index] = updatedMantra
        localStorage_saveMantras(mantras)
        return updatedMantra
      }
    }

    // localStorage implementation
    const mantras = localStorage_getMantras()
    const index = mantras.findIndex(mantra => mantra.id === id)
    if (index === -1) return null
    
    const updatedMantra = {
      ...mantras[index],
      ...updates,
      updatedAt: new Date(),
    }
    mantras[index] = updatedMantra
    localStorage_saveMantras(mantras)
    return updatedMantra
  },

  async deleteMantra(id: string): Promise<boolean> {
    if (USE_API) {
      try {
        await mantraApi.deleteMantra(id)
        return true
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error)
        // Fallback to localStorage
        const mantras = localStorage_getMantras()
        const initialLength = mantras.length
        const filtered = mantras.filter(mantra => mantra.id !== id)
        localStorage_saveMantras(filtered)
        return filtered.length !== initialLength
      }
    }

    // localStorage implementation
    const mantras = localStorage_getMantras()
    const initialLength = mantras.length
    const filtered = mantras.filter(mantra => mantra.id !== id)
    localStorage_saveMantras(filtered)
    return filtered.length !== initialLength
  },

  async getSessions(): Promise<MantraSession[]> {
    if (USE_API) {
      try {
        return await sessionApi.getSessions()
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error)
        return localStorage_getSessions()
      }
    }
    return localStorage_getSessions()
  },

  async addSession(session: Omit<MantraSession, 'id' | 'userId'>): Promise<MantraSession> {
    if (USE_API) {
      try {
        return await sessionApi.createSession(session)
      } catch (error) {
        console.warn('API failed, falling back to localStorage:', error)
        // Fallback to localStorage
        const sessions = localStorage_getSessions()
        const newSession: MantraSession = {
          id: generateId(),
          ...session,
        }
        sessions.push(newSession)
        localStorage_saveSessions(sessions)
        return newSession
      }
    }

    // localStorage implementation
    const sessions = localStorage_getSessions()
    const newSession: MantraSession = {
      id: generateId(),
      ...session,
    }
    sessions.push(newSession)
    localStorage_saveSessions(sessions)
    return newSession
  }
}

// Export legacy functions for backward compatibility
export function getMantras(): Mantra[] {
  return localStorage_getMantras()
}

export function saveMantras(mantras: Mantra[]): void {
  localStorage_saveMantras(mantras)
}

export function addMantra(mantra: Omit<Mantra, 'id' | 'createdAt' | 'updatedAt'>): Mantra {
  const mantras = localStorage_getMantras()
  const newMantra: Mantra = {
    id: generateId(),
    ...mantra,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mantras.push(newMantra)
  localStorage_saveMantras(mantras)
  return newMantra
}

export function updateMantra(id: string, updates: Partial<Mantra>): Mantra | null {
  const mantras = localStorage_getMantras()
  const index = mantras.findIndex(mantra => mantra.id === id)
  if (index === -1) return null
  
  const updatedMantra = {
    ...mantras[index],
    ...updates,
    updatedAt: new Date(),
  }
  mantras[index] = updatedMantra
  localStorage_saveMantras(mantras)
  return updatedMantra
}

export function deleteMantra(id: string): boolean {
  const mantras = localStorage_getMantras()
  const initialLength = mantras.length
  const filtered = mantras.filter(mantra => mantra.id !== id)
  localStorage_saveMantras(filtered)
  return filtered.length !== initialLength
}

export function getSessions(): MantraSession[] {
  return localStorage_getSessions()
}

export function saveSessions(sessions: MantraSession[]): void {
  localStorage_saveSessions(sessions)
}

export function addSession(session: Omit<MantraSession, 'id'>): MantraSession {
  const sessions = localStorage_getSessions()
  const newSession: MantraSession = {
    id: generateId(),
    ...session,
  }
  sessions.push(newSession)
  localStorage_saveSessions(sessions)
  return newSession
}

export function getTodaysSessions(mantraId: string): MantraSession[] {
  const sessions = localStorage_getSessions()
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
  const sessions = localStorage_getSessions()
  return sessions
    .filter(session => session.mantraId === mantraId)
    .reduce((total, session) => total + session.count, 0)
}

export function getCurrentStreak(): number {
  const sessions = localStorage_getSessions()
  if (sessions.length === 0) return 0
  
  // Sort sessions by date descending
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let streak = 0
  const currentDate = new Date()
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