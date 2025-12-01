/**
 * Practice Page Module - Lazy loaded only on practice pages
 *
 * This module handles the complete practice session workflow including:
 * - Session initialization and management
 * - Flashcard display and interaction
 * - Spaced repetition integration
 * - Audio playback functionality
 * - Session statistics and progress tracking
 * - Keyboard shortcuts and accessibility
 * - Settings and configuration management
 *
 * @example
 * ```typescript
 * import PracticePageModule from './modules/practice-page.js';
 *
 * const practiceModule = new PracticePageModule({
 *   adapter: vocabularyAdapter,
 *   spacedRepetition: spacedRepetitionSystem,
 *   learningDirection: 'bg-de',
 *   enableAudio: true,
 *   sessionLength: 20
 * });
 *
 * await practiceModule.init();
 * ```
 *
 * @since 1.0.0
 */

import type {
  VocabularyAdapter,
  SpacedRepetitionSystem,
  VocabularyItem,
  ReviewState,
  ReviewUpdateOptions,
  AudioManager,
  LanguageToggle,
  ExtendedWindow
} from '../types/vocabulary-types.js';

/**
 * Learning direction type for practice sessions
 *
 * - 'bg-de': Bulgarian to German (learn German words)
 * - 'de-bg': German to Bulgarian (learn Bulgarian words)
 *
 * @typedef {'bg-de' | 'de-bg'} LearningDirection
 */
type LearningDirection = 'bg-de' | 'de-bg';

/**
 * Configuration options for the Practice Page Module
 *
 * @interface PracticePageModuleOptions
 * @property {VocabularyAdapter} [adapter] - Vocabulary adapter instance for data access
 * @property {SpacedRepetitionSystem} [spacedRepetition] - Spaced repetition system instance
 * @property {string[]} [selectedItems] - Array of selected vocabulary item IDs or words
 * @property {string} [learningDirection] - Initial learning direction ('bg-de' or 'de-bg')
 * @property {boolean} [enableAudio=false] - Whether to enable audio playback
 * @property {number} [sessionLength=20] - Number of items in each practice session
 *
 * @example
 * ```typescript
 * const options: PracticePageModuleOptions = {
 *   adapter: new VocabularyAdapter(),
 *   spacedRepetition: new SpacedRepetitionSystem(),
 *   selectedItems: ['hello', 'world'],
 *   learningDirection: 'bg-de',
 *   enableAudio: true,
 *   sessionLength: 15
 * };
 * ```
 */
interface PracticePageModuleOptions {
  adapter?: VocabularyAdapter;
  spacedRepetition?: SpacedRepetitionSystem;
  selectedItems?: string[];
  learningDirection?: string;
  enableAudio?: boolean;
  sessionLength?: number;
}

/**
 * Session statistics tracking practice performance
 *
 * @interface SessionStats
 * @property {number} correct - Number of correct answers
 * @property {number} total - Total number of attempted answers
 * @property {number|null} startTime - Session start timestamp (null if not started)
 * @property {Array<{item: any, timestamp: number}>} mistakes - Array of mistake records
 * @property {string} [sessionId] - Unique session identifier
 *
 * @example
 * ```typescript
 * const stats: SessionStats = {
 *   correct: 8,
 *   total: 10,
 *   startTime: 1634567890123,
 *   mistakes: [{ item: vocabularyItem, timestamp: 1634567890123 }],
 *   sessionId: 'session_1634567890123_abc123'
 * };
 * ```
 */
interface SessionStats {
  correct: number;
  total: number;
  startTime: number | null;
  mistakes: Array<{
    item: VocabularyItem;
    timestamp: number;
  }>;
  sessionId?: string;
}

/**
 * Complete session state for persistence and recovery
 *
 * @interface SessionState
 * @property {string} sessionId - Unique session identifier
 * @property {any[]} items - Array of vocabulary items in the session
 * @property {number} currentIndex - Current item index in the session
 * @property {SessionStats} stats - Current session statistics
 * @property {number} timestamp - Session state save timestamp
 *
 * @example
 * ```typescript
 * const sessionState: SessionState = {
 *   sessionId: 'session_1634567890123_abc123',
 *   items: [vocabularyItem1, vocabularyItem2],
 *   currentIndex: 3,
 *   stats: sessionStats,
 *   timestamp: 1634567890123
 * };
 * ```
 */
interface SessionState {
  sessionId: string;
  items: any[];
  currentIndex: number;
  stats: SessionStats;
  timestamp: number;
}

