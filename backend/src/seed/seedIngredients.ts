import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../db/connection.js";

// Load a list of ingredients from JSON; if too small, generate realistic variants up to targetCount
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ingredientsFile = path.join(__dirname, "ingredients.json");
const TARGET_COUNT = 1000;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

// Map ingredient names to their categories
const ingredientCategories: Record<string, string> = {
  // Meat
  "chicken breast": "Meat",
  chicken: "Meat",
  beef: "Meat",
  pork: "Meat",
  fish: "Meat",
  shrimp: "Meat",
  lamb: "Meat",
  turkey: "Meat",
  duck: "Meat",
  salmon: "Meat",
  tuna: "Meat",
  bacon: "Meat",
  sausage: "Meat",
  "ground beef": "Meat",
  // Vegetables
  carrot: "Vegetables",
  potato: "Vegetables",
  "bell pepper": "Vegetables",
  broccoli: "Vegetables",
  spinach: "Vegetables",
  mushroom: "Vegetables",
  onion: "Vegetables",
  garlic: "Vegetables",
  tomato: "Vegetables",
  corn: "Vegetables",
  "sweet potato": "Vegetables",
  cabbage: "Vegetables",
  kale: "Vegetables",
  zucchini: "Vegetables",
  eggplant: "Vegetables",
  asparagus: "Vegetables",
  celery: "Vegetables",
  cucumber: "Vegetables",
  // Fruits
  apple: "Fruits",
  orange: "Fruits",
  banana: "Fruits",
  strawberry: "Fruits",
  blueberry: "Fruits",
  raspberry: "Fruits",
  grapes: "Fruits",
  pineapple: "Fruits",
  mango: "Fruits",
  lemon: "Fruits",
  lime: "Fruits",
  avocado: "Fruits",
  // Dairy
  milk: "Dairy",
  eggs: "Dairy",
  butter: "Dairy",
  "cheddar cheese": "Dairy",
  cheese: "Dairy",
  mozzarella: "Dairy",
  cream: "Dairy",
  yogurt: "Dairy",
  "sour cream": "Dairy",
  // Grains
  rice: "Grains",
  pasta: "Grains",
  flour: "Grains",
  oats: "Grains",
  quinoa: "Grains",
  bread: "Grains",
  // Spices & Seasonings
  "black pepper": "Spices",
  pepper: "Spices",
  salt: "Spices",
  cinnamon: "Spices",
  cumin: "Spices",
  paprika: "Spices",
  coriander: "Spices",
  turmeric: "Spices",
  basil: "Spices",
  parsley: "Spices",
  oregano: "Spices",
  thyme: "Spices",
  rosemary: "Spices",
  cilantro: "Spices",
  ginger: "Spices",
  // Oils & Condiments
  "olive oil": "Oils",
  oil: "Oils",
  "soy sauce": "Condiments",
  vinegar: "Condiments",
  mustard: "Condiments",
  ketchup: "Condiments",
  mayonnaise: "Condiments",
  // Sweeteners & Sauces
  honey: "Sweeteners",
  "brown sugar": "Sweeteners",
  sugar: "Sweeteners",
  "maple syrup": "Sweeteners",
  // Legumes & Nuts
  chickpeas: "Legumes",
  lentils: "Legumes",
  "black beans": "Legumes",
  beans: "Legumes",
  almonds: "Nuts",
  walnuts: "Nuts",
  peanuts: "Nuts",
  // Special
  "coconut milk": "Specialty",
  coconut: "Specialty",
  tofu: "Specialty",
  tempeh: "Specialty",
};

// Category keywords for partial matching
const categoryKeywords: Array<{ keywords: string[]; category: string }> = [
  {
    keywords: [
      "chicken",
      "beef",
      "pork",
      "lamb",
      "turkey",
      "duck",
      "fish",
      "salmon",
      "tuna",
      "shrimp",
      "bacon",
      "sausage",
      "meat",
    ],
    category: "Meat",
  },
  {
    keywords: [
      "carrot",
      "potato",
      "pepper",
      "broccoli",
      "spinach",
      "mushroom",
      "onion",
      "garlic",
      "tomato",
      "corn",
      "cabbage",
      "kale",
      "zucchini",
      "eggplant",
      "asparagus",
      "celery",
      "cucumber",
    ],
    category: "Vegetables",
  },
  {
    keywords: [
      "apple",
      "orange",
      "banana",
      "strawberry",
      "blueberry",
      "raspberry",
      "grape",
      "pineapple",
      "mango",
      "lemon",
      "lime",
      "avocado",
      "berry",
    ],
    category: "Fruits",
  },
  {
    keywords: ["milk", "egg", "butter", "cheese", "cream", "yogurt", "dairy"],
    category: "Dairy",
  },
  {
    keywords: ["rice", "pasta", "flour", "oat", "quinoa", "bread", "grain"],
    category: "Grains",
  },
  {
    keywords: [
      "pepper",
      "salt",
      "cinnamon",
      "cumin",
      "paprika",
      "coriander",
      "turmeric",
      "basil",
      "parsley",
      "oregano",
      "thyme",
      "rosemary",
      "cilantro",
      "ginger",
      "spice",
    ],
    category: "Spices",
  },
  { keywords: ["oil"], category: "Oils" },
  {
    keywords: ["sauce", "vinegar", "mustard", "ketchup", "mayo"],
    category: "Condiments",
  },
  { keywords: ["honey", "sugar", "syrup", "sweet"], category: "Sweeteners" },
  { keywords: ["bean", "lentil", "chickpea"], category: "Legumes" },
  { keywords: ["almond", "walnut", "peanut", "nut"], category: "Nuts" },
  { keywords: ["coconut", "tofu", "tempeh"], category: "Specialty" },
];

