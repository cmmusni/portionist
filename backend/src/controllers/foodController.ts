import { Request, Response } from "express";
import { query } from "../db/connection.js";
import { apiTracker } from "../utils/apiTracker.js";
import { mockRecipeDetails } from "../utils/mockRecipes.js";

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface SpoonacularNutrition {
  nutrients: SpoonacularNutrient[];
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  nutrition: SpoonacularNutrition;
}

interface SpoonacularResponse {
  results: SpoonacularRecipe[];
  offset: number;
  number: number;
  totalResults: number;
}

interface PlateBalanceResponse {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  portionScore: number;
}

export class FoodController {
  /**
   * Log food from Spoonacular search
   * POST /api/food/log
   * Body: { recipeId: number }
   */
  async logFoodFromSearch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      console.log("=== LOG FOOD FROM SEARCH ===");
      console.log("Request body:", JSON.stringify(req.body));
      console.log("recipeId value:", req.body.recipeId);
      console.log("recipeId type:", typeof req.body.recipeId);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      const { recipeId } = req.body;

      if (!recipeId || typeof recipeId !== "number") {
        console.error("Invalid recipeId:", {
          value: recipeId,
          type: typeof recipeId,
          isNull: recipeId === null,
          isUndefined: recipeId === undefined,
        });
        res.status(400).json({
          success: false,
          error: "recipeId is required and must be a number",
        });
        return;
      }

      // Get Spoonacular API key from environment
      const apiKey = process.env.SPOONACULAR_API_KEY;

      if (!apiKey) {
        console.error("SPOONACULAR_API_KEY not configured");
        res.status(500).json({
          success: false,
          error: "Food logging service not configured",
        });
        return;
      }

      // Call Spoonacular API to get specific recipe by ID
      const spoonacularUrl = new URL(
        `https://api.spoonacular.com/recipes/${recipeId}/information`,
      );
      spoonacularUrl.searchParams.set("apiKey", apiKey);
      spoonacularUrl.searchParams.set("includeNutrition", "true");

      console.log("=== SPOONACULAR API CALL ===");
      console.log("Requested recipe ID:", recipeId);
      console.log("API URL:", spoonacularUrl.toString().replace(apiKey, "***"));

      const response = await fetch(spoonacularUrl.toString());

      // Track API call
      apiTracker.logCall(
        "spoonacular",
        `/recipes/${recipeId}/information`,
        response.status,
      );

      // Handle rate limit - use mock data for demo
      if (response.status === 429 || response.status === 402) {
        console.warn(
          "⚠️ Spoonacular rate limit reached - checking mock data for recipe:",
          recipeId,
        );

        const mockRecipeKey = `mock-${recipeId}`;
        const mockRecipe = mockRecipeDetails[mockRecipeKey];

        if (mockRecipe) {
          console.log("✅ Found mock recipe, using demo data");
          const recipe = mockRecipe;
          const nutrients = recipe.nutrition.nutrients;

          const protein =
            nutrients.find((n: any) => n.name === "Protein")?.amount || 0;
          const carbs =
            nutrients.find((n: any) => n.name === "Carbohydrates")?.amount || 0;
          const fat = nutrients.find((n: any) => n.name === "Fat")?.amount || 0;
          const calories =
            nutrients.find((n: any) => n.name === "Calories")?.amount || 0;

          // Continue with normal flow using mock data
          const today = new Date().toISOString().split("T")[0];

          const duplicateCheck = await query(
            `SELECT * FROM food_entries 
             WHERE user_id = $1 
             AND ((recipe_id = $2 AND recipe_id IS NOT NULL) OR title = $3)
             AND DATE(logged_at) = $4`,
            [userId, recipeId.toString(), recipe.title, today],
          );

          if (duplicateCheck.rows.length > 0) {
            res.status(409).json({
              success: false,
              error:
                "You have already logged this recipe today. Each recipe can only be logged once per day.",
            });
            return;
          }

          const insertResult = await query(
            `INSERT INTO food_entries (user_id, recipe_id, title, nutrition, logged_at, source)
             VALUES ($1, $2, $3, $4, NOW(), $5)
             RETURNING *`,
            [
              userId,
              recipeId.toString(),
              recipe.title,
              JSON.stringify({ protein, carbs, fat, calories }),
              "demo", // Mark as demo data
            ],
          );

          const entry = insertResult.rows[0];

          res.json({
            success: true,
            data: {
              id: entry.id,
              recipe_id: entry.recipe_id,
              title: entry.title,
              nutrition: entry.nutrition,
              logged_at: entry.logged_at,
              source: entry.source,
            },
            demo: true,
            message: "Using demo data - API limit reached",
          });
          return;
        } else {
          // No mock data available for this recipe
          console.warn("❌ No mock data available for recipe:", recipeId);
          res.status(402).json({
            success: false,
            error:
              "API limit reached and no demo data available for this recipe",
          });
          return;
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          res.status(404).json({
            success: false,
            error: "Recipe not found",
          });
          return;
        }
        throw new Error(
          `Spoonacular API error: ${response.status} ${response.statusText}`,
        );
      }

