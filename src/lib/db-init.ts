import { sql } from '@vercel/postgres'

export async function initializeDatabase() {
  try {
    console.log('Initializing database...')
    
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    console.log('UUID extension enabled')
    
    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'mantras', 'mantra_sessions')
    `
    
    const existingTables = tablesResult.rows.map(row => row.table_name)
    console.log('Existing tables:', existingTables)
    
    // Create users table if it doesn't exist
    if (!existingTables.includes('users')) {
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
      console.log('Users table created')
    }
    
    // Create mantras table if it doesn't exist
    if (!existingTables.includes('mantras')) {
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
      console.log('Mantras table created')
    }
    
    // Create mantra_sessions table if it doesn't exist
    if (!existingTables.includes('mantra_sessions')) {
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
      console.log('Mantra sessions table created')
    }
    
    // Create indexes if they don't exist
    try {
      await sql`CREATE INDEX idx_mantras_user_id ON mantras(user_id)`
    } catch {
      // Index might already exist, which is fine
    }
    
    try {
      await sql`CREATE INDEX idx_sessions_user_id ON mantra_sessions(user_id)`
    } catch {
      // Index might already exist, which is fine
    }
    
    try {
      await sql`CREATE INDEX idx_sessions_mantra_id ON mantra_sessions(mantra_id)`
    } catch {
      // Index might already exist, which is fine
    }
    
    try {
      await sql`CREATE INDEX idx_sessions_date ON mantra_sessions(date)`
    } catch {
      // Index might already exist, which is fine
    }
    
    console.log('Database initialization completed successfully')
    return { success: true }
  } catch (error) {
    console.error('Database initialization error:', error)
    return { success: false, error }
  }
}