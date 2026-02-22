import express from "express";
import {
    getCategories,
    getIngredientById,
    getIngredients,
} from "../controllers/ingredientController.js";

const router = express.Router();

// GET /api/ingredients - Get all ingredients with optional filtering
router.get("/", getIngredients);

// GET /api/ingredients/categories - Get all ingredient categories
router.get("/categories", getCategories);

// GET /api/ingredients/:id - Get a specific ingredient
router.get("/:id", getIngredientById);

export default router;
