import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

interface PostgresError extends Error {
  code?: string
}

export async function GET() {
  try {
    // Test 1: Basic connectivity
    const timeResult = await sql`SELECT NOW() as current_time`
    
    // Test 2: UUID generation
    const uuidResult = await sql`SELECT uuid_generate_v4() as test_uuid`
    
    // Test 3: Table existence
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'mantras', 'mantra_sessions')
    `
    
    const existingTables = tablesResult.rows.map(row => row.table_name)
    
    // Test 4: Try a simple insert and delete
    let insertTestSuccess = false
    try {
      const testEmail = `test-${Date.now()}@example.com`
      await sql`
        INSERT INTO users (email, name)
        VALUES (${testEmail}, 'Test User')
      `
      await sql`DELETE FROM users WHERE email = ${testEmail}`
      insertTestSuccess = true
    } catch (insertError) {
      console.error('Insert test failed:', insertError)
    }
    
    return NextResponse.json({
      success: true,
      currentTime: timeResult.rows[0].current_time,
      uuidTest: uuidResult.rows[0].test_uuid,
      existingTables,
      insertTestSuccess
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error && 'code' in error ? (error as PostgresError).code : undefined
    
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: errorMessage,
      code: errorCode
    }, { status: 500 })
  }
}