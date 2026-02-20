# Food Logging Feature - Spoonacular Integration

## ✅ Status: Production Ready

Complete food logging system with **Spoonacular API** integration, automatic nutrition tracking, and intelligent plate balance scoring.

---

## 🎯 Features

### 1. **Spoonacular-Powered Food Logging**

- Log meals by Spoonacular recipe ID
- Automatic nutrition extraction (Protein, Carbs, Fat, Calories)
- Real-time data from Spoonacular complexSearch API
- Persistent storage in PostgreSQL

### 2. **Today's Plate Balance Analytics**

- Daily nutrition totals aggregation
- Macronutrient percentage distribution
- **Portion Score** (0-100) based on ideal ratios
- Ideal balance: Protein 30%, Carbs 40%, Fat 30%

### 3. **Food Entry Management**

- View all meals logged today
- Delete individual entries
- User-specific data isolation
- JWT authentication on all endpoints

---

## 📊 API Endpoints

### `POST /api/food/log`

**Log a food entry from Spoonacular recipe**

**Request:**

```bash
curl -X POST http://localhost:3000/api/food/log \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipeId": 716429}'
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Food logged successfully",
  "data": {
    "id": 1,
    "recipeId": 716429,
    "title": "Red Lentil Soup with Chicken and Turnips",
    "nutrition": {
      "protein": 26.93,
      "carbs": 51.78,
      "fat": 20.34,
      "calories": 477.24
    },
    "loggedAt": "2026-02-20T04:37:34.801Z"
  }
}
```

---

### `GET /api/food/today`

**Get today's plate balance with nutrition totals**

**Request:**

```bash
curl http://localhost:3000/api/food/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**

```json
{
  "protein": 26.9,
  "carbs": 51.8,
  "fat": 20.3,
  "calories": 477.2,
  "proteinPercent": 27.2,
  "carbsPercent": 52.3,
  "fatPercent": 20.5,
  "portionScore": 84
}
```

**Response (No meals logged):**

```json
{
  "message": "No meals logged today.",
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "calories": 0,
  "proteinPercent": 0,
  "carbsPercent": 0,
  "fatPercent": 0,
  "portionScore": 0
}
```

---

### `GET /api/food/entries/today`

**Get list of all food entries logged today**

**Request:**

```bash
curl http://localhost:3000/api/food/entries/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "recipeId": 716429,
      "title": "Red Lentil Soup with Chicken and Turnips",
      "nutrition": {
        "protein": 26.93,
        "carbs": 51.78,
        "fat": 20.34,
        "calories": 477.24
      },
      "loggedAt": "2026-02-20T04:37:34.801Z"
    }
  ],
  "count": 1
}
```

---

### `DELETE /api/food/entries/:id`

**Delete a specific food entry**

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/food/entries/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Entry deleted successfully"
}
```

---

## 💾 Database Schema

### `food_entries` Table

```sql
CREATE TABLE food_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  recipe_id INT NOT NULL,
  title TEXT,
  protein FLOAT DEFAULT 0,
  carbs FLOAT DEFAULT 0,
  fat FLOAT DEFAULT 0,
  calories FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_food_entries_user_date
ON food_entries(user_id, created_at DESC);
```

---

## 🔧 Setup

### 1. Environment Variables

Add to `/backend/.env`:

```env
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://...
```

### 2. Get Spoonacular API Key

