/**
 * @file flashcards.ts
 * @description Core flashcard practice system with SM-2 spaced repetition integration
 * @status ACTIVE
 * @dependencies spaced-repetition.ts, language-toggle.ts, speech-recognition.ts
 * @used_by layouts/practice/single.html
 * @features
 *   - Flip animations with CSS transitions
 *   - Keyboard shortcuts (Space/Enter to flip, 0-5 to grade)
 *   - Progress tracking and session statistics
 *   - Bidirectional learning (Bulgarian↔German)
 *   - Speech recognition integration
 *   - localStorage persistence via bgde: prefix
 * @see docs/ARCHITECTURE.md for system design
 * @version 2.0.0
 * @updated October 2025
 */

import UnifiedSpacedRepetition from './unified-spaced-repetition';
import languageToggle from './language-toggle';
import SpeechPractice from './speech-recognition';
import type {
  DueItemsStats,
  ReviewState,
  SessionStats,
  CardText,
  FlashcardVocabularyItem,
  FlashcardMode,
  LanguageDirection,
  FlashcardInstance
} from './types.js';

export class Flashcards implements FlashcardInstance {
  private container: HTMLElement;
  private vocabularyData: FlashcardVocabularyItem[] = [];
  private sessionCards: FlashcardVocabularyItem[] = [];
  private currentIndex = 0;
  private currentCard: FlashcardVocabularyItem | null = null;
  private isFlipped = false;
  private languageDirection: LanguageDirection;
  private sessionStats: SessionStats = {
    startTime: null,
    endTime: null,
    totalCards: 0,
    reviewedCards: 0,
    correctAnswers: 0,
    grades: []
  };
  private spacedRepetition: UnifiedSpacedRepetition;

  // Configuration from shortcode parameters
  private category: string;
  private level: string;
  private limit: number;
  private mode: FlashcardMode;
  private shuffle: boolean;

  // DOM elements
  private stage: HTMLElement | null;
  private flashcard: HTMLElement | null;
  private wordText: HTMLElement | null;
  private translationText: HTMLElement | null;
  private wordMeta: HTMLElement | null;
  private wordNotes: HTMLElement | null;
  private reviewStats: HTMLElement | null;
  private gradingControls: HTMLElement | null;
  private sessionComplete: HTMLElement | null;
  private loading: HTMLElement | null;
  private error: HTMLElement | null;
  // speechControls removed as it's unused
  private speechBtn: HTMLElement | null;
  private speechFeedback: HTMLElement | null;

  // Progress elements
  private progressFill: HTMLElement | null;
  private sessionProgress: HTMLElement | null;
  private sessionAccuracy: HTMLElement | null;

  // Control buttons
  private pauseBtn: HTMLElement | null;
  private endBtn: HTMLElement | null;
  private retryBtn: HTMLElement | null;

  // Cache bound handlers to avoid duplicate listeners on retries
  private onGlobalKeydown: (e: KeyboardEvent) => void;
  private onLanguageDirectionChanged: (e: CustomEvent) => void;
  private globalKeyListenerAttached = false;
  private languageListenerAttached = false;
  private eventsBound = false;
  private speechPractice: SpeechPractice | null = null;
  private speechPracticeAvailable = false;
  private expectedSpeech = '';
  private isListening = false;
  private lastSpeechTone = 'info';
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.languageDirection = (languageToggle as any).getDirection() as LanguageDirection;
    this.spacedRepetition = new UnifiedSpacedRepetition();

    // Configuration from shortcode parameters
    this.category = container.dataset.category || '';
    this.level = container.dataset.level || '';
    this.limit = Number.parseInt(container.dataset.limit || '20');
    this.mode = (container.dataset.mode || 'practice') as FlashcardMode;
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
    // speechControls removed as it's unused
    this.speechBtn = container.querySelector('#start-pronunciation');
    this.speechFeedback = container.querySelector('#speech-feedback');

    // Progress elements
    this.progressFill = container.querySelector('#progress-fill');
    this.sessionProgress = container.querySelector('#session-progress');
    this.sessionAccuracy = container.querySelector('#session-accuracy');

    // Control buttons
    this.pauseBtn = container.querySelector('#pause-session');
    this.endBtn = container.querySelector('#end-session');
    this.retryBtn = container.querySelector('#retry-flashcards');

    // Cache bound handlers to avoid duplicate listeners on retries
    this.onGlobalKeydown = this.handleGlobalKeyboard.bind(this);
    this.onLanguageDirectionChanged = this.handleLanguageDirectionChange.bind(this);

