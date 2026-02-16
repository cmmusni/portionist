import React from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { removeFavorite, selectFavorites } from "../redux/pantrySlice";

interface Recipe {
  id: string;
  name: string;
  mainIngredient: {
    id: string;
    name: string;
  };
  mealType?: string;
  cuisine: string;
  portionSize?: number;
  portionUnit?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  recipeCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipeInfo: {
    flex: 1,
    marginRight: 12,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  recipeDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailBadgeText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  removeButtonText: {
    fontSize: 12,
    color: "#991b1b",
    fontWeight: "600",
  },
  listContentContainer: {
    paddingBottom: 24,
  },
});

export default function FavoritesScreen() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);

  const handleRemoveFavorite = (recipeId: string) => {
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
          onPress: () => {
            dispatch(removeFavorite(recipeId));
          },
          style: "destructive",
        },
      ],
    );
  };

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <View style={styles.recipeCard}>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>

        <View style={styles.recipeDetails}>
          {item.mainIngredient && (
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>
                {item.mainIngredient.name}
              </Text>
            </View>
          )}

          {item.mealType && (
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{item.mealType}</Text>
            </View>
          )}

          {item.cuisine && (
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{item.cuisine}</Text>
            </View>
          )}

          {item.portionSize && (
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>
                {item.portionSize} {item.portionUnit || "g"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>★</Text>
      <Text style={styles.emptyText}>No Favorites Yet</Text>
      <Text style={styles.emptySubtext}>
        Save your favorite recipes to access them quickly
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length === 0
            ? "No saved recipes yet"
            : `${favorites.length} recipe${favorites.length !== 1 ? "s" : ""}`}
        </Text>
      </View>

      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderFavoriteItem}
            contentContainerStyle={styles.listContentContainer}
            scrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
}
