export const colors = {
  primary: '#6C5CE7',
  primaryDark: '#5849C7',
  primaryLight: '#A29BFE',
  
  secondary: '#00B894',
  secondaryDark: '#00967D',
  
  accent: '#FD79A8',
  
  background: '#F8F9FA',
  surface: '#FFFFFF',
  
  text: {
    primary: '#2D3436',
    secondary: '#636E72',
    tertiary: '#B2BEC3',
    inverse: '#FFFFFF',
  },
  
  error: '#D63031',
  success: '#00B894',
  warning: '#FDCB6E',
  info: '#74B9FF',
  
  border: '#DFE6E9',
  divider: '#ECEFF1',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

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
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
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
