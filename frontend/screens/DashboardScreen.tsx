import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import { selectAuthUser } from "../redux/authSlice";
import {
    selectCuisine,
    selectCurrentWeight,
    selectUserAge,
} from "../redux/pantrySlice";

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectAuthUser);
  const currentWeight = useSelector(selectCurrentWeight);
  const cuisine = useSelector(selectCuisine);
  const userAge = useSelector(selectUserAge);

  React.useEffect(() => {
    console.log("📊 Dashboard mounted");
    console.log("User:", user);
    console.log("Weight:", currentWeight, "Cuisine:", cuisine, "Age:", userAge);
  }, []);

  const quickActions = [
    {
      id: "recipe-search",
      title: "🔍 Search Recipe",
      description: "Find recipes by ingredients",
      icon: "🔍",
      screen: "RecipeInput",
      color: "#3b82f6",
    },
    {
      id: "favorites",
      title: "❤️ Favorites",
      description: "Your saved recipes",
      icon: "❤️",
      screen: "Favorites",
      color: "#ef4444",
    },
    {
      id: "preferences",
      title: "⚙️ Preferences",
      description: "Update your profile",
      icon: "⚙️",
      screen: "Profile",
      color: "#8b5cf6",
    },
  ];

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const getInitials = () => {
    return user?.fullName?.charAt(0).toUpperCase() || "U";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
        </View>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.fullName || "User"}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Weight</Text>
          <Text style={styles.statValue}>{currentWeight || "--"} kg</Text>
          <Text style={styles.statSubtext}>Tracking your progress</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Cuisine</Text>
          <Text style={styles.statValue}>{cuisine || "Not set"}</Text>
          <Text style={styles.statSubtext}>Preferred</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Age</Text>
          <Text style={styles.statValue}>{userAge || "--"}</Text>
          <Text style={styles.statSubtext}>Years</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { borderTopColor: action.color }]}
              onPress={() => handleNavigate(action.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Info Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || "Not set"}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{user?.fullName || "Not set"}</Text>
          </View>
        </View>
      </View>

      {/* View Full Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate("Menu" as never)}
      >
        <Text style={styles.menuButtonText}>View Full Menu →</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },
  greeting: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: "#d1d5db",
    textAlign: "center",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 13,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  menuButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  spacer: {
    height: 20,
  },
});

export default DashboardScreen;
