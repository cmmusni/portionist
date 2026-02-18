# Portionist Brand Identity

## 🥗 Logo & Brand Origin

The Portionist brand is anchored by our logo: a vibrant green bowl filled with fresh vegetables (leafy greens, tomato, carrot, and celery). This imagery represents:

- **Portions** - The bowl as a container for measured servings
- **Fresh Ingredients** - Colorful vegetables symbolizing health
- **Balance** - A variety of vegetables in harmony

All brand colors are directly extracted from the logo to maintain visual consistency.

---

## 🎨 Color Palette (From Logo)

### Primary Colors - Forest Green

Extracted from the bowl exterior - represents health, nature, and balance

- **Primary**: `#5C8A6F` - Main brand color (bowl green)
- **Primary Dark**: `#4A7059` - Hover states, pressed buttons
- **Primary Light**: `#7BA58C` - Lighter accents
- **Primary Very Light**: `#E8F3ED` - Backgrounds, subtle highlights
- **Primary Background**: `#F5FAF7` - Section backgrounds

### Secondary Colors - Lime Green

From the fresh leafy vegetables - vitality and energy

- **Secondary**: `#A8D24E` - Bright lime green (leaves)
- **Secondary Dark**: `#8AB83E` - Darker leaf tone
- **Secondary Light**: `#C4E17F` - Lighter leaf highlights
- **Secondary Very Light**: `#F0F9E3` - Secondary backgrounds
- **Secondary Background**: `#F7FCF0` - Alternate section backgrounds

### Accent Colors - Carrot Orange

From the carrot in the bowl - warmth and energy

- **Accent**: `#FF9933` - Main carrot orange
- **Accent Dark**: `#E67E1A` - Darker orange
- **Accent Light**: `#FFB366` - Lighter orange
- **Accent Very Light**: `#FFF0E0` - Subtle backgrounds

### Success - Fresh Vegetable Green

Fresh, healthy, completed actions

- **Success**: `#6BBF59`
- **Success Dark**: `#52A03F`
- **Success Light**: `#8FD882`
- **Success Very Light**: `#E8F8E5`

### Danger - Tomato Red

From the tomato in the logo - alerts and warnings

- **Danger**: `#E94B4B`
- **Danger Dark**: `#D13333`
- **Danger Light**: `#F07777`
- **Danger Very Light**: `#FDEAEA`

### Text - Dark Green

From the "Portionist" wordmark

- **Text Primary**: `#2D5016` - Dark green text
- **Text Secondary**: `#6B7280` - Gray text

### Neutrals

- **White**: `#FFFFFF`
- **Cream**: `#FFFCF9` - Warm white
- **Warm White**: `#FDFEFB` - Background alternative
- **Gray 50-900**: Standard gray scale

---

## 🎯 Usage Guidelines

### Primary Forest Green (#5C8A6F)

Use for:

- Navigation headers
- Main action buttons
- Active drawer items
- Primary CTAs
- Loading indicators

### Secondary Lime Green (#A8D24E)

Use for:

- Fresh ingredient highlights
- Energy/vitality indicators
- Secondary buttons
- Accent decorations

### Accent Orange (#FF9933)

Use for:

- Special highlights
- Badges
- Energy indicators
- Warm accents

### Success Green (#6BBF59)

Use for:

- Selected ingredients
- Successful actions
- Positive feedback
- Health metrics

### Danger Red (#E94B4B)

Use for:

- Delete/remove actions
- Error states
- Warnings
- Critical alerts

---

## 📱 Applied To

✅ **Updated Components**:

- **Theme Configuration** (`constants/theme.ts`) - Complete BrandColors palette
- **Dashboard** - Green gradient header, green refresh indicator
- **Navigation Drawer** - Green header, green active states
- **Profile Screen** - Green buttons and accents
- **Recipe Input** - Green CTAs and indicators

🔄 **Auto-inherit from BrandColors**:

- All screens using `BrandColors.primary`
- All screens using `BrandColors.success`
- All screens using `BrandColors.danger`

---

## 🔄 Migration from Orange Theme

**Previous (Orange-based)** → **Current (Green-based from logo)**:

- `#FF6B35` (orange) → `#5C8A6F` (forest green)
- `#E55525` (dark orange) → `#4A7059` (dark green)
- `#FFE8DF` (light orange) → `#E8F3ED` (light green)
- Accent colors now use `#FF9933` (carrot orange)
- Success uses `#6BBF59` (fresh green)
- Danger uses `#E94B4B` (tomato red)

---

## 📦 Implementation

All brand colors are defined in `/constants/theme.ts`:

```typescript
import { BrandColors } from "../../constants/theme";

// Usage examples:
backgroundColor: BrandColors.primary,        // Forest green
color: BrandColors.textPrimary,              // Dark green text
borderColor: BrandColors.secondary,          // Lime green
backgroundColor: BrandColors.accent,         // Carrot orange
```

---

## 🎨 Design Philosophy

The Portionist brand embodies:

1. **Fresh & Natural** - Green tones from the bowl represent fresh, wholesome ingredients
2. **Balanced Nutrition** - Multiple vegetable colors show variety and balance
3. **Portion Control** - The bowl itself symbolizes measured servings
4. **Health-Focused** - Green as the primary color emphasizes wellness
5. **Approachable** - Warm orange accents make nutrition feel accessible
6. **Vibrant & Alive** - Bright lime green brings energy and vitality

The logo-first approach ensures all brand touchpoints maintain visual consistency with the core identity.
