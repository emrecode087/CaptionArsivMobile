import { useColorScheme } from 'react-native';
import { useUIStore } from '../stores/useUIStore';
import { lightColors, darkColors } from './tokens';

export const useTheme = () => {
  const themeMode = useUIStore((state) => state.themeMode);
  const systemColorScheme = useColorScheme();

  const isDark = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    themeMode,
    setThemeMode: useUIStore((state) => state.setThemeMode),
  };
};
