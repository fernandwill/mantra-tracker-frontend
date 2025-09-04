import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

// Type for JWT payload
interface JWTPayload {
  userId: string
  email: string
}

// Type for database row
interface SessionRow {
  id: string
  user_id: string
  mantra_id: string
  count: number
  date: string
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

// GET /api/sessions - Get all sessions for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromAuth(request)

    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT id, user_id, mantra_id, count, date
        FROM mantra_sessions 
        WHERE user_id = $1 
        ORDER BY date DESC
      `, [userId])

      const sessions = result.rows.map((row: SessionRow) => ({
        id: row.id,
        userId: row.user_id,
        mantraId: row.mantra_id,
        count: row.count,
        date: row.date
      }))

      return NextResponse.json(sessions)
    } finally {
      client.release()
    }
  } catch (_error) {
    console.error('Get sessions error:', _error)
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Internal server error' },
      { status: _error instanceof Error && _error.message.includes('authenticated') ? 401 : 500 }
    )
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromAuth(request)
    const { mantraId, count, date } = await request.json()

    if (!mantraId || count === undefined) {
      return NextResponse.json(
        { error: 'MantraId and count are required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      // Convert date string to proper format
      const sessionDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

      const result = await client.query(`
        INSERT INTO mantra_sessions (user_id, mantra_id, count, date)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, mantra_id, count, date
      `, [userId, mantraId, count, sessionDate])

      const session = result.rows[0]
      return NextResponse.json({
        id: session.id,
        userId: session.user_id,
        mantraId: session.mantra_id,
        count: session.count,
        date: session.date
      })
    } finally {
      client.release()
    }
  } catch (_error) {
    console.error('Create session error:', _error)
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : 'Internal server error' },
      { status: _error instanceof Error && _error.message.includes('authenticated') ? 401 : 500 }
    )
  }
}