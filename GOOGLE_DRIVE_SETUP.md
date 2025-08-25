# Google Drive Integration Setup

This guide will help you set up Google Drive integration for the Mantra Tracker app, allowing users to save and restore their data to/from Google Drive.

## Prerequisites

1. Google Cloud Console account
2. A Google Cloud project

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Google Drive API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

## Step 3: Create API Credentials

### Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. Click **Restrict Key** and configure:
   - Application restrictions: HTTP referrers (web sites)
   - Add your domains:
     - `http://localhost:3000/*` (for development)
     - `https://yourdomain.com/*` (for production)
   - API restrictions: Select "Google Drive API"

### Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure OAuth consent screen first if prompted:
   - User Type: External (for public use) or Internal (for organization)
   - Fill in required fields (App name, User support email, etc.)
   - Add scopes: `https://www.googleapis.com/auth/drive.file`
4. Create OAuth client ID:
   - Application type: Web application
   - Name: "Mantra Tracker"
   - Authorized origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
5. Copy the Client ID

## Step 4: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local` in your project root
2. Fill in the Google API credentials:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_oauth_client_id_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. Click "Save to Drive" button
4. You should see a Google sign-in popup
5. After authentication, your data should be saved to Google Drive

## How It Works

### Save to Google Drive
- Exports all mantra and session data as JSON
- Authenticates with Google Drive using OAuth 2.0
- Saves/updates a file named `mantra-tracker-backup.json` in the user's Drive root

### Restore from Google Drive
- Authenticates with Google Drive
- Searches for `mantra-tracker-backup.json` file
- Downloads and imports the data (merges with existing data)

### Local Export/Import
- Export: Downloads data as JSON file to local device
- Import: Uploads and merges JSON file with existing data

## File Structure

The backup file contains:
```json
{
  "version": "1.0.0",
  "exportDate": "2024-01-01T00:00:00.000Z",
  "mantras": [...],
  "sessions": [...],
  "metadata": {
    "totalMantras": 5,
    "totalSessions": 100,
    "dateRange": {
      "earliest": "2024-01-01T00:00:00.000Z",
      "latest": "2024-12-31T00:00:00.000Z"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Not authenticated" error**
   - Check if your OAuth client ID is correct
   - Ensure your domain is added to authorized origins

2. **"API key not valid" error**
   - Verify your API key in the environment variables
   - Check if the API key restrictions match your domain

3. **"Access denied" error**
   - Make sure Google Drive API is enabled
   - Check OAuth consent screen configuration

4. **File not found when restoring**
   - Ensure the user has previously saved data to Drive
   - Check if the filename matches exactly

### Testing in Development

For local development, make sure to:
1. Use `http://localhost:3000` (not `127.0.0.1`)
2. Add the exact URL to OAuth authorized origins
3. Test with a real Google account

## Security Considerations

- API keys are exposed in the frontend (this is normal for browser-based apps)
- The app only requests minimal Drive permissions (`drive.file` scope)
- Users can only access files created by the app
- All authentication is handled by Google's secure OAuth flow

## Production Deployment

When deploying to production:
1. Update environment variables with production Google credentials
2. Add your production domain to OAuth authorized origins
3. Update API key restrictions to include production domain
4. Test the integration thoroughly

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Google Cloud APIs are enabled and configured properly
4. Test with a fresh Google account if authentication issues persist