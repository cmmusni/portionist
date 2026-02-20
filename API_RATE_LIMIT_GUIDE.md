# API Rate Limit Guide - Portionist App

## 🔍 Which APIs Are You Using?

Your app uses **3 external APIs** with different rate limits:

### 1. **Spoonacular API** 🍽️ - **MAIN BOTTLENECK**

**Free Tier Limit:** 150 requests/day (resets at midnight UTC)

#### Used For:

- ✅ **Dashboard Recipe Suggestions** → 1 call per 6 hours (per meal type)
- ✅ **Recipe Search Bar** → 1 call per search (returns 10 recipes)
- ✅ **Logging Meals** → 1 call per meal logged
- ✅ **Recipe Generation** → 1 call (returns 5 recipes)

#### API Calls Made:

| Endpoint                               | Calls/Request          | When                        | Cached?     |
| -------------------------------------- | ---------------------- | --------------------------- | ----------- |
| `/recipes/complexSearch` (Dashboard)   | 1 (fetches 5 recipes)  | Every 6 hours per meal type | ✅ Yes (6h) |
| `/recipes/complexSearch` (Search)      | 1 (fetches 10 recipes) | Every user search           | ❌ No       |
| `/recipes/{id}/information` (Log meal) | 1                      | When adding meal            | ❌ No       |

**Typical Daily Usage:**

- Light user (1-2 users): 5-10 calls/day ✅
- Moderate user (5 users): 20-40 calls/day ✅
- Heavy usage (10+ users): 80-150+ calls/day ⚠️

---

### 2. **Google Custom Search API** 🔍

**Free Tier Limit:** 100 searches/day

#### Used For:

- Fallback when Spoonacular fails
- Currently only used in recipe generation endpoint

**Daily Usage:** 0-5 calls/day (fallback only)

---

### 3. **Gemini AI API** 🤖

**Free Tier Limit:** 1,500 requests/day + 1 million tokens/month

#### Used For:

