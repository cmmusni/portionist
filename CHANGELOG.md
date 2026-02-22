# Changelog

All notable changes to Portionist will be documented in this file.

## [1.1.0] - 2026-02-23

### 🚀 Features

#### API Integration & Data

- **Spoonacular API Integration**: Added Spoonacular as primary recipe API with comprehensive ingredient database
- **Cooking Method Filter**: Implemented cooking method selection to better match user preferences
- **Spoonacular Ingredients API**: Integrated standardized ingredient database with ~1,000 common ingredients
- **Auto-Download CSV**: Added automatic download for Spoonacular CSV data in seed script
- **Admin Seeding Endpoint**: Added `/admin/seed` endpoint for easy database initialization and updates

#### Authentication & OAuth

- **iOS OAuth Fix**: Improved OAuth redirect handling for iOS with `window.location.replace`
- **Meta Refresh Tag**: Added fallback meta refresh for better iOS OAuth compatibility
- **Cross-Device Persistence**: Onboarding data now fetches from backend after sign-in/up

#### UI/UX Enhancements

- **Green Branding**: Complete app overhaul with Portionist green branding (#E8F3ED)
- **Beautified UI**: Enhanced UI across all screens with improved styling and user experience
- **Responsive Overview Page**: Made overview page mobile-responsive for better accessibility
- **Enhanced Overview Design**: Beautified overview page with brand colors and comprehensive app documentation

#### Health & Monitoring

- **Backend Health Monitoring**: Added health check endpoint and monitoring to dashboard
- **Error Handling**: Improved error handling and user feedback throughout the app

### 🐛 Bug Fixes

#### Recipe & Ingredients

- **Ingredient Selection Fix**: Fixed ingredient_id to id field mapping for proper ingredient selection
- **Smart Pre-Selection**: Changed default pantry pre-selection to only 3 common items (salt, garlic, black pepper) instead of all items
- **Recipe Display Fix**: Fixed blank recipe display screen issues (multiple iterations)
- **Complete Recipe Data**: Ensured all recipes include complete ingredients and cooking instructions
- **Scrollable Recipe Display**: Enabled scrolling in recipe display for longer recipes

#### API & Rate Limiting

- **AI Rate Limit Handling**: Improved rate limit handling with retry logic and better error messages
- **Spoonacular Fallback**: Added Spoonacular API as fallback when AI rate limit is exhausted
- **API Priority Restructure**: Reorganized API priority: Spoonacular (primary) → Google AI (fallback) → Mock recipes (last resort)

#### Data & Backend

- **Module Import Fix**: Fixed seed script to allow module import without auto-execution
- **Admin Router Import**: Added missing admin router import to index.ts
- **Mock Recipe Enhancement**: Improved mock recipes with complete data for better fallback experience

### 📝 Documentation

- **Overview Page**: Added comprehensive app overview documentation at `/overview`
- **Netlify Deployment**: Added Netlify configuration and deployment support for overview page
- **Mobile Status Updates**: Documented mobile compatibility and OAuth functionality

### 🔧 Technical Improvements

- **API Response Mapping**: Better handling of API response field mapping for consistency
- **Ingredient Database**: Using standardized Spoonacular ingredient names for better recipe matching
- **Error Messages**: More informative error messages for users and developers
- **Code Organization**: Improved code structure and module organization

---

## [1.0.0] - Initial Release

### Features

- Recipe generation based on available ingredients
- User authentication (Email, Google OAuth, Facebook)
- Pantry management system
- Meal history tracking
- Favorite recipes
- Profile management with dietary preferences
- Onboarding flow for new users
- AI-powered recipe suggestions
- Mock recipe fallback system
- Cross-platform support (iOS, Android, Web)
