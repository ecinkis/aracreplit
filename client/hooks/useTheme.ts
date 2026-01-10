import { Colors, BrandColors } from "@/constants/theme";

export function useTheme() {
  // Always use light mode - app design is based on white background
  const isDark = false;
  const theme = Colors.light;

  return {
    theme,
    brand: BrandColors,
    isDark,
  };
}