/**
 * Final session results for storage and analysis
 *
 * @interface SessionResults
 * @property {string} sessionId - Unique session identifier
 * @property {number} correct - Number of correct answers
 * @property {number} total - Total number of attempted answers
 * @property {number} accuracy - Accuracy percentage (0-100)
 * @property {number} duration - Session duration in milliseconds
 * @property {Array<{item: any, timestamp: number}>} mistakes - Array of mistake records
 * @property {LearningDirection} learningDirection - Learning direction used in session
 * @property {number} timestamp - Session completion timestamp
 *
 * @example
 * ```typescript
 * const results: SessionResults = {
 *   sessionId: 'session_1634567890123_abc123',
 *   correct: 8,
 *   total: 10,
 *   accuracy: 80,
 *   duration: 300000,
 *   mistakes: [{ item: vocabularyItem, timestamp: 1634567890123 }],
 *   learningDirection: 'bg-de',
 *   timestamp: 1634567890123
 * };
 * ```
 */
interface SessionResults {
  sessionId: string;
  correct: number;
  total: number;
  accuracy: number;
  duration: number;
  mistakes: Array<{
    item: any;
    timestamp: number;
  }>;
  learningDirection: LearningDirection;
  timestamp: number;
}

/**
 * DOM elements interface for practice page UI components
 *
 * This interface provides type safety for all DOM elements used by the practice module.
 * All properties are optional as elements may not be present in all page states.
 *
 * @interface PracticeElements
 *
 * @example
 * ```typescript
 * const elements: PracticeElements = {
 *   loadingState: document.querySelector('#loading-state'),
 *   flashcard: document.querySelector('#flashcard'),
 *   correctBtn: document.querySelector('#correct-btn'),
 *   progress: document.querySelector('#progress')
 * };
 * ```
 */
interface PracticeElements {
  /** Loading state container element */
  loadingState?: HTMLElement | null;
  /** No items available state container */
  noItemsState?: HTMLElement | null;
  /** Main practice session container */
  practiceSession?: HTMLElement | null;
  /** Session completion screen container */
  sessionComplete?: HTMLElement | null;
  /** Settings panel container */
  settingsPanel?: HTMLElement | null;

  // Session stats
  /** Progress display element (e.g., "5/20") */
  progress?: HTMLElement | null;
  /** Accuracy percentage display */
  accuracy?: HTMLElement | null;
  /** Session timer display */
  sessionTime?: HTMLElement | null;

  // Flashcard elements
  /** Main flashcard container */
  flashcard?: HTMLElement | null;
  /** Current word display element */
  currentWord?: HTMLElement | null;
  /** Current translation display element */
  currentTranslation?: HTMLElement | null;
  /** Current notes display element */
  currentNotes?: HTMLElement | null;
  /** Word level badge element */
  wordLevel?: HTMLElement | null;
  /** Word category display element */
  wordCategory?: HTMLElement | null;

  // Controls
  /** Show answer button */
  showAnswer?: HTMLElement | null;
  /** Response buttons container */
  responseButtons?: HTMLElement | null;
  /** Correct response button */
  correctBtn?: HTMLElement | null;
  /** Incorrect response button */
  incorrectBtn?: HTMLElement | null;
  /** Play audio button */
  playAudio?: HTMLElement | null;
  /** Show hint button */
  showHint?: HTMLElement | null;
  /** Hint content container */
  hintContent?: HTMLElement | null;

  // Progress
  /** Progress fill bar element */
  progressFill?: HTMLElement | null;

  // Settings
  /** Settings toggle button */
  settingsToggle?: HTMLElement | null;
  /** Session length input field */
  sessionLength?: HTMLInputElement | null;
  /** Difficulty filter select element */
  difficultyFilter?: HTMLSelectElement | null;
  /** Audio enabled checkbox */
  audioEnabled?: HTMLInputElement | null;

  // Session controls
  /** End session button */
  endSession?: HTMLElement | null;
  /** New session button */
  newSession?: HTMLElement | null;
  /** Review mistakes button */
  reviewMistakes?: HTMLElement | null;

  // Final stats
  /** Final correct count display */
  finalCorrect?: HTMLElement | null;
  /** Final total count display */
  finalTotal?: HTMLElement | null;
  /** Final accuracy display */
  finalAccuracy?: HTMLElement | null;
  /** Final time display */
  finalTime?: HTMLElement | null;
  /** Performance feedback display */
  performanceFeedback?: HTMLElement | null;
}

/**
 * Language direction changed event detail
 *
 * @interface LanguageDirectionChangedEventDetail
 * @property {string} direction - New learning direction ('bg-de' or 'de-bg')
 *
 * @example
 * ```typescript
 * const eventDetail: LanguageDirectionChangedEventDetail = {
 *   direction: 'de-bg'
 * };
 *
 * document.dispatchEvent(new CustomEvent('language-direction-changed', {
 *   detail: eventDetail
 * }));
 * ```
 */
