import { Request, Response, Router } from "express";
import foodController from "../controllers/foodController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/food/log
 * Log a food entry from Spoonacular recipe
 * Requires: Authorization: Bearer <token>
 * Body: { recipeId: number }
 */
router.post("/log", authMiddleware, async (req: Request, res: Response) => {
  await foodController.logFoodFromSearch(req, res);
});

/**
 * POST /api/food/log-custom
 * Log a custom/AI-generated food entry with provided nutrition data
 * Requires: Authorization: Bearer <token>
 * Body: { title: string, protein: number, carbs: number, fat: number, calories: number, recipeIdentifier?: string }
 */
router.post(
  "/log-custom",
  authMiddleware,
  async (req: Request, res: Response) => {
    await foodController.logCustomFood(req, res);
  },
);

/**
 * GET /api/food/today
 * Get today's plate balance with nutrition totals and portion score
 * Requires: Authorization: Bearer <token>
 */
router.get("/today", authMiddleware, async (req: Request, res: Response) => {
  await foodController.getTodayPlateBalance(req, res);
});

/**
 * GET /api/food/entries/today
 * Get all food entries logged today
 * Requires: Authorization: Bearer <token>
 */
router.get(
  "/entries/today",
  authMiddleware,
  async (req: Request, res: Response) => {
    await foodController.getTodayEntries(req, res);
  },
);

/**
 * GET /api/food/entries
 * Get all food entries with optional filtering
 * Query params: startDate, endDate, limit, offset
 * Requires: Authorization: Bearer <token>
 */
router.get("/entries", authMiddleware, async (req: Request, res: Response) => {
  await foodController.getAllEntries(req, res);
});

/**
 * DELETE /api/food/entries/:id
 * Delete a specific food entry
 * Requires: Authorization: Bearer <token>
 */
router.delete(
  "/entries/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    await foodController.deleteEntry(req, res);
  },
);

export default router;