      const recipe = (await response.json()) as SpoonacularRecipe;

      console.log("Spoonacular response:", {
        id: recipe.id,
        title: recipe.title,
        hasNutrition: !!recipe.nutrition,
      });

      console.log("Recipe to be logged:", {
        requestedId: recipeId,
        receivedId: recipe.id,
        title: recipe.title,
        idsMatch: recipe.id === recipeId,
      });

      if (recipe.id !== recipeId) {
        console.error("⚠️  WARNING: Recipe ID mismatch!");
        console.error("Requested:", recipeId);
        console.error("Received:", recipe.id);
        res.status(500).json({
          success: false,
          error: "Recipe ID mismatch - data integrity error",
        });
        return;
      }

      const nutrients = recipe.nutrition.nutrients;

      // Extract nutrition data
      const proteinNutrient = nutrients.find((n) => n.name === "Protein");
      const carbsNutrient = nutrients.find((n) => n.name === "Carbohydrates");
      const fatNutrient = nutrients.find((n) => n.name === "Fat");
      const caloriesNutrient = nutrients.find((n) => n.name === "Calories");

      const protein = proteinNutrient?.amount || 0;
      const carbs = carbsNutrient?.amount || 0;
      const fat = fatNutrient?.amount || 0;
      const calories = caloriesNutrient?.amount || 0;

      // Check for duplicates - same recipe logged today
      console.log("=== DUPLICATE CHECK ===");
      console.log("Checking for userId:", userId, "recipeId:", recipeId);

      const duplicateCheck = await query(
        `
        SELECT id, recipe_id, title, created_at FROM food_entries
        WHERE user_id = $1 AND recipe_id = $2
        AND DATE(created_at) = CURRENT_DATE
        LIMIT 1
      `,
        [userId, recipeId],
      );

      console.log("Duplicate check results:", duplicateCheck.rows);
      console.log("Number of duplicates found:", duplicateCheck.rows.length);

      if (duplicateCheck.rows.length > 0) {
        console.log("DUPLICATE FOUND:", {
          existingId: duplicateCheck.rows[0].id,
          existingRecipeId: duplicateCheck.rows[0].recipe_id,
          existingTitle: duplicateCheck.rows[0].title,
          existingCreatedAt: duplicateCheck.rows[0].created_at,
          newRecipeId: recipeId,
        });

        res.status(409).json({
          success: false,
          error: "This recipe has already been logged today",
        });
        return;
      }

      // Insert into database
      const insertResult = await query(
        `
        INSERT INTO food_entries (user_id, recipe_id, title, protein, carbs, fat, calories)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, user_id, recipe_id, title, protein, carbs, fat, calories, created_at
      `,
        [userId, recipeId, recipe.title, protein, carbs, fat, calories],
      );

      const loggedEntry = insertResult.rows[0];

