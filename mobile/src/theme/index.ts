export const theme = {
  colors: {
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#818CF8',
    primaryDark: '#3730A3',
    secondary: '#10B981', // Emerald 500
    background: '#F9FAFB', // Gray 50
    card: '#FFFFFF',
    text: '#111827', // Gray 900
    textSecondary: '#6B7280', // Gray 500
    border: '#E5E7EB', // Gray 200
    error: '#EF4444', // Red 500
    success: '#10B981',
    warning: '#F59E0B',
    white: '#FFFFFF',
    skeleton: '#E5E7EB',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, color: '#111827' },
    h2: { fontSize: 24, fontWeight: '700' as const, color: '#111827' },
    h3: { fontSize: 20, fontWeight: '600' as const, color: '#111827' },
    body: { fontSize: 16, color: '#111827' },
    bodySecondary: { fontSize: 16, color: '#6B7280' },
    caption: { fontSize: 14, color: '#6B7280' },
    small: { fontSize: 12, color: '#6B7280' },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
  },
};
