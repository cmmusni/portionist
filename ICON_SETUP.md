# Setting Up the Portionist App Icon

## 📱 App Icon Setup Instructions

The Portionist logo (green bowl with vegetables) should be used as the app icon.

### Required Steps:

1. **Save the logo image** as:
   - `assets/images/icon.png` (1024x1024px)
   - `assets/images/favicon.png` (for web)
   - `assets/images/splash-icon.png` (for splash screen)

2. **For Android Adaptive Icons**, create:
   - `assets/images/android-icon-foreground.png` - The green bowl logo
   - `assets/images/android-icon-background.png` - Light green background (#E8F3ED)
   - `assets/images/android-icon-monochrome.png` - Monochrome version

### Image Requirements:

- **Main Icon** (`icon.png`): 1024x1024px PNG
  - Use the full logo with green bowl and vegetables
  - Transparent or white background

- **Splash Icon** (`splash-icon.png`): 400x400px PNG
  - Centered logo on transparent background

- **Favicon** (`favicon.png`): 48x48px or 96x96px PNG
  - Simplified version of the logo

### Already Configured:

✅ `app.json` has been updated with:

- Android adaptive icon background color: `#E8F3ED` (light green from logo)
- All icon paths properly configured

### Color Consistency:

The app icon colors match the brand palette:

- 🟢 Forest Green (`#5C8A6F`) - Bowl exterior
- 🌿 Lime Green (`#A8D24E`) - Leafy vegetables
- 🥕 Orange (`#FF9933`) - Carrot
- 🍅 Red (`#E94B4B`) - Tomato
- ⚪ White/Cream - Bowl interior

### Testing the Icon:

After adding the images, rebuild the app:

```bash
# Clear build cache
expo prebuild --clean

# For iOS
expo run:ios

# For Android
expo run:android

# For web (uses favicon)
npm run web
```

---

## 🎨 Brand Consistency

The logo serves as the foundation for all brand colors. Review `BRANDING.md` for the complete color palette and usage guidelines.
