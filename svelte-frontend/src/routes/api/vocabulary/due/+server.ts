/**
 * Vocabulary Due Cards API Routes
 * @file routes/api/vocabulary/due/+server.ts
 * @description SvelteKit API routes for loading due cards for spaced repetition
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
 * Filter vocabulary items by direction
 */
function filterByDirection(items: VocabularyItem[], direction: string): VocabularyItem[] {
  return items.filter(item => 
    (direction === 'bg-de' && item.source_lang === 'bg') ||
    (direction === 'de-bg' && item.source_lang === 'de')
  );
}

/**
 * Get due cards for spaced repetition
 * This is a simplified implementation - in a real app, this would check user progress
 */
function getDueCards(items: VocabularyItem[], direction: string, limit: number): VocabularyItem[] {
  // Filter by direction first
  const directionFiltered = filterByDirection(items, direction);
  
  // For now, we'll return random items as "due" cards
  // In a real implementation, this would check user's spaced repetition schedule
  const shuffled = [...directionFiltered].sort(() => Math.random() - 0.5);
  
  // Prioritize lower difficulty items for beginners
  const prioritized = shuffled.sort((a, b) => {
    if (a.difficulty !== undefined && b.difficulty !== undefined) {
      return a.difficulty - b.difficulty;
    }
    // Fallback to level ordering
    const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
    return (levelOrder[a.level as keyof typeof levelOrder] || 999) - 
           (levelOrder[b.level as keyof typeof levelOrder] || 999);
  });
  
  return prioritized.slice(0, limit);
}

/**
 * Get spaced repetition statistics
 */
function getSpacedRepetitionStats(items: VocabularyItem[], direction: string) {
  const directionFiltered = filterByDirection(items, direction);
  
  const stats = {
    total: directionFiltered.length,
    byLevel: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    difficultyDistribution: {
      easy: 0,
      medium: 0,
      hard: 0
    }
  };
  
  directionFiltered.forEach(item => {
    // Count by level
    stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
    
    // Count by category
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    
    // Count by difficulty
    if (item.difficulty !== undefined) {
      if (item.difficulty <= 2) {
        stats.difficultyDistribution.easy++;
      } else if (item.difficulty <= 4) {
        stats.difficultyDistribution.medium++;
      } else {
        stats.difficultyDistribution.hard++;
      }
    }
  });
  
  return stats;
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/vocabulary/due - Load due cards for spaced repetition
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Get query parameters
    const direction = url.searchParams.get('direction') || 'bg-de';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const includeStats = url.searchParams.get('includeStats') === 'true';
    
    if (!['bg-de', 'de-bg'].includes(direction)) {
      return json(
        { error: 'Invalid direction. Must be "bg-de" or "de-bg"' },
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
    
    // Get due cards
    const dueCards = getDueCards(validatedItems, direction, limit);
    
    const response = createAPIResponse(dueCards, dueCards.length >= limit);
    
    // Include statistics if requested
    if (includeStats) {
      const stats = getSpacedRepetitionStats(validatedItems, direction);
      return json({
        ...response,
        stats
      });
    }
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading due cards:', error);
    
    return json(
      { 
        error: 'Failed to load due cards',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};

/**
 * POST /api/vocabulary/due - Alternative method for loading due cards
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Get parameters from request body
    const { direction = 'bg-de', limit = 20, includeStats = false, levels, categories } = body;
    
    if (!['bg-de', 'de-bg'].includes(direction)) {
      return json(
        { error: 'Invalid direction. Must be "bg-de" or "de-bg"' },
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
    
    // Filter by direction
    let filteredItems = filterByDirection(validatedItems, direction);
    
    // Apply additional filters if provided
    if (levels && levels.length > 0) {
      filteredItems = filteredItems.filter(item => levels.includes(item.level));
    }
    
    if (categories && categories.length > 0) {
      filteredItems = filteredItems.filter(item => categories.includes(item.category));
    }
    
    // Get due cards
    const dueCards = getDueCards(filteredItems, direction, limit);
    
    const response = createAPIResponse(dueCards, dueCards.length >= limit);
    
    // Include statistics if requested
    if (includeStats) {
      const stats = getSpacedRepetitionStats(filteredItems, direction);
      return json({
        ...response,
        stats
      });
    }
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading due cards:', error);
    
    return json(
      { 
        error: 'Failed to load due cards',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};