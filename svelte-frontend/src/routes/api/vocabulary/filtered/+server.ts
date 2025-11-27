/**
 * Vocabulary Filtered API Routes
 * @file routes/api/vocabulary/filtered/+server.ts
 * @description SvelteKit API routes for loading filtered vocabulary
 * @version 1.0.0
 * @updated November 2025
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import type { VocabularyItem, VocabularyAPIResponse } from '$lib/types/index.js';
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
 * Get available filters
 */
function getAvailableFilters(items: VocabularyItem[]) {
  const levels = new Set(items.map(item => item.level));
  const categories = new Set(items.map(item => item.category));
  
  return {
    levels: Array.from(levels).sort(),
    categories: Array.from(categories).sort()
  };
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/vocabulary/filtered - Load filtered vocabulary
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Get query parameters
    const level = url.searchParams.get('level') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const direction = url.searchParams.get('direction') || undefined;
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset') || '0';
    
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Apply filters
    let filteredItems = filterVocabularyItems(validatedItems, level, category, search, direction);
    
    // Apply pagination
    const offsetNum = parseInt(offset, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    
    if (limitNum) {
      filteredItems = filteredItems.slice(offsetNum, offsetNum + limitNum);
    } else if (offsetNum > 0) {
      filteredItems = filteredItems.slice(offsetNum);
    }
    
    const hasMore = limitNum ? (offsetNum + limitNum < validatedItems.length) : false;
    const response = createAPIResponse(filteredItems, hasMore);
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading filtered vocabulary:', error);
    
    return json(
      { 
        error: 'Failed to load filtered vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};

/**
 * POST /api/vocabulary/filtered - Alternative method for loading filtered vocabulary
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Get filter parameters from request body
    const { level, category, search, direction, limit, offset = 0 } = body;
    
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Apply filters
    let filteredItems = filterVocabularyItems(validatedItems, level, category, search, direction);
    
    // Apply pagination
    const offsetNum = parseInt(offset, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    
    if (limitNum) {
      filteredItems = filteredItems.slice(offsetNum, offsetNum + limitNum);
    } else if (offsetNum > 0) {
      filteredItems = filteredItems.slice(offsetNum);
    }
    
    const hasMore = limitNum ? (offsetNum + limitNum < validatedItems.length) : false;
    const response = createAPIResponse(filteredItems, hasMore);
    
    // Include available filters in response
    const availableFilters = getAvailableFilters(validatedItems);
    
    return json({
      ...response,
      filters: availableFilters
    });
  } catch (error) {
    console.error('[VocabularyAPI] Error loading filtered vocabulary:', error);
    
    return json(
      { 
        error: 'Failed to load filtered vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};