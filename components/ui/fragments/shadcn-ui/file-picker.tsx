import { Button } from './button';
import { Text } from './text';
import { Image as RNImage } from './image';
import { ImagePreviewModal } from './image-preview-modal';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

import * as DocumentPicker from 'expo-document-picker';
import { File, ImagePlus, ImageUp, Trash2Icon, X } from 'lucide-react-native';
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Icon } from './icon';

export type FileType = 'image' | 'document' | 'all';

/**
 * Media hanya menyimpan URI lokal + metadata file.
 * TIDAK ada base64Data di sini — base64 hanya dibaca saat upload (di posts-server.ts).
 * Ini mencegah JS heap OOM yang menyebabkan force close.
 */
export interface Media {
  uri: string; // local file:// URI (new file) atau https:// URI (existing from server)
  file: {
    name: string;
    size: number;
    type: string;
  };
}

// Internal only — untuk keperluan preview di UI
interface InternalFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface FilePickerProps {
  onFilesSelected: (files: Media[]) => void;
  onError?: (error: string) => void;
  fileType?: FileType;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  allowedExtensions?: string[];
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
  showPreview?: boolean;
  showFileInfo?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  variant?:
    | 'outline'
    | 'link'
    | 'default'
    | 'destructive'
    | 'secondary'
    | 'ghost'
    | null
    | undefined;
}

interface FilePickerMethods {
  clearFiles: () => void;
  openPicker: () => void;
}

