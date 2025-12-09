/**
 * Category Utilities for Vocabulary Migration
 *
 * Provides functions for consolidating and standardizing vocabulary categories
 * across different data sources
 */

import type { VocabularyCategory } from '../../src/lib/schemas/unified-vocabulary.js';
import { VocabularyCategorySchema } from '../../src/lib/schemas/unified-vocabulary.js';
import type { ProcessingVocabularyItem } from '../types/vocabulary-types.js';

/**
 * Category mapping configuration
 */
export interface CategoryMappingConfig {
  /**
   * Custom category mappings
   */
  customMappings: Record<string, VocabularyCategory>;

  /**
   * Category hierarchy for organization
   */
  hierarchy: Record<VocabularyCategory, VocabularyCategory[]>;

  /**
   * Default category for uncategorized items
   */
  defaultCategory: VocabularyCategory;

  /**
   * Whether to create parent categories for subcategories
   */
  createParentCategories: boolean;
}

export const DEFAULT_CATEGORY_CONFIG: CategoryMappingConfig = {
  customMappings: {},
  hierarchy: {
    greetings: [],
    numbers: [],
    family: [],
    food: ['fruits', 'vegetables', 'meats', 'dairy', 'beverages'],
    colors: [],
    animals: [],
    body: ['anatomy', 'health'],
    clothing: [],
    house: ['furniture', 'appliances', 'rooms'],
    nature: ['weather', 'geography', 'plants'],
    transport: [],
    technology: [],
    time: ['days', 'months', 'time_expressions'],
    weather: [],
    professions: [],
    places: [],
    grammar: ['verbs', 'nouns', 'adjectives', 'adverbs', 'pronouns', 'prepositions', 'conjunctions', 'interjections'],
    culture: [],
    common_phrases: [],
    verbs: [],
    adjectives: [],
    adverbs: [],
    pronouns: [],
    prepositions: [],
    conjunctions: [],
    interjections: [],
    uncategorized: []
  },
  defaultCategory: 'uncategorized',
  createParentCategories: true
};

/**
 * Standardize a legacy category to the unified category system
 */
export function standardizeCategory(
  legacyCategory: string,
  config: CategoryMappingConfig = DEFAULT_CATEGORY_CONFIG
): VocabularyCategory {
  if (!legacyCategory) {
    return config.defaultCategory;
  }

  // Check for exact match in custom mappings
  const customMapping = config.customMappings[legacyCategory];
  if (customMapping) {
    return customMapping;
  }

  // Normalize the category name
  const normalized = normalizeCategoryName(legacyCategory);

  // Check for direct match in standard categories
  const standardCategories = Object.values(VocabularyCategorySchema.Values);
  for (const category of standardCategories) {
    if (normalizeCategoryName(category) === normalized) {
      return category;
    }
  }

  // Check for partial matches
  for (const category of standardCategories) {
    if (normalized.includes(normalizeCategoryName(category)) ||
        normalizeCategoryName(category).includes(normalized)) {
      return category;
    }
  }

  // Check for common category patterns
  const categoryMap: Record<string, VocabularyCategory> = {
    // English categories
    'food': 'food',
    'household': 'house',
    'verbs': 'verbs',
    'adjectives': 'adjectives',
    'greetings': 'greetings',
    'numbers': 'numbers',
    'family': 'family',
    'colors': 'colors',
    'animals': 'animals',
    'body': 'body',
    'clothing': 'clothing',
    'nature': 'nature',
    'transport': 'transport',
    'technology': 'technology',
    'time': 'time',
    'weather': 'weather',
    'professions': 'professions',
    'places': 'places',
    'grammar': 'grammar',
    'culture': 'culture',
    'common phrases': 'common_phrases',
    'common_phrases': 'common_phrases',
    'phrases': 'common_phrases',
    'expressions': 'common_phrases',

    // German categories
    'zahlen': 'numbers',
    'familie': 'family',
    'farben': 'colors',
    'begrüßung': 'greetings',
    'ausdruck': 'common_phrases',
    'lebensmittel': 'food',
    'transport': 'transport',
    'gesundheit': 'body',
    'natur': 'nature',
    'einkauf': 'uncategorized',
    'tag': 'time',
    'zeit': 'time',

    // Bulgarian categories
    'храна': 'food',
    'дом': 'house',
    'глаголи': 'verbs',
    'прилагателни': 'adjectives',
    'поздрави': 'greetings',
    'числа': 'numbers',
    'семейство': 'family',
    'цветове': 'colors',
    'животни': 'animals',
    'тяло': 'body',
    'облекло': 'clothing',
    'природа': 'nature',
    'транспорт': 'transport',
    'технологии': 'technology',
    'време': 'time',
    'времето': 'time',
    'професии': 'professions',
    'места': 'places',
    'граматика': 'grammar',
    'култура': 'culture',
    'фрази': 'common_phrases',
    'изрази': 'common_phrases'
  };

  // Check for mapped categories
  const mappedCategory = categoryMap[normalized];
  if (mappedCategory) {
    return mappedCategory;
  }

  // Check for category patterns
  if (normalized.includes('verb') || normalized.includes('глагол')) {
    return 'verbs';
  }
  if (normalized.includes('adjektiv') || normalized.includes('прилагател')) {
    return 'adjectives';
  }
  if (normalized.includes('zahl') || normalized.includes('числ')) {
    return 'numbers';
  }
  if (normalized.includes('farb') || normalized.includes('цвет')) {
    return 'colors';
  }
  if (normalized.includes('famil') || normalized.includes('семей')) {
    return 'family';
  }
  if (normalized.includes('begrüß') || normalized.includes('поздрав')) {
    return 'greetings';
  }
  if (normalized.includes('haus') || normalized.includes('дом')) {
    return 'house';
  }
  if (normalized.includes('essen') || normalized.includes('хран')) {
    return 'food';
  }

  // If no match found, return default category
  return config.defaultCategory;
}

