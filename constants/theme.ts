/**
 * Freepass app theme - Fountain Fund blue & green palette.
 * Primary: dark navy blue for headers and brand.
 * Accent: green for CTAs and highlights.
 */

import { Platform } from 'react-native';

export const FreepassColors = {
  primary: '#1A3A5C',       // Dark navy blue - headers, primary buttons
  primaryDark: '#122945',    // Deeper navy - modals, secondary areas
  accent: '#2E8540',         // Fountain Fund green - accent, primary actions
  accentLight: '#4CAF50',    // Lighter green - highlights, CTAs
  destructive: '#C0392B',    // Red - delete actions
  white: '#FFFFFF',
  offWhite: '#F5F7FA',       // Cool off-white - input backgrounds
  lightGray: '#E0E4E8',
  text: '#1A2A3A',
  textSecondary: '#4A5568',
  cardBg: '#EDF2F7',
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