    this.init();
  }

  getCardNote(vocab: FlashcardVocabularyItem): string {
    if (this.languageDirection === 'bg-de') {
      return vocab.notes_bg_to_de || vocab.notes || '';
    }
    return vocab.notes_de_to_bg || vocab.notes || '';
  }
  
  async init(): Promise<void> {
    try {
      this.bindEvents();
      this.showLoading(true);
      
      await this.loadVocabulary();
      await this.prepareSession();
      
      this.startSession();
      
    } catch (error) {
      console.error('Failed to initialize flashcards:', error);
      this.showError(true, (error as Error).message);
    }
  }

  readInlineVocabulary(): FlashcardVocabularyItem[] | null {
    const inlineElement = document.querySelector('#practice-vocabulary-data');
    if (!inlineElement) {
      return null;
    }

    const rawContent = inlineElement.textContent;
    if (!rawContent) {
      console.warn('Embedded vocabulary JSON is empty.');
      return null;
    }

    try {
      const parsed = JSON.parse(rawContent);
      if (!Array.isArray(parsed)) {
        console.warn('Embedded vocabulary JSON is not an array.');
        return null;
      }
      return parsed as FlashcardVocabularyItem[];
    } catch (error) {
      console.warn('Failed to parse embedded vocabulary JSON, falling back to network fetch.', error);
      return null;
    }
  }
  
  bindEvents(): void {
    if (this.eventsBound) {
      return;
    }
    this.eventsBound = true;

    // Card flip events
    if (this.flashcard) {
      this.flashcard.addEventListener('click', () => this.handleCardClick());
      this.flashcard.addEventListener('keydown', (e) => this.handleCardKeyboard(e));
    }
    
    // Grade button events
    const gradeButtons = this.container.querySelectorAll('.grade-btn');
    for (const btn of gradeButtons) {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const grade = Number.parseInt(target.dataset.grade || '0');
        this.handleGrade(grade);
      });
    }
    
    // Control button events
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => this.pauseSession());
    }
    
    if (this.endBtn) {
      this.endBtn.addEventListener('click', () => this.endSession());
    }
    
    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => {
        this.stopSpeechPractice();
        this.init();
      });
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
    
    // Listen for language direction changes (use bound handler for cleanup)
    if (!this.languageListenerAttached) {
      document.addEventListener('language-direction-changed', this.onLanguageDirectionChanged);
      this.languageListenerAttached = true;
    }

    // Attach global keyboard listener (use bound handler for cleanup)
    if (!this.globalKeyListenerAttached) {
      document.addEventListener('keydown', this.onGlobalKeydown);
      this.globalKeyListenerAttached = true;
    }

    this.setupSpeechControls();
  }

  setupSpeechControls(): void {
    if (!this.speechBtn) {
      return;
    }

    if (!SpeechPractice || !SpeechPractice.isSupported()) {
      this.speechPracticeAvailable = false;
      this.speechBtn.setAttribute('disabled', 'disabled');
      this.speechBtn.setAttribute('aria-disabled', 'true');
      const label = this.speechBtn.querySelector('.label');
      if (label) {
        label.textContent = 'Speech Not Supported';
      }
      if (this.speechFeedback) {
        this.speechFeedback.dataset.tone = 'warning';
        this.speechFeedback.textContent = 'Speech recognition is not supported in this browser.';
      }
      return;
    }

    try {
      this.speechPractice = new SpeechPractice({
        onStatus: (status: string) => this.updateSpeechStatus(status),
        onResult: (transcript: string) => this.handleSpeechResult(transcript),
        onError: (message: string) => this.updateSpeechFeedback(message, 'error')
      });
      this.speechPracticeAvailable = true;
      this.speechBtn.addEventListener('click', () => this.toggleSpeechPractice());
      this.updateSpeechFeedback('Ready to practice pronunciation.', 'info');
    } catch (error) {
      this.speechPracticeAvailable = false;
      this.speechBtn.setAttribute('disabled', 'disabled');
      this.speechBtn.setAttribute('aria-disabled', 'true');
      const label = this.speechBtn.querySelector('.label');
      if (label) {
        label.textContent = 'Speech Not Supported';
      }
      if (this.speechFeedback) {
        this.speechFeedback.dataset.tone = 'error';
        this.speechFeedback.textContent = error instanceof Error ? error.message : 'Speech recognition unavailable.';
      }
    }
  }

  toggleSpeechPractice(): void {
    if (!this.speechPracticeAvailable || !this.speechPractice) {
      return;
    }

    if (!this.currentCard) {
      this.updateSpeechFeedback('Load a card before practicing pronunciation.', 'warning');
      return;
    }

    if (this.isListening) {
      this.stopSpeechPractice();
      return;
    }

    const prompt = this.getCardText(this.currentCard).frontText;
    this.expectedSpeech = prompt;
    const langCode = this.languageDirection === 'bg-de' ? 'bg-BG' : 'de-DE';

    this.updateSpeechFeedback(`Listening... say "${prompt}"`, 'info');
    this.speechPractice.start({ lang: langCode });
  }

  stopSpeechPractice(): void {
    if (this.speechPractice && this.isListening) {
      this.speechPractice.stop();
    }
    this.isListening = false;
    if (this.speechBtn) {
      this.speechBtn.setAttribute('aria-pressed', 'false');
      const label = this.speechBtn.querySelector('.label');
      if (label) {
        label.textContent = 'Practice Pronunciation';
      }
    }
  }

  resetSpeechPracticeForNextCard(): void {
    this.expectedSpeech = '';
    this.stopSpeechPractice();
    if (this.speechPracticeAvailable && this.speechFeedback) {
      this.lastSpeechTone = 'info';
      this.speechFeedback.dataset.tone = 'info';
    }
  }

  updateSpeechStatus(status: string): void {
    this.isListening = status === 'listening';

    if (this.speechBtn) {
      this.speechBtn.setAttribute('aria-pressed', this.isListening ? 'true' : 'false');
      const label = this.speechBtn.querySelector('.label');
      if (label) {
        label.textContent = this.isListening ? 'Stop Listening' : 'Practice Pronunciation';
      }
    }

    if (status === 'listening') {
      this.lastSpeechTone = 'info';
      if (this.speechFeedback) {
        this.speechFeedback.dataset.tone = 'info';
        this.speechFeedback.textContent = 'Listening...';
      }
    } else if (status === 'idle' && this.lastSpeechTone === 'info' && this.speechPracticeAvailable) {
      this.updateSpeechFeedback('Microphone ready.', 'info');
    }
  }

  updateSpeechFeedback(message: string, tone = 'info'): void {
    if (!this.speechFeedback) {
      return;
    }
    this.lastSpeechTone = tone;
    this.speechFeedback.dataset.tone = tone;
    this.speechFeedback.textContent = message;
  }

  handleSpeechResult(transcript: string): void {
    if (!transcript) {
      this.updateSpeechFeedback('No audio detected. Please try again.', 'warning');
      return;
    }

    const expected = this.normalizeSpeechText(this.expectedSpeech);
    this.expectedSpeech = '';
    const heard = this.normalizeSpeechText(transcript);

    this.stopSpeechPractice();

    if (!expected) {
      this.updateSpeechFeedback(`Heard "${transcript}".`, 'info');
      return;
    }

    const match =
      heard.includes(expected) ||
      expected.includes(heard);

    if (match) {
      this.updateSpeechFeedback(`Heard "${transcript}". Great pronunciation!`, 'success');
      if (!this.isFlipped) {
        this.flipCard();
      }
      setTimeout(() => this.handleGrade(5), 400);
    } else {
      this.updateSpeechFeedback(`Heard "${transcript}". Let's try again.`, 'warning');
    }
  }

  normalizeSpeechText(value: string): string {
    if (!value) {
      return '';
    }
    return value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036F]/g, '')
      .replaceAll(/[^\p{Letter}\p{Number}\s]/gu, '')
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  updateSpeechPrompt(): void {
    if (!this.speechPracticeAvailable || !this.speechFeedback || !this.currentCard) {
      return;
    }

    const prompt = this.getCardText(this.currentCard).frontText;
    if (!prompt || this.isListening) {
      return;
    }

    this.lastSpeechTone = 'info';
    this.speechFeedback.dataset.tone = 'info';
    this.speechFeedback.textContent = `Ready to practice "${prompt}" when you press the microphone button.`;
  }

  async loadVocabulary(): Promise<void> {
    try {
      const inlineData = this.readInlineVocabulary();
      if (inlineData && inlineData.length > 0) {
        this.vocabularyData = inlineData;
        return;
      }

      // Try to load from modular vocabulary API first
      try {
        const { vocabularyAPI } = await import('./modules/vocabulary-api.js');
        const allEntries = await vocabularyAPI.loadAll();
        
        if (Array.isArray(allEntries) && allEntries.length > 0) {
          this.vocabularyData = allEntries;
          console.log(`[Flashcards] Loaded ${allEntries.length} entries via modular API`);
          return;
        }
      } catch (apiError) {
        console.warn('[Flashcards] Modular API not available, falling back to fetch:', apiError);
      }

      // Fallback to fetching from Hugo's data directory
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
      throw new Error(`Failed to load vocabulary: ${(error as Error).message}`);
    }
  }
  
  async prepareSession(): Promise<void> {
    let filteredData = this.vocabularyData.filter(item => {
      const categoryMatch = !this.category || item.category === this.category;
      const levelMatch = !this.level || item.level === this.level;
      return categoryMatch && levelMatch;
    });
    
    // Apply mode-specific filtering
    if (this.mode === 'due') {
      const dueItems = this.spacedRepetition.getDueItems();
      filteredData = filteredData.filter(item =>
        dueItems.some(dueItem => dueItem.itemId === this.generateWordId(item.word))
      );
    } else if (this.mode === 'review') {
      // Filter items that have been reviewed before
      filteredData = filteredData.filter(item => {
        const wordId = this.generateWordId(item.word);
        const state = this.spacedRepetition.loadState(wordId);
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
  
  startSession(): void {
    this.sessionStats.startTime = new Date();
    this.currentIndex = 0;
    this.showLoading(false);
    this.showCard(0);
    this.updateProgress();
    
    // Announce session start to screen readers
    this.announceToScreenReader(`Starting flashcard session with ${this.sessionStats.totalCards} cards`);
  }
  
  showCard(index: number): void {
    if (index >= this.sessionCards.length) {
      this.completeSession();
      return;
    }
    
    this.currentIndex = index;
    this.currentCard = this.sessionCards[index] || null;
    this.isFlipped = false;
    this.resetSpeechPracticeForNextCard();
    
    // Reset card state
    if (this.flashcard) {
      this.flashcard.classList.remove('flipped');
    }
    if (this.gradingControls) {
      this.gradingControls.style.display = 'none';
    }
    if (this.stage) {
      this.stage.style.display = 'block';
    }
    
    // Update card content
    this.updateCardContent();
    this.updateSpeechPrompt();
    this.updateProgress();
    
    // Focus the card for keyboard navigation
    if (this.flashcard) {
      this.flashcard.focus();
    }
  }
  
  updateCardContent(): void {
    if (!this.currentCard) {
      return;
    }
    
    const stats = this.spacedRepetition.getStats();
    
    // Get display text based on language direction
    const { frontText, backText } = this.getCardText(this.currentCard);
    
    // Front of card
    if (this.wordText) {
      this.wordText.textContent = frontText;
    }
    
    // Meta information
    const categorySpan = this.wordMeta?.querySelector('.word-category');
    const levelSpan = this.wordMeta?.querySelector('.word-level');
    
    if (categorySpan) {
      categorySpan.textContent = this.currentCard.category || '';
      categorySpan.style.display = this.currentCard.category ? 'inline' : 'none';
    }
    
    if (levelSpan) {
      levelSpan.textContent = this.currentCard.level || '';
      levelSpan.style.display = this.currentCard.level ? 'inline' : 'none';
    }
    
    // Back of card
    if (this.translationText) {
      this.translationText.textContent = backText;
    }
    
    // Notes
    if (this.wordNotes) {
      const noteText = this.getCardNote(this.currentCard);
      this.wordNotes.textContent = noteText || '';
      this.wordNotes.style.display = noteText ? 'block' : 'none';
    }
    
    // Review statistics
    this.updateReviewStats(stats);
    
    // Update card accessibility
    if (this.flashcard) {
      this.flashcard.setAttribute('aria-label', 
        `Flashcard ${this.currentIndex + 1} of ${this.sessionStats.totalCards}: ${frontText}`
      );
    }
  }
  
  getCardText(vocab: FlashcardVocabularyItem): CardText {
    // Return appropriate text based on language direction
    if (this.languageDirection === 'bg-de') {
      // Bulgarian to German: show Bulgarian word, translate to German
      return {
        frontText: vocab.word || '',
        backText: vocab.translation || ''
      };
    }

    // German to Bulgarian: show German word, translate to Bulgarian
    return {
      frontText: vocab.translation || '',
      backText: vocab.word || ''
    };
  }
  
  renderCurrentCard(): void {
    // Re-render the current card with updated language direction
    if (this.currentCard) {
      this.updateCardContent();
      this.updateSpeechPrompt();
    }
  }
  
  updateReviewStats(stats: DueItemsStats): void {
    if (!this.reviewStats) {
      return;
    }
    
    const totalReviews = this.reviewStats.querySelector('#total-reviews');
    const wordAccuracy = this.reviewStats.querySelector('#word-accuracy');
    const wordStreak = this.reviewStats.querySelector('#word-streak');
    
    if (totalReviews) {
      totalReviews.textContent = stats.total.toString();
    }
    if (wordAccuracy) {
      wordAccuracy.textContent = `${stats.avgAccuracy}%`;
    }
    if (wordStreak) {
      wordStreak.textContent = stats.due.toString();
    }
  }
  
  handleCardClick(): void {
    if (!this.isFlipped) {
      this.flipCard();
    }
  }
  
  handleCardKeyboard(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!this.isFlipped) {
        this.flipCard();
      }
    }
  }
  
  handleLanguageDirectionChange(e: CustomEvent<{ direction: LanguageDirection }>): void {
    this.languageDirection = e.detail.direction;
    this.renderCurrentCard(); // Re-render current card with new direction
  }

  handleGlobalKeyboard(e: KeyboardEvent): void {
    // Only handle if flashcards are active
    if (!this.stage || this.stage.style.display === 'none') {
      return;
    }

    // Grade shortcuts (0-5)
    if (e.key >= '0' && e.key <= '5' && this.isFlipped) {
      e.preventDefault();
      const grade = Number.parseInt(e.key);
      this.handleGrade(grade);
      return;
    }

    // Navigation shortcuts
    switch (e.key) {
    case 'Escape': {
      e.preventDefault();
      this.pauseSession();
      break;
    }
    case 'f':
    case 'F': {
      if (!this.isFlipped) {
        e.preventDefault();
        this.flipCard();
      }
      break;
    }
    }
  }
  
  flipCard(): void {
    if (this.isFlipped) {
      return;
    }
    
    this.isFlipped = true;
    if (this.flashcard) {
      this.flashcard.classList.add('flipped');
    }
    
    // Show grading controls after flip animation
    setTimeout(() => {
      if (this.gradingControls) {
        this.gradingControls.style.display = 'block';
        
        // Focus first grade button for keyboard navigation
        const firstGradeBtn = this.gradingControls.querySelector('.grade-btn');
        if (firstGradeBtn) {
          (firstGradeBtn as HTMLElement).focus();
        }
      }
    }, 300);
    
    this.announceToScreenReader('Card flipped. Rate your knowledge using buttons or keys 0-5.');
  }
  
  handleGrade(grade: number): void {
    if (!this.isFlipped || grade < 0 || grade > 5) {
      return;
    }
    
    const wordId = this.generateWordId(this.currentCard!.word);
    
    // Get or initialize review state
    let reviewState = this.spacedRepetition.loadState(wordId);
    if (!reviewState) {
      reviewState = this.spacedRepetition.initReviewState(wordId);
    }
    
    // Update spaced repetition state
    const updatedState = this.spacedRepetition.scheduleNext(reviewState, grade);
    
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
  
  showGradeFeedback(grade: number, reviewState: ReviewState): void {
    const gradeBtn = this.gradingControls?.querySelector(`[data-grade="${grade}"]`);
    if (gradeBtn) {
      gradeBtn.classList.add('selected');
    }
    
    // Create feedback message
    const feedback = document.createElement('div');
    feedback.className = 'grade-feedback';
    feedback.innerHTML = `
      <div class="feedback-grade">Grade: ${grade}</div>
      <div class="feedback-next">Next review: ${this.formatNextReview(new Date(reviewState.nextReview).toISOString())}</div>
      <div class="feedback-interval">Interval: ${reviewState.interval} day${reviewState.interval === 1 ? '' : 's'}</div>
    `;
    
    if (this.gradingControls) {
      this.gradingControls.append(feedback);
    }
    
    // Remove feedback after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 1400);
  }
  
  formatNextReview(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Tomorrow';
    }
    if (diffDays < 7) {
      return `In ${diffDays} days`;
    }
    if (diffDays < 30) {
      return `In ${Math.ceil(diffDays / 7)} weeks`;
    }
    return `In ${Math.ceil(diffDays / 30)} months`;
  }
  
  updateProgress(): void {
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
  
  pauseSession(): void {
    this.stopSpeechPractice();
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
    
    this.container.append(pauseOverlay);
    
    // Bind resume events
    const resumeBtn = pauseOverlay.querySelector('#resume-session');
    const endBtn = pauseOverlay.querySelector('#end-paused-session');
    
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        pauseOverlay.remove();
        if (this.flashcard) {
          this.flashcard.focus();
        }
      });
    }
    
    if (endBtn) {
      endBtn.addEventListener('click', () => {
        pauseOverlay.remove();
        this.endSession();
      });
    }
  }
  
  endSession(): void {
    this.stopSpeechPractice();
    this.cleanup(); // Remove event listeners
    this.sessionStats.endTime = new Date();
    this.completeSession();
  }

  completeSession(): void {
    this.stopSpeechPractice();
    this.sessionStats.endTime = this.sessionStats.endTime || new Date();

    // Hide main interface
    if (this.stage) {
      this.stage.style.display = 'none';
    }
    if (this.gradingControls) {
      this.gradingControls.style.display = 'none';
    }

    // Show completion screen
    this.showSessionComplete();

    this.announceToScreenReader('Flashcard session completed');
  }

  /**
   * Cleanup method to remove event listeners
   * Prevents keyboard event persistence issues (P1 bug fix)
   */
  cleanup(): void {
    // Remove global keyboard listener
    if (this.globalKeyListenerAttached) {
      document.removeEventListener('keydown', this.onGlobalKeydown);
      this.globalKeyListenerAttached = false;
    }

    // Remove language direction listener
    if (this.languageListenerAttached) {
      document.removeEventListener('language-direction-changed', this.onLanguageDirectionChanged);
      this.languageListenerAttached = false;
    }

    // Stop speech practice if active
    this.stopSpeechPractice();
  }
  
  showSessionComplete(): void {
    const duration = this.sessionStats.endTime!.getTime() - this.sessionStats.startTime!.getTime();
    const minutes = Math.round(duration / (1000 * 60));
    
    const finalCards = this.container.querySelector('#final-cards');
    const finalAccuracy = this.container.querySelector('#final-accuracy');
    const finalTime = this.container.querySelector('#final-time');
    
    if (finalCards) {
      finalCards.textContent = this.sessionStats.reviewedCards.toString();
    }
    if (finalAccuracy) {
      const accuracy = this.sessionStats.reviewedCards > 0 ? 
        Math.round((this.sessionStats.correctAnswers / this.sessionStats.reviewedCards) * 100) : 0;
      finalAccuracy.textContent = `${accuracy}%`;
    }
    if (finalTime) {
      finalTime.textContent = `${minutes}m`;
    }
    
    // Show/hide review mistakes button
    const reviewMistakesBtn = this.container.querySelector('#review-mistakes');
    if (reviewMistakesBtn) {
      const hasIncorrect = this.sessionStats.grades.some(grade => grade < 3);
      (reviewMistakesBtn as HTMLElement).style.display = hasIncorrect ? 'inline-block' : 'none';
    }
    
    if (this.sessionComplete) {
      this.sessionComplete.style.display = 'block';
    }
  }
  
  startNewSession(): void {
    this.stopSpeechPractice();
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
    if (this.sessionComplete) {
      this.sessionComplete.style.display = 'none';
    }
    
    // Restart session
    this.startSession();
  }
  
  reviewMistakes(): void {
    this.stopSpeechPractice();
    // Filter cards that were graded < 3
    const mistakeIndices: number[] = [];
    for (const [index, grade] of this.sessionStats.grades.entries()) {
      if (grade < 3) {
        mistakeIndices.push(index);
      }
    }
    
    if (mistakeIndices.length === 0) {
      return;
    }
    
    // Create new session with only mistake cards
    this.sessionCards = mistakeIndices.map(index => this.sessionCards[index]).filter((item): item is FlashcardVocabularyItem => item !== undefined);
    this.startNewSession();
  }
  
  backToVocabulary(): void {
    this.stopSpeechPractice();
    // Navigate back to vocabulary page
    window.location.href = '/vocabulary/';
  }
  
  showLoading(show: boolean): void {
    if (this.loading) {
      this.loading.style.display = show ? 'flex' : 'none';
    }
  }
  
  showError(show: boolean, message = ''): void {
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
  
  generateWordId(word: string): string {
    return word.toLowerCase()
      .replaceAll(/[^\s\w-]/g, '')
      .replaceAll(/\s+/g, '-')
      .slice(0, 50);
  }
  
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp!;
    }
    return shuffled;
  }
  
  announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.append(announcement);
    
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }
}

export default Flashcards;