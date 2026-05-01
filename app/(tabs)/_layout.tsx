// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';
import HomeIcon from '@/components/ui/fragments/svg/icons/home-icon';

import { cn } from '@/lib/utils';

import MessageIcon from '@/components/ui/fragments/svg/icons/message-icon';
import ReelsIcon from '@/components/ui/fragments/svg/icons/reels-icon';
import UserAvatar from '@/components/ui/core/feauture/auth/user-avatar';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].primary;
  const backgroundColor = THEME[currentTheme].card;
  const mutedForeground = THEME[currentTheme].mutedForeground;
  const inactiveTintColor = THEME[currentTheme].mutedForeground;

  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tintColor,

          tabBarInactiveTintColor: inactiveTintColor,
          tabBarStyle: {
            backgroundColor,

            height: 60 + insets.bottom,
            paddingTop: 10,
            display: 'flex',
            alignItems: 'center',
            paddingHorizontal: 0,
            borderTopWidth: 0.5,
            borderTopColor: THEME[currentTheme].background,
            shadowColor: mutedForeground,
            shadowOffset: {
              width: 2,
              height: 0,
            },
            shadowOpacity: 20.1,
            shadowRadius: 2.84,
            elevation: 3,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarShowLabel: false,

            tabBarIcon: ({ color, focused }) => (
              <HomeIcon
                fill={focused ? tintColor : 'none'}
                stroke={focused ? 'none' : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reels"
          options={{
            title: 'Reels',
            tabBarShowLabel: false,

            tabBarIcon: ({ color, focused }) => (
              <ReelsIcon
                backgroundColor={backgroundColor}
                fill={focused ? tintColor : 'none'}
                stroke={focused ? 'none' : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="message"
          options={{
            headerShown: false,
            title: 'Message',
            tabBarShowLabel: false,

            tabBarIcon: ({ color, focused }) => {
              return (
                <>
                  <MessageIcon
                    primary={tintColor}
                    background={backgroundColor}
                    fill={focused ? tintColor : 'none'}
                    stroke={focused ? backgroundColor : inactiveTintColor}
                  />
                </>
              );
            },
          }}
        />
        <Tabs.Screen
          name="discovery"
          options={{
            headerShown: false,
            title: 'Discovery',
            tabBarShowLabel: false,

            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={26} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: 'Profile',
            tabBarShowLabel: false,

            tabBarIcon: ({ color, focused }) => (
              <UserAvatar className={cn('size-7', focused && 'size-8 border-2 border-primary')} />
            ),
          }}
        />

        {/* Tab lainnya... */}
      </Tabs>
    </>
  );
}