function getCategory(name: string): string {
  const lower = name.toLowerCase();

  // First try exact match
  if (ingredientCategories[lower]) {
    return ingredientCategories[lower];
  }

  // Then try partial keyword matching
  for (const { keywords, category } of categoryKeywords) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }

  return "Other";
}

function generateVariants(baseNames: string[], target: number) {
  const modifiers = [
    "",
    "fresh",
    "dried",
    "powdered",
    "ground",
    "smoked",
    "roasted",
    "organic",
    "baby",
    "minced",
    "chopped",
    "canned",
    "frozen",
    "pickled",
    "sliced",
  ];

  const results: Array<{
    id: string;
    name: string;
    category?: string | undefined;
    is_common?: boolean | undefined;
    is_pantry?: boolean | undefined;
    is_main?: boolean | undefined;
  }> = [];

  let idx = 0;
  for (let i = 0; i < baseNames.length && results.length < target; i++) {
    const name = baseNames[i] ?? "";
    if (!name) continue;
    const baseCategory = getCategory(name);
    const baseId = slugify(String(name));
    // first add base
    results.push({
      id: baseId,
      name: String(name),
      category: baseCategory,
      is_common: true,
      is_pantry: PANTRY_INGREDIENT_IDS.includes(baseId),
      is_main: MAIN_INGREDIENT_IDS.includes(baseId),
    });
    // add variants
    for (let m = 0; m < modifiers.length && results.length < target; m++) {
      const mod = modifiers[m];
      if (!mod) continue; // skip empty variant (already added)
      const variantName = `${mod.charAt(0).toUpperCase() + mod.slice(1)} ${name}`;
      results.push({
        id: slugify(`${name}_${mod}_${idx++}`),
        name: variantName,
        category: baseCategory,
        is_common: false,
        is_pantry: false,
        is_main: false,
      });
    }
  }

  // If still short, append numbered variants
  while (results.length < target) {
    const i = results.length % baseNames.length;
    const suffix = Math.floor(results.length / baseNames.length);
    const baseName = baseNames[i] ?? "";
    if (!baseName) break;
    const name = `${baseName} ${suffix + 1}`;
    const category = getCategory(baseName);
    results.push({
      id: slugify(name),
      name: String(name),
      category,
      is_common: false,
      is_pantry: false,
      is_main: false,
    });
  }

  return results.slice(0, target);
}

const PANTRY_INGREDIENT_IDS = [
  "salt",
  "black_pepper",
  "olive_oil",
  "butter",
  "garlic",
  "onion",
];

const MAIN_INGREDIENT_IDS = [
  "chicken",
  "chicken_breast",
  "beef",
  "pork",
  "lamb",
  "turkey",
  "fish",
  "salmon",
  "shrimp",
];

async function seedIngredients() {
  let ingredients: Array<{
    id: string;
    name: string;
    category?: string | undefined;
    is_common?: boolean | undefined;
    is_pantry?: boolean | undefined;
  }> = [];

  try {
    const data = fs.readFileSync(ingredientsFile, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed))
      ingredients = parsed.map((p: any) => ({
        id: p.id || slugify(String(p.name)),
        name: String(p.name),
        category: p.category,
        is_common: p.is_common,
        is_pantry: p.is_pantry,
      }));
  } catch (err) {
    console.error("Could not read ingredients.json:", String(err));
    process.exit(1);
  }

  if (!ingredients || ingredients.length === 0) {
    console.error("No ingredients found in ingredients.json");
    process.exit(1);
  }

  // Clear existing ingredients first
  await query(`DELETE FROM ingredients`);
  console.log("✅ Cleared existing ingredients");

  let inserted = 0;
  for (const ingredient of ingredients) {
    try {
      await query(
        `INSERT INTO ingredients (ingredient_id, name, category, is_common, is_pantry) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (ingredient_id) DO NOTHING`,
        [
          ingredient.id || slugify(ingredient.name),
          ingredient.name,
          ingredient.category || null,
          !!ingredient.is_common,
          !!ingredient.is_pantry,
        ],
      );
      inserted++;
    } catch (err) {
      console.error("Failed to insert ingredient:", ingredient, err);
    }
  }
  console.log(`✅ Seeded ${inserted} ingredients.`);
}

seedIngredients().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
