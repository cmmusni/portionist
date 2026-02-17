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
   - In the "App Domains" text field, add: `portionist.netlify.app`
   - Press Enter to add another domain
   - Add: `localhost` (for local testing)
   - Click "Save Changes" button at the bottom

   **Note:** This field is near the top of the Basic Settings page, above where you added the platform. Just type the domain name without `https://` or `http://`

3. **Privacy Policy URL** (required for public apps)
   - Add your privacy policy URL

4. **Terms of Service URL** (optional but recommended)
   - Add your terms of service URL

### 2. Facebook Login Settings

Go to Products → Facebook Login → Settings

1. **Valid OAuth Redirect URIs:**

   ```
   https://portionist.netlify.app/
   http://localhost:19006/
   ```

2. **Client OAuth Settings:**
   - ✅ Web OAuth Login: Enabled
   - ✅ Use Strict Mode for Redirect URIs: Enabled

3. **Allowed Domains for the JavaScript SDK:**
   ```
   portionist.netlify.app
   localhost
   ```

### 3. Make App Public (When Ready)

For production use:

1. Go to App Settings → Basic
2. Turn on "App Mode" from Development to Live
3. Complete App Review if needed (for email permission)

### 4. Testing Locally

For local web testing:

```bash
npm run web
```

Access at: `http://localhost:19006`

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
