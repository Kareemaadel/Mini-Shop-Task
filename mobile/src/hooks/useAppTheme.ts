import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { palettes, spacing, borderRadius, typography, shadows } from '../theme';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useThemeStore();

  const isDark =
    themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const colors = isDark ? palettes.dark : palettes.light;
  const currentShadows = isDark ? shadows.dark : shadows.light;

  return {
    isDark,
    colors,
    spacing,
    borderRadius,
    typography,
    shadows: currentShadows,
  };
}
