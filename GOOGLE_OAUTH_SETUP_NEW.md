# Google OAuth Setup for Expo Go

## The Problem

Google OAuth requires HTTPS redirect URIs with proper domains (`.com`, `.org`, etc.). Custom schemes like `exp://` are no longer accepted.

## Solution: Server-Side OAuth Flow

The app now uses a browser-based OAuth flow that works with Expo Go.

### How It Works

1. App opens Google OAuth in browser
2. User signs in with Google
3. Google redirects to `https://portionist.netlify.app/oauth-callback.html`
4. Callback page closes and returns auth code to app
5. App sends code to backend
6. Backend exchanges code for user info with Google
7. User is authenticated ✅

---

## Setup Steps

### 1. Add Authorized Domain (Branding Page)

1. Go to [OAuth Consent Screen - Branding](https://console.cloud.google.com/apis/credentials/consent)
2. Scroll to **"Authorised domains"**
3. Click **"+ Add domain"**
4. Add: `portionist.netlify.app`
5. Click **"SAVE"** at the bottom

### 2. Add Redirect URI (Credentials Page)

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your **OAuth 2.0 Client ID** (Web client)
3. Add to **"Authorized redirect URIs"**:
   ```
   https://portionist.netlify.app/oauth-callback.html
   ```
4. Click **Save**

### 3. Add Test Users (Required for Testing Mode)

⚠️ **IMPORTANT**: If you see "Access Blocked: This app's request is valid":

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Scroll down to **"Test users"**
3. Click **"+ ADD USERS"**
4. Add the Gmail addresses you want to test with (one per line):
   ```
   your.email@gmail.com
   another.email@gmail.com
   ```
5. Click **"SAVE"**

**Alternative**: Publish the app for production:

1. On the OAuth Consent Screen page
2. Click **"PUBLISH APP"**
3. Confirm publication
4. Note: Unverified apps will show a warning screen but anyone can use them

### 2. Get Google Client Secret

1. In [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Copy the **Client Secret** (next to Client ID)

### 5. Add Secret to Backend

Edit `/backend/.env`:

```env
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

Replace `YOUR_CLIENT_SECRET_HERE` with the secret from step 2.

### 6. Deploy OAuth Callback Page

**IMPORTANT**: The callback page must be live on Netlify for OAuth to work.

1. **Commit and push your changes**:

   ```bash
   git add .
   git commit -m "Add Google OAuth callback page"
   git push
   ```

2. **Wait for Netlify to deploy** (1-2 minutes)

3. **Verify the page is live**:
   - Visit: https://portionist.netlify.app/oauth-callback.html
   - You should see "Signing you in..." page

If using Netlify with default settings, this should be automatic.

### 7. Rebuild Backend

```bash
cd backend
npm run build
```

### 8. Restart Backend

```bash
# Kill old server
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start new server
cd backend && node dist/index.js
```

---

## Testing

1. Open app on phone (Expo Go)
2. Click "Continue with Google"
3. Browser opens with Google sign-in
4. Sign in → Browser closes
5. You're logged in! ✅

---

## Troubleshooting

### "Access Blocked: This app's request is valid"

This means your OAuth app is in Testing mode and the user is not added as a test user.

**Solution**:

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Scroll to **"Test users"** section
3. Click **"+ ADD USERS"**
4. Add your Gmail address
5. Click **"SAVE"**
6. Try signing in again ✅

**OR** publish the app:

1. On OAuth Consent Screen page
2. Click **"PUBLISH APP"**
3. Note: Unverified apps show a warning but work for anyone

### "Failed to exchange authorization code"

- Make sure `GOOGLE_CLIENT_SECRET` is set in `/backend/.env`
- Make sure backend is rebuilt: `npm run build`
- Check backend logs for detailed error

### "No authorization code received"

- Make sure redirect URI is added to Google Cloud Console
- Should be exactly: `https://portionist.netlify.app/oauth-callback.html`

### Browser doesn't close after sign-in

- This is normal - the auth code is captured from the URL
- User can manually close the browser
- App should still receive the auth data

---

## Why This Approach?

✅ Works with Expo Go (no dev client needed)
✅ Uses HTTPS redirect URI (Google compliant)  
✅ Secure (code exchange happens server-side)
✅ Works cross-platform (iOS/Android/Web)
✅ No dynamic redirect URIs - always the same
