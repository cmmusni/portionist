import type { Request, Response } from "express";
import { Router } from "express";
import profileController from "../controllers/profileController.js";

const router = Router();

// GET /profile/:userId - Get user profile details
router.get("/:userId", async (req: Request, res: Response) => {
  await profileController.getProfile(req, res);
});

// PUT /profile/:userId - Update user profile
router.put("/:userId", async (req: Request, res: Response) => {
  await profileController.updateProfile(req, res);
});

// POST /profile/:userId/onboarding - Save onboarding data
router.post("/:userId/onboarding", async (req: Request, res: Response) => {
  await profileController.saveOnboardingData(req, res);
});

// GET /profile/:userId/onboarding - Get onboarding data
router.get("/:userId/onboarding", async (req: Request, res: Response) => {
  await profileController.getOnboardingData(req, res);
});

export default router;
