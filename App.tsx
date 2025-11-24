import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import 'react-native-gesture-handler';

import { AppProviders } from '@/app/providers/AppProviders';
import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/navigation/navigationRef';
import { useTheme } from '@/core/theme/useTheme';
import { lightColors, darkColors } from '@/core/theme/tokens';

function AppContent() {
  const { isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: isDark ? darkColors.primary : lightColors.primary,
      background: isDark ? darkColors.background : lightColors.background,
      card: isDark ? darkColors.surface : lightColors.surface,
      text: isDark ? darkColors.text.primary : lightColors.text.primary,
      border: isDark ? darkColors.border : lightColors.border,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? darkColors.background : lightColors.background} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
