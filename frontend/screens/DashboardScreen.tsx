import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import type { RootState } from "../redux/store";
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
  const token = useSelector((state: RootState) => state.auth.token);
  const currentWeight = useSelector(selectCurrentWeight);
  const targetWeight = useSelector(selectTargetWeight);
  const cuisine = useSelector(selectCuisine);

  const [suggestedMeals, setSuggestedMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyMotivation, setDailyMotivation] = useState<string>("");
  const [motivationLoading, setMotivationLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Plate Balance state
  const [plateBalanceTotals, setPlateBalanceTotals] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    portionScore: 0,
  });
  const [plateBalanceLoading, setPlateBalanceLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  // Search and Entries state
  const [entries, setEntries] = useState<any[]>([]);

  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(apiUrl("/health"), {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setBackendAvailable(true);
        setConnectionError(null);
        return true;
      } else {
        throw new Error("Backend returned non-OK status");
      }
    } catch (error: any) {
      console.error("Backend health check failed:", error);
      setBackendAvailable(false);
      
      if (error.name === 'AbortError') {
        setConnectionError("Connection timeout - backend may be slow or unavailable");
      } else {
        setConnectionError("Cannot connect to backend server");
      }
      return false;
    }
  };

  const fetchDailyMotivation = async () => {
    try {
      setMotivationLoading(true);
      const response = await fetch(apiUrl("/motivation/daily"));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success && result.data?.motivation) {
        setDailyMotivation(result.data.motivation);
      } else {
        // Fallback motivations if API fails
        const fallbackMotivations = [
          "Nourish your body, fuel your dreams with every healthy bite.",
          "Every healthy meal is a step towards a better you.",
          "Choose foods that make your body thank you later.",
          "Healthy eating today creates a stronger tomorrow.",
          "Your body deserves the best fuel you can give it.",
        ];
        setDailyMotivation(
          fallbackMotivations[
            Math.floor(Math.random() * fallbackMotivations.length)
          ],
        );
      }
    } catch (error: any) {
      console.error("Error fetching daily motivation:", error);
      // Check if it's a connection error
      if (error.message.includes('fetch') || error.message.includes('network')) {
        await checkBackendHealth();
      }
      setDailyMotivation("Eat well, feel great, live better!");
    } finally {
      setMotivationLoading(false);
    }
  };

  const fetchPlateBalance = async () => {
    if (!token) {
      return;
    }

    try {
      setPlateBalanceLoading(true);

      // Fetch entries and totals in parallel
      const [entriesResponse, totalsResponse] = await Promise.all([
        fetch(apiUrl("/api/food/entries/today"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(apiUrl("/api/food/today"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (entriesResponse.ok && totalsResponse.ok) {
        const entriesData = await entriesResponse.json();
        const totalsData = await totalsResponse.json();

        console.log("📊 Entries data received:", entriesData);
        console.log("📊 Number of entries:", entriesData?.data?.length || 0);

        // Set entries
        if (entriesData.success && Array.isArray(entriesData.data)) {
          console.log("✅ Setting entries:", entriesData.data);
          setEntries(entriesData.data);
        } else {
          console.log("⚠️ No valid entries data, setting empty array");
          setEntries([]);
        }

        // Set totals
        setPlateBalanceTotals({
          protein: totalsData.protein || 0,
          carbs: totalsData.carbs || 0,
          fat: totalsData.fat || 0,
          calories: totalsData.calories || 0,
          proteinPercent: totalsData.proteinPercent || 0,
          carbsPercent: totalsData.carbsPercent || 0,
          fatPercent: totalsData.fatPercent || 0,
          portionScore: totalsData.portionScore || 0,
        });

        // Animate fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    } catch (error: any) {
      console.error("Error fetching plate balance:", error);
      // Check if it's a connection error
      if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
        await checkBackendHealth();
      }
    } finally {
      setPlateBalanceLoading(false);
    }
  };

  const deleteEntry = async (id: number) => {
    console.log("=== DELETE ENTRY CALLED ===");
    console.log("Entry ID:", id);
    console.log("Entry ID type:", typeof id);
    console.log("Token available:", !!token);
    console.log(
      "Token value:",
      token ? `${token.substring(0, 20)}...` : "null",
    );

    if (!token) {
      console.error("❌ No token available for delete");
      Alert.alert("Error", "Please sign in to remove meals");
      return;
    }

    console.log("✅ Token is available, showing alert...");
    console.log("Platform:", Platform.OS);

    // Capture token in a local variable to ensure it's available in the closure
    const authToken = token;

    const performDelete = async () => {
      console.log("Delete confirmed, making request...");
      console.log(
        "Using token:",
        authToken ? `${authToken.substring(0, 20)}...` : "null",
      );
      console.log("Delete URL:", apiUrl(`/api/food/entries/${id}`));

      try {
        const response = await fetch(apiUrl(`/api/food/entries/${id}`), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Delete response status:", response.status);

        if (response.ok) {
          console.log("Delete successful, refreshing data...");
          if (Platform.OS === "web") {
            alert("Meal removed from your plate");
          } else {
            Alert.alert("Success", "Meal removed from your plate");
          }
          fetchPlateBalance(); // Refresh data
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Delete failed:", errorData);
          if (Platform.OS === "web") {
            alert(`Error: ${errorData.error || "Failed to remove meal"}`);
          } else {
            Alert.alert("Error", errorData.error || "Failed to remove meal");
          }
        }
      } catch (error) {
        console.error("Error removing meal:", error);
        if (Platform.OS === "web") {
          alert("Error: Could not remove meal");
        } else {
          Alert.alert("Error", "Could not remove meal");
        }
      }
    };

    // Use window.confirm for web, Alert.alert for native
    if (Platform.OS === "web") {
      console.log("Using window.confirm for web platform");
      if (window.confirm("Remove this meal from your plate?")) {
        await performDelete();
      }
    } else {
      console.log("Using Alert.alert for native platform");
      Alert.alert("Remove Meal", "Remove this meal from your plate?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: performDelete,
        },
      ]);
    }
  };

  const fetchSuggestedMeals = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);

      const currentMealType = getCurrentMealType();
      const today = getTodayDateString();
      const cacheKey = `suggested_meals_${user?.userId}_${today}_${currentMealType}`;
      const cacheTimestampKey = `${cacheKey}_timestamp`;

      console.log(`[Dashboard] Meal time: ${currentMealType}, Date: ${today}`);

      // Check if we have cached suggestions (valid for 6 hours to reduce API calls)
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        const cachedTimestamp = await AsyncStorage.getItem(cacheTimestampKey);

        if (cachedData && cachedTimestamp) {
          const cacheAge = Date.now() - parseInt(cachedTimestamp);
          const SIX_HOURS = 6 * 60 * 60 * 1000;

          // Use cache if less than 6 hours old
          if (cacheAge < SIX_HOURS) {
            const cached = JSON.parse(cachedData);
            console.log(
              `[Dashboard] Using cached suggestions (${Math.round(cacheAge / (60 * 60 * 1000))}h old)`,
            );
            setSuggestedMeals(cached);
            setLoading(false);
            setRefreshing(false);
            return;
          }
        }
      }

      console.log(
        `[Dashboard] Fetching Spoonacular suggestions for ${currentMealType}`,
      );

      // Fetch only 2 recipes to conserve API quota (free tier: 150 requests/day)
      const response = await fetch(
        apiUrl(
          `/recipes?cuisine=${encodeURIComponent(cuisine || "any")}&mealType=${encodeURIComponent(currentMealType)}&currentWeight=${currentWeight || 70}&targetWeight=${targetWeight || 70}&limit=2`,
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

        // Take up to 2 recipes to reduce API calls
        const finalRecipes = allRecipes.slice(0, 2);

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

        // Cache the suggestions with timestamp (6 hour expiration)
        await AsyncStorage.setItem(cacheKey, JSON.stringify(finalRecipes));
        await AsyncStorage.setItem(cacheTimestampKey, Date.now().toString());
        console.log(
          `[Dashboard] Cached ${finalRecipes.length} suggestions for ${currentMealType} (6h expiration)`,
        );

        setSuggestedMeals(finalRecipes);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Dashboard] API error:", response.status, errorData);

        // Show user-friendly error message for Spoonacular API issues
        if (response.status === 429 || response.status === 402) {
          console.warn(
            "[Dashboard] Spoonacular rate limit exceeded, using fallback meals",
          );
          Alert.alert(
            "Daily Recipe Limit Reached",
            "We've reached our daily limit for new recipes (Spoonacular API limits). Your cached suggestions will continue to work. The limit resets at midnight UTC.",
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

        // Fallback to sample data (only 2 to match new limit)
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
        ];
        setSuggestedMeals(fallbackMeals);

        // Cache fallback meals too
        await AsyncStorage.setItem(cacheKey, JSON.stringify(fallbackMeals));
        await AsyncStorage.setItem(cacheTimestampKey, Date.now().toString());
      }
    } catch (error: any) {
      console.error("Error fetching suggested meals:", error);
      
      // Check backend health if it's a network error
      if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'))) {
        const isBackendUp = await checkBackendHealth();
        if (!isBackendUp) {
          Alert.alert(
            "Backend Unavailable",
            "Unable to connect to the recipe server. Please check your internet connection or try again later.",
            [{ text: "OK" }]
          );
        }
      }
      
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
    (async () => {
      await checkBackendHealth(); // Check backend availability on mount
      fetchDailyMotivation();
      fetchSuggestedMeals(false); // Don't force refresh on mount
    })();
  }, []);

  // Refresh Today's Meals every time Dashboard screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPlateBalance();
    }, [token]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDailyMotivation();
    fetchPlateBalance();
    fetchSuggestedMeals(true); // Force refresh when user manually refreshes
  };

  const handleMealPress = (meal: any) => {
    // Navigate directly to RecipeDisplay with the meal data
    navigation.navigate("RecipeDisplay" as never, { recipe: meal } as never);
  };

  const getPortionScoreColor = (score: number): string => {
    if (score >= 80) return BrandColors.success;
    if (score >= 60) return BrandColors.accent;
    return BrandColors.dangerLight;
  };

  const getPortionScoreLabel = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Balance";
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
      {/* Backend Connection Error Banner */}
      {!backendAvailable && connectionError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <View style={styles.errorTextContainer}>
            <Text style={styles.errorTitle}>Connection Issue</Text>
            <Text style={styles.errorMessage}>{connectionError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={async () => {
                const isUp = await checkBackendHealth();
                if (isUp) {
                  onRefresh();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Today's Plate Balance */}
      {token && (
        <View style={styles.plateBalanceSection}>
          <LinearGradient
            colors={[BrandColors.primary, BrandColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.plateBalanceCard}
          >
            <Text style={styles.plateBalanceTitle}>
              Today&apos;s Plate Balance
            </Text>

            {plateBalanceLoading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <Animated.View style={{ opacity: fadeAnim }}>
                {/* Portion Score Badge */}
                <View style={styles.scoreBadgeContainer}>
                  <View
                    style={[
                      styles.scoreBadge,
                      {
                        backgroundColor: getPortionScoreColor(
                          plateBalanceTotals.portionScore,
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.scoreValue}>
                      {Math.round(plateBalanceTotals.portionScore)}
                    </Text>
                    <Text style={styles.scoreLabel}>
                      {getPortionScoreLabel(plateBalanceTotals.portionScore)}
                    </Text>
                  </View>
                </View>

                {/* Macro Totals */}
                <View style={styles.macroGrid}>
                  <View style={styles.macroGridItem}>
                    <Text style={styles.macroGridValue}>
                      {plateBalanceTotals.protein}g
                    </Text>
                    <Text style={styles.macroGridLabel}>Protein</Text>
                    <Text style={styles.macroGridPercent}>
                      {Math.round(plateBalanceTotals.proteinPercent)}%
                    </Text>
                  </View>
                  <View style={styles.macroGridItem}>
                    <Text style={styles.macroGridValue}>
                      {plateBalanceTotals.carbs}g
                    </Text>
                    <Text style={styles.macroGridLabel}>Carbs</Text>
                    <Text style={styles.macroGridPercent}>
                      {Math.round(plateBalanceTotals.carbsPercent)}%
                    </Text>
                  </View>
                  <View style={styles.macroGridItem}>
                    <Text style={styles.macroGridValue}>
                      {plateBalanceTotals.fat}g
                    </Text>
                    <Text style={styles.macroGridLabel}>Fat</Text>
                    <Text style={styles.macroGridPercent}>
                      {Math.round(plateBalanceTotals.fatPercent)}%
                    </Text>
                  </View>
                </View>

                {/* Calories */}
                <View style={styles.caloriesContainer}>
                  <Text style={styles.caloriesValue}>
                    {plateBalanceTotals.calories}
                  </Text>
                  <Text style={styles.caloriesLabel}>Total Calories</Text>
                </View>
              </Animated.View>
            )}
          </LinearGradient>
        </View>
      )}

      {/* Daily Motivation Section */}
      <View style={styles.motivationSection}>
        <View style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <Text style={styles.motivationIcon}>💪</Text>
            <Text style={styles.motivationTitle}>Daily Motivation</Text>
          </View>
          {motivationLoading ? (
            <View style={styles.motivationLoadingContainer}>
              <ActivityIndicator size="small" color={BrandColors.primary} />
            </View>
          ) : (
            <Text style={styles.motivationText}>{dailyMotivation}</Text>
          )}
        </View>
      </View>

      {/* Today's Meals Section */}
      {token && (
        <View style={styles.entriesSection}>
          <Text style={styles.entriesSectionTitle}>Today&apos;s Entries</Text>

          {(() => {
            console.log("📋 Rendering entries section, count:", entries.length);
            console.log("📋 Entries:", entries);
            return null;
          })()}

          {plateBalanceLoading ? (
            <View style={styles.entriesLoadingContainer}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
              <Text style={styles.entriesLoadingText}>Loading entries...</Text>
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.entriesEmptyState}>
              <Text style={styles.entriesEmptyEmoji}>🍽️</Text>
              <Text style={styles.entriesEmptyText}>
                No meals logged yet today.
              </Text>
              <Text style={styles.entriesEmptyHint}>
                Search and add meals above to improve your balance.
              </Text>
            </View>
          ) : (
            <View style={styles.entriesContainer}>
              {entries.map((entry: any) => {
                console.log("Rendering entry:", entry.id, entry.title);
                return (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle} numberOfLines={2}>
                        {entry.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.entryDeleteButton}
                        onPress={() => {
                          console.log(
                            "🔴 DELETE BUTTON PRESSED for entry:",
                            entry.id,
                          );
                          deleteEntry(entry.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.entryDeleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.entryMacroRow}>
                      <Text style={styles.entryMacro}>
                        P: {entry.nutrition.protein}g
                      </Text>
                      <Text style={styles.entryMacro}>
                        C: {entry.nutrition.carbs}g
                      </Text>
                      <Text style={styles.entryMacro}>
                        F: {entry.nutrition.fat}g
                      </Text>
                      <Text style={styles.entryMacro}>
                        {entry.nutrition.calories} cal
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Suggested Meals Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>
            Improve Your Plate Balance with our {getCurrentMealType()}{" "}
            Suggestions
          </Text>
        </View>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionSubtitle}>
            Personalized for this meal time
          </Text>
          <Text style={styles.mealTimeBadge}>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
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
        <Text style={styles.searchButtonText}>Search for more Recipe</Text>
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
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: "#DC2626",
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
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
  motivationSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  motivationCard: {
    backgroundColor: BrandColors.primaryVeryLight,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.primary,
  },
  motivationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  motivationIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.primary,
  },
  motivationText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    fontStyle: "italic",
    fontWeight: "500",
  },
  motivationLoadingContainer: {
    paddingVertical: 8,
    alignItems: "flex-start",
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
    marginHorizontal: 20,
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
  plateBalanceSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  plateBalanceCard: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  plateBalanceTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 24,
    textAlign: "center",
  },
  scoreBadgeContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  scoreBadge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#ffffff",
    lineHeight: 52,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  macroGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  macroGridItem: {
    alignItems: "center",
  },
  macroGridValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  macroGridLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 4,
  },
  macroGridPercent: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
  },
  caloriesContainer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
  },
  caloriesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  spacer: {
    height: 30,
  },
  // Improve Your Balance Section
  improveSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  improveSectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  improveSectionHelper: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  improveSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  improveSearchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  improveSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  improveSearchLoader: {
    marginLeft: 12,
  },
  improveResultsContainer: {
    marginBottom: 12,
  },
  improveResultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  improveResultTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 14,
  },
  improveResultMacroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  improveResultMacroItem: {
    alignItems: "center",
  },
  improveResultMacroValue: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.primary,
    marginBottom: 2,
  },
  improveResultMacroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  improveAddButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  improveAddButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },

  // Today's Meals Section
  entriesSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  entriesSectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 20,
  },
  entriesLoadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  entriesLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  entriesEmptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  entriesEmptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  entriesEmptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  entriesEmptyHint: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
  entriesContainer: {
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    marginRight: 12,
  },
  entryDeleteButton: {
    padding: 4,
  },
  entryDeleteIcon: {
    fontSize: 20,
  },
  entryMacroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
  },
  entryMacro: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
});

export default DashboardScreen;
