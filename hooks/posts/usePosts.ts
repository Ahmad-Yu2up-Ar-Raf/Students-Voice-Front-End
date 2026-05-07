import { FetchAllPosts } from '@/lib/server/posts-server';
import { DataPost } from '@/types/post-types';

const POSTS_QUERY_KEY = ['posts'] as const;

export function QueryFetchPosts() {
  return {
    queryKey: POSTS_QUERY_KEY,
    queryFn: async (): Promise<DataPost[]> => {
      console.log('Fetching posts...');
      const posts = await FetchAllPosts();
      console.log(`Fetched posts: ${posts.length}`);
      return posts;
    },
    staleTime: 0,  // ✅ Fixed: scaleTime → staleTime
    retry: 1,
    enabled: true,  // ✅ Fixed: enable → enabled
  };
}
