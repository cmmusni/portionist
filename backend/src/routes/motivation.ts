import express from "express";
import { motivationController } from "../controllers/motivationController.js";

const router = express.Router();

// GET /motivation/daily - Get or generate daily motivation
router.get("/daily", async (req, res) =>
  motivationController.getDailyMotivation(req, res),
);

// GET /motivation/all - Get all motivations (admin/debug)
router.get("/all", async (req, res) =>
  motivationController.getAllMotivations(req, res),
);

export default router;
