import dotenv from "dotenv";
dotenv.config();

import { query } from "./db/connection.js";

/**
 * Manual migration script to initialize database schema
 * Run this if schema initialization fails on startup
 */
const migrate = async () => {
  try {
    console.log("🔄 Starting database migration...");

    // Create users table
    console.log("Creating users table...");
    try {
      const result = await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,
          password VARCHAR(255),
          facebook_id VARCHAR(255) UNIQUE,
          full_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Users table created");
    } catch (err) {
      console.error(
        "❌ Failed to create users table:",
        (err as any)?.message || err,
      );
      throw err;
    }

    // Create favorites table
    console.log("Creating favorites table...");
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          recipe_id VARCHAR(255) NOT NULL,
          recipe_name VARCHAR(255) NOT NULL,
          recipe_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, recipe_id),
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
      `);
      console.log("✅ Favorites table created");
    } catch (err) {
      console.error(
        "❌ Failed to create favorites table:",
        (err as any)?.message || err,
      );
      throw err;
    }

    // Create onboarding_data table
    console.log("Creating onboarding_data table...");
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS onboarding_data (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) UNIQUE NOT NULL,
          user_age INT,
          target_weight FLOAT,
          current_weight FLOAT,
          cuisine VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
      `);
      console.log("✅ Onboarding data table created");
    } catch (err) {
      console.error(
        "❌ Failed to create onboarding_data table:",
        (err as any)?.message || err,
      );
      throw err;
    }

    // Create ingredients table
    console.log("Creating ingredients table...");
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ingredients (
          id SERIAL PRIMARY KEY,
          ingredient_id VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          is_common BOOLEAN DEFAULT false,
          is_pantry BOOLEAN DEFAULT false,
          is_main BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Ingredients table created");
    } catch (err) {
      console.error(
        "❌ Failed to create ingredients table:",
        (err as any)?.message || err,
      );
      throw err;
    }

    // Create recipes table
    console.log("Creating recipes table...");
    try {
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (main_ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE SET NULL
        )
      `);
      console.log("✅ Recipes table created");
    } catch (err) {
      console.error(
        "❌ Failed to create recipes table:",
        (err as any)?.message || err,
      );
      throw err;
    }

    // Create recipe_ingredients join table
    console.log("Creating recipe_ingredients table...");
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS recipe_ingredients (
          id SERIAL PRIMARY KEY,
          recipe_id VARCHAR(255) NOT NULL,
          ingredient_id VARCHAR(255) NOT NULL,
          quantity FLOAT,
          unit VARCHAR(50),
          FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE SET NULL
        )
      `);
      console.log("✅ Recipe ingredients table created");
    } catch (err) {
      console.error(
        "❌ Failed to create recipe_ingredients table:",
        (err as any)?.message || err,
      );
      throw err;
    }

    // Verify that all tables were created
    console.log("\n🔍 Verifying table creation...");
    try {
      const tableCheckResult = await query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema='public' 
        AND table_name IN ('users', 'favorites', 'onboarding_data', 'ingredients', 'recipes', 'recipe_ingredients')
        ORDER BY table_name
      `);
      const createdTables = tableCheckResult.rows.map(
        (row: any) => row.table_name,
      );
      const expectedTables = [
        "favorites",
        "ingredients",
        "onboarding_data",
        "recipe_ingredients",
        "recipes",
        "users",
      ];
      const missingTables = expectedTables.filter(
        (t) => !createdTables.includes(t),
      );

      if (missingTables.length > 0) {
        console.error("❌ Missing tables:", missingTables);
        throw new Error(
          `Migration verification failed: Missing tables ${missingTables.join(", ")}`,
        );
      }
      console.log("✅ All tables verified:", createdTables);
    } catch (verifyErr) {
      console.error(
        "❌ Table verification failed:",
        (verifyErr as any)?.message || verifyErr,
      );
      throw verifyErr;
    }

    console.log("\n✅ Database migration completed successfully!\n");

    // Attempt to write a verification marker into a migrations table so
    // deployment logs or DB queries can confirm the migration ran.
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name TEXT,
          ran_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          note TEXT
        )
      `);

      const name = process.env.MIGRATION_NAME || "auto-migrate";
      const note = process.env.MIGRATION_NOTE || "deployed via CI";
      const res = await query(
        `INSERT INTO migrations (name, note) VALUES ($1, $2) RETURNING id`,
        [name, note],
      );
      const insertedId = res.rows && res.rows[0] ? res.rows[0].id : "<unknown>";
      console.log(`MIGRATION_MARKER_INSERTED: id=${insertedId} name=${name}`);
    } catch (mErr) {
      console.error("MIGRATION_MARKER_FAILED:", (mErr as any)?.message || mErr);
      process.exit(1);
    }

    // Emit a distinct log line so platform logs can be matched easily
    console.log(
      "MIGRATION_COMPLETED: Portionist migration finished successfully",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrate();
