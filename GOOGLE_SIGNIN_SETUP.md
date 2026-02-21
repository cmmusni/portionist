# Google Sign-In Setup Guide

## Overview

Google Sign-In is now enabled for both **Web** and **Mobile** (iOS & Android) platforms.

---

## Prerequisites

1. **Google Cloud Console Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable **Google+ API** or **Google Identity Services**

---

## 1. Web Setup (Already Configured)

### Web Client ID

- **Current ID**: `601524642960-3vr1q7noraptm283am3olhsslgn0v9fb.apps.googleusercontent.com`
- This is already configured in `frontend/services/googleAuth.ts`

### Configure Authorized Origins

In Google Cloud Console → Credentials → OAuth 2.0 Client IDs → Web client:

- **Authorized JavaScript origins**:
  - `http://localhost:8082` (Expo web dev server)
  - `https://portionist.netlify.app` (Production)
  - Add any other domains where your web app will run

---

## 2. iOS Setup

### Step 1: Get iOS Client ID from Google Cloud Console

1. Go to **Google Cloud Console** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **iOS** as application type
4. Enter your **Bundle ID**: `com.portionist.app`
5. Copy the generated **iOS Client ID**

### Step 2: Update googleAuth.ts

Replace the iOS client ID in `frontend/services/googleAuth.ts`:

```typescript
const GOOGLE_IOS_CLIENT_ID = "YOUR_IOS_CLIENT_ID_HERE";
```

### Step 3: Download GoogleService-Info.plist

1. In Google Cloud Console, download the `GoogleService-Info.plist` file
2. Place it in the **root directory** of your project: `/GoogleService-Info.plist`

### Step 4: Rebuild the app

```bash
npx expo prebuild
npx expo run:ios
```

---

## 3. Android Setup

### Step 1: Get Android OAuth Client ID

1. Go to **Google Cloud Console** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Android** as application type
4. Enter your **Package name**: `com.portionist.app`
5. Get your **SHA-1 certificate fingerprint**:

   **For Development (Debug)**:

   ```bash
   cd android
   ./gradlew signingReport
   ```

   Copy the SHA-1 from the **debug** variant

   **For Production (Release)**:

   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

6. Paste the SHA-1 into Google Cloud Console
7. Copy the generated **Android Client ID**

### Step 2: Create Web Client ID for Android

**Important**: For Android, the library needs the **Web Client ID** (not the Android one).

- Use the same Web Client ID: `601524642960-3vr1q7noraptm283am3olhsslgn0v9fb`
- This is already configured in `googleAuth.ts` as `GOOGLE_WEB_CLIENT_ID`

### Step 3: Download google-services.json

1. In Google Cloud Console, download the `google-services.json` file
2. Place it in the **root directory** of your project: `/google-services.json`

### Step 4: Rebuild the app

```bash
npx expo prebuild
npx expo run:android
```

---

## 4. Testing

### Web

1. Run: `npx expo start --web`
2. Navigate to sign-in page
3. Click "Continue with Google"
4. Complete the OAuth flow

### iOS Simulator

1. Run: `npx expo run:ios`
2. Navigate to sign-in page
3. Click "Continue with Google"
4. Sign in with your Google account

### Android Emulator/Device

1. Run: `npx expo run:android`
2. Make sure Google Play Services is installed on the emulator
3. Navigate to sign-in page
4. Click "Continue with Google"
5. Sign in with your Google account

### Physical Device (via Expo Go)

**Note**: Google Sign-In does **not work in Expo Go** for native platforms. You must build a development build:

```bash
# iOS
npx expo run:ios --device

# Android
npx expo run:android --device
```

---

## 5. Configuration Summary

### Current Configuration in Code

**File**: `frontend/services/googleAuth.ts`

```typescript
const GOOGLE_WEB_CLIENT_ID =
  "601524642960-3vr1q7noraptm283am3olhsslgn0v9fb.apps.googleusercontent.com";
const GOOGLE_IOS_CLIENT_ID =
  "601524642960-3vr1q7noraptm283am3olhsslgn0v9fb.apps.googleusercontent.com"; // ⚠️ UPDATE THIS
```

### app.json Updates

**iOS**:

```json
"ios": {
  "bundleIdentifier": "com.portionist.app",
  "googleServicesFile": "./GoogleService-Info.plist",
  "config": {
    "googleSignIn": {
      "reservedClientId": "com.googleusercontent.apps.601524642960-3vr1q7noraptm283am3olhsslgn0v9fb"
    }
  }
}
```

**Android**:

```json
"android": {
  "package": "com.portionist.app",
  "googleServicesFile": "./google-services.json"
}
```

---

## 6. Backend Configuration

The backend endpoint `/auth/google` is already set up to handle Google authentication.

**Endpoint**: `POST /auth/google`

**Request Body**:

```json
{
  "googleId": "string",
  "email": "string",
  "fullName": "string"
}
```

---

## 7. Troubleshooting

### iOS Issues

1. **"Sign-in not available" error**
   - Make sure `GoogleService-Info.plist` is in the root directory
   - Check that the iOS Client ID matches in both Google Console and `googleAuth.ts`
   - Run `npx expo prebuild` to regenerate native code

2. **"Invalid client" error**
   - Verify Bundle ID matches: `com.portionist.app`
   - Check that the reversed client ID is correct in `app.json`

### Android Issues

1. **"Developer Error" or "Sign-in failed"**
   - Make sure you're using the **Web Client ID**, not the Android one
   - Verify SHA-1 fingerprint is registered in Google Console
   - Check that `google-services.json` is in the root directory

2. **"Google Play Services not available"**
   - Update Google Play Services on the emulator/device
   - For emulators, use one with Play Store included

### General Issues

1. **"Backend authentication failed"**
   - Check backend is running: `http://192.168.1.70:8081/health`
   - Verify network connectivity
   - Check backend logs for errors

2. **"Sign-in cancelled"**
   - User cancelled the sign-in flow
   - This is normal behavior

---

## 8. Next Steps

1. ✅ Package installed: `@react-native-google-signin/google-signin`
2. ✅ Code updated to support native Google Sign-In
3. ✅ app.json configured for iOS and Android
4. ⚠️ **TODO**: Get proper iOS Client ID from Google Cloud Console
5. ⚠️ **TODO**: Download and add `GoogleService-Info.plist` (iOS)
6. ⚠️ **TODO**: Download and add `google-services.json` (Android)
7. ⚠️ **TODO**: Get SHA-1 fingerprint and register in Google Console (Android)
8. ⚠️ **TODO**: Run `npx expo prebuild` after adding config files
9. ⚠️ **TODO**: Test on physical devices with development builds

---

## Resources

- [Google Sign-In for React Native](https://react-native-google-signin.github.io/docs/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Expo Google Sign-In Guide](https://docs.expo.dev/guides/google-authentication/)
