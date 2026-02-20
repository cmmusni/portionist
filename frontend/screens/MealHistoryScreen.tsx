import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { BrandColors } from "../../constants/theme";
import { RootState } from "../redux/store";
import { apiUrl } from "../services/config";

// ===============================================
// INTERFACES
// ===============================================

interface LoggedEntry {
  id: number;
  recipeId: number;
  title: string;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  loggedAt: string;
}

type FilterPeriod = "all" | "today" | "week" | "month" | "custom";

// ===============================================
// MAIN COMPONENT
// ===============================================

export default function MealHistoryScreen() {
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  // Logged entries state
  const [loggedEntries, setLoggedEntries] = useState<LoggedEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [total, setTotal] = useState(0);

  // ===============================================
  // HELPER FUNCTIONS
  // ===============================================

  const getDateRange = (
    period: FilterPeriod,
  ): { start?: string; end?: string } => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    switch (period) {
      case "today":
        return { start: formatDate(today), end: formatDate(today) };
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: formatDate(weekAgo), end: formatDate(today) };
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: formatDate(monthAgo), end: formatDate(today) };
      case "all":
      default:
        return {};
    }
  };

  // ===============================================
  // API FUNCTIONS
  // ===============================================

  const fetchAllEntries = useCallback(async () => {
    if (!token) {
      console.warn("No token available for fetching entries");
      return;
    }

    try {
      setLoadingEntries(true);

      const dateRange = getDateRange(filterPeriod);
      const params = new URLSearchParams({
        limit: "100",
        offset: "0",
      });

      if (dateRange.start) params.set("startDate", dateRange.start);
      if (dateRange.end) params.set("endDate", dateRange.end);

      const response = await fetch(
        apiUrl(`/api/food/entries?${params.toString()}`),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setLoggedEntries(data.data);
          setTotal(data.total || data.data.length);
        } else {
          setLoggedEntries([]);
          setTotal(0);
        }
      } else {
        console.error("Failed to fetch entries:", response.status);

        if (response.status === 401) {
          Alert.alert(
            "Session Expired",
            "Please sign in again to view your meal history.",
            [{ text: "OK" }],
          );
        }
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to server. Please check your internet connection.",
      );
    } finally {
      setLoadingEntries(false);
    }
  }, [token, filterPeriod]);

  const deleteEntry = async (id: number, title: string) => {
    if (!token) return;

    const performDelete = async () => {
      try {
        const response = await fetch(apiUrl(`/api/food/entries/${id}`), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          if (Platform.OS === "web") {
            alert("Meal removed from history");
          } else {
            Alert.alert("Success", "Meal removed from history");
          }
          fetchAllEntries(); // Refresh list
        } else {
          Alert.alert("Error", "Failed to delete entry");
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
        Alert.alert("Error", "Could not delete entry");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Remove "${title}" from meal history?`)) {
        await performDelete();
      }
    } else {
      Alert.alert("Remove Meal", `Remove "${title}" from meal history?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: performDelete },
      ]);
    }
  };

  // ===============================================
  // EFFECTS
  // ===============================================

  useEffect(() => {
    fetchAllEntries();
  }, [fetchAllEntries]);

  // ===============================================
  // RENDER HELPERS
  // ===============================================

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toISOString().split("T")[0];
    const todayOnly = today.toISOString().split("T")[0];
    const yesterdayOnly = yesterday.toISOString().split("T")[0];

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (dateOnly === todayOnly) {
      return `Today, ${timeStr}`;
    } else if (dateOnly === yesterdayOnly) {
      return `Yesterday, ${timeStr}`;
    } else {
      return (
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) + `, ${timeStr}`
      );
    }
  };

  const renderFilterButton = (period: FilterPeriod, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterPeriod === period && styles.filterButtonActive,
      ]}
      onPress={() => setFilterPeriod(period)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filterPeriod === period && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderLoggedEntry = ({ item }: { item: LoggedEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleContainer}>
          <Text style={styles.entryTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.entryDate}>{formatDate(item.loggedAt)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteEntry(item.id, item.title)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroValue}>{item.nutrition.protein}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroValue}>{item.nutrition.carbs}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={styles.macroValue}>{item.nutrition.fat}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Calories</Text>
          <Text style={styles.macroValue}>{item.nutrition.calories}</Text>
        </View>
      </View>
    </View>
  );

  // ===============================================
  // MAIN RENDER
  // ===============================================

  // Show sign-in message if not authenticated
  if (!isAuthenticated || !token) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Meal History</Text>
        </View>
        <View style={styles.notAuthContainer}>
          <Text style={styles.notAuthEmoji}>🔐</Text>
          <Text style={styles.notAuthTitle}>Sign In Required</Text>
          <Text style={styles.notAuthText}>
            Please sign in to view your meal history.
          </Text>
          <Text style={styles.notAuthHint}>
            Use the drawer menu to navigate to Sign In
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meal History</Text>
        <Text style={styles.subtitle}>{total} meals logged</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {renderFilterButton("all", "All Time")}
          {renderFilterButton("today", "Today")}
          {renderFilterButton("week", "This Week")}
          {renderFilterButton("month", "This Month")}
        </ScrollView>
      </View>

      {/* Meals List */}
      <View style={styles.listContainer}>
        {loadingEntries ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={styles.loadingText}>Loading meals...</Text>
          </View>
        ) : loggedEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>No meals found</Text>
            <Text style={styles.emptySubtext}>
              {filterPeriod === "all"
                ? "Start logging meals to see them here!"
                : "No meals logged in this period"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={loggedEntries}
            renderItem={renderLoggedEntry}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </View>
  );
}

// ===============================================
// STYLES
// ===============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 20,
    backgroundColor: BrandColors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },

  // Filter Section
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: BrandColors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },

  // List Container
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },

  // Entry Card
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  entryTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 13,
    color: "#999",
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BBB",
    textAlign: "center",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },

  // Not Authenticated Screen
  notAuthContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F5F5F5",
  },
  notAuthEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: BrandColors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  notAuthText: {
    fontSize: 16,
    color: BrandColors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  notAuthHint: {
    fontSize: 14,
    color: BrandColors.textLight,
    textAlign: "center",
    fontStyle: "italic",
  },
});
