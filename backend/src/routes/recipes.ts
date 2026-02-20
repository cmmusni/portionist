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

// POST /recipes/generate - Generate recipe using AI
router.post("/generate", async (req: Request, res: Response) => {
  await aiRecipeController.generateRecipe(req, res);
});

// POST /recipes/save - Save recipes to database
router.post("/save", async (req: Request, res: Response) => {
  await recipeController.saveRecipes(req, res);
});

export default router;
