/**
 * Vocabulary API for SvelteKit
 * @file api/vocabulary.ts
 * @description Vocabulary data management API for SvelteKit components
 * @version 1.0.0
 * @updated November 2025
 */

import type { 
  VocabularyItem, 
  VocabularyAPIResponse, 
  VocabularyLoadingState, 
  VocabularyChunkMetadata,
  VocabularyFilters,
  LanguageDirection
} from '$lib/types/index.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * API configuration
 */
const API_CONFIG = {
  baseUrl: '/api/vocabulary',
  chunkSize: 50,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000
};

/**
 * Cache for vocabulary data
 */
class VocabularyCache {
  private cache = new Map<string, { data: VocabularyItem[]; timestamp: number }>();
  
  set(key: string, data: VocabularyItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key: string): VocabularyItem[] | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    
    if (Date.now() - entry.timestamp > API_CONFIG.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

const vocabularyCache = new VocabularyCache();

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error classes for vocabulary API
 */
export class VocabularyAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'VocabularyAPIError';
  }
}

export class NetworkError extends VocabularyAPIError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', undefined, originalError);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends VocabularyAPIError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class CacheError extends VocabularyAPIError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CACHE_ERROR', undefined, originalError);
    this.name = 'CacheError';
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts: number = API_CONFIG.retryAttempts,
  delay: number = API_CONFIG.retryDelay
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }
    
    console.warn(`[VocabularyAPI] Retrying after error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryWithBackoff(fn, attempts - 1, delay * 2);
  }
}

/**
 * Validate vocabulary item
 */
function validateVocabularyItem(item: any): VocabularyItem {
  if (!item || typeof item !== 'object') {
    throw new ValidationError('Invalid vocabulary item: must be an object');
  }
  
  const required = ['id', 'word', 'translation', 'source_lang', 'target_lang', 'category', 'level'];
  for (const field of required) {
    if (!(field in item)) {
      throw new ValidationError(`Invalid vocabulary item: missing required field '${field}'`);
    }
  }
  
  if (!['bg', 'de'].includes(item.source_lang) || !['bg', 'de'].includes(item.target_lang)) {
    throw new ValidationError('Invalid vocabulary item: source_lang and target_lang must be "bg" or "de"');
  }
  
  if (!['A1', 'A2', 'B1', 'B2', 'C1'].includes(item.level)) {
    throw new ValidationError('Invalid vocabulary item: level must be one of A1, A2, B1, B2, C1');
  }
  
  return item as VocabularyItem;
}

/**
 * Generate cache key
 */
function generateCacheKey(filters: VocabularyFilters, direction?: LanguageDirection): string {
  const parts = [
    filters.level || 'all',
    filters.category || 'all',
    filters.search || '',
    direction || 'bg-de'
  ];
  return parts.join(':');
}

// ============================================================================
// MAIN API CLASS
// ============================================================================

/**
 * Vocabulary API class for managing vocabulary data
 */
export class VocabularyAPI {
  private loadingState: VocabularyLoadingState = {
    isLoading: false,
    progress: 0,
    totalChunks: 0,
    loadedChunks: 0,
    currentChunk: '',
    error: null
  };

  /**
   * Get current loading state
   */
  getLoadingState(): VocabularyLoadingState {
    return { ...this.loadingState };
  }

  /**
   * Update loading state
   */
  private setLoadingState(updates: Partial<VocabularyLoadingState>): void {
    this.loadingState = { ...this.loadingState, ...updates };
  }

  /**
   * Load all vocabulary items
   */
  async loadAll(): Promise<VocabularyItem[]> {
    this.setLoadingState({
      isLoading: true,
      error: null,
      progress: 0
    });

    try {
      const cacheKey = 'all';
      const cached = vocabularyCache.get(cacheKey);
      
      if (cached) {
        this.setLoadingState({ isLoading: false });
        return cached;
      }

      const response = await retryWithBackoff(async () => {
        const res = await fetch(`${API_CONFIG.baseUrl}/all`);
        if (!res.ok) {
          throw new NetworkError(`Failed to load vocabulary: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });

      const data = await this.validateResponse(response);
      const items = data.items || data.data || [];
      const validatedItems = items.map(validateVocabularyItem);
      
      vocabularyCache.set(cacheKey, validatedItems);
      
      this.setLoadingState({
        isLoading: false,
        progress: 100
      });

      return validatedItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setLoadingState({
        isLoading: false,
        error: errorMessage
      });
      throw new VocabularyAPIError(`Failed to load vocabulary: ${errorMessage}`, 'LOAD_ERROR', undefined, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Load vocabulary chunk by name
   */
  async loadChunk(chunkName: string): Promise<VocabularyItem[]> {
    this.setLoadingState({
      isLoading: true,
      error: null,
      currentChunk: chunkName,
      progress: 0
    });

    try {
      const cacheKey = `chunk:${chunkName}`;
      const cached = vocabularyCache.get(cacheKey);
      
      if (cached) {
        this.setLoadingState({ isLoading: false });
        return cached;
      }

      const response = await retryWithBackoff(async () => {
        const res = await fetch(`${API_CONFIG.baseUrl}/chunk/${encodeURIComponent(chunkName)}`);
        if (!res.ok) {
          throw new NetworkError(`Failed to load chunk '${chunkName}': ${res.status} ${res.statusText}`);
        }
        return res.json();
      });

      const data = await this.validateResponse(response);
      const items = data.items || data.data || [];
      const validatedItems = items.map(validateVocabularyItem);
      
      vocabularyCache.set(cacheKey, validatedItems);
      
      this.setLoadingState({
        isLoading: false,
        progress: 100
      });

      return validatedItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setLoadingState({
        isLoading: false,
        error: errorMessage
      });
      throw new VocabularyAPIError(`Failed to load chunk '${chunkName}': ${errorMessage}`, 'CHUNK_LOAD_ERROR', undefined, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Load vocabulary with filters
   */
  async loadFiltered(filters: VocabularyFilters, direction?: LanguageDirection): Promise<VocabularyItem[]> {
    this.setLoadingState({
      isLoading: true,
      error: null,
      progress: 0
    });

    try {
      const cacheKey = generateCacheKey(filters, direction);
      const cached = vocabularyCache.get(cacheKey);
      
      if (cached) {
        this.setLoadingState({ isLoading: false });
        return cached;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.level && filters.level !== 'all') {
        params.append('level', filters.level);
      }
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (direction) {
        params.append('direction', direction);
      }

      const url = `${API_CONFIG.baseUrl}/filtered${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await retryWithBackoff(async () => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new NetworkError(`Failed to load filtered vocabulary: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });

      const data = await this.validateResponse(response);
      const items = data.items || data.data || [];
      const validatedItems = items.map(validateVocabularyItem);
      
      vocabularyCache.set(cacheKey, validatedItems);
      
      this.setLoadingState({
        isLoading: false,
        progress: 100
      });

      return validatedItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setLoadingState({
        isLoading: false,
        error: errorMessage
      });
      throw new VocabularyAPIError(`Failed to load filtered vocabulary: ${errorMessage}`, 'FILTERED_LOAD_ERROR', undefined, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Load due cards for spaced repetition
   */
  async loadDueCards(direction: LanguageDirection = 'bg-de', limit: number = 20): Promise<VocabularyItem[]> {
    this.setLoadingState({
      isLoading: true,
      error: null,
      progress: 0
    });

    try {
      const cacheKey = `due:${direction}:${limit}`;
      const cached = vocabularyCache.get(cacheKey);
      
      if (cached) {
        this.setLoadingState({ isLoading: false });
        return cached;
      }

      const response = await retryWithBackoff(async () => {
        const res = await fetch(`${API_CONFIG.baseUrl}/due?direction=${direction}&limit=${limit}`);
        if (!res.ok) {
          throw new NetworkError(`Failed to load due cards: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });

      const data = await this.validateResponse(response);
      const items = data.items || data.data || [];
      const validatedItems = items.map(validateVocabularyItem);
      
      vocabularyCache.set(cacheKey, validatedItems);
      
      this.setLoadingState({
        isLoading: false,
        progress: 100
      });

      return validatedItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setLoadingState({
        isLoading: false,
        error: errorMessage
      });
      throw new VocabularyAPIError(`Failed to load due cards: ${errorMessage}`, 'DUE_CARDS_ERROR', undefined, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get vocabulary metadata
   */
  async getMetadata(): Promise<VocabularyChunkMetadata[]> {
    try {
      const response = await retryWithBackoff(async () => {
        const res = await fetch(`${API_CONFIG.baseUrl}/metadata`);
        if (!res.ok) {
          throw new NetworkError(`Failed to load metadata: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });

      const data = await response.json();
      
      if (!Array.isArray(data.chunks)) {
        throw new ValidationError('Invalid metadata response: chunks must be an array');
      }

      return data.chunks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new VocabularyAPIError(`Failed to load metadata: ${errorMessage}`, 'METADATA_ERROR', undefined, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Search vocabulary items
   */
  async search(query: string, direction?: LanguageDirection, limit: number = 50): Promise<VocabularyItem[]> {
    if (!query || query.trim().length === 0) {
      throw new ValidationError('Search query cannot be empty');
    }

    this.setLoadingState({
      isLoading: true,
      error: null,
      progress: 0
    });

    try {
      const cacheKey = `search:${query}:${direction || 'all'}:${limit}`;
      const cached = vocabularyCache.get(cacheKey);
      
      if (cached) {
        this.setLoadingState({ isLoading: false });
        return cached;
      }

      const params = new URLSearchParams({
        q: query.trim(),
        limit: limit.toString()
      });
      
      if (direction) {
        params.append('direction', direction);
      }

      const response = await retryWithBackoff(async () => {
        const res = await fetch(`${API_CONFIG.baseUrl}/search?${params.toString()}`);
        if (!res.ok) {
          throw new NetworkError(`Failed to search vocabulary: ${res.status} ${res.statusText}`);
        }
        return res.json();
      });

      const data = await this.validateResponse(response);
      const items = data.items || data.data || [];
      const validatedItems = items.map(validateVocabularyItem);
      
      vocabularyCache.set(cacheKey, validatedItems);
      
      this.setLoadingState({
        isLoading: false,
        progress: 100
      });

      return validatedItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setLoadingState({
        isLoading: false,
        error: errorMessage
      });
      throw new VocabularyAPIError(`Failed to search vocabulary: ${errorMessage}`, 'SEARCH_ERROR', undefined, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Check if API is loading
   */
  isLoading(): boolean {
    return this.loadingState.isLoading;
  }

  /**
   * Get loading progress
   */
  getProgress(): VocabularyLoadingState {
    return this.getLoadingState();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    vocabularyCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: vocabularyCache.size(),
      keys: [...(vocabularyCache as any).cache.keys()]
    };
  }

  /**
   * Validate API response
   */
  private async validateResponse(response: any): Promise<VocabularyAPIResponse> {
    if (!response || typeof response !== 'object') {
      throw new ValidationError('Invalid API response: must be an object');
    }

    // Support both 'items' and 'data' properties for backward compatibility
    const items = response.items || response.data;
    
    if (!Array.isArray(items)) {
      throw new ValidationError('Invalid API response: items/data must be an array');
    }

    return {
      data: items,
      total: response.total || items.length,
      loaded: response.loaded || items.length,
      hasMore: response.hasMore || false,
      timestamp: response.timestamp || Date.now()
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a singleton vocabulary API instance
 */
export const vocabularyAPI = new VocabularyAPI();

/**
 * Load vocabulary with progress callback
 */
export async function loadVocabularyWithProgress(
  filters: VocabularyFilters = { level: 'all', category: 'all', search: '' },
  direction?: LanguageDirection,
  onProgress?: (progress: number, currentChunk: string) => void
): Promise<VocabularyItem[]> {
  const api = new VocabularyAPI();
  
  // Override setLoadingState to provide progress callbacks
  const originalSetLoadingState = api['setLoadingState'].bind(api);
  api['setLoadingState'] = function(state: Partial<VocabularyLoadingState>) {
    originalSetLoadingState(state);
    if (onProgress && typeof state.progress === 'number') {
      onProgress(state.progress, state.currentChunk || '');
    }
  };

  return api.loadFiltered(filters, direction);
}

/**
 * Batch load multiple chunks
 */
export async function loadMultipleChunks(chunkNames: string[]): Promise<VocabularyItem[]> {
  const api = new VocabularyAPI();
  const allItems: VocabularyItem[] = [];
  
  for (let i = 0; i < chunkNames.length; i++) {
    const chunkName = chunkNames[i];
    try {
      const items = await api.loadChunk(chunkName);
      allItems.push(...items);
      
      // Update progress
      api['setLoadingState']({
        progress: ((i + 1) / chunkNames.length) * 100,
        currentChunk: chunkName
      });
    } catch (error) {
      console.error(`Failed to load chunk '${chunkName}':`, error);
      // Continue with other chunks
    }
  }
  
  return allItems;
}

/**
 * Filter vocabulary items locally
 */
export function filterVocabularyItems(
  items: VocabularyItem[], 
  filters: VocabularyFilters,
  direction?: LanguageDirection
): VocabularyItem[] {
  let filtered = [...items];

  // Apply level filter
  if (filters.level && filters.level !== 'all') {
    filtered = filtered.filter(item => item.level === filters.level);
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(item => item.category === filters.category);
  }

  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filtered = filtered.filter(item => 
      item.word.toLowerCase().includes(searchTerm) ||
      item.translation.toLowerCase().includes(searchTerm) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm))
    );
  }

  // Apply direction filter
  if (direction) {
    filtered = filtered.filter(item => 
      (direction === 'bg-de' && item.source_lang === 'bg') ||
      (direction === 'de-bg' && item.source_lang === 'de')
    );
  }

  return filtered;
}

// Export all types and utilities

export { type VocabularyAPIResponse, type VocabularyLoadingState, type VocabularyChunkMetadata, type VocabularyFilters, type LanguageDirection, type VocabularyItem } from '$lib/types/index.js';