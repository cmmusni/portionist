import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface Ingredient {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: string;
  mainIngredient?: { id: string; name: string };
  mealType?: string;
  cuisine?: string;
  portionSize?: number;
  portionUnit?: string;
  ingredients?: any[];
  instructions?: any[];
}

interface PantryState {
  mainIngredient: Ingredient | null;
  sideIngredients: Ingredient[];
  targetWeight: number | null;
  currentWeight: number | null;
  mealType: string | null;
  cuisine: string | null;
  userAge: number | null;
  favorites: Recipe[];
  onboardingCompleted: boolean;
}

const initialState: PantryState = {
  mainIngredient: null,
  sideIngredients: [],
  targetWeight: null,
  currentWeight: null,
  mealType: null,
  cuisine: null,
  userAge: null,
  favorites: [],
  onboardingCompleted: false,
};

export const pantrySlice = createSlice({
  name: "pantry",
  initialState,
  reducers: {
    setMainIngredient: (state, action: PayloadAction<Ingredient | null>) => {
      state.mainIngredient = action.payload;
    },
    addSideIngredient: (state, action: PayloadAction<Ingredient>) => {
      const exists = state.sideIngredients.some(
        (ing) => ing.id === action.payload.id,
      );
      if (!exists) {
        state.sideIngredients.push(action.payload);
      }
    },
    removeSideIngredient: (state, action: PayloadAction<string>) => {
      state.sideIngredients = state.sideIngredients.filter(
        (ing) => ing.id !== action.payload,
      );
    },
    setOnboardingData: (
      state,
      action: PayloadAction<{
        targetWeight?: number;
        currentWeight?: number;
        mealType?: string;
        cuisine?: string;
        userAge?: number;
      }>,
    ) => {
      if (action.payload.targetWeight !== undefined) {
        state.targetWeight = action.payload.targetWeight;
      }
      if (action.payload.currentWeight !== undefined) {
        state.currentWeight = action.payload.currentWeight;
      }
      if (action.payload.mealType !== undefined) {
        state.mealType = action.payload.mealType;
      }
      if (action.payload.cuisine !== undefined) {
        state.cuisine = action.payload.cuisine;
      }
      if (action.payload.userAge !== undefined) {
        state.userAge = action.payload.userAge;
      }
    },
    setMealType: (state, action: PayloadAction<string | null>) => {
      state.mealType = action.payload;
    },
    setCuisine: (state, action: PayloadAction<string | null>) => {
      state.cuisine = action.payload;
    },
    addFavorite: (state, action: PayloadAction<Recipe>) => {
      const exists = state.favorites.some(
        (recipe) => recipe.id === action.payload.id,
      );
      if (!exists) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(
        (recipe) => recipe.id !== action.payload,
      );
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    resetPantryData: (state) => {
      state.mainIngredient = null;
      state.sideIngredients = [];
      state.targetWeight = null;
      state.currentWeight = null;
      state.mealType = null;
      state.cuisine = null;
      state.userAge = null;
      state.favorites = [];
      state.onboardingCompleted = false;
    },
  },
});

export const {
  setMainIngredient,
  addSideIngredient,
  removeSideIngredient,
  setOnboardingData,
  setMealType,
  setCuisine,
  addFavorite,
  removeFavorite,
  setOnboardingCompleted,
  resetPantryData,
} = pantrySlice.actions;

// Selectors
export const selectMainIngredient = (state: RootState) =>
  state.pantry.mainIngredient;

export const selectSideIngredients = (state: RootState) =>
  state.pantry.sideIngredients;

export const selectTargetWeight = (state: RootState) =>
  state.pantry.targetWeight;

export const selectMealType = (state: RootState) => state.pantry.mealType;

export const selectCuisine = (state: RootState) => state.pantry.cuisine;

export const selectUserAge = (state: RootState) => state.pantry.userAge;

export const selectCurrentWeight = (state: RootState) =>
  state.pantry.currentWeight;

export const selectFavorites = (state: RootState) => state.pantry.favorites;

export const selectOnboardingCompleted = (state: RootState) =>
  state.pantry.onboardingCompleted;

export default pantrySlice.reducer;
