/**
 * Mock/Fallback Recipes for Demo
 * Used when API rate limits are reached
 */

export const mockSearchResults = [
  {
    id: "mock-661223",
    title: "Grilled Chicken Breast",
    protein: 31,
    carbs: 0,
    fat: 3.6,
    calories: 165,
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
  },
  {
    id: "mock-715497",
    title: "Greek Salad with Feta",
    protein: 8,
    carbs: 12,
    fat: 15,
    calories: 220,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
  },
  {
    id: "mock-642583",
    title: "Salmon with Vegetables",
    protein: 25,
    carbs: 8,
    fat: 14,
    calories: 260,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
  },
  {
    id: "mock-782601",
    title: "Quinoa Buddha Bowl",
    protein: 12,
    carbs: 35,
    fat: 10,
    calories: 280,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  },
  {
    id: "mock-895342",
    title: "Chicken Stir Fry",
    protein: 28,
    carbs: 18,
    fat: 9,
    calories: 265,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
  },
  {
    id: "mock-736425",
    title: "Beef Tacos",
    protein: 22,
    carbs: 24,
    fat: 12,
    calories: 295,
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400",
  },
  {
    id: "mock-458239",
    title: "Vegetable Pasta",
    protein: 10,
    carbs: 45,
    fat: 8,
    calories: 290,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
  },
  {
    id: "mock-923847",
    title: "Tuna Salad Sandwich",
    protein: 24,
    carbs: 28,
    fat: 11,
    calories: 310,
    image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400",
  },
  {
    id: "mock-674291",
    title: "Egg White Omelette",
    protein: 18,
    carbs: 3,
    fat: 5,
    calories: 130,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400",
  },
  {
    id: "mock-582947",
    title: "Turkey Wrap",
    protein: 20,
    carbs: 22,
    fat: 7,
    calories: 235,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
  },
];

export const mockRecipeDetails: { [key: string]: any } = {
  "mock-661223": {
    id: 661223,
    title: "Grilled Chicken Breast",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
    readyInMinutes: 25,
    servings: 1,
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 165, unit: "kcal" },
        { name: "Protein", amount: 31, unit: "g" },
        { name: "Carbohydrates", amount: 0, unit: "g" },
        { name: "Fat", amount: 3.6, unit: "g" },
      ],
    },
  },
  "mock-715497": {
    id: 715497,
    title: "Greek Salad with Feta",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
    readyInMinutes: 15,
    servings: 1,
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 220, unit: "kcal" },
        { name: "Protein", amount: 8, unit: "g" },
        { name: "Carbohydrates", amount: 12, unit: "g" },
        { name: "Fat", amount: 15, unit: "g" },
      ],
    },
  },
  "mock-642583": {
    id: 642583,
    title: "Salmon with Vegetables",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    readyInMinutes: 30,
    servings: 1,
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 260, unit: "kcal" },
        { name: "Protein", amount: 25, unit: "g" },
        { name: "Carbohydrates", amount: 8, unit: "g" },
        { name: "Fat", amount: 14, unit: "g" },
      ],
    },
  },
};

export const mockSuggestions = [
  {
    id: "mock-661223",
    name: "Grilled Chicken Breast",
    title: "Grilled Chicken Breast",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
    readyInMinutes: 25,
    servings: 1,
    calories: 165,
    source: "mock" as const,
  },
  {
    id: "mock-782601",
    name: "Quinoa Buddha Bowl",
    title: "Quinoa Buddha Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    readyInMinutes: 20,
    servings: 1,
    calories: 280,
    source: "mock" as const,
  },
];

export function getMockRecipesByMealType(mealType: string, count: number = 2) {
  const mealTypeRecipes: { [key: string]: typeof mockSuggestions } = {
    Breakfast: [
      {
        id: "mock-674291",
        name: "Egg White Omelette",
        title: "Egg White Omelette",
        image:
          "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400",
        readyInMinutes: 10,
        servings: 1,
        calories: 130,
        source: "mock" as const,
      },
      {
        id: "mock-pancake-01",
        name: "Protein Pancakes",
        title: "Protein Pancakes",
        image:
          "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400",
        readyInMinutes: 15,
        servings: 1,
        calories: 250,
        source: "mock" as const,
      },
    ],
    Lunch: [
      {
        id: "mock-661223",
        name: "Grilled Chicken Breast",
        title: "Grilled Chicken Breast",
        image:
          "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
        readyInMinutes: 25,
        servings: 1,
        calories: 165,
        source: "mock" as const,
      },
      {
        id: "mock-782601",
        name: "Quinoa Buddha Bowl",
        title: "Quinoa Buddha Bowl",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        readyInMinutes: 20,
        servings: 1,
        calories: 280,
        source: "mock" as const,
      },
    ],
    Dinner: [
      {
        id: "mock-642583",
        name: "Salmon with Vegetables",
        title: "Salmon with Vegetables",
        image:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
        readyInMinutes: 30,
        servings: 1,
        calories: 260,
        source: "mock" as const,
      },
      {
        id: "mock-895342",
        name: "Chicken Stir Fry",
        title: "Chicken Stir Fry",
        image:
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
        readyInMinutes: 25,
        servings: 1,
        calories: 265,
        source: "mock" as const,
      },
    ],
    Snack: [
      {
        id: "mock-715497",
        name: "Greek Salad with Feta",
        title: "Greek Salad with Feta",
        image:
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
        readyInMinutes: 15,
        servings: 1,
        calories: 220,
        source: "mock" as const,
      },
      {
        id: "mock-582947",
        name: "Turkey Wrap",
        title: "Turkey Wrap",
        image:
          "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
        readyInMinutes: 10,
        servings: 1,
        calories: 235,
        source: "mock" as const,
      },
    ],
  };

  const recipes = mealTypeRecipes[mealType] || mealTypeRecipes["Lunch"];
  return recipes?.slice(0, count) || [];
}
