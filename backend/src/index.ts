import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cors from "cors";
import type { Express, Request, Response } from "express";
import express from "express";
import { ensureConnection } from "./db/connection.js";
import { initializeDatabase } from "./db/schema.js";
import apiUsageRouter from "./routes/apiUsage.js";
import authRouter from "./routes/auth.js";
import favoritesRouter from "./routes/favorites.js";
import foodRouter from "./routes/food.js";
import ingredientsRouter from "./routes/ingredients.js";
import motivationRouter from "./routes/motivation.js";
import profileRouter from "./routes/profile.js";
import recipeLogRouter from "./routes/recipeLog.js";
import recipesRouter from "./routes/recipes.js";

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// CORS configuration - Allow all origins for now
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRouter);
app.use("/recipes", recipesRouter); // /recipes uses /getRecipes as default POST
app.use("/getRecipes", recipesRouter); // Keep old path for backward compatibility
app.use("/saveFavorite", favoritesRouter);
app.use("/profile", profileRouter);
app.use("/recipe-log", recipeLogRouter);
app.use("/motivation", motivationRouter);
app.use("/api/food", foodRouter);
app.use("/api/ingredients", ingredientsRouter); // Ingredients API endpoint
app.use("/api/usage", apiUsageRouter); // API usage tracking endpoint

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "Server is running" });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server only after DB is reachable and migrations have run
const start = async () => {
  try {
    await ensureConnection(6, 2000);
  } catch (err) {
    console.error("❌ Could not connect to Postgres after retries:", err);
    process.exit(1);
  }

  try {
    await initializeDatabase();
  } catch (error) {
    console.error("⚠️ Warning: Database schema initialization failed:", error);
    console.error(
      "You can run 'npm run migrate' to manually initialize the database",
    );
    // If schema initialization fails, exit so the platform shows a failed start
    process.exit(1);
  }

  // One-time migration: re-seed ingredients with correct categories
  // DISABLED: We now use Spoonacular ingredients instead
  // To re-seed with Spoonacular ingredients, run: npx tsx src/seed/seedSpoonacularIngredients.ts
  /*
  try {
    const { reseedIngredientsWithCategories } =
      await import("./migrations/reseed-ingredients.js");
    await reseedIngredientsWithCategories();
  } catch (error) {
    console.error("⚠️ Warning: Ingredient re-seed migration failed:", error);
    // Don't exit - this is a non-critical migration
  }
  */

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} and bound to 0.0.0.0`);
  });

  server.on("error", (error: any) => {
    console.error("❌ Server error:", error);
    process.exit(1);
  });
};

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

start().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
