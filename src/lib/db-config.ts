// Environment configuration helper
export function getDatabaseUrl() {
  // In Vercel production environment
  if (process.env.VERCEL_ENV === 'production') {
    return process.env.POSTGRES_URL || process.env.DATABASE_URL
  }
  
  // In Vercel preview environment
  if (process.env.VERCEL_ENV === 'preview') {
    return process.env.POSTGRES_URL || process.env.DATABASE_URL
  }
  
  // Local development
  return process.env.POSTGRES_URL || process.env.DATABASE_URL
}

export function isVercel() {
  return !!process.env.VERCEL
}

export function getEnvironment() {
  if (process.env.VERCEL_ENV === 'production') return 'production'
  if (process.env.VERCEL_ENV === 'preview') return 'preview'
  return 'development'
}