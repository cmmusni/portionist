import * as Facebook from "expo-facebook";
import { Alert, Platform } from "react-native";
import { apiUrl } from "./config";

const FACEBOOK_APP_ID = "1987992925400777";

export interface FacebookUser {
  userId: string;
  email: string;
  fullName: string;
  token: string;
}

// Declare Facebook SDK types for web
declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

/**
 * Initialize Facebook SDK for Web
 */
const initializeFacebookWeb = (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.FB) {
      resolve();
      return;
    }

    // Load Facebook SDK script
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      resolve();
    };

    // Load SDK script if not already loaded
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  });
};

/**
 * Initialize Facebook SDK
 */
export const initializeFacebook = async (): Promise<void> => {
  if (Platform.OS === "web") {
    try {
      await initializeFacebookWeb();
      console.log("Facebook SDK initialized for web");
    } catch (error) {
      console.error("Facebook web initialization error:", error);
    }
    return;
  }

  try {
    if (typeof Facebook.initializeAsync !== "function") {
      console.error(
        "expo-facebook is not properly linked or available in this environment.",
      );
      Alert.alert(
        "Facebook Error",
        "Facebook SDK is not available. Please ensure expo-facebook is installed and you are running on a supported device.",
      );
      return;
    }
    await Facebook.initializeAsync({
      appId: FACEBOOK_APP_ID,
      version: "v19.0",
    });
  } catch (error) {
    console.error("Facebook initialization error:", error);
    Alert.alert(
      "Facebook Error",
      "Failed to initialize Facebook SDK. Please try again or contact support.",
    );
  }
};

/**
 * Log in with Facebook (Web version)
 */
const facebookLoginWeb = (): Promise<FacebookUser | null> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      Alert.alert("Error", "Facebook SDK not loaded. Please refresh the page.");
      resolve(null);
      return;
    }

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          // Get user info from Facebook
          window.FB.api("/me", { fields: "id,name,email" }, (userData: any) => {
            // Send to backend for authentication
            fetch(apiUrl("/auth/facebook"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                facebookId: userData.id,
                fullName: userData.name,
                email: userData.email,
              }),
            })
              .then((backendResponse) => {
                if (!backendResponse.ok) {
                  throw new Error("Backend authentication failed");
                }
                return backendResponse.json();
              })
              .then((authData) => {
                resolve(authData.data as FacebookUser);
              })
              .catch((error) => {
                console.error("Backend auth error:", error);
                Alert.alert("Error", "Failed to authenticate with server");
                reject(error);
              });
          });
        } else {
          console.log("User cancelled login or did not fully authorize.");
          resolve(null);
        }
      },
      { scope: "public_profile,email" },
    );
  });
};

/**
 * Log in with Facebook and authenticate with backend
 */
export const facebookLogin = async (): Promise<FacebookUser | null> => {
  // Use web-specific Facebook login
  if (Platform.OS === "web") {
    try {
      return await facebookLoginWeb();
    } catch (error) {
      console.error("Facebook web login error:", error);
      throw error;
    }
  }

  try {
    const result = await Facebook.logInWithReadPermissionsAsync({
      permissions: ["public_profile", "email"],
    });

    if (result.type === "success") {
      // Get user info from Facebook
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${result.token}`,
      );
      const facebookData = await response.json();

      // Send to backend for authentication
      const backendResponse = await fetch(apiUrl("/auth/facebook"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facebookId: facebookData.id,
          fullName: facebookData.name,
          email: facebookData.email,
        }),
      });

      if (!backendResponse.ok) {
        throw new Error("Backend authentication failed");
      }

      const authData = await backendResponse.json();
      return authData.data as FacebookUser;
    } else if (result.type === "cancel") {
      console.log("User cancelled Facebook login");
      return null;
    }
  } catch (error) {
    console.error("Facebook login error:", error);
    throw error;
  }

  return null;
};

/**
 * Log out from Facebook
 */
export const facebookLogout = async (): Promise<void> => {
  if (Platform.OS === "web") {
    if (window.FB) {
      window.FB.logout();
    }
    return;
  }

  try {
    await Facebook.logOutAsync();
  } catch (error) {
    console.error("Facebook logout error:", error);
  }
};
