import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
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
import { apiUrl } from "../services/config";
import IngredientPickerModal from "./IngredientPickerModal";

interface Ingredient {
  id: string;
  name: string;
  category?: string;
  isPantry?: boolean;
  isMain?: boolean;
}

interface RecipeInputValues {
  mainIngredient: Ingredient;
  sideIngredients: Ingredient[];
  mealType: string;
  cuisine: string;
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
  { id: "olive_oil", name: "Olive Oil", isPantry: true },
  { id: "butter", name: "Butter", isPantry: true },
  { id: "garlic", name: "Garlic", isPantry: true },
  { id: "onion", name: "Onion", isPantry: true },
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const CUISINE_OPTIONS = ["Filipino", "Italian", "Japanese", "Korean"];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
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
    backgroundColor: "#dbeafe",
  },
  dropdownItemText: {
    color: "#1f2937",
  },
  selectedIndicator: {
    marginTop: 8,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
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
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
  },
  mealTypeButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
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
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
  },
  ingredientListContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
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
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#86efac",
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
    color: "#ef4444",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: "#3b82f6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  spacer: {
    width: 40,
  },
});

export default function RecipeInputScreen({
  handleGenerateRecipe,
  defaultCuisine = "Filipino",
}: RecipeInputScreenProps) {
  const [mainIngredient, setMainIngredient] = useState<Ingredient | null>(null);
  const [showMainIngredientModal, setShowMainIngredientModal] = useState(false);
  const [showSideIngredientsModal, setShowSideIngredientsModal] =
    useState(false);
  const [sideIngredients, setSideIngredients] = useState<Ingredient[]>([]);
  const [mealType, setMealType] = useState(MEAL_TYPES[1]); // Default to Lunch
  const [cuisine, setCuisine] = useState(defaultCuisine);
  const [isLoading, setIsLoading] = useState(false);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>(
    FALLBACK_COMMON_INGREDIENTS,
  );
  const [mainIngredientOptions, setMainIngredientOptions] = useState<
    Ingredient[]
  >(FALLBACK_COMMON_INGREDIENTS);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);

  // Fetch ingredients from database on mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIngredientsLoading(true);
        const response = await fetch(apiUrl("/recipes/ingredients"));
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAllIngredients(result.data);

          // Filter main ingredients from database flag
          const mainIngredients = result.data.filter(
            (ing: any) => ing.isMain === true,
          );
          setMainIngredientOptions(
            mainIngredients.length > 0
              ? mainIngredients
              : FALLBACK_COMMON_INGREDIENTS,
          );

          // Extract and pre-select pantry ingredients
          const pantryItems = result.data.filter(
            (ing: any) => ing.isPantry === true,
          );
          setSideIngredients(
            pantryItems.length > 0 ? pantryItems : FALLBACK_PANTRY_INGREDIENTS,
          );
        } else {
          console.warn(
            "Failed to load ingredients from database, using fallback",
          );
          setMainIngredientOptions(FALLBACK_COMMON_INGREDIENTS);
          setSideIngredients(FALLBACK_PANTRY_INGREDIENTS);
        }
      } catch (error) {
        console.warn("Error fetching ingredients:", error);
        // Use fallback
        setMainIngredientOptions(FALLBACK_COMMON_INGREDIENTS);
        setSideIngredients(FALLBACK_PANTRY_INGREDIENTS);
      } finally {
        setIngredientsLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const toggleSideIngredient = (ingredient: Ingredient) => {
    const exists = sideIngredients.some((ing) => ing.id === ingredient.id);
    if (exists) {
      setSideIngredients(
        sideIngredients.filter((ing) => ing.id !== ingredient.id),
      );
    } else {
      setSideIngredients([...sideIngredients, ingredient]);
    }
  };

  const handleSelectMainIngredient = (ingredient: Ingredient) => {
    setMainIngredient(ingredient);
    setShowMainIngredientModal(false);
  };

  const validateAndSubmit = async () => {
    if (!mainIngredient) {
      Alert.alert("Validation Error", "Please select a main ingredient");
      return;
    }

    setIsLoading(true);

    try {
      const values: RecipeInputValues = {
        mainIngredient,
        sideIngredients,
        mealType,
        cuisine,
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Recipe</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Search Recipe</Text>
        <Text style={styles.subtitle}>
          Select your ingredients and preferences
        </Text>

        {/* Main Ingredient Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Main Ingredient <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                paddingVertical: 16,
                justifyContent: "center",
                backgroundColor: mainIngredient ? "#dbeafe" : "#f9fafb",
              },
            ]}
            onPress={() => setShowMainIngredientModal(true)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: mainIngredient ? "#1f2937" : "#9ca3af",
                fontSize: 16,
              }}
            >
              {mainIngredient
                ? mainIngredient.name
                : "Tap to select ingredient"}
            </Text>
          </TouchableOpacity>

          {mainIngredient && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>
                Selected:{" "}
                <Text style={{ fontWeight: "600" }}>{mainIngredient.name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setMainIngredient(null)}>
                <Text style={{ color: "#ef4444", fontWeight: "bold" }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Main Ingredient Modal */}
        <IngredientPickerModal
          visible={showMainIngredientModal}
          ingredients={mainIngredientOptions}
          selectedIds={mainIngredient ? [mainIngredient.id] : []}
          onSelect={handleSelectMainIngredient}
          onClose={() => setShowMainIngredientModal(false)}
          multiSelect={false}
        />

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

        {/* Side Ingredients Selection */}
        <View style={{ marginBottom: 32 }}>
          <Text style={styles.label}>
            Side Ingredients{" "}
            <Text style={{ color: "#6b7280" }}>(Optional)</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                paddingVertical: 16,
                justifyContent: "center",
                backgroundColor:
                  sideIngredients.length > 0 ? "#dcfce7" : "#f9fafb",
              },
            ]}
            onPress={() => setShowSideIngredientsModal(true)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: sideIngredients.length > 0 ? "#1f2937" : "#9ca3af",
                fontSize: 16,
              }}
            >
              {sideIngredients.length > 0
                ? `${sideIngredients.length} ingredient${sideIngredients.length !== 1 ? "s" : ""} selected`
                : "Tap to select side ingredients"}
            </Text>
          </TouchableOpacity>

          {sideIngredients.length > 0 && (
            <View style={styles.selectedIngredientsContainer}>
              {sideIngredients.map((ing) => (
                <View key={ing.id} style={styles.selectedIngredientTag}>
                  <Text style={styles.selectedIngredientText}>{ing.name}</Text>
                  <TouchableOpacity
                    onPress={() => toggleSideIngredient(ing)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Side Ingredients Modal */}
        <IngredientPickerModal
          visible={showSideIngredientsModal}
          ingredients={allIngredients}
          selectedIds={sideIngredients.map((ing) => ing.id)}
          onSelect={toggleSideIngredient}
          onClose={() => setShowSideIngredientsModal(false)}
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
            <Text style={styles.submitButtonText}>Generate Recipe</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
