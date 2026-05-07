import React from 'react';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProviderWithViewport } from '../ui/fragments/custom-ui/toast';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, AppStateStatus, Platform } from 'react-native';
type ComponentProps = {
  children?: React.ReactNode;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

export default function Provider({ children }: ComponentProps) {
  const { colorScheme } = useColorScheme();
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    });
    return () => subscription.remove();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProviderWithViewport>{children}</ToastProviderWithViewport>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
