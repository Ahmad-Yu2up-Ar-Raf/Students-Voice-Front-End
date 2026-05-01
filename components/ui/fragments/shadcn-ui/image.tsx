// components/ui/fragments/shadcn-ui/image.tsx
// ✅ FIXED: 429 rate limit, SVG rejection, URL cleaning, better fallback

import { Text } from './text';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { Image as ExpoImage, ImageProps as ExpoImageProps, ImageSource } from 'expo-image';
import React, { forwardRef, useState, useCallback, useRef } from 'react';
import { ActivityIndicator, DimensionValue } from 'react-native';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';

// ─────────────────────────────────────────────────────────────
// ✅ URL Sanitizer - handles local files AND remote URLs
// ─────────────────────────────────────────────────────────────
function sanitizeImageUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;

  let cleaned = url.trim();

  // ✅ Fix Platzi API bug: images come as '["https://..."]'
  // Strip leading [ " and trailing " ]
  if (cleaned.startsWith('[')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cleaned = String(parsed[0]).trim();
      }
    } catch {
      // Fallback: strip brackets manually
      cleaned = cleaned.replace(/^\["|"\]$/g, '').trim();
    }
  }

  // ✅ Reject SVG — expo-image cannot render SVGs reliably
  if (cleaned.toLowerCase().includes('.svg') || cleaned.toLowerCase().includes('svg+xml')) {
    console.warn('⚠️ SVG files not supported:', cleaned);
    return null;
  }

  // ✅ Allow: local files (file://), remote HTTP/HTTPS URLs, and content:// (Android)
  const isValidUri =
    cleaned.startsWith('http://') ||
    cleaned.startsWith('https://') ||
    cleaned.startsWith('file://') ||
    cleaned.startsWith('content://'); // Android content:// URIs

  if (!isValidUri) {
    console.warn('⚠️ Invalid image URI format:', cleaned);
    return null;
  }

  return cleaned;
}

// ─────────────────────────────────────────────────────────────
// ✅ Global request throttle to prevent 429 Too Many Requests
// ─────────────────────────────────────────────────────────────
const loadedUrlCache = new Set<string>();

