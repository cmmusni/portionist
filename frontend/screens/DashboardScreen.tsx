import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
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
  selectTargetWeight,
  selectUserAge,
} from "../redux/pantrySlice";
import { apiUrl } from "../services/config";

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectAuthUser);
  const currentWeight = useSelector(selectCurrentWeight);
  const targetWeight = useSelector(selectTargetWeight);
  const cuisine = useSelector(selectCuisine);
  const userAge = useSelector(selectUserAge);

  const [suggestedMeals, setSuggestedMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestedMeals = async () => {
    try {
      setLoading(true);
      // Fetch random recipes based on user preferences and weight goals
      const params = new URLSearchParams({
        cuisine: cuisine || "any",
        limit: "6",
        currentWeight: String(currentWeight || 70),
        targetWeight: String(targetWeight || 70),
      });
      const response = await fetch(apiUrl(`/recipes?${params.toString()}`));

      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard API response:", data);
        setSuggestedMeals(data.data || data.recipes || []);
      } else {
        // Fallback to sample data if API fails
        setSuggestedMeals([
          {
            id: "1",
            name: "Grilled Chicken Salad",
            description: "Healthy protein-packed meal",
            calories: 350,
            cuisine: cuisine || "International",
          },
          {
            id: "2",
            name: "Vegetable Stir Fry",
            description: "Quick and nutritious",
            calories: 280,
            cuisine: cuisine || "Asian",
          },
          {
            id: "3",
            name: "Salmon with Quinoa",
            description: "Omega-3 rich meal",
            calories: 420,
            cuisine: cuisine || "Mediterranean",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching suggested meals:", error);
      // Fallback suggestions
      setSuggestedMeals([
        {
          id: "1",
          name: "Healthy Bowl",
          description: "Balanced meal for your goals",
          calories: 400,
          cuisine: cuisine || "International",
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestedMeals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuggestedMeals();
  };

  const handleMealPress = (meal: any) => {
    // Navigate directly to RecipeDisplay with the meal data
    navigation.navigate("RecipeDisplay" as never, { recipe: meal } as never);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3b82f6"
        />
      }
    >
      {/* Welcome Section */}
      <LinearGradient
        colors={["#60a5fa", "#3b82f6"]}
        style={styles.welcomeSection}
      >
        <Text style={styles.welcomeText}>
          Hello, {user?.fullName?.split(" ")[0] || "there"}!
        </Text>
        <Text style={styles.welcomeSubtext}>
          Here are your personalized meal suggestions
        </Text>
      </LinearGradient>

      {/* User Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>⚖️</Text>
          <Text style={styles.statValue}>{currentWeight || "--"} kg</Text>
          <Text style={styles.statLabel}>Current</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🎯</Text>
          <Text style={styles.statValue}>{targetWeight || "--"} kg</Text>
          <Text style={styles.statLabel}>Target</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🍽️</Text>
          <Text style={styles.statValue}>{cuisine || "Any"}</Text>
          <Text style={styles.statLabel}>Cuisine</Text>
        </View>
      </View>

      {/* Suggested Meals Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested Meals</Text>
        <Text style={styles.sectionSubtitle}>
          Based on your preferences and goals
        </Text>
      </View>

      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading meal suggestions...</Text>
        </View>
      )}

      {/* Suggested Meals Grid */}
      {!loading && (
        <View style={styles.mealsGrid}>
          {suggestedMeals.map((meal: any, index: number) => (
            <TouchableOpacity
              key={meal.id || index}
              style={styles.mealCard}
              onPress={() => handleMealPress(meal)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f9ff"]}
                style={styles.mealCardGradient}
              >
                <View style={styles.mealIconContainer}>
                  <Text style={styles.mealIcon}>
                    {["🍗", "🥗", "🍜", "🍲", "🥘", "🍱"][index % 6]}
                  </Text>
                </View>
                <Text style={styles.mealName} numberOfLines={2}>
                  {meal.name || meal.title}
                </Text>
                <Text style={styles.mealDescription} numberOfLines={2}>
                  {meal.description ||
                    meal.summary ||
                    "Delicious and nutritious"}
                </Text>
                <View style={styles.mealFooter}>
                  <View style={styles.caloriesBadge}>
                    <Text style={styles.caloriesText}>
                      {meal.calories || "~400"} cal
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State */}
      {!loading && suggestedMeals.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyText}>No suggestions available</Text>
          <Text style={styles.emptySubtext}>
            Try updating your preferences or refresh the page
          </Text>
        </View>
      )}

      {/* Quick Action Button */}
      <TouchableOpacity
        style={styles.searchButtonContainer}
        onPress={() => navigation.navigate("RecipeInput" as never)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          style={styles.searchButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.searchButtonIcon}>🔍</Text>
          <Text style={styles.searchButtonText}>Search Recipe</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: "#e0f2fe",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  mealsGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  mealCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mealCardGradient: {
    padding: 16,
    minHeight: 200,
  },
  mealIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  mealIcon: {
    fontSize: 28,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
    lineHeight: 20,
  },
  mealDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 12,
    flexGrow: 1,
  },
  mealFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
  },
  caloriesBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  caloriesText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6",
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  searchButtonContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  searchButton: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  searchButtonIcon: {
    fontSize: 20,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  spacer: {
    height: 30,
  },
});

export default DashboardScreen;
