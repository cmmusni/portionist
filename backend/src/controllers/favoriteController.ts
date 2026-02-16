import type { Request, Response } from "express";

interface SaveFavoriteRequest {
  userId: string;
  recipeId: string;
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

// Mock favorites storage (in production, this would be a database)
const userFavorites: Map<string, Set<string>> = new Map();

class FavoriteController {
  /**
   * Save a recipe as a user's favorite
   */
  async saveFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { userId, recipeId } = req.body as SaveFavoriteRequest;

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

      // Get or create user's favorites set
      if (!userFavorites.has(userId)) {
        userFavorites.set(userId, new Set<string>());
      }

      const userFavoriteSet = userFavorites.get(userId)!;

      // Check if already favorited
      if (userFavoriteSet.has(recipeId)) {
        res.status(200).json({
          success: true,
          message: "Recipe already in favorites",
          data: {
            userId,
            recipeId,
            savedAt: new Date().toISOString(),
          },
        });
        return;
      }

      // Add to favorites
      userFavoriteSet.add(recipeId);

      res.status(201).json({
        success: true,
        message: "Recipe saved to favorites",
        data: {
          userId,
          recipeId,
          savedAt: new Date().toISOString(),
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

      // Get user's favorites set
      const userFavoriteSet = userFavorites.get(userId);

      if (!userFavoriteSet || !userFavoriteSet.has(recipeId)) {
        res.status(404).json({
          success: false,
          error: "Recipe not found in user's favorites",
        });
        return;
      }

      // Remove from favorites
      userFavoriteSet.delete(recipeId);

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

      const userFavoriteSet = userFavorites.get(userId);
      const favorites = userFavoriteSet ? Array.from(userFavoriteSet) : [];

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
