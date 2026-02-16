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

/**
 * Initialize Facebook SDK
 */
export const initializeFacebook = async (): Promise<void> => {
  // Skip Facebook initialization on web
  if (Platform.OS === "web") {
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
 * Log in with Facebook and authenticate with backend
 */
export const facebookLogin = async (): Promise<FacebookUser | null> => {
  // Facebook login is not available on web
  if (Platform.OS === "web") {
    Alert.alert(
      "Not Available",
      "Facebook login is only available on mobile (iOS/Android). Please use email and password to sign in.",
    );
    return null;
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
    return;
  }

  try {
    await Facebook.logOutAsync();
  } catch (error) {
    console.error("Facebook logout error:", error);
  }
};
