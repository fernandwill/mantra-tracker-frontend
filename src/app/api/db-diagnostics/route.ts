import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

interface PostgresError extends Error {
  code?: string
  detail?: string
}

export async function GET() {
  try {
    // Test 1: Database connectivity
    const connectionTest = await sql`SELECT NOW() as timestamp, version() as version`
    
    // Test 2: UUID extension
    const uuidTest = await sql`SELECT uuid_generate_v4() as test_uuid`
    
    // Test 3: Table structure
    const tableStructure = await sql`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'mantras', 'mantra_sessions')
      ORDER BY table_name, ordinal_position
    `
    
    // Test 4: Row counts
    let userCount = 0
    let mantraCount = 0
    let sessionCount = 0
    
    try {
      const userResult = await sql`SELECT COUNT(*) as count FROM users`
      userCount = parseInt(userResult.rows[0].count)
    } catch (_e) {}
    
    try {
      const mantraResult = await sql`SELECT COUNT(*) as count FROM mantras`
      mantraCount = parseInt(mantraResult.rows[0].count)
    } catch (_e) {}
    
    try {
      const sessionResult = await sql`SELECT COUNT(*) as count FROM mantra_sessions`
      sessionCount = parseInt(sessionResult.rows[0].count)
    } catch (_e) {}
    
    return NextResponse.json({
      success: true,
      environment: {
        vercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV || 'not set'
      },
      database: {
        timestamp: connectionTest.rows[0].timestamp,
        version: connectionTest.rows[0].version,
        uuidWorking: !!uuidTest.rows[0].test_uuid
      },
      tables: {
        structure: tableStructure.rows,
        counts: {
          users: userCount,
          mantras: mantraCount,
          sessions: sessionCount
        }
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error && 'code' in error ? (error as PostgresError).code : undefined
    const errorDetail = error instanceof Error && 'detail' in error ? (error as PostgresError).detail : undefined
    
    console.error('Database diagnostics error:', error)
    return NextResponse.json({
      success: false,
      error: errorMessage,
      code: errorCode,
      detail: errorDetail
    }, { status: 500 })
  }
}