/**
 * Normalize category name for comparison
 */
function normalizeCategoryName(category: string): string {
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-я0-9]/g, '') // Remove non-alphanumeric characters
    .replace(/\s+/g, ''); // Remove whitespace
}

/**
 * Consolidate categories for a vocabulary item
 */
export function consolidateItemCategories(
  item: ProcessingVocabularyItem | { categories: string[] },
  config: CategoryMappingConfig = DEFAULT_CATEGORY_CONFIG
): VocabularyCategory[] {
  // Get all categories from the item
  const legacyCategories = Array.isArray(item.categories)
    ? item.categories
    : [item.category].filter(Boolean);

  // Standardize each category
  const standardizedCategories = legacyCategories.map(category => {
    const standardized = standardizeCategory(category, config);
    // Ensure the category is in the correct case (lowercase)
    return standardized.toLowerCase() as VocabularyCategory;
  });

  // Remove duplicates
  const uniqueCategories = Array.from(new Set(standardizedCategories));

  // Add parent categories if configured
  if (config.createParentCategories) {
    return addParentCategories(uniqueCategories, config);
  }

  return uniqueCategories;
}

/**
 * Add parent categories based on hierarchy
 */
function addParentCategories(
  categories: VocabularyCategory[],
  config: CategoryMappingConfig
): VocabularyCategory[] {
  const allCategories = new Set<VocabularyCategory>(categories);

  // Add parent categories for each category
  for (const category of categories) {
    for (const [parent, children] of Object.entries(config.hierarchy)) {
      if (children.includes(category as VocabularyCategory)) {
        allCategories.add(parent as VocabularyCategory);
      }
    }
  }

  return Array.from(allCategories);
}

/**
 * Consolidate categories for a collection of items
 */
export function consolidateCollectionCategories(
  items: Array<ProcessingVocabularyItem | { categories: string[] }>,
  config: CategoryMappingConfig = DEFAULT_CATEGORY_CONFIG
): {
  items: Array<{ id: string; categories: VocabularyCategory[] }>;
  allCategories: VocabularyCategory[];
  categoryCounts: Record<VocabularyCategory, number>;
} {
  const consolidatedItems: Array<{ id: string; categories: VocabularyCategory[] }> = [];
  const categoryCounts: Record<VocabularyCategory, number> = {} as Record<VocabularyCategory, number>;
  const allCategories = new Set<VocabularyCategory>();

  // Initialize category counts
  Object.values(VocabularyCategorySchema.Values).forEach(category => {
    categoryCounts[category] = 0;
  });

  // Process each item
  items.forEach(item => {
    const id = 'id' in item ? item.id : `temp-${Math.random().toString(36).substring(2, 9)}`;
    const categories = consolidateItemCategories(item, config);

    consolidatedItems.push({ id, categories });

    // Update category counts
    categories.forEach(category => {
      categoryCounts[category]++;
      allCategories.add(category);
    });
  });

  return {
    items: consolidatedItems,
    allCategories: Array.from(allCategories),
    categoryCounts
  };
}

