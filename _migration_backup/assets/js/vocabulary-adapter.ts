/**
 * Vocabulary Adapter
 * Provides backward compatibility and data transformation for vocabulary systems
 * BUGFIX: Added defensive checks in transformForDirection to handle non-array data
 * UPDATE: Now uses modular vocabulary API for lazy loading
 */

import type { VocabularyItem } from './types.js';

interface TransformedVocabularyItem extends VocabularyItem {
  displayWord: string;
  displayTranslation: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface VocabularyFilters {
  level?: string;
  category?: string;
  search?: string;
}

interface VocabularyAPI {
  loadAll(): Promise<VocabularyItem[]>;
  loadFiltered(filters: VocabularyFilters): Promise<VocabularyItem[]>;
}

interface VocabularyEntry {
  id: string;
  word: string;
  translation: string;
  source_lang?: 'bg' | 'de';
  target_lang?: 'bg' | 'de';
  category?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  notes?: string | null;
  notes_bg_to_de?: string | null;
  notes_de_to_bg?: string | null;
  etymology?: string | null;
  cultural_note?: string | null;
  difficulty?: number;
  frequency?: number;
  examples?: Array<{
    sentence: string;
    translation: string;
    context: string;
  }>;
  linguistic_note_bg_to_de?: string | null;
  linguistic_note_de_to_bg?: string | null;
  linguistic_note?: string | null;
  audio_url?: string | undefined;
}

class VocabularyAdapter {
  private vocabularyData: VocabularyItem[] = [];
  private enhancedData: VocabularyItem[] = [];
  private useModularAPI: boolean = false;

  constructor() {
    this.init();
  }
  
  async init(): Promise<void> {
    await this.loadData();
  }
  
  async loadData(): Promise<void> {
    // First try to load from modular API
    try {
      // Dynamic import to avoid loading if not needed
      const module = await import('./modules/vocabulary-api.js');
      const vocabularyAPI = module.vocabularyAPI as unknown as VocabularyAPI;
      const allEntries = await vocabularyAPI.loadAll();
      
      if (Array.isArray(allEntries) && allEntries.length > 0) {
        // Convert VocabularyEntry[] to VocabularyItem[]
        this.vocabularyData = allEntries.map(entry => this.convertEntryToItem(entry));
        this.useModularAPI = true;
        console.log(`[VocabularyAdapter] Loaded ${allEntries.length} vocabulary items via modular API`);
        return;
      }
    } catch (error) {
      console.warn('[VocabularyAdapter] Modular API not available, falling back to embedded data:', error);
    }
    
    // Fallback to embedded data
    const vocabScript = document.querySelector('#vocabulary-data');
    if (vocabScript) {
      try {
        let data = JSON.parse(vocabScript.textContent || '') as unknown;

        // BUGFIX: Data might be double-encoded (JSON string containing JSON)
        // The Hugo template embeds the JSON as a string within JSON
        // If result is a string, parse again
        if (typeof data === 'string') {
          console.log('[VocabularyAdapter] Double-encoded data detected, parsing again');
          data = JSON.parse(data) as VocabularyItem[];
        }

        this.vocabularyData = Array.isArray(data) ? data as VocabularyItem[] : [];

        if (Array.isArray(data) && data.length > 0) {
          console.log(`[VocabularyAdapter] Loaded ${data.length} vocabulary items from embedded data`);
        } else if (!Array.isArray(data)) {
          console.warn('[VocabularyAdapter] vocabularyData is not an array after parsing');
        }
      } catch (error) {
        console.error('Failed to load vocabulary data:', error);
        this.vocabularyData = [];
      }
    }
    
    // Load enhanced vocabulary data if available
    const enhancedScript = document.querySelector('#enhanced-vocabulary-data');
    if (enhancedScript) {
      try {
        let data = JSON.parse(enhancedScript.textContent || '') as unknown;

        // Handle double-encoding
        if (typeof data === 'string') {
          data = JSON.parse(data) as VocabularyItem[];
        }

        // Skip if null or empty
        if (data && data !== null && typeof data === 'object') {
          this.enhancedData = Array.isArray(data) ? data as VocabularyItem[] : [];
          if (this.enhancedData.length > 0) {
            console.log(`[VocabularyAdapter] Loaded ${this.enhancedData.length} enhanced vocabulary items`);
          }
        } else {
          this.enhancedData = [];
        }
      } catch {
        console.warn('Enhanced vocabulary data not available or could not be parsed, using basic data');
        this.enhancedData = [];
      }
    }
  }
  
