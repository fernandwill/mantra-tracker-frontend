'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { DataExportService } from '@/lib/data-export-service'
import { LogOut, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'

export function UserProfileDropdown() {
  const { user, signOut: customSignOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      // Sign out from NextAuth if using social login
      await signOut({ redirect: false })
      // Sign out from custom auth
      customSignOut()
      
      toast.success('Signed out successfully')
      router.push('/auth/signin')
    } catch {
      toast.error('Error signing out')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Check if user is on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Show instructions for mobile users
        toast.info('Export file will open in a new tab. Please use your browser\'s save option to download it.')
      }
      
      DataExportService.downloadAsFile()
      toast.success('Data exported successfully!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Failed to export data: ${errorMessage}`)
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsImporting(true)
      try {
        const result = await DataExportService.importFromFile(file)
        
        if (result.success) {
          toast.success(`Import successful! Imported ${result.imported.mantras} mantras and ${result.imported.sessions} sessions`)
          
          if (result.warnings.length > 0) {
            console.warn('Import warnings:', result.warnings)
          }
          
          // Reload the page to reflect the imported data
          window.location.reload()
        } else {
          toast.error(`Import failed: ${result.errors.join(', ')}`)
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        toast.error(`Failed to import data: ${errorMessage}`)
        console.error('Import error:', error)
      } finally {
        setIsImporting(false)
      }
    }
    input.click()
  }

  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') {
      return 'U' // Default fallback for undefined/invalid names
    }
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="gradient-accent-bg text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportData} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImportData} disabled={isImporting}>
          <Upload className="mr-2 h-4 w-4" />
          <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoading}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

