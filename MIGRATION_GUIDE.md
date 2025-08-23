# Backend Migration Guide

## Overview

This guide explains how to replace the mock authentication with real backend API calls when you're ready to implement a full backend.

## Current Mock Implementation

### Files to Replace

1. **`/src/lib/mock-auth.ts`** - Replace with real API service
2. **`/src/app/auth/signin/page.tsx`** - Update API endpoints
3. **`/src/app/auth/signup/page.tsx`** - Update API endpoints

### Current Auth Flow

```
1. User registers/logs in
2. Mock service simulates API delay
3. Returns user object + token
4. Token stored in localStorage
5. Auth context manages state
```

## Migration Steps

### 1. Create Real Auth Service

Replace `/src/lib/mock-auth.ts` with `/src/lib/auth-service.ts`:

```typescript
export const authService = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      throw new Error('Login failed')
    }
    
    return response.json()
  },

  async register(name: string, email: string, password: string) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }
    
    return response.json()
  }
}
```

### 2. Update Import Statements

In `signin/page.tsx` and `signup/page.tsx`:

```typescript
// Replace this:
import { mockAuthService } from '@/lib/mock-auth'

// With this:
import { authService } from '@/lib/auth-service'
```

### 3. Update Service Calls

```typescript
// Replace this:
const result = await mockAuthService.login(email, password)

// With this:
const result = await authService.login(email, password)
```

### 4. Backend API Endpoints Needed

Your backend should provide these endpoints:

- `POST /api/auth/login` - Returns `{ user, token }`
- `POST /api/auth/register` - Returns `{ user, token }`
- `POST /api/auth/logout` (optional)
- `GET /api/auth/me` (optional - for token validation)

### 5. Expected Response Format

Ensure your backend returns data in this format:

```typescript
{
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  },
  token: string
}
```

### 6. Environment Variables

Add your backend URL to `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Update service to use it:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL

const response = await fetch(`${API_URL}/api/auth/login`, {
  // ... rest of the config
})
```

## Benefits of Current Setup

✅ **Drop-in Replacement**: Mock service matches expected API format
✅ **No Auth Context Changes**: Auth state management stays the same  
✅ **Preserved UX**: All loading states and error handling work
✅ **Type Safety**: TypeScript interfaces are ready for real API
✅ **Token Management**: localStorage handling is production-ready

## Next Steps

1. Implement backend API endpoints
2. Replace mock service with real API calls
3. Test authentication flow
4. Add token refresh logic (optional)
5. Implement protected API routes for mantras data

The frontend is fully prepared for this migration! 🚀