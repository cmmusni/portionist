import { query } from "./connection.js";

/**
 * Initialize the database schema
 * Creates tables if they don't exist
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create users table
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

    // Create favorites table
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

    // Create onboarding_data table
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

    // Create ingredients table
    await query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        ingredient_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        is_common BOOLEAN DEFAULT false,
        is_pantry BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create recipes table
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

    // Create recipe_ingredients join table
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

    // Create user_recipe_history table to track all recipe interactions
    await query(`
      CREATE TABLE IF NOT EXISTS user_recipe_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        recipe_id VARCHAR(255) NOT NULL,
        recipe_data JSONB NOT NULL,
        interaction_type VARCHAR(50) NOT NULL,
        searched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE(user_id, recipe_id, interaction_type)
      )
    `);

    // Create index for faster queries on user_recipe_history
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_recipe_history_user_id 
      ON user_recipe_history(user_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_recipe_history_searched_at 
      ON user_recipe_history(searched_at DESC)
    `);

    console.log("✅ Database schema initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database schema:", error);
    throw error;
  }
};
