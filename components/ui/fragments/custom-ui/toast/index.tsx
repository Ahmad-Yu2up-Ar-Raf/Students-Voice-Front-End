import { ToastProvider, useToast as useToastContext } from '@/context/ToastContext';
import type { ToastOptions, ToastProps, ToastMessage } from '@/types/Toast.types';
import * as React from 'react';
import { ToastViewport } from './viewport';

type ToastRef = {
  show?: (content: React.ReactNode | string, options?: ToastOptions) => string;
  update?: (id: string, content: React.ReactNode | string, options?: ToastOptions) => void;
  dismiss?: (id: string) => void;
  dismissAll?: () => void;
};

const toastRef: ToastRef = {};

const ToastController: React.FC = () => {
  const toast = useToastContext();

  toastRef.show = toast.show;
  toastRef.update = toast.update;
  toastRef.dismiss = toast.dismiss;
  toastRef.dismissAll = toast.dismissAll;

  return null;
};

/**
 * Toast Provider with Viewport
 * Wraps your app to provide global toast notifications
 *
 * @example
 * ```tsx
 * <ToastProviderWithViewport>
 *   <YourApp />
 * </ToastProviderWithViewport>
 * ```
 */
export const ToastProviderWithViewport: React.FC<ToastProps> = ({ children }) => {
  return (
    <ToastProvider>
      <ToastController />
      {children}
      <ToastViewport />
    </ToastProvider>
  );
};

/**
 * Low-level Toast API (rarely used directly)
 * Use the simplified useToast hook instead for better DX
 *
 * @deprecated Use useToast hook from '@/hooks/useToastSimplified' instead
 * @example
 * ```tsx
 * import { useToast } from '@/hooks/useToastSimplified';
 * const { toast } = useToast();
 * toast.success({ title: 'Success!', message: 'Operation completed' });
 * ```
 */
export const Toast = {
  show: (content: React.ReactNode | string, options?: ToastOptions): string => {
    if (!toastRef.show) {
      console.warn(
        'Toast provider not initialized. Make sure you have wrapped your app with ToastProviderWithViewport.'
      );
      return '';
    }
    return toastRef.show(content, options);
  },
  update: (id: string, content: React.ReactNode | string, options?: ToastOptions): void => {
    if (!toastRef.update) {
      console.warn(
        'Toast provider not initialized. Make sure you have wrapped your app with ToastProviderWithViewport.'
      );
      return;
    }
    return toastRef.update(id, content, options);
  },
  dismiss: (id: string): void => {
    if (!toastRef.dismiss) {
      console.warn(
        'Toast provider not initialized. Make sure you have wrapped your app with ToastProviderWithViewport.'
      );
      return;
    }
    return toastRef.dismiss(id);
  },
  dismissAll: (): void => {
    if (!toastRef.dismissAll) {
      console.warn(
        'Toast provider not initialized. Make sure you have wrapped your app with ToastProviderWithViewport.'
      );
      return;
    }
    return toastRef.dismissAll();
  },
};

export { ToastProvider, useToast as useToastContext } from '@/context/ToastContext';
export type { ToastOptions, ToastPosition, ToastType, ToastMessage } from '@/types/Toast.types';
