/**
 * Modular Vocabulary API
 * Provides lazy-loading capabilities for split vocabulary data
 * Maintains backward compatibility with existing loading patterns
 */

interface VocabularyEntry {
  id: string;
  word: string;
  translation: string;
  source_lang: string;
  target_lang: string;
  category?: string;
  level?: string;
  notes?: string;
  notes_bg_to_de?: string;
  notes_de_to_bg?: string;
  etymology?: string;
  cultural_note?: string;
  linguistic_note?: string;
  difficulty?: number;
  frequency?: number;
  examples?: Array<{
    sentence: string;
    translation: string;
    context?: string;
    note?: string;
  }>;
}

interface VocabularyIndex {
  generated: string;
  totalEntries: number;
  splitFiles: Array<{
    file: string;
    entryCount: number;
    sizeKB: number;
    categories: string[];
  }>;
  summary: {
    totalFiles: number;
    totalSizeKB: number;
    averageSizeKB: number;
    largestFile: {
      file: string;
      entryCount: number;
      sizeKB: number;
    };
    smallestFile: {
      file: string;
      entryCount: number;
      sizeKB: number;
    };
  };
}

class VocabularyAPI {
  private loadedChunks: Map<string, VocabularyEntry[]> = new Map();
  private index: VocabularyIndex | null = null;
  private basePath = '/data/vocab/';

  constructor() {
    this.loadIndex();
  }

  /**
   * Load the vocabulary index to understand available chunks
   */
  private async loadIndex(): Promise<void> {
    try {
      const response = await fetch(`${this.basePath}index.json`);
      if (response.ok) {
        this.index = await response.json();
        console.log(`[VocabularyAPI] Loaded index with ${this.index?.totalEntries} entries across ${this.index?.splitFiles.length} files`);
      }
    } catch {
      console.warn('[VocabularyAPI] Failed to load vocabulary index, using fallback loading');
    }
  }

  /**
   * Load a specific vocabulary chunk by file name
   */
  async loadChunk(fileName: string): Promise<VocabularyEntry[]> {
    // Check if already loaded
    if (this.loadedChunks.has(fileName)) {
      return this.loadedChunks.get(fileName)!;
    }

    try {
      // Use dynamic import for JSON files
      const module = await import(`../../data/vocab/${fileName}`);
      const entries: VocabularyEntry[] = module.default;
      
      if (Array.isArray(entries)) {
        this.loadedChunks.set(fileName, entries);
        console.log(`[VocabularyAPI] Loaded chunk ${fileName} with ${entries.length} entries`);
        return entries;
      } else {
        throw new TypeError(`Invalid data format in ${fileName}`);
      }
    } catch (error) {
      console.error(`[VocabularyAPI] Failed to load chunk ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Load vocabulary by CEFR level
   */
  async loadByLevel(level: string): Promise<VocabularyEntry[]> {
    const fileName = `${level}.json`;
    return this.loadChunk(fileName);
  }

  /**
   * Load vocabulary by category
   */
  async loadByCategory(category: string): Promise<VocabularyEntry[]> {
    // Sanitize category name to match file naming convention
    const sanitizedCategory = category
      .toLowerCase()
      .replaceAll(/[^\da-zßäöü]/g, '-')
      .replaceAll(/-+/g, '-')
      .replaceAll(/^-|-$/g, '');
    
    const fileName = `${sanitizedCategory}.json`;
    return this.loadChunk(fileName);
  }

  /**
   * Load all vocabulary (combines all chunks)
   */
  async loadAll(): Promise<VocabularyEntry[]> {
    if (!this.index) {
      await this.loadIndex();
    }

    if (!this.index) {
      throw new Error('Vocabulary index not available');
    }

    const allEntries: VocabularyEntry[] = [];
    const loadedIds = new Set<string>();

    // Load each chunk and combine entries, avoiding duplicates
    for (const fileInfo of this.index.splitFiles) {
      try {
        const entries = await this.loadChunk(fileInfo.file);
        
        for (const entry of entries) {
          if (!loadedIds.has(entry.id)) {
            loadedIds.add(entry.id);
            allEntries.push(entry);
          }
        }
      } catch {
        console.warn(`[VocabularyAPI] Failed to load chunk ${fileInfo.file}, skipping`);
      }
    }

    console.log(`[VocabularyAPI] Loaded ${allEntries.length} unique entries from all chunks`);
    return allEntries;
  }

  /**
   * Load vocabulary with filters (level, category, search)
   */
  async loadFiltered(filters: { level?: string; category?: string; search?: string } = {}): Promise<VocabularyEntry[]> {
    const allEntries = await this.loadAll();
    
    let filtered = allEntries;

    if (filters.level) {
      filtered = filtered.filter(item => item.level === filters.level);
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.word.toLowerCase().includes(searchTerm) ||
        (item.translation && item.translation.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  /**
   * Get specific vocabulary item by ID
   */
  async getItemById(id: string): Promise<VocabularyEntry | null> {
    if (!this.index) {
      await this.loadIndex();
    }

    if (!this.index) {
      return null;
    }

    // Search through chunks to find the item
    for (const fileInfo of this.index.splitFiles) {
      try {
        const entries = await this.loadChunk(fileInfo.file);
        const item = entries.find(entry => entry.id === id);
        if (item) {
          return item;
        }
      } catch {
        // Continue searching other chunks
        continue;
      }
    }

    return null;
  }

  /**
   * Get available levels from index
   */
  getAvailableLevels(): string[] {
    if (!this.index) return [];
    
    const levels = new Set<string>();
    for (const file of this.index.splitFiles) {
      if (/^(A1|A2|B1|B2)\.json$/.test(file.file)) {
        levels.add(file.file.replace('.json', ''));
      }
    }
    return [...levels];
  }

  /**
   * Get available categories from index
   */
  getAvailableCategories(): string[] {
    if (!this.index) return [];
    
    const categories = new Set<string>();
    for (const file of this.index.splitFiles) {
      if (!/^(A1|A2|B1|B2)\.json$/.test(file.file)) {
        for (const cat of file.categories) categories.add(cat);
      }
    }
    return [...categories];
  }

  /**
   * Clear loaded chunks to free memory
   */
  clearCache(): void {
    this.loadedChunks.clear();
    console.log('[VocabularyAPI] Cache cleared');
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): { loadedChunks: number; totalEntries: number; cacheSizeKB: number } {
    let totalEntries = 0;
    let cacheSizeKB = 0;

    for (const entries of this.loadedChunks) {
      totalEntries += entries.length;
      // Rough estimate: 1KB per entry
      cacheSizeKB += entries.length;
    }

    return {
      loadedChunks: this.loadedChunks.size,
      totalEntries,
      cacheSizeKB
    };
  }
}

// Create singleton instance
const vocabularyAPI = new VocabularyAPI();

// Export for use in other modules
export { vocabularyAPI, VocabularyAPI, VocabularyEntry };
export default vocabularyAPI;