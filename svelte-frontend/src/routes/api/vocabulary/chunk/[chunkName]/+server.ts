/**
 * Vocabulary Chunk API Routes
 * @file routes/api/vocabulary/chunk/[chunkName]/+server.ts
 * @description SvelteKit API routes for loading vocabulary chunks
 * @version 1.0.0
 * @updated November 2025
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import type { VocabularyItem, VocabularyAPIResponse } from '$lib/types/index.js';
import vocabularyData from '../../../../../../data/vocabulary.json';

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
 * Get vocabulary chunk by name
 */
function getVocabularyChunk(chunkName: string, allItems: VocabularyItem[]): VocabularyItem[] {
  // For now, we'll implement simple chunking strategies
  // In a real implementation, this could be more sophisticated
  
  const chunkSize = 50;
  const startIndex = getChunkStartIndex(chunkName, allItems.length);
  const endIndex = Math.min(startIndex + chunkSize, allItems.length);
  
  return allItems.slice(startIndex, endIndex);
}

/**
 * Get start index for chunk based on chunk name
 */
function getChunkStartIndex(chunkName: string, totalItems: number): number {
  // Handle numeric chunk names (e.g., "0", "1", "2")
  if (/^\d+$/.test(chunkName)) {
    const chunkNumber = parseInt(chunkName, 10);
    return chunkNumber * 50;
  }
  
  // Handle level-based chunks (e.g., "A1", "A2", "B1", etc.)
  if (/^[A-Z][0-9]$/.test(chunkName)) {
    // This would require filtering by level first
    // For now, return 0 as a placeholder
    return 0;
  }
  
  // Handle category-based chunks
  // For now, return 0 as a placeholder
  return 0;
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/vocabulary/chunk/[chunkName] - Load vocabulary chunk by name
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { chunkName } = params;
    
    if (!chunkName) {
      return json(
        { error: 'Chunk name is required' },
        { status: 400 }
      );
    }
    
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Get chunk data
    const chunkItems = getVocabularyChunk(chunkName, validatedItems);
    
    const response = createAPIResponse(chunkItems);
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading chunk:', error);
    
    return json(
      { 
        error: 'Failed to load vocabulary chunk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};

/**
 * POST /api/vocabulary/chunk/[chunkName] - Alternative method for loading chunk
 */
export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { chunkName } = params;
    
    if (!chunkName) {
      return json(
        { error: 'Chunk name is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json().catch(() => ({}));
    
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Apply additional filters from request body
    const { level, category, search, direction } = body;
    
    let chunkItems = getVocabularyChunk(chunkName, validatedItems);
    
    // Apply filters if provided
    if (level || category || search || direction) {
      chunkItems = filterVocabularyItems(chunkItems, level, category, search, direction);
    }
    
    const response = createAPIResponse(chunkItems);
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading chunk:', error);
    
    return json(
      { 
        error: 'Failed to load vocabulary chunk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};

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