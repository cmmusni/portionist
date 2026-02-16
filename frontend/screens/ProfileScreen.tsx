import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthFromStorage } from "../hooks/useAuthRestore";
import { clearOnboardingFromStorage } from "../hooks/useOnboardingStorage";
import { selectAuthUser, signOut } from "../redux/authSlice";
import { setOnboardingCompleted } from "../redux/pantrySlice";
import { apiUrl } from "../services/config";

interface ProfileData {
  userId: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(selectAuthUser);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Helper function for cross-platform alerts
  const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === "web") {
      const result = window.confirm(`${title}\n\n${message}`);
      if (result && buttons && buttons.length > 1 && buttons[1].onPress) {
        buttons[1].onPress();
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user?.userId) {
        showAlert("Error", "User ID not available");
        return;
      }

      const response = await fetch(apiUrl(`/profile/${user.userId}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setProfile(result.data);
        setFullName(result.data.fullName);
        setEmail(result.data.email);
      } else {
        showAlert("Error", result.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      showAlert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validation
      if (!fullName.trim()) {
        showAlert("Validation", "Full name cannot be empty");
        return;
      }

      if (!email.trim()) {
        showAlert("Validation", "Email cannot be empty");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert("Validation", "Please enter a valid email address");
        return;
      }

      setSaving(true);

      if (!user?.userId) {
        showAlert("Error", "User ID not available");
        return;
      }

      const response = await fetch(apiUrl(`/profile/${user.userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setProfile(result.data);
        setEditing(false);
        showAlert("Success", "Profile updated successfully");
      } else {
        showAlert("Error", result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      showAlert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.fullName);
      setEmail(profile.email);
      setEditing(false);
    }
  };

  const handleLogout = () => {
    showAlert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Sign Out",
        onPress: () => {
          performSignOut();
        },
        style: "destructive",
      },
    ]);
  };

  const performSignOut = async () => {
    try {
      console.log("Starting sign out process...");
      console.log("User ID:", user?.userId);

      // Call backend sign out API
      if (user?.userId) {
        try {
          console.log("Calling sign out API...");
          const response = await fetch(apiUrl("/auth/signout"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.userId,
            }),
          });

          console.log("Sign out API response:", response.status);
          if (!response.ok) {
            console.error("Backend sign out failed:", response.status);
            // Continue with local sign out even if API fails
          }
        } catch (apiError) {
          console.error("Sign out API error:", apiError);
          // Continue with local sign out even if API fails
        }
      }

      console.log("Clearing auth from storage...");
      // Clear auth from storage
      await clearAuthFromStorage();

      console.log("Clearing onboarding from storage...");
      // Clear onboarding data from storage
      await clearOnboardingFromStorage();

      console.log("Resetting Redux state...");
      // Reset onboarding completed flag
      dispatch(setOnboardingCompleted(false));

      // Dispatch sign out action
      console.log("Dispatching sign out...");
      dispatch(signOut());

      console.log("Navigating to SignIn...");
      // Explicitly navigate to SignIn with reset
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "SignIn" as never }],
        });
      }, 200);
    } catch (error) {
      console.error("Sign out error:", error);
      showAlert("Error", "Failed to sign out: " + String(error));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account details</Text>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              placeholder="Enter full name"
              placeholderTextColor="#d1d5db"
              value={fullName}
              onChangeText={setFullName}
              editable={editing}
            />
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              placeholder="Enter email"
              placeholderTextColor="#d1d5db"
              value={email}
              onChangeText={setEmail}
              editable={editing}
              keyboardType="email-address"
            />
          </View>

          {/* User ID (read-only) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>User ID</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.readOnlyText}>{profile.userId}</Text>
            </View>
          </View>

          {/* Member Since */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Member Since</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.readOnlyText}>
                {new Date(profile.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsSection}>
          {!editing ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, { opacity: saving ? 0.6 : 1 }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  formSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
  },
  readOnlyText: {
    fontSize: 14,
    color: "#6b7280",
  },
  buttonsSection: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProfileScreen;
