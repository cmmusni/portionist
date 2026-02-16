import type { Request, Response } from "express";
import { Router } from "express";
import aiRecipeController from "../controllers/aiRecipeController.js";
import recipeController from "../controllers/recipeController.js";

const router = Router();

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
