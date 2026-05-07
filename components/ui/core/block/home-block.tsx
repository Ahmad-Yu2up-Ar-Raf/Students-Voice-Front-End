import React, { useCallback, useState } from 'react';
import { Wrapper } from '../layout/wrapper';
import { Text } from '../../fragments/shadcn-ui/text';
import { Post } from '@/types/post-types';
import { useQuery } from '@tanstack/react-query';
import { QueryFetchPosts } from '@/hooks/posts/usePosts';
import LoadingIndicator from '../loading-indicator';
import { LegendList } from '@legendapp/list';
import PostCard from '../../fragments/custom-ui/card/post-card';
import { RefreshControl } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button } from '../../fragments/shadcn-ui/button';
import { PlusIcon } from 'lucide-react-native';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { router } from 'expo-router';
export default function HomeBlock() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(QueryFetchPosts());

  // ✅ Pindah ke atas - SEBELUM conditional return!
  const handleNewNote = useCallback(() => {
    router.push('/post');
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  console.log(data);
  if (!data || data.length === 0) {
    return (
      <Wrapper
        className="flex-1 content-center items-center justify-center"
        edges={['bottom', 'left', 'right']}>
        <LottieView
          autoPlay
          style={{
            width: 200,
            height: 200,
          }}
          source={require('@/assets/animations/error.json')}
        />
        <Text className="mb-4 text-center text-muted-foreground">No posts yet</Text>
        <Button size={'lg'} className="gap-2" onPress={handleNewNote}>
          <Icon className="text-primary-foreground" as={PlusIcon} />
          <Text className="font-poppins_medium text-sm">Create a post</Text>
        </Button>
      </Wrapper>
    );
  }
  return (
    <LegendList
      data={data}
      renderItem={({ item, index }) => <PostCard index={index} posts={item} />}
      keyExtractor={(item, index) => `post-${item}-${index}`}
      numColumns={1}
      onEndReachedThreshold={1.5}
      contentContainerStyle={{
        paddingTop: 20, // Minimal padding, header ada di atas lewat routing

        paddingBottom: 100,
      }}
      className="gap-36"
      maintainVisibleContentPosition
      refreshControl={
        <RefreshControl className="relative z-50" refreshing={isRefetching} onRefresh={refetch} />
      }
      recycleItems
      showsVerticalScrollIndicator={false}
    />
  );
}