      res.status(201).json({
        success: true,
        message: "Food logged successfully",
        data: {
          id: loggedEntry.id,
          recipeId: loggedEntry.recipe_id,
          title: loggedEntry.title,
          nutrition: {
            protein: parseFloat(loggedEntry.protein),
            carbs: parseFloat(loggedEntry.carbs),
            fat: parseFloat(loggedEntry.fat),
            calories: parseFloat(loggedEntry.calories),
          },
          loggedAt: loggedEntry.created_at,
        },
      });
    } catch (error) {
      console.error("Error logging food:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to log food",
      });
    }
  }

  /**
   * Log custom/AI-generated food with provided nutrition data
   * POST /api/food/log-custom
   * Body: { title: string, protein: number, carbs: number, fat: number, calories: number, recipeIdentifier?: string }
   */
  async logCustomFood(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      console.log("=== LOG CUSTOM/AI FOOD ===");
      console.log("Request body:", JSON.stringify(req.body));

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      const { title, protein, carbs, fat, calories, recipeIdentifier } =
        req.body;

      // Validate required fields
      if (!title || typeof title !== "string") {
        res.status(400).json({
          success: false,
          error: "title is required and must be a string",
        });
        return;
      }

      if (
        typeof protein !== "number" ||
        typeof carbs !== "number" ||
        typeof fat !== "number" ||
        typeof calories !== "number"
      ) {
        res.status(400).json({
          success: false,
          error: "protein, carbs, fat, and calories must be numbers",
        });
        return;
      }

      // Generate a unique ID for custom recipes (negative numbers to avoid collision with Spoonacular)
      // Use provided identifier or generate from title hash
      const recipeId = recipeIdentifier
        ? Math.abs(
            recipeIdentifier.split("").reduce((acc: number, char: string) => {
              return acc + char.charCodeAt(0);
            }, 0),
          ) * -1
        : Math.abs(
            title.split("").reduce((acc: number, char: string) => {
              return acc + char.charCodeAt(0);
            }, 0),
          ) * -1;

      console.log("Generated recipe ID for custom recipe:", recipeId);

      // Check for duplicates - same recipe logged today
      console.log("=== DUPLICATE CHECK ===");
      console.log("Checking for userId:", userId, "title:", title);

      const duplicateCheck = await query(
        `
        SELECT id, recipe_id, title, created_at FROM food_entries
        WHERE user_id = $1 AND title = $2
        AND DATE(created_at) = CURRENT_DATE
        LIMIT 1
      `,
        [userId, title],
      );

      console.log("Duplicate check results:", duplicateCheck.rows);

      if (duplicateCheck.rows.length > 0) {
        console.log("DUPLICATE FOUND:", {
          existingId: duplicateCheck.rows[0].id,
          existingTitle: duplicateCheck.rows[0].title,
          existingCreatedAt: duplicateCheck.rows[0].created_at,
          newTitle: title,
        });

        res.status(409).json({
          success: false,
          error: "This recipe has already been logged today",
        });
        return;
      }

      // Insert into database
      const insertResult = await query(
        `
        INSERT INTO food_entries (user_id, recipe_id, title, protein, carbs, fat, calories)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, user_id, recipe_id, title, protein, carbs, fat, calories, created_at
      `,
        [userId, recipeId, title, protein, carbs, fat, calories],
      );

      const loggedEntry = insertResult.rows[0];

      console.log("Custom food logged successfully:", {
        id: loggedEntry.id,
        title: loggedEntry.title,
      });

      res.status(201).json({
        success: true,
        message: "Food logged successfully",
        data: {
          id: loggedEntry.id,
          recipeId: loggedEntry.recipe_id,
          title: loggedEntry.title,
          nutrition: {
            protein: parseFloat(loggedEntry.protein),
            carbs: parseFloat(loggedEntry.carbs),
            fat: parseFloat(loggedEntry.fat),
            calories: parseFloat(loggedEntry.calories),
          },
          loggedAt: loggedEntry.created_at,
        },
      });
    } catch (error) {
      console.error("Error logging custom food:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to log custom food",
      });
    }
  }

  /**
   * Get today's plate balance
   * GET /api/food/today
   */
  async getTodayPlateBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      // Query today's totals
      const result = await query(
        `
        SELECT
          COALESCE(SUM(protein), 0) AS protein,
          COALESCE(SUM(carbs), 0) AS carbs,
          COALESCE(SUM(fat), 0) AS fat,
          COALESCE(SUM(calories), 0) AS calories
        FROM food_entries
        WHERE user_id = $1
        AND DATE(created_at) = CURRENT_DATE
      `,
        [userId],
      );

      const totals = result.rows[0];
      const protein = parseFloat(totals.protein);
      const carbs = parseFloat(totals.carbs);
      const fat = parseFloat(totals.fat);
      const calories = parseFloat(totals.calories);

      // Calculate total grams
      const totalGrams = protein + carbs + fat;

      // If no meals logged today
      if (totalGrams === 0) {
        res.json({
          message: "No meals logged today.",
          protein: 0,
          carbs: 0,
          fat: 0,
          calories: 0,
          proteinPercent: 0,
          carbsPercent: 0,
          fatPercent: 0,
          portionScore: 0,
        });
        return;
      }

      // Calculate percentage distribution
      const proteinPercent = (protein / totalGrams) * 100;
      const carbsPercent = (carbs / totalGrams) * 100;
      const fatPercent = (fat / totalGrams) * 100;

      // Calculate Portion Score (0-100)
      // Ideal distribution: Protein 30%, Carbs 40%, Fat 30%
      const idealProtein = 30;
      const idealCarbs = 40;
      const idealFat = 30;

      // Calculate absolute deviations
      const proteinDev = Math.abs(proteinPercent - idealProtein);
      const carbsDev = Math.abs(carbsPercent - idealCarbs);
      const fatDev = Math.abs(fatPercent - idealFat);

      // Average deviation
      const avgDeviation = (proteinDev + carbsDev + fatDev) / 3;

      // Convert to score (lower deviation = higher score)
      // Maximum possible average deviation is ~67 (e.g., 100% of one macro)
      // We'll use 50 as a reasonable max deviation for scaling
      const portionScore = Math.max(
        0,
        Math.min(100, Math.round(100 - avgDeviation * 2)),
      );

      const response: PlateBalanceResponse = {
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        calories: Math.round(calories * 10) / 10,
        proteinPercent: Math.round(proteinPercent * 10) / 10,
        carbsPercent: Math.round(carbsPercent * 10) / 10,
        fatPercent: Math.round(fatPercent * 10) / 10,
        portionScore,
      };

      res.json(response);
    } catch (error) {
      console.error("Error getting today's plate balance:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get today's plate balance",
      });
    }
  }

  /**
   * Get all food entries for today
   * GET /api/food/entries/today
   */
  async getTodayEntries(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      console.log("=== GET TODAY'S ENTRIES ===");
      console.log("User ID:", userId);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      const result = await query(
        `
        SELECT 
          id, recipe_id, title, protein, carbs, fat, calories, created_at
        FROM food_entries
        WHERE user_id = $1
        AND DATE(created_at) = CURRENT_DATE
        ORDER BY created_at DESC
      `,
        [userId],
      );

      console.log("Database rows found:", result.rows.length);
      console.log(
        "Recipe IDs in today's entries:",
        result.rows.map((r) => r.recipe_id),
      );

      const entries = result.rows.map((row) => ({
        id: row.id,
        recipeId: row.recipe_id,
        title: row.title,
        nutrition: {
          protein: parseFloat(row.protein),
          carbs: parseFloat(row.carbs),
          fat: parseFloat(row.fat),
          calories: parseFloat(row.calories),
        },
        loggedAt: row.created_at,
      }));

      console.log("Returning entries:", entries.length);
      console.log(
        "Response recipeIds:",
        entries.map((e) => e.recipeId),
      );

      res.json({
        success: true,
        data: entries,
        count: entries.length,
      });
    } catch (error) {
      console.error("Error getting today's entries:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get today's entries",
      });
    }
  }

  /**
   * Get all food entries with optional filtering
   * GET /api/food/entries?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=50&offset=0
   */
  async getAllEntries(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { startDate, endDate, limit = "50", offset = "0" } = req.query;

      console.log("=== GET ALL ENTRIES ===");
      console.log("User ID:", userId);
      console.log("Query params:", { startDate, endDate, limit, offset });

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      // Build query dynamically based on filters
      let queryText = `
        SELECT 
          id, recipe_id, title, protein, carbs, fat, calories, created_at
        FROM food_entries
        WHERE user_id = $1
      `;

      const queryParams: any[] = [userId];
      let paramCount = 1;

      // Add date filters if provided
      if (startDate && typeof startDate === "string") {
        paramCount++;
        queryText += ` AND DATE(created_at) >= $${paramCount}`;
        queryParams.push(startDate);
      }

      if (endDate && typeof endDate === "string") {
        paramCount++;
        queryText += ` AND DATE(created_at) <= $${paramCount}`;
        queryParams.push(endDate);
      }

      queryText += ` ORDER BY created_at DESC`;

      // Add pagination
      paramCount++;
      queryText += ` LIMIT $${paramCount}`;
      queryParams.push(parseInt(limit as string, 10));

      paramCount++;
      queryText += ` OFFSET $${paramCount}`;
      queryParams.push(parseInt(offset as string, 10));

      console.log("Query:", queryText);
      console.log("Params:", queryParams);

      const result = await query(queryText, queryParams);

      console.log("Database rows found:", result.rows.length);

      const entries = result.rows.map((row) => ({
        id: row.id,
        recipeId: row.recipe_id,
        title: row.title,
        nutrition: {
          protein: parseFloat(row.protein),
          carbs: parseFloat(row.carbs),
          fat: parseFloat(row.fat),
          calories: parseFloat(row.calories),
        },
        loggedAt: row.created_at,
      }));

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM food_entries
        WHERE user_id = $1
      `;
      const countParams: any[] = [userId];
      let countParamNum = 1;

      if (startDate && typeof startDate === "string") {
        countParamNum++;
        countQuery += ` AND DATE(created_at) >= $${countParamNum}`;
        countParams.push(startDate);
      }

      if (endDate && typeof endDate === "string") {
        countParamNum++;
        countQuery += ` AND DATE(created_at) <= $${countParamNum}`;
        countParams.push(endDate);
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0]?.total || "0", 10);

      console.log("Total entries:", total);

      res.json({
        success: true,
        data: entries,
        count: entries.length,
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      });
    } catch (error) {
      console.error("Error getting all entries:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get entries",
      });
    }
  }

  /**
   * Delete a food entry
   * DELETE /api/food/entries/:id
   */
  async deleteEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const entryIdParam = req.params.id;

      console.log("=== DELETE ENTRY ===");
      console.log("User ID:", userId);
      console.log("Entry ID param:", entryIdParam);

      if (!entryIdParam || Array.isArray(entryIdParam)) {
        res.status(400).json({
          success: false,
          error: "Invalid entry ID",
        });
        return;
      }

      const entryId = parseInt(entryIdParam);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      if (isNaN(entryId)) {
        res.status(400).json({
          success: false,
          error: "Invalid entry ID",
        });
        return;
      }

      console.log("Attempting to delete entry:", entryId, "for user:", userId);

      // Delete only if owned by user
      const result = await query(
        `
        DELETE FROM food_entries
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `,
        [entryId, userId],
      );

      console.log("Delete result rows:", result.rows.length);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: "Entry not found or not owned by user",
        });
        return;
      }

      console.log("Entry deleted successfully:", result.rows[0].id);

      res.json({
        success: true,
        message: "Entry deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete entry",
      });
    }
  }
}

export default new FoodController();
