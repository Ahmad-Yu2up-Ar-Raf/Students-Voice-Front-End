import { useToast } from '@/context/ToastContext';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from './toast';

/**
 * Toast Viewport Component
 *
 * ✨ Best Practice: Renders all toasts in two separate containers
 * - Top toasts: positioned at top with safe area insets
 * - Bottom toasts: positioned at bottom with safe area insets
 * - All styling via NativeWind className (no StyleSheet)
 * - Proper pointer event handling for toast stacking
 */
export const ToastViewport: React.FC = () => {
  const { toasts } = useToast();
  const insets = useSafeAreaInsets();

  const topToasts = toasts.filter((toast) => toast.options.position === 'top');
  const bottomToasts = toasts.filter((toast) => toast.options.position === 'bottom');

  return (
    <>
      {/* Top Toasts Container */}
      <View
        className="pointer-events-box-none absolute left-0 right-0 z-50 h-52 px-4 pt-2"
        style={{
          top: insets.top + 10,
        }}>
        {topToasts.map((toast, arrayIndex) => {
          const displayIndex = topToasts.length - 1 - arrayIndex;
          return <Toast key={toast.id} toast={toast} index={displayIndex} />;
        })}
      </View>

      {/* Bottom Toasts Container */}
      <View
        className="pointer-events-box-none absolute left-0 right-0 z-50 h-52 flex-col-reverse px-4"
        style={{
          bottom: insets.bottom,
        }}>
        {bottomToasts.map((toast, arrayIndex) => {
          const displayIndex = bottomToasts.length - 1 - arrayIndex;
          return <Toast key={toast.id} toast={toast} index={displayIndex} />;
        })}
      </View>
    </>
  );
};
