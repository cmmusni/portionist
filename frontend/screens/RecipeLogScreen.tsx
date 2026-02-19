import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { apiUrl } from "../services/config";

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: "spoonacular" | "ai";
  mainIngredient: {
    id: string;
    name: string;
  };
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: {
    stepNumber: number;
    instruction: string;
  }[];
  mealType: string;
  cuisine: string;
  portionSize: number;
  portionUnit: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  calories?: number;
}

interface RecipeLogEntry {
  id: number;
  user_id: string;
  recipe_id: string;
  recipe_data: Recipe;
  interaction_type: "search" | "suggested" | "viewed";
  searched_at: string;
}

const BrandColors = {
  primary: "#5C8A6F",
  secondary: "#A8D24E",
  accent: "#FF9933",
  background: "#F5F5F5",
  text: "#2C3E2F",
  white: "#FFFFFF",
};

export default function RecipeLogScreen({ navigation }: any) {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [recipes, setRecipes] = useState<RecipeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecipeLog = useCallback(async () => {
    if (!userId) {
      console.warn("No userId found");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl(`/recipe-log/${userId}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setRecipes(data.data);
        } else {
          console.warn("Invalid response format:", data);
        }
      } else {
        console.error("Failed to fetch recipe log:", response.status);
      }
    } catch (error) {
      console.error("Error fetching recipe log:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchRecipeLog();
    }, [fetchRecipeLog]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecipeLog();
  };

  const handleRecipePress = (entry: RecipeLogEntry) => {
    navigation.navigate("RecipeDisplay", {
      recipe: entry.recipe_data,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getSourceBadgeColor = (source?: string) => {
    switch (source) {
      case "database":
        return BrandColors.primary;
      case "spoonacular":
        return BrandColors.secondary;
      case "ai":
        return BrandColors.accent;
      default:
        return "#999";
    }
  };

  const getInteractionIcon = (type: string) => {
    return type === "search" ? "🔍" : "✨";
  };

  const renderRecipeItem = ({ item }: { item: RecipeLogEntry }) => {
    const recipe = item.recipe_data;

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => handleRecipePress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri:
              recipe.image ||
              "https://png.pngtree.com/png-vector/20230808/ourmid/pngtree-recipe-card-vector-png-image_6874598.png",
          }}
          style={styles.recipeImage}
        />
        <View style={styles.recipeInfo}>
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeName} numberOfLines={1}>
              {recipe.name}
            </Text>
            <Text style={styles.interactionIcon}>
              {getInteractionIcon(item.interaction_type)}
            </Text>
          </View>

          <View style={styles.recipeDetails}>
            <View
              style={[
                styles.sourceBadge,
                { backgroundColor: getSourceBadgeColor(recipe.source) },
              ]}
            >
              <Text style={styles.sourceBadgeText}>
                {recipe.source || "unknown"}
              </Text>
            </View>
            <Text style={styles.recipeMetadata}>
              {recipe.cuisine} • {recipe.mealType}
            </Text>
          </View>

          <View style={styles.recipeStats}>
            {recipe.calories && (
              <Text style={styles.statText}>🔥 {recipe.calories} cal</Text>
            )}
            {recipe.totalTime > 0 && (
              <Text style={styles.statText}>⏱️ {recipe.totalTime} min</Text>
            )}
            <Text style={styles.timestamp}>{formatDate(item.searched_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Separate recipes by type
  const suggestedRecipes = recipes.filter(
    (entry) => entry.interaction_type === "suggested",
  );
  const searchedRecipes = recipes.filter(
    (entry) => entry.interaction_type === "search",
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={styles.loadingText}>Loading recipe history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[BrandColors.primary, BrandColors.primary + "cc"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerIcon}>📋</Text>
            <Text style={styles.headerTitle}>Recipe Log</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} total
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BrandColors.primary}
            colors={[BrandColors.primary]}
          />
        }
      >
        {/* Suggested Meals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✨</Text>
            <Text style={styles.sectionTitle}>Suggested Meals</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {suggestedRecipes.length}
              </Text>
            </View>
          </View>

          {suggestedRecipes.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                No suggested meals yet
              </Text>
              <Text style={styles.emptySectionSubtext}>
                Visit the Dashboard for personalized meal suggestions
              </Text>
            </View>
          ) : (
            suggestedRecipes.map((item) => (
              <View key={item.id}>{renderRecipeItem({ item })}</View>
            ))
          )}
        </View>

        {/* Searched Recipes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔍</Text>
            <Text style={styles.sectionTitle}>Searched Recipes</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {searchedRecipes.length}
              </Text>
            </View>
          </View>

          {searchedRecipes.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                No searched recipes yet
              </Text>
              <Text style={styles.emptySectionSubtext}>
                Use the Recipe Search to find recipes based on your ingredients
              </Text>
            </View>
          ) : (
            searchedRecipes.map((item) => (
              <View key={item.id}>{renderRecipeItem({ item })}</View>
            ))
          )}
        </View>

        {recipes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No recipe history yet</Text>
            <Text style={styles.emptySubtext}>
              Start searching or viewing suggested recipes!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BrandColors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: BrandColors.text,
    flex: 1,
  },
  countBadge: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptySection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: BrandColors.white,
    borderRadius: 12,
    marginBottom: 15,
  },
  emptySectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  emptySectionSubtext: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },
  listContainer: {
    padding: 15,
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  recipeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: BrandColors.text,
    marginRight: 8,
  },
  interactionIcon: {
    fontSize: 16,
  },
  recipeDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  sourceBadgeText: {
    color: BrandColors.white,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  recipeMetadata: {
    fontSize: 12,
    color: "#666",
  },
  recipeStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginLeft: "auto",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BrandColors.text,
  },
});
