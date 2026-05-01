// components/ui/fragments/shadcn-ui/image-preview-modal.tsx
// 🎨 Full-screen Image Carousel Modal with Swipe Gestures
// ✅ Minimal, responsive, accessible, smooth animations

import React, { useState, useCallback, useRef } from 'react';
import { View, Modal, Dimensions, FlatList } from 'react-native';
import { Text } from './text';
import { Button } from './button';
import { Icon } from './icon';
import { Image } from './image';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { LegendList } from '@legendapp/list';

export interface SelectedFile {
  uri: string;
  name: string;
  type?: string;
  size?: number;
  mimeType?: string;
}

export interface ImagePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  files: SelectedFile[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export const ImagePreviewModal = React.forwardRef<View, ImagePreviewModalProps>(
  ({ visible, onClose, files, initialIndex = 0, onIndexChange }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const flatListRef = useRef<FlatList<SelectedFile>>(null);
    const { colorScheme } = useColorScheme();
    const currentTheme = colorScheme ?? 'light';
    const colors = THEME[currentTheme];

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    // ─── Handlers ─────────────────────────────────────────────

    const handlePrevious = useCallback(() => {
      const newIndex = currentIndex === 0 ? files.length - 1 : currentIndex - 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }, [currentIndex, files.length, onIndexChange]);

    const handleNext = useCallback(() => {
      const newIndex = currentIndex === files.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }, [currentIndex, files.length, onIndexChange]);

    const handleIndexChange = useCallback(
      (index: number) => {
        setCurrentIndex(index);
        onIndexChange?.(index);
      },
      [onIndexChange]
    );

    const handleClose = useCallback(() => {
      // Reset index when closing
      setCurrentIndex(initialIndex);
      onClose();
    }, [initialIndex, onClose]);

    // ─── Render ───────────────────────────────────────────────

    if (files.length === 0) return null;

    const currentFile = files[currentIndex];

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
        accessibilityLabel="Image preview carousel"
        accessibilityHint={`Showing image ${currentIndex + 1} of ${files.length}. Use navigation buttons to browse.`}>
        {/* Background Overlay */}
        <View
          className="absolute inset-0 bg-black/95"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
          }}
        />

        {/* Main Content */}
        <View className="flex-1 items-center justify-center" ref={ref}>
          {/* Top Header: Close & Counter */}
          <Animated.View
            entering={FadeInDown}
            className="pt-safe absolute left-0 right-0 top-0 z-20 flex-row items-center justify-between px-6 py-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}>
            {/* Image Counter */}
            <Text
              className="text-lg font-semibold text-white"
              accessibilityLabel={`Image ${currentIndex + 1} of ${files.length}`}>
              {currentIndex + 1} / {files.length}
            </Text>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onPress={handleClose}
              className="h-10 w-10 rounded-full"
              accessibilityLabel="Close image preview"
              accessibilityHint="Double tap to close">
              <Icon as={X} size={24} className="text-white" />
            </Button>
          </Animated.View>

          {/* Carousel Container */}
          <View
            className="w-full flex-1 items-center justify-center"
            style={{
              backgroundColor: '#000000',
            }}>
            <FlatList
              ref={flatListRef}
              data={files}
              keyExtractor={(_, index) => `image-${index}`}
              horizontal
              pagingEnabled
              scrollEnabled
              scrollEventThrottle={16}
              snapToAlignment="center"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={initialIndex}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                if (newIndex !== currentIndex) {
                  handleIndexChange(newIndex);
                }
              }}
              onScrollToIndexFailed={(info) => {
                // Fallback for scroll index issues
                const wait = new Promise((resolve) => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                });
              }}
              renderItem={({ item: file }) => (
                <View
                  style={{
                    width: screenWidth,
                    height: screenHeight * 0.8,
                  }}
                  className="items-center justify-center bg-black">
                  <Image
                    source={{ uri: file.uri }}
                    width="100%"
                    height="100%"
                    contentFit="contain"
                    accessibilityLabel={`Image preview: ${file.name}`}
                    accessibilityRole="image"
                  />
                </View>
              )}
            />
          </View>

          {/* Bottom Navigation: Prev/Next + Filename */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            className="pb-safe absolute bottom-0 left-0 right-0 z-20 px-6 py-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}>
            {/* Filename */}
            <Text
              variant="small"
              className="sr-only mb-4 text-center font-medium text-white/80"
              numberOfLines={1}
              accessibilityLabel={`File name: ${currentFile.name}`}>
              {currentFile.name}
            </Text>

            {/* Navigation Buttons */}
            <View className="flex-row items-center justify-center gap-4">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="icon"
                onPress={handlePrevious}
                className="h-12 w-12 rounded-full border-white/30"
                accessibilityLabel="Previous image"
                accessibilityHint={`Navigate to image ${currentIndex === 0 ? files.length : currentIndex}`}
                accessibilityRole="button">
                <Icon as={ChevronLeft} size={24} className="text-white" />
              </Button>

              {/* Next Button */}
              <Button
                variant="outline"
                size="icon"
                onPress={handleNext}
                className="h-12 w-12 rounded-full border-white/30"
                accessibilityLabel="Next image"
                accessibilityHint={`Navigate to image ${currentIndex === files.length - 1 ? 1 : currentIndex + 2}`}
                accessibilityRole="button">
                <Icon as={ChevronRight} size={24} className="text-white" />
              </Button>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

ImagePreviewModal.displayName = 'ImagePreviewModal';

export default ImagePreviewModal;
