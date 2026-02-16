import type { Request, Response } from "express";
import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

// POST /auth/signup - Create a new user account
router.post("/signup", async (req: Request, res: Response) => {
  await authController.signUp(req, res);
});

// POST /auth/signin - Sign in to existing account
router.post("/signin", async (req: Request, res: Response) => {
  await authController.signIn(req, res);
});

// POST /auth/facebook - Sign in/up via Facebook
router.post("/facebook", async (req: Request, res: Response) => {
  await authController.facebookAuth(req, res);
});

// POST /auth/signout - Sign out a user
router.post("/signout", async (req: Request, res: Response) => {
  await authController.signOut(req, res);
});

export default router;
