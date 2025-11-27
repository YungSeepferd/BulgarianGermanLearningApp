/**
 * Vocabulary API Routes
 * @file routes/api/vocabulary/+server.ts
 * @description SvelteKit API routes for vocabulary data management
 * @version 1.0.0
 * @updated November 2025
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import type { VocabularyItem, VocabularyAPIResponse, VocabularyChunkMetadata } from '$lib/types/index.js';
import vocabularyData from '../../../../../data/vocabulary.json';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate vocabulary item
 */
function validateVocabularyItem(item: any): VocabularyItem {
  if (!item || typeof item !== 'object') {
    throw new Error('Invalid vocabulary item: must be an object');
  }
  
  const required = ['id', 'word', 'translation', 'source_lang', 'target_lang', 'category', 'level'];
  for (const field of required) {
    if (!(field in item)) {
      throw new Error(`Invalid vocabulary item: missing required field '${field}'`);
    }
  }
  
  if (!['bg', 'de'].includes(item.source_lang) || !['bg', 'de'].includes(item.target_lang)) {
    throw new Error('Invalid vocabulary item: source_lang and target_lang must be "bg" or "de"');
  }
  
  if (!['A1', 'A2', 'B1', 'B2', 'C1'].includes(item.level)) {
    throw new Error('Invalid vocabulary item: level must be one of A1, A2, B1, B2, C1');
  }
  
  return item as VocabularyItem;
}

/**
 * Create API response
 */
function createAPIResponse(items: VocabularyItem[], hasMore = false): VocabularyAPIResponse {
  return {
    data: items,
    total: items.length,
    loaded: items.length,
    hasMore,
    timestamp: Date.now()
  };
}

/**
 * Filter vocabulary items
 */
function filterVocabularyItems(
  items: VocabularyItem[],
  level?: string,
  category?: string,
  search?: string,
  direction?: string
): VocabularyItem[] {
  let filtered = [...items];

  // Apply level filter
  if (level && level !== 'all') {
    filtered = filtered.filter(item => item.level === level);
  }

  // Apply category filter
  if (category && category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  // Apply search filter
  if (search && search.trim()) {
    const searchTerm = search.toLowerCase().trim();
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

/**
 * Get unique categories
 */
function getUniqueCategories(items: VocabularyItem[]): string[] {
  const categories = new Set(items.map(item => item.category));
  return Array.from(categories).sort();
}

/**
 * Get unique levels
 */
function getUniqueLevels(items: VocabularyItem[]): string[] {
  const levels = new Set(items.map(item => item.level));
  return Array.from(levels).sort();
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/vocabulary/all - Load all vocabulary items
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Apply filters if provided
    const level = url.searchParams.get('level') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const direction = url.searchParams.get('direction') || undefined;
    
    let filteredItems = validatedItems;
    
    if (level || category || search || direction) {
      filteredItems = filterVocabularyItems(validatedItems, level, category, search, direction);
    }
    
    const response = createAPIResponse(filteredItems);
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading vocabulary:', error);
    
    return json(
      { 
        error: 'Failed to load vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};

/**
 * POST /api/vocabulary/all - Alternative method for loading vocabulary
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Apply filters from request body
    const { level, category, search, direction } = body;
    
    let filteredItems = validatedItems;
    
    if (level || category || search || direction) {
      filteredItems = filterVocabularyItems(validatedItems, level, category, search, direction);
    }
    
    const response = createAPIResponse(filteredItems);
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading vocabulary:', error);
    
    return json(
      { 
        error: 'Failed to load vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};