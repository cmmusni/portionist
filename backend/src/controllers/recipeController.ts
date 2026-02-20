import type { Request, Response } from "express";
import { query } from "../db/connection.js";
import { apiTracker } from "../utils/apiTracker.js";
import { getMockRecipesByMealType } from "../utils/mockRecipes.js";
import { saveRecipeToHistory } from "./recipeLogController.js";

interface Ingredient {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
}

interface GetRecipesRequest {
  ingredients: Ingredient[];
  currentWeight: number;
  targetWeight: number;
  mealType?: string;
  cuisine: string;
}

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: "spoonacular" | "ai";
  mainIngredient: Ingredient;
  sideIngredients: Ingredient[];
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: {
    stepNumber: number;
    instruction: string;
  }[];
  mealType: string;
  cuisine: string;
  portionSize: number;
  portionUnit: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  calories?: number;
}

interface RecipeWithScore extends Recipe {
  matchScore: number;
  scoreBreakdown: {
    portionMatch: number;
  };
}

// Mock recipe database (for development/testing - marked as ai source)
const MOCK_RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Grilled Chicken with Rice",
    image:
      "https://png.pngtree.com/png-vector/20230808/ourmid/pngtree-recipe-card-vector-png-image_6874598.png",
    source: "ai",
    mainIngredient: { id: "chicken", name: "Chicken" },
    sideIngredients: [
      { id: "garlic", name: "Garlic" },
      { id: "onion", name: "Onion" },
    ],
    ingredients: [
      { id: "i1", name: "Chicken Breast", quantity: 300, unit: "g" },
      { id: "i2", name: "Rice", quantity: 150, unit: "g" },
      { id: "i3", name: "Garlic", quantity: 10, unit: "g" },
      { id: "i4", name: "Onion", quantity: 50, unit: "g" },
    ],
    instructions: [
      { stepNumber: 1, instruction: "Marinate chicken in garlic and onion" },
      { stepNumber: 2, instruction: "Heat grill to medium-high heat" },
      { stepNumber: 3, instruction: "Grill chicken for 8-10 minutes per side" },
      { stepNumber: 4, instruction: "Cook rice separately" },
      { stepNumber: 5, instruction: "Serve hot with rice" },
    ],
    mealType: "Lunch",
    cuisine: "Filipino",
    portionSize: 450,
    portionUnit: "g",
    prepTime: 15,
    cookTime: 25,
    totalTime: 40,
    servings: 1,
  },
  {
    id: "2",
    name: "Chicken Stir Fry",
    image:
      "https://png.pngtree.com/png-vector/20230808/ourmid/pngtree-recipe-card-vector-png-image_6874598.png",
    source: "ai",
    mainIngredient: { id: "chicken", name: "Chicken" },
    sideIngredients: [
      { id: "broccoli", name: "Broccoli" },
      { id: "bell_pepper", name: "Bell Pepper" },
    ],
    ingredients: [
      { id: "i1", name: "Chicken Breast", quantity: 280, unit: "g" },
      { id: "i2", name: "Broccoli", quantity: 100, unit: "g" },
      { id: "i3", name: "Bell Pepper", quantity: 80, unit: "g" },
      { id: "i4", name: "Soy Sauce", quantity: 15, unit: "ml" },
    ],
    instructions: [
      {
        stepNumber: 1,
        instruction: "Cut chicken and vegetables into bite-sized pieces",
      },
      { stepNumber: 2, instruction: "Heat wok or large pan over high heat" },
      { stepNumber: 3, instruction: "Stir fry chicken until cooked" },
      { stepNumber: 4, instruction: "Add vegetables and stir fry" },
      { stepNumber: 5, instruction: "Add soy sauce and serve hot" },
    ],
    mealType: "Lunch",
    cuisine: "Asian",
    portionSize: 460,
    portionUnit: "g",
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    servings: 1,
  },
  {
    id: "3",
    name: "Beef Pasta",
    image:
      "https://png.pngtree.com/png-vector/20230808/ourmid/pngtree-recipe-card-vector-png-image_6874598.png",
    source: "ai",
    mainIngredient: { id: "beef", name: "Beef" },
    sideIngredients: [
      { id: "tomato", name: "Tomato" },
      { id: "garlic", name: "Garlic" },
    ],
    ingredients: [
      { id: "i1", name: "Ground Beef", quantity: 250, unit: "g" },
      { id: "i2", name: "Pasta", quantity: 150, unit: "g" },
      { id: "i3", name: "Tomato", quantity: 100, unit: "g" },
      { id: "i4", name: "Garlic", quantity: 10, unit: "g" },
    ],
    instructions: [
      {
        stepNumber: 1,
        instruction: "Cook pasta according to package instructions",
      },
      { stepNumber: 2, instruction: "Brown ground beef in a pan" },
      { stepNumber: 3, instruction: "Add tomato sauce and garlic" },
      { stepNumber: 4, instruction: "Simmer for 10 minutes" },
      { stepNumber: 5, instruction: "Combine with pasta and serve" },
    ],
    mealType: "Lunch",
    cuisine: "Italian",
    portionSize: 500,
    portionUnit: "g",
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
    servings: 1,
  },
];

