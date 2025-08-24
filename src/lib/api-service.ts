import { Mantra, MantraSession } from '@/lib/types'
import { BackendStats } from '@/lib/stats-service'

// User interface for auth responses
interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthResponse {
  user: AuthUser
  token: string
}

// Configuration - Use local API routes instead of separate backend
const API_BASE_URL = ''

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }
  return response.json()
}

// Mantra API functions
export const mantraApi = {
  async getMantras(): Promise<Mantra[]> {
    const response = await fetch(`${API_BASE_URL}/api/mantras`, {
      headers: getAuthHeaders(),
    })
    const mantras = await handleResponse<Mantra[]>(response)
    return mantras.map(mantra => ({
      ...mantra,
      createdAt: new Date(mantra.createdAt),
      updatedAt: new Date(mantra.updatedAt)
    }))
  },

  async createMantra(mantraData: Omit<Mantra, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Mantra> {
    const response = await fetch(`${API_BASE_URL}/api/mantras`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mantraData),
    })
    const mantra = await handleResponse<Mantra>(response)
    return {
      ...mantra,
      createdAt: new Date(mantra.createdAt),
      updatedAt: new Date(mantra.updatedAt)
    }
  },

  async updateMantra(id: string, updates: Partial<Omit<Mantra, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Mantra> {
    const response = await fetch(`${API_BASE_URL}/api/mantras/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })
    const mantra = await handleResponse<Mantra>(response)
    return {
      ...mantra,
      createdAt: new Date(mantra.createdAt),
      updatedAt: new Date(mantra.updatedAt)
    }
  },

  async deleteMantra(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/mantras/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    await handleResponse<{ message: string }>(response)
  }
}

// Session API functions
export const sessionApi = {
  async getSessions(): Promise<MantraSession[]> {
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      headers: getAuthHeaders(),
    })
    const sessions = await handleResponse<MantraSession[]>(response)
    return sessions.map(session => ({
      ...session,
      date: new Date(session.date)
    }))
  },

  async createSession(sessionData: Omit<MantraSession, 'id' | 'userId'>): Promise<MantraSession> {
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...sessionData,
        date: sessionData.date.toISOString()
      }),
    })
    const session = await handleResponse<MantraSession>(response)
    return {
      ...session,
      date: new Date(session.date)
    }
  }
}

// Stats API function
export const statsApi = {
  async getStats(): Promise<BackendStats> {
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
      headers: getAuthHeaders(),
    })
    const rawStats = await handleResponse<BackendStats>(response)
    
    // Ensure dailyActivity dates are strings for consistency
    return {
      ...rawStats,
      dailyActivity: rawStats.dailyActivity.map(item => ({
        ...item,
        date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0]
      }))
    }
  }
}

// Auth API functions
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse<AuthResponse>(response)
  },

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    return handleResponse<AuthResponse>(response)
  }
}