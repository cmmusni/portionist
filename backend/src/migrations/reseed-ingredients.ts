import { exec } from "child_process";
import { promisify } from "util";
import { query } from "../db/connection.js";

const execAsync = promisify(exec);

/**
 * One-time migration to re-seed ingredients with correct categories
 * This will run automatically on next deployment
 */
export async function reseedIngredientsWithCategories() {
  try {
    console.log(
      "🔄 Checking if ingredients need seeding or category update...",
    );

    // First check if ingredients table is empty
    const totalResult = await query(
      "SELECT COUNT(*) as count FROM ingredients",
    );
    const totalCount = parseInt(totalResult.rows[0]?.count || "0");

    if (totalCount === 0) {
      console.log("⚠️  No ingredients found. Seeding database...");
      await execAsync("node dist/seed/seedIngredients.js");

      const newResult = await query(
        "SELECT COUNT(*) as count FROM ingredients",
      );
      const newCount = parseInt(newResult.rows[0]?.count || "0");
      console.log(`✅ Seeded ${newCount} ingredients with correct categories`);

      // Show category distribution
      const categories = await query(`
        SELECT category, COUNT(*) as count 
        FROM ingredients 
        GROUP BY category 
        ORDER BY count DESC
      `);

      console.log("📊 Category distribution:");
      categories.rows.forEach((row) => {
        console.log(`  ${row.category}: ${row.count}`);
      });
      return;
    }

    // Check if we have ingredients with "Other" category
    const result = await query(
      "SELECT COUNT(*) as count FROM ingredients WHERE category = 'Other'",
    );
    const otherCount = parseInt(result.rows[0]?.count || "0");

    if (otherCount === 0) {
      console.log(
        "✅ No ingredients with 'Other' category found. Skipping re-seed.",
      );
      return;
    }

    console.log(
      `⚠️  Found ${otherCount} ingredients with 'Other' category. Re-seeding...`,
    );

    // Clear ingredients and related data
    await query("TRUNCATE TABLE ingredients CASCADE;");
    console.log("✅ Cleared ingredients table");

    // Re-run seed script
    await execAsync("node dist/seed/seedIngredients.js");

    // Verify the re-seed worked
    const newResult = await query("SELECT COUNT(*) as count FROM ingredients");
    const newCount = parseInt(newResult.rows[0]?.count || "0");

    console.log(
      `✅ Re-seeded ${newCount} ingredients with corrected categories`,
    );

    // Show category distribution
    const categories = await query(`
      SELECT category, COUNT(*) as count 
      FROM ingredients 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log("📊 Category distribution:");
    categories.rows.forEach((row) => {
      console.log(`  ${row.category}: ${row.count}`);
    });
  } catch (error) {
    console.error("❌ Error in reseedIngredientsWithCategories:", error);
    throw error;
  }
}
