import type { Request, Response } from "express";
import { query } from "../db/connection.js";

/**
 * Get ingredients with optional search/filtering
 * Supports autocomplete and full ingredient list
 */
export const getIngredients = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const searchQuery = (req.query.query as string) || "";
    const limit = parseInt((req.query.limit as string) || "100", 10);
    const offset = parseInt((req.query.offset as string) || "0", 10);
    const categoryFilter = req.query.category as string;
    const commonOnly = req.query.common === "true";
    const pantryOnly = req.query.pantry === "true";

    let sqlQuery = `
      SELECT 
        ingredient_id,
        name,
        category,
        is_common,
        is_pantry
      FROM ingredients
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Search by name (autocomplete)
    if (searchQuery.trim()) {
      sqlQuery += ` AND LOWER(name) LIKE LOWER($${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Filter by category
    if (categoryFilter) {
      sqlQuery += ` AND category = $${paramIndex}`;
      params.push(categoryFilter);
      paramIndex++;
    }

    // Filter common ingredients
    if (commonOnly) {
      sqlQuery += ` AND is_common = true`;
    }

    // Filter pantry items
    if (pantryOnly) {
      sqlQuery += ` AND is_pantry = true`;
    }

    // Order by relevance: exact matches first, then pantry, then common, then alphabetically
    if (searchQuery.trim()) {
      sqlQuery += `
        ORDER BY 
          CASE WHEN LOWER(name) = LOWER($1) THEN 1 ELSE 2 END,
          is_pantry DESC,
          is_common DESC,
          name ASC
      `;
    } else {
      sqlQuery += `
        ORDER BY 
          is_pantry DESC,
          is_common DESC,
          name ASC
      `;
    }

    // Pagination
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sqlQuery, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM ingredients WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (searchQuery.trim()) {
      countQuery += ` AND LOWER(name) LIKE LOWER($${countParamIndex})`;
      countParams.push(`%${searchQuery}%`);
      countParamIndex++;
    }

    if (categoryFilter) {
      countQuery += ` AND category = $${countParamIndex}`;
      countParams.push(categoryFilter);
      countParamIndex++;
    }

    if (commonOnly) {
      countQuery += ` AND is_common = true`;
    }

    if (pantryOnly) {
      countQuery += ` AND is_pantry = true`;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    res.status(200).json({
      success: true,
      data: {
        ingredients: result.rows,
        total,
        limit,
        offset,
        hasMore: offset + result.rows.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ingredients",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get ingredient categories
 */
export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM ingredients
      GROUP BY category
      ORDER BY count DESC, category ASC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
};

/**
 * Get a specific ingredient by ID
 */
export const getIngredientById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "Ingredient ID is required",
      });
      return;
    }

    const result = await query(
      `
      SELECT 
        ingredient_id,
        name,
        category,
        is_common,
        is_pantry
      FROM ingredients
      WHERE ingredient_id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Ingredient not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ingredient",
    });
  }
};
