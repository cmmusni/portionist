# Portionist 🥗

**AI-Powered Meal Planning & Nutrition Tracking Platform**

Portionist is a smart, AI-powered application that helps you plan meals, track nutrition, and reach your health goals. Discover recipes, get personalized suggestions, and monitor your daily food intake - all in one easy-to-use platform.

## 📖 Documentation

For a comprehensive overview of the app, including features, tech stack, deployment information, and API integrations, visit the **[Overview Page](overview/index.html)**.

Open `overview/index.html` in your browser to access:

- Complete feature documentation
- Latest updates and changelog
- Tech stack details
- API integration information
- Database schema
- Deployment guides
- Future roadmap

## 🚀 Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## ✨ Key Features

- 🔐 **Secure Authentication** - Email/password, Google OAuth, and Facebook login
- 🎯 **Personalized Meal Planning** - AI-powered recipe suggestions based on your goals
- 📊 **Nutrition Tracking** - Log meals and monitor daily calorie and macro intake
- 🤖 **AI Recipe Generator** - Create custom recipes with Google's Gemini AI
- ⭐ **Favorites Management** - Save and organize your favorite recipes
- 📱 **Cross-Platform** - React Native app with web support

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **AI**: Google Gemini for recipe generation
- **APIs**: Spoonacular for recipe data
- **Deployment**: Netlify (frontend), Railway (backend)

## 📁 Project Structure

- `app/` - Main application screens (using Expo Router)
- `frontend/` - React Native components, screens, and Redux store
- `backend/` - Express server, API routes, and database controllers
- `components/` - Reusable UI components
- `overview/` - Comprehensive HTML documentation page

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## 📄 Additional Documentation

- [API Rate Limit Guide](API_RATE_LIMIT_GUIDE.md)
- [API Tracking Test Guide](API_TRACKING_TEST_GUIDE.md)
- [Food Logging README](FOOD_LOGGING_README.md)
- [Recipe Log Implementation](RECIPE_LOG_IMPLEMENTATION.md)
- [Google OAuth Setup](GOOGLE_OAUTH_SETUP_NEW.md)
- [Facebook Web Setup](FACEBOOK_WEB_SETUP.md)
- [Demo Mode Guide](DEMO_MODE_GUIDE.md)
- [Deployment Guide](README-DEPLOY.md)
- [Changelog](CHANGELOG.md)

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
