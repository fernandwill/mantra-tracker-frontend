import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Check database connectivity
    await sql`SELECT 1`
    
    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'mantras', 'mantra_sessions')
    `
    
    const existingTables = tablesResult.rows.map(row => row.table_name)
    const missingTables = ['users', 'mantras', 'mantra_sessions'].filter(
      table => !existingTables.includes(table)
    )
    
    if (missingTables.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing tables',
        missingTables
      })
    }
    
    // Check users table structure
    const usersColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `
    
    const requiredColumns = ['id', 'email', 'password_hash', 'name']
    const existingColumns = usersColumns.rows.map(row => row.column_name)
    const missingColumns = requiredColumns.filter(
      col => !existingColumns.includes(col)
    )
    
    if (missingColumns.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing columns in users table',
        missingColumns
      })
    }
    
    // Test UUID generation
    try {
      await sql`SELECT uuid_generate_v4()`
    } catch (_uuidError) {
      return NextResponse.json({
        success: false,
        error: 'UUID extension not available'
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database verification successful',
      tables: existingTables,
      usersColumns: usersColumns.rows
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database verification error:', error)
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}