# Email Registration Debugging Guide

## Common Issues and Solutions

### 1. Database Schema Issues
- Make sure the `users` table has a `password_hash` column (not `password`)
- Verify that the UUID extension is enabled in your Vercel Postgres database

### 2. Environment Variables
- Ensure `DATABASE_URL` is set correctly in your Vercel environment variables
- Make sure `JWT_SECRET` is set

### 3. Testing Endpoints

You can test the following endpoints to diagnose issues:

1. **Diagnostics**: `/api/db-diagnostics` - Check database connectivity and structure
2. **Health Check**: `/api/health` - Basic database connectivity test
3. **Setup**: `/api/setup-db` (POST) - Recreate database tables (destructive)

### 4. Manual Database Verification

You can also manually verify your database structure by running these queries in your Vercel Postgres dashboard:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if uuid-ossp extension is available
SELECT name FROM pg_available_extensions WHERE name = 'uuid-ossp';
```

### 5. Testing Registration Manually

You can test the registration endpoint directly with curl:

```bash
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

### 6. Common Error Codes

- **23505**: Duplicate key violation (user already exists)
- **23502**: Not null violation (missing required field)
- **42P01**: Undefined table (table doesn't exist)
- **42703**: Undefined column (column doesn't exist)

### 7. Vercel Environment Setup

Make sure these environment variables are set in your Vercel project:

- `DATABASE_URL` - Your Vercel Postgres connection string
- `JWT_SECRET` - A secure random string for JWT signing
- `NEXTAUTH_SECRET` - A secure random string for NextAuth

You can set these in the Vercel dashboard under your project settings > Environment Variables.