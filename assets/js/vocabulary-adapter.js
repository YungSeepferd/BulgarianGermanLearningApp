/**
 * Vocabulary Adapter
 * Provides backward compatibility and data transformation for vocabulary systems
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
        this.vocabularyData = JSON.parse(vocabScript.textContent);
      } catch (error) {
        console.error('Failed to load vocabulary data:', error);
      }
    }
    
    // Load enhanced vocabulary data if available
    const enhancedScript = document.getElementById('enhanced-vocabulary-data');
    if (enhancedScript) {
      try {
        this.enhancedData = JSON.parse(enhancedScript.textContent);
      } catch (error) {
        console.warn('Enhanced vocabulary data not available, using basic data');
      }
    }
  }
  
  // Get vocabulary data with enhanced fields if available
  getVocabularyData() {
    if (this.enhancedData.length > 0) {
      return this.enhancedData;
    }
    return this.vocabularyData;
  }
  
  // Get specific vocabulary item by ID
  getVocabularyItem(id) {
    const enhanced = this.enhancedData.find(item => item.id === id);
    if (enhanced) return enhanced;
    
    return this.vocabularyData.find(item => item.id === id);
  }
  
  // Transform data for different learning directions
  transformForDirection(data, direction) {
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
  
  // Get filtered vocabulary data
  getFilteredData(filters = {}) {
    let data = this.getVocabularyData();
    
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
