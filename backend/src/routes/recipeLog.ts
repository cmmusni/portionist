import type { Request, Response } from "express";
import { Router } from "express";
import {
    clearRecipeHistory,
    getRecipeLog,
    saveRecipeToHistory,
} from "../controllers/recipeLogController.js";

const router = Router();

// GET /recipe-log/:userId - Get user's recipe log
router.get("/:userId", getRecipeLog);

// POST /recipe-log/:userId - Save recipe to user's history
router.post("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { recipeId, recipeData, interactionType } = req.body;

    if (!recipeId || !recipeData || !interactionType) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: recipeId, recipeData, interactionType",
      });
      return;
    }

    await saveRecipeToHistory(userId, recipeData, interactionType);

    res.json({
      success: true,
      message: "Recipe saved to history",
    });
  } catch (error) {
    console.error("Error saving recipe to history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save recipe to history",
    });
  }
});

// DELETE /recipe-log/:userId - Clear user's recipe history
router.delete("/:userId", clearRecipeHistory);

export default router;