interface LanguageDirectionChangedEventDetail {
  direction: string;
}

/**
 * Practice Page Module class
 *
 * This class manages the complete practice session workflow including:
 * - Session initialization and lifecycle management
 * - Flashcard display and user interaction handling
 * - Integration with spaced repetition algorithms
 * - Audio playback and accessibility features
 * - Session statistics and progress tracking
 * - Settings management and persistence
 *
 * @class PracticePageModule
 *
 * @example
 * ```typescript
 * // Basic usage
 * const practiceModule = new PracticePageModule({
 *   adapter: vocabularyAdapter,
 *   spacedRepetition: spacedRepetitionSystem,
 *   learningDirection: 'bg-de',
 *   enableAudio: true,
 *   sessionLength: 20
 * });
 *
 * await practiceModule.init();
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with custom configuration
 * const practiceModule = new PracticePageModule({
 *   adapter: new VocabularyAdapter(),
 *   spacedRepetition: new SpacedRepetitionSystem(),
 *   selectedItems: ['hello', 'world', 'goodbye'],
 *   learningDirection: 'de-bg',
 *   enableAudio: true,
 *   sessionLength: 15
 * });
 *
 * await practiceModule.init();
 *
 * // Access current session data
 * const stats = practiceModule.currentSessionStats;
 * const direction = practiceModule.currentLearningDirection;
 * ```
 *
 * @since 1.0.0
 */
class PracticePageModule {
  /** Vocabulary adapter for data access */
  private adapter: any;
  /** Spaced repetition system instance */
  private spacedRepetition: any;
  /** Array of selected vocabulary item IDs or words */
  private selectedItems: string[];
  /** Current learning direction */
  private learningDirection: LearningDirection;
  /** Whether audio playback is enabled */
  private enableAudio: boolean;
  /** Number of items in each practice session */
  private sessionLength: number;

  // Session state
  /** Current active session object */
  private currentSession: any;
  /** Array of vocabulary items in the current session */
  private sessionItems: any[];
  /** Current item index in the session */
  private currentIndex: number;
  /** Current session statistics */
  private sessionStats: SessionStats;
  /** Session timer interval ID */
  private sessionTimer: number | null;

  // UI elements
  /** Cached DOM elements for performance */
  private elements: PracticeElements;
  /** Whether the module is initialized */
  private isInitialized: boolean;

  /**
   * Creates a new PracticePageModule instance
   *
   * @constructor
   * @param {PracticePageModuleOptions} [options={}] - Configuration options
   *
   * @example
   * ```typescript
   * // Create with default options
   * const practiceModule = new PracticePageModule();
   *
   * // Create with custom options
   * const practiceModule = new PracticePageModule({
   *   adapter: vocabularyAdapter,
   *   spacedRepetition: spacedRepetitionSystem,
   *   selectedItems: ['word1', 'word2'],
   *   learningDirection: 'bg-de',
   *   enableAudio: true,
   *   sessionLength: 25
   * });
   * ```
   */
  constructor(options: PracticePageModuleOptions = {}) {
    this.adapter = options.adapter;
    this.spacedRepetition = options.spacedRepetition;
    this.selectedItems = options.selectedItems || [];
    this.learningDirection =
      this.normalizeDirection(options.learningDirection) || this.getInitialDirection();
    this.enableAudio = options.enableAudio || false;
    this.sessionLength = options.sessionLength || 20;

    // Session state
    this.currentSession = null;
    this.sessionItems = [];
    this.currentIndex = 0;
    this.sessionStats = {
      correct: 0,
      total: 0,
      startTime: null,
      mistakes: []
    };
    this.sessionTimer = null;

    // UI elements
    this.elements = {};
    this.isInitialized = false;
  }

  /**
   * Normalizes learning direction string to standard format
   *
   * @private
   * @param {string|undefined} value - Direction string to normalize
   * @returns {LearningDirection|null} Normalized direction or null if invalid
   *
   * @example
   * ```typescript
   * this.normalizeDirection('bg-de'); // returns 'bg-de'
   * this.normalizeDirection('bg_to_de'); // returns 'bg-de'
   * this.normalizeDirection('DE-BG'); // returns 'de-bg'
   * this.normalizeDirection('invalid'); // returns null
   * ```
   */
  private normalizeDirection(value: string | undefined): LearningDirection | null {
    if (!value) {
      return null;
    }

    const normalized = value.toString().toLowerCase();

    if (normalized === 'bg-de' || normalized === 'bg_to_de') {
      return 'bg-de';
    }

    if (normalized === 'de-bg' || normalized === 'de_to_bg') {
      return 'de-bg';
    }

    return normalized === 'bg-de' || normalized === 'de-bg' ? normalized : null;
  }

