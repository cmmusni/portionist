import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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

interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeCookingStep {
  stepNumber: number;
  instruction: string;
}

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: "database" | "spoonacular" | "ai";
  ingredients: RecipeIngredient[];
  instructions: RecipeCookingStep[] | string[];
  portionSize: number;
  portionUnit: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface RecipeDisplayScreenProps {
  recipe: Recipe;
  onFavorite?: () => void;
  onUnfavorite?: () => void;
  isFavorited?: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingBottom: 24,
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  recipeImage: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 16,
  },
  recipeName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  infoBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    minWidth: 90,
  },
  infoLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
  },
  favoriteButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: BrandColors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  favoriteButtonText: {
    color: BrandColors.white,
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 16,
  },
  favoriteButtonInactive: {
    backgroundColor: BrandColors.white,
    borderWidth: 2,
    borderColor: BrandColors.danger,
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  favoriteButtonTextInactive: {
    color: BrandColors.danger,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: BrandColors.gray50,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.success,
  },
  ingredientName: {
    fontSize: 15,
    color: BrandColors.textPrimary,
    flex: 1,
    fontWeight: "500",
  },
  ingredientQuantity: {
    fontSize: 14,
    color: BrandColors.successDark,
    fontWeight: "700",
    marginLeft: 12,
    backgroundColor: BrandColors.successVeryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  instructionStep: {
    marginBottom: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: BrandColors.primaryVeryLight,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: BrandColors.primary,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: BrandColors.primaryLight,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepInstruction: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 22,
    fontWeight: "400",
  },
  portionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    overflow: "hidden",
  },
  portionLabel: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
    flex: 1,
  },
  portionValue: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function RecipeDisplayScreen({
  recipe,
  onFavorite,
  onUnfavorite,
  isFavorited = false,
}: RecipeDisplayScreenProps) {
  const token = useSelector((state: RootState) => state.auth.token);
  const [favorited, setFavorited] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingFood, setIsLoggingFood] = useState(false);
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);
  const [checkingLogStatus, setCheckingLogStatus] = useState(true);

  // Sync favorited state with prop changes
  React.useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  // Check if recipe is already logged today
  React.useEffect(() => {
    const checkIfAlreadyLogged = async () => {
      console.log("=== CHECK IF ALREADY LOGGED ===");
      console.log("Recipe ID to check:", recipe.id);
      console.log("Recipe source:", recipe.source);
      console.log("Recipe name:", recipe.name);
      console.log("Has token:", !!token);

      if (!token || !recipe.id) {
        console.log("Skipping check - missing requirements");
        setCheckingLogStatus(false);
        return;
      }

      try {
        const response = await fetch(apiUrl("/api/food/entries/today"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("GET /api/food/entries/today status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Today's entries response:", data);
          console.log("Number of entries:", data.data?.length || 0);

          if (data.success && Array.isArray(data.data)) {
            let isLogged = false;

            if (recipe.source === "spoonacular") {
              // For Spoonacular recipes, check by recipe ID
              const numericId = parseInt(
                recipe.id.replace(/^spoonacular-/, ""),
                10,
              );
              console.log("Looking for recipeId:", numericId);
              console.log(
                "Entry recipeIds:",
                data.data.map((e: any) => e.recipeId),
              );

              isLogged = data.data.some(
                (entry: any) => entry.recipeId === numericId,
              );
            } else {
              // For AI/custom recipes, check by title (case-insensitive)
              console.log("Looking for title:", recipe.name);
              console.log(
                "Entry titles:",
                data.data.map((e: any) => e.title),
              );

              isLogged = data.data.some(
                (entry: any) =>
                  entry.title.toLowerCase() === recipe.name.toLowerCase(),
              );
            }

            console.log("Is already logged?", isLogged);

            if (isLogged) {
              const matchingEntry = data.data.find((entry: any) =>
                recipe.source === "spoonacular"
                  ? entry.recipeId ===
                    parseInt(recipe.id.replace(/^spoonacular-/, ""), 10)
                  : entry.title.toLowerCase() === recipe.name.toLowerCase(),
              );
              console.log("Matching entry found:", matchingEntry);
            }

            setIsAlreadyLogged(isLogged);
          }
        }
      } catch (error) {
        console.error("Error checking log status:", error);
      } finally {
        setCheckingLogStatus(false);
      }
    };

    checkIfAlreadyLogged();
  }, [token, recipe.id, recipe.source, recipe.name]);

  // Normalize instructions to handle both string[] and RecipeCookingStep[]
  const normalizedInstructions: RecipeCookingStep[] = React.useMemo(() => {
    if (!recipe.instructions || recipe.instructions.length === 0) return [];

    // Check if it's already in the correct format
    if (
      typeof recipe.instructions[0] === "object" &&
      "stepNumber" in recipe.instructions[0]
    ) {
      return recipe.instructions as RecipeCookingStep[];
    }

    // Convert string[] to RecipeCookingStep[]
    return (recipe.instructions as string[]).map((instruction, index) => ({
      stepNumber: index + 1,
      instruction,
    }));
  }, [recipe.instructions]);

  const handleLogToFoodLog = async () => {
    console.log("=== LOG TO FOOD LOG STARTED ===");
    console.log("Recipe Name:", recipe.name);
    console.log("Recipe ID (raw):", recipe.id);
    console.log("Recipe ID type:", typeof recipe.id);
    console.log("Recipe source:", recipe.source);
    console.log("Full recipe object:", JSON.stringify(recipe, null, 2));

    if (!token) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to log meals to your Food Log.",
      );
      return;
    }

    setIsLoggingFood(true);

    try {
      // Handle AI and custom recipes differently from Spoonacular
      if (recipe.source === "ai" || recipe.source === "database") {
        console.log("Logging AI/Custom recipe:", recipe.name);

        // Estimate macros from calories for AI recipes
        // Using typical macro distribution: 30% protein, 40% carbs, 30% fat
        const calories = recipe.calories || 500;
        const protein = Math.round((calories * 0.3) / 4); // 4 cal/g
        const carbs = Math.round((calories * 0.4) / 4); // 4 cal/g
        const fat = Math.round((calories * 0.3) / 9); // 9 cal/g

        const requestBody = {
          title: recipe.name,
          protein,
          carbs,
          fat,
          calories,
          recipeIdentifier: recipe.id,
        };

        console.log("Custom recipe request body:", requestBody);

        const response = await fetch(apiUrl("/api/food/log-custom"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Success response:", data);

          setIsAlreadyLogged(true);

          Alert.alert(
            "Added to Your Plate! 🎉",
            `${recipe.name} has been added to your plate!\n\nEstimated Nutrition:\n🥩 Protein: ${protein}g\n🍚 Carbs: ${carbs}g\n🥑 Fat: ${fat}g\n🔥 Calories: ${calories}\n\nCheck your Dashboard to see your updated plate balance!`,
            [{ text: "Got it!" }],
          );
        } else {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          Alert.alert("Error", errorData.error || "Failed to log meal");
        }
        return;
      }

      // Handle Spoonacular recipes
      if (!recipe.id) {
        Alert.alert("Error", "Recipe ID not found");
        return;
      }

      // Parse and validate recipe ID
      const rawId = String(recipe.id);
      console.log("Raw ID as string:", rawId);

      const numericId = rawId.replace(/^spoonacular-/, "");
      console.log("After stripping prefix:", numericId);

      const recipeIdNum = parseInt(numericId, 10);
      console.log("Final parsed recipeId:", recipeIdNum);
      console.log("Is valid number:", !isNaN(recipeIdNum));

      if (isNaN(recipeIdNum)) {
        console.error("Invalid recipe ID - NaN:", recipe.id);
        Alert.alert("Error", "Invalid recipe ID format");
        return;
      }

      console.log("Logging Spoonacular recipe:", {
        recipeId: recipeIdNum,
        recipeName: recipe.name,
      });

      const requestBody = {
        recipeId: recipeIdNum,
      };

      console.log("Request body:", JSON.stringify(requestBody));

      const response = await fetch(apiUrl("/api/food/log"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Success response:", data);

        setIsAlreadyLogged(true);

        Alert.alert(
          "Added to Your Plate! 🎉",
          `${recipe.name} has been added to your plate!\n\nNutrition Info:\n🥩 Protein: ${data.data.nutrition.protein}g\n🍚 Carbs: ${data.data.nutrition.carbs}g\n🥑 Fat: ${data.data.nutrition.fat}g\n🔥 Calories: ${data.data.nutrition.calories}\n\nCheck your Dashboard to see your updated plate balance!`,
          [{ text: "Got it!" }],
        );
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        Alert.alert("Error", errorData.error || "Failed to log meal");
      }
    } catch (error) {
      console.error("Error logging to food log:", error);
      Alert.alert("Error", "Could not log meal. Please check your connection.");
    } finally {
      setIsLoggingFood(false);
    }
  };

  const handleFavoriteToggle = async () => {
    setIsLoading(true);

    try {
      if (favorited) {
        onUnfavorite?.();
        setFavorited(false);
      } else {
        onFavorite?.();
        setFavorited(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update favorite");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[
            BrandColors.primaryLight,
            BrandColors.primary,
            BrandColors.primaryDark,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Recipe Image */}
          {recipe.image && (
            <Image
              source={{ uri: recipe.image }}
              style={styles.recipeImage}
              onError={() => console.log("Failed to load image")}
            />
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.recipeName}>{recipe.name}</Text>

            {/* Source Badge */}
            {recipe.source && (
              <View
                style={{
                  marginBottom: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#ffffff",
                  }}
                >
                  {recipe.source === "ai"
                    ? "✨ AI Generated"
                    : recipe.source === "spoonacular"
                      ? "🍳 Spoonacular"
                      : "📚 Database"}
                </Text>
              </View>
            )}

            {/* Info Bar */}
            <View style={styles.infoBar}>
              {recipe.prepTime && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>⏱️ Prep</Text>
                  <Text style={styles.infoValue}>{recipe.prepTime}m</Text>
                </View>
              )}
              {recipe.cookTime && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>🔥 Cook</Text>
                  <Text style={styles.infoValue}>{recipe.cookTime}m</Text>
                </View>
              )}
              {recipe.totalTime && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>⏰ Total</Text>
                  <Text style={styles.infoValue}>{recipe.totalTime}m</Text>
                </View>
              )}
              {recipe.servings && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>🍽️ Serves</Text>
                  <Text style={styles.infoValue}>{recipe.servings}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Favorite Button */}
        <View style={styles.favoriteButtonContainer}>
          {favorited ? (
            <LinearGradient
              colors={[BrandColors.danger, BrandColors.dangerDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.favoriteButton}
            >
              <TouchableOpacity
                onPress={handleFavoriteToggle}
                disabled={isLoading}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 20, color: BrandColors.white }}>
                  ♥
                </Text>
                <Text style={styles.favoriteButtonText}>
                  Saved to Favorites
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              style={[styles.favoriteButton, styles.favoriteButtonInactive]}
              onPress={handleFavoriteToggle}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20, color: BrandColors.danger }}>♡</Text>
              <Text
                style={[
                  styles.favoriteButtonText,
                  styles.favoriteButtonTextInactive,
                ]}
              >
                Save Recipe
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥘 Ingredients</Text>
          <View style={styles.sectionCard}>
            <FlatList
              data={recipe.ingredients}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>{item.name}</Text>
                  <Text style={styles.ingredientQuantity}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        {/* Portion Info */}
        <View style={styles.section}>
          <LinearGradient
            colors={[BrandColors.success, BrandColors.successDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.portionCard}
          >
            <Text style={styles.portionLabel}>📊 Per Portion</Text>
            <Text style={styles.portionValue}>
              {recipe.portionSize} {recipe.portionUnit}
            </Text>
          </LinearGradient>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🍳 Cooking Instructions</Text>
          <View style={styles.sectionCard}>
            <FlatList
              data={normalizedInstructions}
              keyExtractor={(item) => item.stepNumber.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>Step {item.stepNumber}</Text>
                  <Text style={styles.stepInstruction}>{item.instruction}</Text>
                </View>
              )}
            />
          </View>
        </View>

        {/* Add to My Plate Button */}
        <View style={styles.favoriteButtonContainer}>
          <LinearGradient
            colors={
              isAlreadyLogged
                ? [BrandColors.successDark, BrandColors.success] // Green for already logged
                : isLoggingFood || checkingLogStatus
                  ? [BrandColors.gray100, BrandColors.gray500]
                  : [BrandColors.accent, BrandColors.accentLight]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.favoriteButton,
              {
                shadowColor: isAlreadyLogged
                  ? "#10b981"
                  : isLoggingFood || checkingLogStatus
                    ? "#000"
                    : BrandColors.success,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isLoggingFood || checkingLogStatus ? 0.1 : 0.4,
                shadowRadius: 12,
                elevation: isLoggingFood || checkingLogStatus ? 2 : 8,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleLogToFoodLog}
              disabled={isLoggingFood || isAlreadyLogged || checkingLogStatus}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  color: "#ffffff",
                  marginRight: 2,
                }}
              >
                {isAlreadyLogged ? "✓" : "✨"}
              </Text>
              <Text
                style={[
                  styles.favoriteButtonText,
                  {
                    fontSize: 17,
                    fontWeight: "800",
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {isAlreadyLogged
                  ? "Already on Your Plate"
                  : isLoggingFood
                    ? "Adding..."
                    : checkingLogStatus
                      ? "Checking..."
                      : "Add to My Plate"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}
