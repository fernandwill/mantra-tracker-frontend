# 🚀 Deployment Guide - Vercel + Supabase

## ✅ Simplified Architecture

This project uses a **single Next.js application** deployed to Vercel that connects directly to Supabase PostgreSQL:

```
Frontend (Next.js on Vercel) → API Routes (/api/*) → Supabase PostgreSQL
```

**Benefits:**
- ✅ Single deployment instead of separate frontend/backend
- ✅ Cost-effective (only Vercel + Supabase)
- ✅ Automatic database initialization
- ✅ Built-in fallback to localStorage for development

## 📋 Environment Variables

### **1. Create `.env.local` file:**
Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase PostgreSQL Connection
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# JWT Secret for authentication
JWT_SECRET=your_super_secure_jwt_secret_here_make_it_long_and_random

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### **2. For Vercel Deployment:**
Add the same variables in **Vercel Project Settings**:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `DATABASE_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`
- Update `NEXTAUTH_URL` to your production domain

## 🚀 Deployment Steps

### **Step 1: Set up Supabase**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings → Database → Connection string**
3. Copy the **URI** format connection string
4. Replace `[password]` with your actual database password

### **Step 2: Configure Environment**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your Supabase connection string
# DATABASE_URL=postgresql://postgres:your_password@db.xyz.supabase.co:5432/postgres
```

### **Step 3: Deploy to Vercel**
```bash
# Deploy to Vercel
vercel --prod

# Or push to GitHub and auto-deploy via Vercel integration
git add .
git commit -m "Add Supabase integration"
git push origin main
```

### **Step 4: Database Auto-Setup**
- ✅ **Tables are created automatically** when the first user registers
- ✅ **No manual SQL setup required**
- ✅ **Production-ready schema with proper indexes**

## 🏗️ API Routes

The following API endpoints are available:

```
/api/auth/login          - POST: User login
/api/auth/register       - POST: User registration  
/api/mantras            - GET/POST: List/Create mantras
/api/mantras/[id]       - PUT/DELETE: Update/Delete mantra
/api/sessions           - GET/POST: List/Create sessions
/api/stats              - GET: Dashboard statistics
```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

**The app will work offline with localStorage until you add the DATABASE_URL!**

## 🎯 Database Schema

Tables are automatically created with this schema:

### **users**
- `id` (UUID, primary key)
- `email` (VARCHAR, unique)
- `password` (VARCHAR, hashed)
- `name` (VARCHAR)
- `avatar` (TEXT, optional)
- `created_at`, `updated_at` (TIMESTAMP)

### **mantras**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `title` (VARCHAR)
- `text` (TEXT)
- `goal` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMP)

### **mantra_sessions**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `mantra_id` (UUID, foreign key → mantras)
- `count` (INTEGER)
- `date` (DATE)

## 🔒 Security Features

- ✅ **JWT Authentication** with secure token validation
- ✅ **Password hashing** with bcrypt
- ✅ **SQL injection protection** with parameterized queries
- ✅ **SSL/TLS** connections to Supabase
- ✅ **Environment variable** protection (server-side only)

## 🚨 Troubleshooting

### **Common Issues:**

1. **Database connection fails:**
   - Check your `DATABASE_URL` format
   - Ensure Supabase project is active
   - Verify password is correct

2. **Authentication not working:**
   - Make sure `JWT_SECRET` is set and long enough
   - Check that `NEXTAUTH_SECRET` is configured

3. **API routes returning 500:**
   - Check Vercel function logs
   - Ensure all environment variables are set in Vercel

### **Check Connection:**
Visit `/api/test-connection` to test your database connection.

## 🎉 Ready for Production!

Your mantra tracker is now ready with:
- ✅ **Scalable Supabase PostgreSQL** database
- ✅ **Serverless API routes** on Vercel
- ✅ **Automatic SSL/security**
- ✅ **Cost-effective architecture**
- ✅ **Global CDN distribution**

**Total cost: ~$0-5/month for small apps (Vercel free tier + Supabase free tier)**