/**
 * Vocabulary Search API Routes
 * @file routes/api/vocabulary/search/+server.ts
 * @description SvelteKit API routes for searching vocabulary
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
 * Search vocabulary items
 */
function searchVocabularyItems(
  items: VocabularyItem[],
  query: string,
  direction?: string,
  level?: string,
  category?: string,
  fuzzy = false
): VocabularyItem[] {
  let searchItems = [...items];
  
  // Apply pre-filters
  if (direction) {
    searchItems = searchItems.filter(item => 
      (direction === 'bg-de' && item.source_lang === 'bg') ||
      (direction === 'de-bg' && item.source_lang === 'de')
    );
  }
  
  if (level && level !== 'all') {
    searchItems = searchItems.filter(item => item.level === level);
  }
  
  if (category && category !== 'all') {
    searchItems = searchItems.filter(item => item.category === category);
  }
  
  // Perform search
  const searchTerm = query.toLowerCase().trim();
  
  if (fuzzy) {
    // Fuzzy search - includes partial matches
    return searchItems.filter(item => {
      const wordMatch = item.word.toLowerCase().includes(searchTerm);
      const translationMatch = item.translation.toLowerCase().includes(searchTerm);
      const notesMatch = item.notes && item.notes.toLowerCase().includes(searchTerm);
      const examplesMatch = item.examples && item.examples.some((ex: any) => 
        ex.sentence.toLowerCase().includes(searchTerm) || 
        ex.translation.toLowerCase().includes(searchTerm)
      );
      
      return wordMatch || translationMatch || notesMatch || examplesMatch;
    });
  } else {
    // Exact search - prioritizes exact matches
    const exactMatches = searchItems.filter(item => 
      item.word.toLowerCase() === searchTerm ||
      item.translation.toLowerCase() === searchTerm
    );
    
    const partialMatches = searchItems.filter(item => {
      const wordMatch = item.word.toLowerCase().includes(searchTerm);
      const translationMatch = item.translation.toLowerCase().includes(searchTerm);
      const notesMatch = item.notes && item.notes.toLowerCase().includes(searchTerm);
      
      return wordMatch || translationMatch || notesMatch;
    }).filter(item => 
      !exactMatches.some(exact => exact.id === item.id)
    );
    
    // Return exact matches first, then partial matches
    return [...exactMatches, ...partialMatches];
  }
}

/**
 * Calculate search relevance score
 */
function calculateRelevanceScore(item: VocabularyItem, query: string): number {
  const searchTerm = query.toLowerCase().trim();
  let score = 0;
  
  // Exact word match
  if (item.word.toLowerCase() === searchTerm) {
    score += 100;
  } else if (item.word.toLowerCase().startsWith(searchTerm)) {
    score += 80;
  } else if (item.word.toLowerCase().includes(searchTerm)) {
    score += 60;
  }
  
  // Exact translation match
  if (item.translation.toLowerCase() === searchTerm) {
    score += 90;
  } else if (item.translation.toLowerCase().startsWith(searchTerm)) {
    score += 70;
  } else if (item.translation.toLowerCase().includes(searchTerm)) {
    score += 50;
  }
  
  // Notes match
  if (item.notes && item.notes.toLowerCase().includes(searchTerm)) {
    score += 30;
  }
  
  // Examples match
  if (item.examples) {
    item.examples.forEach((ex: any) => {
      if (ex.sentence.toLowerCase().includes(searchTerm)) {
        score += 20;
      }
      if (ex.translation.toLowerCase().includes(searchTerm)) {
        score += 20;
      }
    });
  }
  
  // Frequency bonus
  if (item.frequency) {
    score += item.frequency / 10;
  }
  
  // Difficulty penalty (easier words get higher score)
  if (item.difficulty) {
    score += (6 - item.difficulty) * 2;
  }
  
  return score;
}

/**
 * Sort search results by relevance
 */
