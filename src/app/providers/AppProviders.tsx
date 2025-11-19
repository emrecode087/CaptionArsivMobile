import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

const useReactQueryFocusManager = () => {
  useEffect(() => {
    const onStateChange = (state: AppStateStatus) => {
      focusManager.setFocused(state === 'active');
    };

    const subscription = AppState.addEventListener('change', onStateChange);

    return () => {
      subscription.remove();
    };
  }, []);
};

export const AppProviders = ({ children }: PropsWithChildren) => {
  useReactQueryFocusManager();

  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </QueryClientProvider>
  );
};