export const FilePicker = forwardRef<FilePickerMethods, FilePickerProps>(
  (
    {
      onFilesSelected,
      onError,
      fileType = 'all',
      multiple = false,
      maxFiles = 10,
      maxSizeBytes = 10 * 1024 * 1024,
      allowedExtensions,
      placeholder = 'Select files',
      disabled = false,
      style = {},
      showFileInfo = true,
      accessibilityLabel,
      accessibilityHint,
      variant = 'outline',
    },
    ref
  ) => {
    const [internalFiles, setInternalFiles] = useState<InternalFile[]>([]);
    const [isConverting, setIsConverting] = useState(false);

    // Ref untuk baca current files di dalam async callback tanpa stale closure
    const internalFilesRef = useRef<InternalFile[]>([]);

    const { colorScheme } = useColorScheme();

    React.useImperativeHandle(ref, () => ({
      clearFiles: () => {
        setInternalFiles([]);
        internalFilesRef.current = [];
        onFilesSelected([]);
      },
      openPicker: () => {
        handleDocumentPick();
      },
    }));

    const validateAsset = useCallback(
      (asset: { name: string; size?: number | null }): string | null => {
        if (asset.size && asset.size > maxSizeBytes) {
          return `File size exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(1)}MB limit`;
        }
        if (allowedExtensions && allowedExtensions.length > 0) {
          const extension = asset.name.split('.').pop()?.toLowerCase();
          if (!extension || !allowedExtensions.includes(extension)) {
            return `File type not allowed. Allowed: ${allowedExtensions.join(', ')}`;
          }
        }
        return null;
      },
      [maxSizeBytes, allowedExtensions]
    );

    /**
     * FIX UTAMA: Tidak lagi membaca base64 di sini.
     * Hanya mapping asset ke InternalFile dengan URI lokal.
     * Memory usage: ~bytes (hanya string URI), bukan MB (base64).
     */
    const convertAssetToInternal = useCallback(
      (asset: {
        uri: string;
        name: string;
        size?: number | null;
        mimeType?: string | null;
      }): InternalFile => {
        return {
          uri: asset.uri,
          name: asset.name,
          size: asset.size ?? 0,
          mimeType: asset.mimeType ?? 'image/jpeg',
        };
      },
      []
    );

    const buildMedia = useCallback(
      (file: InternalFile): Media => ({
        uri: file.uri,
        file: {
          name: file.name,
          size: file.size,
          type: file.mimeType,
        },
      }),
      []
    );

    const handleDocumentPick = useCallback(async () => {
      // FIX: try/finally memastikan isConverting selalu di-reset
      setIsConverting(true);
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: fileType === 'image' ? 'image/*' : '*/*',
          multiple,
          copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        // Validasi setiap asset
        const validAssets: typeof result.assets = [];
        const errors: string[] = [];

        for (const asset of result.assets) {
          const error = validateAsset(asset);
          if (error) {
            errors.push(`${asset.name}: ${error}`);
          } else {
            validAssets.push(asset);
          }
        }

        if (errors.length > 0) onError?.(errors.join('\n'));
        if (validAssets.length === 0) return;

        // Konversi sync — tidak ada I/O, tidak ada memory spike
        const converted = validAssets.map(convertAssetToInternal);

        // Kalkulasi merge di luar setState (hindari stale closure)
        const currentFiles = internalFilesRef.current;
        const merged = multiple ? [...currentFiles, ...converted] : converted;
        const sliced = merged.slice(0, maxFiles);

        if (merged.length > maxFiles) {
          onError?.(`Only first ${maxFiles} files were selected`);
        }

        // setState pure — zero side effect
        setInternalFiles(sliced);
        internalFilesRef.current = sliced;

        // Callback dipanggil di luar setState
        onFilesSelected(sliced.map(buildMedia));
      } catch (error) {
        onError?.(`Failed to pick file: ${error}`);
      } finally {
        // FIX: selalu di-reset meski ada error
        setIsConverting(false);
      }
    }, [
      fileType,
      multiple,
      maxFiles,
      validateAsset,
      convertAssetToInternal,
      buildMedia,
      onFilesSelected,
      onError,
    ]);

    const removeFile = useCallback(
      (index: number) => {
        const updated = internalFilesRef.current.filter((_, i) => i !== index);
        setInternalFiles(updated);
        internalFilesRef.current = updated;
        onFilesSelected(updated.map(buildMedia));
      },
      [buildMedia, onFilesSelected]
    );

    const handlePickerPress = useCallback(() => {
      if (disabled || isConverting) return;
      handleDocumentPick();
    }, [disabled, isConverting, handleDocumentPick]);

    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewInitialIndex, setPreviewInitialIndex] = useState(0);

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleImagePress = useCallback((index: number) => {
      setPreviewInitialIndex(index);
      setPreviewModalVisible(true);
    }, []);

    const previewFiles = useMemo(
      () => internalFiles.map((f) => ({ uri: f.uri, name: f.name })),
      [internalFiles]
    );

    const HEADER_HEIGHT = 210;
    const LEFT_IMAGE_HEIGHT = (HEADER_HEIGHT - 4) / 2;
    const RIGHT_IMAGE_HEIGHT = HEADER_HEIGHT;

    return (
      <View className="w-full gap-4">
        <ImagePreviewModal
          visible={previewModalVisible}
          onClose={() => setPreviewModalVisible(false)}
          files={previewFiles}
          initialIndex={previewInitialIndex}
        />

        {isConverting && (
          <View className="items-center justify-center py-4">
            <ActivityIndicator size="small" />
            <Text className="mt-2 text-xs text-muted-foreground">Processing files...</Text>
          </View>
        )}

        {!isConverting && internalFiles.length > 0 && internalFiles.length === 3 ? (
          <View className="mb-1.5 gap-2 overflow-hidden rounded-xl bg-background p-0">
            <View
              style={{ height: HEADER_HEIGHT, flexDirection: 'row', gap: 7 }}
              className="overflow-hidden rounded-xl">
              <View style={{ flex: 1, gap: 7 }}>
                <Pressable
                  key={`${internalFiles[0].uri}-0`}
                  onPress={() => handleImagePress(0)}
                  style={{ height: LEFT_IMAGE_HEIGHT, overflow: 'hidden' }}>
                  <RNImage
                    source={{ uri: internalFiles[0].uri }}
                    contentFit="cover"
                    className="h-full w-full"
                  />
                  <Button
                    onPress={() => removeFile(0)}
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-none rounded-bl-lg bg-destructive/90"
                    accessibilityRole="button">
                    <Icon as={X} size={12} className="text-white" />
                  </Button>
                </Pressable>

                <Pressable
                  key={`${internalFiles[1].uri}-1`}
                  onPress={() => handleImagePress(1)}
                  style={{ height: LEFT_IMAGE_HEIGHT }}>
                  <RNImage
                    source={{ uri: internalFiles[1].uri }}
                    contentFit="cover"
                    className="h-full w-full rounded-none"
                  />
                  <Button
                    onPress={() => removeFile(1)}
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-none rounded-bl-lg bg-destructive/90"
                    accessibilityRole="button">
                    <Icon as={X} size={12} className="text-white" />
                  </Button>
                </Pressable>
              </View>

              <Pressable
                key={`${internalFiles[2].uri}-2`}
                onPress={() => handleImagePress(2)}
                style={{ flex: 1, height: RIGHT_IMAGE_HEIGHT, overflow: 'hidden' }}>
                <RNImage
                  source={{ uri: internalFiles[2].uri }}
                  contentFit="cover"
                  className="h-full w-full"
                />
                <Button
                  onPress={() => removeFile(2)}
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-none rounded-bl-lg bg-destructive/90"
                  accessibilityRole="button">
                  <Icon as={X} size={12} className="text-white" />
                </Button>
              </Pressable>
            </View>

            <Button
              onPress={() => {
                setInternalFiles([]);
                internalFilesRef.current = [];
                onFilesSelected([]);
              }}
              disabled={disabled}
              variant="destructive"
              className="h-fit w-full flex-row justify-center">
              <Icon as={Trash2Icon} size={18} />
              <Text className="text-sm">Delete All</Text>
            </Button>
          </View>
        ) : (
          !isConverting &&
          internalFiles.length > 0 && (
            <View className="w-full gap-2">
              <View className="w-full flex-row items-center gap-1 overflow-hidden rounded-xl">
                {internalFiles.map((file, index) => (
                  <Pressable
                    key={`${file.uri}-${index}`}
                    onPress={() => handleImagePress(index)}
                    className="relative size-full flex-1 border border-border bg-muted"
                    accessibilityLabel={`Image ${index + 1}: ${file.name}`}
                    accessibilityHint="Double tap to view full screen"
                    accessibilityRole="button">
                    <RNImage source={{ uri: file.uri }} height={160} showLoadingIndicator />
                    <Button
                      onPress={() => removeFile(index)}
                      className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-none rounded-bl-lg bg-destructive/90"
                      accessibilityRole="button">
                      <Icon as={X} size={12} className="text-white" />
                    </Button>
                  </Pressable>
                ))}
              </View>

              <Button
                onPress={handlePickerPress}
                disabled={disabled}
                className="h-fit w-full flex-row justify-center">
                <Icon as={ImagePlus} size={18} />
                <Text className="text-sm">Add More</Text>
              </Button>
            </View>
          )
        )}

        {!isConverting && internalFiles.length > 0 && fileType !== 'image' && (
          <View className="w-full gap-2">
            <ScrollView
              nestedScrollEnabled
              scrollEnabled={internalFiles.length > 3}
              className="max-h-48">
              {internalFiles.map((file, index) => (
                <View
                  key={`${file.uri}-${index}`}
                  className="mb-2 flex-row items-center justify-between rounded-lg border border-border bg-card p-2">
                  <View className="flex-1 flex-row items-center gap-2">
                    <Icon as={File} size={16} className="text-primary" />
                    <View className="flex-1">
                      <Text numberOfLines={1} className="text-sm font-medium text-foreground">
                        {file.name}
                      </Text>
                      {showFileInfo && file.size > 0 && (
                        <Text className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Button
                    size="icon"
                    variant="ghost"
                    onPress={() => removeFile(index)}
                    className="ml-2 h-7 w-7"
                    accessibilityLabel={`Remove ${file.name}`}
                    accessibilityRole="button">
                    <Icon as={X} size={14} className="text-destructive" />
                  </Button>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View className={cn('w-full flex-col gap-2')}>
          {internalFiles.length === 0 && !isConverting && (
            <Button
              variant={variant}
              onPress={handlePickerPress}
              disabled={disabled}
              className="h-28 flex-col justify-center gap-2 border-dashed"
              accessibilityLabel={accessibilityLabel || `Select ${fileType} files`}
              accessibilityHint={accessibilityHint || 'Opens file picker'}>
              {fileType === 'image' ? (
                <Icon as={ImageUp} size={24} className={cn('text-muted-foreground/60')} />
              ) : (
                <Icon as={File} size={24} className={cn('text-muted-foreground/60')} />
              )}
              <Text className="text-center text-sm text-muted-foreground/60">{placeholder}</Text>
            </Button>
          )}
        </View>
      </View>
    );
  }
);

FilePicker.displayName = 'FilePicker';
