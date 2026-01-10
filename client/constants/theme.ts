import { Platform } from "react-native";

export const BrandColors = {
  primaryBlue: "#1C6BF9",
  secondaryBlue: "#1C6BF9",
  deepNavy: "#1A2332",
  successGreen: "#00C48C",
  alertRed: "#FF4757",
  skyBlue: "#4A90E2",
  warning: "#FFA726",
};

const tintColorLight = BrandColors.primaryBlue;
const tintColorDark = BrandColors.primaryBlue;

export const Colors = {
  light: {
    text: BrandColors.deepNavy,
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    link: BrandColors.skyBlue,
    primary: BrandColors.primaryBlue,
    success: BrandColors.successGreen,
    error: BrandColors.alertRed,
    warning: BrandColors.warning,
    backgroundRoot: "#F8F9FA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F2F2F2",
    backgroundTertiary: "#E5E8EB",
    border: "#E5E8EB",
    cardBackground: "#FFFFFF",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: BrandColors.skyBlue,
    primary: BrandColors.primaryBlue,
    success: BrandColors.successGreen,
    error: BrandColors.alertRed,
    warning: BrandColors.warning,
    backgroundRoot: "#1A2332",
    backgroundDefault: "#242B38",
    backgroundSecondary: "#2E3644",
    backgroundTertiary: "#3A4556",
    border: "#3A4556",
    cardBackground: "#242B38",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
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
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
