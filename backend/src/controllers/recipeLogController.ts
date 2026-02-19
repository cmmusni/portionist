import type { Request, Response } from "express";
import { query } from "../db/connection.js";

/**
 * Save recipe to user's history
 */
export const saveRecipeToHistory = async (
  userId: string,
  recipeData: any,
  interactionType: "search" | "suggested" | "viewed",
): Promise<void> => {
  try {
    await query(
      `INSERT INTO user_recipe_history (user_id, recipe_id, recipe_data, interaction_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, recipe_id, interaction_type) 
       DO UPDATE SET searched_at = CURRENT_TIMESTAMP, recipe_data = $3`,
      [userId, recipeData.id, JSON.stringify(recipeData), interactionType],
    );
  } catch (error) {
    console.error("Error saving recipe to history:", error);
  }
};

/**
 * Get user's recipe log (searches + suggested meals)
 */
export const getRecipeLog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const type = req.query.type as string | undefined;
    const limitStr = (req.query.limit as string) || "50";
    const limit = parseInt(limitStr, 10);

    let whereClause = "WHERE user_id = $1";
    const params: (string | number)[] = [userId];

    if (type && (type === "search" || type === "suggested")) {
      whereClause += " AND interaction_type = $2";
      params.push(type);
    }

    const result = await query(
      `SELECT 
        id,
        user_id,
        recipe_id,
        recipe_data,
        interaction_type,
        searched_at
       FROM user_recipe_history
       ${whereClause}
       ORDER BY searched_at DESC
       LIMIT $${params.length + 1}`,
      [...params, limit],
    );

    const recipes = result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      recipe_id: row.recipe_id,
      recipe_data: row.recipe_data,
      interaction_type: row.interaction_type,
      searched_at: row.searched_at,
    }));

    res.json({
      success: true,
      data: recipes,
      count: recipes.length,
    });
  } catch (error) {
    console.error("Error fetching recipe log:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recipe log",
    });
  }
};

/**
 * Clear user's recipe history
 */
export const clearRecipeHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const type = req.query.type as string | undefined;

    if (type && (type === "search" || type === "suggested")) {
      await query(
        `DELETE FROM user_recipe_history 
         WHERE user_id = $1 AND interaction_type = $2`,
        [userId, type as string],
      );
    } else {
      await query(`DELETE FROM user_recipe_history WHERE user_id = $1`, [
        userId,
      ]);
    }

    res.json({
      success: true,
      message: "Recipe history cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing recipe history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear recipe history",
    });
  }
};