1. Visit [Spoonacular API Console](https://spoonacular.com/food-api/console#Dashboard)
2. Sign up for free account
3. Copy your API key

### 3. Run Database Migrations

```bash
cd backend
npm run migrate
```

### 4. Build and Start Server

```bash
npm run build
npm start
```

---

## 📈 Portion Score Algorithm

### Ideal Macronutrient Distribution

- **Protein:** 30%
- **Carbohydrates:** 40%
- **Fat:** 30%

### Calculation Steps

1. Calculate actual percentages from today's totals
2. Calculate absolute deviation from ideal for each macro
3. Average the deviations
4. Convert to score: `score = 100 - (avgDeviation * 2)`
5. Clamp between 0 and 100

### Example

```
Actual: Protein 27%, Carbs 52%, Fat 21%
Deviations: |27-30| = 3, |52-40| = 12, |21-30| = 9
Average: (3 + 12 + 9) / 3 = 8
Score: 100 - (8 * 2) = 84
```

### Score Interpretation

- **90-100:** Excellent balance ⭐⭐⭐⭐⭐
- **75-89:** Good balance ⭐⭐⭐⭐
- **60-74:** Fair balance ⭐⭐⭐
- **0-59:** Needs improvement ⭐⭐

---

## 🔐 Security

### Implemented

✅ JWT authentication on all endpoints  
✅ User-specific data isolation (userId from token)  
✅ API key stored in environment variables (never exposed)  
✅ Input validation (recipeId type checking)  
✅ SQL injection prevention (parameterized queries)  
✅ User ownership verification on DELETE

### Production Recommendations

🔒 Enable HTTPS/TLS  
🔒 Add rate limiting  
🔒 Implement API key rotation  
🔒 Add request logging  
🔒 Set up monitoring/alerts  
🔒 Add CORS whitelist

---

## 🧪 Testing

### Quick Test

```bash
# 1. Create user and get token
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'

# Copy the token from response

# 2. Log a food entry
curl -X POST http://localhost:3000/api/food/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipeId": 716429}'

# 3. Get today's plate balance
curl http://localhost:3000/api/food/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verified Test Results

```
✓ User created successfully
✓ Food logged: "Red Lentil Soup with Chicken and Turnips"
✓ Nutrition extracted: 26.9g protein, 51.8g carbs, 20.3g fat, 477.2 cal
✓ Portion Score calculated: 84 (Good balance)
```

---

## 📂 Implementation Files

```
backend/
├── src/
│   ├── controllers/
│   │   └── foodController.ts          # Business logic
│   ├── routes/
│   │   └── food.ts                    # API routes
│   ├── middleware/
│   │   └── auth.ts                    # JWT authentication
│   ├── db/
│   │   └── schema.ts                  # Database tables
│   └── index.ts                       # Route registration
└── features/
    └── foodLogging.js                 # Complete documentation
```

---

## 🎨 Frontend Integration Example

```typescript
// Log a food entry
const logFood = async (recipeId: number, token: string) => {
  const response = await fetch("http://localhost:3000/api/food/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipeId }),
  });
  return await response.json();
};

// Get today's plate balance
const getPlateBalance = async (token: string) => {
  const response = await fetch("http://localhost:3000/api/food/today", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

// Usage
const token = useSelector(selectToken);
const result = await logFood(716429, token);
const balance = await getPlateBalance(token);
```

---

## ❌ Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (food logged)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (no/invalid token)
- `404` - Not Found (recipe/entry)
- `500` - Server Error

---

## 📝 Spoonacular API Notes

### Endpoint Used

```
GET https://api.spoonacular.com/recipes/complexSearch
```

### Query Parameters

- `apiKey`: Your Spoonacular API key
- `addRecipeNutrition`: true (enable nutrition data)
- `ids`: Recipe ID to fetch
- `number`: 1 (limit to one result)

### Nutrient Extraction

From `response.results[0].nutrition.nutrients[]`:

- Find nutrient where `name === "Protein"` → extract `amount`
- Find nutrient where `name === "Carbohydrates"` → extract `amount`
- Find nutrient where `name === "Fat"` → extract `amount`
- Find nutrient where `name === "Calories"` → extract `amount`

---

## 🚀 Next Steps

### Recommended Enhancements

1. **Add meal type tracking** (breakfast, lunch, dinner, snack)
2. **Weekly/monthly analytics** (trends over time)
3. **Goal setting** (target calories, macros)
4. **Export functionality** (CSV, PDF reports)
5. **Barcode scanning** integration
6. **Custom food entries** (non-Spoonacular items)
7. **Meal planning** suggestions based on balance
8. **Social features** (share meals, challenges)

---

## 📄 License

Part of the Portionist app ecosystem.

---

**Built with:** Express.js • PostgreSQL • Spoonacular API • JWT Auth • TypeScript
