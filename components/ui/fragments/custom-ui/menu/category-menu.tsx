// components/ui/fragments/custom/carousel/onboarding-carousel.tsx - Complete onboarding carousel

import { View, ScrollView, Pressable } from 'react-native';
import React, { useCallback } from 'react';

import { cn } from '@/lib/utils';
import { Text } from '../../shadcn-ui/text';

import { Button } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';
import { LucideIcon, Smile, Tag } from 'lucide-react-native';
import { Post } from '@/types/post-types';

const categoryData = ['Study', 'Project', 'Life', 'Friend', 'Family', 'Work'];

type CategoryMenuProps = {
  setPostData: React.Dispatch<React.SetStateAction<Post>>;
  className?: string;
  CategoryData?: string[];
  Category?: string;
};

export default function CategoryMenu({
  CategoryData = categoryData,
  setPostData,
  className,
  Category = 'Study',
}: CategoryMenuProps) {
  const handleContentChange = useCallback((Category: string) => {
    setPostData((prev) => ({ ...prev, tag_category: Category }));
  }, []);
  return (
    <View className={cn('w-full gap-5 px-8', className)}>
      {/* Section header with optional action */}
      <View className="flex-row items-center gap-3">
        <Icon as={Tag} className="text-muted-foreground" />

        <Text className="font-poppins_thin tracking-widest text-muted-foreground" variant={'small'}>
          CATEGORIES
        </Text>
      </View>

      {/* Horizontal scrolling onboarding cards */}
      <View className="flex-row flex-wrap items-center justify-start gap-2">
        {CategoryData.map((category, index) => {
          return (
            <Button
              onPress={(e) => {
                handleContentChange(category);
              }}
              variant={Category === category ? 'default' : 'outline'}
              size={'sm'}
              // className="flex-1"
              key={`category-${category}-${index}`}>
              <Text
                variant={'small'}
                className={cn(
                  'font-poppins_thin text-xs capitalize',
                  Category === category && 'font-poppins_medium'
                )}>
                #{category}
              </Text>
              {/* <Icon as={CategoryUp} size={16} className="text-muted-foreground/80" /> */}
            </Button>
          );
        })}
      </View>
    </View>
  );
}