/**
 * Create a category hierarchy structure
 */
export function createCategoryHierarchy(
  config: CategoryMappingConfig = DEFAULT_CATEGORY_CONFIG
): Record<VocabularyCategory, { children: VocabularyCategory[]; parents: VocabularyCategory[] }> {
  const hierarchy: Record<VocabularyCategory, { children: VocabularyCategory[]; parents: VocabularyCategory[] }> = {} as Record<VocabularyCategory, { children: VocabularyCategory[]; parents: VocabularyCategory[] }>;

  // Initialize hierarchy
  Object.values(VocabularyCategorySchema.Values).forEach(category => {
    hierarchy[category] = { children: [], parents: [] };
  });

  // Build parent-child relationships
  for (const [parent, children] of Object.entries(config.hierarchy)) {
    const parentCategory = parent as VocabularyCategory;

    children.forEach(child => {
      const childCategory = child as VocabularyCategory;
      hierarchy[parentCategory].children.push(childCategory);
      hierarchy[childCategory].parents.push(parentCategory);
    });
  }

  return hierarchy;
}

/**
 * Get category path in the hierarchy
 */
export function getCategoryPath(
  category: VocabularyCategory,
  hierarchy: Record<VocabularyCategory, { children: VocabularyCategory[]; parents: VocabularyCategory[] }>
): VocabularyCategory[] {
  const path: VocabularyCategory[] = [category];
  let current = category;

  // Find all parent categories
  while (hierarchy[current].parents.length > 0) {
    // Get the first parent (assuming single inheritance)
    const parent = hierarchy[current].parents[0];
    path.unshift(parent);
    current = parent;
  }

  return path;
}

/**
 * Get all categories in a hierarchy path
 */
export function getCategoryWithDescendants(
  category: VocabularyCategory,
  hierarchy: Record<VocabularyCategory, { children: VocabularyCategory[]; parents: VocabularyCategory[] }>
): VocabularyCategory[] {
  const allCategories = new Set<VocabularyCategory>([category]);

  // Recursively add all children
  function addChildren(parent: VocabularyCategory) {
    hierarchy[parent].children.forEach(child => {
      allCategories.add(child);
      addChildren(child);
    });
  }

  addChildren(category);

  return Array.from(allCategories);
}

/**
 * Validate category configuration
 */
