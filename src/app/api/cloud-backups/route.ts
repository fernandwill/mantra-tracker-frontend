import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, backupData, backupType, metadata } = body

    // Validate input
    if (!userId || !backupData) {
      return NextResponse.json(
        { error: 'User ID and backup data are required' },
        { status: 400 }
      )
    }

    // Create cloud_backups table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS cloud_backups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL UNIQUE,
        backup_data JSONB NOT NULL,
        backup_type VARCHAR(50) DEFAULT 'full_sync',
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_cloud_backups_user_id ON cloud_backups(user_id)
    `

    // Upsert backup (update if exists, insert if new)
    const result = await sql`
      INSERT INTO cloud_backups (user_id, backup_data, backup_type, metadata, updated_at)
      VALUES (${userId}, ${JSON.stringify(backupData)}, ${backupType || 'full_sync'}, ${JSON.stringify(metadata)}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        backup_data = EXCLUDED.backup_data,
        backup_type = EXCLUDED.backup_type,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, created_at, updated_at
    `

    return NextResponse.json({
      success: true,
      message: 'Backup saved successfully',
      backupId: result.rows[0].id,
      lastSyncTime: result.rows[0].updated_at
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Cloud backup error:', error)
    
    return NextResponse.json(
      { error: 'Failed to save backup: ' + errorMessage },
      { status: 500 }
    )
  }
}

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

    // Get latest backup for user
    const result = await sql`
      SELECT backup_data, metadata, created_at, updated_at
      FROM cloud_backups 
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC 
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No backup found for this user' },
        { status: 404 }
      )
    }

    const backup = result.rows[0]
    
    return NextResponse.json({
      success: true,
      backupData: backup.backup_data,
      metadata: backup.metadata,
      lastSyncTime: backup.updated_at
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Load backup error:', error)
    
    return NextResponse.json(
      { error: 'Failed to load backup: ' + errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Delete user's backup
    const result = await sql`
      DELETE FROM cloud_backups 
      WHERE user_id = ${userId}
      RETURNING id
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No backup found to delete' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Delete backup error:', error)
    
    return NextResponse.json(
      { error: 'Failed to delete backup: ' + errorMessage },
      { status: 500 }
    )
  }
}