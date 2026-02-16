import type { Request, Response } from "express";
import { Router } from "express";
import favoriteController from "../controllers/favoriteController.js";

const router = Router();

// POST /saveFavorite - Save a recipe as favorite
router.post("/", async (req: Request, res: Response) => {
  await favoriteController.saveFavorite(req, res);
});

// DELETE /saveFavorite/:recipeId - Remove a recipe from favorites
router.delete("/:recipeId", async (req: Request, res: Response) => {
  await favoriteController.removeFavorite(req, res);
});

// GET /saveFavorite/:userId - Get all favorites for a user
router.get("/:userId", async (req: Request, res: Response) => {
  await favoriteController.getUserFavorites(req, res);
});

export default router;