  /**
   * Gets the initial learning direction from various sources
   *
   * Priority order:
   * 1. Global languageToggle instance
   * 2. localStorage 'bgde:language-direction'
   * 3. localStorage 'bgde:learning_direction'
   * 4. Default to 'de-bg'
   *
   * @private
   * @returns {LearningDirection} Initial learning direction
   *
   * @example
   * ```typescript
   * // If languageToggle is available and set to 'bg-de'
   * const direction = this.getInitialDirection(); // returns 'bg-de'
   *
   * // If no stored direction, defaults to 'de-bg'
   * const direction = this.getInitialDirection(); // returns 'de-bg'
   * ```
   */
  private getInitialDirection(): LearningDirection {
    if ((window as any).languageToggle && typeof (window as any).languageToggle.getDirection === 'function') {
      return (window as any).languageToggle.getDirection();
    }

    const stored =
      localStorage.getItem('bgde:language-direction') ||
      localStorage.getItem('bgde:learning_direction');

    return this.normalizeDirection(stored) || 'de-bg';
  }

  /**
   * Initializes the practice page module
   *
   * This method sets up the complete practice session by:
   * 1. Caching all necessary DOM elements for performance
   * 2. Initializing the session with vocabulary items
   * 3. Setting up event listeners for user interactions
   * 4. Starting the practice session
   *
   * @public
   * @async
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   * @throws {Error} When initialization fails (missing dependencies, no items available)
   *
   * @example
   * ```typescript
   * const practiceModule = new PracticePageModule(options);
   *
   * try {
   *   await practiceModule.init();
   *   console.log('Practice session ready');
   * } catch (error) {
   *   console.error('Failed to start practice:', error);
   * }
   * ```
   */
  public async init(): Promise<void> {
    try {
      // Cache DOM elements
      this.cacheElements();

      // Initialize session
      await this.initializeSession();

      // Setup event listeners
      this.setupEventListeners();

      // Start session
      this.startSession();

      this.isInitialized = true;
      console.log('PracticePageModule initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PracticePageModule:', error);
      this.showErrorState();
    }
  }

  private cacheElements(): void {
    // Cache all DOM elements for better performance
    this.elements = {
      loadingState: document.querySelector('#loading-state'),
      noItemsState: document.querySelector('#no-items-state'),
      practiceSession: document.querySelector('#practice-session'),
      sessionComplete: document.querySelector('#session-complete'),
      settingsPanel: document.querySelector('#settings-panel'),

      // Session stats
      progress: document.querySelector('#progress'),
      accuracy: document.querySelector('#accuracy'),
      sessionTime: document.querySelector('#session-time'),

      // Flashcard elements
      flashcard: document.querySelector('#flashcard'),
      currentWord: document.querySelector('#current-word'),
      currentTranslation: document.querySelector('#current-translation'),
      currentNotes: document.querySelector('#current-notes'),
      wordLevel: document.querySelector('#word-level'),
      wordCategory: document.querySelector('#word-category'),

      // Controls
      showAnswer: document.querySelector('#show-answer'),
      responseButtons: document.querySelector('#response-buttons'),
      correctBtn: document.querySelector('#correct-btn'),
      incorrectBtn: document.querySelector('#incorrect-btn'),
      playAudio: document.querySelector('#play-audio'),
      showHint: document.querySelector('#show-hint'),
      hintContent: document.querySelector('#hint-content'),

      // Progress
      progressFill: document.querySelector('#progress-fill'),

      // Settings
      settingsToggle: document.querySelector('#settings-toggle'),
      sessionLength: document.querySelector('#session-length') as HTMLInputElement,
      difficultyFilter: document.querySelector('#difficulty-filter') as HTMLSelectElement,
      audioEnabled: document.querySelector('#audio-enabled') as HTMLInputElement,

      // Session controls
      endSession: document.querySelector('#end-session'),
      newSession: document.querySelector('#new-session'),
      reviewMistakes: document.querySelector('#review-mistakes'),

      // Final stats
      finalCorrect: document.querySelector('#final-correct'),
      finalTotal: document.querySelector('#final-total'),
      finalAccuracy: document.querySelector('#final-accuracy'),
      finalTime: document.querySelector('#final-time'),
      performanceFeedback: document.querySelector('#performance-feedback')
    };
  }

