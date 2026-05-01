import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { Bell, PlusIcon, type LucideIcon } from 'lucide-react-native';
import { Button } from '../../fragments/shadcn-ui/button';
import { LogoAdaptive } from '../../fragments/svg/logo-app';
import { MenuSheet } from './menu-sheet';

import { Icon } from '../../fragments/shadcn-ui/icon';

import { router } from 'expo-router';

import { cn } from '@/lib/utils';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export interface ScreenOptionsParams {
  title?: string;
  transparent?: boolean;
  leftIcon?: LucideIcon;
  leftAction?: () => void;
  rightIcon?: LucideIcon;
  id?: number;
  RigthComponent?: React.ReactNode | undefined;
  rightAction?: () => void;
  rigthIconClassName?: string;
  children?: React.ReactNode;
  surahSetelahnya?: { id: number; namaLatin: string } | null;
  surahSebelumnya?: { id: number; namaLatin: string } | null;
  isFullPlaying?: boolean;
  className?: string;
  scrollAnimatedPosition?: SharedValue<number>;
  border?: boolean;
  scrollTriggerPoint?: number;
  scrollAnimationType?: 'fade' | 'slide' | 'scale';
}

interface HeaderComponentProps extends ScreenOptionsParams {}

function HeaderComponent({
  title,
  transparent = true,
  RigthComponent,
  leftIcon: LeftIcon,
  leftAction,
  children,
  rightIcon: RightIcon,
  rightAction,
  rigthIconClassName,
  id,
  scrollAnimatedPosition,
  border = false,
  className,
  scrollTriggerPoint = 100,
  scrollAnimationType = 'slide',
}: HeaderComponentProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';

  const handleLeave = () => {
    router.back();
  };

  const bgColor = transparent ? 'transparent' : THEME[currentTheme].background;

  const animatedTitleStyle = useScrollAnimation(
    scrollAnimatedPosition,
    scrollTriggerPoint,
    scrollAnimationType
  );

  return (
    <>
      <View
        style={{ paddingTop: insets.top + 4, backgroundColor: bgColor }}
        className={cn('relative flex-row items-center justify-between px-4 pb-3')}>
        {/* Left Section */}
        <View className="z-10 w-10 items-start">
          {LeftIcon ? (
            <Button
              variant={'ghost'}
              onPress={leftAction ?? handleLeave}
              size="icon"
              className="size-12 rounded-full">
              <Icon as={LeftIcon} className="size-6" />
            </Button>
          ) : (
            <Button
              onPress={() => {
                router.push('/post');
              }}
              variant="ghost"
              size="icon"
              className={cn('size-10', rigthIconClassName)}>
              <Icon as={PlusIcon} className="size-5" />
            </Button>
          )}
        </View>

        <View
          className="absolute inset-0 top-1/2 -translate-y-4 transform items-center justify-center px-5 pb-0"
          style={{ paddingTop: insets.top + 3 }}>
          {title || scrollAnimatedPosition ? (
            <Animated.View
              style={animatedTitleStyle}
              className="flex-1 items-center justify-center">
              <Text
                variant="h4"
                className="line-clamp-1 text-center font-poppins_medium text-xl tracking-tighter"
                numberOfLines={1}>
                {title}
              </Text>
            </Animated.View>
          ) : (
            <View className="items-center justify-center gap-7 text-center">
              <View className="w-fit flex-row items-center gap-1.5">
                <View className="size-12 scale-[.70]">
                  <LogoAdaptive />
                </View>

                <Text
                  variant="h4"
                  className="text-center font-poppins_semibold text-base tracking-tighter">
                  FogyNotion
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Right Section */}
        <View className="z-10 items-end">
          {RigthComponent ? (
            RigthComponent
          ) : RightIcon ? (
            <Button
              variant={'ghost'}
              onPress={rightAction ?? handleLeave}
              size="icon"
              className={cn(`size-10 rounded-full`, rigthIconClassName)}>
              <Icon as={RightIcon} className="size-5" />
            </Button>
          ) : (
            <Button
              onPress={() => {
                router.push('/');
              }}
              variant="ghost"
              size="icon"
              className={cn('size-10', rigthIconClassName)}>
              <Icon as={Bell} className="size-5" />
            </Button>
          )}
        </View>
      </View>

      {children}
    </>
  );
}
interface HeaderComponentProps extends ScreenOptionsParams {}

export const SCREEN_OPTIONS = ({
  title,
  transparent = true,
  leftIcon,
  leftAction,
  rightIcon,
  RigthComponent,
  rightAction,
  children,
  scrollAnimatedPosition,
  scrollTriggerPoint,
  scrollAnimationType,
}: ScreenOptionsParams) => ({
  headerShown: true,

  header: () => (
    <HeaderComponent
      title={title}
      transparent={transparent}
      leftIcon={leftIcon}
      leftAction={leftAction}
      rightIcon={rightIcon}
      RigthComponent={RigthComponent}
      children={children}
      rightAction={rightAction}
      scrollAnimatedPosition={scrollAnimatedPosition}
      scrollTriggerPoint={scrollTriggerPoint}
      scrollAnimationType={scrollAnimationType}
    />
  ),
});
