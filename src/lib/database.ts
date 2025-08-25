import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool() {
  if (!pool) {
    // For local development, use SQLite or in-memory storage
    // For production, use the connection string
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isProduction && process.env.POSTGRES_URL) {
      pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      })
    } else {
      // For development, we'll use a local file-based approach
      // Since we can't easily run PostgreSQL locally on Windows
      pool = null
    }
  }
  return pool
}

export async function query(text: string, params?: unknown[]) {
  const client = getPool()
  if (!client) {
    throw new Error('Database not configured for local development')
  }
  
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Simple in-memory storage for development
const memoryStore: {
  users: Array<{
    id: string
    email: string
    password_hash: string
    name: string
    created_at: string
  }>
  mantras: Array<{
    id: string
    user_id: string
    title: string
    text: string
    goal: number
    created_at: string
  }>
  sessions: Array<{
    id: string
    user_id: string
    mantra_id: string
    count: number
    date: string
    created_at: string
  }>
} = {
  users: [],
  mantras: [],
  sessions: []
}

export function getMemoryStore() {
  return memoryStore
}

export function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}