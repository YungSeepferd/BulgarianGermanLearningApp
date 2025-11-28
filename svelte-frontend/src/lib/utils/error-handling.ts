/**
 * Error Handling Utilities for SvelteKit
 * @file error-handling.ts
 * @description Comprehensive error handling utilities for SvelteKit components
 * @version 1.0.0
 * @updated November 2025
 */

import type { ErrorContext } from '$lib/types/index.js';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Base error class for SvelteKit components
 */
export class SvelteKitError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: ErrorContext,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SvelteKitError';
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends SvelteKitError {
  constructor(message: string, context?: ErrorContext, originalError?: Error) {
    super(message, 'NETWORK_ERROR', 503, context, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends SvelteKitError {
  constructor(message: string, field?: string, context?: ErrorContext) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
    this.field = field;
  }

  public field?: string;
}

/**
 * Authentication errors
 */
export class AuthenticationError extends SvelteKitError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'AUTHENTICATION_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization errors
 */
export class AuthorizationError extends SvelteKitError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'AUTHORIZATION_ERROR', 403, context);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends SvelteKitError {
  constructor(message: string = 'Resource not found', context?: ErrorContext) {
    super(message, 'NOT_FOUND_ERROR', 404, context);
    this.name = 'NotFoundError';
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends SvelteKitError {
  constructor(message: string, timeout: number, context?: ErrorContext) {
    super(message, 'TIMEOUT_ERROR', 408, context);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }

  public timeout: number;
}

/**
 * Storage errors (localStorage, sessionStorage, etc.)
 */
export class StorageError extends SvelteKitError {
  constructor(message: string, operation: string, context?: ErrorContext, originalError?: Error) {
    super(message, 'STORAGE_ERROR', 500, context, originalError);
    this.name = 'StorageError';
    this.operation = operation;
  }

  public operation: string;
}

/**
 * Component lifecycle errors
 */
export class ComponentError extends SvelteKitError {
  constructor(message: string, component: string, phase: string, context?: ErrorContext, originalError?: Error) {
    super(message, 'COMPONENT_ERROR', 500, context, originalError);
    this.name = 'ComponentError';
    this.component = component;
    this.phase = phase;
  }

  public component: string;
  public phase: string;
}

// ============================================================================
// ERROR CONTEXT UTILITIES
// ============================================================================

/**
 * Create error context with automatic detection
 */
export function createErrorContext(
  component: string,
  action: string,
  additionalContext?: Partial<ErrorContext>
): ErrorContext {
  return {
    component,
    action,
    timestamp: Date.now(),
    userAgent: typeof navigator === 'undefined' ? 'Unknown' : navigator.userAgent,
    url: typeof window === 'undefined' ? 'Unknown' : window.location.href,
    ...additionalContext
  };
}

/**
 * Get error stack trace safely
 */
export function getErrorStack(error: Error): string | undefined {
  if (error.stack) {
    return error.stack;
  }
  
  try {
    throw new Error();
  } catch (error_) {
    return (error_ as Error).stack;
  }
}

/**
 * Extract useful information from error
 */
export function extractErrorInfo(error: Error | SvelteKitError): {
  message: string;
  code?: string;
  statusCode?: number;
  stack?: string;
  isNetworkError: boolean;
  isValidationError: boolean;
  isTimeoutError: boolean;
  isStorageError: boolean;
} {
  const isSvelteKitError = error instanceof SvelteKitError;
  
  return {
    message: error.message,
    code: isSvelteKitError ? error.code : undefined,
    statusCode: isSvelteKitError ? error.statusCode : undefined,
    stack: getErrorStack(error),
    isNetworkError: error instanceof NetworkError,
    isValidationError: error instanceof ValidationError,
    isTimeoutError: error instanceof TimeoutError,
    isStorageError: error instanceof StorageError
  };
}

// ============================================================================
// ERROR BOUNDARY UTILITIES
// ============================================================================

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    message: string;
    code?: string;
    statusCode?: number;
    stack?: string;
    isNetworkError: boolean;
    isValidationError: boolean;
    isTimeoutError: boolean;
    isStorageError: boolean;
  } | null;
  context: ErrorContext | null;
  retryCount: number;
  maxRetries: number;
}

/**
 * Create initial error boundary state
 */
export function createErrorBoundaryState(maxRetries: number = 3): ErrorBoundaryState {
  return {
    hasError: false,
    error: null,
    errorInfo: null,
    context: null,
    retryCount: 0,
    maxRetries
  };
}

/**
 * Handle error in error boundary
 */
export function handleError(
  error: Error,
  context: ErrorContext,
  currentState: ErrorBoundaryState
): ErrorBoundaryState {
  const errorInfo = extractErrorInfo(error);
  
  console.error(`[ErrorBoundary] Error in ${context.component}:${context.action}`, {
    error,
    context,
    errorInfo
  });

  return {
    ...currentState,
    hasError: true,
    error,
    errorInfo,
    context,
    retryCount: currentState.retryCount + 1
  };
}

/**
 * Reset error boundary state
 */
export function resetErrorBoundary(currentState: ErrorBoundaryState): ErrorBoundaryState {
  return {
    ...currentState,
    hasError: false,
    error: null,
    errorInfo: null,
    context: null,
    retryCount: 0
  };
}

/**
 * Check if retry is allowed
 */
export function canRetry(currentState: ErrorBoundaryState): boolean {
  return currentState.retryCount < currentState.maxRetries;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | SvelteKitError): string {
  if (error instanceof ValidationError) {
    return `Please check your input: ${error.message}`;
  }
  
  if (error instanceof NetworkError) {
    return 'Connection problem. Please check your internet connection and try again.';
  }
  
  if (error instanceof TimeoutError) {
    return 'The request took too long. Please try again.';
  }
  
  if (error instanceof StorageError) {
    return 'There was a problem saving your data. Please try again.';
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please sign in to continue.';
  }
  
  if (error instanceof AuthorizationError) {
    return 'You don\'t have permission to do this.';
  }
  
  if (error instanceof NotFoundError) {
    return 'The requested resource was not found.';
  }
  
  // Default message
  return 'Something went wrong. Please try again later.';
}

// ============================================================================
// ASYNC ERROR HANDLING
// ============================================================================

/**
 * Safe async function wrapper with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  onError?: (error: Error) => void
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (onError) {
      onError(err);
    } else {
      console.error(`[SafeAsync] Error in ${context.component}:${context.action}`, err);
    }
    
    return { data: null, error: err };
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`[RetryAsync] Attempt ${attempt} failed for ${context.component}:${context.action}, retrying in ${delay}ms`, lastError);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  const finalError = lastError || new Error('Retry failed without specific error');
  throw new SvelteKitError(
    `Failed after ${maxAttempts} attempts: ${finalError.message}`,
    'RETRY_FAILED',
    500,
    context,
    finalError
  );
}

/**
 * Timeout wrapper for async functions
 */
export function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  context: ErrorContext
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(
          `Operation timed out after ${timeoutMs}ms`,
          timeoutMs,
          context
        ));
      }, timeoutMs);
    })
  ]);
}

