# 🔐 Google Sign-In Setup Guide

This guide will help you set up Google Sign-In for your Mantra Tracker app using NextAuth.js.

## 📋 Prerequisites

1. Google Cloud Console account
2. A Google Cloud project (can be the same one used for Google Drive API)

## Step 1: Google Cloud Console Setup

### 1.1 Enable Google+ API (if not already enabled)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Google+ API" or "People API"
4. Click **Enable**

### 1.2 Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (for public apps) or **Internal** (for organization)
3. Fill in required information:
   - **App name**: "Mantra Tracker"
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. **Scopes**: Add the following scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. **Test users** (if using External): Add your email for testing

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: "Mantra Tracker Web Client"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Save and copy the **Client ID** and **Client Secret**

## Step 2: Environment Configuration

### 2.1 Update your `.env.local` file:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# For production, use your domain:
# NEXTAUTH_URL=https://yourdomain.com
```

### 2.2 Production Environment (Vercel/Netlify):
Make sure to add these environment variables to your production platform:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to your production domain)

## Step 3: Code Implementation (Already Done!)

Your app already has the Google Sign-In implementation! Here's what's already configured:

### ✅ NextAuth Configuration (`/api/auth/[...nextauth]/route.ts`):
- Google Provider configured
- Proper callbacks for session management
- JWT strategy enabled

### ✅ Sign-In Page (`/auth/signin/page.tsx`):
- Google Sign-In button
- Proper styling (follows Google's design guidelines)
- Error handling

### ✅ Auth Context (`/lib/auth-context.tsx`):
- NextAuth session integration
- User state management

## Step 4: Testing Google Sign-In

### 4.1 Development Testing:
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signin`
3. Click "Continue with Google"
4. Complete the Google OAuth flow
5. You should be redirected back to your app and signed in

### 4.2 Verify Session:
After signing in, check that:
- User is redirected to the home page
- User information is displayed in the header
- The dropdown shows user's name and email

## Step 5: User Data Integration

Your app will receive the following user data from Google:
```javascript
{
  id: "google_user_id",
  name: "User's Full Name",
  email: "user@gmail.com",
  image: "https://profile-image-url"
}
```

## Step 6: Production Deployment

### 6.1 Update OAuth Credentials:
1. Add your production domain to authorized origins
2. Add production callback URL to authorized redirect URIs

### 6.2 Environment Variables:
```env
# Production .env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com
```

## 🔧 Advanced Configuration

### Custom Sign-In Page Styling
Your app already includes proper Google button styling that follows Google's brand guidelines:
- White background with Google colors
- Proper icon and spacing
- Dark mode support

### Error Handling
The implementation includes:
- Loading states during authentication
- Error messages via toast notifications
- Fallback for failed authentication

### Session Management
- Automatic session restoration on page reload
- Secure JWT-based sessions
- Proper sign-out functionality

## 🛡️ Security Best Practices

### ✅ Already Implemented:
1. **Secure callback URLs**: Only your domains are authorized
2. **HTTPS in production**: NextAuth enforces HTTPS in production
3. **Secure secrets**: NEXTAUTH_SECRET is used for JWT signing
4. **Proper scopes**: Only requesting necessary user information

### 📋 Checklist:
- [ ] OAuth consent screen configured
- [ ] Client ID and secret added to environment variables
- [ ] Authorized domains added to Google Cloud Console
- [ ] Production environment variables configured
- [ ] HTTPS enabled in production

## 🚨 Troubleshooting

### Common Issues:

1. **"Error 400: redirect_uri_mismatch"**
   - Check that your redirect URI in Google Console matches exactly
   - Format: `http://localhost:3000/api/auth/callback/google`

2. **"Error 403: access_denied"**
   - Verify OAuth consent screen is configured
   - Check if you're added as a test user (for external apps)

3. **"Invalid client_id"**
   - Verify GOOGLE_CLIENT_ID environment variable is set correctly
   - Check for extra spaces or characters

4. **Session not persisting**
   - Verify NEXTAUTH_SECRET is set
   - Check that NEXTAUTH_URL matches your domain

### Debug Mode:
Add this to your `.env.local` for debugging:
```env
NEXTAUTH_DEBUG=true
```

## 🎯 What Users Will Experience

1. **First Time**: User clicks "Continue with Google" → Google OAuth popup → Account selection → Consent (if needed) → Redirect to app
2. **Return Users**: User clicks "Continue with Google" → Quick Google verification → Immediate sign-in
3. **Mobile**: Optimized mobile experience with proper responsive design

## 📱 Mobile Considerations

Your implementation already includes:
- Responsive design for mobile devices
- Touch-friendly button sizes
- Proper popup handling on mobile browsers

## 🔗 Integration with Google Drive

Since you're also using Google Drive API, users who sign in with Google will have seamless access to:
- Save data to their Google Drive
- Restore data from Google Drive
- No additional authentication needed for Drive features

The Google Sign-In and Google Drive API can share the same Google Cloud project and OAuth configuration!

## 📊 Analytics and Monitoring

Consider adding:
- Sign-in success/failure tracking
- User authentication method preferences
- Session duration analytics

Your Google Sign-In setup is nearly complete! Just add your Google OAuth credentials to the environment variables and test the flow.