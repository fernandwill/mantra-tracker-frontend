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
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// PUT /api/mantras/[id] - Update a mantra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromAuth(request)
    const { id } = params
    const updates = await request.json()

    const client = await pool.connect()
    try {
      // Build dynamic update query
      const fields = []
      const values = []
      let paramCount = 1

      if (updates.title !== undefined) {
        fields.push(`title = $${paramCount}`)
        values.push(updates.title)
        paramCount++
      }
      
      if (updates.text !== undefined) {
        fields.push(`text = $${paramCount}`)
        values.push(updates.text)
        paramCount++
      }
      
      if (updates.goal !== undefined) {
        fields.push(`goal = $${paramCount}`)
        values.push(updates.goal)
        paramCount++
      }

      if (fields.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        )
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`)
      values.push(id, userId)

      const result = await client.query(`
        UPDATE mantras 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING id, user_id, title, text, goal, created_at, updated_at
      `, values)

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Mantra not found' },
          { status: 404 }
        )
      }

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
  } catch (error) {
    console.error('Update mantra error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('authenticated') ? 401 : 500 }
    )
  }
}

// DELETE /api/mantras/[id] - Delete a mantra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromAuth(request)
    const { id } = params

    const client = await pool.connect()
    try {
      const result = await client.query(`
        DELETE FROM mantras 
        WHERE id = $1 AND user_id = $2
      `, [id, userId])

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Mantra not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: 'Mantra deleted successfully' })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Delete mantra error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('authenticated') ? 401 : 500 }
    )
  }
}