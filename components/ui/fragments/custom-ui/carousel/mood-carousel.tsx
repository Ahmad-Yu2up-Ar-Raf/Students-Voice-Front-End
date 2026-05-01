// components/ui/fragments/custom/carousel/onboarding-carousel.tsx - Complete onboarding carousel

import { View, ScrollView, Pressable } from 'react-native';
import React, { useCallback } from 'react';

import { cn } from '@/lib/utils';

import { Text } from '../../shadcn-ui/text';

import { Button } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';

import { LucideIcon, Smile } from 'lucide-react-native';
import { Post } from '@/types/post-types';

const moodData = ['happy', 'sad', 'anggry', 'productive', 'grateful'];

type MoodCarouselProps = {
  setPostData: React.Dispatch<React.SetStateAction<Post>>;
  className?: string;
  MoodData?: string[];
  Tagline?: string;
};

export default function MoodCarousel({
  MoodData = moodData,
  setPostData,
  className,
  Tagline = 'happy',
}: MoodCarouselProps) {
  const handleContentChange = useCallback((mood: string) => {
    setPostData((prev) => ({ ...prev, tagline: mood }));
  }, []);
  return (
    <View className={cn('w-full gap-5', className)}>
      {/* Section header with optional action */}
      <View className="flex-row items-center gap-3 px-8">
        <Icon as={Smile} className="text-muted-foreground" />

        <Text className="font-poppins_thin tracking-widest text-muted-foreground" variant={'small'}>
          VIBE CHECK
        </Text>
      </View>

      {/* Horizontal scrolling onboarding cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 28,
          gap: 6,
        }}
        decelerationRate="fast"
        snapToInterval={200} // Smooth snapping
        snapToAlignment="start">
        {MoodData.map((category, index) => {
          return (
            <Button
              onPress={(e) => {
                handleContentChange(category);
              }}
              variant={Tagline == category ? 'default' : 'outline'}
              size={'sm'}
              key={`category-${category}-${index}`}>
              <Text
                variant={'small'}
                className={cn(
                  'font-poppins_thin text-xs capitalize',
                  Tagline === category && 'font-poppins_medium'
                )}>
                {category}
              </Text>
              {/* <Icon as={MoodUp} size={16} className="text-muted-foreground/80" /> */}
            </Button>
          );
        })}
      </ScrollView>
    </View>
  );
}
