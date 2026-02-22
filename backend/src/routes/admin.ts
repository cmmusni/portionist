import { Router } from "express";
import { seedSpoonacularIngredients } from "../seed/seedSpoonacularIngredients.js";

const router = Router();

// Admin endpoint to seed ingredients
// WARNING: In production, this should be protected with authentication
router.post("/seed-ingredients", async (req, res) => {
  try {
    console.log("🔧 Admin: Starting ingredient seeding...");
    await seedSpoonacularIngredients();
    res.json({
      success: true,
      message: "Successfully seeded Spoonacular ingredients",
    });
  } catch (error) {
    console.error("❌ Admin: Seeding failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
