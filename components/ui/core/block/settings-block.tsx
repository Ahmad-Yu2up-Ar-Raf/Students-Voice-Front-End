import React from 'react';
import { Wrapper } from '../layout/wrapper';

import { Stack } from 'expo-router';
import { SCREEN_OPTIONS } from '../layout/nav';

import {
  Bell,
  ChevronLeft,
  Edit,
  LogOutIcon,
  Moon,
  Pen,
  Pencil,
  PenLine,
  Settings,
  Share2,
  Shield,
} from 'lucide-react-native';
import { View } from 'react-native';
import { Button } from '../../fragments/shadcn-ui/button';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { Text } from '../../fragments/shadcn-ui/text';
import { cn } from '@/lib/utils';
import { MenuDetail } from '@/types';
import { Switch } from '../../fragments/shadcn-ui/switch';
import MenuCard from '../../fragments/custom-ui/card/menu-card';
export default function SettingsBlock() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const menuDetails2: MenuDetail[] = [
    {
      Label: 'Settings',
      icon: Settings,
    },

    {
      Label: 'Dark Mode',
      icon: Moon,
      rigthComponent: (
        <Switch
          checked={colorScheme === 'dark'}
          onCheckedChange={toggleColorScheme}
          id="toggle-dark-mode"
          nativeID="toggle-dark-mode"
        />
      ),

      onPress: toggleColorScheme,
    },

    {
      Label: 'Mode liburan',
      icon: Bell,
    },
  ];

  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].primaryForeground;
  function onSignOut() {
    console.log('hellow');
  }
  return (
    <>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          title: 'Settings',
          leftIcon: ChevronLeft,
          rightIcon: Settings,
        })}
      />
      <Wrapper
        className="flex-1 content-start items-start justify-start gap-0 pt-11"
        edges={['bottom', 'left', 'right']}>
        {/* <View className="w-full gap-6">
          <View className="relative w-fit">
            <UserAvatar className="m-auto size-24 rounded-full" />
            <Button
              size={'icon'}
              className="absolute bottom-1/2 left-1/2 top-2 m-auto -mt-4 size-10 translate-x-5 transform rounded-full border-4 border-background p-2">
              <Icon color={tintColor} as={Pencil} className="size-full text-primary-foreground" />
            </Button>
          </View>
          <View className="w-full gap-2">
            <Text
              variant={'h3'}
              className="font-poppins_semibold text-center text-2xl tracking-tighter">
              {title}
            </Text>
            <Text
              variant={'small'}
              className="font-poppins_medium text-center text-sm tracking-tighter text-muted-foreground/60">
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View> */}
        <MenuCard MenuList={menuDetails2} onSignOut={onSignOut} />
      </Wrapper>
    </>
  );
}
