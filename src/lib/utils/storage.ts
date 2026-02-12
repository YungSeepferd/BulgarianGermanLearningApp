/**
 * Safe Storage Utilities
 *
 * ⚠️ DEPRECATED: This module is being phased out in favor of `svelte-persisted-store`.
 * Please use `$lib/stores` for new code.
 *
 * Migration path:
 * - Old: import { safeGetJSON, safeSetJSON } from '$lib/utils/storage'
 * - New: import { persisted } from '$lib/stores'
 *
 * The stores module provides:
 * - Automatic synchronization across tabs
 * - TypeScript generics for type safety
 * - SSR compatibility
 * - Cleaner API (standard Svelte store interface)
 *
 * This file will be removed in a future release.
 *
 * ---
 *
 * Provides error-handled wrappers around localStorage operations.
 * Falls back to in-memory storage if localStorage is unavailable or quota is exceeded.
 */

import { browser } from '$app/environment';
import { ErrorHandler } from '$lib/services/errors';
import { STORAGE_KEY_PREFIX, MAX_STORAGE_SIZE_BYTES } from '$lib/constants/app';

// In-memory fallback storage when localStorage fails
const memoryStorage = new Map<string, string>();

/**
 * Check if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
  if (!browser) return false;

  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get estimated storage usage in bytes
 */
export function getStorageUsage(): number {
  if (!browser || !isStorageAvailable()) {
    return memoryStorage.size * 1024; // Rough estimate
  }

  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        total += key.length + value.length;
      }
    }
    return total * 2; // UTF-16 encoding = 2 bytes per char
  } catch (error) {
    ErrorHandler.handleError(error, 'Storage Usage Check');
    return 0;
  }
}

/**
 * Check if adding data would exceed storage quota
 */
function wouldExceedQuota(key: string, value: string): boolean {
  const estimatedSize = getStorageUsage() + (key.length + value.length) * 2;
  return estimatedSize > MAX_STORAGE_SIZE_BYTES;
}

/**
 * Safely set item in storage (localStorage with memory fallback)
 * @returns true if successful, false otherwise
 */
export function safeSetItem(key: string, value: string): boolean {
  const fullKey = `${STORAGE_KEY_PREFIX}:${key}`;

  // Always save to memory as backup
  memoryStorage.set(fullKey, value);

  if (!browser) return true;

  try {
    // Check quota before writing
    if (wouldExceedQuota(fullKey, value)) {
      ErrorHandler.handleError(
        new Error(`Storage quota would be exceeded for key: ${key}`),
        'Storage SetItem'
      );
      // Still have memory backup, so return true
      return true;
    }

    localStorage.setItem(fullKey, value);
    return true;
  } catch (error) {
    // Handle quota exceeded or other errors
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        ErrorHandler.handleError(
          new Error(`localStorage quota exceeded for key: ${key}`),
          'Storage SetItem'
        );
      } else {
        ErrorHandler.handleError(error, 'Storage SetItem');
      }
    }
    // We still have the memory backup, so return true
    return true;
  }
}

/**
 * Safely get item from storage (localStorage with memory fallback)
 * @returns The stored value or null if not found
 */
export function safeGetItem(key: string): string | null {
  const fullKey = `${STORAGE_KEY_PREFIX}:${key}`;

  if (!browser) {
    return memoryStorage.get(fullKey) || null;
  }

  try {
    // Try localStorage first
    const value = localStorage.getItem(fullKey);
    if (value !== null) {
      // Sync to memory backup
      memoryStorage.set(fullKey, value);
      return value;
    }

    // Fallback to memory storage
    return memoryStorage.get(fullKey) || null;
  } catch (error) {
    ErrorHandler.handleError(error, 'Storage GetItem');
    return memoryStorage.get(fullKey) || null;
  }
}

/**
 * Safely remove item from storage
 * @returns true if successful, false otherwise
 */
export function safeRemoveItem(key: string): boolean {
  const fullKey = `${STORAGE_KEY_PREFIX}:${key}`;

  // Always remove from memory
  memoryStorage.delete(fullKey);

  if (!browser) return true;

  try {
    localStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    ErrorHandler.handleError(error, 'Storage RemoveItem');
    return false;
  }
}

/**
 * Safely clear all app-specific storage
 * @returns true if successful, false otherwise
 */
export function safeClear(): boolean {
  // Clear memory storage
  memoryStorage.clear();

  if (!browser) return true;

  try {
    // Only clear keys with our prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    ErrorHandler.handleError(error, 'Storage Clear');
    return false;
  }
}

/**
 * Get all storage keys with our prefix
 */
export function getStorageKeys(): string[] {
  const keys: string[] = [];

  if (!browser) {
    // Return memory storage keys
    for (const key of memoryStorage.keys()) {
      keys.push(key.replace(`${STORAGE_KEY_PREFIX}:`, ''));
    }
    return keys;
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keys.push(key.replace(`${STORAGE_KEY_PREFIX}:`, ''));
      }
    }
    return keys;
  } catch (error) {
    ErrorHandler.handleError(error, 'Storage GetKeys');
    return [];
  }
}

/**
 * Parse stored JSON safely
 * @returns Parsed object or defaultValue if parsing fails
 */
export function safeGetJSON<T>(key: string, defaultValue: T): T {
  const value = safeGetItem(key);
  if (value === null) return defaultValue;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    ErrorHandler.handleError(error, `Storage GetJSON: ${key}`);
    return defaultValue;
  }
}

/**
 * Store object as JSON safely
 * @returns true if successful, false otherwise
 */
export function safeSetJSON<T>(key: string, value: T): boolean {
  try {
    const json = JSON.stringify(value);
    return safeSetItem(key, json);
  } catch (error) {
    ErrorHandler.handleError(error, `Storage SetJSON: ${key}`);
    return false;
  }
}

/**
 * Storage usage statistics
 */
export interface StorageStats {
  used: number;
  max: number;
  percentUsed: number;
  keys: number;
  usingLocalStorage: boolean;
}

/**
 * Get storage statistics
 */
export function getStorageStats(): StorageStats {
  const usage = getStorageUsage();
  const keys = getStorageKeys().length;

  return {
    used: usage,
    max: MAX_STORAGE_SIZE_BYTES,
    percentUsed: Math.round((usage / MAX_STORAGE_SIZE_BYTES) * 100),
    keys,
    usingLocalStorage: isStorageAvailable()
  };
}
