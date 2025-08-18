/**
 * Flashcard Practice System
 * Integrates with spaced repetition for effective learning
 * Supports flip animations, grading, progress tracking, and bidirectional learning
 */

import { spacedRepetition } from './spaced-repetition.js';
import { languageToggle } from './language-toggle.js';

export class Flashcards {
  constructor(container) {
    this.container = container;
    this.vocabularyData = [];
    this.sessionCards = [];
    this.currentIndex = 0;
    this.currentCard = null;
    this.isFlipped = false;
    this.languageDirection = languageToggle.getDirection();
    this.sessionStats = {
      startTime: null,
      endTime: null,
      totalCards: 0,
      reviewedCards: 0,
      correctAnswers: 0,
      grades: []
    };
    
    // Configuration from shortcode parameters
    this.category = container.dataset.category || '';
    this.level = container.dataset.level || '';
    this.limit = parseInt(container.dataset.limit) || 20;
    this.mode = container.dataset.mode || 'practice';
    this.shuffle = container.dataset.shuffle === 'true';
    
    // DOM elements
    this.stage = container.querySelector('#flashcard-stage');
    this.flashcard = container.querySelector('#current-flashcard');
    this.wordText = container.querySelector('#word-text');
    this.translationText = container.querySelector('#translation-text');
    this.wordMeta = container.querySelector('#word-meta');
    this.wordNotes = container.querySelector('#word-notes');
    this.reviewStats = container.querySelector('#review-stats');
    this.gradingControls = container.querySelector('#grading-controls');
    this.sessionComplete = container.querySelector('#session-complete');
    this.loading = container.querySelector('#flashcards-loading');
    this.error = container.querySelector('#flashcards-error');
    
    // Progress elements
    this.progressFill = container.querySelector('#progress-fill');
    this.sessionProgress = container.querySelector('#session-progress');
    this.sessionAccuracy = container.querySelector('#session-accuracy');
    
    // Control buttons
    this.pauseBtn = container.querySelector('#pause-session');
    this.endBtn = container.querySelector('#end-session');
    this.retryBtn = container.querySelector('#retry-flashcards');
    
    this.init();
  }
  
  async init() {
    try {
      this.bindEvents();
      this.showLoading(true);
      
      await this.loadVocabulary();
      await this.prepareSession();
      
      this.startSession();
      
    } catch (error) {
      console.error('Failed to initialize flashcards:', error);
      this.showError(true, error.message);
    }
  }
  
