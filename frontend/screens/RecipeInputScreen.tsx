import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BrandColors } from "../../constants/theme";
import { apiUrl } from "../services/config";
import IngredientPickerModal from "./IngredientPickerModal";

interface Ingredient {
  id: string;
  name: string;
  category?: string;
  isPantry?: boolean;
}

interface RecipeInputValues {
  ingredients: Ingredient[];
  cuisine: string;
  mealType: string;
  cookingMethod?: string;
}

interface RecipeInputScreenProps {
  handleGenerateRecipe: (values: RecipeInputValues) => void;
  defaultCuisine?: string;
}

// Fallback ingredients for offline mode
const FALLBACK_COMMON_INGREDIENTS: Ingredient[] = [
  { id: "chicken", name: "Chicken" },
  { id: "chicken_breast", name: "Chicken Breast" },
  { id: "beef", name: "Beef" },
  { id: "pork", name: "Pork" },
  { id: "lamb", name: "Lamb" },
  { id: "turkey", name: "Turkey" },
  { id: "fish", name: "Fish" },
  { id: "salmon", name: "Salmon" },
  { id: "shrimp", name: "Shrimp" },
];

// Fallback pantry ingredients for offline mode
const FALLBACK_PANTRY_INGREDIENTS: Ingredient[] = [
  { id: "salt", name: "Salt", isPantry: true },
  { id: "black_pepper", name: "Black Pepper", isPantry: true },
  { id: "garlic", name: "Garlic", isPantry: true },
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const CUISINE_OPTIONS = ["Filipino", "Italian", "Japanese", "Korean"];
const COOKING_METHODS = [
  "Any Method",
  "Sautéed",
  "Baked",
  "Grilled",
  "Roasted",
  "Steamed",
  "Fried",
  "Boiled",
  "Slow Cooked",
  "Air Fried",
  "Stir-Fried",
];

// Helper function to determine current meal type based on time of day
const getCurrentMealType = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 16) return "Lunch";
  if (hour >= 16 && hour < 21) return "Dinner";
  return "Snack";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
  },
  subtitle: {
    color: "#4b5563",
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: BrandColors.gray800,
    backgroundColor: BrandColors.gray50,
    marginBottom: 8,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  dropdownItemSelected: {
    backgroundColor: BrandColors.primaryVeryLight,
  },
  dropdownItemText: {
    color: "#1f2937",
  },
  selectedIndicator: {
    marginTop: 8,
    backgroundColor: BrandColors.primaryBackground,
    borderWidth: 1,
    borderColor: BrandColors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedText: {
    color: "#1f2937",
  },
  mealTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: BrandColors.white,
    borderColor: BrandColors.gray300,
  },
  mealTypeButtonActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  mealTypeButtonText: {
    color: "#374151",
  },
  mealTypeButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: BrandColors.gray300,
    borderRadius: 8,
    backgroundColor: BrandColors.gray50,
    overflow: "hidden",
  },
  ingredientListContainer: {
    borderWidth: 1,
    borderColor: BrandColors.gray300,
    borderRadius: 8,
    backgroundColor: BrandColors.gray50,
    overflow: "hidden",
  },
  ingredientListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  ingredientListItemText: {
    marginLeft: 12,
    color: "#1f2937",
    flex: 1,
  },
  selectedIngredientsContainer: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedIngredientTag: {
    backgroundColor: BrandColors.successVeryLight,
    borderWidth: 1,
    borderColor: BrandColors.successLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedIngredientText: {
    color: "#1f2937",
    fontSize: 14,
  },
  removeButton: {
    marginLeft: 8,
  },
  removeButtonText: {
    color: BrandColors.danger,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    backgroundColor: BrandColors.primary,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 24,
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
});

