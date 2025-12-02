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
 * @property {any} [adapter] - Vocabulary adapter instance for data access
 * @property {any} [spacedRepetition] - Spaced repetition system instance
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
    adapter?: any;
    spacedRepetition?: any;
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
        item: any;
        timestamp: number;
    }>;
    sessionId?: string;
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
declare class PracticePageModule {
    /** Vocabulary adapter for data access */
    private adapter;
    /** Spaced repetition system instance */
    private spacedRepetition;
    /** Array of selected vocabulary item IDs or words */
    private selectedItems;
    /** Current learning direction */
    private learningDirection;
    /** Whether audio playback is enabled */
    private enableAudio;
    /** Number of items in each practice session */
    private sessionLength;
    /** Current active session object */
    private currentSession;
    /** Array of vocabulary items in the current session */
    private sessionItems;
    /** Current item index in the session */
    private currentIndex;
    /** Current session statistics */
    private sessionStats;
    /** Session timer interval ID */
    private sessionTimer;
    /** Cached DOM elements for performance */
    private elements;
    /** Whether the module is initialized */
    private isInitialized;
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
    constructor(options?: PracticePageModuleOptions);
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
    private normalizeDirection;
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
    private getInitialDirection;
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
    init(): Promise<void>;
    private cacheElements;
    private initializeSession;
    private getSessionItems;
    private selectOptimalItems;
    private shuffleArray;
    private setupEventListeners;
    private startSession;
    private displayCurrentItem;
    private resetFlashcardState;
    private showAnswer;
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
    private handleResponse;
    private updateProgress;
    private updateSessionStats;
    private startSessionTimer;
    private completeSession;
    private displayFinalStats;
    private generatePerformanceFeedback;
    private playAudio;
    private toggleHint;
    private generateHints;
    private handleKeyboard;
    private showLoadingState;
    private showNoItemsState;
    private showPracticeSession;
    private showSessionComplete;
    private hideAllStates;
    private toggleSettings;
    private saveSessionState;
    private saveSessionResults;
    private generateSessionId;
    private preloadAudio;
    private endSession;
    private startNewSession;
    private reviewMistakes;
    private showErrorState;
    destroy(): void;
    get currentLearningDirection(): LearningDirection;
    get isSessionInitialized(): boolean;
    get currentSessionStats(): SessionStats;
}
export default PracticePageModule;
//# sourceMappingURL=practice-page.d.ts.map