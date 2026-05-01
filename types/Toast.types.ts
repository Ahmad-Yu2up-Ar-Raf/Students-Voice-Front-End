export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  children: React.ReactNode;
}

export interface ToastOptions {
  duration?: number;
  type?: ToastType;
  position?: ToastPosition;
  onClose?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  } | null;
}

export interface Toast {
  id: string;
  content: React.ReactNode | string;
  options: Required<ToastOptions>;
}

export interface ToastContextValue {
  toasts: Toast[];
  show: (content: React.ReactNode | string, options?: ToastOptions) => string;
  update: (id: string, content: React.ReactNode | string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/**
 * Simplified toast message interface for the convenience API
 * @example { title: "Success!", message: "Operation completed" }
 */
export interface ToastMessage {
  title?: string;
  message?: string;
  duration?: number;
  position?: ToastPosition;
}
