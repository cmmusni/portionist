import type { Request, Response } from "express";
import { Router } from "express";
import aiRecipeController from "../controllers/aiRecipeController.js";
import recipeController from "../controllers/recipeController.js";
import { MOCK_RECIPES } from "../data/mockRecipes.js";
import { apiTracker } from "../utils/apiTracker.js";
import { mockSearchResults } from "../utils/mockRecipes.js";

const router = Router();

// GET /recipes/search - Search recipes (for Food Log)
router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    // Search Spoonacular API
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      console.error("SPOONACULAR_API_KEY not configured");
      res.status(500).json({ error: "Recipe search not configured" });
      return;
    }

    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${encodeURIComponent(query)}&addRecipeNutrition=true&number=10`;

    const response = await fetch(spoonacularUrl);

    // Track API call
    apiTracker.logCall(
      "spoonacular",
      "/recipes/complexSearch (search)",
      response.status,
    );

    // Handle rate limit - return mock data for demo
    if (response.status === 429 || response.status === 402) {
      console.warn(
        "⚠️ Spoonacular rate limit reached - returning mock recipes for demo",
      );
      const filteredMocks = mockSearchResults.filter((recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase()),
      );
      const results =
        filteredMocks.length > 0
          ? filteredMocks
          : mockSearchResults.slice(0, 10);
      res.json({
        results,
        demo: true,
        message: "Using demo data - API limit reached",
      });
      return;
    }

    if (!response.ok) {
      console.error("Spoonacular API error:", response.status);
      res.status(500).json({ error: "Recipe search failed" });
      return;
    }

    const data: any = await response.json();

    // Transform Spoonacular results to match our format
    const results = (data.results || []).map((recipe: any) => {
      const nutrients = recipe.nutrition?.nutrients || [];

      const getNutrient = (name: string) => {
        const nutrient = nutrients.find((n: any) => n.name === name);
        return nutrient ? Math.round(nutrient.amount * 10) / 10 : 0;
      };

      return {
        id: recipe.id.toString(),
        title: recipe.title,
        protein: getNutrient("Protein"),
        carbs: getNutrient("Carbohydrates"),
        fat: getNutrient("Fat"),
        calories: Math.round(getNutrient("Calories")),
        image: recipe.image,
      };
    });

    res.json({ results });
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.status(500).json({ error: "Failed to search recipes" });
  }
});

// GET /recipes - Get suggested recipes (for dashboard)
router.get("/", async (req: Request, res: Response) => {
  await recipeController.getSuggestedRecipes(req, res);
});

// GET /recipes/ingredients - Get all ingredients from database
router.get("/ingredients", async (req: Request, res: Response) => {
  await recipeController.getIngredients(req, res);
});

// POST /recipes (getRecipes) - Generate/fetch recipes based on user input
router.post("/", async (req: Request, res: Response) => {
  await recipeController.getRecipes(req, res);
});

// POST /recipes/generate - Generate recipe using Spoonacular (primary), AI (fallback), Mock (last resort)
router.post("/generate", async (req: Request, res: Response) => {
  const { ingredients, cuisine, mealType, count } = req.body;
  const recipeCount = Math.min(count || 2, 4);

  // PRIORITY 1: Try Spoonacular API first
  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
      throw new Error("Spoonacular API key not configured");
    }

    // Build search query from ingredients and cuisine
    const ingredientNames =
      ingredients?.map((i: any) => i.name).join(",") || "";
    const searchQuery = ingredientNames || cuisine || "dinner";

    // Search Spoonacular for recipes
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${encodeURIComponent(searchQuery)}&cuisine=${encodeURIComponent(cuisine || "")}&type=${encodeURIComponent(mealType?.toLowerCase() || "")}&addRecipeNutrition=true&addRecipeInstructions=true&number=${recipeCount}`;

    const response = await fetch(spoonacularUrl);

    // Track API call
    apiTracker.logCall(
      "spoonacular",
      "/recipes/complexSearch",
      response.status,
    );

    if (response.ok) {
      const data: any = await response.json();
      const recipes = (data.results || []).map((recipe: any) => {
        const nutrients = recipe.nutrition?.nutrients || [];
        const getNutrient = (name: string) => {
          const nutrient = nutrients.find((n: any) => n.name === name);
          return nutrient ? Math.round(nutrient.amount * 10) / 10 : 0;
        };

        // Get instructions
        const instructions = recipe.analyzedInstructions?.[0]?.steps?.map(
          (step: any, idx: number) => ({
            stepNumber: idx + 1,
            instruction: step.step,
          }),
        ) || [{ stepNumber: 1, instruction: "Watch video" }];

        // Get ingredients
        const recipeIngredients =
          recipe.nutrition?.ingredients?.map((ing: any, idx: number) => ({
            id: `spoon-${recipe.id}-${idx}`,
            name: ing.name,
            quantity: ing.amount || 0,
            unit: ing.unit || "g",
          })) || [];

        return {
          id: `spoonacular-${recipe.id}`,
          name: recipe.title,
          image: recipe.image,
          source: "spoonacular",
          mainIngredient: ingredients?.[0] || { id: "", name: "" },
          sideIngredients: ingredients?.slice(1) || [],
          ingredients: recipeIngredients,
          instructions,
          mealType: mealType || "Lunch",
          cuisine: cuisine || "American",
          portionSize:
            recipe.servings > 0 ? Math.round(400 / recipe.servings) : 400,
          portionUnit: "g",
          prepTime: recipe.preparationMinutes || 30,
          cookTime: recipe.cookingMinutes || 20,
          totalTime: recipe.readyInMinutes || 30,
          servings: recipe.servings || 2,
          calories: Math.round(getNutrient("Calories")),
        };
      });

      if (recipes.length > 0) {
        console.log(
          `✅ Spoonacular primary success: ${recipes.length} recipes`,
        );
        res.status(200).json({
          success: true,
          data: recipes,
          source: "spoonacular",
          message: `Generated ${recipes.length} recipe(s) from Spoonacular`,
        });
        return;
      }
    }

    // If we get here, Spoonacular didn't return good results
    throw new Error(
      `Spoonacular failed: ${response.status} ${response.statusText}`,
    );
  } catch (spoonacularError: any) {
    console.warn(
      "⚠️ Spoonacular failed, attempting Google AI fallback...",
      spoonacularError.message,
    );

    // PRIORITY 2: Try Google AI as fallback
    try {
      await aiRecipeController.generateRecipe(req, res);

      // If response was already sent successfully, we're done
      if (res.headersSent) {
        console.log("✅ Google AI fallback successful");
        return;
      }

      // If we get here, AI didn't send a response, fall through to mock
      throw new Error("AI generation did not return recipes");
    } catch (aiError: any) {
      console.warn(
        "⚠️ Both Spoonacular and AI failed, returning mock recipes...",
        aiError.message,
      );

      // PRIORITY 3: Return mock recipes as last resort
      try {
        // Filter mock recipes by cuisine and mealType if provided
        let filteredMockRecipes = MOCK_RECIPES;

        if (cuisine) {
          filteredMockRecipes = filteredMockRecipes.filter(
            (r) =>
              r.cuisine?.toLowerCase() === cuisine.toLowerCase() || !r.cuisine,
          );
        }

        if (mealType) {
          filteredMockRecipes = filteredMockRecipes.filter(
            (r) =>
              r.mealType?.toLowerCase() === mealType.toLowerCase() ||
              !r.mealType,
          );
        }

        // If no matches, use all mock recipes
        if (filteredMockRecipes.length === 0) {
          filteredMockRecipes = MOCK_RECIPES;
        }

        // Get the requested number of recipes
        const mockRecipes = filteredMockRecipes.slice(0, recipeCount);

        // Format mock recipes to match expected structure
        const formattedMockRecipes = mockRecipes.map(
          (recipe: any, idx: number) => ({
            ...recipe,
            id: recipe.id || `mock-${Date.now()}-${idx}`,
            source: "mock",
            image:
              recipe.image ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
            ingredients: recipe.ingredients || [],
            instructions: Array.isArray(recipe.instructions)
              ? recipe.instructions.map(
                  (
                    inst: string | { stepNumber: number; instruction: string },
                    i: number,
                  ) =>
                    typeof inst === "string"
                      ? { stepNumber: i + 1, instruction: inst }
                      : inst,
                )
              : [],
            portionUnit: recipe.portionUnit || "g",
            prepTime: recipe.prepTime || 20,
            cookTime: recipe.cookTime || 25,
            totalTime: recipe.totalTime || 45,
            servings: recipe.servings || 2,
            calories: recipe.calories || 450,
          }),
        );

        console.log(
          `✅ Returning ${formattedMockRecipes.length} mock recipes as fallback`,
        );
        res.status(200).json({
          success: true,
          data: formattedMockRecipes,
          source: "mock",
          message: `Showing ${formattedMockRecipes.length} sample recipe(s) (external services temporarily unavailable)`,
          fallback: true,
        });
      } catch (mockError: any) {
        console.error("❌ Even mock recipes failed:", mockError);
        res.status(500).json({
          success: false,
          message:
            "Unable to generate recipes at this time. Please try again later.",
          error: "INTERNAL_ERROR",
        });
      }
    }
  }
});

// POST /recipes/save - Save recipes to database
router.post("/save", async (req: Request, res: Response) => {
  await recipeController.saveRecipes(req, res);
});

export default router;
