export const palettes = {
  light: {
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#818CF8',
    primaryDark: '#3730A3',
    secondary: '#10B981', // Emerald 500
    background: '#F8FAFC', // Slate 50
    card: '#FFFFFF',
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    border: '#E2E8F0', // Slate 200
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    white: '#FFFFFF',
    skeleton: '#E2E8F0',
    surfaceTint: 'rgba(255, 255, 255, 0.7)',
  },
  dark: {
    primary: '#818CF8', // Indigo 400
    primaryLight: '#A5B4FC',
    primaryDark: '#4F46E5',
    secondary: '#34D399', // Emerald 400
    background: '#0F172A', // Slate 900
    card: '#1E293B', // Slate 800
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    border: '#334155', // Slate 700
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    white: '#FFFFFF',
    skeleton: '#334155',
    surfaceTint: 'rgba(30, 41, 59, 0.7)',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0.1 },
  bodySecondary: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  small: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const shadows = {
  light: {
    sm: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    md: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
    lg: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  },
  dark: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  }
};

// Fallback for files still importing `theme.colors` directly (we will refactor them)
export const theme = {
  colors: palettes.light,
  spacing,
  borderRadius,
  typography,
  shadows: shadows.light,
};
