import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

interface PostgresError extends Error {
  code?: string
  detail?: string
}

export async function GET() {
  try {
    console.log('Starting database diagnostics...')
    
    // Check if uuid-ossp extension is available
    console.log('Checking UUID extension...')
    const extensions = await sql`
      SELECT name FROM pg_available_extensions WHERE name = 'uuid-ossp'
    `
    console.log('UUID extension check result:', extensions.rows)
    
    // Check current database tables
    console.log('Checking database tables...')
    const tables = await sql`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'mantras', 'mantra_sessions')
      ORDER BY table_name, ordinal_position
    `
    console.log('Tables check result:', tables.rows)
    
    // Check if users table exists and has correct structure
    console.log('Checking users table structure...')
    const usersTable = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `
    console.log('Users table structure:', usersTable.rows)
    
    // Test UUID generation
    console.log('Testing UUID generation...')
    const uuidTest = await sql`SELECT uuid_generate_v4() as test_uuid`
    console.log('UUID test result:', uuidTest.rows[0])
    
    // Check if we can insert a test user
    console.log('Testing database insert...')
    const testInsert = await sql`
      INSERT INTO users (email, name)
      VALUES ('test@example.com', 'Test User')
      RETURNING id, email, name
    `
    console.log('Test insert result:', testInsert.rows[0])
    
    // Clean up test user
    console.log('Cleaning up test user...')
    await sql`DELETE FROM users WHERE email = 'test@example.com'`
    console.log('Test user cleaned up')
    
    return NextResponse.json({
      success: true,
      message: 'All database diagnostics passed',
      extensions: extensions.rows,
      tables: tables.rows,
      usersTable: usersTable.rows,
      uuidTest: uuidTest.rows[0]
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorCode = error instanceof Error && 'code' in error ? (error as PostgresError).code : undefined
    const errorDetail = error instanceof Error && 'detail' in error ? (error as PostgresError).detail : undefined
    
    console.error('Database diagnostics error:', error)
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      code: errorCode,
      detail: errorDetail
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: {
          code: errorCode,
          detail: errorDetail
        }
      },
      { status: 500 }
    )
  }
}