  bindEvents() {
    // Card flip events
    if (this.flashcard) {
      this.flashcard.addEventListener('click', () => this.handleCardClick());
      this.flashcard.addEventListener('keydown', (e) => this.handleCardKeyboard(e));
    }
    
    // Grade button events
    const gradeButtons = this.container.querySelectorAll('.grade-btn');
    gradeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const grade = parseInt(e.currentTarget.dataset.grade);
        this.handleGrade(grade);
      });
    });
    
    // Control button events
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => this.pauseSession());
    }
    
    if (this.endBtn) {
      this.endBtn.addEventListener('click', () => this.endSession());
    }
    
    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => this.init());
    }
    
    // Session complete actions
    const newSessionBtn = this.container.querySelector('#new-session');
    const reviewMistakesBtn = this.container.querySelector('#review-mistakes');
    const backToVocabBtn = this.container.querySelector('#back-to-vocab');
    
    if (newSessionBtn) {
      newSessionBtn.addEventListener('click', () => this.startNewSession());
    }
    
    if (reviewMistakesBtn) {
      reviewMistakesBtn.addEventListener('click', () => this.reviewMistakes());
    }
    
    if (backToVocabBtn) {
      backToVocabBtn.addEventListener('click', () => this.backToVocabulary());
    }
    
    // Listen for language direction changes
    document.addEventListener('language-direction-changed', (e) => {
      this.languageDirection = e.detail.direction;
      this.renderCurrentCard(); // Re-render current card with new direction
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleGlobalKeyboard(e));
  }
  
  async loadVocabulary() {
    try {
      // Try to load from Hugo's data directory first
      let response = await fetch('/data/vocabulary.json');
      
      // Fallback to static directory if data directory fails
      if (!response.ok) {
        response = await fetch('/static/data/vocabulary.json');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.vocabularyData = await response.json();
      
      if (!Array.isArray(this.vocabularyData) || this.vocabularyData.length === 0) {
        throw new Error('Invalid or empty vocabulary data');
      }
      
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
      throw new Error(`Failed to load vocabulary: ${error.message}`);
    }
  }
  
  async prepareSession() {
    let filteredData = this.vocabularyData.filter(item => {
      const categoryMatch = !this.category || item.category === this.category;
      const levelMatch = !this.level || item.level === this.level;
      return categoryMatch && levelMatch;
    });
    
    // Apply mode-specific filtering
    if (this.mode === 'due') {
      const dueItems = spacedRepetition.getDueItems();
      filteredData = filteredData.filter(item => 
        dueItems.includes(this.generateWordId(item.word))
      );
    } else if (this.mode === 'review') {
      // Filter items that have been reviewed before
      filteredData = filteredData.filter(item => {
        const wordId = this.generateWordId(item.word);
        const state = spacedRepetition.loadState(wordId);
        return state && state.totalReviews > 0;
      });
    }
    
    if (filteredData.length === 0) {
      throw new Error(`No vocabulary items found for ${this.mode} mode with current filters`);
    }
    
    // Shuffle if requested
    if (this.shuffle) {
      filteredData = this.shuffleArray([...filteredData]);
    }
    
    // Limit session size
    this.sessionCards = filteredData.slice(0, this.limit);
    this.sessionStats.totalCards = this.sessionCards.length;
  }
  
  startSession() {
    this.sessionStats.startTime = new Date();
    this.currentIndex = 0;
    this.showLoading(false);
    this.showCard(0);
    this.updateProgress();
    
    // Announce session start to screen readers
    this.announceToScreenReader(`Starting flashcard session with ${this.sessionStats.totalCards} cards`);
  }
  
  showCard(index) {
    if (index >= this.sessionCards.length) {
      this.completeSession();
      return;
    }
    
    this.currentIndex = index;
    this.currentCard = this.sessionCards[index];
    this.isFlipped = false;
    
    // Reset card state
    this.flashcard.classList.remove('flipped');
    this.gradingControls.style.display = 'none';
    this.stage.style.display = 'block';
    
    // Update card content
    this.updateCardContent();
    this.updateProgress();
    
    // Focus the card for keyboard navigation
    this.flashcard.focus();
  }
  
  updateCardContent() {
    if (!this.currentCard) return;
    
    const wordId = this.generateWordId(this.currentCard.word);
    const stats = spacedRepetition.getStats(wordId);
    
    // Get display text based on language direction
    const { frontText, backText } = this.getCardText(this.currentCard);
    
    // Front of card
    this.wordText.textContent = frontText;
    
    // Meta information
    const categorySpan = this.wordMeta.querySelector('.word-category');
    const levelSpan = this.wordMeta.querySelector('.word-level');
    
    if (categorySpan) {
      categorySpan.textContent = this.currentCard.category || '';
      categorySpan.style.display = this.currentCard.category ? 'inline' : 'none';
    }
    
    if (levelSpan) {
      levelSpan.textContent = this.currentCard.level || '';
      levelSpan.style.display = this.currentCard.level ? 'inline' : 'none';
    }
    
    // Back of card
    this.translationText.textContent = backText;
    
    // Notes
    if (this.wordNotes) {
      this.wordNotes.textContent = this.currentCard.notes || '';
      this.wordNotes.style.display = this.currentCard.notes ? 'block' : 'none';
    }
    
    // Review statistics
    this.updateReviewStats(stats);
    
    // Update card accessibility
    this.flashcard.setAttribute('aria-label', 
      `Flashcard ${this.currentIndex + 1} of ${this.sessionStats.totalCards}: ${frontText}`
    );
  }
  
  getCardText(vocab) {
    // Return appropriate text based on language direction
    if (this.languageDirection === 'bg-de') {
      // Bulgarian to German: show Bulgarian word, translate to German
      return {
        frontText: vocab.translation, // Bulgarian word
        backText: vocab.word // German translation
      };
    } else {
      // German to Bulgarian (default): show German word, translate to Bulgarian
      return {
        frontText: vocab.word, // German word
        backText: vocab.translation // Bulgarian translation
      };
    }
  }
  
  renderCurrentCard() {
    // Re-render the current card with updated language direction
    if (this.currentCard) {
      this.updateCardContent();
    }
  }
  
  updateReviewStats(stats) {
    if (!this.reviewStats) return;
    
    const totalReviews = this.reviewStats.querySelector('#total-reviews');
    const wordAccuracy = this.reviewStats.querySelector('#word-accuracy');
    const wordStreak = this.reviewStats.querySelector('#word-streak');
    
    if (totalReviews) totalReviews.textContent = stats.totalReviews;
    if (wordAccuracy) wordAccuracy.textContent = `${stats.accuracy}%`;
    if (wordStreak) wordStreak.textContent = stats.streak;
  }
  
  handleCardClick() {
    if (!this.isFlipped) {
      this.flipCard();
    }
  }
  
  handleCardKeyboard(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!this.isFlipped) {
        this.flipCard();
      }
    }
  }
  
  handleGlobalKeyboard(e) {
    // Only handle if flashcards are active
    if (this.stage.style.display === 'none') return;
    
    // Grade shortcuts (0-5)
    if (e.key >= '0' && e.key <= '5' && this.isFlipped) {
      e.preventDefault();
      const grade = parseInt(e.key);
      this.handleGrade(grade);
      return;
    }
    
    // Navigation shortcuts
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.pauseSession();
        break;
      case 'f':
      case 'F':
        if (!this.isFlipped) {
          e.preventDefault();
          this.flipCard();
        }
        break;
    }
  }
  
  flipCard() {
    if (this.isFlipped) return;
    
    this.isFlipped = true;
    this.flashcard.classList.add('flipped');
    
    // Show grading controls after flip animation
    setTimeout(() => {
      this.gradingControls.style.display = 'block';
      
      // Focus first grade button for keyboard navigation
      const firstGradeBtn = this.gradingControls.querySelector('.grade-btn');
      if (firstGradeBtn) {
        firstGradeBtn.focus();
      }
    }, 300);
    
    this.announceToScreenReader('Card flipped. Rate your knowledge using buttons or keys 0-5.');
  }
  
  handleGrade(grade) {
    if (!this.isFlipped || grade < 0 || grade > 5) return;
    
    const wordId = this.generateWordId(this.currentCard.word);
    
    // Get or initialize review state
    let reviewState = spacedRepetition.loadState(wordId);
    if (!reviewState) {
      reviewState = spacedRepetition.initReviewState(wordId);
    }
    
    // Update spaced repetition state
    const updatedState = spacedRepetition.scheduleNext(reviewState, grade);
    
    // Update session statistics
    this.sessionStats.reviewedCards++;
    this.sessionStats.grades.push(grade);
    
    if (grade >= 3) {
      this.sessionStats.correctAnswers++;
    }
    
    // Provide visual feedback
    this.showGradeFeedback(grade, updatedState);
    
    // Move to next card after delay
    setTimeout(() => {
      this.showCard(this.currentIndex + 1);
    }, 1500);
  }
  
  showGradeFeedback(grade, reviewState) {
    const gradeBtn = this.gradingControls.querySelector(`[data-grade="${grade}"]`);
    if (gradeBtn) {
      gradeBtn.classList.add('selected');
    }
    
    // Create feedback message
    const feedback = document.createElement('div');
    feedback.className = 'grade-feedback';
    feedback.innerHTML = `
      <div class="feedback-grade">Grade: ${grade}</div>
      <div class="feedback-next">Next review: ${this.formatNextReview(reviewState.nextReviewDate)}</div>
      <div class="feedback-interval">Interval: ${reviewState.interval} day${reviewState.interval !== 1 ? 's' : ''}</div>
    `;
    
    this.gradingControls.appendChild(feedback);
    
    // Remove feedback after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 1400);
  }
  
  formatNextReview(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  }
  
  updateProgress() {
    const progress = this.sessionStats.totalCards > 0 ? 
      (this.sessionStats.reviewedCards / this.sessionStats.totalCards) * 100 : 0;
    
    if (this.progressFill) {
      this.progressFill.style.width = `${progress}%`;
    }
    
    if (this.sessionProgress) {
      this.sessionProgress.textContent = 
        `${this.sessionStats.reviewedCards} / ${this.sessionStats.totalCards}`;
    }
    
    if (this.sessionAccuracy) {
      const accuracy = this.sessionStats.reviewedCards > 0 ? 
        Math.round((this.sessionStats.correctAnswers / this.sessionStats.reviewedCards) * 100) : 0;
      this.sessionAccuracy.textContent = `${accuracy}% accuracy`;
    }
  }
  
  pauseSession() {
    // Implementation for pause functionality
    const pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'pause-overlay';
    pauseOverlay.innerHTML = `
      <div class="pause-content">
        <h3>Session Paused</h3>
        <p>Take a break and come back when you're ready.</p>
        <button class="flashcard-btn primary" id="resume-session">Resume</button>
        <button class="flashcard-btn secondary" id="end-paused-session">End Session</button>
      </div>
    `;
    
    this.container.appendChild(pauseOverlay);
    
    // Bind resume events
    pauseOverlay.querySelector('#resume-session').addEventListener('click', () => {
      this.container.removeChild(pauseOverlay);
      this.flashcard.focus();
    });
    
    pauseOverlay.querySelector('#end-paused-session').addEventListener('click', () => {
      this.container.removeChild(pauseOverlay);
      this.endSession();
    });
  }
  
  endSession() {
    this.sessionStats.endTime = new Date();
    this.completeSession();
  }
  
  completeSession() {
    this.sessionStats.endTime = this.sessionStats.endTime || new Date();
    
    // Hide main interface
    this.stage.style.display = 'none';
    this.gradingControls.style.display = 'none';
    
    // Show completion screen
    this.showSessionComplete();
    
    this.announceToScreenReader('Flashcard session completed');
  }
  
  showSessionComplete() {
    const duration = this.sessionStats.endTime - this.sessionStats.startTime;
    const minutes = Math.round(duration / (1000 * 60));
    
    const finalCards = this.container.querySelector('#final-cards');
    const finalAccuracy = this.container.querySelector('#final-accuracy');
    const finalTime = this.container.querySelector('#final-time');
    
    if (finalCards) finalCards.textContent = this.sessionStats.reviewedCards;
    if (finalAccuracy) {
      const accuracy = this.sessionStats.reviewedCards > 0 ? 
        Math.round((this.sessionStats.correctAnswers / this.sessionStats.reviewedCards) * 100) : 0;
      finalAccuracy.textContent = `${accuracy}%`;
    }
    if (finalTime) finalTime.textContent = `${minutes}m`;
    
    // Show/hide review mistakes button
    const reviewMistakesBtn = this.container.querySelector('#review-mistakes');
    if (reviewMistakesBtn) {
      const hasIncorrect = this.sessionStats.grades.some(grade => grade < 3);
      reviewMistakesBtn.style.display = hasIncorrect ? 'inline-block' : 'none';
    }
    
    this.sessionComplete.style.display = 'block';
  }
  
  startNewSession() {
    // Reset session state
    this.currentIndex = 0;
    this.sessionStats = {
      startTime: null,
      endTime: null,
      totalCards: this.sessionStats.totalCards,
      reviewedCards: 0,
      correctAnswers: 0,
      grades: []
    };
    
    // Hide completion screen
    this.sessionComplete.style.display = 'none';
    
    // Restart session
    this.startSession();
  }
  
  reviewMistakes() {
    // Filter cards that were graded < 3
    const mistakeIndices = [];
    this.sessionStats.grades.forEach((grade, index) => {
      if (grade < 3) {
        mistakeIndices.push(index);
      }
    });
    
    if (mistakeIndices.length === 0) return;
    
    // Create new session with only mistake cards
    this.sessionCards = mistakeIndices.map(index => this.sessionCards[index]);
    this.startNewSession();
  }
  
  backToVocabulary() {
    // Navigate back to vocabulary page
    window.location.href = '/vocabulary/';
  }
  
  showLoading(show) {
    if (this.loading) {
      this.loading.style.display = show ? 'flex' : 'none';
    }
  }
  
  showError(show, message = '') {
    if (this.error) {
      this.error.style.display = show ? 'block' : 'none';
      
      if (show && message) {
        const errorMessage = this.error.querySelector('#error-message');
        if (errorMessage) {
          errorMessage.textContent = message;
        }
      }
    }
  }
  
  generateWordId(word) {
    return word.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

export default Flashcards;
