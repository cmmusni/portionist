import type { Request, Response } from "express";
import { Router } from "express";
import aiRecipeController from "../controllers/aiRecipeController.js";
import recipeController from "../controllers/recipeController.js";
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

// POST /recipes/generate - Generate recipe using AI with Spoonacular fallback
router.post("/generate", async (req: Request, res: Response) => {
  try {
    // First, try AI generation
    await aiRecipeController.generateRecipe(req, res);
    
    // If response was already sent successfully, we're done
    if (res.headersSent) {
      return;
    }
  } catch (aiError: any) {
    console.warn("⚠️ AI generation failed, attempting Spoonacular fallback...", aiError.message);
    
    // AI failed, try Spoonacular as fallback
    try {
      const { ingredients, cuisine, mealType, count } = req.body;
      const apiKey = process.env.SPOONACULAR_API_KEY;

      if (!apiKey) {
        res.status(503).json({
          success: false,
          message: "Both AI and recipe search services are unavailable. Please try again later.",
          error: "ALL_SERVICES_DOWN",
        });
        return;
      }

      // Build search query from ingredients and cuisine
      const ingredientNames = ingredients?.map((i: any) => i.name).join(",") || "";
      const searchQuery = ingredientNames || cuisine || "dinner";
      const recipeCount = Math.min(count || 2, 4);

      // Search Spoonacular for recipes
      const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${encodeURIComponent(searchQuery)}&cuisine=${encodeURIComponent(cuisine || "")}&type=${encodeURIComponent(mealType?.toLowerCase() || "")}&addRecipeNutrition=true&addRecipeInstructions=true&number=${recipeCount}`;

      const response = await fetch(spoonacularUrl);
      
      // Track API call
      apiTracker.logCall(
        "spoonacular",
        "/recipes/complexSearch (fallback)",
        response.status,
      );

      if (response.status === 429 || response.status === 402) {
        // Both APIs are rate limited
        res.status(503).json({
          success: false,
          message: "Recipe services are temporarily at capacity. Both AI and recipe search have reached their daily limits. Please try again later.",
          error: "ALL_SERVICES_DOWN",
          retryAfter: "Try again tomorrow when quotas reset",
        });
        return;
      }

      if (!response.ok) {
        res.status(503).json({
          success: false,
          message: "Recipe services are temporarily unavailable. Please try again later.",
          error: "ALL_SERVICES_DOWN",
        });
        return;
      }

      const data: any = await response.json();
      const recipes = (data.results || []).map((recipe: any) => {
        const nutrients = recipe.nutrition?.nutrients || [];
        const getNutrient = (name: string) => {
          const nutrient = nutrients.find((n: any) => n.name === name);
          return nutrient ? Math.round(nutrient.amount * 10) / 10 : 0;
        };

        // Get instructions
        const instructions = recipe.analyzedInstructions?.[0]?.steps?.map((step: any, idx: number) => ({
          stepNumber: idx + 1,
          instruction: step.step,
        })) || [{ stepNumber: 1, instruction: "Watch video" }];

        // Get ingredients
        const recipeIngredients = recipe.nutrition?.ingredients?.map((ing: any, idx: number) => ({
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
          portionSize: recipe.servings > 0 ? Math.round(400 / recipe.servings) : 400,
          portionUnit: "g",
          prepTime: recipe.preparationMinutes || 30,
          cookTime: recipe.cookingMinutes || 20,
          totalTime: recipe.readyInMinutes || 30,
          servings: recipe.servings || 2,
          calories: Math.round(getNutrient("Calories")),
        };
      });

      if (recipes.length === 0) {
        res.status(503).json({
          success: false,
          message: "No recipes found. Both AI and recipe search are temporarily unavailable.",
          error: "ALL_SERVICES_DOWN",
        });
        return;
      }

      console.log(`✅ Spoonacular fallback successful: ${recipes.length} recipes`);
      res.status(200).json({
        success: true,
        data: recipes,
        source: "spoonacular-fallback",
        message: `Generated ${recipes.length} recipe(s) using recipe search (AI temporarily at capacity)`,
        fallback: true,
      });
    } catch (spoonacularError: any) {
      console.error("❌ Both AI and Spoonacular failed:", spoonacularError);
      res.status(503).json({
        success: false,
        message: "Recipe services are temporarily down. Both AI and recipe search are unavailable. Please try again later.",
        error: "ALL_SERVICES_DOWN",
        retryAfter: "5-10 minutes",
      });
    }
  }
});

// POST /recipes/save - Save recipes to database
router.post("/save", async (req: Request, res: Response) => {
  await recipeController.saveRecipes(req, res);
});

export default router;
