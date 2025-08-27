import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get backup status for user
    const result = await sql`
      SELECT 
        COUNT(*) as backup_count,
        MAX(updated_at) as last_sync_time
      FROM cloud_backups 
      WHERE user_id = ${userId}
    `

    const status = result.rows[0]
    const hasBackup = parseInt(status.backup_count) > 0

    return NextResponse.json({
      success: true,
      hasBackup,
      backupCount: parseInt(status.backup_count),
      lastSyncTime: status.last_sync_time
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Backup status error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get backup status: ' + errorMessage },
      { status: 500 }
    )
  }
}