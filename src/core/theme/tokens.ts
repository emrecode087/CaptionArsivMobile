const palette = {
  black: '#000000',
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  gray950: '#121212',
} as const;

export const lightColors = {
  primary: palette.black,
  primaryDark: palette.gray800,
  primaryLight: palette.gray600,
  
  secondary: palette.gray700,
  secondaryDark: palette.gray900,
  
  accent: palette.gray800,
  
  background: palette.white,
  surface: palette.white,
  surfaceHighlight: palette.gray50,
  
  text: {
    primary: palette.black,
    secondary: palette.gray600,
    tertiary: palette.gray400,
    inverse: palette.white,
  },
  
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#FBC02D',
  info: '#1976D2',
  
  border: palette.gray300,
  divider: palette.gray200,
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export const darkColors = {
  primary: palette.white,
  primaryDark: palette.gray200,
  primaryLight: palette.gray400,
  
  secondary: palette.gray400,
  secondaryDark: palette.gray200,
  
  accent: palette.gray200,
  
  background: palette.black,
  surface: palette.gray950,
  surfaceHighlight: palette.gray900,
  
  text: {
    primary: palette.white,
    secondary: palette.gray400,
    tertiary: palette.gray600,
    inverse: palette.black,
  },
  
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFF176',
  info: '#42A5F5',
  
  border: palette.gray800,
  divider: palette.gray800,
  
  overlay: 'rgba(255, 255, 255, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.5)',
} as const;

// Deprecated: Use useTheme hook instead
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;
