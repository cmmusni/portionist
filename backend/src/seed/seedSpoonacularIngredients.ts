import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SpoonacularIngredient {
  id: number;
  name: string;
  possibleUnits: string[];
  category?: string;
}

// Common pantry items that should be marked as isPantry: true
const PANTRY_ITEMS = [
  "water",
  "ice",
  "flour",
  "sugar",
  "cane sugar",
  "olive oil",
  "cooking fat",
  "cooking oil",
  "vegetable oil",
  "black pepper",
  "sea salt",
  "salt",
  "butter",
  "garlic",
  "onion",
  "baking powder",
  "baking soda",
  "vanilla extract",
  "cinnamon",
  "paprika",
  "cumin",
  "oregano",
  "basil",
  "thyme",
  "rosemary",
];

// Function to categorize ingredients based on their names/characteristics
function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase();

  // Proteins
  if (
    lowerName.includes("chicken") ||
    lowerName.includes("beef") ||
    lowerName.includes("pork") ||
    lowerName.includes("turkey") ||
    lowerName.includes("lamb") ||
    lowerName.includes("fish") ||
    lowerName.includes("salmon") ||
    lowerName.includes("tuna") ||
    lowerName.includes("shrimp") ||
    lowerName.includes("meat") ||
    lowerName.includes("bacon") ||
    lowerName.includes("sausage")
  ) {
    return "Protein";
  }

  // Vegetables
  if (
    lowerName.includes("lettuce") ||
    lowerName.includes("tomato") ||
    lowerName.includes("onion") ||
    lowerName.includes("pepper") ||
    lowerName.includes("carrot") ||
    lowerName.includes("broccoli") ||
    lowerName.includes("spinach") ||
    lowerName.includes("kale") ||
    lowerName.includes("cabbage") ||
    lowerName.includes("celery") ||
    lowerName.includes("mushroom") ||
    lowerName.includes("cucumber") ||
    lowerName.includes("zucchini") ||
    lowerName.includes("squash") ||
    lowerName.includes("eggplant") ||
    lowerName.includes("asparagus")
  ) {
    return "Vegetable";
  }

  // Fruits
  if (
    lowerName.includes("apple") ||
    lowerName.includes("banana") ||
    lowerName.includes("orange") ||
    lowerName.includes("lemon") ||
    lowerName.includes("lime") ||
    lowerName.includes("berry") ||
    lowerName.includes("grape") ||
    lowerName.includes("melon") ||
    lowerName.includes("peach") ||
    lowerName.includes("pear") ||
    lowerName.includes("mango") ||
    lowerName.includes("pineapple") ||
    lowerName.includes("cherry") ||
    lowerName.includes("plum")
  ) {
    return "Fruit";
  }

  // Dairy
  if (
    lowerName.includes("milk") ||
    lowerName.includes("cheese") ||
    lowerName.includes("yogurt") ||
    lowerName.includes("cream") ||
    lowerName.includes("butter") ||
    lowerName.includes("sour cream")
  ) {
    return "Dairy";
  }

  // Grains & Pasta
  if (
    lowerName.includes("rice") ||
    lowerName.includes("pasta") ||
    lowerName.includes("noodle") ||
    lowerName.includes("bread") ||
    lowerName.includes("flour") ||
    lowerName.includes("oat") ||
    lowerName.includes("quinoa") ||
    lowerName.includes("barley") ||
    lowerName.includes("couscous")
  ) {
    return "Grain";
  }

  // Spices & Seasonings
  if (
    lowerName.includes("salt") ||
    lowerName.includes("pepper") ||
    lowerName.includes("spice") ||
    lowerName.includes("garlic powder") ||
    lowerName.includes("onion powder") ||
    lowerName.includes("paprika") ||
    lowerName.includes("cumin") ||
    lowerName.includes("oregano") ||
    lowerName.includes("basil") ||
    lowerName.includes("thyme") ||
    lowerName.includes("rosemary") ||
    lowerName.includes("cinnamon") ||
    lowerName.includes("ginger") ||
    lowerName.includes("turmeric")
  ) {
    return "Spice";
  }

  // Oils & Condiments
  if (
    lowerName.includes("oil") ||
    lowerName.includes("vinegar") ||
    lowerName.includes("sauce") ||
    lowerName.includes("dressing") ||
    lowerName.includes("mayo") ||
    lowerName.includes("ketchup") ||
    lowerName.includes("mustard")
  ) {
    return "Condiment";
  }

  return "Other";
}

