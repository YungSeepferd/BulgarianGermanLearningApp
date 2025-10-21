/**
 * @file unified-practice-session.js
 * @description Consolidated practice session with bidirectional support
 * @status ACTIVE
 * @replaces enhanced-practice-session.js, practice.js
 * @dependencies unified-spaced-repetition.js (loaded globally)
 * @features
 *   - Direction-aware flashcards (respects language toggle)
 *   - Directional notes (notes_bg_to_de, notes_de_to_bg)
 *   - Keyboard shortcuts (Space/Enter flip, 1-5 grade)
 *   - Session statistics and progress tracking
 *   - Unified SM-2 integration with automatic migration
 * @version 2.0.1
 * @updated October 2025
 */

// No ES6 imports - use global window objects instead
// Dependencies: window.unifiedSpacedRepetition from unified-spaced-repetition.js

class UnifiedPracticeSession {
  constructor(options = {}) {
    this.vocabularyData = [];
    this.sessionCards = [];
    this.currentIndex = 0;
    this.currentCard = null;
    this.isFlipped = false;
    this.currentDirection = 'bg-de';
    
    this.sessionStats = {
      correct: 0,
      total: 0,
      startTime: Date.now(),
      mistakes: []
    };
    
    // Session configuration
    this.sessionLength = options.sessionLength || 20;
    this.enableAudio = options.enableAudio !== undefined ? options.enableAudio : false;
    
    // Reference to spaced repetition system (from global)
    this.spacedRepetition = window.unifiedSpacedRepetition;
    
    this.init();
  }

  init() {
    console.log('[UnifiedPractice] Initializing practice session v2.0');
    
    this.loadData();
    
    if (!this.vocabularyData || this.vocabularyData.length === 0) {
      console.error('[UnifiedPractice] No vocabulary data available');
      this.showError('No vocabulary data available. Please check your data files.');
      return;
    }
    
    console.log(`[UnifiedPractice] Loaded ${this.vocabularyData.length} vocabulary items`);
    
    this.bindEvents();
    this.startSession();
  }

  loadData() {
    // Load vocabulary from embedded JSON script tag
    const vocabScript = document.getElementById('practice-vocabulary-data');
    if (!vocabScript) {
      console.error('[UnifiedPractice] Vocabulary data script not found');
      return;
    }
    
    try {
      const data = JSON.parse(vocabScript.textContent);
      
      if (!Array.isArray(data) || data.length === 0) {
        console.error('[UnifiedPractice] Invalid vocabulary data');
        return;
      }
      
      this.vocabularyData = data;
      console.log('[UnifiedPractice] Successfully loaded vocabulary data');
    } catch (error) {
      console.error('[UnifiedPractice] Failed to parse vocabulary data:', error);
    }
    
    // Get current language direction
    this.currentDirection = this.getLanguageDirection();
    console.log(`[UnifiedPractice] Current direction: ${this.currentDirection}`);
  }

