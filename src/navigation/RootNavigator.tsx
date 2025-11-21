import { memo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthNavigator } from '@/features/auth/navigation/AuthNavigator';
import { MainNavigator } from '@/navigation/MainNavigator';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

const Stack = createStackNavigator();

export const RootNavigator = memo(() => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
});

RootNavigator.displayName = 'RootNavigator';
