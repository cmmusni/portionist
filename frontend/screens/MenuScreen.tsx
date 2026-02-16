import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthFromStorage } from "../hooks/useAuthRestore";
import { clearOnboardingFromStorage } from "../hooks/useOnboardingStorage";
import { selectAuthUser, signOut } from "../redux/authSlice";
import { setOnboardingCompleted } from "../redux/pantrySlice";
import { apiUrl } from "../services/config";

const MenuScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);

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

  const menuItems = [
    {
      id: "recipe-search",
      title: "🔍 Recipe Search",
      description: "Search for recipes based on ingredients",
      screen: "RecipeInput",
      color: "#3b82f6",
    },
    {
      id: "favorites",
      title: "❤️ Favorite Recipes",
      description: "View and manage your saved recipes",
      screen: "Favorites",
      color: "#ef4444",
    },
    {
      id: "preferences",
      title: "⚙️ Profile Preferences",
      description: "Update your profile and meal planning preferences",
      screen: "Profile",
      color: "#8b5cf6",
    },
    {
      id: "settings",
      title: "⚙️ Settings",
      description: "Configure API base URL and debug",
      screen: "Settings",
      color: "#06b6d4",
    },
  ];

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const performSignOut = async () => {
    try {
      console.log("[SignOut] Starting sign out process...");
      console.log("[SignOut] User ID:", user?.userId);

      // Call backend sign out API
      if (user?.userId) {
        try {
          console.log("[SignOut] Calling backend API...");
          const response = await fetch(apiUrl("/auth/signout"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.userId,
            }),
          });
          console.log("[SignOut] API Response Status:", response.status);
        } catch (apiError) {
          console.error("[SignOut] API Error:", apiError);
        }
      }

      console.log("[SignOut] Clearing auth storage...");
      await clearAuthFromStorage();

      console.log("[SignOut] Clearing onboarding storage...");
      await clearOnboardingFromStorage();

      console.log("[SignOut] Dispatching Redux actions...");
      dispatch(setOnboardingCompleted(false));
      dispatch(signOut());

      console.log("[SignOut] Resetting navigation...");
      // Reset navigation immediately
      navigation.reset({
        index: 0,
        routes: [{ name: "SignIn" as never }],
      });
    } catch (error) {
      console.error("[SignOut] Error:", error);
      showAlert("Error", "Failed to sign out");
    }
  };

  const handleSignOut = () => {
    console.log("[SignOut] handleSignOut triggered");
    showAlert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          console.log("[SignOut] Confirm button pressed");
          performSignOut().catch((err) => {
            console.error("[SignOut] Unhandled error:", err);
          });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        </View>
        <Text style={styles.greeting}>
          Welcome,{"\n"}
          <Text style={styles.userName}>{user?.fullName || "User"}</Text>
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, { borderLeftColor: item.color }]}
            onPress={() => handleNavigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || "Not set"}</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutButtonText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatarContainer: {
    marginBottom: 16,
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
  greeting: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  menuItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuContent: {
    flex: 1,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    color: "#d1d5db",
    fontWeight: "bold",
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  signOutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  signOutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default MenuScreen;
