/**
 * Portionist Brand Colors
 * Colors extracted from the Portionist logo - a green bowl with fresh vegetables
 */

import { Platform } from "react-native";

const tintColorLight = "#5C8A6F";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

// Portionist Brand Color Palette (from logo)
export const BrandColors = {
  // Primary - Forest Green (from the bowl exterior)
  primary: "#5C8A6F",
  primaryDark: "#ceffe2",
  primaryLight: "#7ba58a",
  primaryVeryLight: "#E8F3ED",
  primaryBackground: "#F5FAF7",

  // Secondary - Lime Green (from fresh leaves)
  secondary: "#A8D24E",
  secondaryDark: "#40541f",
  secondaryLight: "#C4E17F",
  secondaryVeryLight: "#F0F9E3",
  secondaryBackground: "#F7FCF0",

  // Accent - Carrot Orange (from vegetables)
  accent: "#FF9933",
  accentDark: "#E67E1A",
  accentLight: "#FFB366",
  accentVeryLight: "#FFF0E0",

  // Success - Fresh Vegetable Green
  success: "#6BBF59",
  successDark: "#52A03F",
  successLight: "#8FD882",
  successVeryLight: "#E8F8E5",

  // Danger - Tomato Red (from logo tomato)
  danger: "#E94B4B",
  dangerDark: "#D13333",
  dangerLight: "#F07777",
  dangerVeryLight: "#FDEAEA",

  // Neutrals
  white: "#FFFFFF",
  cream: "#FFFCF9",
  warmWhite: "#FDFEFB",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Text (dark green from logo text)
  textPrimary: "#2D5016",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  textWhite: "#FFFFFF",
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
