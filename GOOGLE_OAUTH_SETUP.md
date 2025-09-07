# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your GlobeStay application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Your GlobeStay application running locally

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "GlobeStay OAuth"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "GlobeStay"
     - User support email: your email
     - Developer contact: your email
   - Add your domain to authorized domains
   - Save and continue through all steps

4. For OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "GlobeStay Web Client"
   - Authorized JavaScript origins: 
     - `http://localhost:8080` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:8080/auth/google/callback` (for development)
     - `https://yourdomain.com/auth/google/callback` (for production)

5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

1. Open your `.env` file
2. Add the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

Replace `your_google_client_id_here` and `your_google_client_secret_here` with the actual values from Step 3.

## Step 5: Test the Integration

1. Start your application: `npm start`
2. Go to `http://localhost:8080/login`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you should be redirected back to your application

## Features Included

✅ **Google Sign-in Button** on both login and signup pages
✅ **Automatic Account Creation** for new Google users
✅ **Account Linking** for existing users with same email
✅ **Profile Information Sync** (name, email, profile picture)
✅ **Seamless Integration** with existing authentication system

## Troubleshooting

### Common Issues:

1. **"Error 400: redirect_uri_mismatch"**
   - Check that your redirect URI in Google Console matches exactly: `http://localhost:8080/auth/google/callback`

2. **"Error 403: access_denied"**
   - Make sure Google+ API is enabled
   - Check OAuth consent screen configuration

3. **"Error: Invalid client"**
   - Verify your Client ID and Client Secret are correct
   - Check that the OAuth client is configured for web application

4. **"Error: This app isn't verified"**
   - This is normal for development. Click "Advanced" → "Go to GlobeStay (unsafe)" to proceed

### Development vs Production:

- **Development**: Use `http://localhost:8080` in authorized origins and redirect URIs
- **Production**: Replace with your actual domain (e.g., `https://yourdomain.com`)

## Security Notes

- Keep your Client Secret secure and never commit it to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console

## Support

If you encounter any issues, check:
1. Google Cloud Console for error logs
2. Your application console for detailed error messages
3. Network tab in browser developer tools for request/response details

For more information, visit [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
