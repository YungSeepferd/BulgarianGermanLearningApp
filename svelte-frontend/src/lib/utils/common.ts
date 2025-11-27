/**
 * Common utility functions - Consolidated from multiple modules
 * @description Shared utility functions used across the application
 * @version 1.0.0
 * @updated November 2025
 */

// ============================================================================
// FUNCTION UTILITIES
// ============================================================================

/**
 * Debounce function calls - Consolidated implementation
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls - Consolidated implementation
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format interval for human-readable display - Consolidated from spaced-repetition.ts
 * @param interval - Interval in days
 * @returns Formatted interval string
 */
export function formatInterval(interval: number): string {
  if (interval === 1) {
    return '1 day';
  }
  if (interval < 7) {
    return `${interval} days`;
  }
  if (interval < 30) {
    return `${Math.round(interval / 7)} weeks`;
  }
  if (interval < 365) {
    return `${Math.round(interval / 30)} months`;
  }
  return `${Math.round(interval / 365)} years`;
}

/**
 * Validate date string - Consolidated from validation.ts
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export function validateDateString(dateString: string): boolean {
  if (typeof dateString !== 'string') {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}

/**
 * Format date for display - Consolidated from multiple implementations
 * @param date - Date to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString(locale, { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get relative time string - Enhanced utility
 * @param date - Date to compare
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    return `${Math.round(diffDays / 7)} weeks ago`;
  }
  if (diffDays < 365) {
    return `${Math.round(diffDays / 30)} months ago`;
  }
  return `${Math.round(diffDays / 365)} years ago`;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Sanitize text - Consolidated from validation.ts
 * @param text - Text to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized text
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  if (typeof text !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = text.replaceAll(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, Math.max(0, maxLength));
  }

  return sanitized;
}

/**
 * Escape regex special characters - Consolidated from theme.js
 * @param s - String to escape
 * @returns Escaped string
 */
export function regexEscape(s: string): string {
  return s.replaceAll(/[\s#$()*+,.?[\\\]^{|}-]/g, '\\$&');
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, Math.max(0, maxLength - 3)) + '...';
}

/**
 * Capitalize first letter
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert to title case
 * @param text - Text to convert
 * @returns Title case text
 */
export function toTitleCase(text: string): string {
  return text.replaceAll(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate grade value (1-5) - Consolidated from validation.ts
 * @param grade - Grade to validate
 * @returns True if valid, false otherwise
 */
export function validateGrade(grade: number): boolean {
  return typeof grade === 'number' && grade >= 1 && grade <= 5 && Number.isInteger(grade);
}

/**
 * Validate session ID - Consolidated from validation.ts
 * @param sessionId - Session ID to validate
 * @returns True if valid, false otherwise
 */
export function validateSessionId(sessionId: string): boolean {
  if (typeof sessionId !== 'string') {
    return false;
  }

  // Check if it's a valid UUID format (simplified validation)
  const uuidRegex = /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if valid, false otherwise
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Shuffle array - Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random item from array
 * @param array - Array to get item from
 * @returns Random item
 */
export function getRandomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined;
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Remove duplicates from array
 * @param array - Array to deduplicate
 * @returns Array with unique items
 */
export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array by key
 * @param array - Array to group
 * @param keyFn - Function to get grouping key
 * @returns Grouped object
 */
export function groupBy<T, K extends string | number>(
  array: T[], 
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * Merge objects
 * @param target - Target object
 * @param sources - Source objects
 * @returns Merged object
 */
export function mergeObjects<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        result[key] = source[key]!;
      }
    }
  }
  return result;
}

/**
 * Pick properties from object
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns Object with picked properties
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit properties from object
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns Object without omitted properties
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get grade color for UI display - Consolidated from spaced-repetition.ts
 * @param grade - Grade received (0-5)
 * @returns CSS color class
 */
export function getGradeColor(grade: number): string {
  const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600', 'text-blue-600', 'text-purple-600'];
  return colors[grade] || 'text-gray-600';
}

/**
 * Generate random color
 * @returns Random hex color
 */
export function generateRandomColor(): string {
  return '#' + Math.floor(Math.random()*16_777_215).toString(16).padStart(6, '0');
}

/**
 * Convert hex to RGB
 * @param hex - Hex color
 * @returns RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Safe localStorage get with error handling
 * @param key - Storage key
 * @returns Value or null
 */
export function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to get from localStorage:', error);
    return null;
  }
}

/**
 * Safe localStorage set with error handling
 * @param key - Storage key
 * @param value - Value to store
 * @returns Success status
 */
export function safeStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('Failed to set localStorage:', error);
    return false;
  }
}

/**
 * Safe localStorage remove with error handling
 * @param key - Storage key
 * @returns Success status
 */
export function safeStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Request idle callback with fallback
 * @param callback - Callback function
 * @param options - Options object
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 1);
  }
}

/**
 * Measure function execution time
 * @param fn - Function to measure
 * @returns Object with result and execution time
 */
export function measureTime<T>(fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, duration: end - start };
}

/**
 * Create memoized function
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if value is a non-null object
 * @param value - Value to check
 * @returns True if object
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if value is a non-empty string
 * @param value - Value to check
 * @returns True if non-empty string
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a valid number
 * @param value - Value to check
 * @returns True if valid number
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is a valid date
 * @param value - Value to check
 * @returns True if valid date
 */
export function isValidDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Create error with context
 * @param message - Error message
 * @param context - Error context
 * @returns Error with context
 */
export function createError(message: string, context?: Record<string, any>): Error {
  const error = new Error(message);
  if (context) {
    (error as any).context = context;
  }
  return error;
}

/**
 * Safe function execution with error handling
 * @param fn - Function to execute
 * @param fallback - Fallback value
 * @returns Result or fallback
 */
export function safeExecute<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.error('Function execution failed:', error);
    return fallback;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Function utilities
  debounce,
  throttle,
  
  // Date utilities
  formatInterval,
  validateDateString,
  formatDate,
  getRelativeTime,
  
  // String utilities
  sanitizeText,
  regexEscape,
  truncateText,
  capitalize,
  toTitleCase,
  
  // Validation utilities
  validateGrade,
  validateSessionId,
  validateEmail,
  validateUrl,
  
  // Array utilities
  shuffleArray,
  getRandomItem,
  uniqueArray,
  groupBy,
  
  // Object utilities
  deepClone,
  mergeObjects,
  pick,
  omit,
  
  // Color utilities
  getGradeColor,
  generateRandomColor,
  hexToRgb,
  
  // Storage utilities
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
  
  // Performance utilities
  requestIdleCallback,
  measureTime,
  memoize,
  
  // Type guards
  isObject,
  isNonEmptyString,
  isValidNumber,
  isValidDate,
  
  // Error handling
  createError,
  safeExecute
};