// ─────────────────────────────────────────────────────────────
// Fallback placeholder — shown when image fails or URL invalid
// ─────────────────────────────────────────────────────────────
const FALLBACK_URI = 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface ImageProps extends Omit<ExpoImageProps, 'style'> {
  variant?: 'rounded' | 'circle' | 'default';
  source: ImageSource;
  className?: string;
  containerClassName?: string;
  showLoadingIndicator?: boolean;
  showErrorFallback?: boolean;
  errorFallbackText?: string;
  loadingIndicatorSize?: 'small' | 'large';
  aspectRatio?: number;
  width?: DimensionValue;
  height?: DimensionValue;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export const Image = forwardRef<ExpoImage, ImageProps>(
  (
    {
      variant = 'default',
      source,
      className,
      containerClassName,
      showLoadingIndicator = true,
      showErrorFallback = false, // ✅ Default false — use placeholder instead
      errorFallbackText = 'No Image',
      loadingIndicatorSize = 'small',
      aspectRatio,
      width,
      height,
      contentFit = 'cover',
      transition = 150, // ✅ Faster transition
      ...props
    },
    ref
  ) => {
    // ─── Resolve & sanitize the URI ───────────────────────────
    const resolvedUri = React.useMemo<string | null>(() => {
      if (!source) {
        console.debug('📸 Image source is empty');
        return null;
      }

      // ImageSource can be: { uri: string } | number | string
      if (typeof source === 'number') {
        console.debug('📸 Using local require() - not supported for FilePicker');
        return null;
      }

      if (typeof source === 'string') {
        const sanitized = sanitizeImageUrl(source);
        console.debug('📸 String source:', { raw: source, sanitized });
        return sanitized;
      }

      if (typeof source === 'object' && 'uri' in source) {
        const sanitized = sanitizeImageUrl(source.uri as string);
        console.debug('📸 Object source:', { raw: source.uri, sanitized });
        return sanitized;
      }

      console.warn('📸 Unknown source type:', source);
      return null;
    }, [source]);

    // ─── State ────────────────────────────────────────────────
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [currentUri, setCurrentUri] = useState<string | null>(resolvedUri);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 1500; // ✅ Wait before retry on 429

    const { colorScheme } = useColorScheme();
    const currentTheme = colorScheme ?? 'light';
    const primary = THEME[currentTheme].primary;

    // Update URI if source prop changes
    React.useEffect(() => {
      setCurrentUri(resolvedUri);
      setHasError(false);
      setIsLoading(true);
      setRetryCount(0);
    }, [resolvedUri]);

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    }, []);

    // ─── Handlers ─────────────────────────────────────────────
    const handleLoadStart = useCallback(() => {
      console.debug('⏳ Image loading started:', currentUri);
      setIsLoading(true);
      setHasError(false);
    }, [currentUri]);

    const handleLoad = useCallback(() => {
      console.debug('✅ Image loaded successfully:', currentUri);
      setIsLoading(false);
      setHasError(false);
      // Cache successful URL
      if (currentUri) loadedUrlCache.add(currentUri);
    }, [currentUri]);

    const handleError = useCallback(
      (error: { error?: string }) => {
        const errMsg = error?.error ?? '';
        console.error('🖼️ Image Load Error:', {
          uri: currentUri,
          error: errMsg,
          retryCount,
        });

        // ✅ 429 Too Many Requests — retry with exponential backoff
        if (errMsg.includes('429') && retryCount < MAX_RETRIES) {
          console.warn(
            `⏳ Rate limited (429) - Retrying in ${RETRY_DELAY_MS * Math.pow(2, retryCount)}ms...`
          );
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // 1.5s, 3s
          retryTimeoutRef.current = setTimeout(() => {
            setRetryCount((c) => c + 1);
            // Force re-render by toggling uri
            setCurrentUri(null);
            setTimeout(() => setCurrentUri(resolvedUri), 50);
          }, delay);
          return;
        }

        // ✅ 400 Bad Request — URL is bad, use fallback
        if (errMsg.includes('400') || errMsg.includes('status code: 400')) {
          console.warn('❌ Bad Request (400) - Using fallback image');
          setCurrentUri(FALLBACK_URI);
          setIsLoading(false);
          return;
        }

        // ✅ SVG / cannot load — use fallback silently
        if (errMsg.includes('SVG') || errMsg.includes('setDataSource')) {
          console.warn('❌ Unsupported format - Using fallback image');
          setCurrentUri(FALLBACK_URI);
          setIsLoading(false);
          return;
        }

        // All other errors — show fallback & log
        console.error('❌ Unknown error - Showing error state');
        setIsLoading(false);
        setHasError(true);
      },
      [retryCount, resolvedUri, currentUri]
    );

    // ─── Variant classes ──────────────────────────────────────
    const variantClass =
      variant === 'circle' ? 'rounded-full' : variant === 'rounded' ? 'rounded-2xl' : '';

    // ─── Effective source ─────────────────────────────────────
    // If resolved URI is null (invalid), use fallback directly
    const effectiveSource = React.useMemo(() => {
      if (!currentUri && typeof source === 'number') return source; // local require()
      const uri = currentUri ?? FALLBACK_URI;
      return { uri };
    }, [currentUri, source]);

    // ─── Styles ───────────────────────────────────────────────
    const containerStyle = {
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      ...(aspectRatio ? { aspectRatio } : {}),
    };

    const imageStyle = {
      width: width ?? '100%',

      height: height ?? '100%',
      ...(aspectRatio && !height ? { aspectRatio } : {}),
    } as const;

    return (
      <View
        className={cn('relative overflow-hidden', variantClass, containerClassName)}
        style={containerStyle}>
        <ExpoImage
          ref={ref}
          source={effectiveSource}
          style={imageStyle}
          className={cn(variantClass, className)}
          contentFit={contentFit}
          transition={transition}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          // ✅ Aggressive caching - reduces repeat requests (prevents 429)
          cachePolicy="memory-disk"
          // ✅ Allow cross-origin images
          allowDownscaling={true}
          {...props}
        />

        {/* Loading indicator */}
        {isLoading && showLoadingIndicator && !hasError && (
          <View className="absolute inset-0 items-center justify-center bg-muted/40">
            <ActivityIndicator size={loadingIndicatorSize} color={primary} />
          </View>
        )}

        {/* Error fallback text (only if showErrorFallback AND no placeholder) */}
        {hasError && showErrorFallback && (
          <View className="absolute inset-0 items-center justify-center bg-muted/80 p-2">
            <Text
              variant="small"
              className="text-center text-[10px] text-muted-foreground"
              numberOfLines={2}>
              {errorFallbackText}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

Image.displayName = 'Image';
