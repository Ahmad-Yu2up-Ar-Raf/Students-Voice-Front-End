import { Pressable, View } from 'react-native';
import React from 'react';
import { DataPost } from '@/types/post-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shadcn-ui/card';
import UserAvatar from '@/components/ui/core/feauture/auth/user-avatar';
import { Icon } from '../../shadcn-ui/icon';
import { BadgeCheck } from 'lucide-react-native';
import { Text } from '../../shadcn-ui/text';
import { cn } from '@/lib/utils';
import { Image as RNImage } from '@/components/ui/fragments/shadcn-ui/image';
type componentProps = {
  posts: DataPost;
  index: number;
};

export default function PostCard({ posts, index }: componentProps) {
  const images = posts.media;
  const HEADER_HEIGHT = 210;
  const LEFT_IMAGE_HEIGHT = (HEADER_HEIGHT - 4) / 2;
  const RIGHT_IMAGE_HEIGHT = HEADER_HEIGHT;
  return (
    <Card
      className={cn(
        'mb-6 flex-row items-start gap-x-4 border-0 border-b border-border p-0 px-7 pb-6'
      )}>
      <UserAvatar className="m-0 size-7 rounded-full p-0" />
      <CardContent className="flex-1 gap-1 p-0">
        <CardHeader className="flex-row items-start gap-3 p-0">
          <View className="flex-row items-center gap-2">
            <CardTitle className="font-poppins_medium text-sm tracking-tight">Yusuf</CardTitle>
            {/* <Icon as={BadgeCheck} className="fill-blue-600" /> */}
            <Text variant={'muted'} className="text-sm tracking-tight text-muted-foreground/90">
              1 jam
            </Text>
          </View>
        </CardHeader>

        <CardDescription className="text-sm leading-relaxed">{posts.caption}</CardDescription>
        {images && images.length > 0 && images.length === 3 ? (
          <View className="mb-1.5 gap-2 overflow-hidden rounded-xl bg-background p-0">
            <View
              style={{ height: HEADER_HEIGHT, flexDirection: 'row', gap: 7 }}
              className="overflow-hidden rounded-xl">
              <View style={{ flex: 1, gap: 7 }}>
                <Pressable
                  key={`${images[0].uri}-0`}
                  style={{ height: LEFT_IMAGE_HEIGHT, overflow: 'hidden' }}>
                  <RNImage
                    source={{ uri: images[0].uri }}
                    contentFit="cover"
                    className="h-full w-full"
                  />
                </Pressable>

                <Pressable key={`${images[1].uri}-1`} style={{ height: LEFT_IMAGE_HEIGHT }}>
                  <RNImage
                    source={{ uri: images[1].uri }}
                    contentFit="cover"
                    className="h-full w-full rounded-none"
                  />
                </Pressable>
              </View>

              <Pressable
                key={`${images[2].uri}-2`}
                style={{ flex: 1, height: RIGHT_IMAGE_HEIGHT, overflow: 'hidden' }}>
                <RNImage
                  source={{ uri: images[2].uri }}
                  contentFit="cover"
                  className="h-full w-full"
                />
              </Pressable>
            </View>
          </View>
        ) : (
          images &&
          images.length > 0 && (
            <View className="w-full gap-2">
              <View className="w-full flex-row items-center gap-1 overflow-hidden rounded-xl">
                {images.map((file, index) => (
                  <Pressable
                    key={`${file.uri}-${index}`}
                    className="relative size-full flex-1 border border-border bg-muted"
                    accessibilityLabel={`Image ${index + 1}: ${file.file.name}`}
                    accessibilityHint="Double tap to view full screen"
                    accessibilityRole="button">
                    <RNImage source={{ uri: file.uri }} height={160} showLoadingIndicator />
                  </Pressable>
                ))}
              </View>
            </View>
          )
        )}
      </CardContent>
    </Card>
  );
}
