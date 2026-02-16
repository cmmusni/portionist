# AI Recipe Generation Setup Guide

## ✨ New Feature: AI-Powered Recipe Generation

The app now includes AI-powered recipe generation using OpenAI's GPT models!

### 🔧 Setup Instructions

#### 1. Get Your OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again!)

#### 2. Configure Backend

In the `backend` directory, create a `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
DB_USER=postgres
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portionist
```

#### 3. Install Dependencies & Start Backend

```bash
npm install
npm run build
npm start
```

The backend will be available at `http://localhost:3000`

### 📱 Using AI Recipe Generation in the App

1. Navigate to the Recipe Display screen
2. Search for database recipes (or get an empty list)
3. Tap the **"✨ Generate with AI"** button
4. Wait a moment while the AI creates a personalized recipe
5. View the AI-generated recipe with full instructions
6. Tap **"← Back to recipes"** to try again or pick a database recipe

### 🎨 How It Works

- **Input**: Your onboarding preferences (cuisine, weight targets, meal type, main ingredient)
- **Processing**: OpenAI's GPT-3.5 generates a customized recipe matching your criteria
- **Output**: A complete recipe with:
  - Recipe name
  - Ingredient list with quantities
  - Step-by-step instructions
  - Cooking times (prep, cook, total)

### 💡 API Endpoints

**Get Database Recipes:**

```
POST /getRecipes
```

**Generate AI Recipe:**

```
POST /recipes/generate
```

Both accept the same request body:

```json
{
  "mainIngredient": { "id": "chicken_breast", "name": "Chicken Breast" },
  "sideIngredients": [],
  "currentWeight": 70,
  "targetWeight": 75,
  "mealType": "Lunch",
  "cuisine": "Asian"
}
```

### 📊 Frontend Integration

The frontend automatically handles:

- Loading state ("Generating recipe with AI...")
- Error handling with user-friendly alerts
- Back button to return to recipe list
- API fallback if OpenAI key is not configured

### 🚨 Troubleshooting

**"Failed to generate recipe. Make sure OPENAI_API_KEY is set on the server."**

- Verify your `.env` file has a valid `OPENAI_API_KEY`
- Restart the backend server
- Confirm the key starts with `sk-`

**"Failed to generate recipe with AI"**

- Check backend logs for detailed error message
- Verify internet connection
- Ensure OpenAI account has available credits/quota

**Rate Limiting**

- OpenAI has usage limits. If you hit the limit, wait before trying again
- Consider setting up billing/usage monitoring in your OpenAI dashboard

### 🔒 Security Notes

- Never commit your `.env` file or API keys to version control
- The `.env` file is already in `.gitignore`
- Keep your OpenAI API key private and confidential
- Monitor your OpenAI usage and costs in the dashboard

### 📈 Future Enhancements

- Store generated recipes to database
- Add recipe regeneration/refinement
- Support custom ingredient selection for AI recipes
- Save favorite AI-generated recipes