function sortByRelevance(items: VocabularyItem[], query: string): VocabularyItem[] {
  return items
    .map(item => ({
      item,
      score: calculateRelevanceScore(item, query)
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/vocabulary/search - Search vocabulary items
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Get query parameters
    const query = url.searchParams.get('q');
    const direction = url.searchParams.get('direction') || undefined;
    const level = url.searchParams.get('level') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const fuzzy = url.searchParams.get('fuzzy') === 'true';
    const sortBy = url.searchParams.get('sortBy') || 'relevance';
    
    if (!query || query.trim().length === 0) {
      return json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 100) {
      return json(
        { error: 'Invalid limit. Must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Perform search
    let searchResults = searchVocabularyItems(
      validatedItems, 
      query, 
      direction, 
      level, 
      category, 
      fuzzy
    );
    
    // Sort results
    if (sortBy === 'relevance') {
      searchResults = sortByRelevance(searchResults, query);
    } else if (sortBy === 'frequency') {
      searchResults = searchResults.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
    } else if (sortBy === 'difficulty') {
      searchResults = searchResults.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
    } else if (sortBy === 'level') {
      const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
      searchResults = searchResults.sort((a, b) => 
        (levelOrder[a.level as keyof typeof levelOrder] || 999) - 
        (levelOrder[b.level as keyof typeof levelOrder] || 999)
      );
    }
    
    // Apply limit
    const limitedResults = searchResults.slice(0, limit);
    const hasMore = searchResults.length > limit;
    
    const response = createAPIResponse(limitedResults, hasMore);
    
    return json({
      ...response,
      query,
      totalFound: searchResults.length,
      filters: {
        direction,
        level,
        category,
        fuzzy,
        sortBy
      }
    });
  } catch (error) {
    console.error('[VocabularyAPI] Error searching vocabulary:', error);
    
    return json(
      { 
        error: 'Failed to search vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};

/**
 * POST /api/vocabulary/search - Alternative method for searching vocabulary
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Get search parameters from request body
    const { 
      query, 
      direction, 
      level, 
      category, 
      limit = 50, 
      fuzzy = false, 
      sortBy = 'relevance',
      includeContext = false 
    } = body;
    
    if (!query || query.trim().length === 0) {
      return json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 100) {
      return json(
        { error: 'Invalid limit. Must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Perform search
    let searchResults = searchVocabularyItems(
      validatedItems, 
      query, 
      direction, 
      level, 
      category, 
      fuzzy
    );
    
    // Sort results
    if (sortBy === 'relevance') {
      searchResults = sortByRelevance(searchResults, query);
    } else if (sortBy === 'frequency') {
      searchResults = searchResults.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
    } else if (sortBy === 'difficulty') {
      searchResults = searchResults.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
    } else if (sortBy === 'level') {
      const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
      searchResults = searchResults.sort((a, b) => 
        (levelOrder[a.level as keyof typeof levelOrder] || 999) - 
        (levelOrder[b.level as keyof typeof levelOrder] || 999)
      );
    }
    
    // Apply limit
    const limitedResults = searchResults.slice(0, limit);
    const hasMore = searchResults.length > limit;
    
    const response = createAPIResponse(limitedResults, hasMore);
    
    const responseData: any = {
      ...response,
      query,
      totalFound: searchResults.length,
      filters: {
        direction,
        level,
        category,
        fuzzy,
        sortBy
      }
    };
    
    // Include context if requested
    if (includeContext) {
      responseData.context = {
        totalVocabularyItems: validatedItems.length,
        availableLevels: ['A1', 'A2', 'B1', 'B2', 'C1'],
        availableCategories: [...new Set(validatedItems.map((item: VocabularyItem) => item.category))].sort(),
        availableDirections: ['bg-de', 'de-bg']
      };
    }
    
    return json(responseData);
  } catch (error) {
    console.error('[VocabularyAPI] Error searching vocabulary:', error);
    
    return json(
      { 
        error: 'Failed to search vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};