import { Request, Response, Router } from "express";
import diaryController from "../controllers/diaryController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/diary/today
 * Get today's macros for the authenticated user
 * Requires: Authorization: Bearer <token>
 */
router.get("/today", authMiddleware, async (req: Request, res: Response) => {
  await diaryController.getTodayMacros(req, res);
});

/**
 * POST /api/diary/today
 * Update today's macros (replaces existing values)
 * Requires: Authorization: Bearer <token>
 * Body: { protein: number, carbs: number, veg: number, fat: number }
 */
router.post("/today", authMiddleware, async (req: Request, res: Response) => {
  await diaryController.updateTodayMacros(req, res);
});

/**
 * POST /api/diary/add
 * Add to today's macros (increments existing values)
 * Requires: Authorization: Bearer <token>
 * Body: { protein?: number, carbs?: number, veg?: number, fat?: number }
 */
router.post("/add", authMiddleware, async (req: Request, res: Response) => {
  await diaryController.addToTodayMacros(req, res);
});

export default router;
