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
import { BrandColors } from "../../constants/theme";

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
    color: BrandColors.primaryDark,
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
  const [favorited, setFavorited] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);

  // Sync favorited state with prop changes
  React.useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

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
      </View>
    </ScrollView>
  );
}
