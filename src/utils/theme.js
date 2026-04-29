import useStore from '../store/useStore';

export const darkColors = {
  background: '#09090B',
  surface: '#18181B',
  surfaceLight: '#27272A', 
  primary: '#F43F5E',
  secondary: '#3B82F6',
  tertiary: '#10B981',
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  border: '#27272A',
  error: '#EF4444',
};

export const lightColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceLight: '#F4F4F5', 
  primary: '#F43F5E',
  secondary: '#3B82F6',
  tertiary: '#10B981',
  text: '#09090B',
  textSecondary: '#71717A',
  border: '#E4E4E7',
  error: '#EF4444',
};

// Legacy fallback for files not yet refactored
export const colors = darkColors;

export const useThemeColors = () => {
  const theme = useStore(state => state.theme);
  return theme === 'light' ? lightColors : darkColors;
};

export const gradients = {
  primary: ['#F43F5E', '#E11D48'],
  secondary: ['#3B82F6', '#2563EB'],
  tertiary: ['#10B981', '#059669'],
  darkGlass: ['rgba(24, 24, 27, 0.8)', 'rgba(9, 9, 11, 0.95)'],
};

// Typography now uses the loaded Outfit fonts
export const typography = {
  h1: { fontFamily: 'Outfit_800ExtraBold', fontSize: 34, letterSpacing: -0.5 },
  h2: { fontFamily: 'Outfit_700Bold', fontSize: 24, letterSpacing: -0.5 },
  h3: { fontFamily: 'Outfit_600SemiBold', fontSize: 20 },
  body: { fontFamily: 'Outfit_400Regular', fontSize: 16, lineHeight: 24 },
  bodySecondary: { fontFamily: 'Outfit_400Regular', fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 12,
  md: 20,
  lg: 32,
  pill: 999,
};

export const shadows = {
  glowPrimary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glowSecondary: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }
};