export function validateCategoryConfig(
  config: CategoryMappingConfig = DEFAULT_CATEGORY_CONFIG
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const validCategories = new Set(Object.values(VocabularyCategorySchema.Values));

  // Check custom mappings
  for (const [legacyCategory, mappedCategory] of Object.entries(config.customMappings)) {
    if (!validCategories.has(mappedCategory)) {
      issues.push(`Custom mapping "${legacyCategory}" -> "${mappedCategory}" is invalid. "${mappedCategory}" is not a valid category.`);
    }
  }

  // Check hierarchy
  for (const [parent, children] of Object.entries(config.hierarchy)) {
    if (!validCategories.has(parent as VocabularyCategory)) {
      issues.push(`Parent category "${parent}" in hierarchy is not a valid category.`);
    }

    children.forEach(child => {
      if (!validCategories.has(child as VocabularyCategory)) {
        issues.push(`Child category "${child}" of parent "${parent}" is not a valid category.`);
      }
    });
  }

  // Check default category
  if (!validCategories.has(config.defaultCategory)) {
    issues.push(`Default category "${config.defaultCategory}" is not a valid category.`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Create a category mapping report
 */
export function createCategoryMappingReport(
  items: Array<ProcessingVocabularyItem | { categories: string[] }>,
  config: CategoryMappingConfig = DEFAULT_CATEGORY_CONFIG
): {
  originalCategories: Record<string, number>;
  standardizedCategories: Record<VocabularyCategory, number>;
  mappingDetails: Array<{
    original: string;
    standardized: VocabularyCategory;
    count: number;
  }>;
  uncategorizedCount: number;
} {
  const originalCounts: Record<string, number> = {};
  const standardizedCounts: Record<VocabularyCategory, number> = {} as Record<VocabularyCategory, number>;
  const mappingDetails: Array<{ original: string; standardized: VocabularyCategory; count: number }> = [];

  // Initialize standardized counts
  Object.values(VocabularyCategorySchema.Values).forEach(category => {
    standardizedCounts[category] = 0;
  });

  // Count original categories
  items.forEach(item => {
    const legacyCategories = Array.isArray(item.categories)
      ? item.categories
      : [item.category].filter(Boolean);

    legacyCategories.forEach(category => {
      originalCounts[category] = (originalCounts[category] || 0) + 1;
    });
  });

  // Count standardized categories and track mappings
  const mappingMap = new Map<string, Map<VocabularyCategory, number>>();

  items.forEach(item => {
    const legacyCategories = Array.isArray(item.categories)
      ? item.categories
      : [item.category].filter(Boolean);

    legacyCategories.forEach(legacyCategory => {
      const standardized = standardizeCategory(legacyCategory, config);

      // Update standardized counts
      standardizedCounts[standardized]++;

      // Track mapping details
      if (!mappingMap.has(legacyCategory)) {
        mappingMap.set(legacyCategory, new Map<VocabularyCategory, number>());
      }
      const categoryMap = mappingMap.get(legacyCategory)!;
      categoryMap.set(standardized, (categoryMap.get(standardized) || 0) + 1);
    });
  });

  // Create mapping details
  mappingMap.forEach((categoryMap, original) => {
    categoryMap.forEach((count, standardized) => {
      mappingDetails.push({
        original,
        standardized,
        count
      });
    });
  });

  // Sort mapping details by count (descending)
  mappingDetails.sort((a, b) => b.count - a.count);

  return {
    originalCategories: originalCounts,
    standardizedCategories: standardizedCounts,
    mappingDetails,
    uncategorizedCount: standardizedCounts[config.defaultCategory]
  };
}

/**
 * Suggest category mappings based on data analysis
 */
export function suggestCategoryMappings(
  items: Array<ProcessingVocabularyItem | { categories: string[] }>,
  config: CategoryMappingConfig = DEFAULT_CATEGORY_CONFIG
): Record<string, VocabularyCategory> {
  const suggestions: Record<string, VocabularyCategory> = {};
  const originalCounts: Record<string, number> = {};
  const categoryAssociations: Record<string, Record<VocabularyCategory, number>> = {};

  // Count original categories and track associations
  items.forEach(item => {
    const legacyCategories = Array.isArray(item.categories)
      ? item.categories
      : [item.category].filter(Boolean);

    legacyCategories.forEach(legacyCategory => {
      originalCounts[legacyCategory] = (originalCounts[legacyCategory] || 0) + 1;

      if (!categoryAssociations[legacyCategory]) {
        categoryAssociations[legacyCategory] = {} as Record<VocabularyCategory, number>;
      }

      const standardized = standardizeCategory(legacyCategory, config);
      categoryAssociations[legacyCategory][standardized] =
        (categoryAssociations[legacyCategory][standardized] || 0) + 1;
    });
  });

  // Generate suggestions for categories with multiple mappings
  for (const [legacyCategory, associations] of Object.entries(categoryAssociations)) {
    const total = originalCounts[legacyCategory];
    const associationEntries = Object.entries(associations);

    // If there's only one association, no need for suggestion
    if (associationEntries.length === 1) continue;

    // Find the most common association
    associationEntries.sort((a, b) => b[1] - a[1]);
    const [mostCommonCategory, mostCommonCount] = associationEntries[0];

    // If the most common association covers at least 70% of cases, suggest it
    if (mostCommonCount / total >= 0.7) {
      suggestions[legacyCategory] = mostCommonCategory as VocabularyCategory;
    }
  }

  return suggestions;
}

/**
 * Create a category tree structure
 */
export interface CategoryNode {
	name: VocabularyCategory;
	value: VocabularyCategory;
	children: CategoryNode[];
}

export function createCategoryTree(
	config: CategoryMappingConfig = DEFAULT_CATEGORY_CONFIG
): CategoryNode[] {
	const hierarchy = createCategoryHierarchy(config);
	const rootCategories = Object.entries(hierarchy)
		.filter(([_, { parents }]) => parents.length === 0)
		.map(([category]) => category as VocabularyCategory);

	function buildTree(category: VocabularyCategory): CategoryNode {
		const { children } = hierarchy[category];

		if (children.length === 0) {
      return {
        name: category,
        value: category,
        children: []
      };
    }

    return {
      name: category,
      value: category,
      children: children.map(child => buildTree(child))
    };
  }

  return rootCategories.map(root => buildTree(root));
}