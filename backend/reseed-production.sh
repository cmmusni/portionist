#!/bin/bash
# Script to re-seed production database with correct categories

echo "🔄 Re-seeding production database..."
echo "⚠️  Make sure you have set the production DATABASE_URL env var"
echo ""

# Clear existing ingredients
echo "Clearing ingredients table..."
node dist/migrate.js

# Re-seed with corrected categories
echo "Seeding ingredients with correct categories..."
node dist/seed/seedIngredients.js

echo "✅ Production database re-seeded!"
