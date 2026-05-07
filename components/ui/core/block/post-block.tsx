import React, { useCallback, useMemo, useState } from 'react';
import { Wrapper } from '../layout/wrapper';
import * as Haptics from 'expo-haptics';
import { Text } from '../../fragments/shadcn-ui/text';
import { View, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/hooks/useToastSimplified';
import { useScrollTracker } from '@/hooks/useScrollTracker';
import { Button } from '../../fragments/shadcn-ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../fragments/shadcn-ui/alert-dialog';
import { SCREEN_OPTIONS } from '../layout/nav';
import { router, Stack } from 'expo-router';
import { ChevronLeftIcon, Eye, EyeOff, MapPin } from 'lucide-react-native';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/fragments/shadcn-ui/select';
import { Label } from '../../fragments/shadcn-ui/label';
import { Textarea } from '../../fragments/shadcn-ui/textarea';

import { Post } from '@/types/post-types';
import { FilePicker, Media } from '../../fragments/shadcn-ui/file-picker';
import UserAvatar from '../feauture/auth/user-avatar';
import { TriggerRef } from '@rn-primitives/select';
import { Icon } from '../../fragments/shadcn-ui/icon';
import MoodCarousel from '../../fragments/custom-ui/carousel/mood-carousel';
import CategoryMenu from '../../fragments/custom-ui/menu/category-menu';
import { Input } from '../../fragments/shadcn-ui/input';
import { cn } from '@/lib/utils';
import { SavePost } from '@/lib/server/posts-server';
import { useQueryClient } from '@tanstack/react-query';

export interface PostBlockProps {
  mode?: 'create' | 'edit';
  postData?: Post;
}

const visibilityOptions = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
];

const RESET_POST_DATA: Post = {
  media: undefined,
  caption: '',
  tag_category: 'Study',
  tag_location: '',
  tagline: 'happy',
  visibility: 'public',
};

