/**
 * Enhanced Practice Session System
 * Bidirectional flashcard practice with spaced repetition integration
 */

class EnhancedPracticeSession {
  constructor() {
    this.vocabularyData = [];
    this.sessionCards = [];
    this.currentIndex = 0;
    this.currentCard = null;
    this.isFlipped = false;
    this.sessionStats = {
      correct: 0,
      total: 0,
      startTime: Date.now()
    };
    this.currentDirection = 'bg-de';
    this.spacedRepetition = null;
    
    this.init();
  }
  
  init() {
    console.log('[Practice] Initializing enhanced practice session');
    this.loadData();
    
    // Validate we have data before proceeding
    if (!this.vocabularyData || this.vocabularyData.length === 0) {
      console.error('[Practice] Cannot start session: no vocabulary data loaded');
      this.showError('No vocabulary data available. Please check your data files.');
      return;
    }
    
    console.log(`[Practice] Loaded ${this.vocabularyData.length} vocabulary items`);
    this.initializeSpacedRepetition();
    this.bindEvents();
    this.startSession();
  }
  
  loadData() {
    // Load vocabulary data
    const vocabScript = document.getElementById('practice-vocabulary-data');
    if (!vocabScript) {
      console.error('[Practice] Vocabulary data script tag (#practice-vocabulary-data) not found in DOM');
      return;
    }
    
    try {
      const data = JSON.parse(vocabScript.textContent);
      
      // Validate data structure
      if (!Array.isArray(data)) {
        console.error('[Practice] Vocabulary data is not an array:', typeof data);
        return;
      }
      
      if (data.length === 0) {
        console.error('[Practice] Vocabulary data array is empty');
        return;
      }
      
      // Validate first item has required fields
      const firstItem = data[0];
      if (!firstItem.word && !firstItem.translation) {
        console.error('[Practice] Vocabulary items missing required fields (word/translation)');
        return;
      }
      
      this.vocabularyData = data;
      console.log(`[Practice] Successfully loaded and validated ${data.length} vocabulary items`);
    } catch (error) {
      console.error('[Practice] Failed to parse vocabulary data:', error);
      console.error('[Practice] Script content length:', vocabScript.textContent.length);
    }
    
    // Get current language direction
    if (window.languageToggle && typeof window.languageToggle.getDirection === 'function') {
      this.currentDirection = window.languageToggle.getDirection();
      console.log(`[Practice] Using language direction from toggle: ${this.currentDirection}`);
    } else {
      console.warn('[Practice] Language toggle not available, using localStorage fallback');
      const stored =
        localStorage.getItem('bgde:language-direction') ||
        localStorage.getItem('bgde:learning_direction');
      const normalized = this.normalizeDirection(stored);
      this.currentDirection = normalized || 'de-bg';
      console.log(`[Practice] Using language direction: ${this.currentDirection}`);
    }
  }
  
  initializeSpacedRepetition() {
    if (window.EnhancedSpacedRepetition) {
      this.spacedRepetition = new EnhancedSpacedRepetition();
    } else if (window.BgDeApp && window.BgDeApp.spacedRepetition) {
      this.spacedRepetition = window.BgDeApp.spacedRepetition;
    }
  }
  
