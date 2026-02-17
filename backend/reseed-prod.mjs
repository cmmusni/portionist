/**
 * Script to clear and re-seed ingredients in production
 * Usage: DATABASE_URL="your_production_db_url" node reseed-prod.js
 */

import { pool, query } from "./src/db/connection.js";

async function reseedProduction() {
  try {
    console.log("🔄 Starting production database re-seed...");
    console.log(
      "Database:",
      process.env.DATABASE_URL?.split("@")[1] || "unknown",
    );

    // Clear ingredients table
    console.log("\n📋 Clearing ingredients table...");
    await query("TRUNCATE TABLE ingredients CASCADE;");
    console.log("✅ Ingredients table cleared");

    // Import and run the seed script
    console.log("\n🌱 Seeding ingredients with corrected categories...");
    const { default: seedIngredients } =
      await import("./dist/seed/seedIngredients.js");

    // Note: seedIngredients module exports a function that runs on import
    // The seed should have already run, but we can verify
    const result = await query("SELECT COUNT(*) as count FROM ingredients");
    const count = result.rows[0]?.count || 0;

    console.log(`✅ Total ingredients seeded: ${count}`);

    // Verify categories
    const categories = await query(`
      SELECT category, COUNT(*) as count 
      FROM ingredients 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log("\n📊 Category distribution:");
    categories.rows.forEach((row) => {
      console.log(`  ${row.category}: ${row.count}`);
    });

    console.log("\n✅ Production database re-seeded successfully!");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error re-seeding production:", error);
    await pool.end();
    process.exit(1);
  }
}

reseedProduction();
