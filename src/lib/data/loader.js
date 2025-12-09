/**
 * Vocabulary Data Loader
 *
 * Handles loading, caching, and validation of vocabulary data
 * Supports both server-side and client-side loading patterns
 */
import { DataLoader } from './DataLoader.svelte';
import { VocabularyItemSchema, VocabularyCollectionSchema } from '../schemas/vocabulary';
import { z } from 'zod';
// Cache configuration
const CACHE_KEY = 'vocabulary-cache';
const CACHE_EXPIRY_HOURS = 24;
/**
 * Load vocabulary data from various sources with fallback mechanism
 */
export async function loadVocabulary() {
    try {
        // Try to load from static endpoint first (fastest)
        return await loadFromStaticEndpoint();
    }
    catch (error) {
        console.warn('Failed to load from static endpoint, trying cache:', error);
        try {
            // Fallback to cache
            return await loadFromCache();
        }
        catch (cacheError) {
            console.warn('Failed to load from cache, trying bundled data:', cacheError);
            try {
                // Final fallback to bundled data
                return await loadBundledData();
            }
            catch (bundledError) {
                console.error('All loading methods failed:', bundledError);
                throw new Error('Failed to load vocabulary data from all sources');
            }
        }
    }
}
/**
 * Load vocabulary from static endpoint
 */
async function loadFromStaticEndpoint() {
    const response = await fetch('/data/vocabulary.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return VocabularyCollectionSchema.parse(data);
}
/**
 * Load vocabulary from localStorage cache
 */
async function loadFromCache() {
    if (typeof localStorage === 'undefined') {
        throw new Error('localStorage not available');
    }
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) {
        throw new Error('No cached vocabulary data found');
    }
    const { data, timestamp } = JSON.parse(cachedData);
    // Check if cache is expired
    const now = new Date();
    const cacheDate = new Date(timestamp);
    const hoursDiff = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > CACHE_EXPIRY_HOURS) {
        throw new Error('Cache expired');
    }
    return VocabularyCollectionSchema.parse(data);
}
/**
 * Load bundled vocabulary data (fallback)
 * Handles both browser and Node.js environments
 */
async function loadBundledData() {
    let data = [];
    // In Node.js environment (Vitest, Node.js), we'll mock this function for tests
    // The actual implementation will only be used in browser environment
    // where we expect the data to be available at '/data/vocabulary-unified.json'
    try {
        // Browser environment - use fetch API
        const response = await fetch('/data/vocabulary-unified.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        data = await response.json();
    }
    catch (fetchError) {
        console.error('Failed to fetch vocabulary data:', fetchError);
        // Final fallback to empty array
        data = [];
    }
    // Create a collection from the bundled items
    const collection = {
        id: crypto.randomUUID(),
        name: 'German-Bulgarian Vocabulary Collection (Bundled)',
        description: 'Fallback vocabulary collection from bundled data',
        items: z.array(VocabularyItemSchema).parse(data),
        languagePair: 'de-bg',
        difficultyRange: [1, 5],
        categories: Array.from(new Set(data.flatMap((item) => item.categories || []))),
        createdAt: new Date(),
        updatedAt: new Date()
    };
    return VocabularyCollectionSchema.parse(collection);
}
/**
 * Cache vocabulary data in localStorage
 */
export function cacheVocabulary(data) {
    if (typeof localStorage === 'undefined') {
        return;
    }
    const cacheData = {
        data,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}
/**
 * Load vocabulary by search parameters
 */
export async function loadVocabularyBySearch(params) {
    const collection = await loadVocabulary();
    let items = [...collection.items];
    // Apply filters
    if (params.query) {
        const query = params.query.toLowerCase();
        items = items.filter(item => item.german.toLowerCase().includes(query) ||
            item.bulgarian.toLowerCase().includes(query) ||
            (item.metadata?.examples?.some(example => example.german.toLowerCase().includes(query) ||
                example.bulgarian.toLowerCase().includes(query)) ?? false));
    }
    if (params.partOfSpeech) {
        items = items.filter(item => item.partOfSpeech === params.partOfSpeech);
    }
    if (params.difficulty) {
        items = items.filter(item => item.difficulty === params.difficulty);
    }
    if (params.categories && params.categories.length > 0) {
        items = items.filter(item => item.categories.some(category => params.categories?.includes(category)));
    }
    // Get total count before pagination
    const total = items.length;
    // Apply pagination
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    items = items.slice(offset, offset + limit);
    return {
        items,
        total,
        hasMore: offset + limit < total
    };
}
/**
 * Load vocabulary by ID
 */
export async function loadVocabularyById(id) {
    const collection = await loadVocabulary();
    return collection.items.find(item => item.id === id) || null;
}
/**
 * Load vocabulary by category
 */
export async function loadVocabularyByCategory(category, options = {}) {
    const collection = await loadVocabulary();
    let items = collection.items.filter(item => item.categories.includes(category));
    if (options.difficulty) {
        items = items.filter(item => item.difficulty === options.difficulty);
    }
    if (options.limit) {
        items = items.slice(0, options.limit);
    }
    return items;
}
/**
 * Load vocabulary by difficulty level
 */
export async function loadVocabularyByDifficulty(difficulty, options = {}) {
    const collection = await loadVocabulary();
    let items = collection.items.filter(item => item.difficulty === difficulty);
    if (options.category) {
        items = items.filter(item => item.categories.includes(options.category));
    }
    if (options.limit) {
        items = items.slice(0, options.limit);
    }
    return items;
}
/**
 * Get random vocabulary items
 */
export async function getRandomVocabulary(count = 5, options = {}) {
    const collection = await loadVocabulary();
    let items = [...collection.items];
    if (options.difficulty) {
        items = items.filter(item => item.difficulty === options.difficulty);
    }
    if (options.category) {
        items = items.filter(item => item.categories.includes(options.category));
    }
    // Shuffle and select random items
    const shuffled = items.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
/**
 * Initialize vocabulary data (should be called during app startup)
 */
export async function initializeVocabulary() {
    try {
        // Load and cache vocabulary data
        const vocabulary = await loadVocabulary();
        cacheVocabulary(vocabulary);
        console.log('Vocabulary data initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize vocabulary data:', error);
        throw error;
    }
}
//# sourceMappingURL=loader.js.map