export default function RecipeInputScreen({
  handleGenerateRecipe,
  defaultCuisine = "Filipino",
}: RecipeInputScreenProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    [],
  );
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [cuisine, setCuisine] = useState(defaultCuisine);
  const [mealType, setMealType] = useState(getCurrentMealType());
  const [cookingMethod, setCookingMethod] = useState("Any Method");
  const [isLoading, setIsLoading] = useState(false);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>(
    FALLBACK_COMMON_INGREDIENTS,
  );
  const [ingredientsLoading, setIngredientsLoading] = useState(true);

  // Fetch ingredients from database on mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIngredientsLoading(true);
        // Fetch common ingredients (734 items) for better selection
        const response = await fetch(
          apiUrl("/api/ingredients?common=true&limit=1000"),
        );
        const result = await response.json();
        if (result.success && result.data?.ingredients) {
          const ingredients = result.data.ingredients;
          setAllIngredients(ingredients);

          // Pre-select ONLY garlic, salt, and ground black pepper
          const preSelectedIngredients = ingredients.filter(
            (ing: any) =>
              ing.name?.toLowerCase() === "salt" ||
              ing.name?.toLowerCase() === "garlic" ||
              ing.name?.toLowerCase() === "ground black pepper",
          );
          if (preSelectedIngredients.length > 0) {
            setSelectedIngredients(preSelectedIngredients);
          }
        } else {
          console.warn(
            "Failed to load ingredients from database, using fallback",
          );
          setAllIngredients(FALLBACK_COMMON_INGREDIENTS);
        }
      } catch (error) {
        console.warn("Error fetching ingredients:", error);
        setAllIngredients(FALLBACK_COMMON_INGREDIENTS);
      } finally {
        setIngredientsLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const toggleIngredient = (ingredient: Ingredient) => {
    const exists = selectedIngredients.some((ing) => ing.id === ingredient.id);
    if (exists) {
      setSelectedIngredients(
        selectedIngredients.filter((ing) => ing.id !== ingredient.id),
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const validateAndSubmit = async () => {
    if (selectedIngredients.length === 0) {
      Alert.alert("Validation Error", "Please select at least one ingredient");
      return;
    }

    setIsLoading(true);

    try {
      const values: RecipeInputValues = {
        ingredients: selectedIngredients,
        cuisine,
        mealType,
        cookingMethod:
          cookingMethod !== "Any Method" ? cookingMethod : undefined,
      };

      await handleGenerateRecipe(values);
    } catch (error) {
      Alert.alert("Error", "Failed to generate recipe");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[BrandColors.primary, BrandColors.primary + "cc"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerIcon}>🔍</Text>
            <Text style={styles.headerTitle}>
              What can I cook with these ingredients?
            </Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          {selectedIngredients.length} ingredient
          {selectedIngredients.length !== 1 ? "s" : ""} selected
        </Text>
      </LinearGradient>
      <View style={styles.content}>
        {/* Cuisine Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cuisine</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={cuisine}
              onValueChange={(itemValue) => setCuisine(itemValue)}
              enabled={!isLoading}
            >
              {CUISINE_OPTIONS.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Meal Type Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Meal Type</Text>
          <View style={styles.mealTypeContainer}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  mealType === type && styles.mealTypeButtonActive,
                ]}
                onPress={() => setMealType(type)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.mealTypeButtonText,
                    mealType === type && styles.mealTypeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cooking Method Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cooking Method (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={cookingMethod}
              onValueChange={(itemValue) => setCookingMethod(itemValue)}
              enabled={!isLoading}
            >
              {COOKING_METHODS.map((method) => (
                <Picker.Item key={method} label={method} value={method} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Ingredients Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Select Ingredients <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                paddingVertical: 16,
                justifyContent: "center",
                backgroundColor:
                  selectedIngredients.length > 0 ? "#dbeafe" : "#f9fafb",
              },
            ]}
            onPress={() => setShowIngredientsModal(true)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: selectedIngredients.length > 0 ? "#1f2937" : "#9ca3af",
                fontSize: 16,
              }}
            >
              {selectedIngredients.length > 0
                ? `${selectedIngredients.length} ingredient${selectedIngredients.length !== 1 ? "s" : ""} selected`
                : "Tap to select ingredients"}
            </Text>
          </TouchableOpacity>

          {selectedIngredients.length > 0 && (
            <View style={styles.selectedIngredientsContainer}>
              {selectedIngredients.map((ing) => (
                <View key={ing.id} style={styles.selectedIngredientTag}>
                  <Text style={styles.selectedIngredientText}>{ing.name}</Text>
                  <TouchableOpacity
                    onPress={() => toggleIngredient(ing)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Ingredients Modal */}
        <IngredientPickerModal
          visible={showIngredientsModal}
          ingredients={allIngredients}
          selectedIds={selectedIngredients.map((ing) => ing.id)}
          onSelect={toggleIngredient}
          onClose={() => setShowIngredientsModal(false)}
          multiSelect={true}
        />

        {/* Generate Recipe Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={validateAndSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