export default function PostBlock({ mode = 'create', postData }: PostBlockProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const queryClient = useQueryClient();
  const [PostData, setPostData] = useState<Post>({
    id: postData?.id, // FIX: id diperlukan untuk SavePost edit mode
    media: postData?.media,
    caption: postData?.caption ?? '',
    tag_category: postData?.tag_category ?? 'Study',
    visibility: postData?.visibility ?? 'public',
    tag_location: postData?.tag_location ?? '',
    tagline: postData?.tagline ?? 'happy',
  });

  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const { scrollPosition, handleScroll } = useScrollTracker();
  const insets = useSafeAreaInsets();

  const handleContentChange = useCallback((text: string) => {
    setPostData((prev) => ({ ...prev, caption: text }));
  }, []);

  const handleLocationChange = useCallback((text: string) => {
    setPostData((prev) => ({ ...prev, tag_location: text }));
  }, []);

  const handleVisibilityChange = useCallback((value: string) => {
    setPostData((prev) => ({ ...prev, visibility: value }));
  }, []);

  const handleMediaChange = useCallback((files: Media[]) => {
    setPostData((prev) => ({ ...prev, media: files }));
  }, []);

  const ref = React.useRef<TriggerRef>(null);
  const filePickerRef = React.useRef<any>(null);

  const contentInsets = {
    top: insets.bottom,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 18,
    right: 18,
  };

  const handlePost = async () => {
    if (!PostData.caption || PostData.caption.trim() === '') {
      toast.error({
        title: 'Caption Required',
        message: 'Please add a caption to your post',
      });
      return;
    }

    // Dismiss keyboard sebelum upload
    Keyboard.dismiss();

    const loadingToastId = toast.loading({
      title: 'Publishing...',
      message: `${mode === 'edit' ? 'Updating' : 'Creating'} your post`,
    });

    setIsSaving(true);

    try {
      const result = await SavePost(PostData);

      if (result.ok || result.status === 201) {
        toast.dismiss(loadingToastId);
        toast.success({
          title: '✨ Success!',
          message: mode === 'edit' ? 'Post updated successfully' : 'Your post has been published',
        });

        filePickerRef.current?.clearFiles();
        setPostData(RESET_POST_DATA);
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        router.push('/');
      } else {
        throw new Error(result.message || 'Failed to post');
      }
    } catch (error) {
      console.error('❌ Post error:', error);
      toast.dismiss(loadingToastId);
      toast.error({
        title: 'Failed to Publish',
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while publishing. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const rightMenu = useMemo(
    () => (
      <Button haptic onPress={handlePost} variant="ghost" disabled={isSaving}>
        <Text className={isSaving ? 'text-muted-foreground' : 'text-blue-400'}>
          {isSaving ? 'Uploading...' : 'Upload'}
        </Text>
      </Button>
    ),
    [handlePost, isSaving]
  );

  const hasFormData = useMemo(() => {
    const hasCaption = PostData.caption && PostData.caption.trim().length > 0;
    const hasMedia = PostData.media && PostData.media.length > 0;
    return hasCaption || hasMedia;
  }, [PostData.caption, PostData.media]);

  const handleConfirmDiscard = useCallback(() => {
    filePickerRef.current?.clearFiles();
    setPostData(RESET_POST_DATA);
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/');
  }, []);

  const handleDiscard = useCallback(() => {
    if (!hasFormData) {
      router.push('/');
      return;
    }
    setShowDiscardDialog(true);
  }, [hasFormData]);

  return (
    <>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          leftIcon: ChevronLeftIcon,
          title: 'Post',
          RigthComponent: rightMenu,
          leftAction: handleDiscard,
          scrollAnimatedPosition: scrollPosition,
          scrollTriggerPoint: 120,
          scrollAnimationType: 'slide',
        })}
      />
      <Wrapper
        edges={['bottom', 'right', 'left']}
        className="items-start justify-start pb-36 pt-3"
        containerClassName="px-0"
        animatedScrollHandler={handleScroll}>
        <View className="mt-0 w-full flex-col gap-10">
          <View className="flex-row items-center gap-5 px-9">
            <UserAvatar className="size-12" />
            <View className="gap-1.5">
              <Text className="font-poppins_medium text-base tracking-tight">Ahmad Yusuf</Text>
              <Select
                onValueChange={(e) => {
                  handleVisibilityChange(e?.value!);
                }}>
                <SelectTrigger
                  ref={ref}
                  className="h-fit w-fit justify-start gap-3 border-0 bg-background p-0 dark:bg-background">
                  <View className="w-fit flex-row items-center gap-2.5">
                    <Icon
                      as={PostData.visibility === 'public' ? Eye : EyeOff}
                      size={15}
                      className="text-muted-foreground"
                    />
                    <SelectValue
                      placeholder={PostData.visibility || 'Public'}
                      className="w-fit text-muted-foreground"
                    />
                  </View>
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-fit">
                  <SelectGroup>
                    {visibilityOptions.map((v) => (
                      <SelectItem key={v.value} label={v.label} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </View>
          </View>

          <View className="gap-2 px-8">
            <Label
              nativeID="content-post"
              className="sr-only font-poppins_thin tracking-widest"
              htmlFor="content-post">
              Caption
            </Label>
            <Textarea
              aria-labelledby="content-post"
              id="content-post"
              value={PostData?.caption}
              onChangeText={handleContentChange}
              placeholder="what on your mind..."
              className="min-h-20 w-full border-0 bg-transparent pt-1 placeholder:text-muted-foreground/50 dark:bg-transparent"
            />
            <View className="border-t border-border bg-background px-3 pt-4">
              <View className="flex-row justify-between gap-2">
                <Text className="text-xs text-muted-foreground/60">
                  {PostData.caption!.length} chars
                </Text>
                <Text className="text-xs text-muted-foreground/60">
                  {PostData.caption!.length}/1000
                </Text>
              </View>
            </View>
          </View>

          <MoodCarousel Tagline={PostData.tagline} setPostData={setPostData} />
          <CategoryMenu Category={PostData.tag_category} setPostData={setPostData} />

          <View className={cn('gap-5 px-8')}>
            <FilePicker
              ref={filePickerRef}
              onFilesSelected={handleMediaChange}
              onError={(error) => console.error('FilePicker Error:', error)}
              fileType="image"
              multiple={true}
              maxFiles={3}
              maxSizeBytes={5 * 1024 * 1024}
              allowedExtensions={['jpg', 'jpeg', 'png', 'gif', 'webp']}
              placeholder="Add images"
              showFileInfo={true}
            />
          </View>

          {/* <View className="gap-5 px-8">
            <View className="flex-row items-center gap-2 rounded-xl border border-input bg-background px-4 py-1 dark:bg-input/30">
              <Icon as={MapPin} size={18} className="text-muted-foreground/60" />
              <Input
                aria-labelledby="location-post"
                id="location-post"
                value={PostData?.tag_location}
                onChangeText={handleLocationChange}
                placeholder="Add location..."
                className="flex-1 border-0 bg-transparent text-base dark:bg-transparent"
              />
            </View>
          </View> */}
        </View>
      </Wrapper>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved. Do you want to discard?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onPress={handleConfirmDiscard}>
              <Text>Discard</Text>
            </AlertDialogAction>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
