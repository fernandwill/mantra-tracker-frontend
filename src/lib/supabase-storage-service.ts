// Supabase Storage Service for automatic cloud sync
// This service handles syncing mantra data using the existing database infrastructure

import { ExportData } from './data-export-service'

export interface CloudSyncResult {
  success: boolean
  message: string
  lastSyncTime?: string
}

export class SupabaseStorageService {
  private static instance: SupabaseStorageService

  private constructor() {}

  static getInstance(): SupabaseStorageService {
    if (!SupabaseStorageService.instance) {
      SupabaseStorageService.instance = new SupabaseStorageService()
    }
    return SupabaseStorageService.instance
  }

  // Save mantra data to Supabase (database-based approach)
  async saveDataToCloud(data: ExportData, userId: string): Promise<CloudSyncResult> {
    try {
      if (!userId) {
        throw new Error('User authentication required for cloud sync')
      }

      // Save backup metadata to a cloud_backups table
      const response = await fetch('/api/cloud-backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          backupData: data,
          backupType: 'full_sync',
          metadata: {
            totalMantras: data.mantras.length,
            totalSessions: data.sessions.length,
            exportDate: data.exportDate
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save data to cloud')
      }

      const result = await response.json()
      
      return {
        success: true,
        message: 'Data synchronized to cloud successfully!',
        lastSyncTime: new Date().toISOString()
      }
    } catch (error) {
      console.error('Cloud sync error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync data to cloud'
      }
    }
  }

  // Load mantra data from Supabase
  async loadDataFromCloud(userId: string): Promise<ExportData> {
    if (!userId) {
      throw new Error('User authentication required for cloud restore')
    }

    const response = await fetch(`/api/cloud-backups?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to load data from cloud')
    }

    const result = await response.json()
    
    if (!result.backupData) {
      throw new Error('No cloud backup found for this user')
    }

    return result.backupData as ExportData
  }

  // Get sync status for the user
  async getSyncStatus(userId: string): Promise<{
    hasBackup: boolean
    lastSyncTime?: string
    backupCount: number
  }> {
    try {
      if (!userId) {
        return {
          hasBackup: false,
          backupCount: 0
        }
      }

      const response = await fetch(`/api/cloud-backups/status?userId=${userId}`)
      
      if (!response.ok) {
        return {
          hasBackup: false,
          backupCount: 0
        }
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get sync status:', error)
      return {
        hasBackup: false,
        backupCount: 0
      }
    }
  }

  // Automatic background sync (called when data changes)
  async autoSync(userId: string): Promise<void> {
    try {
      if (!userId) return

      // Get current data
      const { DataExportService } = await import('./data-export-service')
      const exportData = DataExportService.exportData()
      
      // Only sync if there's actual data to sync
      if (exportData.mantras.length === 0 && exportData.sessions.length === 0) {
        return
      }

      // Perform background sync
      await this.saveDataToCloud(exportData, userId)
    } catch (error) {
      // Silent fail for background sync - don't disrupt user experience
      console.warn('Auto-sync failed:', error)
    }
  }

  // Delete cloud backup for user
  async deleteCloudBackup(userId: string): Promise<CloudSyncResult> {
    try {
      if (!userId) {
        throw new Error('User authentication required')
      }

      const response = await fetch('/api/cloud-backups', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete cloud backup')
      }

      return {
        success: true,
        message: 'Cloud backup deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete cloud backup'
      }
    }
  }
}

// Export singleton instance
export const supabaseStorageService = SupabaseStorageService.getInstance()