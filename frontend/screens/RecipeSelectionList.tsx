import { BrandColors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: "spoonacular" | "ai";
  matchScore?: number;
}

interface RecipeSelectionListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onGoBack: () => void;
}

const RecipeSelectionList: React.FC<RecipeSelectionListProps> = ({
  recipes,
  onSelectRecipe,
  onGoBack,
}) => {
  const getSourceBadge = (source?: string) => {
    switch (source) {
      case "ai":
        return {
          icon: "✨",
          text: "AI Genarated",
          colors: [BrandColors.accent, BrandColors.accentLight + "cc"],
        };
      case "spoonacular":
        return {
          icon: "🍳",
          text: "Spoonacular",
          colors: [BrandColors.secondary, BrandColors.secondaryLight + "cc"],
        };
      default:
        return {
          icon: "📚",
          text: "System",
          colors: [BrandColors.primary, BrandColors.primary + "cc"],
        };
    }
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    const badge = getSourceBadge(item.source);

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => onSelectRecipe(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={["#ffffff", "#f9fafb"]}
          style={styles.recipeCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.recipeContent}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.recipeImage}
                onError={() => console.log("Failed to load image")}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>🍽️</Text>
              </View>
            )}

            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName} numberOfLines={2}>
                {item.name}
              </Text>

              <LinearGradient
                colors={badge.colors}
                style={styles.sourceBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.sourceBadgeText}>
                  {badge.icon} {badge.text}
                </Text>
              </LinearGradient>

              {typeof item.matchScore === "number" && (
                <View style={styles.scoreContainer}>
                  <LinearGradient
                    colors={["#dcfce7", "#bbf7d0"]}
                    style={styles.scoreBadge}
                  >
                    <Text style={styles.scoreText}>
                      {item.matchScore.toFixed(0)}% Match
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BrandColors.primary, BrandColors.primary + "cc"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onGoBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerIcon}>🍴</Text>
            <Text style={styles.headerTitle}>Recipe Selection</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found
        </Text>
      </LinearGradient>

      {/* Recipe List */}
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search criteria
            </Text>
          </View>
        }
      />

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.searchButtonWrapper}
          onPress={onGoBack}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#6b7280", "#4b5563"]}
            style={styles.searchButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.searchButtonText}>← New Search</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "600",
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 28,
    marginRight: 8,
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
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  recipeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  recipeCardGradient: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  recipeImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  placeholderImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 40,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  recipeName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 22,
    marginBottom: 4,
  },
  sourceBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sourceBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  scoreContainer: {
    marginTop: 4,
  },
  scoreBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  arrow: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  searchButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
});

export default RecipeSelectionList;
