# ✅ API Tracking System - Quick Test Guide

## System Status: ✅ INSTALLED & RUNNING

Your API tracking system is now live and monitoring all API calls!

---

## 🧪 How to Test It

### 1. Check Current Usage (Anytime)

```bash
curl -s http://localhost:3000/api/usage/summary | jq '.'
```

**Expected Output:**

```json
{
  "success": true,
  "data": {
    "apis": {
      "spoonacular": {
        "calls": 0,
        "limit": 150,
        "percentage": 0,
        "status": "OK"
      }
    }
  }
}
```

### 2. Trigger API Calls

#### a) Search for a Recipe (From Your App)

1. Open your app
2. Go to Dashboard
3. Type "chicken" in the search bar
4. **This will make 1 Spoonacular API call**

#### b) Via Terminal (Direct Test)

```bash
# Search for recipes
curl "http://localhost:3000/recipes/search?q=chicken"
```

### 3. Check Usage After Test

```bash
curl -s http://localhost:3000/api/usage/summary | jq '.data.apis.spoonacular'
```

**You should see:**

```json
{
  "calls": 1,
  "limit": 150,
  "percentage": 1,
  "status": "OK"
}
```

### 4. View Detailed Report

```bash
curl -s http://localhost:3000/api/usage/detailed | jq '.data.report'
```

---

## 📊 What Gets Tracked

Every time your app makes these requests:

| Action                 | Tracked? | Where to See It                    |
| ---------------------- | -------- | ---------------------------------- |
| **Dashboard loads**    | ✅ Yes   | Server logs + `/api/usage/summary` |
| **Search for recipe**  | ✅ Yes   | Server logs + `/api/usage/summary` |
| **Log a meal**         | ✅ Yes   | Server logs + `/api/usage/summary` |
| **Generate AI recipe** | ✅ Yes   | Server logs + `/api/usage/summary` |

---

## 🔍 Server Logs (Real-Time Monitoring)

When backend is running, you'll see:

```bash
📡 API CALL: SPOONACULAR - /recipes/complexSearch (search) - Status: 200
📊 API USAGE SUMMARY (Last 24 Hours)
====================================================================
🟢 OK SPOONACULAR: 1/150 calls (1%)
   Recent calls:
   - 10:25:15: /recipes/complexSearch (search) (200)
====================================================================
```

---

## 🎯 Quick Reference Commands

```bash
# Get summary
curl http://localhost:3000/api/usage/summary | jq '.'

# Get detailed report
curl http://localhost:3000/api/usage/detailed | jq '.'

# Check only Spoonacular
curl http://localhost:3000/api/usage/summary | jq '.data.apis.spoonacular'

# Reset tracker (testing only)
curl -X POST http://localhost:3000/api/usage/reset
```

---

## 🚨 Alert Thresholds

The system automatically warns you:

- **🟢 OK** → 0-59% of limit
- **🟡 WARNING** → 60-79% of limit
- **🔴 CRITICAL** → 80-100% of limit

Example when hitting 80%:

```json
{
  "spoonacular": {
    "calls": 120,
    "limit": 150,
    "percentage": 80,
    "status": "CRITICAL",
    "isNearLimit": true
  }
}
```

---

## 💡 What to Watch

### Spoonacular (Main Concern)

- **Free Tier**: 150 calls/day
- **Resets**: Midnight UTC
- **Monitor**: Check summary at end of day

### Google Custom Search

- **Free Tier**: 100 searches/day
- **Usage**: Very low (only fallback)

### Gemini AI

- **Free Tier**: 1,500 calls/day
- **Usage**: Low (only when generating AI recipes)

---

## 📈 Next Steps

1. ✅ **Tracking is installed** - No action needed
2. 📊 **Monitor for 24 hours** - Check usage at end of day
3. 🔧 **Implement caching** - If you see high usage (see API_RATE_LIMIT_GUIDE.md)
4. 💰 **Consider upgrade** - If you consistently hit 80%+ limit

---

## 🆘 Troubleshooting

**Q: I don't see any API calls tracked**

- Check if backend is running: `curl http://localhost:3000/health`
- Make sure you're using the app (not just viewing the page)
- Search for a recipe to trigger an API call

**Q: Tracking shows 0 calls but I used the app**

- App might be using cached results (this is good!)
- Check server logs to see if API was actually called
- Try a fresh search with a new term

**Q: Want to see live tracking**

- Watch server terminal while using the app
- Look for "📡 API CALL: SPOONACULAR..." messages

---

**✅ Your tracking system is ready!** Use the commands above to monitor your API usage anytime.
