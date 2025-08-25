import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Test database connection and table structure
    const tables = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'mantras', 'mantra_sessions')
      ORDER BY table_name, ordinal_position
    `
    
    // Test UUID generation
    const uuidTest = await sql`SELECT uuid_generate_v4() as test_uuid`
    
    return NextResponse.json({
      success: true,
      tables: tables.rows,
      uuidTest: uuidTest.rows[0]
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}