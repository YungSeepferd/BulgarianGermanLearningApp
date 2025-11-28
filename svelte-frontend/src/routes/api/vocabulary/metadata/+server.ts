/**
 * Vocabulary Metadata API Routes
 * @file routes/api/vocabulary/metadata/+server.ts
 * @description SvelteKit API routes for vocabulary metadata
 * @version 1.0.0
 * @updated November 2025
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import type { VocabularyItem, VocabularyChunkMetadata } from '$lib/types/index.js';
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
 * Generate chunk metadata
 */
function generateChunkMetadata(items: VocabularyItem[]): VocabularyChunkMetadata[] {
  const chunkSize = 50;
  const totalChunks = Math.ceil(items.length / chunkSize);
  const chunks: VocabularyChunkMetadata[] = [];
  
  // Generate numeric chunks
  for (let i = 0; i < totalChunks; i++) {
    const startIndex = i * chunkSize;
    const endIndex = Math.min(startIndex + chunkSize, items.length);
    const chunkItems = items.slice(startIndex, endIndex);
    
    chunks.push({
      name: i.toString(),
      level: getUniqueLevels(chunkItems)[0] || 'A1',
      category: getUniqueCategories(chunkItems)[0] || 'general',
      count: chunkItems.length,
      size: chunkItems.length,
      totalItems: chunkItems.length,
      levels: getUniqueLevels(chunkItems),
      categories: getUniqueCategories(chunkItems),
      description: `Chunk ${i + 1} of ${totalChunks} (${startIndex + 1}-${endIndex})`,
      lastModified: Date.now()
    });
  }
  
  // Generate level-based chunks
  const levels = getUniqueLevels(items);
  levels.forEach(level => {
    const levelItems = items.filter(item => item.level === level);
    if (levelItems.length > 0) {
      chunks.push({
        name: level,
        level: level,
        category: getUniqueCategories(levelItems)[0] || 'general',
        count: levelItems.length,
        size: levelItems.length,
        totalItems: levelItems.length,
        levels: [level],
        categories: getUniqueCategories(levelItems),
        description: `All ${level} vocabulary items (${levelItems.length} items)`,
        lastModified: Date.now()
      });
    }
  });
  
  // Generate category-based chunks for major categories
  const categories = getUniqueCategories(items);
  const majorCategories = categories.filter(cat => 
    items.filter(item => item.category === cat).length >= 10
  );
  
  majorCategories.forEach(category => {
    const categoryItems = items.filter(item => item.category === category);
    chunks.push({
      name: category,
      level: getUniqueLevels(categoryItems)[0] || 'A1',
      category: category,
      count: categoryItems.length,
      size: categoryItems.length,
      totalItems: categoryItems.length,
      levels: getUniqueLevels(categoryItems),
      categories: [category],
      description: `All ${category} vocabulary items (${categoryItems.length} items)`,
      lastModified: Date.now()
    });
  });
  
  return chunks;
}

/**
 * Get unique levels from items
 */
function getUniqueLevels(items: VocabularyItem[]): string[] {
  const levels = new Set(items.map(item => item.level));
  return Array.from(levels).sort();
}

/**
 * Get unique categories from items
 */
function getUniqueCategories(items: VocabularyItem[]): string[] {
  const categories = new Set(items.map(item => item.category));
  return Array.from(categories).sort();
}

/**
 * Get vocabulary statistics
 */
function getVocabularyStats(items: VocabularyItem[]) {
  const stats = {
    total: items.length,
    byLevel: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byDirection: {
      'bg-de': 0,
      'de-bg': 0
    },
    difficultyDistribution: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    frequencyDistribution: {
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  items.forEach(item => {
    // Count by level
    stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
    
    // Count by category
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    
    // Count by direction
    if (item.source_lang === 'bg' && item.target_lang === 'de') {
      stats.byDirection['bg-de']++;
    } else if (item.source_lang === 'de' && item.target_lang === 'bg') {
      stats.byDirection['de-bg']++;
    }
    
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
    
    // Count by frequency
    if (item.frequency !== undefined) {
      if (item.frequency >= 80) {
        stats.frequencyDistribution.high++;
      } else if (item.frequency >= 50) {
        stats.frequencyDistribution.medium++;
      } else {
        stats.frequencyDistribution.low++;
      }
    }
  });
  
  return stats;
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/vocabulary/metadata - Get vocabulary metadata
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    const includeStats = url.searchParams.get('includeStats') === 'true';
    const includeChunks = url.searchParams.get('includeChunks') !== 'false'; // default to true
    
    // Validate and process vocabulary data
    const validatedItems = vocabularyData.map(validateVocabularyItem);
    
    const response: any = {
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    // Include chunk metadata
    if (includeChunks) {
      response.chunks = generateChunkMetadata(validatedItems);
    }
    
    // Include statistics if requested
    if (includeStats) {
      response.stats = getVocabularyStats(validatedItems);
      response.summary = {
        totalItems: validatedItems.length,
        totalChunks: Math.ceil(validatedItems.length / 50),
        levels: getUniqueLevels(validatedItems),
        categories: getUniqueCategories(validatedItems)
      };
    }
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading metadata:', error);
    
    return json(
      { 
        error: 'Failed to load vocabulary metadata',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};

/**
 * POST /api/vocabulary/metadata - Alternative method for getting metadata
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    
    const { includeStats = false, includeChunks = true, filters } = body;
    
    // Validate and process vocabulary data
    let validatedItems = vocabularyData.map(validateVocabularyItem);
    
    // Apply filters if provided
    if (filters) {
      const { level, category, direction } = filters;
      
      if (level && level !== 'all') {
        validatedItems = validatedItems.filter((item: VocabularyItem) => item.level === level);
      }

      if (category && category !== 'all') {
        validatedItems = validatedItems.filter((item: VocabularyItem) => item.category === category);
      }

      if (direction) {
        validatedItems = validatedItems.filter((item: VocabularyItem) =>
          (direction === 'bg-de' && item.source_lang === 'bg') ||
          (direction === 'de-bg' && item.source_lang === 'de')
        );
      }
    }
    
    const response: any = {
      timestamp: Date.now(),
      version: '1.0.0',
      filtered: !!filters
    };
    
    // Include chunk metadata
    if (includeChunks) {
      response.chunks = generateChunkMetadata(validatedItems);
    }
    
    // Include statistics if requested
    if (includeStats) {
      response.stats = getVocabularyStats(validatedItems);
      response.summary = {
        totalItems: validatedItems.length,
        totalChunks: Math.ceil(validatedItems.length / 50),
        levels: getUniqueLevels(validatedItems),
        categories: getUniqueCategories(validatedItems)
      };
    }
    
    return json(response);
  } catch (error) {
    console.error('[VocabularyAPI] Error loading metadata:', error);
    
    return json(
      { 
        error: 'Failed to load vocabulary metadata',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};