  // Get vocabulary data with enhanced fields if available
  getVocabularyData(): VocabularyItem[] {
    // Ensure both are arrays
    const enhanced = Array.isArray(this.enhancedData) ? this.enhancedData : [];
    const basic = Array.isArray(this.vocabularyData) ? this.vocabularyData : [];

    if (enhanced.length > 0) {
      return enhanced;
    }
    return basic;
  }

  // Async method to get filtered data using modular API when available
  async getFilteredDataAsync(filters: VocabularyFilters = {}): Promise<VocabularyItem[]> {
    if (this.useModularAPI) {
      try {
        const module = await import('./modules/vocabulary-api.js');
        const vocabularyAPI = module.vocabularyAPI as unknown as VocabularyAPI;
        const filteredEntries = await vocabularyAPI.loadFiltered(filters);
        return filteredEntries.map(entry => this.convertEntryToItem(entry));
      } catch {
        console.warn('[VocabularyAdapter] Failed to use modular API for filtering, falling back to sync method');
      }
    }
    
    // Fallback to synchronous filtering
    return this.getFilteredData(filters);
  }
  
  // Get specific vocabulary item by ID
  getVocabularyItem(id: string): VocabularyItem | undefined {
    const data = this.getVocabularyData();
    return data.find(item => item.id === id);
  }
  
  // Transform data for different learning directions
  transformForDirection(data: VocabularyItem[] | VocabularyItem, direction: string): TransformedVocabularyItem[] {
    // BUGFIX: Defensive programming to prevent "e.map is not a function" error
    // Ensure data is an array before calling .map()
    if (!Array.isArray(data)) {
      console.warn('[VocabularyAdapter] transformForDirection received non-array:', typeof data, data);
      // Try to convert to array if it's a single object
      if (data && typeof data === 'object') {
        data = [data];
      } else {
        console.error('[VocabularyAdapter] Cannot transform non-array data, returning empty array');
        return [];
      }
    }

    return data.map(item => {
      return direction === 'de-bg'
        ? {
          ...item,
          displayWord: item.translation || item.word,
          displayTranslation: item.word,
          sourceLanguage: 'de',
          targetLanguage: 'bg'
        }
        : {
          ...item,
          displayWord: item.word,
          displayTranslation: item.translation || item.word,
          sourceLanguage: 'bg',
          targetLanguage: 'de'
        };
    });
  }
  
  // Get items for specific learning direction (required by VocabularyPageModule)
  getItemsForDirection(direction: string): TransformedVocabularyItem[] {
    const data = this.getVocabularyData();
    if (!Array.isArray(data)) {
      console.warn('[VocabularyAdapter] getItemsForDirection: data is not array, returning empty');
      return [];
    }
    return this.transformForDirection(data, direction);
  }
  
  // Get filtered vocabulary data
  getFilteredData(filters: VocabularyFilters = {}): VocabularyItem[] {
    let data = this.getVocabularyData();
    
    if (!Array.isArray(data)) {
      console.warn('[VocabularyAdapter] getFilteredData: data is not array, returning empty');
      return [];
    }
    
    if (filters.level) {
      data = data.filter(item => item.level === filters.level);
    }
    
    if (filters.category) {
      data = data.filter(item => item.category === filters.category);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      data = data.filter(item => 
        item.word.toLowerCase().includes(searchTerm) ||
        (item.translation && item.translation.toLowerCase().includes(searchTerm))
      );
    }
    
    return data;
  }

  /**
   * Convert VocabularyEntry to VocabularyItem
   */
  private convertEntryToItem(entry: VocabularyEntry): VocabularyItem {
    return {
      id: entry.id,
      word: entry.word,
      translation: entry.translation,
      source_lang: entry.source_lang || 'bg',
      target_lang: entry.target_lang || 'de',
      category: entry.category || '',
      level: entry.level || 'A1',
      notes: entry.notes || null,
      notes_bg_to_de: entry.notes_bg_to_de || null,
      notes_de_to_bg: entry.notes_de_to_bg || null,
      etymology: entry.etymology || null,
      cultural_note: entry.cultural_note || null,
      difficulty: entry.difficulty || 1,
      frequency: entry.frequency || 50,
      examples: entry.examples || [],
      linguistic_note_bg_to_de: entry.linguistic_note_bg_to_de || null,
      linguistic_note_de_to_bg: entry.linguistic_note_de_to_bg || null,
      linguistic_note: entry.linguistic_note || null,
      audio_url: entry.audio_url as string | undefined
    };
  }
}

// Make globally available
if (typeof window !== 'undefined') {
  window.VocabularyAdapter = VocabularyAdapter;
}

export { VocabularyAdapter,  type TransformedVocabularyItem, type VocabularyFilters };
export { type VocabularyItem } from './types.js';