  getLanguageDirection() {
    // Try language toggle first
    if (window.languageToggle && typeof window.languageToggle.getDirection === 'function') {
      return window.languageToggle.getDirection();
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('bgde:language-direction') || 
                   localStorage.getItem('bgde:learning_direction');
    
    return this.normalizeDirection(stored) || 'de-bg';
  }

  normalizeDirection(value) {
    if (!value) return null;
    
    const normalized = value.toString().toLowerCase();
    
    if (normalized === 'bg-de' || normalized === 'bg_to_de') return 'bg-de';
    if (normalized === 'de-bg' || normalized === 'de_to_bg') return 'de-bg';
    
    return normalized === 'bg-de' || normalized === 'de-bg' ? normalized : null;
  }

  bindEvents() {
    // Flashcard click to flip
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
      flashcard.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
          return;
        }
        if (!this.isFlipped) {
          this.showAnswer();
        }
      });
      flashcard.style.cursor = 'pointer';
    }
    
    // Show answer button
    const showAnswerBtn = document.getElementById('show-answer');
    if (showAnswerBtn) {
      showAnswerBtn.addEventListener('click', () => this.showAnswer());
    }
    
    // Grade buttons (1-5 scale)
    const gradeButtons = {
      'incorrect-btn': 1,
      'hard-btn': 2,
      'good-btn': 3,
      'easy-btn': 4,
      'perfect-btn': 5
    };
    
    for (const [btnId, grade] of Object.entries(gradeButtons)) {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => this.gradeCard(grade));
      }
    }
    
    // Legacy two-button support
    const correctBtn = document.getElementById('correct-btn');
    const incorrectBtn = document.getElementById('incorrect-btn');
    
    if (correctBtn) {
      correctBtn.addEventListener('click', () => this.gradeCard(4));
    }
    if (incorrectBtn) {
      incorrectBtn.addEventListener('click', () => this.gradeCard(1));
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch(e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (!this.isFlipped) {
            this.showAnswer();
          }
          break;
        case '1':
          e.preventDefault();
          if (this.isFlipped) this.gradeCard(1);
          break;
        case '2':
          e.preventDefault();
          if (this.isFlipped) this.gradeCard(2);
          break;
        case '3':
          e.preventDefault();
          if (this.isFlipped) this.gradeCard(3);
          break;
        case '4':
          e.preventDefault();
          if (this.isFlipped) this.gradeCard(4);
          break;
        case '5':
          e.preventDefault();
          if (this.isFlipped) this.gradeCard(5);
          break;
      }
    });
    
    // Listen for language direction changes
    document.addEventListener('language-direction-changed', (e) => {
      this.currentDirection = e.detail.direction;
      this.updateCurrentCard();
      console.log('[UnifiedPractice] Direction changed to:', this.currentDirection);
    });
  }

  startSession() {
    console.log('[UnifiedPractice] Starting practice session');
    
    // Hide loading states
    this.hideScreen('loading-state');
    this.hideScreen('no-items-state');
    this.hideScreen('session-complete');
    
    this.prepareSessionCards();
    
    if (this.sessionCards.length === 0) {
      this.showNoItemsState();
      return;
    }
    
    this.showScreen('practice-session');
    this.showCurrentCard();
  }

  prepareSessionCards() {
    let cards = [];
    
    // Priority 1: Check for user-selected vocabulary
    const selectionJson = localStorage.getItem('bgde:practice_selection');
    if (selectionJson) {
      try {
        const selectedWords = JSON.parse(selectionJson);
        
        if (Array.isArray(selectedWords) && selectedWords.length > 0) {
          // Filter vocabulary to only include selected words
          cards = this.vocabularyData.filter(item => 
            selectedWords.includes(item.word) || selectedWords.includes(item.id)
          );
          
          console.log(`[UnifiedPractice] Using ${cards.length} user-selected items`);
          
          // Clean up selection after loading
          localStorage.removeItem('bgde:practice_selection');
          
          // If we found the selected cards, use them and skip other checks
          if (cards.length > 0) {
            this.sessionCards = cards;
            this.currentIndex = 0;
            return;
          }
        }
      } catch (error) {
        console.warn('[UnifiedPractice] Failed to parse practice selection:', error);
        localStorage.removeItem('bgde:practice_selection'); // Clean up bad data
      }
    }
    
    // Priority 2: Get due items from spaced repetition
    const dueItems = this.spacedRepetition.getDueItems(this.currentDirection);
    
    if (dueItems.length > 0) {
      // Map due items to vocabulary data
      cards = dueItems.map(state => {
        return this.vocabularyData.find(item => item.id === state.itemId);
      }).filter(Boolean);
      
      console.log(`[UnifiedPractice] Found ${cards.length} due items for review`);
    }
    
    // Priority 3: If no selection or due items, use random selection
    if (cards.length === 0) {
      const shuffled = this.shuffleArray([...this.vocabularyData]);
      cards = shuffled.slice(0, this.sessionLength);
      console.log(`[UnifiedPractice] No due items, using ${cards.length} random cards`);
    }
    
    this.sessionCards = cards;
    this.currentIndex = 0;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  showCurrentCard() {
    if (this.currentIndex >= this.sessionCards.length) {
      this.completeSession();
      return;
    }
    
    this.currentCard = this.sessionCards[this.currentIndex];
    this.isFlipped = false;
    
    this.updateCurrentCard();
    this.updateUI();
    this.updateProgress();
  }

  updateCurrentCard() {
    if (!this.currentCard) return;
    
    const isReverse = this.currentDirection === 'de-bg';
    const frontText = isReverse ? this.currentCard.translation : this.currentCard.word;
    const backText = isReverse ? this.currentCard.word : this.currentCard.translation;
    
    // Update card content
    const currentWord = document.getElementById('current-word');
    const currentTranslation = document.getElementById('current-translation');
    const currentNotes = document.getElementById('current-notes');
    const wordLevel = document.getElementById('word-level');
    const wordCategory = document.getElementById('word-category');
    
    if (currentWord) currentWord.textContent = frontText || 'No word';
    if (currentTranslation) currentTranslation.textContent = backText || 'No translation';
    
    // Directional notes
    if (currentNotes) {
      const directionalNotes = isReverse
        ? (this.currentCard.notes_de_to_bg || this.currentCard.notes)
        : (this.currentCard.notes_bg_to_de || this.currentCard.notes);
      
      currentNotes.textContent = directionalNotes || '';
      currentNotes.style.display = directionalNotes ? 'block' : 'none';
    }
    
    if (wordLevel) wordLevel.textContent = this.currentCard.level || 'A1';
    if (wordCategory) wordCategory.textContent = this.currentCard.category || '';
    
    // Update hints/etymology if present
    this.updateHints();
  }

  updateHints() {
    const card = this.currentCard;
    if (!card) return;
    
    const hintElements = {
      etymology: document.getElementById('card-etymology'),
      culturalNote: document.getElementById('card-cultural-note'),
      linguisticNote: document.getElementById('card-linguistic-note')
    };
    
    if (hintElements.etymology) {
      hintElements.etymology.textContent = card.etymology || '';
      hintElements.etymology.style.display = card.etymology ? 'block' : 'none';
    }
    
    if (hintElements.culturalNote) {
      hintElements.culturalNote.textContent = card.cultural_note || '';
      hintElements.culturalNote.style.display = card.cultural_note ? 'block' : 'none';
    }
    
    if (hintElements.linguisticNote) {
      hintElements.linguisticNote.textContent = card.linguistic_note || '';
      hintElements.linguisticNote.style.display = card.linguistic_note ? 'block' : 'none';
    }
  }

  updateProgress() {
    const progress = document.getElementById('progress');
    const accuracy = document.getElementById('accuracy');
    
    if (progress) {
      progress.textContent = `${this.currentIndex + 1}/${this.sessionCards.length}`;
    }
    
    if (accuracy) {
      const accuracyPercent = this.sessionStats.total > 0 
        ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100) 
        : 0;
      accuracy.textContent = `${accuracyPercent}%`;
    }
  }

  updateUI() {
    const flashcardFront = document.getElementById('flashcard-front');
    const flashcardBack = document.getElementById('flashcard-back');
    const flashcard = document.getElementById('flashcard');
    const showAnswerBtn = document.getElementById('show-answer');
    const responseButtons = document.getElementById('response-buttons');
    
    if (flashcardFront && flashcardBack && flashcard) {
      if (this.isFlipped) {
        flashcardFront.style.display = 'none';
        flashcardBack.style.display = 'block';
        flashcard.classList.add('flipped');
        
        if (showAnswerBtn) showAnswerBtn.style.display = 'none';
        if (responseButtons) {
          responseButtons.style.display = 'flex';
          responseButtons.classList.remove('hidden');
        }
      } else {
        flashcardFront.style.display = 'block';
        flashcardBack.style.display = 'none';
        flashcard.classList.remove('flipped');
        
        if (showAnswerBtn) showAnswerBtn.style.display = 'inline-block';
        if (responseButtons) {
          responseButtons.style.display = 'none';
          responseButtons.classList.add('hidden');
        }
      }
    }
  }

  showAnswer() {
    if (this.isFlipped) return;
    
    this.isFlipped = true;
    this.updateUI();
    
    // Auto-play audio if enabled
    if (this.enableAudio) {
      this.playAudio();
    }
  }

  playAudio() {
    if (!this.currentCard || !this.currentCard.audio_url) return;
    
    try {
      const audio = new Audio(this.currentCard.audio_url);
      audio.play().catch(err => {
        console.warn('[UnifiedPractice] Audio playback failed:', err);
      });
    } catch (error) {
      console.warn('[UnifiedPractice] Audio error:', error);
    }
  }

  gradeCard(grade) {
    if (!this.isFlipped || !this.currentCard) return;
    
    console.log(`[UnifiedPractice] Grading card ${this.currentCard.id} with grade ${grade}`);
    
    // Update session stats
    this.sessionStats.total += 1;
    if (grade >= 3) {
      this.sessionStats.correct += 1;
    } else {
      this.sessionStats.mistakes.push({
        id: this.currentCard.id,
        word: this.currentCard.word,
        translation: this.currentCard.translation
      });
    }
    
    // Update spaced repetition state
    const state = this.spacedRepetition.loadState(this.currentCard.id, this.currentDirection);
    const newState = this.spacedRepetition.scheduleNext(state, grade, this.currentDirection);
    this.spacedRepetition.saveState(newState);
    
    // Move to next card
    this.currentIndex += 1;
    
    setTimeout(() => {
      this.showCurrentCard();
    }, 300);
  }

  completeSession() {
    console.log('[UnifiedPractice] Session complete');
    
    this.hideScreen('practice-session');
    this.showScreen('session-complete');
    
    this.updateFinalStats();
    
    // Save session history
    this.saveSessionHistory();
  }

  updateFinalStats() {
    const finalCorrect = document.getElementById('final-correct');
    const finalTotal = document.getElementById('final-total');
    const finalAccuracy = document.getElementById('final-accuracy');
    const finalTime = document.getElementById('final-time');
    
    if (finalCorrect) finalCorrect.textContent = this.sessionStats.correct;
    if (finalTotal) finalTotal.textContent = this.sessionStats.total;
    
    if (finalAccuracy && this.sessionStats.total > 0) {
      const accuracyPercent = Math.round((this.sessionStats.correct / this.sessionStats.total) * 100);
      finalAccuracy.textContent = `${accuracyPercent}%`;
    }
    
    if (finalTime) {
      const duration = Math.round((Date.now() - this.sessionStats.startTime) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  saveSessionHistory() {
    try {
      const sessionRecord = {
        timestamp: Date.now(),
        direction: this.currentDirection,
        stats: {
          correct: this.sessionStats.correct,
          total: this.sessionStats.total,
          accuracy: this.sessionStats.total > 0 
            ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100) 
            : 0,
          duration: Date.now() - this.sessionStats.startTime
        },
        mistakes: this.sessionStats.mistakes
      };
      
      const history = JSON.parse(localStorage.getItem('bgde:session_history') || '[]');
      history.push(sessionRecord);
      
      // Keep last 50 sessions
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      localStorage.setItem('bgde:session_history', JSON.stringify(history));
    } catch (error) {
      console.warn('[UnifiedPractice] Failed to save session history:', error);
    }
  }

  showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    } else {
      console.error('[UnifiedPractice]', message);
    }
  }

  showNoItemsState() {
    this.hideScreen('practice-session');
    this.hideScreen('loading-state');
    this.hideScreen('session-complete');
    this.showScreen('no-items-state');
  }

  hideScreen(id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.add('hidden');
    }
  }

  showScreen(id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'block';
      el.classList.remove('hidden');
    }
  }
}

// Global access
if (typeof window !== 'undefined') {
  window.UnifiedPracticeSession = UnifiedPracticeSession;
}
