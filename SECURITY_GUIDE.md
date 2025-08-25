# 🔐 Security Guide: Environment Variables & API Keys

## ⚠️ CRITICAL: Your Keys Are Exposed!

**IMMEDIATE ACTION REQUIRED:**
1. **Rotate these keys immediately** - they were exposed in our conversation
2. **Update your Google Cloud Console** with new API key restrictions
3. **Change your database credentials** if they're production credentials

## 🔍 Security Analysis

### ✅ **SAFE to expose as `NEXT_PUBLIC_`:**

```env
# These are DESIGNED to be public when properly restricted
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key  # See restrictions below
```

**Why these are safe:**
- OAuth Client IDs are meant to be public (like app store IDs)
- Google API keys for browser apps are expected to be visible
- Security comes from **restrictions**, not secrecy

### 🔴 **NEVER expose as `NEXT_PUBLIC_`:**

```env
# These must stay server-side only
DATABASE_URL=postgresql://...           # Contains passwords!
JWT_SECRET=...                         # Used for signing tokens
NEXTAUTH_SECRET=...                    # Used for session encryption
GOOGLE_CLIENT_SECRET=...               # OAuth app secret
GITHUB_SECRET=...                      # OAuth app secret
```

## 🛡️ Proper API Key Security

### Google API Key Restrictions (REQUIRED):

1. **Application Restrictions:**
   ```
   HTTP referrers (web sites)
   - http://localhost:3000/*
   - https://yourdomain.com/*
   ```

2. **API Restrictions:**
   ```
   Restrict to: Google Drive API only
   ```

3. **Usage Quotas:**
   ```
   Requests per day: 10,000 (adjust as needed)
   Requests per 100 seconds per user: 100
   ```

## 📁 Recommended File Structure

### `.env.local` (Development):
```env
# Client-safe variables (will be exposed)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_restricted_api_key

# Server-only secrets (never exposed)
DATABASE_URL=postgresql://localhost:5432/dev_db
JWT_SECRET=your_dev_jwt_secret
NEXTAUTH_SECRET=your_dev_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth secrets (server-only)
GOOGLE_CLIENT_SECRET=your_oauth_secret
GITHUB_ID=your_github_app_id
GITHUB_SECRET=your_github_app_secret
```

### Production Environment (Vercel/Netlify):
```env
# Same structure, but with production values
NEXT_PUBLIC_GOOGLE_CLIENT_ID=prod_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=prod_restricted_api_key

DATABASE_URL=production_postgres_url
JWT_SECRET=production_jwt_secret
NEXTAUTH_SECRET=production_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com
```

## 🔧 How Next.js Handles Environment Variables

### Build Time:
```javascript
// This gets replaced with actual value at build time
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
// Becomes: const apiKey = "AIzaSy..."
```

### What Users See:
```javascript
// In browser dev tools, users can see:
window.__NEXT_DATA__.props.pageProps.env.NEXT_PUBLIC_GOOGLE_API_KEY
```

**This is EXPECTED and SAFE when properly restricted!**

## 🔍 Security Verification Checklist

### ✅ Google Cloud Console Setup:
- [ ] API key restricted to your domains only
- [ ] API key limited to Google Drive API only
- [ ] OAuth consent screen configured
- [ ] Client ID configured with correct redirect URIs

### ✅ Environment Variables:
- [ ] No database URLs as NEXT_PUBLIC_
- [ ] No JWT secrets as NEXT_PUBLIC_
- [ ] No OAuth client secrets as NEXT_PUBLIC_
- [ ] Google API key properly restricted

### ✅ Production Security:
- [ ] Different keys for dev/prod environments
- [ ] HTTPS enforced in production
- [ ] Regular security audits
- [ ] Key rotation schedule

## 🚨 Common Mistakes to Avoid

1. **Exposing Database URLs:**
   ```env
   # ❌ NEVER do this
   NEXT_PUBLIC_DATABASE_URL=postgresql://...
   ```

2. **Exposing OAuth Secrets:**
   ```env
   # ❌ NEVER do this
   NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=...
   ```

3. **Unrestricted API Keys:**
   ```env
   # ⚠️ Dangerous without proper restrictions
   NEXT_PUBLIC_GOOGLE_API_KEY=unrestricted_key
   ```

## 🔄 Key Rotation Process

1. **Create new keys in Google Cloud Console**
2. **Update restrictions on new keys**
3. **Test with new keys in development**
4. **Update production environment variables**
5. **Verify functionality**
6. **Delete old keys**

## 🔗 Google's Official Documentation

Google explicitly states that API keys for browser applications:
- Are expected to be visible in client-side code
- Should be restricted by domain and API scope
- Are different from server-to-server authentication

**Reference:** [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

## 🎯 Bottom Line

**Your Google Drive API setup is architecturally correct**, but you need to:
1. **Rotate exposed keys immediately**
2. **Add proper domain restrictions**
3. **Never expose database/JWT secrets**

The `NEXT_PUBLIC_` approach for Google Drive API is the standard, recommended method!