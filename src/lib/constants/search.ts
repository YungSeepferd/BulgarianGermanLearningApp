/**
 * Search Constants
 *
 * Constants for vocabulary search functionality
 */

// ======================
// Fuse.js Configuration
// ======================

/** Default Fuse.js search threshold (0 = exact match, 1 = match anything) */
export const DEFAULT_FUSE_THRESHOLD = 0.4;

/** Weight for German text in search */
export const FUSE_WEIGHT_GERMAN = 0.4;

/** Weight for Bulgarian text in search */
export const FUSE_WEIGHT_BULGARIAN = 0.4;

/** Weight for categories in search */
export const FUSE_WEIGHT_CATEGORIES = 0.2;

// ======================
// Search Limits
// ======================

/** Maximum number of search results to return */
export const MAX_SEARCH_RESULTS = 1000;

/** Default number of search results */
export const DEFAULT_SEARCH_LIMIT = 20;

/** Minimum query length to trigger search */
export const MIN_SEARCH_QUERY_LENGTH = 1;

// ======================
// Cache Configuration
// ======================

/** Search cache TTL in minutes */
export const SEARCH_CACHE_TTL_MINUTES = 5;

/** Maximum cache entries */
export const MAX_CACHE_ENTRIES = 100;

// ======================
// Highlighting
// ======================

/** Maximum length for search preview */
export const MAX_PREVIEW_LENGTH = 100;

/** Number of characters around match in preview */
export const PREVIEW_CONTEXT_CHARS = 30;
