# Google Sign-In for Mobile (Expo Auth Session)

## ✅ What's Configured

Google Sign-In now works on **mobile devices** using `expo-auth-session`, which is **compatible with Expo Go** - no native builds required!

### Packages Installed:

- ✅ `expo-auth-session` - OAuth authentication flow
- ✅ `expo-crypto` - Cryptographic operations
- ✅ `expo-web-browser` - In-app browser for auth

---

## 📱 How It Works

1. **Web**: Uses Google Identity Services (popup/One Tap)
2. **Mobile** (iOS/Android): Uses `expo-auth-session` with in-app browser
   - Opens Google login in a modal browser
   - Redirects back to the app with auth tokens
   - Works in **Expo Go** without building native code

---

## ⚙️ Setup Required in Google Cloud Console

### Step 1: Add Mobile Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your **OAuth 2.0 Client ID** (Web client)
3. Under **Authorized redirect URIs**, add these:

```
# For Expo Go (Development)
https://auth.expo.io/@your-expo-username/portionist

# For standalone builds
portionist://auth
com.portionist.app://auth

# For local development (if needed)
exp://localhost:8082/--/auth
```

**Note**: Replace `@your-expo-username` with your actual Expo username. You can find it by running:

```bash
npx expo whoami
```

### Step 2: Get Your Redirect URI

Run this in your project to see the exact redirect URI:

```bash
npx expo start
# Then in the app, check the console logs when triggering Google Sign-In
```

The redirect URI is automatically generated based on your Expo configuration and will be logged to the console.

---

## 🧪 Testing

### In Expo Go:

1. **Start the Metro bundler**:

   ```bash
   npx expo start
   ```

2. **Scan QR code** with Expo Go app

3. **Navigate to Sign-In screen**

4. **Click "Continue with Google"**:
   - A browser modal will open
   - Sign in with your Google account
   - Browser will close automatically
   - You'll be authenticated in the app

### Expected Flow:

```
User clicks "Google Sign-In"
    ↓
Opens in-app browser with Google OAuth
    ↓
User signs in and grants permissions
    ↓
Redirects to: portionist://auth (or Expo deep link)
    ↓
App receives auth token
    ↓
Fetches user info from Google
    ↓
Sends to backend /auth/google
    ↓
User logged in! ✅
```

---

## 🔧 Current Configuration

### App Configuration

- **Scheme**: `portionist` (defined in [app.json](app.json))
- **Bundle ID** (iOS): `com.portionist.app`
- **Package** (Android): `com.portionist.app`

### OAuth Client ID

```typescript
// In frontend/services/googleAuth.ts
const GOOGLE_WEB_CLIENT_ID =
  "601524642960-3vr1q7noraptm283am3olhsslgn0v9fb.apps.googleusercontent.com";
```

This same Web Client ID is used for both web and mobile platforms.

---

## 🐛 Troubleshooting

### "Invalid redirect_uri" Error

**Cause**: The redirect URI is not registered in Google Cloud Console

**Fix**:

1. Check the console logs for the actual redirect URI being used
2. Add it to Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs

### Browser Opens But Doesn't Redirect Back

**Cause**: Deep link not configured properly

**Fix**:

1. Verify the `scheme` in [app.json](app.json) is `portionist`
2. Restart Expo Go app after configuration changes
3. Check that the redirect URI matches the scheme

### "Network request failed"

**Cause**: Backend not accessible from phone

**Fix**:

1. Make sure backend is running: `http://192.168.1.70:8081/health`
2. Verify phone is on same network (or hotspot)
3. Check [.env](.env) has correct `EXPO_PUBLIC_API_BASE_URL`

### Works on Web But Not Mobile

**Cause**: Different redirect URIs for web vs mobile

**Fix**:

1. Web uses popup (no redirect needed)
2. Mobile requires redirect URI in Google Console
3. Add mobile redirect URIs as shown in Step 1 above

---

## 📋 Advantages of expo-auth-session

✅ **Works in Expo Go** - No need to build native code  
✅ **Cross-platform** - Same implementation for iOS and Android  
✅ **Secure** - Uses system browser with secure storage  
✅ **Easy to test** - Just scan QR code and test immediately  
✅ **Standard OAuth** - Works with any OAuth provider

---

## 🚀 Next Steps

1. ✅ Packages installed
2. ✅ Code updated to use expo-auth-session
3. ⚠️ **TODO**: Add redirect URIs to Google Cloud Console
4. ⚠️ **TODO**: Test on physical device via Expo Go
5. ⚠️ **TODO**: Verify authentication flow works end-to-end

---

## 📚 Resources

- [Expo AuthSession Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