- `/recipes/generate` endpoint (AI recipe generation)
- NOT used in Dashboard (you're only calling Spoonacular)

**Daily Usage:** 0-10 calls/day (only if users explicitly generate AI recipes)

---

## 📊 How to Monitor API Usage

### Option 1: Real-Time Dashboard (Recommended)

I've added API usage tracking to your backend. After rebuilding, you can check usage at:

```bash
# Get current usage summary
curl http://localhost:3000/api/usage/summary

# Get detailed breakdown
curl http://localhost:3000/api/usage/detailed
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "timestamp": "2026-02-21T10:30:00.000Z",
    "period": "Last 24 hours",
    "apis": {
      "spoonacular": {
        "calls": 45,
        "limit": 150,
        "percentage": 30,
        "status": "OK",
        "isNearLimit": false
      },
      "google": { ... },
      "gemini": { ... }
    }
  }
}
```

### Option 2: Check Server Logs

Every API call is now logged with:

```
📡 API CALL: SPOONACULAR - /recipes/complexSearch (search) - Status: 200
📊 API USAGE SUMMARY (Last 24 Hours)
====================================================================
🟢 OK SPOONACULAR: 45/150 calls (30%)
   Recent calls:
   - 10:25:15: /recipes/complexSearch (search) (200)
   - 10:20:03: /recipes/661223/information (200)
   - 10:15:42: /recipes/complexSearch (suggestions) (200)
====================================================================
```

### Option 3: Check Spoonacular Dashboard

1. Go to [https://spoonacular.com/food-api/console](https://spoonacular.com/food-api/console)
2. Login with your account
3. View "API Usage" to see exact counts

---

## ⚠️ Current Bottleneck: Spoonacular Search

**Problem:** The search bar in your app (`fetchSearchResults` function) makes a Spoonacular API call **every time the user types** (debounced to 500ms).

### How Many Calls Are You Making?

**Scenario:**

- User types "chicken" in search bar → 1 call
- User adds 3 meals from search → 3 calls
- User types "pasta" to search again → 1 call
- User adds 2 more meals → 2 calls
- **Total: 7 calls in one session**

**With 10 users doing this daily:**

- 10 users × 7 calls = **70 calls/day**
- **That's 47% of your daily limit just from searching!**

---

## ✅ Solutions to Stay Under Limits

### Immediate Actions (Already Implemented):

1. ✅ **Reduced Dashboard Suggestions** - From 4 to 2 recipes
2. ✅ **6-Hour Cache** - Dashboard suggestions cached for 6 hours
3. ✅ **Better Error Handling** - Shows user-friendly message when limit reached
4. ✅ **API Usage Tracking** - Monitor which API is hitting limits

### Additional Recommendations:

#### 1. **Cache Search Results** (High Impact)

Add caching to `fetchSearchResults` in DashboardScreen:

```typescript
// Cache search results for 1 hour
const cacheKey = `search_${query.toLowerCase().trim()}`;
const cached = await AsyncStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

// ... make API call ...

// Cache the results
await AsyncStorage.setItem(cacheKey, JSON.stringify(results));
```

**Impact:** Could save 30-50 calls/day

#### 2. **Increase Search Debounce** (Medium Impact)

Change from 500ms to 1000ms:

```typescript
// In DashboardScreen.tsx useEffect
const timer = setTimeout(() => {
  if (searchQuery.trim()) {
    fetchSearchResults(searchQuery);
  }
}, 1000); // Changed from 500
```

**Impact:** Reduces API calls by ~30%

#### 3. **Pre-populate Common Searches** (High Impact)

Add a "Popular Recipes" section with cached results:

```typescript
const popularRecipes = [
  { id: '661223', title: 'Chicken Breast', ... },
  { id: '715497', title: 'Greek Salad', ... },
  // ... etc
];
```

**Impact:** Could save 20-40 calls/day

#### 4. **Upgrade to Paid Plan** (If Needed)

If you have 10+ users:

- **Spoonacular Paid Plans:**
  - Bronze: $49/month - 500 calls/day
  - Silver: $99/month - 2,500 calls/day
  - Gold: $199/month - 10,000 calls/day

---

## 🚨 What Happens When You Hit the Limit?

### Spoonacular API Response:

```json
{
  "status": 402,
  "message": "You have exceeded your daily points limit."
}
```

### Your App Behavior:

1. Shows alert: "Daily Recipe Limit Reached"
2. Falls back to cached suggestions
3. Users can still view cached recipes
4. Limit resets at midnight UTC

---

## 📈 Monitoring Commands

### Check API Usage (Now):

```bash
# Summary
curl http://localhost:3000/api/usage/summary | jq '.'

# Detailed report
curl http://localhost:3000/api/usage/detailed | jq '.'

# Reset tracker (testing only)
curl -X POST http://localhost:3000/api/usage/reset
```

### View Real-Time Logs:

```bash
# In backend directory
cd backend && npm run dev

# Watch for API calls
# Look for: 📡 API CALL: SPOONACULAR ...
```

---

## 💡 Quick Wins to Implement

1. **Add search result caching** → Save 30-50 calls/day
2. **Increase debounce to 1s** → Save 10-20 calls/day
3. **Hide search on Dashboard** → Force users to use RecipeInput screen
4. **Pre-load popular recipes** → Save 20-40 calls/day

**Total Savings:** 60-110 calls/day → Enough for 10-15 active users on free tier!

---

## 🔧 Build & Test

```bash
# Rebuild backend with tracking
cd backend
npm run build

# Start server
npm run dev

# Check if tracking works
curl http://localhost:3000/api/usage/summary
```

You should see:

```json
{
  "success": true,
  "data": {
    "apis": {
      "spoonacular": {
        "calls": 0,
        "limit": 150,
        ...
      }
    }
  }
}
```

---

## 📞 Next Steps

1. **Rebuild backend** (tracking is now added)
2. **Check current usage:** `curl http://localhost:3000/api/usage/summary`
3. **Monitor for 24 hours** to see actual usage patterns
4. **Implement caching** if needed (instructions above)
5. **Consider paid plan** if you have 10+ daily active users

---

**Questions?** The tracking system is now live. Check your server logs to see exactly which API calls are being made! 🎉
