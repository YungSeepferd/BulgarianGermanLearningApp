/**
 * Toast Notification Service
 *
 * Provides user-facing toast notifications for errors, success, warnings, and info.
 * Replaces console.error with visible feedback.
 */

import { browser } from '$app/environment';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title: string | undefined;
  duration: number;
  dismissible: boolean;
}

// Toast store using Svelte 5 runes pattern
class ToastStore {
  toasts = $state<Toast[]>([]);
  private idCounter = 0;

  /**
   * Add a new toast notification
   */
  add(options: {
    type: ToastType;
    message: string;
    title: string | undefined;
    duration: number | undefined;
    dismissible?: boolean;
  }): string {
    if (!browser) return ''; // Don't show toasts during SSR

    const id = `toast-${++this.idCounter}-${Date.now()}`;
    const toast: Toast = {
      id,
      type: options.type,
      message: options.message,
      duration: options.duration ?? this.getDefaultDuration(options.type),
      dismissible: options.dismissible ?? true,
      title: options.title
    };

    this.toasts = [...this.toasts, toast];

    // Auto-dismiss after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, toast.duration);
    }

    return id;
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toasts = [];
  }

  /**
   * Get default duration based on toast type
   */
  private getDefaultDuration(type: ToastType): number {
    switch (type) {
      case 'error':
        return 8000; // Errors stay longer
      case 'warning':
        return 6000;
      case 'success':
        return 4000;
      case 'info':
        return 5000;
      default:
        return 5000;
    }
  }
}

// Singleton instance
export const toastStore = new ToastStore();

// Convenience functions
export function showError(message: string, title?: string, duration?: number): string {
  return toastStore.add({
    type: 'error',
    message,
    title: title ?? undefined,
    duration: duration ?? undefined
  });
}

export function showSuccess(message: string, title?: string, duration?: number): string {
  return toastStore.add({
    type: 'success',
    message,
    title: title ?? undefined,
    duration: duration ?? undefined
  });
}

export function showWarning(message: string, title?: string, duration?: number): string {
  return toastStore.add({
    type: 'warning',
    message,
    title: title ?? undefined,
    duration: duration ?? undefined
  });
}

export function showInfo(message: string, title?: string, duration?: number): string {
  return toastStore.add({
    type: 'info',
    message,
    title: title ?? undefined,
    duration: duration ?? undefined
  });
}

// Integration with ErrorHandler
export function showErrorFromHandler(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  showError(message, context);
}
