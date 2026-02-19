import { BrandColors } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  addFavorite,
  removeFavorite,
  selectFavorites,
} from "../redux/pantrySlice";
import { RootState } from "../redux/store";
import { apiUrl } from "../services/config";

const getMealIcon = (mealType?: string) => {
  const icons: Record<string, string> = {
    Breakfast: "🍳",
    Lunch: "🍱",
    Dinner: "🍽️",
    Snack: "🥨",
  };
  return icons[mealType || ""] || "🍴";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: BrandColors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
  },
  listContentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIconText: {
    fontSize: 64,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  recipeCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealIcon: {
    fontSize: 24,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    lineHeight: 24,
  },
  recipeDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  primaryBadge: {
    backgroundColor: "#dbeafe",
  },
  cuisineBadge: {
    backgroundColor: "#fef3c7",
  },
  portionBadge: {
    backgroundColor: "#e0e7ff",
  },
  detailBadgeText: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "600",
  },
  detailBadgeTextSecondary: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  removeButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  removeButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    fontSize: 20,
    color: BrandColors.danger,
    fontWeight: "600",
  },
});

export default function FavoritesScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const favorites = useSelector(selectFavorites);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFavorites = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl(`/saveFavorite/${userId}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Clear existing favorites and add fetched ones
          data.data.forEach((recipe: any) => {
            dispatch(addFavorite(recipe));
          });
        }
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    if (!userId) {
      Alert.alert("Error", "User ID not available");
      return;
    }

    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this recipe from your favorites?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: async () => {
            try {
              const response = await fetch(
                apiUrl(`/saveFavorite/${recipeId}`),
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ userId }),
                },
              );

              if (response.ok) {
                dispatch(removeFavorite(recipeId));
              } else {
                Alert.alert("Error", "Failed to remove favorite");
              }
            } catch (error) {
              console.error("Error removing favorite:", error);
              Alert.alert("Error", "Failed to remove favorite");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const renderFavoriteItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => {
        // Navigate to RecipeDisplay with the favorite recipe
        navigation.navigate(
          "RecipeDisplay" as never,
          { recipe: item } as never,
        );
      }}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={["#ffffff", "#f0f9ff"]}
        style={styles.recipeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.mealIcon}>{getMealIcon(item.mealType)}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              // Prevent card click when tapping remove button
              e.stopPropagation();
              handleRemoveFavorite(item.id);
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#fee2e2", "#fecaca"]}
              style={styles.removeButtonGradient}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.recipeDetails}>
            {item.mainIngredient && (
              <View style={[styles.detailBadge, styles.primaryBadge]}>
                <Text style={styles.detailBadgeText}>
                  🥘 {item.mainIngredient.name}
                </Text>
              </View>
            )}

            {item.cuisine && (
              <View style={[styles.detailBadge, styles.cuisineBadge]}>
                <Text style={styles.detailBadgeTextSecondary}>
                  🌍 {item.cuisine}
                </Text>
              </View>
            )}

            {item.portionSize && (
              <View style={[styles.detailBadge, styles.portionBadge]}>
                <Text style={styles.detailBadgeTextSecondary}>
                  📏 {item.portionSize}
                  {item.portionUnit || "g"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={["#fef2f2", "#fee2e2"]} style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>❤️</Text>
      </LinearGradient>
      <Text style={styles.emptyText}>No Favorites Yet</Text>
      <Text style={styles.emptySubtext}>
        {`Start saving recipes you love and\nthey'll appear here for quick
        access`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[BrandColors.primary, BrandColors.primary + "cc"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerIcon}>❤️</Text>
            <Text style={styles.headerTitle}>My Favorites</Text>
          </View>
          <Text style={styles.headerSubtitle}>Loading...</Text>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={{ marginTop: 12, color: "#666" }}>
            Loading favorites...
          </Text>
        </View>
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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerIcon}>❤️</Text>
          <Text style={styles.headerTitle}>My Favorites</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {favorites.length === 0
            ? "No saved recipes yet"
            : `${favorites.length} saved recipe${favorites.length !== 1 ? "s" : ""}`}
        </Text>
      </LinearGradient>

      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
