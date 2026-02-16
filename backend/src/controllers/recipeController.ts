import type { Request, Response } from "express";
import { query } from "../db/connection.js";

interface Ingredient {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
}

interface GetRecipesRequest {
  mainIngredient: Ingredient;
  sideIngredients: Ingredient[];
  currentWeight: number;
  targetWeight: number;
  mealType: string;
  cuisine: string;
}

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: "database" | "spoonacular" | "ai";
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
}

interface RecipeWithScore extends Recipe {
  matchScore: number;
  scoreBreakdown: {
    mainIngredientMatch: number;
    sideIngredientsMatch: number;
    portionMatch: number;
  };
}

// Mock recipe database
const MOCK_RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Grilled Chicken with Rice",
    image:
      "https://png.pngtree.com/png-vector/20230808/ourmid/pngtree-recipe-card-vector-png-image_6874598.png",
    source: "database",
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
    source: "database",
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
    source: "database",
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
  private generateImageUrl(recipeName: string): string {
    // Return a reliable static recipe image
    return "https://png.pngtree.com/png-vector/20230808/ourmid/pngtree-recipe-card-vector-png-image_6874598.png";
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
        `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=5&addRecipeInformation=true&apiKey=${process.env.SPOONACULAR_API_KEY}`,
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

        return {
          id: `spoonacular-${spoonacularRecipe.id}`,
          name: spoonacularRecipe.title || "",
          image: spoonacularRecipe.image || this.generateImageUrl(""),
          source: "spoonacular",
          mainIngredient: { id: mainIngredientId, name: mainIngredient },
          sideIngredients: [],
          ingredients,
          instructions,
          mealType: "Lunch",
          cuisine: cuisine || "International",
          portionSize: spoonacularRecipe.servings * 100 || 300,
          portionUnit: "g",
          prepTime: 15,
          cookTime: spoonacularRecipe.readyInMinutes || 30,
          totalTime: spoonacularRecipe.readyInMinutes || 30,
          servings: spoonacularRecipe.servings || 1,
        };
      });
    } catch (error) {
      console.warn("Failed to fetch from Spoonacular:", error);
      return [];
    }
  }

  /**
   * Score a recipe based on:
   * - Main ingredient match (40%)
   * - Side ingredients match (20%)
   * - Portion match (40%)
   */
  private scoreRecipe(
    recipe: Recipe,
    mainIngredient: Ingredient,
    sideIngredients: Ingredient[],
    targetWeight: number,
    currentWeight: number,
  ): RecipeWithScore {
    const remainingWeight = targetWeight - currentWeight;

    // 1. Main Ingredient Match (40%)
    const mainIngredientMatch =
      recipe.mainIngredient.id === mainIngredient.id ? 1 : 0;
    const mainIngredientScore = mainIngredientMatch * 0.4;

    // 2. Side Ingredients Match (20%)
    let sideIngredientsMatched = 0;
    if (sideIngredients.length > 0) {
      sideIngredientsMatched = recipe.sideIngredients.filter((recipeSide) =>
        sideIngredients.some((userSide) => userSide.id === recipeSide.id),
      ).length;
    }
    const sideIngredientsRatio =
      sideIngredients.length > 0
        ? sideIngredientsMatched / sideIngredients.length
        : 0;
    const sideIngredientsScore = sideIngredientsRatio * 0.2;

    // 3. Portion Match (40%)
    // Calculate how close the recipe portion is to the remaining weight
    // But be more forgiving - a reasonable meal is 150-400g, so don't penalize too much
    const portionDifference = Math.abs(recipe.portionSize - remainingWeight);
    // Use a more generous max to avoid extreme penalties
    // Treat portions above 150g as reasonable for a meal
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
    const portionScore = portionMatchRatio * 0.4;

    // Total score (0-100)
    const totalScore =
      (mainIngredientScore + sideIngredientsScore + portionScore) * 100;

    return {
      ...recipe,
      matchScore: totalScore,
      scoreBreakdown: {
        mainIngredientMatch: mainIngredientScore,
        sideIngredientsMatch: sideIngredientsScore,
        portionMatch: portionScore,
      },
    };
  }

  async getRecipes(
    req: Request<{}, {}, GetRecipesRequest>,
    res: Response,
  ): Promise<void> {
    try {
      const {
        mainIngredient,
        sideIngredients,
        currentWeight,
        targetWeight,
        mealType,
        cuisine,
      } = req.body;

      // Validate required fields
      if (!mainIngredient || !mainIngredient.id || !mainIngredient.name) {
        res.status(400).json({
          success: false,
          message: "mainIngredient with id and name is required",
        });
        return;
      }

      if (!mealType || !cuisine) {
        res.status(400).json({
          success: false,
          message: "mealType and cuisine are required",
        });
        return;
      }

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

      // Try to load recipes from the database; fallback to mock data
      let recipesToScore: Recipe[] = [];
      try {
        const rows = await query(
          `SELECT r.recipe_id, r.name, r.cuisine, r.meal_type, r.main_ingredient_id, r.portion_size, r.portion_unit, r.prep_time, r.cook_time, r.total_time, r.servings, r.instructions,
                  ri.ingredient_id, ri.quantity as ing_quantity, ri.unit as ing_unit, i.name as ingredient_name,
                  main_i.name as main_ingredient_name
           FROM recipes r
           LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.recipe_id
           LEFT JOIN ingredients i ON i.ingredient_id = ri.ingredient_id
           LEFT JOIN ingredients main_i ON main_i.ingredient_id = r.main_ingredient_id`,
          [],
        );

        // assemble recipes grouped by recipe_id
        const map: Record<string, any> = {};
        for (const row of rows.rows) {
          const id = row.recipe_id;
          if (!map[id]) {
            map[id] = {
              id,
              name: row.name,
              image: this.generateImageUrl(row.name),
              source: "database",
              mainIngredient: row.main_ingredient_id
                ? {
                    id: row.main_ingredient_id,
                    name: row.main_ingredient_name || "",
                  }
                : { id: "", name: "" },
              sideIngredients: [],
              ingredients: [],
              instructions: Array.isArray(row.instructions)
                ? row.instructions.map((s: any, idx: number) => ({
                    stepNumber: idx + 1,
                    instruction: String(s),
                  }))
                : [],
              mealType,
              cuisine,
              portionSize: row.portion_size || 0,
              portionUnit: row.portion_unit || "g",
              prepTime: row.prep_time || 0,
              cookTime: row.cook_time || 0,
              totalTime: row.total_time || 0,
              servings: row.servings || 1,
            };
          }
          if (row.ingredient_id) {
            map[id].ingredients.push({
              id: row.ingredient_id,
              name: row.ingredient_name || row.ingredient_id,
              quantity: row.ing_quantity || 0,
              unit: row.ing_unit || "",
            });
          }
        }

        recipesToScore = Object.values(map) as Recipe[];
      } catch (err) {
        console.warn(
          "DB recipe load failed, falling back to MOCK_RECIPES:",
          String(err),
        );
        // fallback - return all mock recipes
        recipesToScore = MOCK_RECIPES;
      }

      // Fetch from Spoonacular API if configured
      if (process.env.SPOONACULAR_API_KEY) {
        console.log(
          "🍳 Fetching from Spoonacular API with key:",
          process.env.SPOONACULAR_API_KEY.substring(0, 10) + "...",
        );
        const spoonacularRecipes = await this.fetchFromSpoonacular(
          mainIngredient.name,
          mainIngredient.id,
          cuisine,
        );
        console.log(
          `🍳 Got ${spoonacularRecipes.length} recipes from Spoonacular`,
        );
        recipesToScore.push(...spoonacularRecipes);
      } else {
        console.log("❌ SPOONACULAR_API_KEY not configured");
      }

      // Score recipes
      const scoredRecipes: RecipeWithScore[] = recipesToScore.map((recipe) =>
        this.scoreRecipe(
          recipe,
          mainIngredient,
          sideIngredients || [],
          targetWeight,
          currentWeight,
        ),
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
          mainIngredient: mainIngredient.name,
          cuisine,
          mealType,
          currentWeight,
          targetWeight,
          remainingWeight: targetWeight - currentWeight,
          sideIngredientsCount: sideIngredients?.length || 0,
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
          // Skip database recipes as they already exist
          if (recipe.source === "database") {
            skippedCount++;
            continue;
          }

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

  async getIngredients(req: Request, res: Response): Promise<void> {
    try {
      const rows = await query(
        `SELECT ingredient_id, name, category, is_pantry, is_main
         FROM ingredients 
         ORDER BY category, name ASC`,
        [],
      );

      const ingredients = rows.rows.map((row: any) => ({
        id: row.ingredient_id,
        name: row.name,
        category: row.category || "other",
        isPantry: row.is_pantry,
        isMain: row.is_main,
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
