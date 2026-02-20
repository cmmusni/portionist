import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
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
import { resetPantryData } from "../redux/pantrySlice";
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

      // Clear onboarding data for this user
      if (user?.userId) {
        console.log("[SignOut] Clearing onboarding data...");
        await clearOnboardingFromStorage(user.userId);
      }

      console.log("[SignOut] Dispatching Redux sign out...");
      dispatch(signOut());

      console.log("[SignOut] Resetting pantry data...");
      dispatch(resetPantryData());

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
      <LinearGradient
        colors={["#8b5cf6", "#7c3aed"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient colors={["#a78bfa", "#8b5cf6"]} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </Text>
          </LinearGradient>
        </View>
        <Text style={styles.greeting}>Welcome,</Text>
        <Text style={styles.userName}>{user?.fullName || "User"}</Text>
      </LinearGradient>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItemWrapper}
            onPress={() => handleNavigate(item.screen)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#ffffff", "#f9fafb"]}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
            >
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <View
                style={[
                  styles.arrowCircle,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Text style={[styles.arrow, { color: item.color }]}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Info */}
      <View style={styles.infoContainer}>
        <LinearGradient colors={["#dbeafe", "#bfdbfe"]} style={styles.infoCard}>
          <Text style={styles.infoIcon}>📧</Text>
          <Text style={styles.infoLabel}>Email Address</Text>
          <Text style={styles.infoValue}>{user?.email || "Not set"}</Text>
        </LinearGradient>
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity
          style={styles.signOutButtonWrapper}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#ef4444", "#dc2626"]}
            style={styles.signOutButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.signOutButtonText}>🚪 Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    paddingTop: 60,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ffffff",
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  menuItemWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuContent: {
    flex: 1,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 20,
    fontWeight: "bold",
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  infoCard: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "600",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 17,
    color: "#1e3a8a",
    fontWeight: "600",
  },
  signOutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  signOutButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signOutButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
});

export default MenuScreen;