  private async initializeSession(): Promise<void> {
    this.showLoadingState();

    try {
      // Get session items based on spaced repetition
      this.sessionItems = await this.getSessionItems();

      if (this.sessionItems.length === 0) {
        this.showNoItemsState();
        return;
      }

      // Initialize session stats
      this.sessionStats = {
        correct: 0,
        total: 0,
        startTime: Date.now(),
        mistakes: [],
        sessionId: this.generateSessionId()
      };

      // Save session to localStorage for recovery
      this.saveSessionState();
    } catch (error) {
      console.error('Failed to initialize session:', error);
      this.showErrorState();
    }
  }

  private async getSessionItems(): Promise<any[]> {
    if (!this.adapter || !this.spacedRepetition) {
      throw new Error('Missing required dependencies');
    }

    // Get due items from spaced repetition
    const reviewStates = this.spacedRepetition.getAllReviewStates();
    const dueItems = this.spacedRepetition.getDueItems(reviewStates);

    // Get vocabulary items for current direction
    const availableItems = this.adapter.getItemsForDirection(this.learningDirection);

    // If we have selected items, prioritize those
    let sessionItems: any[] = [];

    sessionItems =
      this.selectedItems.length > 0
        ? availableItems.filter(
          (item: any) => this.selectedItems.includes(item.word) || this.selectedItems.includes(item.id)
        )
        : this.selectOptimalItems(availableItems, dueItems);

    // Shuffle items for better learning
    return this.shuffleArray(sessionItems.slice(0, this.sessionLength));
  }