// ============================================================================
// STORAGE ERROR HANDLING
// ============================================================================

/**
 * Safe localStorage operations
 */
export const safeLocalStorage = {
  /**
   * Get item from localStorage
   */
  getItem(key: string, context?: ErrorContext): string | null {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new StorageError(
        `Failed to get item from localStorage: ${err.message}`,
        'getItem',
        context,
        err
      );
    }
  },

  /**
   * Set item in localStorage
   */
  setItem(key: string, value: string, context?: ErrorContext): void {
    try {
      if (typeof localStorage === 'undefined') {
        throw new TypeError('localStorage is not available');
      }
      localStorage.setItem(key, value);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new StorageError(
        `Failed to set item in localStorage: ${err.message}`,
        'setItem',
        context,
        err
      );
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem(key: string, context?: ErrorContext): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.removeItem(key);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new StorageError(
        `Failed to remove item from localStorage: ${err.message}`,
        'removeItem',
        context,
        err
      );
    }
  },

  /**
   * Clear localStorage
   */
  clear(context?: ErrorContext): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.clear();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new StorageError(
        `Failed to clear localStorage: ${err.message}`,
        'clear',
        context,
        err
      );
    }
  }
};

// ============================================================================
// ERROR REPORTING
// ============================================================================

/**
 * Error report interface
 */
export interface ErrorReport {
  id: string;
  timestamp: number;
  error: {
    message: string;
    code?: string;
    statusCode?: number;
    stack?: string;
  };
  context: ErrorContext;
  userAgent: string;
  url: string;
  buildVersion?: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Create error report
 */
export function createErrorReport(
  error: Error | SvelteKitError,
  context: ErrorContext,
  additionalData?: {
    buildVersion?: string;
    userId?: string;
    sessionId?: string;
  }
): ErrorReport {
  const errorInfo = extractErrorInfo(error);
  
  return {
    id: generateErrorId(),
    timestamp: Date.now(),
    error: {
      message: errorInfo.message,
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      stack: errorInfo.stack
    },
    context,
    userAgent: context.userAgent,
    url: context.url,
    ...additionalData
  };
}

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Log error to console with structured format
 */
export function logError(error: Error | SvelteKitError, context: ErrorContext): void {
  const errorInfo = extractErrorInfo(error);
  const report = createErrorReport(error, context);
  
  console.group(`🚨 Error: ${context.component}:${context.action}`);
  console.error('Error Details:', errorInfo);
  console.error('Context:', context);
  console.error('Report:', report);
  console.groupEnd();
}

/**
 * Send error report to monitoring service (placeholder)
 */
export async function reportError(error: Error | SvelteKitError, context: ErrorContext): Promise<void> {
  const report = createErrorReport(error, context);
  
  try {
    // In a real implementation, this would send to a monitoring service
    // For now, we'll just log it
    console.log('[ErrorReporting] Would send error report:', report);
    
    // Example implementation:
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report)
    // });
  } catch (reportingError) {
    console.error('[ErrorReporting] Failed to report error:', reportingError);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: Error | SvelteKitError): boolean {
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  
  if (error instanceof StorageError && error.operation === 'setItem') {
    return true; // Might be able to retry with smaller data
  }
  
  return false;
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: Error | SvelteKitError): 'low' | 'medium' | 'high' | 'critical' {
  if (error instanceof ValidationError) {
    return 'low';
  }
  
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return 'medium';
  }
  
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    return 'high';
  }
  
  if ('statusCode' in error && (error as any).statusCode && (error as any).statusCode >= 500) {
    return 'critical';
  }
  
  return 'medium';
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: Error | SvelteKitError): {
  title: string;
  message: string;
  actions: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
} {
  const userMessage = getUserFriendlyMessage(error);
  const isRecoverable = isRecoverableError(error);
  
  return {
    title: error instanceof SvelteKitError ? error.code : 'Error',
    message: userMessage,
    actions: [
      {
        label: 'Close',
        action: () => {},
        variant: 'secondary'
      },
      ...(isRecoverable ? [{
        label: 'Retry',
        action: () => window.location.reload(),
        variant: 'primary' as const
      }] : [])
    ]
  };
}

// Export all error types and utilities
export {
  
  type ErrorBoundaryState as ErrorBoundaryStateType,
  type ErrorReport as ErrorReportType
};
export { type ErrorContext } from '$lib/types/index.js';