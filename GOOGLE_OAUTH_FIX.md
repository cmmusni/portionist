# Fix Google OAuth 2.0 Error: "Must end with a public top-level domain"

## The Problem

You're seeing: **"Invalid redirect: Must end with a public top-level domain (such as .com or .org)"**

This happens because Google no longer accepts custom schemes like `exp://` or `portionist://` as redirect URIs. They now require HTTPS URLs with proper domains.

---

## The Solution

### Option 1: Use Expo's Proxy (Recommended for Expo Go)

The code now uses the default Expo redirect URI. When you click "Sign in with Google":

1. **Check the Metro bundler console** for the redirect URI
2. It should show something like: `https://auth.expo.io/@anonymous/...` or similar
3. **Copy that HTTPS URI**
4. **Add it to Google Cloud Console** (see Step 2 below)

### Step 2: Add Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

2. Click on your **OAuth 2.0 Client ID** (Web client)

3. Scroll down to **"Authorized redirect URIs"**

4. Click **"+ ADD URI"**

5. **Paste the HTTPS redirect URI** from the console

6. Click **"Save"**

### Step 3: Test Again

1. **Wait 1-2 minutes** for Google to update

2. **Try signing in again** in your app

3. Should work now! ✅

---

## Option 2: Build a Development Client (For Production)

If you need a permanent solution with a custom scheme:

1. **Create an Expo development build**:

   ```bash
   npx expo prebuild
   npx expo run:ios
   # or
   npx expo run:android
   ```

2. **The redirect URI will be**: `portionist://` or similar

3. **Add to Google Console**: Your custom scheme

Note: This won't work with Expo Go, but gives you a fixed redirect URI.

---

## Why This Changed

- **Google updated their OAuth policy** to require HTTPS redirect URIs
- Custom URI schemes (like `exp://`, `myapp://`) are no longer allowed
- Must use proper domains ending in `.com`, `.org`, etc.
- Expo provides proxy servers with HTTPS URLs for development

---

This gives you a permanent redirect URI that won't change with networks.

---

## Current Configuration

Your app is configured with:

- **Client ID**: `601524642960-3vr1q7noraptm283am3olhsslgn0v9fb.apps.googleusercontent.com`
- **Scheme**: `portionist`
- **Package**: `com.portionist.app`

---

## Troubleshooting

### Still getting the error after adding redirect URI?

1. **Clear Google's cache**:
   - Sign out of Google in phone's browser
   - Clear browser cache
   - Try again

2. **Check exact match**:
   - The URI in Google Console must **exactly** match what's in the console logs
   - Including `://` and port numbers
   - Case-sensitive

3. **Wait longer**:
   - Sometimes takes 5-10 minutes for Google to propagate changes

### Can't find the redirect URI in console?

1. Make sure you're looking at the **Metro bundler terminal** (not app console)
2. The URI is logged when you click "Continue with Google"
3. Look for lines starting with `==========`

---

## Quick Checklist

- [ ] Found redirect URI in Metro bundler console
- [ ] Added redirect URI to Google Cloud Console → Credentials → OAuth 2.0 Client
- [ ] Saved changes in Google Console
- [ ] Waited 1-2 minutes
- [ ] Tested sign-in again

---

Need help? Check the console logs for the exact redirect URI and add it to Google Cloud Console!