async function seedSpoonacularIngredients(): Promise<void> {
  try {
    console.log("🌱 Starting Spoonacular ingredients seed...");

    // Download the CSV file if not already downloaded
    const csvPath = "/tmp/spoonacular-ingredients.csv";

    if (!fs.existsSync(csvPath)) {
      console.log(
        "📥 Downloading Spoonacular ingredients CSV (this may be already cached)...",
      );
    }

    // Read and parse the CSV file
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter((line) => line.trim());

    console.log(`📊 Found ${lines.length} ingredients in CSV file`);

    const ingredients: SpoonacularIngredient[] = [];

    for (const line of lines) {
      const parts = line.split(";");
      if (parts.length >= 2) {
        const name = parts[0]?.trim();
        const id = parseInt(parts[1]?.trim() || "0");
        const possibleUnits = parts[2]
          ? parts[2].split(",").map((u) => u.trim())
          : [];

        if (name && id) {
          const category = categorizeIngredient(name);
          ingredients.push({
            id,
            name,
            possibleUnits,
            category,
          });
        }
      }
    }

    console.log(`✅ Parsed ${ingredients.length} valid ingredients`);

    // Clear existing ingredients
    console.log("🗑️  Clearing existing ingredients...");
    await query("DELETE FROM recipe_ingredients");
    await query("DELETE FROM ingredients");
    console.log("✅ Cleared existing ingredients");

    // Insert new ingredients in batches
    console.log("💾 Inserting Spoonacular ingredients...");

    const batchSize = 100;
    for (let i = 0; i < ingredients.length; i += batchSize) {
      const batch = ingredients.slice(i, i + batchSize);

      const values: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      for (const ingredient of batch) {
        const isPantry = PANTRY_ITEMS.includes(ingredient.name.toLowerCase());
        const isCommon =
          ingredient.category === "Protein" ||
          ingredient.category === "Vegetable" ||
          ingredient.category === "Fruit" ||
          isPantry;

        values.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`,
        );

        params.push(
          `spoon-${ingredient.id}`,
          ingredient.name,
          ingredient.category,
          isCommon,
          isPantry,
        );

        paramIndex += 5;
      }

      const insertQuery = `
        INSERT INTO ingredients (ingredient_id, name, category, is_common, is_pantry)
        VALUES ${values.join(", ")}
        ON CONFLICT (ingredient_id) DO NOTHING
      `;

      await query(insertQuery, params);

      console.log(
        `  ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ingredients.length / batchSize)} (${batch.length} ingredients)`,
      );
    }

    // Get final count
    const countResult = await query(
      "SELECT COUNT(*) as count FROM ingredients",
    );
    const totalCount = countResult.rows[0]?.count || 0;

    console.log(`\n✅ Successfully seeded ${totalCount} ingredients!`);
    console.log("🎉 Spoonacular ingredients seed complete!");

    // Show some statistics
    const categoryStats = await query(`
      SELECT category, COUNT(*) as count 
      FROM ingredients 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log("\n📊 Ingredient breakdown by category:");
    for (const row of categoryStats.rows) {
      console.log(`  - ${row.category}: ${row.count}`);
    }

    const pantryCount = await query(
      "SELECT COUNT(*) as count FROM ingredients WHERE is_pantry = true",
    );
    const commonCount = await query(
      "SELECT COUNT(*) as count FROM ingredients WHERE is_common = true",
    );

    console.log(`\n🥫 Pantry items: ${pantryCount.rows[0]?.count || 0}`);
    console.log(`⭐ Common ingredients: ${commonCount.rows[0]?.count || 0}`);
  } catch (error) {
    console.error("❌ Error seeding Spoonacular ingredients:", error);
    throw error;
  }
}

// Export the function for use in other modules
export { seedSpoonacularIngredients };

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSpoonacularIngredients()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

