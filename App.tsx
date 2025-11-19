import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';

import { AppProviders } from '@/app/providers/AppProviders';
import { AuthNavigator } from '@/features/auth/navigation/AuthNavigator';

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </AppProviders>
  );
}
