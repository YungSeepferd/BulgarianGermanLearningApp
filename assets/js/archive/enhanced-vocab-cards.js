/**
 * Enhanced Vocabulary Cards System
 * Provides bidirectional vocabulary display with cultural context
 */

class EnhancedVocabCards {
  constructor() {
    this.vocabularyData = [];
    this.enhancedData = [];
    this.currentDirection = 'bg-de';
    this.init();
  }
  
  init() {
    this.loadData();
    this.bindEvents();
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
    
    // Load enhanced vocabulary data
    const enhancedScript = document.getElementById('enhanced-vocabulary-data');
    if (enhancedScript) {
      try {
        this.enhancedData = JSON.parse(enhancedScript.textContent);
      } catch (error) {
        console.warn('Enhanced vocabulary data not available:', error);
      }
    }
  }
  
  bindEvents() {
    // Listen for language direction changes
    document.addEventListener('language-direction-changed', (e) => {
      this.currentDirection = e.detail.direction;
      this.updateCards();
    });
  }
  
  updateCards() {
    const cards = document.querySelectorAll('.vocab-card');
    cards.forEach(card => this.updateCard(card));
  }
  
  updateCard(card) {
    const wordElement = card.querySelector('.vocab-word');
    const translationElement = card.querySelector('.vocab-translation');
    
    if (!wordElement || !translationElement) return;
    
    const originalWord = wordElement.textContent;
    const originalTranslation = translationElement.textContent;
    
    // Swap content based on direction
    if (this.currentDirection === 'de-bg') {
      // Show German -> Bulgarian
      wordElement.textContent = originalTranslation;
      translationElement.textContent = originalWord;
    } else {
      // Show Bulgarian -> German (default)
      wordElement.textContent = originalWord;
      translationElement.textContent = originalTranslation;
    }
  }
  
  getCardData(wordId) {
    // Try enhanced data first, fallback to basic
    return this.enhancedData.find(item => item.id === wordId) || 
           this.vocabularyData.find(item => item.id === wordId);
  }
}

// Make globally available
window.EnhancedVocabCards = EnhancedVocabCards;
