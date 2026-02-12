/**
 * Persisted Stores - Core wrapper around svelte-persisted-store
 *
 * Provides app-specific defaults and re-exports with our naming conventions.
 * This is the foundation for all persistent storage in the app.
 *
 * @example
 * ```typescript
 * import { persisted } from './persisted'
 * const myStore = persisted('my-key', defaultValue)
 * ```
 */

import { persisted as basePersisted } from 'svelte-persisted-store';
import type { Options, StorageType, Serializer } from 'svelte-persisted-store';
import { STORAGE_KEY_PREFIX } from '$lib/constants/app';

// Re-export types from the library
export type { StorageType, Serializer };
export type { Options as PersistedOptions };

/**
 * Create a persisted store with app-specific defaults
 *
 * Features:
 * - Automatic key prefixing with app namespace
 * - TypeScript generics for type safety
 * - SSR compatibility
 * - JSON serialization/deserialization
 * - Storage event synchronization across tabs
 *
 * @param key Unique key for this store (will be prefixed with app namespace)
 * @param initialValue Default value if nothing stored
 * @param options Additional configuration options
 * @returns A Svelte store that syncs with browser storage
 */
export function persisted<T>(
  key: string,
  initialValue: T,
  options?: Options<T, T>
) {
  const fullKey = `${STORAGE_KEY_PREFIX}:${key}`;

  const persistOptions: Options<T, T> = {
    storage: options?.storage ?? 'local',
    serializer: options?.serializer ?? {
      stringify: JSON.stringify,
      parse: JSON.parse
    },
    syncTabs: true,
    ...options
  };

  return basePersisted<T>(fullKey, initialValue, persistOptions);
}

/**
 * Create a session-based persisted store (clears when tab closes)
 */
export function sessionPersisted<T>(
  key: string,
  initialValue: T,
  options?: Omit<Options<T, T>, 'storage'>
) {
  return persisted<T>(key, initialValue, { ...options, storage: 'session' });
}
