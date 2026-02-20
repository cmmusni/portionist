import { Request, Response } from "express";
import { query } from "../db/connection.js";

interface DiaryMacros {
  protein: number;
  carbs: number;
  veg: number;
  fat: number;
}

export class DiaryController {
  /**
   * Get today's macros for the authenticated user
   * GET /api/diary/today
   */
  async getTodayMacros(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId; // Set by auth middleware

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      // Get today's date in YYYY-MM-DD format
      const today: string = new Date().toISOString().split("T")[0]!;

      // Query diary entry for today
      const result = await query(
        `
        SELECT protein, carbs, veg, fat
        FROM diary_entries
        WHERE user_id = $1 AND entry_date = $2
        LIMIT 1
      `,
        [userId as string, today],
      );

      if (result.rows.length === 0) {
        // No entry for today, return zeros
        res.json({
          protein: 0,
          carbs: 0,
          veg: 0,
          fat: 0,
        });
        return;
      }

      const macros: DiaryMacros = {
        protein: parseFloat(result.rows[0].protein) || 0,
        carbs: parseFloat(result.rows[0].carbs) || 0,
        veg: parseFloat(result.rows[0].veg) || 0,
        fat: parseFloat(result.rows[0].fat) || 0,
      };

      res.json(macros);
    } catch (error) {
      console.error("Error fetching today's macros:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch today's macros",
      });
    }
  }

  /**
   * Update or create today's diary entry
   * POST /api/diary/today
   */
  async updateTodayMacros(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      const { protein, carbs, veg, fat } = req.body;

      // Validate input
      if (
        typeof protein !== "number" ||
        typeof carbs !== "number" ||
        typeof veg !== "number" ||
        typeof fat !== "number"
      ) {
        res.status(400).json({
          success: false,
          error: "All macro values must be numbers",
        });
        return;
      }

      const today: string = new Date().toISOString().split("T")[0]!;

      // Upsert: Insert or update if exists
      const result = await query(
        `
        INSERT INTO diary_entries (user_id, entry_date, protein, carbs, veg, fat, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, entry_date)
        DO UPDATE SET
          protein = EXCLUDED.protein,
          carbs = EXCLUDED.carbs,
          veg = EXCLUDED.veg,
          fat = EXCLUDED.fat,
          updated_at = CURRENT_TIMESTAMP
        RETURNING protein, carbs, veg, fat
      `,
        [userId as string, today, protein, carbs, veg, fat],
      );

      const macros: DiaryMacros = {
        protein: parseFloat(result.rows[0].protein),
        carbs: parseFloat(result.rows[0].carbs),
        veg: parseFloat(result.rows[0].veg),
        fat: parseFloat(result.rows[0].fat),
      };

      res.json({
        success: true,
        data: macros,
      });
    } catch (error) {
      console.error("Error updating today's macros:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update today's macros",
      });
    }
  }

  /**
   * Add macros to today's entry (increment)
   * POST /api/diary/add
   */
  async addToTodayMacros(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized - User ID not found",
        });
        return;
      }

      const { protein = 0, carbs = 0, veg = 0, fat = 0 } = req.body;

      const today: string = new Date().toISOString().split("T")[0]!;

      // Upsert with increment
      const result = await query(
        `
        INSERT INTO diary_entries (user_id, entry_date, protein, carbs, veg, fat, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, entry_date)
        DO UPDATE SET
          protein = diary_entries.protein + EXCLUDED.protein,
          carbs = diary_entries.carbs + EXCLUDED.carbs,
          veg = diary_entries.veg + EXCLUDED.veg,
          fat = diary_entries.fat + EXCLUDED.fat,
          updated_at = CURRENT_TIMESTAMP
        RETURNING protein, carbs, veg, fat
      `,
        [userId as string, today, protein, carbs, veg, fat],
      );

      const macros: DiaryMacros = {
        protein: parseFloat(result.rows[0].protein),
        carbs: parseFloat(result.rows[0].carbs),
        veg: parseFloat(result.rows[0].veg),
        fat: parseFloat(result.rows[0].fat),
      };

      res.json({
        success: true,
        data: macros,
      });
    } catch (error) {
      console.error("Error adding to today's macros:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add to today's macros",
      });
    }
  }
}

export default new DiaryController();
