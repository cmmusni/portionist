import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: "database" | "spoonacular" | "ai";
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
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700", flex: 1 }}>
          Select a recipe
        </Text>
        <TouchableOpacity
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: "#f3f4f6",
            borderRadius: 6,
          }}
          onPress={onGoBack}
        >
          <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "500" }}>
            ← Search
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: "#6b7280", marginBottom: 8 }}>
        {`Fetched ${recipes.length} recipe(s)`}
      </Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}
            onPress={() => onSelectRecipe(item)}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    backgroundColor: "#e5e7eb",
                  }}
                  onError={() => console.log("Failed to load image")}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      item.source === "ai"
                        ? "#8b5cf6"
                        : item.source === "spoonacular"
                          ? "#f59e0b"
                          : "#6b7280",
                  }}
                >
                  {item.source === "ai"
                    ? "✨ AI Generated"
                    : item.source === "spoonacular"
                      ? "🍳 Spoonacular"
                      : "📚 Database"}
                </Text>
              </View>
              {typeof item.matchScore === "number" && (
                <Text style={{ color: "#6b7280", fontWeight: "500" }}>
                  {item.matchScore.toFixed(1)}%
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={{
          backgroundColor: "#6b7280",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          marginTop: 12,
          alignItems: "center",
        }}
        onPress={onGoBack}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          ← Back to search
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RecipeSelectionList;
