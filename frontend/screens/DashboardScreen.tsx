import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { BrandColors } from "../../constants/theme";
import { selectAuthUser } from "../redux/authSlice";
import {
  selectCuisine,
  selectCurrentWeight,
  selectTargetWeight,
} from "../redux/pantrySlice";
import { apiUrl } from "../services/config";

// Helper function to determine current meal type based on time of day
const getCurrentMealType = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 16) return "Lunch";
  if (hour >= 16 && hour < 21) return "Dinner";
  return "Snack";
};

// Get emoji for meal type
const getMealTypeEmoji = (mealType: string): string[] => {
  switch (mealType) {
    case "Breakfast":
      return ["🥞", "🍳", "🥐", "🥯", "☕", "🥓"];
    case "Lunch":
      return ["🥗", "🥙", "🍜", "🍱", "🥘", "🍲"];
    case "Dinner":
      return ["🍗", "🥩", "🍖", "🍝", "🍛", "🍕"];
    case "Snack":
      return ["🍎", "🥜", "🍪", "🧀", "🍇", "🥤"];
    default:
      return ["🍽️", "🍴", "🥄", "🥢", "🔪", "🍳"];
  }
};

// Get today's date string (YYYY-MM-DD)
const getTodayDateString = (): string => {
  return new Date().toISOString().split("T")[0];
};

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectAuthUser);
  const currentWeight = useSelector(selectCurrentWeight);
  const targetWeight = useSelector(selectTargetWeight);
  const cuisine = useSelector(selectCuisine);

  const [suggestedMeals, setSuggestedMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestedMeals = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);

      const currentMealType = getCurrentMealType();
      const today = getTodayDateString();
      const cacheKey = `suggested_meals_${user?.userId}_${today}_${currentMealType}`;

      console.log(`[Dashboard] Meal time: ${currentMealType}, Date: ${today}`);

      // Check if we have cached suggestions for this meal time
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const cached = JSON.parse(cachedData);
          console.log(
            `[Dashboard] Using cached suggestions for ${currentMealType}`,
          );
          setSuggestedMeals(cached);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      console.log(
        `[Dashboard] Fetching Spoonacular suggestions for ${currentMealType}`,
      );

      // Fetch 4 recipes from Spoonacular only (no AI generation)
      const response = await fetch(
        apiUrl(
          `/recipes?cuisine=${encodeURIComponent(cuisine || "any")}&mealType=${encodeURIComponent(currentMealType)}&currentWeight=${currentWeight || 70}&targetWeight=${targetWeight || 70}&limit=4`,
        ),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("[Dashboard] API response:", data);

        // Handle both single recipe and array responses
        let recipes = [];
        if (data.data) {
          recipes = Array.isArray(data.data) ? data.data : [data.data];
        } else if (data.recipes) {
          recipes = Array.isArray(data.recipes) ? data.recipes : [data.recipes];
        }

        // Ensure we have at least 2 recipes
        const allRecipes = [...recipes];

        // Spoonacular returns up to 4 recipes based on our limit, we'll take 2-4
        const finalRecipes = allRecipes.slice(0, 4);

        console.log(
          `[Dashboard] Generated ${finalRecipes.length} recipes for ${currentMealType}`,
        );

        // Save each recipe to the recipe log as "suggested"
        if (user?.userId) {
          for (const recipe of finalRecipes) {
            try {
              await fetch(apiUrl(`/recipe-log/${user.userId}`), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  recipeId: recipe.id,
                  recipeData: recipe,
                  interactionType: "suggested",
                }),
              });
            } catch (saveError) {
              console.warn(
                "[Dashboard] Failed to save recipe to log:",
                saveError,
              );
            }
          }
        }

        // Cache the suggestions for this meal time
        await AsyncStorage.setItem(cacheKey, JSON.stringify(finalRecipes));
        console.log(
          `[Dashboard] Cached ${finalRecipes.length} suggestions for ${currentMealType}`,
        );

        setSuggestedMeals(finalRecipes);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Dashboard] API error:", response.status, errorData);

        // Show user-friendly error message for Spoonacular API issues
        if (response.status === 429) {
          console.warn(
            "[Dashboard] Spoonacular rate limit exceeded, using fallback meals",
          );
          Alert.alert(
            "Meal Suggestions Temporarily Unavailable",
            "We've reached our daily limit for recipe suggestions. Please try again later, or browse your Recipe Log for saved meals.",
            [{ text: "OK" }],
          );
        } else if (response.status >= 500) {
          console.warn("[Dashboard] Server error, using fallback meals");
          Alert.alert(
            "Service Temporarily Unavailable",
            "Our recipe service is currently experiencing issues. Please try again in a few minutes.",
            [{ text: "OK" }],
          );
        }

        // Fallback to sample data
        const fallbackMeals = [
          {
            id: `fallback-${Date.now()}-1`,
            name: `Healthy ${currentMealType} Bowl`,
            description: "Balanced meal for your goals",
            calories: 400,
            cuisine: cuisine || "International",
            mealType: currentMealType,
          },
          {
            id: `fallback-${Date.now()}-2`,
            name: `Protein-Packed ${currentMealType}`,
            description: "High protein meal",
            calories: 450,
            cuisine: cuisine || "International",
            mealType: currentMealType,
          },
          {
            id: `fallback-${Date.now()}-3`,
            name: `Light ${currentMealType}`,
            description: "Low calorie option",
            calories: 300,
            cuisine: cuisine || "International",
            mealType: currentMealType,
          },
          {
            id: `fallback-${Date.now()}-4`,
            name: `Classic ${currentMealType}`,
            description: "Traditional favorite",
            calories: 420,
            cuisine: cuisine || "International",
            mealType: currentMealType,
          },
        ];
        setSuggestedMeals(fallbackMeals);
      }
    } catch (error) {
      console.error("Error fetching suggested meals:", error);
      const currentMealType = getCurrentMealType();
      // Fallback suggestions
      setSuggestedMeals([
        {
          id: `error-fallback-${Date.now()}`,
          name: `${currentMealType} Special`,
          description: "Balanced meal for your goals",
          calories: 400,
          cuisine: cuisine || "International",
          mealType: currentMealType,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestedMeals(false); // Don't force refresh on mount
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuggestedMeals(true); // Force refresh when user manually refreshes
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
          tintColor={BrandColors.primary}
        />
      }
    >
      {/* Welcome Section */}
      <LinearGradient
        colors={[BrandColors.primaryLight, BrandColors.primary]}
        style={styles.welcomeSection}
      >
        <Text style={styles.welcomeText}>
          Hello, {user?.fullName?.split(" ")[0] || "there"}!
        </Text>
        <Text style={styles.welcomeSubtext}>
          Here are your personalized meal suggestions
        </Text>
      </LinearGradient>

      {/* Suggested Meals Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>
            {getCurrentMealType()} Suggestions
          </Text>
          <Text style={styles.mealTimeBadge}>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Personalized for this meal time • {suggestedMeals.length} recipes
        </Text>
      </View>

      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={styles.loadingText}>Loading meal suggestions...</Text>
        </View>
      )}

      {/* Suggested Meals Grid */}
      {!loading && (
        <View style={styles.mealsGrid}>
          {suggestedMeals.map((meal: any, index: number) => {
            const currentMealType = getCurrentMealType();
            const mealEmojis = getMealTypeEmoji(currentMealType);

            return (
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
                      {mealEmojis[index % mealEmojis.length]}
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
            );
          })}
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
        <Text style={styles.searchButtonIcon}>🔍</Text>
        <Text style={styles.searchButtonText}>Look for Other Recipe</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.warmWhite,
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
    color: "#ffffff",
    fontWeight: "500",
    opacity: 0.9,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
  },
  mealTimeBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.primary,
    backgroundColor: BrandColors.primaryVeryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    marginTop: 12,
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
    backgroundColor: BrandColors.primaryVeryLight,
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
    backgroundColor: BrandColors.primaryVeryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  caloriesText: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.primary,
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
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.primary,
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
    marginRight: 8,
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