class RecipeController {
  private foodImages = [
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
    "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800",
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800",
    "https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=800",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800",
    "https://images.unsplash.com/photo-1562967914-608f82629710?w=800",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800",
  ];

  private calculateCalories(portionSize: number, mealType: string): number {
    // Estimate calories based on portion size and meal type
    // Different meals have different calorie densities
    const calorieMultipliers: Record<string, number> = {
      Breakfast: 1.3, // ~1.3 cal/g (eggs, toast, dairy)
      Lunch: 1.5, // ~1.5 cal/g (balanced meal)
      Dinner: 1.6, // ~1.6 cal/g (often more protein/fat)
      Snack: 2.5, // ~2.5 cal/g (more calorie-dense)
    };

    const multiplier = calorieMultipliers[mealType] || 1.5;
    return Math.round(portionSize * multiplier);
  }

  private async fetchFromGoogle(
    ingredients: string[],
    mealType: string,
    cuisine: string,
    limit: number = 10,
  ): Promise<Recipe[]> {
    if (
      !process.env.GOOGLE_CUSTOM_SEARCH_API_KEY ||
      !process.env.GOOGLE_SEARCH_ENGINE_ID
    ) {
      console.log("⚠️  Google Custom Search API not configured");
      return [];
    }

    try {
      const searchQuery = `${ingredients.join(" ")} ${mealType} ${cuisine} recipe`;
      const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=${Math.min(limit, 10)}`;

      console.log(`🔍 Calling Google Custom Search API...`);
      console.log(`   Query: ${searchQuery}`);

      const response = await fetch(googleUrl);

      if (response.ok) {
        const data = (await response.json()) as any;

        if (Array.isArray(data.items) && data.items.length > 0) {
          console.log(`✅ Google returned ${data.items.length} results`);

          const recipes: Recipe[] = data.items
            .filter((item: any) => item.title && item.link)
            .map((item: any, index: number) => {
              const recipeName = item.title.replace(/\s*-\s*.*$/, "").trim();

              return {
                id: `google-${index}`,
                name: recipeName,
                image:
                  item.pagemap?.cse_image?.[0]?.src ||
                  this.generateImageUrl(recipeName),
                source: "ai" as const,
                mainIngredient: {
                  id: ingredients[0] || "",
                  name: ingredients[0] || "",
                },
                sideIngredients: [],
                ingredients: ingredients.map((ing, idx) => ({
                  id: `google-ing-${idx}`,
                  name: ing,
                  quantity: 100,
                  unit: "g",
                })),
                instructions: [
                  {
                    stepNumber: 1,
                    instruction: `View full recipe at: ${item.link}`,
                  },
                ],
                mealType,
                cuisine,
                portionSize: 400,
                portionUnit: "g",
                prepTime: 20,
                cookTime: 30,
                totalTime: 50,
                servings: 1,
                calories: this.calculateCalories(400, mealType),
              };
            });

          return recipes;
        } else {
          console.log("⚠️  Google returned no results");
        }
      } else {
        console.warn(`❌ Google API error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error calling Google Custom Search API:", error);
    }

    return [];
  }

