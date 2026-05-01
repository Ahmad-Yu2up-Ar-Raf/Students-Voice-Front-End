import { cn } from '@/lib/utils';
import { Text } from '../../shadcn-ui/text';
import React, { forwardRef, ReactElement, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Pressable,
  TextInput as TextInputB,
  TextInputProps,
  View,
  TextStyle,
  ViewStyle,
  Keyboard,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { Input } from '../../shadcn-ui/input';
import { Textarea } from '../../shadcn-ui/textarea';

// ============================================
// GroupedInput Component
// ============================================
export interface GroupedInputProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleStyle?: TextStyle;
}

export const GroupedInput = ({ children, className, title, titleStyle }: GroupedInputProps) => {
  return (
    <View className={cn('h-fit w-fit', className)}>
      <View className="gap-6">{children}</View>
    </View>
  );
};

// ============================================
// GroupedInputItem Component with Smooth Animation
// ============================================
export interface GroupedInputItemProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  rightComponent?: React.ReactNode | (() => React.ReactNode);
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  disabled?: boolean;
  type?: 'input' | 'textarea';
  rows?: number;
  showError?: boolean;
}

export const GroupedInputItem = forwardRef<TextInputB, GroupedInputItemProps>(
  (
    {
      showError = true,
      label,
      error,
      rightComponent,
      inputStyle,
      labelStyle,
      errorStyle,
      disabled,
      type = 'input',
      rows = 3,
      onFocus,
      onBlur,
      placeholder,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const { colorScheme } = useColorScheme();

    const themeColors = useMemo(() => {
      const currentTheme = colorScheme ?? 'light';
      return {
        primary: '#03a1fc',
        mutedForeground: THEME[currentTheme].mutedForeground,
        destructive: THEME[currentTheme].destructive,
        background: THEME[currentTheme].card,
      };
    }, [colorScheme]);

    const isTextarea = type === 'textarea';
    const shouldFloat = isFocused || (value && value.toString().length > 0);

    // ✅ FIX: Simple CSS-based animated label (NO Reanimated = NO infinite loops!)
    const animatedLabelStyle = {
      transform: shouldFloat
        ? [{ translateY: -10 }, { scale: 0.75 }]
        : [{ translateY: 10 }, { scale: 1 }],
      color: error ? themeColors.destructive : themeColors.mutedForeground,
    };

    // ✅ FIX #3: Focus handler
    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    // ✅ FIX #4: Blur handler
    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    // ✅ FIX #5: Handle Pressable press
    const handlePressablePress = useCallback(() => {
      if (disabled) return;
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      } else {
        setTimeout(() => {
          if (ref && 'current' in ref && ref.current) {
            ref.current.focus();
          }
        }, 100);
      }
    }, [ref, disabled]);

    const renderRightComponent = useCallback(() => {
      if (!rightComponent) return null;
      return typeof rightComponent === 'function' ? rightComponent() : rightComponent;
    }, [rightComponent]);

    return (
      <Pressable
        onPress={handlePressablePress}
        disabled={disabled}
        className={cn(disabled ? 'opacity-60' : 'opacity-100')}>
        <View className="flex flex-col gap-1.5">
          <View
            className={cn(
              'relative flex-row items-center rounded-xl border',
              error ? 'border-destructive' : isFocused ? 'border-blue-500' : 'border-border'
            )}>
            <View className="relative flex-1">
              {/* Simple CSS-based Floating Label (NO Reanimated) */}
              {label && (
                <Text
                  style={[
                    {
                      position: 'absolute',
                      left: 12,
                      paddingHorizontal: 4,
                      zIndex: 1,
                      fontSize: 15,
                      fontWeight: '400',
                    },
                    animatedLabelStyle,
                  ]}
                  className={cn(
                    'bg-transparent transition-all duration-300 ease-out',
                    isFocused && 'bg-background'
                  )}>
                  {label}
                </Text>
              )}

              {isTextarea ? (
                <Textarea
                  ref={ref}
                  editable={!disabled}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  value={value}
                  className={cn(
                    'border-0 bg-transparent',
                    error && 'text-destructive',
                    label && 'pt-1.5'
                  )}
                  {...props}
                />
              ) : (
                <Input
                  ref={ref}
                  editable={!disabled}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  value={value}
                  className={cn(
                    'border-0 bg-transparent',
                    error && 'text-destructive',
                    label && 'pt-1.5'
                  )}
                  {...props}
                />
              )}
            </View>
            {renderRightComponent()}
          </View>

          {error && showError && <Text className="mt-1 text-sm text-destructive">* {error}</Text>}
        </View>
      </Pressable>
    );
  }
);

// ============================================
// SET DISPLAYNAME
// ============================================
GroupedInputItem.displayName = 'GroupedInputItem';
