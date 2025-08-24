import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

// Type for JWT payload
interface JWTPayload {
  userId: string
  email: string
}

// Type for database rows
interface DateRow {
  date: string
}

interface DailyActivityRow {
  date: string
  total_count: string
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
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// GET /api/stats - Get statistics for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromAuth(request)

    const client = await pool.connect()
    try {
      // Get total repetitions
      const totalRepsResult = await client.query(`
        SELECT COALESCE(SUM(count), 0) as total_repetitions
        FROM mantra_sessions 
        WHERE user_id = $1
      `, [userId])
      const totalRepetitions = parseInt(totalRepsResult.rows[0].total_repetitions)

      // Get unique days practiced
      const uniqueDaysResult = await client.query(`
        SELECT COUNT(DISTINCT date) as unique_days
        FROM mantra_sessions 
        WHERE user_id = $1
      `, [userId])
      const uniqueDaysPracticed = parseInt(uniqueDaysResult.rows[0].unique_days)

      // Calculate current streak
      const streakResult = await client.query(`
        SELECT date
        FROM mantra_sessions 
        WHERE user_id = $1
        GROUP BY date
        ORDER BY date DESC
      `, [userId])

      let currentStreak = 0
      const today = new Date()
      const practiceDates = streakResult.rows.map((row: DateRow) => new Date(row.date))

      for (let i = 0; i < practiceDates.length; i++) {
        const date = practiceDates[i]
        const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === i) {
          currentStreak++
        } else {
          break
        }
      }

      // Get daily activity for the last 30 days
      const dailyActivityResult = await client.query(`
        SELECT 
          date,
          SUM(count) as total_count
        FROM mantra_sessions 
        WHERE user_id = $1 
          AND date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date ASC
      `, [userId])

      // Create daily activity array with all 30 days
      const dailyActivity = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]
        
        const dayData = dailyActivityResult.rows.find((row: DailyActivityRow) => 
          new Date(row.date).toISOString().split('T')[0] === dateString
        )
        
        dailyActivity.push({
          date: dateString,
          count: dayData ? parseInt(dayData.total_count) : 0
        })
      }

      return NextResponse.json({
        totalRepetitions,
        uniqueDaysPracticed,
        currentStreak,
        dailyActivity
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('authenticated') ? 401 : 500 }
    )
  }
}