# 🧪 Google Sign-In Testing Guide

## 🚀 Quick Test Checklist

### ✅ Before Testing:
1. **Environment Variables Set:**
   - [ ] `GOOGLE_CLIENT_ID` (OAuth Client ID)
   - [ ] `GOOGLE_CLIENT_SECRET` (OAuth Client Secret)
   - [ ] `NEXTAUTH_SECRET` (Any random string)
   - [ ] `NEXTAUTH_URL` (http://localhost:3000 for dev)

2. **Google Cloud Console Configured:**
   - [ ] OAuth 2.0 Client ID created
   - [ ] Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - [ ] Authorized JavaScript origins: `http://localhost:3000`

### 🔧 Test Procedure:

#### 1. Start Development Server
```bash
cd mantra-tracker-frontend
npm run dev
```

#### 2. Test Google Sign-In Flow
1. Navigate to: `http://localhost:3000/auth/signin`
2. Click **"Continue with Google"** button
3. Should open Google OAuth popup/redirect
4. Select your Google account
5. Grant permissions (if first time)
6. Should redirect back to app homepage
7. Should see your name/avatar in top-right corner

#### 3. Verify Session Persistence
1. Refresh the page
2. Should remain signed in
3. Should see user info in header

#### 4. Test Sign-Out
1. Click on your avatar (top-right)
2. Click **"Sign out"**
3. Should redirect to sign-in page
4. Should show success message

#### 5. Test Integration with Google Drive
1. Sign in with Google
2. Go to homepage
3. Click **"Save to Drive"**
4. Should NOT ask for additional authentication (uses same Google account)
5. Should save data successfully

### 🔍 Debugging Common Issues:

#### **"Error 400: redirect_uri_mismatch"**
```
❌ Problem: Redirect URI doesn't match Google Console settings
✅ Fix: Check Google Console > Credentials > Your OAuth Client > Authorized redirect URIs
   Must be exactly: http://localhost:3000/api/auth/callback/google
```

#### **"Error 403: access_denied"**
```
❌ Problem: OAuth consent screen not configured or app not approved
✅ Fix: 
   1. Configure OAuth consent screen in Google Console
   2. Add yourself as a test user (for external apps)
   3. Ensure app is not restricted
```

#### **"Invalid client ID"**
```
❌ Problem: Environment variable not set or incorrect
✅ Fix: Check .env.local file:
   GOOGLE_CLIENT_ID=your_actual_client_id_here
```

#### **Sign-in works but session doesn't persist**
```
❌ Problem: NEXTAUTH_SECRET not set
✅ Fix: Add to .env.local:
   NEXTAUTH_SECRET=any_random_string_here
```

#### **Google Sign-In popup blocked**
```
❌ Problem: Browser blocking popups
✅ Fix: Allow popups for localhost:3000 in browser settings
```

### 📱 Testing Different Scenarios:

#### **First-time User:**
- Should see Google account selection
- May see consent screen (if not pre-approved)
- Should create account and sign in

#### **Returning User:**
- Should sign in quickly (may not even see popup)
- Should restore previous session

#### **Multiple Google Accounts:**
- Should show account picker
- Should work with any selected account

#### **Mobile Browser:**
- Should work on mobile devices
- May redirect instead of popup (this is normal)

### 🔄 Testing Email + Google Sign-In Mix:

#### **Scenario 1: Email first, then Google**
1. Create account with email/password
2. Sign out
3. Sign in with Google (different email)
4. Should work as separate account

#### **Scenario 2: Google first, then Email**
1. Sign in with Google
2. Sign out  
3. Try email sign-in with same email
4. Should work independently

### 🎯 Expected User Experience:

#### **Successful Flow:**
1. **Click Google button** → Google popup opens
2. **Select account** → Quick verification
3. **Grant permissions** (first time only) → App redirect
4. **Land on homepage** → Signed in state
5. **See user info** → Avatar + name in header
6. **Google Drive integration** → No additional auth needed

#### **Visual Indicators:**
- ✅ Google button follows Google's design guidelines
- ✅ Loading states during authentication
- ✅ Success toast notifications
- ✅ User avatar/name in header
- ✅ Sign-out option in dropdown

### 🚀 Production Testing:

When deploying to production:
1. Update Google Console with production URLs
2. Set production environment variables
3. Test on actual domain (not localhost)
4. Verify HTTPS enforcement

### 📊 Success Metrics:

- [ ] Google OAuth popup/redirect works
- [ ] User successfully signs in
- [ ] Session persists across page refreshes
- [ ] User can sign out successfully
- [ ] Google Drive integration works seamlessly
- [ ] No console errors during flow
- [ ] Mobile experience works properly

## 🎉 Congratulations!

If all tests pass, your Google Sign-In is fully functional and integrated with:
- ✅ User authentication
- ✅ Session management  
- ✅ Google Drive API access
- ✅ Responsive design
- ✅ Security best practices

Your users can now sign in with their Google accounts and have seamless access to all app features!