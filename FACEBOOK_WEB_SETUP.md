# Facebook Login Web Configuration

## Setup Instructions

To enable Facebook Login on web (portionist.netlify.app), you need to configure the Facebook App settings:

### 1. Facebook App Configuration

Go to [Facebook App Dashboard](https://developers.facebook.com/apps/) → Your App → Settings → Basic

1. **Add Platform: Website**
   - Scroll down and click "Add Platform" button
   - Select "Website"
   - Site URL: `https://portionist.netlify.app`
   - Save changes

2. **App Domains** (On the same Settings → Basic page, scroll up to find the "App Domains" field)
   - In the "App Domains" text field, type: `portionist.netlify.app`
   - Click "Save Changes" button at the bottom

   **Note:** This field is near the top of the Basic Settings page, above where you added the platform. Just type the domain name without `https://` or `http://`. Don't add `localhost` here - it's not needed and Facebook won't accept it.

3. **Privacy Policy URL** (required for public apps)
   - Add your privacy policy URL

4. **Terms of Service URL** (optional but recommended)
   - Add your terms of service URL

### 2. Facebook Login Settings

**Navigate to Facebook Login settings:**

1. In the left sidebar, click **"Use cases"**
2. Click on **"Authenticate and request data from users with Facebook Login"**
3. Look for **"Settings"** or a **gear icon (⚙️)** to access configuration options

**Configure the following settings:**

1. **Valid OAuth Redirect URIs:**

   ```
   https://portionist.netlify.app/
   ```

   **Note:** `localhost` redirects are automatically allowed in development mode and don't need to be added here.

2. **Client OAuth Settings:**
   - ✅ Web OAuth Login: Enabled
   - ✅ Use Strict Mode for Redirect URIs: Enabled

3. **Allowed Domains for the JavaScript SDK:**

   ```
   portionist.netlify.app
   ```

   **Note:** Don't add `localhost` here - Facebook won't accept it. Local testing will still work via the OAuth redirect URI.

### 3. Make App Public (When Ready)

For production use:

1. Go to App Settings → Basic
2. Turn on "App Mode" from Development to Live
3. Complete App Review if needed (for email permission)

### 4. Testing

**Important:** Facebook Login requires HTTPS and cannot be tested on `http://localhost`.

**Test on deployed site:**

- Production: https://portionist.netlify.app

**Local development:**

- You can still run `npm run web` for general testing
- Facebook login will only work on the HTTPS deployed site

### Current Configuration

- **App ID:** `1987992925400777`
- **App Name:** Portionist
- **SDK Version:** v19.0

## How It Works

### Mobile (iOS/Android)

Uses `expo-facebook` native SDK

### Web

Uses Facebook JavaScript SDK loaded dynamically:

- SDK loaded from: `https://connect.facebook.net/en_US/sdk.js`
- Initialized in `frontend/services/facebookAuth.ts`
- Popup-based OAuth flow

## Implementation Details

The code automatically detects the platform:

- **Web:** Uses Facebook JS SDK with popup login
- **Mobile:** Uses Expo Facebook native module

Both platforms authenticate with the backend at `/auth/facebook` endpoint.