  private selectOptimalItems(availableItems: any[], dueItems: any[]): any[] {
    const dueItemIds = new Set(dueItems.map((item: any) => item.itemId));

    // Prioritize due items
    const dueVocabItems = availableItems.filter((item: any) => dueItemIds.has(item.id));

    // Fill remaining slots with new items
    const newItems = availableItems
      .filter((item: any) => !dueItemIds.has(item.id))
      .sort((a: any, b: any) => {
        // Sort by difficulty and frequency
        if (a.difficulty !== b.difficulty) {
          return a.difficulty - b.difficulty; // Easier first
        }
        return (b.frequency || 0) - (a.frequency || 0); // Higher frequency first
      });

    const combined = [...dueVocabItems, ...newItems];
    return combined.slice(0, this.sessionLength);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private setupEventListeners(): void {
    // Flashcard controls
    if (this.elements.showAnswer) {
      this.elements.showAnswer.addEventListener('click', () => this.showAnswer());
    }

    if (this.elements.correctBtn) {
      this.elements.correctBtn.addEventListener('click', () => this.handleResponse(true));
    }

    if (this.elements.incorrectBtn) {
      this.elements.incorrectBtn.addEventListener('click', () => this.handleResponse(false));
    }

    // Audio playback
    if (this.elements.playAudio && this.enableAudio) {
      this.elements.playAudio.addEventListener('click', () => this.playAudio());
    }

    // Hint system
    if (this.elements.showHint) {
      this.elements.showHint.addEventListener('click', () => this.toggleHint());
    }

    document.addEventListener('language-direction-changed', (event: CustomEvent<LanguageDirectionChangedEventDetail>) => {
      const nextDirection = this.normalizeDirection(event?.detail?.direction);
      if (!nextDirection || nextDirection === this.learningDirection) {
        return;
      }

      this.learningDirection = nextDirection;
      this.displayCurrentItem();
    });

    // Settings
    if (this.elements.settingsToggle) {
      this.elements.settingsToggle.addEventListener('click', () => this.toggleSettings());
    }

    // Session controls
    if (this.elements.endSession) {
      this.elements.endSession.addEventListener('click', () => this.endSession());
    }

    if (this.elements.newSession) {
      this.elements.newSession.addEventListener('click', () => this.startNewSession());
    }

    if (this.elements.reviewMistakes) {
      this.elements.reviewMistakes.addEventListener('click', () => this.reviewMistakes());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Settings changes
    if (this.elements.sessionLength) {
      this.elements.sessionLength.addEventListener('change', (e: Event) => {
        this.sessionLength = Number.parseInt((e.target as HTMLInputElement).value);
      });
    }

    if (this.elements.audioEnabled) {
      this.elements.audioEnabled.addEventListener('change', (e: Event) => {
        this.enableAudio = (e.target as HTMLInputElement).checked;
      });
    }
  }

  private startSession(): void {
    if (this.sessionItems.length === 0) {
      this.showNoItemsState();
      return;
    }

    this.showLoadingState();
    this.showPracticeSession();
    this.currentIndex = 0;
    this.displayCurrentItem();
    this.startSessionTimer();
  }

  private displayCurrentItem(): void {
    if (this.currentIndex >= this.sessionItems.length) {
      this.completeSession();
      return;
    }

    const item = this.sessionItems[this.currentIndex];

    const isReverse = this.learningDirection === 'de-bg';
    const frontText = isReverse ? item.translation : item.word;
    const backText = isReverse ? item.word : item.translation;

    // Update flashcard content
    if (this.elements.currentWord) {
      this.elements.currentWord.textContent = frontText;
    }

    if (this.elements.currentTranslation) {
      this.elements.currentTranslation.textContent = backText;
    }

    if (this.elements.currentNotes) {
      this.elements.currentNotes.textContent = item.notes || '';
    }

    if (this.elements.wordLevel) {
      this.elements.wordLevel.textContent = item.level;
      this.elements.wordLevel.className = `level-badge level-${item.level.toLowerCase()}`;
    }

    if (this.elements.wordCategory) {
      this.elements.wordCategory.textContent = item.category;
    }

    // Reset flashcard state
    this.resetFlashcardState();

    // Update progress
    this.updateProgress();

    // Preload audio if available
    if (this.enableAudio && item.audio) {
      this.preloadAudio(item.audio);
    }
  }

  private resetFlashcardState(): void {
    // Reset flashcard to front side
    if (this.elements.flashcard) {
      this.elements.flashcard.classList.remove('flipped');
    }

    // Update ARIA attributes for accessibility
    const front = document.querySelector('#flashcard-front');
    const back = document.querySelector('#flashcard-back');
    if (front) {
      front.setAttribute('aria-hidden', 'false');
    }
    if (back) {
      back.setAttribute('aria-hidden', 'true');
    }

    // Show answer button, hide response buttons
    if (this.elements.showAnswer) {
      this.elements.showAnswer.classList.remove('hidden');
    }

    if (this.elements.responseButtons) {
      this.elements.responseButtons.classList.add('hidden');
    }

    // Hide hint
    if (this.elements.hintContent) {
      this.elements.hintContent.classList.add('hidden');
    }
  }

  private showAnswer(): void {
    // Flip flashcard
    if (this.elements.flashcard) {
      this.elements.flashcard.classList.add('flipped');
    }

    // Update ARIA attributes for accessibility
    const front = document.querySelector('#flashcard-front');
    const back = document.querySelector('#flashcard-back');
    if (front) {
      front.setAttribute('aria-hidden', 'true');
    }
    if (back) {
      back.setAttribute('aria-hidden', 'false');
    }

    // Hide answer button, show response buttons
    if (this.elements.showAnswer) {
      this.elements.showAnswer.classList.add('hidden');
    }

    if (this.elements.responseButtons) {
      this.elements.responseButtons.classList.remove('hidden');
    }

    // Auto-play audio if enabled
    if (this.enableAudio) {
      setTimeout(() => this.playAudio(), 300);
    }
  }

  /**
   * Handles user response to current vocabulary item
   *
   * This method processes the user's answer by:
   * 1. Updating session statistics (correct/incorrect counts)
   * 2. Recording mistakes for later review
   * 3. Updating spaced repetition algorithm with performance data
   * 4. Updating UI to reflect new statistics
   * 5. Advancing to next item after a brief delay
   *
   * @private
   * @param {boolean} correct - Whether the user answered correctly
   * @returns {void}
   *
   * @example
   * ```typescript
   * // User answered correctly
   * this.handleResponse(true);
   *
   * // User answered incorrectly
   * this.handleResponse(false);
   *
   * // Session stats are updated and next item appears after 1 second
   * ```
   */
  private handleResponse(correct: boolean): void {
    const currentItem = this.sessionItems[this.currentIndex];

    // Update session stats
    this.sessionStats.total++;
    if (correct) {
      this.sessionStats.correct++;
    } else {
      this.sessionStats.mistakes.push({
        item: currentItem,
        timestamp: Date.now()
      });
    }

    // Update spaced repetition
    if (this.spacedRepetition) {
      this.spacedRepetition.updateReviewState(currentItem.id, correct, {
        learningDirection: this.learningDirection,
        difficulty: currentItem.difficulty || 3
      });
    }

    // Update UI
    this.updateSessionStats();

    // Move to next item
    setTimeout(() => {
      this.currentIndex++;
      this.displayCurrentItem();
    }, 1000);
  }

  private updateProgress(): void {
    const progress = `${this.currentIndex + 1}/${this.sessionItems.length}`;
    if (this.elements.progress) {
      this.elements.progress.textContent = progress;
    }

    // Update progress bar
    const percentage = ((this.currentIndex + 1) / this.sessionItems.length) * 100;
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${percentage}%`;
    }
  }

  private updateSessionStats(): void {
    // Update accuracy
    const accuracy =
      this.sessionStats.total > 0
        ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100)
        : 0;

    if (this.elements.accuracy) {
      this.elements.accuracy.textContent = `${accuracy}%`;
    }
  }

  private startSessionTimer(): void {
    this.sessionTimer = window.setInterval(() => {
      const elapsed = Date.now() - (this.sessionStats.startTime || 0);
      const minutes = Math.floor(elapsed / 60_000);
      const seconds = Math.floor((elapsed % 60_000) / 1000);
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (this.elements.sessionTime) {
        this.elements.sessionTime.textContent = timeString;
      }
    }, 1000);
  }

  private completeSession(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }

    // Calculate final stats
    const totalTime = Date.now() - (this.sessionStats.startTime || 0);
    const accuracy =
      this.sessionStats.total > 0
        ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100)
        : 0;

    // Update final stats display
    this.displayFinalStats(totalTime, accuracy);

    // Save session results
    this.saveSessionResults();

    // Show completion screen
    this.showSessionComplete();
  }

  private displayFinalStats(totalTime: number, accuracy: number): void {
    if (this.elements.finalCorrect) {
      this.elements.finalCorrect.textContent = this.sessionStats.correct.toString();
    }

    if (this.elements.finalTotal) {
      this.elements.finalTotal.textContent = this.sessionStats.total.toString();
    }

    if (this.elements.finalAccuracy) {
      this.elements.finalAccuracy.textContent = `${accuracy}%`;
    }

    if (this.elements.finalTime) {
      const minutes = Math.floor(totalTime / 60_000);
      const seconds = Math.floor((totalTime % 60_000) / 1000);
      this.elements.finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Generate performance feedback
    this.generatePerformanceFeedback(accuracy);
  }

  private generatePerformanceFeedback(accuracy: number): void {
    let feedback = '';

    if (accuracy >= 90) {
      feedback = '🌟 Ausgezeichnet! Hervorragende Leistung! / Отлично! Превъзходно представяне!';
    } else if (accuracy >= 75) {
      feedback = '👍 Gut gemacht! Weiter so! / Добра работа! Продължавайте така!';
    } else if (accuracy >= 60) {
      feedback =
        '📚 Nicht schlecht! Mehr Übung wird helfen. / Неплохо! Повече практика ще помогне.';
    } else {
      feedback =
        '💪 Übung macht den Meister! Versuchen Sie es noch einmal. / Практиката прави съвършенство! Опитайте отново.';
    }

    if (this.elements.performanceFeedback) {
      this.elements.performanceFeedback.innerHTML = `<p>${feedback}</p>`;
    }
  }

  private playAudio(): void {
    const currentItem = this.sessionItems[this.currentIndex];
    if (!currentItem || !currentItem.word) {
      return;
    }

    // Use enhanced TextToSpeech if available
    if ((window as any).audioManager && (window as any).audioManager.useEnhancedTTS && (window as any).audioManager.tts) {
      const lang = this.learningDirection === 'de-bg' ? 'bg-BG' : 'de-DE';
      (window as any).audioManager.tts.speak(currentItem.word, lang);
      return;
    }

    // Fallback to basic Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentItem.word);
      utterance.lang = this.learningDirection === 'de-bg' ? 'bg-BG' : 'de-DE';
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  }

  private toggleHint(): void {
    if (this.elements.hintContent) {
      const isHidden = this.elements.hintContent.classList.contains('hidden');

      if (isHidden) {
        const currentItem = this.sessionItems[this.currentIndex];
        const hints = this.generateHints(currentItem);
        this.elements.hintContent.innerHTML = hints;
        this.elements.hintContent.classList.remove('hidden');
      } else {
        this.elements.hintContent.classList.add('hidden');
      }
    }
  }

  private generateHints(item: any): string {
    const hints: string[] = [];

    if (item.etymology) {
      hints.push(`<strong>Etymology:</strong> ${item.etymology}`);
    }

    if (item.cultural_note) {
      hints.push(`<strong>Cultural Note:</strong> ${item.cultural_note}`);
    }

    if (item.linguistic_note) {
      hints.push(`<strong>Linguistic Note:</strong> ${item.linguistic_note}`);
    }

    if (item.examples && item.examples.length > 0) {
      const example = item.examples[0];
      hints.push(`<strong>Example:</strong> ${example.sentence} - ${example.translation}`);
    }

    return hints.length > 0 ? hints.join('<br><br>') : 'No additional hints available.';
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (!this.isInitialized) {
      return;
    }

    switch (event.key) {
    case ' ':
    case 'Enter': {
      event.preventDefault();
      if (this.elements.showAnswer && !this.elements.showAnswer.classList.contains('hidden')) {
        this.showAnswer();
      }
      break;
    }
    case '1': {
      if (this.elements.responseButtons && !this.elements.responseButtons.classList.contains('hidden')) {
        this.handleResponse(false);
      }
      break;
    }
    case '2': {
      if (this.elements.responseButtons && !this.elements.responseButtons.classList.contains('hidden')) {
        this.handleResponse(true);
      }
      break;
    }
    case 'h': {
      this.toggleHint();
      break;
    }
    case 'Escape': {
      this.toggleSettings();
      break;
    }
    }
  }

  // UI State Management
  private showLoadingState(): void {
    this.hideAllStates();
    if (this.elements.loadingState) {
      this.elements.loadingState.classList.remove('hidden');
    }
  }

  private showNoItemsState(): void {
    this.hideAllStates();
    if (this.elements.noItemsState) {
      this.elements.noItemsState.classList.remove('hidden');
    }
  }

  private showPracticeSession(): void {
    this.hideAllStates();
    if (this.elements.practiceSession) {
      this.elements.practiceSession.classList.remove('hidden');
    }
  }

  private showSessionComplete(): void {
    this.hideAllStates();
    if (this.elements.sessionComplete) {
      this.elements.sessionComplete.classList.remove('hidden');
    }
  }

  private hideAllStates(): void {
    const states = [
      this.elements.loadingState,
      this.elements.noItemsState,
      this.elements.practiceSession,
      this.elements.sessionComplete
    ];

    for (const element of states) {
      if (element) {
        element.classList.add('hidden');
      }
    }
  }

  private toggleSettings(): void {
    if (this.elements.settingsPanel) {
      this.elements.settingsPanel.classList.toggle('hidden');
    }
  }

  // Session Management
  private saveSessionState(): void {
    const sessionState: SessionState = {
      sessionId: this.sessionStats.sessionId!,
      items: this.sessionItems,
      currentIndex: this.currentIndex,
      stats: this.sessionStats,
      timestamp: Date.now()
    };

    localStorage.setItem('bgde:current_session', JSON.stringify(sessionState));
  }

  private saveSessionResults(): void {
    const results: SessionResults = {
      sessionId: this.sessionStats.sessionId!,
      correct: this.sessionStats.correct,
      total: this.sessionStats.total,
      accuracy: Math.round((this.sessionStats.correct / this.sessionStats.total) * 100),
      duration: Date.now() - (this.sessionStats.startTime || 0),
      mistakes: this.sessionStats.mistakes,
      learningDirection: this.learningDirection,
      timestamp: Date.now()
    };

    // Save to session history
    const history = JSON.parse(localStorage.getItem('bgde:session_history') || '[]');
    history.unshift(results);
    history.splice(50); // Keep only last 50 sessions
    localStorage.setItem('bgde:session_history', JSON.stringify(history));
  }

  private generateSessionId(): string {
    // Use crypto.getRandomValues for secure random ID
    const array = new Uint8Array(9);
    window.crypto.getRandomValues(array);
    const randomString = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    return `session_${Date.now()}_${randomString}`;
  }

  private preloadAudio(audioUrl: string): void {
    // Preload audio for better performance
    const audio = new Audio();
    audio.src = audioUrl;
    audio.preload = 'auto';
  }

  private endSession(): void {
    if (confirm('Are you sure you want to end this session?')) {
      this.completeSession();
    }
  }

  private startNewSession(): void {
    // Clear current session
    localStorage.removeItem('bgde:current_session');
    localStorage.removeItem('bgde:practice_selection');

    // Reload page to start fresh
    window.location.reload();
  }

  private reviewMistakes(): void {
    if (this.sessionStats.mistakes.length === 0) {
      alert('No mistakes to review in this session!');
      return;
    }

    // Create new session with only mistakes
    const mistakeWords = this.sessionStats.mistakes.map((mistake) => mistake.item.word);
    localStorage.setItem('bgde:practice_selection', JSON.stringify(mistakeWords));
    window.location.reload();
  }

  private showErrorState(): void {
    this.hideAllStates();

    const errorHtml = `
            <div class="error-state">
                <h3>⚠️ Session Error</h3>
                <p>Failed to initialize practice session. Please try again.</p>
                <button onclick="location.reload()" class="btn-primary">Retry</button>
                <a href="/vocabulary/" class="btn-secondary">Back to Vocabulary</a>
            </div>
        `;

    if (this.elements.practiceSession) {
      this.elements.practiceSession.innerHTML = errorHtml;
      this.elements.practiceSession.classList.remove('hidden');
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyboard);

    // Clear session state
    localStorage.removeItem('bgde:current_session');
  }

  // Getters
  public get currentLearningDirection(): LearningDirection {
    return this.learningDirection;
  }

  public get isSessionInitialized(): boolean {
    return this.isInitialized;
  }

  public get currentSessionStats(): SessionStats {
    return { ...this.sessionStats };
  }
}

export default PracticePageModule;