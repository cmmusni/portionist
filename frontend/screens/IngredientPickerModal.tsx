import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Ingredient {
  id: string;
  name: string;
  category?: string;
}

interface IngredientPickerModalProps {
  visible: boolean;
  ingredients: Ingredient[];
  onSelect: (ingredient: Ingredient) => void;
  onClose: () => void;
  selectedIds?: string[];
  multiSelect?: boolean;
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#6b7280",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  listContainer: {
    flex: 1,
  },
  categoryHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  categoryHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  ingredientItemSelected: {
    backgroundColor: "#dbeafe",
  },
  ingredientCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  ingredientCheckboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  ingredientCheckboxText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "bold",
  },
  ingredientName: {
    fontSize: 16,
    color: "#1f2937",
    flex: 1,
  },
  selectedSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#dcfce7",
    borderBottomWidth: 2,
    borderBottomColor: "#86efac",
  },
  selectedSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  selectedIngredientsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedTag: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedTagText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "500",
  },
  selectedTagRemove: {
    marginLeft: 8,
    color: "#16a34a",
    fontWeight: "bold",
  },
  emptyText: {
    padding: 16,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default function IngredientPickerModal({
  visible,
  ingredients,
  onSelect,
  onClose,
  selectedIds = [],
  multiSelect = false,
}: IngredientPickerModalProps) {
  const [searchText, setSearchText] = useState("");

  const filteredAndGrouped = useMemo(() => {
    let filtered = ingredients;

    // Filter by search text
    if (searchText.trim()) {
      filtered = ingredients.filter((ing) =>
        ing.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    } else {
      // If not searching, separate selected from others
      const selectedIngredients = filtered.filter((ing) =>
        selectedIds.includes(ing.id),
      );
      const unselectedIngredients = filtered.filter(
        (ing) => !selectedIds.includes(ing.id),
      );

      // Build data with selected at top
      const data: any[] = [];
      if (selectedIngredients.length > 0) {
        data.push({ type: "selectedHeader" });
        data.push(...selectedIngredients);
      }

      // Group unselected by category
      const grouped: Record<string, Ingredient[]> = {};
      for (const ing of unselectedIngredients) {
        const cat = ing.category || "Other";
        if (!grouped[cat]) {
          grouped[cat] = [];
        }
        grouped[cat].push(ing);
      }

      // Add grouped ingredients
      Object.keys(grouped)
        .sort()
        .forEach((cat) => {
          data.push({ category: cat });
          const sorted = grouped[cat].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
          data.push(...sorted);
        });

      return data;
    }

    // Group by category when searching
    const grouped: Record<string, Ingredient[]> = {};
    for (const ing of filtered) {
      const cat = ing.category || "Other";
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(ing);
    }

    // Sort categories and ingredients
    return Object.keys(grouped)
      .sort()
      .map((cat) => ({
        category: cat,
        ingredients: grouped[cat].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .flatMap((group) => [{ category: group.category }, ...group.ingredients]);
  }, [ingredients, searchText, selectedIds]);

  const renderItem = ({ item }: { item: any }) => {
    // Selected header
    if (item.type === "selectedHeader") {
      const selectedIngredients = ingredients.filter((ing) =>
        selectedIds.includes(ing.id),
      );
      return (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedSectionTitle}>
            {`Selected Ingredient${selectedIngredients.length !== 1 ? "s" : ""}`}
          </Text>
          <View style={styles.selectedIngredientsRow}>
            {selectedIngredients.map((ing) => (
              <TouchableOpacity
                key={ing.id}
                style={styles.selectedTag}
                onPress={() => onSelect(ing)}
                activeOpacity={0.7}
              >
                <Text style={styles.selectedTagText}>{ing.name}</Text>
                <Text style={styles.selectedTagRemove}>✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Check if it's a category header (has no id property)
    if (!item.id) {
      return (
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryHeaderText}>{item.category}</Text>
        </View>
      );
    }

    // Ingredient item
    const ingredient = item as Ingredient;
    const isSelected = selectedIds.includes(ingredient.id);

    return (
      <TouchableOpacity
        style={[
          styles.ingredientItem,
          isSelected && styles.ingredientItemSelected,
        ]}
        onPress={() => onSelect(ingredient)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.ingredientCheckbox,
            isSelected && styles.ingredientCheckboxSelected,
          ]}
        >
          {isSelected && <Text style={styles.ingredientCheckboxText}>✓</Text>}
        </View>
        <Text style={styles.ingredientName}>{ingredient.name}</Text>
      </TouchableOpacity>
    );
  };

  // Prepare flat data for FlatList
  const flatData = useMemo(() => {
    if (searchText.trim()) {
      // When searching, show as is
      return filteredAndGrouped;
    }
    // When not searching, show selected at top
    return filteredAndGrouped;
  }, [filteredAndGrouped, searchText]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {multiSelect ? "Select Ingredients" : "Select Ingredient"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search ingredients..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* List */}
          <View style={styles.listContainer}>
            {flatData && flatData.length > 0 ? (
              <FlatList
                data={flatData}
                keyExtractor={(item, idx) => {
                  if (item.type === "selectedHeader") return "selectedHeader";
                  return !item.id
                    ? `cat-${item.category}`
                    : `ing-${item.id}-${idx}`;
                }}
                renderItem={renderItem}
                scrollEnabled={true}
                removeClippedSubviews={true}
                initialNumToRender={30}
                maxToRenderPerBatch={20}
                updateCellsBatchingPeriod={50}
              />
            ) : (
              <Text style={styles.emptyText}>
                {`No ingredients found matching "${searchText}"`}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
