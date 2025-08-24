import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    
    return NextResponse.json({
      success: true,
      timestamp: result.rows[0].current_time,
      tables: tables.rows.map(row => row.table_name),
      message: 'Vercel Postgres connection successful!'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}