import * as WebBrowser from "expo-web-browser";
import { Alert, Platform } from "react-native";
import { apiUrl } from "./config";

// Required for web browser to close properly after authentication
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  userId: string;
  email: string;
  fullName: string;
  token: string;
}

// Google OAuth client ID - you'll need to get this from Google Cloud Console
// For development, using a placeholder - will use demo mode
const GOOGLE_WEB_CLIENT_ID =
  "601524642960-3vr1q7noraptm283am3olhsslgn0v9fb.apps.googleusercontent.com";
const USE_DEMO_MODE = false; // Set to true to enable demo mode for testing

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Initialize Google Sign-In
 */
export const initializeGoogle = async (): Promise<void> => {
  if (Platform.OS === "web") {
    // Load Google Identity Services library
    if (!window.google) {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("Google Sign-In library loaded successfully");
          resolve();
        };
        script.onerror = () => {
          console.error("Failed to load Google Sign-In library");
          resolve(); // Still resolve to not block app
        };
        document.body.appendChild(script);
      });
    }
    console.log("Google Sign-In library already loaded");
    return;
  }

  // For native apps using expo-auth-session, no configuration needed
  console.log("Google Sign-In ready for native using expo-auth-session");
};

/**
 * Log in with Google
 */
export const googleLogin = async (): Promise<GoogleUser | null> => {
  try {
    if (Platform.OS === "web") {
      return await googleLoginWeb();
    } else {
      return await googleLoginNative();
    }
  } catch (error) {
    console.error("Google login error:", error);
    Alert.alert(
      "Sign In Failed",
      "Unable to sign in with Google. Please try again or use email/password.",
    );
    return null;
  }
};

/**
 * Google Sign-In for Web using Google Identity Services
 */
async function googleLoginWeb(): Promise<GoogleUser | null> {
  // Demo mode for testing without actual Google OAuth setup
  if (USE_DEMO_MODE) {
    return await googleLoginDemo();
  }

  // Wait for Google library to load (with retry)
  let retries = 0;
  while (!window.google && retries < 10) {
    console.log(`Waiting for Google library... (attempt ${retries + 1}/10)`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    retries++;
  }

  return new Promise((resolve) => {
    if (!window.google) {
      console.error("Google library failed to load after 5 seconds");
      Alert.alert(
        "Error",
        "Google Sign-In is still loading. Please refresh the page and try again.",
      );
      resolve(null);
      return;
    }

    console.log(
      "Initializing Google Sign-In with client ID:",
      GOOGLE_WEB_CLIENT_ID,
    );

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      callback: async (response: any) => {
        try {
          console.log("Google Sign-In callback received");
          // Decode the JWT to get user info
          const credential = response.credential;
          const payload = JSON.parse(atob(credential.split(".")[1]));

          const googleId = payload.sub;
          const email = payload.email;
          const fullName = payload.name;

          console.log("Sending to backend:", { googleId, email, fullName });

          // Send to backend for authentication
          const backendResponse = await fetch(apiUrl("/auth/google"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ googleId, email, fullName }),
          });

          if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error("Backend error:", errorText);
            throw new Error("Backend authentication failed");
          }

          const data = await backendResponse.json();
          console.log("Authentication successful:", data);

          // Clean up the popup button if it exists
          const popupDiv = document.getElementById("google-signin-button");
          if (popupDiv) {
            popupDiv.remove();
          }

          resolve(data.data);
        } catch (error) {
          console.error("Error processing Google sign-in:", error);
          Alert.alert(
            "Authentication Error",
            "Failed to complete Google sign-in. Please try again.",
          );
          resolve(null);
        }
      },
    });

    console.log("Attempting to show Google One Tap prompt...");

    // Show the One Tap prompt
    window.google.accounts.id.prompt((notification: any) => {
      console.log("One Tap prompt notification:", notification);
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const reason =
          notification.getNotDisplayedReason?.() ||
          notification.getSkippedReason?.();
        console.log("One Tap not available, reason:", reason);

        // Use popup fallback instead of failing
        console.log("Triggering popup fallback...");
        triggerGooglePopup(resolve);
      }
    });
  });
}

/**
 * Fallback: Trigger Google Sign-In popup when One Tap fails
 */
