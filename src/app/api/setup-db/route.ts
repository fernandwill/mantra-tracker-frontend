import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function POST() {
  try {
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    // Drop tables if they exist (for clean setup)
    await sql`DROP TABLE IF EXISTS mantra_sessions`
    await sql`DROP TABLE IF EXISTS mantras`
    await sql`DROP TABLE IF EXISTS users`

    // Create users table
    await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create mantras table
    await sql`
      CREATE TABLE mantras (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        goal INTEGER NOT NULL DEFAULT 108,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create mantra_sessions table
    await sql`
      CREATE TABLE mantra_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        mantra_id UUID NOT NULL,
        count INTEGER NOT NULL DEFAULT 1,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (mantra_id) REFERENCES mantras(id) ON DELETE CASCADE
      )
    `

    // Create indexes
    await sql`CREATE INDEX idx_mantras_user_id ON mantras(user_id)`
    await sql`CREATE INDEX idx_sessions_user_id ON mantra_sessions(user_id)`
    await sql`CREATE INDEX idx_sessions_mantra_id ON mantra_sessions(mantra_id)`
    await sql`CREATE INDEX idx_sessions_date ON mantra_sessions(date)`

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully!' 
    })
  } catch (error: any) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message
      },
      { status: 500 }
    )
  }
}