// =============================================================================
// FOOD LOGGING FEATURE - SPOONACULAR INTEGRATION
// =============================================================================
//
// This feature provides comprehensive food logging using the Spoonacular API
// with automatic nutrition tracking and plate balance scoring.
//
// =============================================================================
// ARCHITECTURE OVERVIEW
// =============================================================================
//
// 1. DATABASE SCHEMA
// ------------------
//
// Table: food_entries
// - id SERIAL PRIMARY KEY
// - user_id VARCHAR(255) NOT NULL (FK to users)
// - recipe_id INT NOT NULL (Spoonacular recipe ID)
// - title TEXT (Recipe title)
// - protein FLOAT DEFAULT 0 (grams)
// - carbs FLOAT DEFAULT 0 (grams)
// - fat FLOAT DEFAULT 0 (grams)
// - calories FLOAT DEFAULT 0
// - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//
// Indexes:
// - idx_food_entries_user_date ON (user_id, created_at DESC)
//
// =============================================================================
// 2. API ENDPOINTS
// =============================================================================
//
// POST /api/food/log
// ------------------
// Log a food entry from Spoonacular recipe search
//
// Headers:
//   Authorization: Bearer <JWT_TOKEN>
//
// Request Body:
//   {
//     "recipeId": 716429  // Spoonacular recipe ID (number)
//   }
//
// Response (201 Created):
//   {
//     "success": true,
//     "message": "Food logged successfully",
//     "data": {
//       "id": 123,
//       "recipeId": 716429,
//       "title": "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
//       "nutrition": {
//         "protein": 19.2,
//         "carbs": 95.5,
//         "fat": 12.3,
//         "calories": 584.2
//       },
//       "loggedAt": "2026-02-20T10:30:00.000Z"
//     }
//   }
//
// Errors:
//   400 - Invalid recipeId
//   401 - Unauthorized (no/invalid token)
//   404 - Recipe not found
//   500 - Server error
//
//
// GET /api/food/today
// -------------------
// Get today's nutrition totals and plate balance score
//
// Headers:
//   Authorization: Bearer <JWT_TOKEN>
//
// Response (200 OK):
//   {
//     "protein": 65.5,
//     "carbs": 180.3,
//     "fat": 45.2,
//     "calories": 1420.5,
//     "proteinPercent": 22.5,
//     "carbsPercent": 62.0,
//     "fatPercent": 15.5,
//     "portionScore": 72
//   }
//
// Response (No meals logged):
//   {
//     "message": "No meals logged today.",
//     "protein": 0,
//     "carbs": 0,
//     "fat": 0,
//     "calories": 0,
//     "proteinPercent": 0,
//     "carbsPercent": 0,
//     "fatPercent": 0,
//     "portionScore": 0
//   }
//
//
// GET /api/food/entries/today
// ---------------------------
// Get list of all food entries logged today
//
// Headers:
//   Authorization: Bearer <JWT_TOKEN>
//
// Response (200 OK):
//   {
//     "success": true,
//     "data": [
//       {
//         "id": 123,
//         "recipeId": 716429,
//         "title": "Pasta with Garlic...",
//         "nutrition": {
//           "protein": 19.2,
//           "carbs": 95.5,
//           "fat": 12.3,
//           "calories": 584.2
//         },
//         "loggedAt": "2026-02-20T10:30:00.000Z"
//       }
//     ],
//     "count": 1
//   }
//
//
// DELETE /api/food/entries/:id
// ----------------------------
// Delete a specific food entry
//
// Headers:
//   Authorization: Bearer <JWT_TOKEN>
//
// Response (200 OK):
//   {
//     "success": true,
//     "message": "Entry deleted successfully"
//   }
//
// Errors:
//   400 - Invalid entry ID
//   404 - Entry not found or not owned by user
//
// =============================================================================
// 3. SPOONACULAR API INTEGRATION
// =============================================================================
//
// Endpoint Used:
//   GET https://api.spoonacular.com/recipes/complexSearch
//
// Query Parameters:
//   - apiKey: process.env.SPOONACULAR_API_KEY
//   - addRecipeNutrition: true
//   - ids: <recipeId>
//   - number: 1
//
// Response Structure:
//   {
//     "results": [
//       {
//         "id": 716429,
//         "title": "Pasta with Garlic...",
//         "nutrition": {
//           "nutrients": [
//             { "name": "Calories", "amount": 584.2, "unit": "kcal" },
//             { "name": "Protein", "amount": 19.2, "unit": "g" },
//             { "name": "Carbohydrates", "amount": 95.5, "unit": "g" },
//             { "name": "Fat", "amount": 12.3, "unit": "g" }
//           ]
//         }
//       }
//     ]
//   }
//
// Nutrient Extraction:
//   - Protein: Find nutrient where name === "Protein"
//   - Carbs: Find nutrient where name === "Carbohydrates"
//   - Fat: Find nutrient where name === "Fat"
//   - Calories: Find nutrient where name === "Calories"
//
// =============================================================================
// 4. PORTION SCORE CALCULATION
// =============================================================================
//
// Ideal Macronutrient Distribution:
//   - Protein: 30%
//   - Carbohydrates: 40%
//   - Fat: 30%
//
// Score Algorithm:
//   1. Calculate actual percentages from today's totals
//   2. Calculate absolute deviation from ideal for each macro
//   3. Average the deviations
//   4. Convert to score: score = 100 - (avgDeviation * 2)
//   5. Clamp between 0 and 100
//
// Example:
//   Actual: Protein 25%, Carbs 50%, Fat 25%
//   Deviations: |25-30| = 5, |50-40| = 10, |25-30| = 5
//   Average: (5 + 10 + 5) / 3 = 6.67
//   Score: 100 - (6.67 * 2) = 87
//
// Score Interpretation:
//   90-100: Excellent balance
//   75-89:  Good balance
//   60-74:  Fair balance
//   0-59:   Needs improvement
//
// =============================================================================
// 5. ENVIRONMENT VARIABLES
// =============================================================================
//
// Required in .env:
//   SPOONACULAR_API_KEY=your_api_key_here
//   JWT_SECRET=your_jwt_secret_here
//   DATABASE_URL=postgresql://...
//
// Get Spoonacular API Key:
//   https://spoonacular.com/food-api/console#Dashboard
//
// =============================================================================
// 6. IMPLEMENTATION FILES
// =============================================================================
//
// Backend TypeScript Implementation:
//   - /backend/src/db/schema.ts (food_entries table)
//   - /backend/src/controllers/foodController.ts (business logic)
//   - /backend/src/routes/food.ts (API routes)
//   - /backend/src/middleware/auth.ts (JWT authentication)
//   - /backend/src/index.ts (route registration)
//
// =============================================================================
// 7. USAGE EXAMPLES
// =============================================================================
//
// Example 1: Log a food entry
// ----------------------------
// const logFood = async (recipeId, token) => {
//   const response = await fetch('http://localhost:3000/api/food/log', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`
//     },
//     body: JSON.stringify({ recipeId })
//   });
//   return await response.json();
// };
//
//
// Example 2: Get today's plate balance
// -------------------------------------
// const getPlateBalance = async (token) => {
//   const response = await fetch('http://localhost:3000/api/food/today', {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
//   return await response.json();
// };
//
//
// Example 3: Get today's food entries
// ------------------------------------
// const getTodayEntries = async (token) => {
//   const response = await fetch('http://localhost:3000/api/food/entries/today', {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
//   return await response.json();
// };
//
//
// Example 4: Delete a food entry
// -------------------------------
// const deleteEntry = async (entryId, token) => {
//   const response = await fetch(`http://localhost:3000/api/food/entries/${entryId}`, {
//     method: 'DELETE',
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
//   return await response.json();
// };
//
// =============================================================================
// 8. TESTING
// =============================================================================
//
// Test with curl:
//
// 1. Create user and get token:
//    curl -X POST http://localhost:3000/auth/signup \
//      -H "Content-Type: application/json" \
//      -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
//
// 2. Log a food entry (Recipe ID 716429 is a valid Spoonacular recipe):
//    curl -X POST http://localhost:3000/api/food/log \
//      -H "Authorization: Bearer YOUR_TOKEN" \
//      -H "Content-Type: application/json" \
//      -d '{"recipeId": 716429}'
//
// 3. Get today's plate balance:
//    curl http://localhost:3000/api/food/today \
//      -H "Authorization: Bearer YOUR_TOKEN"
//
// 4. Get today's entries:
//    curl http://localhost:3000/api/food/entries/today \
//      -H "Authorization: Bearer YOUR_TOKEN"
//
// =============================================================================
// 9. SECURITY CONSIDERATIONS
// =============================================================================
//
// ✅ IMPLEMENTED:
//   - JWT authentication on all endpoints
//   - User-specific data isolation (userId from token)
//   - API key stored in environment variables
//   - Input validation (recipeId type checking)
//   - SQL injection prevention (parameterized queries)
//   - User ownership verification on DELETE
//
// 🔒 PRODUCTION RECOMMENDATIONS:
//   - Enable HTTPS/TLS
//   - Add rate limiting
//   - Implement API key rotation
//   - Add request logging
//   - Set up monitoring/alerts
//   - Add CORS whitelist
//
// =============================================================================
// 10. ERROR HANDLING
// =============================================================================
//
// All endpoints return consistent error format:
//   {
//     "success": false,
//     "error": "Error message here"
//   }
//
// Common errors:
//   - 400: Invalid input (missing/wrong type recipeId)
//   - 401: Unauthorized (no token or invalid token)
//   - 404: Resource not found
//   - 500: Server error (database, Spoonacular API, etc.)
//
// =============================================================================

module.exports = {
  // This file serves as documentation for the food logging feature
  // The actual implementation is in TypeScript files in /backend/src/

  info: "Food Logging Feature - Spoonacular Integration",
  version: "1.0.0",
  status: "Production Ready",

  endpoints: {
    log: "POST /api/food/log",
    today: "GET /api/food/today",
    entries: "GET /api/food/entries/today",
    delete: "DELETE /api/food/entries/:id",
  },

  requirements: [
    "SPOONACULAR_API_KEY environment variable",
    "PostgreSQL database",
    "JWT authentication",
  ],
};