  bindEvents() {
    // Flashcard click to flip
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
      flashcard.addEventListener('click', (e) => {
        // Don't flip if clicking on buttons
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
          return;
        }
        if (!this.isFlipped) {
          this.showAnswer();
        }
      });
      // Add pointer cursor to indicate clickability
      flashcard.style.cursor = 'pointer';
    }
    
    // Show answer button
    const showAnswerBtn = document.getElementById('show-answer');
    if (showAnswerBtn) {
      showAnswerBtn.addEventListener('click', () => this.showAnswer());
    }
    
    // Grade buttons
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
      if (e.target.tagName === 'INPUT') return;
      
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
          if (this.isFlipped) this.gradeCard(4);
          break;
      }
    });
    
    // Language direction changes
    document.addEventListener('language-direction-changed', (e) => {
      this.currentDirection = e.detail.direction;
      this.updateCurrentCard();
    });
  }
  
  startSession() {
    // Hide loading state
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      loadingState.style.display = 'none';
    }
    
    // Prepare session cards
    this.prepareSessionCards();
    
    if (this.sessionCards.length === 0) {
      this.showNoItemsState();
      return;
    }
    
    // Show practice session
    const practiceSession = document.getElementById('practice-session');
    if (practiceSession) {
      practiceSession.style.display = 'block';
    }
    
    this.showCurrentCard();
  }
  
  prepareSessionCards() {
    // Get due items from spaced repetition system
    let cards = [];
    
    if (this.spacedRepetition) {
      const allStates = this.spacedRepetition.loadAllStates();
      const dueItems = this.spacedRepetition.getDueItems(allStates);
      
      // Get vocabulary items for due reviews
      cards = dueItems.map(state => {
        return this.vocabularyData.find(item => item.id === state.itemId);
      }).filter(Boolean);
    }
    
    // If no due items, use random selection
    if (cards.length === 0) {
      cards = this.vocabularyData.slice(0, 20);
    }
    
    this.sessionCards = cards;
    this.currentIndex = 0;
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
    if (currentNotes) {
      currentNotes.textContent = this.currentCard.notes || '';
      currentNotes.style.display = this.currentCard.notes ? 'block' : 'none';
    }
    const flashcardFront = document.getElementById('flashcard-front');
    const flashcardBack = document.getElementById('flashcard-back');
    const showAnswerBtn = document.getElementById('show-answer');
    const responseButtons = document.getElementById('response-buttons');
    
    if (flashcard) flashcard.classList.remove('flipped');
    
    if (this.isFlipped) {
      if (flashcardFront) flashcardFront.style.display = 'none';
      if (flashcardBack) flashcardBack.style.display = 'block';
      if (showAnswerBtn) showAnswerBtn.style.display = 'none';
      if (responseButtons) {
        responseButtons.style.display = 'flex';
        responseButtons.classList.remove('hidden');
      }
    } else {
      if (flashcardFront) flashcardFront.style.display = 'block';
      if (flashcardBack) flashcardBack.style.display = 'none';
      if (showAnswerBtn) {
        showAnswerBtn.style.display = 'block';
        showAnswerBtn.classList.remove('hidden');
      }
      if (responseButtons) {
        responseButtons.style.display = 'none';
        responseButtons.classList.add('hidden');
      }
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
    // This method is called after card changes to sync UI state
    console.log('[Practice] UI updated - flipped:', this.isFlipped);
    
    // Toggle flashcard visibility based on flip state
    const flashcardFront = document.getElementById('flashcard-front');
    const flashcardBack = document.getElementById('flashcard-back');
    const flashcard = document.getElementById('flashcard');
    const showAnswerBtn = document.getElementById('show-answer');
    const responseButtons = document.getElementById('response-buttons');
    
    if (flashcardFront && flashcardBack && flashcard) {
      if (this.isFlipped) {
        // Show back, hide front
        flashcardFront.style.display = 'none';
        flashcardBack.style.display = 'block';
        flashcard.classList.add('flipped');
        
        // Update buttons
        if (showAnswerBtn) showAnswerBtn.style.display = 'none';
        if (responseButtons) {
          responseButtons.style.display = 'flex';
          responseButtons.classList.remove('hidden');
        }
      } else {
        // Show front, hide back
        flashcardFront.style.display = 'block';
        flashcardBack.style.display = 'none';
        flashcard.classList.remove('flipped');
        
        // Update buttons
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
  }
  
  gradeCard(grade) {
    if (!this.isFlipped || !this.currentCard) return;
    
    // Update session stats
    this.sessionStats.total += 1;
    if (grade >= 3) {
      this.sessionStats.correct += 1;
    }
    
    // Update spaced repetition
    if (this.spacedRepetition) {
      const state = this.spacedRepetition.loadState(this.currentCard.id, this.currentDirection);
      const newState = this.spacedRepetition.scheduleNext(state, grade, this.currentDirection);
      this.spacedRepetition.saveState(newState);
    }
    
    // Move to next card
    this.currentIndex += 1;
    setTimeout(() => {
      this.showCurrentCard();
    }, 300);
  }
  
  completeSession() {
    const practiceSession = document.getElementById('practice-session');
    const sessionComplete = document.getElementById('session-complete');
    
    if (practiceSession) practiceSession.style.display = 'none';
    if (sessionComplete) {
      sessionComplete.classList.remove('hidden');
      sessionComplete.style.display = 'block';
    }
    
    // Update final stats
    this.updateFinalStats();
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
  
  showNoItemsState() {
    const loadingState = document.getElementById('loading-state');
    const noItemsState = document.getElementById('no-items-state');
    
    if (loadingState) loadingState.style.display = 'none';
    if (noItemsState) {
      noItemsState.classList.remove('hidden');
      noItemsState.style.display = 'block';
    }
  }
  
  showError(message) {
    console.error('[Practice] Showing error:', message);
    const container = document.querySelector('.flashcard-practice-container') || 
                     document.querySelector('.practice-container') ||
                     document.querySelector('main');
    
    if (container) {
      const errorHtml = `
        <div class="practice-error" style="text-align: center; padding: 40px 20px; max-width: 600px; margin: 0 auto;">
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h3 style="color: #d32f2f; margin-bottom: 15px;">Error Loading Practice Session</h3>
          <p style="color: #666; margin-bottom: 20px;">${message}</p>
          <button onclick="location.reload()" style="background: #1976d2; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
            Reload Page
          </button>
          <p style="margin-top: 20px; font-size: 14px; color: #999;">
            If this problem persists, please check the browser console for details.
          </p>
        </div>
      `;
      
      // Replace container content
      const practiceArea = container.querySelector('.practice-area') || container;
      practiceArea.innerHTML = errorHtml;
    }
  }
}

if (typeof window !== 'undefined') {
  window.EnhancedPracticeSession = EnhancedPracticeSession;
  console.log('[Practice] EnhancedPracticeSession class registered globally');
}