function triggerGooglePopup(resolve: (value: GoogleUser | null) => void): void {
  // Create a centered popup div
  const existingDiv = document.getElementById("google-signin-button");
  if (existingDiv) {
    existingDiv.remove();
  }

  const popupDiv = document.createElement("div");
  popupDiv.id = "google-signin-button";
  popupDiv.style.position = "fixed";
  popupDiv.style.top = "50%";
  popupDiv.style.left = "50%";
  popupDiv.style.transform = "translate(-50%, -50%)";
  popupDiv.style.zIndex = "10000";
  popupDiv.style.padding = "20px";
  popupDiv.style.backgroundColor = "white";
  popupDiv.style.borderRadius = "8px";
  popupDiv.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "✕";
  closeButton.style.position = "absolute";
  closeButton.style.top = "8px";
  closeButton.style.right = "8px";
  closeButton.style.border = "none";
  closeButton.style.background = "transparent";
  closeButton.style.fontSize = "20px";
  closeButton.style.cursor = "pointer";
  closeButton.style.color = "#666";
  closeButton.onclick = () => {
    popupDiv.remove();
    resolve(null);
  };

  // Add backdrop
  const backdrop = document.createElement("div");
  backdrop.id = "google-signin-backdrop";
  backdrop.style.position = "fixed";
  backdrop.style.top = "0";
  backdrop.style.left = "0";
  backdrop.style.width = "100%";
  backdrop.style.height = "100%";
  backdrop.style.backgroundColor = "rgba(0,0,0,0.5)";
  backdrop.style.zIndex = "9999";
  backdrop.onclick = () => {
    popupDiv.remove();
    backdrop.remove();
    resolve(null);
  };

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "google-button-container";

  popupDiv.appendChild(closeButton);
  popupDiv.appendChild(buttonContainer);
  document.body.appendChild(backdrop);
  document.body.appendChild(popupDiv);

  // Render the Google Sign-In button
  window.google.accounts.id.renderButton(buttonContainer, {
    type: "standard",
    size: "large",
    theme: "outline",
    text: "signin_with",
    shape: "rectangular",
    width: 280,
  });

  console.log("Google Sign-In popup button displayed");
}

/**
 * Demo mode for Google Sign-In (for testing without OAuth setup)
 */
async function googleLoginDemo(): Promise<GoogleUser | null> {
  try {
    // Prompt for demo email
    const demoEmail = prompt(
      "Demo Mode: Enter your email for Google Sign-In test:",
    );

    if (!demoEmail) {
      return null;
    }

    const demoName = prompt("Demo Mode: Enter your full name:") || "Demo User";

    // Generate a demo Google ID based on email
    const googleId = "google-demo-" + demoEmail.replace(/[^a-zA-Z0-9]/g, "");

    // Send to backend for authentication
    const backendResponse = await fetch(apiUrl("/auth/google"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        googleId,
        email: demoEmail,
        fullName: demoName,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.error || "Backend authentication failed");
    }

    const data = await backendResponse.json();
    return data.data;
  } catch (error) {
    console.error("Demo Google login error:", error);
    Alert.alert(
      "Authentication Error",
      "Failed to complete Google sign-in. Please try again.",
    );
    return null;
  }
}

/**
 * Google Sign-In for Native (iOS/Android)
 * Opens Google OAuth in browser, redirects to a web page that can communicate back
 */
async function googleLoginNative(): Promise<GoogleUser | null> {
  try {
    console.log("Opening Google Sign-In in browser...");

    // Redirect URI for Expo - no path, just base URL
    const redirectBase = "exp://172.20.10.3:8081";

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_WEB_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent("https://portionist.netlify.app/oauth-callback.html")}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("openid profile email")}&` +
      `access_type=offline`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectBase);

    console.log("Browser result:", result);

    if (result.type !== "success") {
      console.log("Authentication cancelled or failed");
      return null;
    }

    // Parse the redirect URL to get the authorization code
    const url = result.url;
    const codeMatch = url.match(/[?&]code=([^&]+)/);

    if (!codeMatch) {
      throw new Error("No authorization code received");
    }

    const code = decodeURIComponent(codeMatch[1]);
    console.log("Got authorization code, exchanging for user info...");

    // Exchange code for tokens via backend
    const backendResponse = await fetch(apiUrl("/auth/google/callback"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.error || "Backend authentication failed");
    }

    const data = await backendResponse.json();
    console.log("Google Sign-In successful");
    return data.data;
  } catch (error: any) {
    console.error("Native Google login error:", error);
    Alert.alert(
      "Authentication Error",
      error.message || "Failed to complete Google sign-in. Please try again.",
    );
    return null;
  }
}
