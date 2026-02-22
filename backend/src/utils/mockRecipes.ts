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
  const mealTypeRecipes: { [key: string]: any[] } = {
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
        ingredients: [
          { id: "i1", name: "Egg Whites", quantity: 4, unit: "large" },
          { id: "i2", name: "Spinach", quantity: 50, unit: "g" },
          { id: "i3", name: "Mushrooms", quantity: 30, unit: "g" },
          { id: "i4", name: "Olive Oil", quantity: 1, unit: "tsp" },
          { id: "i5", name: "Salt & Pepper", quantity: 1, unit: "to taste" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Heat olive oil in a non-stick pan over medium heat",
          },
          {
            stepNumber: 2,
            instruction: "Add mushrooms and spinach, sauté for 2-3 minutes",
          },
          {
            stepNumber: 3,
            instruction: "Pour in egg whites and let cook for 2 minutes",
          },
          { stepNumber: 4, instruction: "Season with salt and pepper" },
          { stepNumber: 5, instruction: "Fold omelette in half and serve hot" },
        ],
        mealType: "Breakfast",
        portionSize: 200,
        portionUnit: "g",
        cuisine: "International",
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
        ingredients: [
          { id: "i1", name: "Banana", quantity: 1, unit: "medium" },
          { id: "i2", name: "Eggs", quantity: 2, unit: "large" },
          { id: "i3", name: "Protein Powder", quantity: 1, unit: "scoop" },
          { id: "i4", name: "Oats", quantity: 30, unit: "g" },
          { id: "i5", name: "Cinnamon", quantity: 1, unit: "tsp" },
        ],
        instructions: [
          { stepNumber: 1, instruction: "Mash banana in a bowl until smooth" },
          {
            stepNumber: 2,
            instruction: "Add eggs, protein powder, oats, and cinnamon",
          },
          {
            stepNumber: 3,
            instruction: "Mix all ingredients until well combined",
          },
          {
            stepNumber: 4,
            instruction: "Heat a non-stick pan over medium heat",
          },
          {
            stepNumber: 5,
            instruction:
              "Pour batter to form pancakes, cook 2-3 minutes each side",
          },
        ],
        mealType: "Breakfast",
        portionSize: 250,
        portionUnit: "g",
        cuisine: "International",
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
        ingredients: [
          { id: "i1", name: "Chicken Breast", quantity: 150, unit: "g" },
          { id: "i2", name: "Mixed Greens", quantity: 100, unit: "g" },
          { id: "i3", name: "Olive Oil", quantity: 1, unit: "tbsp" },
          { id: "i4", name: "Lemon Juice", quantity: 1, unit: "tbsp" },
          { id: "i5", name: "Garlic Powder", quantity: 1, unit: "tsp" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Season chicken with garlic powder, salt, and pepper",
          },
          {
            stepNumber: 2,
            instruction: "Heat grill or grill pan to medium-high heat",
          },
          {
            stepNumber: 3,
            instruction: "Grill chicken for 6-7 minutes per side until cooked",
          },
          {
            stepNumber: 4,
            instruction: "Let chicken rest for 5 minutes, then slice",
          },
          {
            stepNumber: 5,
            instruction: "Serve over mixed greens with lemon juice drizzle",
          },
        ],
        mealType: "Lunch",
        portionSize: 250,
        portionUnit: "g",
        cuisine: "International",
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
        ingredients: [
          { id: "i1", name: "Quinoa", quantity: 60, unit: "g" },
          { id: "i2", name: "Chickpeas", quantity: 80, unit: "g" },
          { id: "i3", name: "Avocado", quantity: 50, unit: "g" },
          { id: "i4", name: "Cherry Tomatoes", quantity: 50, unit: "g" },
          { id: "i5", name: "Tahini Dressing", quantity: 2, unit: "tbsp" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Cook quinoa according to package directions",
          },
          {
            stepNumber: 2,
            instruction: "Roast chickpeas in oven at 400°F for 20 minutes",
          },
          {
            stepNumber: 3,
            instruction: "Slice avocado and halve cherry tomatoes",
          },
          { stepNumber: 4, instruction: "Assemble bowl with quinoa base" },
          {
            stepNumber: 5,
            instruction: "Top with chickpeas, avocado, tomatoes, and tahini",
          },
        ],
        mealType: "Lunch",
        portionSize: 350,
        portionUnit: "g",
        cuisine: "International",
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
        ingredients: [
          { id: "i1", name: "Salmon Fillet", quantity: 150, unit: "g" },
          { id: "i2", name: "Broccoli", quantity: 100, unit: "g" },
          { id: "i3", name: "Carrots", quantity: 80, unit: "g" },
          { id: "i4", name: "Lemon", quantity: 1, unit: "piece" },
          { id: "i5", name: "Olive Oil", quantity: 1, unit: "tbsp" },
        ],
        instructions: [
          { stepNumber: 1, instruction: "Preheat oven to 400°F (200°C)" },
          {
            stepNumber: 2,
            instruction: "Season salmon with salt, pepper, and lemon juice",
          },
          {
            stepNumber: 3,
            instruction: "Chop vegetables into bite-sized pieces",
          },
          {
            stepNumber: 4,
            instruction: "Arrange salmon and vegetables on baking sheet",
          },
          {
            stepNumber: 5,
            instruction:
              "Bake for 18-20 minutes until salmon is cooked through",
          },
        ],
        mealType: "Dinner",
        portionSize: 330,
        portionUnit: "g",
        cuisine: "International",
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
        ingredients: [
          { id: "i1", name: "Chicken Breast", quantity: 150, unit: "g" },
          { id: "i2", name: "Bell Peppers", quantity: 100, unit: "g" },
          { id: "i3", name: "Snap Peas", quantity: 80, unit: "g" },
          { id: "i4", name: "Soy Sauce", quantity: 2, unit: "tbsp" },
          { id: "i5", name: "Ginger", quantity: 1, unit: "tsp" },
        ],
        instructions: [
          { stepNumber: 1, instruction: "Cut chicken into bite-sized pieces" },
          {
            stepNumber: 2,
            instruction: "Heat wok or large pan over high heat",
          },
          {
            stepNumber: 3,
            instruction: "Stir-fry chicken for 5-6 minutes until golden",
          },
          {
            stepNumber: 4,
            instruction: "Add vegetables and ginger, cook for 3-4 minutes",
          },
          {
            stepNumber: 5,
            instruction: "Add soy sauce, toss to coat, and serve hot",
          },
        ],
        mealType: "Dinner",
        portionSize: 330,
        portionUnit: "g",
        cuisine: "Asian",
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
        ingredients: [
          { id: "i1", name: "Cucumber", quantity: 100, unit: "g" },
          { id: "i2", name: "Cherry Tomatoes", quantity: 100, unit: "g" },
          { id: "i3", name: "Feta Cheese", quantity: 50, unit: "g" },
          { id: "i4", name: "Kalamata Olives", quantity: 30, unit: "g" },
          { id: "i5", name: "Olive Oil", quantity: 1, unit: "tbsp" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Chop cucumber and halve cherry tomatoes",
          },
          {
            stepNumber: 2,
            instruction: "Crumble feta cheese into bite-sized pieces",
          },
          { stepNumber: 3, instruction: "Combine all vegetables in a bowl" },
          { stepNumber: 4, instruction: "Add olives and feta cheese" },
          {
            stepNumber: 5,
            instruction: "Drizzle with olive oil and toss gently",
          },
        ],
        mealType: "Snack",
        portionSize: 280,
        portionUnit: "g",
        cuisine: "Mediterranean",
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
        ingredients: [
          {
            id: "i1",
            name: "Whole Wheat Tortilla",
            quantity: 1,
            unit: "large",
          },
          { id: "i2", name: "Sliced Turkey", quantity: 100, unit: "g" },
          { id: "i3", name: "Lettuce", quantity: 30, unit: "g" },
          { id: "i4", name: "Tomato", quantity: 50, unit: "g" },
          { id: "i5", name: "Mustard", quantity: 1, unit: "tbsp" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Lay tortilla flat on a clean surface",
          },
          { stepNumber: 2, instruction: "Spread mustard evenly over tortilla" },
          { stepNumber: 3, instruction: "Layer turkey slices in the center" },
          { stepNumber: 4, instruction: "Add lettuce and sliced tomato" },
          {
            stepNumber: 5,
            instruction: "Roll tightly and cut in half diagonally",
          },
        ],
        mealType: "Snack",
        portionSize: 200,
        portionUnit: "g",
        cuisine: "American",
      },
    ],
  };

  const recipes = mealTypeRecipes[mealType] || mealTypeRecipes["Lunch"];
  return recipes?.slice(0, count) || [];
}
