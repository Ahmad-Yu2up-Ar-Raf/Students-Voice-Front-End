import { useSharedValue } from 'react-native-reanimated';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

/**
 * Hook for managing scroll animation in any scrollable component
 * Returns scroll position SharedValue and scroll event handler
 */
export const useScrollTracker = () => {
  const scrollPosition = useSharedValue(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollPosition.value = event.nativeEvent.contentOffset.y;
  };

  return { scrollPosition, handleScroll };
};
