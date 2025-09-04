import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

// Type for JWT payload
interface JWTPayload {
  userId: string
  email: string
}

// Type for database row
interface MantraRow {
  id: string
  user_id: string
  title: string
  text: string
  goal: number
  created_at: string
  updated_at: string
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Helper to get user ID from authorization header
function getUserIdFromAuth(request: NextRequest): string {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Not authenticated')
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload
    return decoded.userId
  } catch {
    throw new Error('Invalid token')
  }
}

// GET /api/mantras - Get all mantras for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromAuth(request)

    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT id, user_id, title, text, goal, created_at, updated_at
        FROM mantras 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId])

      const mantras = result.rows.map((row: MantraRow) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        text: row.text,
        goal: row.goal,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      return NextResponse.json(mantras)
    } finally {
      client.release()
    }
  } catch (_error) {
    console.error('Get mantras error:', _error)
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Internal server error' },
      { status: _error instanceof Error && _error.message.includes('authenticated') ? 401 : 500 }
    )
  }
}

// POST /api/mantras - Create a new mantra
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromAuth(request)
    const { title, text, goal } = await request.json()

    if (!title || !text || goal === undefined) {
      return NextResponse.json(
        { error: 'Title, text, and goal are required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(`
        INSERT INTO mantras (user_id, title, text, goal, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, user_id, title, text, goal, created_at, updated_at
      `, [userId, title, text, goal])

      const mantra = result.rows[0]
      return NextResponse.json({
        id: mantra.id,
        userId: mantra.user_id,
        title: mantra.title,
        text: mantra.text,
        goal: mantra.goal,
        createdAt: mantra.created_at,
        updatedAt: mantra.updated_at
      })
    } finally {
      client.release()
    }
  } catch (_error) {
    console.error('Create mantra error:', _error)
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Internal server error' },
      { status: _error instanceof Error && _error.message.includes('authenticated') ? 401 : 500 }
    )
  }
}