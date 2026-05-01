import React from 'react';
import { useColorScheme } from 'nativewind';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  LucideIcon,
} from 'lucide-react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/fragments/shadcn-ui/alert';
import { THEME } from '@/lib/theme';
import type { ToastType } from '@/types/Toast.types';

export interface ToastConfig {
  icon: LucideIcon;
  variant: 'default' | 'destructive';
  duration: number;
  position: 'top' | 'bottom';
}

/**
 * Toast configuration for each type
 * Maps toast types to Alert variants and appropriate icons
 * Duration and position control display behavior
 *
 * Variants:
 * - 'default': success, info, loading, warning, default types
 * - 'destructive': error type
 */
export const TOAST_CONFIGS: Record<ToastType, ToastConfig> = {
  default: {
    icon: Info,
    variant: 'default',
    duration: 3000,
    position: 'bottom',
  },
  success: {
    icon: CheckCircle2,
    variant: 'default',
    duration: 3000,
    position: 'bottom',
  },
  error: {
    icon: AlertCircle,
    variant: 'destructive',
    duration: 4000,
    position: 'bottom',
  },
  warning: {
    icon: AlertTriangle,
    variant: 'default',
    duration: 4000,
    position: 'bottom',
  },
  info: {
    icon: Info,
    variant: 'default',
    duration: 3000,
    position: 'bottom',
  },
  loading: {
    icon: Loader2,
    variant: 'default',
    duration: 0, // Don't auto-dismiss loading toasts
    position: 'bottom',
  },
};

/**
 * Toast Content Component using Alert
 *
 * ✨ Best Practice: Uses shadcn Alert component for consistent styling
 * - Automatic theme-aware styling (light/dark mode)
 * - Proper accessibility with Alert semantics
 * - Variant support for different toast states
 * - Icon support with spinner animation for loading state
 *
 * @example
 * ```tsx
 * <ToastContent
 *   title="Success!"
 *   message="Operation completed"
 *   icon={CheckCircle2}
 *   variant="default"
 *   isLoading={false}
 * />
 * ```
 */
export const ToastContent: React.FC<{
  title?: string;
  message?: string;
  icon: LucideIcon;
  variant: 'default' | 'destructive';
  isLoading?: boolean;
}> = ({ title, message, icon: IconComponent, variant, isLoading = false }) => {
  return (
    <Alert
      icon={IconComponent}
      variant={variant}
      iconClassName={isLoading ? 'animate-spin' : ''}
      className="w-full border-0">
      {title && <AlertTitle>{title}</AlertTitle>}
      {message && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  );
};
