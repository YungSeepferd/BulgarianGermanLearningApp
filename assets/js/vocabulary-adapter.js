/**
 * Vocabulary Adapter
 * Provides backward compatibility and data transformation for vocabulary systems
 * BUGFIX: Added defensive checks in transformForDirection to handle non-array data
 */

class VocabularyAdapter {
  constructor() {
    this.vocabularyData = [];
    this.enhancedData = [];
    this.init();
  }
  
  init() {
    this.loadData();
  }
  
  loadData() {
    // Load basic vocabulary data
    const vocabScript = document.getElementById('vocabulary-data');
    if (vocabScript) {
      try {
        let data = JSON.parse(vocabScript.textContent);

        // BUGFIX: Data might be double-encoded (JSON string containing JSON)
        // The Hugo template embeds the JSON as a string within JSON
        // If result is a string, parse again
        if (typeof data === 'string') {
          console.log('[VocabularyAdapter] Double-encoded data detected, parsing again');
          data = JSON.parse(data);
        }

        this.vocabularyData = Array.isArray(data) ? data : [];

        if (Array.isArray(data) && data.length > 0) {
          console.log(`[VocabularyAdapter] Loaded ${data.length} vocabulary items`);
        } else if (!Array.isArray(data)) {
          console.warn('[VocabularyAdapter] vocabularyData is not an array after parsing');
        }
      } catch (error) {
        console.error('Failed to load vocabulary data:', error);
        this.vocabularyData = [];
      }
    }
    
    // Load enhanced vocabulary data if available
    const enhancedScript = document.getElementById('enhanced-vocabulary-data');
    if (enhancedScript) {
      try {
        let data = JSON.parse(enhancedScript.textContent);

        // Handle double-encoding
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        // Skip if null or empty
        if (data && data !== null && typeof data === 'object') {
          this.enhancedData = Array.isArray(data) ? data : [];
          if (this.enhancedData.length > 0) {
            console.log(`[VocabularyAdapter] Loaded ${this.enhancedData.length} enhanced vocabulary items`);
          }
        } else {
          this.enhancedData = [];
        }
      } catch (error) {
        console.warn('Enhanced vocabulary data not available or could not be parsed, using basic data');
        this.enhancedData = [];
      }
    }
  }
  
  // Get vocabulary data with enhanced fields if available
  getVocabularyData() {
    // Ensure both are arrays
    const enhanced = Array.isArray(this.enhancedData) ? this.enhancedData : [];
    const basic = Array.isArray(this.vocabularyData) ? this.vocabularyData : [];

    if (enhanced.length > 0) {
      return enhanced;
    }
    return basic;
  }
  
  // Get specific vocabulary item by ID
  getVocabularyItem(id) {
    const data = this.getVocabularyData();
    return data.find(item => item.id === id);
  }
  
  // Transform data for different learning directions
  transformForDirection(data, direction) {
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
      if (direction === 'de-bg') {
        // German to Bulgarian - swap fields
        return {
          ...item,
          displayWord: item.translation || item.word,
          displayTranslation: item.word,
          sourceLanguage: 'de',
          targetLanguage: 'bg'
        };
      } else {
        // Bulgarian to German (default)
        return {
          ...item,
          displayWord: item.word,
          displayTranslation: item.translation || item.word,
          sourceLanguage: 'bg',
          targetLanguage: 'de'
        };
      }
    });
  }
  
  // Get items for specific learning direction (required by VocabularyPageModule)
  getItemsForDirection(direction) {
    const data = this.getVocabularyData();
    if (!Array.isArray(data)) {
      console.warn('[VocabularyAdapter] getItemsForDirection: data is not array, returning empty');
      return [];
    }
    return this.transformForDirection(data, direction);
  }
  
  // Get filtered vocabulary data
  getFilteredData(filters = {}) {
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
}

// Make globally available
window.VocabularyAdapter = VocabularyAdapter;
