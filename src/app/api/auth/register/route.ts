import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Initialize database tables on first request
async function initializeDatabase() {
  const client = await pool.connect()
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(50) DEFAULT 'email',
        provider_id VARCHAR(255),
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create mantras table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mantras (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        goal INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create mantra_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mantra_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        mantra_id UUID REFERENCES mantras(id) ON DELETE CASCADE,
        count INTEGER NOT NULL DEFAULT 1,
        date DATE NOT NULL DEFAULT CURRENT_DATE
      )
    `)
  } finally {
    client.release()
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize database on first request
    await initializeDatabase()

    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const result = await client.query(`
        INSERT INTO users (email, password, name, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, email, name, avatar, created_at, updated_at
      `, [email, hashedPassword, name])

      const user = result.rows[0]

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      )

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        },
        token
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}