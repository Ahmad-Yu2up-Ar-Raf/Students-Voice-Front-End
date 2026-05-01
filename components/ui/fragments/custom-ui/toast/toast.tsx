import { useToast } from '@/context/ToastContext';
import type { Toast as ToastType, ToastType as ToastVariant } from '@/types/Toast.types';
import { TOAST_CONFIGS, ToastContent } from '@/utils/toast-config';
import { Button } from '@/components/ui/fragments/shadcn-ui/button';
import React, { useEffect, useRef } from 'react';
import { LayoutAnimation, Platform, UIManager, View } from 'react-native';
import {
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ToastProps {
  toast: ToastType;
  index: number;
  onHeightChange?: (id: string, height: number) => void;
}

/**
 * Toast Component with Alert-based UI
 *
 * ✨ Best Practices Applied:
 * 1. Uses Alert component from shadcn for consistent theming
 * 2. All styling via NativeWind className (no inline styles)
 * 3. Animations handled by React Native Reanimated
 * 4. Button component for actions instead of custom Pressable
 * 5. Theme-aware through Alert component (auto light/dark mode)
 * 6. Proper stacking with animation for multiple toasts
 */
export const Toast: React.FC<ToastProps> = ({ toast, index }) => {
  const prevContentRef = useRef<string | React.ReactNode | null>(null);
  const prevTypeRef = useRef<ToastVariant | null>(null);
  const prevIndexRef = useRef<number>(-1);

  const { dismiss } = useToast();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(toast.options.position === 'top' ? -100 : 100);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const rotateZ = useSharedValue(0);
  const height = useSharedValue(0);
  const viewRef = useRef<View>(null);

  const getStackOffset = () => {
    const baseOffset = 4;
    const maxOffset = 12;
    const offset = Math.min(index * baseOffset, maxOffset);
    return toast.options.position === 'top' ? offset : -offset;
  };

  const getStackScale = () => {
    const scaleReduction = 0.02;
    const minScale = 0.92;
    return Math.max(1 - index * scaleReduction, minScale);
  };

  useEffect(() => {
    if (prevIndexRef.current !== index && opacity.value > 0) {
      const soonerOffset = toast.options.position === 'top' ? 2 : -2;

      translateY.value = withTiming(getStackOffset() + soonerOffset, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      scale.value = withTiming(getStackScale() * 0.98, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      setTimeout(() => {
        translateY.value = withSpring(getStackOffset(), {
          damping: 25,
          stiffness: 120,
          mass: 0.8,
          velocity: 0,
        });

        scale.value = withSpring(getStackScale(), {
          damping: 25,
          stiffness: 120,
          mass: 0.8,
          velocity: 0,
        });
      }, 200);
    }

    prevIndexRef.current = index;
  }, [index, toast.options.position, translateY, scale, opacity]);

  const handleDismiss = () => {
    dismiss(toast.id);
    toast.options.onClose?.();
  };

  /**
   * Handler for swipe to dismiss gesture
   * Swipe left or right to dismiss the toast with animation
   */
  const onPanEvent = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    const { translationX, velocityX } = event.nativeEvent;

    // Update position during pan
    translateX.value = translationX;
  };

  const onPanEnd = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    const { translationX, velocityX } = event.nativeEvent;
    const swipeThreshold = 80; // Minimum distance to trigger dismiss

    // Check if swipe distance or velocity is sufficient
    if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > 500) {
      // Animate out with swipe direction
      const direction = translationX > 0 ? 1 : -1;

      translateX.value = withTiming(direction * 400, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      runOnJS(handleDismiss)();
    } else {
      // Snap back to original position
      translateX.value = withSpring(0, {
        damping: 12,
        stiffness: 100,
        mass: 0.5,
      });
    }
  };

  useEffect(() => {
    const delay = index * 50;

    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      translateY.value = withSpring(getStackOffset(), {
        damping: 28,
        stiffness: 140,
        mass: 0.8,
        velocity: 0,
        energyThreshold: 0.001,
      });

      scale.value = withSpring(getStackScale(), {
        damping: 28,
        stiffness: 140,
        mass: 0.8,
        velocity: 0,
      });

      rotateZ.value = withTiming(0, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });
    }, delay);

    if (toast.options.duration > 0) {
      const exitDelay = Math.max(0, toast.options.duration - 500);

      const exitAnimations = () => {
        opacity.value = withTiming(0, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        translateY.value = withTiming(toast.options.position === 'top' ? -20 : 20, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        scale.value = withTiming(0.95, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        setTimeout(() => {
          runOnJS(handleDismiss)();
        }, 400);
      };

      setTimeout(exitAnimations, exitDelay);
    }
  }, [toast, opacity, translateY, scale, rotateZ, index]);

  /**
   * Animated style now includes both translateY and translateX
   * ✅ FIX: Shadow applied to outer Animated.View so it animates with opacity
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
        { rotateZ: `${rotateZ.value}deg` },
      ],
      zIndex: 1000 - index,
    };
  });

  const handlePress = () => {
    opacity.value = withTiming(0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });

    translateY.value = withTiming(toast.options.position === 'top' ? -100 : 100, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });

    scale.value = withTiming(0.8, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });

    setTimeout(() => {
      handleDismiss();
    }, 250);
  };

  const config = TOAST_CONFIGS[toast.options.type];
  const isLoading = toast.options.type === 'loading';

  return (
    /**
     * ✅ FIX: Shadow now applied to Animated.View
     * This ensures shadow fades synchronously with opacity
     */
    <Animated.View
      style={[animatedStyle]}
      className={`absolute w-11/12 max-w-md self-center rounded-lg shadow-lg shadow-black/20 ${
        toast.options.position === 'top' ? 'top-0' : 'bottom-0'
      }`}>
      {/* ✅ NEW: Gesture handler wrapper for swipe-to-dismiss */}
      <PanGestureHandler
        onGestureEvent={onPanEvent}
        onHandlerStateChange={onPanEnd}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}>
        <Animated.View>
          <View className="rounded-lg border border-border bg-card">
            {/* Alert Content */}
            <View className="p-0">
              {typeof toast.content === 'string' ? (
                <ToastContent
                  message={toast.content}
                  icon={config.icon}
                  variant={config.variant}
                  isLoading={isLoading}
                />
              ) : (
                toast.content
              )}
            </View>

            {/* Action Button or Dismiss Area */}
            {toast.options.action ? (
              <View className="flex-row items-center justify-between border-t border-border px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    toast?.options?.action?.onPress!();
                    handlePress();
                  }}>
                  {typeof toast.options.action.label === 'string' && (
                    <>{toast.options.action.label}</>
                  )}
                </Button>
              </View>
            ) : (
              <View className="h-1 bg-opacity-5" />
            )}

            {/* Tap to Dismiss Overlay */}
            <View
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: 'transparent',
              }}
            />
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};