  private deduplicateRecipes(recipes: Recipe[]): Recipe[] {
    const seen = new Map<string, Recipe>();

    for (const recipe of recipes) {
      // Create a unique key based on normalized recipe name
      const key = recipe.name.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (!seen.has(key)) {
        seen.set(key, recipe);
      } else {
        // Prefer Spoonacular recipes, then AI/Google (no database source)
        const existing = seen.get(key)!;
        const priority = { spoonacular: 2, ai: 1 };
        const existingPriority = priority[existing.source || "ai"] || 0;
        const newPriority = priority[recipe.source || "ai"] || 0;

        if (newPriority > existingPriority) {
          seen.set(key, recipe);
        }
      }
    }

    return Array.from(seen.values());
  }

  private generateImageUrl(recipeName: string): string {
    console.log(`🖼️  Selecting random image for: "${recipeName}"`);
    // Select a random image from the array
    const randomIndex = Math.floor(Math.random() * this.foodImages.length);
    const imageUrl =
      this.foodImages[randomIndex] ??
      this.foodImages[0] ??
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800";
    console.log(`✅ Selected image: ${imageUrl}`);
    return imageUrl;
  }

  private async fetchFromSpoonacular(
    mainIngredient: string,
    mainIngredientId: string,
    cuisine: string,
  ): Promise<Recipe[]> {
    if (!process.env.SPOONACULAR_API_KEY) {
      return [];
    }

    try {
      const query = `${mainIngredient} ${cuisine}`.trim();
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=5&addRecipeInformation=true&addRecipeInstructions=true&apiKey=${process.env.SPOONACULAR_API_KEY}`,
      );

      // Track API call
      apiTracker.logCall(
        "spoonacular",
        "/recipes/complexSearch (suggestions)",
        response.status,
      );

      if (!response.ok) {
        console.warn(
          "Spoonacular API error status:",
          response.status,
          await response.text(),
        );
        return [];
      }

      const data = (await response.json()) as any;

      if (!Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((spoonacularRecipe: any) => {
        const instructions = spoonacularRecipe.analyzedInstructions?.[0]?.steps
          ? spoonacularRecipe.analyzedInstructions[0].steps.map(
              (step: any, idx: number) => ({
                stepNumber: idx + 1,
                instruction: step.step || "",
              }),
            )
          : [];

        if (instructions.length === 0) {
          console.log(
            `⚠️  No instructions in fetchFromSpoonacular for: ${spoonacularRecipe.title}`,
          );
        }

        const ingredients = spoonacularRecipe.extendedIngredients
          ? spoonacularRecipe.extendedIngredients
              .slice(0, 10)
              .map((ing: any, idx: number) => ({
                id: `spoon-${spoonacularRecipe.id}-${idx}`,
                name: ing.original || ing.name || "",
                quantity: ing.amount || 0,
                unit: ing.unit || "",
              }))
          : [];

        const portionSize = spoonacularRecipe.servings * 100 || 300;
        const mealType = "Lunch";

        return {
          id: `spoonacular-${spoonacularRecipe.id}`,
          name: spoonacularRecipe.title || "",
          image: spoonacularRecipe.image || this.generateImageUrl(""),
          source: "spoonacular",
          mainIngredient: { id: mainIngredientId, name: mainIngredient },
          sideIngredients: [],
          ingredients,
          instructions,
          mealType,
          cuisine: cuisine || "International",
          portionSize,
          portionUnit: "g",
          prepTime: 15,
          cookTime: spoonacularRecipe.readyInMinutes || 30,
          totalTime: spoonacularRecipe.readyInMinutes || 30,
          servings: spoonacularRecipe.servings || 1,
          calories: this.calculateCalories(portionSize, mealType),
        };
      });
    } catch (error) {
      console.warn("Failed to fetch from Spoonacular:", error);
      return [];
    }
  }

  /**
   * Score a recipe based on portion match
   */
  private scoreRecipe(
    recipe: Recipe,
    targetWeight: number,
    currentWeight: number,
  ): RecipeWithScore {
    const remainingWeight = targetWeight - currentWeight;

    // Portion Match (100%)
    // Calculate how close the recipe portion is to the remaining weight
    // But be more forgiving - a reasonable meal is 150-400g, so don't penalize too much
    const normalizedRemainingWeight = Math.max(remainingWeight, 150);
    const normalizedRecipeSize = Math.max(recipe.portionSize, 150);
    const normalizedDifference = Math.abs(
      normalizedRecipeSize - normalizedRemainingWeight,
    );
    const normalizedMaxDifference = Math.max(
      normalizedRemainingWeight,
      normalizedRecipeSize,
    );
    const portionMatchRatio =
      normalizedMaxDifference > 0
        ? Math.max(0, 1 - normalizedDifference / normalizedMaxDifference)
        : 1;
    const portionScore = portionMatchRatio * 1.0;

    // Total score (0-100)
    const totalScore = portionScore * 100;

    return {
      ...recipe,
      matchScore: totalScore,
      scoreBreakdown: {
        portionMatch: portionScore,
      },
    };
  }

  async getRecipes(
    req: Request<{}, {}, GetRecipesRequest>,
    res: Response,
  ): Promise<void> {
    try {
      const { ingredients, currentWeight, targetWeight, mealType, cuisine } =
        req.body;

      // Validate required fields
      if (
        !ingredients ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0
      ) {
        res.status(400).json({
          success: false,
          message: "ingredients array with at least one ingredient is required",
        });
        return;
      }

      if (!cuisine) {
        res.status(400).json({
          success: false,
          message: "cuisine is required",
        });
        return;
      }

      // Default mealType to Lunch if not provided
      const finalMealType = mealType || "Lunch";

      if (typeof currentWeight !== "number" || currentWeight < 0) {
        res.status(400).json({
          success: false,
          message: "currentWeight must be a non-negative number",
        });
        return;
      }

      // if (targetWeight <= 0 || targetWeight <= currentWeight) {
      //   res.status(400).json({
      //     success: false,
      //     message:
      //       "targetWeight must be greater than currentWeight and positive",
      //   });
      //   return;
      // }

      // Initialize empty recipe list - will be filled by API calls only
      let recipesToScore: Recipe[] = [];
      console.log(
        "📡 Searching for recipes using Spoonacular and Google APIs only...",
      );

      // Fetch from Spoonacular API if configured
      if (process.env.SPOONACULAR_API_KEY && ingredients.length > 0) {
        console.log(
          "🍳 Fetching from Spoonacular API with key:",
          process.env.SPOONACULAR_API_KEY.substring(0, 10) + "...",
        );
        // Use first ingredient for Spoonacular search
        const searchIngredient = ingredients[0]!;
        const spoonacularRecipes = await this.fetchFromSpoonacular(
          searchIngredient.name,
          searchIngredient.id,
          cuisine,
        );
        console.log(
          `🍳 Got ${spoonacularRecipes.length} recipes from Spoonacular`,
        );
        recipesToScore.push(...spoonacularRecipes);
      } else {
        console.log("❌ SPOONACULAR_API_KEY not configured");
      }

      // Fetch from Google Custom Search API
      if (ingredients.length > 0) {
        const ingredientNames = ingredients.map((ing) => ing.name);
        const googleRecipes = await this.fetchFromGoogle(
          ingredientNames,
          finalMealType,
          cuisine,
          10,
        );
        console.log(`🔍 Got ${googleRecipes.length} recipes from Google`);
        recipesToScore.push(...googleRecipes);
      }

      // Deduplicate recipes from all sources
      const uniqueRecipes = this.deduplicateRecipes(recipesToScore);
      console.log(
        `🔄 Deduplicated ${recipesToScore.length} recipes to ${uniqueRecipes.length} unique recipes`,
      );

      // Save unique recipes to user history (if userId is provided)
      // Extract userId from JWT token or request body
      const userId = (req as any).user?.userId || (req.body as any).userId;

      if (userId && uniqueRecipes.length > 0) {
        console.log(
          `💾 Saving ${uniqueRecipes.length} recipes to user history for user: ${userId}`,
        );

        for (const recipe of uniqueRecipes) {
          try {
            await saveRecipeToHistory(userId, recipe, "search");
          } catch (error) {
            console.warn(
              `Failed to save recipe ${recipe.id} to history:`,
              error,
            );
          }
        }
      }

      // Score recipes
      const scoredRecipes: RecipeWithScore[] = uniqueRecipes.map((recipe) =>
        this.scoreRecipe(recipe, targetWeight, currentWeight),
      );

      // Sort by score descending, then by name
      const sortedRecipes = scoredRecipes
        .sort((a, b) => {
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          return a.name.localeCompare(b.name);
        })
        .slice(0, 25); // Return top 25 recipes (database + spoonacular + ai)

      res.status(200).json({
        success: true,
        data: sortedRecipes,
        count: sortedRecipes.length,
        message:
          sortedRecipes.length > 0
            ? "Recipes matched and ranked by relevance"
            : "No matching recipes found",
        filters: {
          ingredientsCount: ingredients.length,
          cuisine,
          mealType: finalMealType,
          currentWeight,
          targetWeight,
          remainingWeight: targetWeight - currentWeight,
        },
      });
    } catch (error) {
      console.error("Error generating recipes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate recipes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async saveRecipes(
    req: Request<{}, {}, { recipes: Recipe[] }>,
    res: Response,
  ): Promise<void> {
    try {
      const { recipes } = req.body;

      if (!Array.isArray(recipes) || recipes.length === 0) {
        res.status(400).json({
          success: false,
          message: "recipes array is required and must not be empty",
        });
        return;
      }

      let savedCount = 0;
      let skippedCount = 0;
      const savedRecipes: string[] = [];
      const errors: string[] = [];

      for (const recipe of recipes) {
        try {
          // All recipes from external APIs can be saved
          // (No database recipes to skip anymore)

          // Check if recipe already exists by name and main ingredient
          const existingCheck = await query(
            `SELECT recipe_id FROM recipes 
             WHERE name = $1 AND main_ingredient_id = $2 LIMIT 1`,
            [recipe.name, recipe.mainIngredient.id],
          );

          if (existingCheck.rows.length > 0) {
            skippedCount++;
            continue;
          }

          // Generate unique recipe_id based on source and time
          const recipeId = `${recipe.source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Insert recipe
          await query(
            `INSERT INTO recipes 
             (recipe_id, name, cuisine, meal_type, main_ingredient_id, portion_size, portion_unit, prep_time, cook_time, total_time, servings, instructions)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              recipeId,
              recipe.name,
              recipe.cuisine,
              recipe.mealType,
              recipe.mainIngredient.id,
              recipe.portionSize,
              recipe.portionUnit,
              recipe.prepTime,
              recipe.cookTime,
              recipe.totalTime,
              recipe.servings,
              JSON.stringify(
                recipe.instructions.map((inst) => inst.instruction),
              ),
            ],
          );

          // Insert ingredients
          for (const ing of recipe.ingredients) {
            // First ensure ingredient exists
            await query(
              `INSERT INTO ingredients (ingredient_id, name) 
               VALUES ($1, $2) ON CONFLICT (ingredient_id) DO NOTHING`,
              [ing.id, ing.name],
            );

            // Then insert recipe-ingredient relationship
            await query(
              `INSERT INTO recipe_ingredients 
               (recipe_id, ingredient_id, quantity, unit)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (recipe_id, ingredient_id) DO NOTHING`,
              [recipeId, ing.id, ing.quantity || 0, ing.unit || ""],
            );
          }

          savedCount++;
          savedRecipes.push(recipe.name);
        } catch (err) {
          const errorMsg = `Failed to save recipe "${recipe.name}": ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      res.status(200).json({
        success: true,
        message: `Successfully saved ${savedCount} recipes, skipped ${skippedCount} existing recipes`,
        savedRecipes,
        savedCount,
        skippedCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Error saving recipes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save recipes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getSuggestedRecipes(req: Request, res: Response): Promise<void> {
    try {
      const cuisine = (req.query.cuisine as string) || "Filipino";
      const limit = parseInt((req.query.limit as string) || "6", 10);
      const mealType = (req.query.mealType as string) || "Lunch";
      const currentWeight = parseFloat(
        (req.query.currentWeight as string) || "70",
      );
      const targetWeight = parseFloat(
        (req.query.targetWeight as string) || "70",
      );

      console.log("📊 Suggested Recipes Request:");
      console.log(`   Cuisine: ${cuisine}`);
      console.log(`   Meal Type: ${mealType}`);
      console.log(`   Current Weight: ${currentWeight}kg`);
      console.log(`   Target Weight: ${targetWeight}kg`);
      console.log(`   Weight Difference: ${targetWeight - currentWeight}kg`);

      // Calculate calorie range based on weight goals
      const weightDifference = targetWeight - currentWeight;

      // Base metabolic rate approximation: weight(kg) × 30 calories
      // Per meal (assuming 3 meals/day): divide by 3
      const maintenanceCaloriesPerMeal = Math.round((currentWeight * 30) / 3);

      let minCalories: number;
      let maxCalories: number;
      let goal: string;

      if (weightDifference < -5) {
        // Significant weight loss goal: reduce by 200 calories per meal
        minCalories = maintenanceCaloriesPerMeal - 250;
        maxCalories = maintenanceCaloriesPerMeal - 150;
        goal = "weight loss";
      } else if (weightDifference < 0) {
        // Moderate weight loss: reduce by 150 calories per meal
        minCalories = maintenanceCaloriesPerMeal - 200;
        maxCalories = maintenanceCaloriesPerMeal - 100;
        goal = "moderate weight loss";
      } else if (weightDifference > 5) {
        // Significant weight gain: add 200 calories per meal
        minCalories = maintenanceCaloriesPerMeal + 150;
        maxCalories = maintenanceCaloriesPerMeal + 250;
        goal = "weight gain";
      } else if (weightDifference > 0) {
        // Moderate weight gain: add 150 calories per meal
        minCalories = maintenanceCaloriesPerMeal + 100;
        maxCalories = maintenanceCaloriesPerMeal + 200;
        goal = "moderate weight gain";
      } else {
        // Maintenance
        minCalories = maintenanceCaloriesPerMeal - 50;
        maxCalories = maintenanceCaloriesPerMeal + 50;
        goal = "maintenance";
      }

      console.log(`🎯 Calorie Calculation:`);
      console.log(`   Maintenance per meal: ${maintenanceCaloriesPerMeal} cal`);
      console.log(`   Goal: ${goal}`);
      console.log(`   Target range: ${minCalories}-${maxCalories} cal`);

      let recipes: Recipe[] = [];

      // Use Spoonacular API to get recipe suggestions
      if (process.env.SPOONACULAR_API_KEY) {
        try {
          const cuisineParam = cuisine.toLowerCase() !== "any" ? cuisine : "";

          // Map user-friendly meal types to Spoonacular API types
          const mealTypeMapping: Record<string, string> = {
            breakfast: "breakfast",
            lunch: "main course",
            dinner: "main course",
            snack: "snack",
          };
          const spoonacularMealType =
            mealTypeMapping[mealType.toLowerCase()] || "main course";

          const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?cuisine=${encodeURIComponent(cuisineParam)}&type=${encodeURIComponent(spoonacularMealType)}&minCalories=${minCalories}&maxCalories=${maxCalories}&number=${limit}&addRecipeInformation=true&addRecipeInstructions=true&fillIngredients=true&apiKey=${process.env.SPOONACULAR_API_KEY}`;

          console.log(`🌐 Calling Spoonacular API...`);
          console.log(
            `   Meal Type: ${mealType} → Spoonacular Type: ${spoonacularMealType}`,
          );
          console.log(
            `   URL: ${spoonacularUrl.replace(process.env.SPOONACULAR_API_KEY, "API_KEY")}`,
          );

          const response = await fetch(spoonacularUrl);

          // Handle rate limit - return mock data for demo
          if (response.status === 429 || response.status === 402) {
            console.warn(
              "⚠️ Spoonacular rate limit reached - returning mock recipes for demo",
            );
            const mockRecipes = getMockRecipesByMealType(mealType, limit);
            res.json({
              success: true,
              data: mockRecipes,
              demo: true,
              message: "Using demo data - API limit reached",
            });
            return;
          }

          if (response.ok) {
            const data = (await response.json()) as any;

            if (Array.isArray(data.results) && data.results.length > 0) {
              console.log(
                `✅ Spoonacular returned ${data.results.length} recipes`,
              );

              recipes = data.results.map((spoonacularRecipe: any) => {
                const instructions = spoonacularRecipe.analyzedInstructions?.[0]
                  ?.steps
                  ? spoonacularRecipe.analyzedInstructions[0].steps.map(
                      (step: any, idx: number) => ({
                        stepNumber: idx + 1,
                        instruction: step.step || "",
                      }),
                    )
                  : [];

                if (instructions.length === 0) {
                  console.log(
                    `⚠️  No instructions found for recipe: ${spoonacularRecipe.title}`,
                  );
                } else {
                  console.log(
                    `✅ Found ${instructions.length} instruction steps for: ${spoonacularRecipe.title}`,
                  );
                }

                const ingredients = spoonacularRecipe.extendedIngredients
                  ? spoonacularRecipe.extendedIngredients.map(
                      (ing: any, idx: number) => ({
                        id: `spoon-${spoonacularRecipe.id}-${idx}`,
                        name: ing.original || ing.name || "",
                        quantity: ing.amount || 0,
                        unit: ing.unit || "",
                      }),
                    )
                  : [];

                const calories =
                  spoonacularRecipe.nutrition?.nutrients?.find(
                    (n: any) => n.name === "Calories",
                  )?.amount || Math.round((minCalories + maxCalories) / 2);

                return {
                  id: `spoonacular-${spoonacularRecipe.id}`,
                  name: spoonacularRecipe.title || "",
                  image:
                    spoonacularRecipe.image ||
                    this.generateImageUrl(spoonacularRecipe.title || ""),
                  source: "spoonacular",
                  mainIngredient: { id: "", name: "" },
                  sideIngredients: [],
                  ingredients,
                  instructions,
                  mealType: mealType,
                  cuisine: cuisine || "International",
                  portionSize: Math.round(
                    (spoonacularRecipe.servings || 1) * 200,
                  ),
                  portionUnit: "g",
                  prepTime: spoonacularRecipe.readyInMinutes || 30,
                  cookTime: spoonacularRecipe.cookingMinutes || 20,
                  totalTime: spoonacularRecipe.readyInMinutes || 30,
                  servings: spoonacularRecipe.servings || 1,
                  calories: Math.round(calories),
                };
              });
            } else {
              console.log("⚠️  Spoonacular returned no recipes");
            }
          } else {
            console.warn(`❌ Spoonacular API error: ${response.status}`);
          }
        } catch (error) {
          console.error("Error calling Spoonacular API:", error);
        }
      } else {
        console.log("❌ SPOONACULAR_API_KEY not configured");
      }

      // No database fallback - API-only approach
      if (recipes.length === 0) {
        console.log("⚠️ No recipes returned from Spoonacular API");
      }

      // Save suggested recipes to user history
      const userId = req.params.userId || (req as any).user?.userId;

      if (userId && recipes.length > 0) {
        console.log(
          `💾 Saving ${recipes.length} suggested recipes to user history for user: ${userId}`,
        );

        for (const recipe of recipes) {
          try {
            await saveRecipeToHistory(userId, recipe, "suggested");
          } catch (error) {
            console.warn(
              `Failed to save suggested recipe ${recipe.id} to history:`,
              error,
            );
          }
        }
      }

      res.status(200).json({
        success: true,
        data: recipes,
        meta: {
          mealType,
          goal,
          calorieRange: `${minCalories}-${maxCalories} cal`,
          source: recipes[0]?.source || "unknown",
        },
        message: `Retrieved ${recipes.length} ${mealType.toLowerCase()} recipes for ${goal}`,
      });
    } catch (error) {
      console.error("Error fetching suggested recipes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch suggested recipes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getIngredients(req: Request, res: Response): Promise<void> {
    try {
      const rows = await query(
        `SELECT ingredient_id, name, category, is_pantry
         FROM ingredients 
         ORDER BY category, name ASC`,
        [],
      );

      const ingredients = rows.rows.map((row: any) => ({
        id: row.ingredient_id,
        name: row.name,
        category: row.category || "other",
        isPantry: row.is_pantry,
      }));

      // Group by category
      const grouped: Record<string, any[]> = {};
      for (const ing of ingredients) {
        const cat = ing.category ?? "Other";
        if (!grouped[cat]) {
          grouped[cat] = [];
        }
        grouped[cat].push(ing);
      }

      res.status(200).json({
        success: true,
        data: ingredients,
        grouped,
        message: `Retrieved ${ingredients.length} ingredients`,
      });
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch ingredients",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new RecipeController();
