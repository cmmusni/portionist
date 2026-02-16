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
  instructions: RecipeCookingStep[];
  portionSize: number;
  portionUnit: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
}

interface RecipeDisplayScreenProps {
  recipe: Recipe;
  onFavorite?: (recipeId: string) => void;
  onUnfavorite?: (recipeId: string) => void;
  isFavorited?: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 24,
  },
  recipeImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: "#e5e7eb",
  },
  header: {
    marginBottom: 24,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  infoBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  infoItem: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
  },
  favoriteButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  favoriteButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    marginLeft: 8,
  },
  favoriteButtonActive: {
    backgroundColor: "#fecaca",
    borderColor: "#ef4444",
  },
  favoriteButtonTextActive: {
    color: "#991b1b",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  ingredientName: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
    marginLeft: 12,
  },
  instructionStep: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 4,
  },
  stepInstruction: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  portionInfo: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  portionLabel: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "600",
    flex: 1,
  },
  portionValue: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "700",
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

  const handleFavoriteToggle = async () => {
    setIsLoading(true);

    try {
      if (favorited) {
        onUnfavorite?.(recipe.id);
        setFavorited(false);
      } else {
        onFavorite?.(recipe.id);
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
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                alignSelf: "flex-start",
                backgroundColor:
                  recipe.source === "ai"
                    ? "#f3e8ff"
                    : recipe.source === "spoonacular"
                      ? "#fef3c7"
                      : "#dbeafe",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color:
                    recipe.source === "ai"
                      ? "#8b5cf6"
                      : recipe.source === "spoonacular"
                        ? "#d97706"
                        : "#1e40af",
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
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Prep Time</Text>
                <Text style={styles.infoValue}>{recipe.prepTime} min</Text>
              </View>
            )}
            {recipe.cookTime && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cook Time</Text>
                <Text style={styles.infoValue}>{recipe.cookTime} min</Text>
              </View>
            )}
            {recipe.totalTime && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Time</Text>
                <Text style={styles.infoValue}>{recipe.totalTime} min</Text>
              </View>
            )}
            {recipe.servings && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Servings</Text>
                <Text style={styles.infoValue}>{recipe.servings}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            favorited && styles.favoriteButtonActive,
          ]}
          onPress={handleFavoriteToggle}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>{favorited ? "♥" : "♡"}</Text>
          <Text
            style={[
              styles.favoriteButtonText,
              favorited && styles.favoriteButtonTextActive,
            ]}
          >
            {favorited ? "Saved" : "Save Recipe"}
          </Text>
        </TouchableOpacity>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
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

        {/* Portion Info */}
        <View style={styles.section}>
          <View style={styles.portionInfo}>
            <Text style={styles.portionLabel}>Per Portion</Text>
            <Text style={styles.portionValue}>
              {recipe.portionSize} {recipe.portionUnit}
            </Text>
          </View>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Instructions</Text>
          <FlatList
            data={recipe.instructions}
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
    </ScrollView>
  );
}
