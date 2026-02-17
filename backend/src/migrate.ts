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
    await query(`
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

    // Create favorites table
    console.log("Creating favorites table...");
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

    // Create onboarding_data table
    console.log("Creating onboarding_data table...");
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

    // Create ingredients table
    console.log("Creating ingredients table...");
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

    // Create recipes table
    console.log("Creating recipes table...");
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

    // Create recipe_ingredients join table
    console.log("Creating recipe_ingredients table...");
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

    console.log("\n✅ Database migration completed successfully!\n");
    // Emit a distinct log line so platform logs can be matched easily
    console.log("MIGRATION_COMPLETED: Portionist migration finished successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrate();
