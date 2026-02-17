import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cors from "cors";
import type { Express, Request, Response } from "express";
import express from "express";
import { ensureConnection } from "./db/connection.js";
import { initializeDatabase } from "./db/schema.js";
import authRouter from "./routes/auth.js";
import favoritesRouter from "./routes/favorites.js";
import profileRouter from "./routes/profile.js";
import recipesRouter from "./routes/recipes.js";

const app: Express = express();
const PORT: number = 3000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19000',
  'http://localhost:19001',
  'https://portionist.netlify.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all for now, change to false in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} and bound to 0.0.0.0`);
  });
};

start();
