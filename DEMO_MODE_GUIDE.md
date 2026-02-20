# 🎭 Demo Mode - Mock Recipes for API Rate Limits

## Overview

When API rate limits are reached (Spoonacular 150 calls/day), the backend automatically switches to **Demo Mode** and returns mock recipes instead of errors. This ensures a smooth demo experience for test users.

---

## 🎯 What Triggers Demo Mode?

Demo Mode activates when Spoonacular API returns:

- **429** - Too Many Requests (rate limit)
- **402** - Payment Required (quota exceeded)

---

## 📍 Where Demo Mode Works

### 1. **Recipe Search** (`/recipes/search`)

**Normal Response:**

```json
{
  "results": [
    {
      "id": "661223",
      "title": "Grilled Chicken Breast",
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "calories": 165,
      "image": "https://..."
    }
  ]
}
```

**Demo Mode Response:**

```json
{
  "results": [
    {
      "id": "mock-661223",
      "title": "Grilled Chicken Breast",
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "calories": 165,
      "image": "https://unsplash.com/..."
    }
  ],
  "demo": true,
  "message": "Using demo data - API limit reached"
}
```

**Behavior:**

- Returns 10 mock recipes
- Filters by search query if possible
- No error shown to user

---

### 2. **Dashboard Suggestions** (`GET /recipes`)

**Demo Mode Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "mock-674291",
      "name": "Egg White Omelette",
      "title": "Egg White Omelette",
      "calories": 130,
      "source": "mock"
    }
  ],
  "demo": true,
  "message": "Using demo data - API limit reached"
}
```

**Behavior:**

- Returns 2 mock recipes by meal type
- Breakfast → Egg Omelette, Protein Pancakes
- Lunch → Grilled Chicken, Quinoa Bowl
- Dinner → Salmon, Chicken Stir Fry
- Snack → Greek Salad, Turkey Wrap

---

### 3. **Logging Meals** (`POST /api/food/log`)

**Demo Mode Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "recipe_id": "661223",
    "title": "Grilled Chicken Breast",
    "nutrition": {
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "calories": 165
    },
    "source": "demo"
  },
  "demo": true,
  "message": "Using demo data - API limit reached"
}
```

**Behavior:**

- Only works for mock recipe IDs (mock-661223, mock-715497, etc.)
- Full nutrition data included
- Meal gets logged to database
- Marked as `source: "demo"`

**Important:** If user tries to log a non-mock recipe during rate limit, they'll see:

```json
{
  "success": false,
  "error": "API limit reached and no demo data available for this recipe"
}
```

---

## 🎨 Available Mock Recipes

### Search Results (10 recipes):

1. **Grilled Chicken Breast** - 165 cal (31g protein)
2. **Greek Salad with Feta** - 220 cal
3. **Salmon with Vegetables** - 260 cal
4. **Quinoa Buddha Bowl** - 280 cal
5. **Chicken Stir Fry** - 265 cal
6. **Beef Tacos** - 295 cal
7. **Vegetable Pasta** - 290 cal
8. **Tuna Salad Sandwich** - 310 cal
9. **Egg White Omelette** - 130 cal
10. **Turkey Wrap** - 235 cal

### Detailed Recipes (3 recipes with full nutrition):

- **mock-661223** - Grilled Chicken Breast
- **mock-715497** - Greek Salad with Feta
- **mock-642583** - Salmon with Vegetables

---

## 🧪 Testing Demo Mode

### Option 1: Simulate Rate Limit (Without Hitting Actual Limit)

Temporarily modify backend to always return mock data:

**In `routes/recipes.ts`:**

```typescript
// Force demo mode for testing
if (true) { // Change condition
  const filteredMocks = mockSearchResults.filter(...)
  res.json({ results: filteredMocks, demo: true })
  return;
}
```

### Option 2: Actually Hit Rate Limit

1. Make 150+ API calls in a day
2. Search for recipes
3. Should see mock data automatically

### Option 3: Check Response Flags

```bash
# Search for recipes
curl "http://localhost:3000/recipes/search?q=chicken" | jq '.demo'

# If returns true → Demo Mode active
# If returns null → Normal mode (using real API)
```

---

## 🔍 How to Tell If Demo Mode Is Active

### In Backend Logs:

```
⚠️ Spoonacular rate limit reached - returning mock recipes for demo
```

### In API Response:

```json
{
  "demo": true,
  "message": "Using demo data - API limit reached"
}
```

### In Frontend:

Check for `demo` field in response:

```typescript
const response = await fetch(apiUrl("/recipes/search?q=chicken"));
const data = await response.json();

if (data.demo) {
  console.log("📱 Demo mode active - using mock recipes");
}
```

---

## 💡 Production Considerations

### Should You Keep Demo Mode?

**Pros:**

- ✅ Better UX during demos
- ✅ No errors for test users
- ✅ Smooth fallback experience

**Cons:**

- ⚠️ Users might not know they're seeing demo data
- ⚠️ Mock recipes have limited variety
- ⚠️ Could mask real issues

### Recommended Approach:

**For Demo/Testing:**

- ✅ Keep demo mode enabled
- ✅ Add subtle badge: "Demo Recipe"

**For Production:**

- Option A: Keep it, show clear "Demo Mode" banner
- Option B: Remove it, show user-friendly error instead
- Option C: Upgrade to paid API plan

---

## 🎨 Customizing Mock Recipes

To add more mock recipes, edit [`backend/src/utils/mockRecipes.ts`](../backend/src/utils/mockRecipes.ts):

```typescript
export const mockSearchResults = [
  {
    id: "mock-YOUR-ID",
    title: "Your Recipe Name",
    protein: 20,
    carbs: 30,
    fat: 10,
    calories: 300,
    image: "https://images.unsplash.com/...",
  },
  // ... add more
];
```

---

## 🚨 Limitations

1. **Limited Recipe Pool**
   - Only 10 search results
   - Only 3 detailed recipes for logging

2. **No Real-Time Data**
   - Static nutrition info
   - No recipe variations

3. **Logging Restrictions**
   - Can only log mock recipes (mock-\* IDs)
   - Logging non-mock recipes fails during rate limit

---

## 📊 Monitoring

Check if demo mode was used today:

```bash
# Check API usage
curl http://localhost:3000/api/usage/summary | jq '.data.apis.spoonacular'

# If calls ≥ 120 (80% limit) → High chance demo mode will activate
```

Check database for demo entries:

```sql
SELECT COUNT(*)
FROM food_entries
WHERE source = 'demo'
AND DATE(logged_at) = CURRENT_DATE;
```

---

## ✅ Summary

**Demo Mode is active for:**

- ✅ Recipe search → Returns 10 mock recipes
- ✅ Dashboard suggestions → Returns 2 meal-specific mocks
- ✅ Logging meals → Works for 3 detailed mock recipes

**You'll know it's active when:**

- `"demo": true` appears in API responses
- Server logs show "rate limit reached - returning mock"
- Recipe IDs start with "mock-"

**Perfect for:**

- 🎭 Product demos
- 🧪 Testing without API costs
- 👥 Preventing user-facing errors during high traffic

---

Need to add more mock recipes or customize behavior? Edit [`mockRecipes.ts`](../backend/src/utils/mockRecipes.ts)!
