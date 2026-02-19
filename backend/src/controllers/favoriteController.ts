import type { Request, Response } from "express";
import { query } from "../db/connection.js";

interface SaveFavoriteRequest {
  userId: string;
  recipeId: string;
  recipeName: string;
  recipeData: any;
}

interface RemoveFavoriteRequest {
  userId: string;
  recipeId: string;
}

interface SaveFavoriteResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    userId: string;
    recipeId: string;
    savedAt: string;
  };
}

class FavoriteController {
  /**
   * Save a recipe as a user's favorite
   */
  async saveFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { userId, recipeId, recipeName, recipeData } =
        req.body as SaveFavoriteRequest;

      // Validate required fields
      if (!userId || !recipeId || !recipeName) {
        res.status(400).json({
          success: false,
          error: "userId, recipeId, and recipeName are required",
        });
        return;
      }

      // Validate input types
      if (
        typeof userId !== "string" ||
        typeof recipeId !== "string" ||
        typeof recipeName !== "string"
      ) {
        res.status(400).json({
          success: false,
          error: "userId, recipeId, and recipeName must be strings",
        });
        return;
      }

      // Check if already favorited
      const existingFavorite = await query(
        "SELECT * FROM favorites WHERE user_id = $1 AND recipe_id = $2",
        [userId, recipeId],
      );

      if (existingFavorite.rows.length > 0) {
        res.status(200).json({
          success: true,
          message: "Recipe already in favorites",
          data: {
            userId,
            recipeId,
            savedAt: existingFavorite.rows[0].created_at,
          },
        });
        return;
      }

      // Add to favorites
      const result = await query(
        "INSERT INTO favorites (user_id, recipe_id, recipe_name, recipe_data) VALUES ($1, $2, $3, $4) RETURNING *",
        [userId, recipeId, recipeName, JSON.stringify(recipeData || {})],
      );

      res.status(201).json({
        success: true,
        message: "Recipe saved to favorites",
        data: {
          userId,
          recipeId,
          savedAt: result.rows[0].created_at,
        },
      });
    } catch (error) {
      console.error("Error saving favorite:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Remove a recipe from a user's favorites
   */
  async removeFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { recipeId } = req.params as { recipeId: string };
      const { userId } = req.body as RemoveFavoriteRequest;

      // Validate required fields
      if (!userId || !recipeId) {
        res.status(400).json({
          success: false,
          error: "userId and recipeId are required",
        });
        return;
      }

      // Validate input types
      if (typeof userId !== "string" || typeof recipeId !== "string") {
        res.status(400).json({
          success: false,
          error: "userId and recipeId must be strings",
        });
        return;
      }

      // Check if favorite exists
      const existingFavorite = await query(
        "SELECT * FROM favorites WHERE user_id = $1 AND recipe_id = $2",
        [userId, recipeId],
      );

      if (existingFavorite.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: "Recipe not found in user's favorites",
        });
        return;
      }

      // Remove from favorites
      await query(
        "DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2",
        [userId, recipeId],
      );

      res.status(200).json({
        success: true,
        message: "Recipe removed from favorites",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all favorites for a user
   */
  async getUserFavorites(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Validate userId
      if (!userId || typeof userId !== "string") {
        res.status(400).json({
          success: false,
          error: "userId must be a valid string",
        });
        return;
      }

      // Fetch favorites from database
      const result = await query(
        "SELECT recipe_id, recipe_name, recipe_data, created_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC",
        [userId],
      );

      // Parse recipe_data from JSONB to object
      const favorites = result.rows.map((row) => ({
        ...row.recipe_data,
        id: row.recipe_id,
        name: row.recipe_name,
        savedAt: row.created_at,
      }));

      res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new FavoriteController();
