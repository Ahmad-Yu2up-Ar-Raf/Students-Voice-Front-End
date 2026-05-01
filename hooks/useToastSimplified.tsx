import React, { useCallback, useMemo } from 'react';
import { useToast as useToastContext } from '@/context/ToastContext';
import { TOAST_CONFIGS, ToastContent } from '@/utils/toast-config';
import type { ToastMessage, ToastType } from '@/types/Toast.types';

/**
 * Toast API interface for better type safety
 */
interface ToastAPI {
  success: (message: ToastMessage) => string;
  error: (message: ToastMessage) => string;
  warning: (message: ToastMessage) => string;
  info: (message: ToastMessage) => string;
  loading: (message: ToastMessage) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/**
 * Return type for useToast hook
 */
interface UseToastReturn {
  toast: ToastAPI;
}

/**
 * Enhanced useToast hook with a convenient API
 *
 * ✨ Best Practices:
 * - Automatic theme-aware styling through Alert component
 * - Type-safe toast creation with predefined types
 * - Simplified API: toast.success(), toast.error(), etc.
 * - Flexible configuration: custom duration, position per toast
 * - Loading state handling with auto-spinning icon
 * - Dismissible toasts with ID tracking
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 *
 * // Simple usage with defaults
 * toast.success({ title: 'Saved!', message: 'Your data has been saved' });
 * toast.error({ title: 'Error!', message: 'Something went wrong' });
 * toast.warning({ title: 'Warning', message: 'Please check your input' });
 * toast.info({ title: 'Info', message: 'New updates available' });
 * toast.loading({ title: 'Loading...', message: 'Please wait' });
 *
 * // With custom options
 * toast.success({
 *   title: 'Saved!',
 *   message: 'Your profile has been updated',
 *   duration: 5000, // Custom duration
 *   position: 'top', // Custom position
 * });
 *
 * // Dismiss specific toast
 * const toastId = toast.success({ title: 'Loading...' });
 * toast.dismiss(toastId);
 *
 * // Dismiss all toasts
 * toast.dismissAll();
 * ```
 */
export const useToast = (): UseToastReturn => {
  const { show, dismiss, dismissAll } = useToastContext();

  /**
   * Create a toast notification with the specified type
   * @param type - Toast type (success, error, warning, info, loading)
   * @param message - Toast message object with title and message
   * @returns Toast ID for later dismissal
   */
  const createToast = useCallback(
    (type: ToastType, message: ToastMessage): string => {
      const config = TOAST_CONFIGS[type];

      // Use provided values or fall back to defaults from config
      const title = message.title;
      const content = message.message;
      const duration = message.duration ?? config.duration;
      const position = message.position ?? config.position;
      const isLoading = type === 'loading';

      // Create toast content with Alert component and theme-aware styling
      const toastContent = (
        <ToastContent
          title={title}
          message={content}
          icon={config.icon}
          variant={config.variant}
          isLoading={isLoading}
        />
      );

      // Show toast with merged options
      return show(toastContent, {
        type,
        duration,
        position,
      });
    },
    [show]
  );

  // Provide individual methods for each toast type for better DX
  const toastApi = useMemo(
    (): ToastAPI => ({
      success: (message: ToastMessage) => createToast('success', message),
      error: (message: ToastMessage) => createToast('error', message),
      warning: (message: ToastMessage) => createToast('warning', message),
      info: (message: ToastMessage) => createToast('info', message),
      loading: (message: ToastMessage) => createToast('loading', message),
      dismiss: (id: string) => dismiss(id),
      dismissAll: () => dismissAll(),
    }),
    [createToast, dismiss, dismissAll]
  );

  return {
    toast: toastApi,
  };
};

/**
 * Hook-free toast API for use outside of React components
 * Useful for module-level or utility functions
 */
let toastRef: ReturnType<typeof useToast> | null = null;

export const initializeToastRef = (ref: ReturnType<typeof useToast>) => {
  toastRef = ref;
};

export const Toast = {
  success: (message: ToastMessage) => {
    if (!toastRef) {
      console.warn(
        'Toast provider not initialized. Make sure you have wrapped your app with ToastProviderWithViewport and called initializeToastRef.'
      );
      return;
    }
    return toastRef.toast.success(message);
  },
  error: (message: ToastMessage) => {
    if (!toastRef) {
      console.warn('Toast provider not initialized.');
      return;
    }
    return toastRef.toast.error(message);
  },
  warning: (message: ToastMessage) => {
    if (!toastRef) {
      console.warn('Toast provider not initialized.');
      return;
    }
    return toastRef.toast.warning(message);
  },
  info: (message: ToastMessage) => {
    if (!toastRef) {
      console.warn('Toast provider not initialized.');
      return;
    }
    return toastRef.toast.info(message);
  },
  loading: (message: ToastMessage) => {
    if (!toastRef) {
      console.warn('Toast provider not initialized.');
      return;
    }
    return toastRef.toast.loading(message);
  },
  dismiss: (id: string) => {
    if (!toastRef) {
      console.warn('Toast provider not initialized.');
      return;
    }
    return toastRef.toast.dismiss(id);
  },
  dismissAll: () => {
    if (!toastRef) {
      console.warn('Toast provider not initialized.');
      return;
    }
    return toastRef.toast.dismissAll();
  },
};
