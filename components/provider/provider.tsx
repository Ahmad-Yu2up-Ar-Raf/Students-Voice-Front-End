import React from 'react';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProviderWithViewport } from '../ui/fragments/custom-ui/toast';

type ComponentProps = {
  children?: React.ReactNode;
};

export default function Provider({ children }: ComponentProps) {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {/* ✅ REMOVED: <Stack /> - Navigator seharusnya HANYA di app/_layout.tsx */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProviderWithViewport>{children}</ToastProviderWithViewport>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
