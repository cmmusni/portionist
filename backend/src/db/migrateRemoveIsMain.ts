import { query } from "../db/connection.js";

/**
 * Migration to remove is_main column from ingredients table
 */
export const migrateRemoveIsMain = async (): Promise<void> => {
  try {
    console.log(
      "🔄 Starting migration: Remove is_main column from ingredients...",
    );

    // Drop the is_main column
    await query(`
      ALTER TABLE ingredients DROP COLUMN IF EXISTS is_main;
    `);

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateRemoveIsMain()
    .then(() => {
      console.log("✅ Migration script completed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration script failed:", err);
      process.exit(1);
    });
}
