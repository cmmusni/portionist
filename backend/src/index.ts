import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cors from "cors";
import type { Express, Request, Response } from "express";
import express from "express";
import { initializeDatabase } from "./db/schema.js";
import authRouter from "./routes/auth.js";
import favoritesRouter from "./routes/favorites.js";
import profileRouter from "./routes/profile.js";
import recipesRouter from "./routes/recipes.js";

const app: Express = express();
const PORT: number = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRouter);
app.use("/recipes", recipesRouter); // /recipes uses /getRecipes as default POST
app.use("/getRecipes", recipesRouter); // Keep old path for backward compatibility
app.use("/saveFavorite", favoritesRouter);
app.use("/profile", profileRouter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "Server is running" });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server (bind to all interfaces so physical devices on the LAN can reach it)
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT} and bound to 0.0.0.0`);

  // Initialize database
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
});
