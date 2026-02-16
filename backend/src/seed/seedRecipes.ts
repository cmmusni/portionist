import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let recipesFile = path.join(__dirname, "recipes.json");
if (!fs.existsSync(recipesFile)) {
  // When running compiled JS from dist, fallback to original src location
  const alt = path.join(__dirname, "..", "..", "src", "seed", "recipes.json");
  if (fs.existsSync(alt)) recipesFile = alt;
}

async function seedRecipes() {
  let recipes: any[] = [];
  // Ensure recipes tables exist (run schema fragments in case schema initializer hasn't run)
  try {
    // Drop old recipe_ingredients table if it exists (without unique constraint)
    await query(`DROP TABLE IF EXISTS recipe_ingredients CASCADE`);

    await query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        recipe_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        cuisine VARCHAR(100),
        meal_type VARCHAR(100),
        main_ingredient_id VARCHAR(255),
        portion_size FLOAT,
        portion_unit VARCHAR(50),
        prep_time INT,
        cook_time INT,
        total_time INT,
        servings INT,
        instructions JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id SERIAL PRIMARY KEY,
        recipe_id VARCHAR(255) NOT NULL,
        ingredient_id VARCHAR(255) NOT NULL,
        quantity FLOAT,
        unit VARCHAR(50),
        UNIQUE(recipe_id, ingredient_id)
      )
    `);
  } catch (err) {
    console.error("Failed to ensure recipe tables exist:", String(err));
    process.exit(1);
  }
  try {
    const data = fs.readFileSync(recipesFile, "utf-8");
    recipes = JSON.parse(data);
  } catch (err) {
    console.error("Failed to read recipes.json:", String(err));
    process.exit(1);
  }

  let insertedRecipes = 0;
  let insertedIngredients = 0;

  // First, collect all unique ingredients from recipes and seed them
  const uniqueIngredients = new Set<string>();
  for (const r of recipes) {
    if (r.main_ingredient_id) {
      uniqueIngredients.add(
        JSON.stringify({
          id: r.main_ingredient_id,
          name: getIngredientNameById(r.main_ingredient_id),
        }),
      );
    }
    if (Array.isArray(r.ingredients)) {
      for (const ing of r.ingredients) {
        uniqueIngredients.add(
          JSON.stringify({ id: ing.ingredient_id, name: ing.name }),
        );
      }
    }
  }

  // Seed unique ingredients
  for (const ingJson of uniqueIngredients) {
    const ing = JSON.parse(ingJson);
    try {
      await query(
        `INSERT INTO ingredients (ingredient_id, name) VALUES ($1,$2) ON CONFLICT (ingredient_id) DO NOTHING`,
        [ing.id, ing.name],
      );
    } catch (err) {
      console.error("Failed to insert ingredient:", ing, err);
    }
  }

  for (const r of recipes) {
    try {
      await query(
        `INSERT INTO recipes (recipe_id, name, cuisine, meal_type, main_ingredient_id, portion_size, portion_unit, prep_time, cook_time, total_time, servings, instructions) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (recipe_id) DO NOTHING`,
        [
          r.recipe_id,
          r.name,
          r.cuisine,
          r.meal_type,
          r.main_ingredient_id || null,
          r.portion_size,
          r.portion_unit,
          r.prep_time,
          r.cook_time,
          r.total_time,
          r.servings,
          JSON.stringify(r.instructions),
        ],
      );
      insertedRecipes++;
    } catch (err) {
      console.error("Failed to insert recipe:", r.recipe_id, err);
    }

    if (Array.isArray(r.ingredients)) {
      for (const ing of r.ingredients) {
        try {
          await query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES ($1,$2,$3,$4) ON CONFLICT (recipe_id, ingredient_id) DO NOTHING`,
            [
              r.recipe_id,
              ing.ingredient_id,
              ing.quantity || null,
              ing.unit || null,
            ],
          );
          insertedIngredients++;
        } catch (err) {
          console.error(
            "Failed to insert recipe ingredient:",
            r.recipe_id,
            ing,
            err,
          );
        }
      }
    }
  }

  console.log(
    `Inserted ${insertedRecipes} recipes and ${insertedIngredients} recipe-ingredient rows.`,
  );
}

function getIngredientNameById(id: string): string {
  const ingredientNames: Record<string, string> = {
    chicken_breast: "Chicken Breast",
    rice: "Rice",
    garlic: "Garlic",
    onion: "Onion",
    broccoli: "Broccoli",
    bell_pepper: "Bell Pepper",
    soy_sauce: "Soy Sauce",
    ground_beef: "Ground Beef",
    pasta: "Pasta",
    tomato: "Tomato",
    carrot: "Carrot",
    flour: "Flour",
    milk: "Milk",
    egg: "Egg",
    butter: "Butter",
  };
  return ingredientNames[id] || id;
}

seedRecipes().catch((err) => {
  console.error("Seeding recipes failed:", err);
  process.exit(1);
});
