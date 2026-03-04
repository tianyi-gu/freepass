/**
 * Freepass app theme - warm, earthy palette for reintegration resources.
 * Primary: reddish-brown/sienna for headers and brand.
 */

import { Platform } from 'react-native';

export const FreepassColors = {
  primary: '#8B4513',      // Saddle brown - headers, primary buttons
  primaryDark: '#6B3410',   // Darker brown - modals, secondary areas
  accent: '#D2691E',        // Chocolate orange - accent, primary actions
  accentLight: '#E8A75C',   // Lighter orange - highlights
  destructive: '#C0392B',   // Red - delete actions
  white: '#FFFFFF',
  offWhite: '#FDF8F3',      // Cream - input backgrounds
  lightGray: '#E8E4E0',
  text: '#2C2419',
  textSecondary: '#5C5248',
  cardBg: '#F5F0EB',
} as const;

const tintColorLight = FreepassColors.accent;
const tintColorDark = FreepassColors.accentLight;

export const Colors = {
  light: {
    text: FreepassColors.text,
    background: FreepassColors.white,
    tint: tintColorLight,
    icon: FreepassColors.textSecondary,
    tabIconDefault: FreepassColors.textSecondary,
    tabIconSelected: tintColorLight,
    primary: FreepassColors.primary,
    accent: FreepassColors.accent,
    card: FreepassColors.cardBg,
  },
  dark: {
    text: FreepassColors.offWhite,
    background: FreepassColors.primaryDark,
    tint: tintColorDark,
    icon: FreepassColors.accentLight,
    tabIconDefault: FreepassColors.textSecondary,
    tabIconSelected: tintColorDark,
    primary: FreepassColors.primary,
    accent: FreepassColors.accent,
    card: FreepassColors.primaryDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
