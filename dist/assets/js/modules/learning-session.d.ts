/**
 * Learning Session Service
 *
 * Manages practice sessions, item selection, and session analytics for the
 * Bulgarian-German learning application. This service handles the complete
 * lifecycle of learning sessions including item selection, response tracking,
 * statistics calculation, and integration with spaced repetition algorithms.
 *
 * @example
 * ```typescript
 * const session = new LearningSession({
 *   maxItems: 20,
 *   sessionType: 'vocabulary',
 *   difficulty: 'adaptive',
 *   levels: ['A1', 'A2'],
 *   direction: 'bg-de'
 * });
 *
 * session.on('responseSubmitted', (data) => {
 *   console.log('Response submitted:', data.response);
 * });
 *
 * await session.start();
 * ```
 *
 * @since 1.0.0
 */
/**
 * Configuration options for learning sessions
 *
 * @interface LearningSessionConfig
 * @property {number} [maxItems=20] - Maximum number of items in the session
 * @property {'vocabulary'|'grammar'|'mixed'} [sessionType='mixed'] - Type of content to include
 * @property {'adaptive'|'easy'|'medium'|'hard'} [difficulty='adaptive'] - Difficulty level
 * @property {string[]} [categories=[]] - Specific categories to include
 * @property {string[]} [levels=['A1','A2']] - Proficiency levels to include
 * @property {'bg-de'|'de-bg'} [direction='bg-de'] - Translation direction
 * @property {'due'|'new'|'review'|'mixed'} [reviewType='due'] - Type of items to review
 */
interface LearningSessionConfig {
    maxItems?: number;
    sessionType?: 'vocabulary' | 'grammar' | 'mixed';
    difficulty?: 'adaptive' | 'easy' | 'medium' | 'hard';
    categories?: string[];
    levels?: string[];
    direction?: 'bg-de' | 'de-bg';
    reviewType?: 'due' | 'new' | 'review' | 'mixed';
}
/**
 * Possible session status values
 *
 * @type {SessionStatus}
 * @property {string} initialized - Session created but not started
 * @property {string} active - Session currently in progress
 * @property {string} paused - Session temporarily paused
 * @property {string} completed - Session finished successfully
 * @property {string} abandoned - Session ended prematurely
 */
type SessionStatus = 'initialized' | 'active' | 'paused' | 'completed' | 'abandoned';
/**
 * Individual item within a learning session
 *
 * @interface SessionItem
 * @property {string} id - Unique identifier for the item
 * @property {'vocabulary'|'grammar'} type - Type of learning content
 * @property {string} category - Content category (e.g., 'nouns', 'verbs')
 * @property {string} level - Proficiency level (A1, A2, B1, etc.)
 * @property {number} difficulty - Numeric difficulty rating (1-10)
 * @property {string} question - The question or prompt
 * @property {string} answer - The correct answer
 * @property {string[]} [hints] - Optional hints for the user
 * @property {Record<string, any>} [metadata] - Additional item metadata
 */
interface SessionItem {
    id: string;
    type: 'vocabulary' | 'grammar';
    category: string;
    level: string;
    difficulty: number;
    question: string;
    answer: string;
    hints?: string[];
    metadata?: Record<string, any>;
}
/**
 * User response data for a session item
 *
 * @interface ResponseData
 * @property {string} itemId - ID of the item being responded to
 * @property {string|null} response - User's answer or null if skipped
 * @property {boolean} isCorrect - Whether the response was correct
 * @property {number} responseTime - Time taken to respond in milliseconds
 * @property {number} hintsUsed - Number of hints used during response
 * @property {number} timestamp - When the response was submitted
 * @property {'easy'|'medium'|'hard'} difficulty - Perceived difficulty
 * @property {string} [reason] - Reason for skipping (if applicable)
 */
interface ResponseData {
    itemId: string;
    response: string | null;
    isCorrect: boolean;
    responseTime: number;
    hintsUsed: number;
    timestamp: number;
    difficulty: 'easy' | 'medium' | 'hard';
    reason?: string;
}
/**
 * Comprehensive session statistics
 *
 * @interface SessionStats
 * @property {number} totalItems - Total items in session
 * @property {number} completedItems - Items that received responses
 * @property {number} correctAnswers - Number of correct responses
 * @property {number} incorrectAnswers - Number of incorrect responses
 * @property {number} skippedItems - Number of skipped items
 * @property {number} hintsUsed - Total hints used across session
 * @property {number} averageResponseTime - Mean response time in ms
 * @property {number} totalTime - Total session time in ms
 * @property {number} accuracy - Accuracy percentage (0-100)
 * @property {number} streak - Current correct answer streak
 * @property {number} maxStreak - Maximum streak achieved
 * @property {number} [itemsPerMinute] - Items completed per minute
 * @property {number} [efficiencyScore] - Combined performance score (0-100)
 * @property {'easy'|'medium'|'hard'|'very_hard'} [difficultyRating] - Estimated difficulty
 */
interface SessionStats {
    totalItems: number;
    completedItems: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedItems: number;
    hintsUsed: number;
    averageResponseTime: number;
    totalTime: number;
    accuracy: number;
    streak: number;
    maxStreak: number;
    itemsPerMinute?: number;
    efficiencyScore?: number;
    difficultyRating?: 'easy' | 'medium' | 'hard' | 'very_hard';
}
/**
 * Current session item with progress information
 *
 * @interface CurrentItem
 * @extends SessionItem
 * @property {number} index - Current position in session
 * @property {number} total - Total number of items
 * @property {number} progress - Progress percentage (0-100)
 */
interface CurrentItem extends SessionItem {
    index: number;
    total: number;
    progress: number;
}
/**
 * Session progress information
 *
 * @interface SessionProgress
 * @property {number} current - Current item index
 * @property {number} total - Total number of items
 * @property {number} percentage - Completion percentage
 * @property {boolean} completed - Whether session is completed
 */
interface SessionProgress {
    current: number;
    total: number;
    percentage: number;
    completed: boolean;
}
/**
 * Complete session summary for reporting
 *
 * @interface SessionSummary
 * @property {string} sessionId - Unique session identifier
 * @property {LearningSessionConfig} config - Session configuration
 * @property {SessionStats} stats - Final session statistics
 * @property {number} duration - Total session duration in ms
 * @property {SessionProgress} progress - Final progress state
 * @property {SessionStatus} status - Final session status
 * @property {ResponseData[]} responses - All collected responses
 */
interface SessionSummary {
    sessionId: string;
    config: LearningSessionConfig;
    stats: SessionStats;
    duration: number;
    progress: SessionProgress;
    status: SessionStatus;
    responses: ResponseData[];
}
/**
 * Event data for session initialization
 *
 * @interface InitializedEventData
 * @property {string} sessionId - The session ID
 * @property {LearningSessionConfig} config - Session configuration
 */
interface InitializedEventData {
    sessionId: string;
    config: LearningSessionConfig;
}
/**
 * Event data for item generation completion
 *
 * @interface ItemsGeneratedEventData
 * @property {number} count - Number of items generated
 * @property {Record<string, number>} types - Distribution by item type
 */
interface ItemsGeneratedEventData {
    count: number;
    types: Record<string, number>;
}
/**
 * Event data for response submission
 *
 * @interface ResponseSubmittedEventData
 * @property {ResponseData} response - The submitted response
 * @property {CurrentItem|null} currentItem - Item that was responded to
 * @property {CurrentItem|null} nextItem - Next item to be presented
 */
interface ResponseSubmittedEventData {
    response: ResponseData;
    currentItem: CurrentItem | null;
    nextItem: CurrentItem | null;
}
/**
 * Event data for item skipping
 *
 * @interface ItemSkippedEventData
 * @property {{itemId: string, reason: string, timestamp: number}} skipData - Skip information
 * @property {CurrentItem|null} currentItem - The item that was skipped
 */
interface ItemSkippedEventData {
    skipData: {
        itemId: string;
        reason: string;
        timestamp: number;
    };
    currentItem: CurrentItem | null;
}
/**
 * Event data for session completion
 *
 * @interface SessionCompletedEventData
 * @property {string} sessionId - The completed session ID
 * @property {SessionStats} stats - Final session statistics
 * @property {number} duration - Total session duration
 */
interface SessionCompletedEventData {
    sessionId: string;
    stats: SessionStats;
    duration: number;
}
/**
 * Event data for session abandonment
 *
 * @interface SessionAbandonedEventData
 * @property {string} sessionId - The abandoned session ID
 * @property {SessionStats} stats - Session statistics at abandonment
 */
interface SessionAbandonedEventData {
    sessionId: string;
    stats: SessionStats;
}
/**
 * Event data for spaced repetition updates
 *
 * @interface UpdateSpacedRepetitionEventData
 * @property {string} itemId - Item ID to update
 * @property {number} grade - SM-2 grade (0-5)
 * @property {'bg-de'|'de-bg'} direction - Translation direction
 * @property {number} timestamp - Update timestamp
 */
interface UpdateSpacedRepetitionEventData {
    itemId: string;
    grade: number;
    direction: 'bg-de' | 'de-bg';
    timestamp: number;
}
/**
 * Union type for all possible event data types
 *
 * @type {EventData}
 */
type EventData = InitializedEventData | ItemsGeneratedEventData | ResponseSubmittedEventData | ItemSkippedEventData | SessionCompletedEventData | SessionAbandonedEventData | UpdateSpacedRepetitionEventData;
/**
 * Event callback function type
 *
 * @template T - Type of event data
 * @param {T} data - Event data payload
 * @returns {void}
 */
type EventCallback<T = any> = (data: T) => void;
/**
 * Learning Session Service Class
 *
 * Manages the complete lifecycle of learning sessions including item selection,
 * response tracking, statistics calculation, and integration with spaced repetition
 * algorithms. Provides event-driven architecture for real-time updates and
 * persistent storage for session recovery.
 *
 * @class LearningSession
 *
 * @example
 * ```typescript
 * // Create a new session
 * const session = new LearningSession({
 *   maxItems: 20,
 *   sessionType: 'vocabulary',
 *   difficulty: 'adaptive',
 *   levels: ['A1', 'A2'],
 *   direction: 'bg-de'
 * });
 *
 * // Listen for events
 * session.on('responseSubmitted', (data) => {
 *   console.log('Response submitted:', data.response.isCorrect);
 * });
 *
 * // Start the session
 * const currentItem = await session.start();
 * console.log('Current item:', currentItem?.question);
 *
 * // Submit a response
 * const nextItem = session.submitResponse({
 *   answer: 'user answer',
 *   isCorrect: true,
 *   responseTime: 5000
 * });
 * ```
 *
 * @since 1.0.0
 */
declare class LearningSession {
    private sessionId;
    private storageKey;
    private config;
    private state;
    private stats;
    private listeners;
    private autoSaveInterval;
    /**
     * Creates a new LearningSession instance
     *
     * @param {LearningSessionConfig} [options={}] - Configuration options for the session
     * @throws {Error} When session initialization fails
     *
     * @example
     * ```typescript
     * const session = new LearningSession({
     *   maxItems: 20,
     *   sessionType: 'vocabulary',
     *   difficulty: 'adaptive',
     *   levels: ['A1', 'A2'],
     *   direction: 'bg-de'
     * });
     * ```
     */
    constructor(options?: LearningSessionConfig);
    /**
     * Initializes the session by loading existing data, generating items, and setting up auto-save
     *
     * @private
     * @async
     * @returns {Promise<void>}
     * @throws {Error} When initialization fails
     * @emits InitializedEventData - When initialization completes
     * @emits {type: 'initialization', error: Error} - When initialization fails
     */
    private initialize;
    /**
     * Starts the learning session
     *
     * @public
     * @async
     * @returns {Promise<CurrentItem|null>} The first item in the session or null if no items
     * @throws {Error} When session cannot be started from current state
     * @emits {sessionId: string} - When session starts successfully
     *
     * @example
     * ```typescript
     * const currentItem = await session.start();
     * if (currentItem) {
     *   console.log('Started session with:', currentItem.question);
     * }
     * ```
     */
    start(): Promise<CurrentItem | null>;
    /**
     * Pauses the active session
     *
     * @public
     * @throws {Error} When session is not currently active
     * @emits {sessionId: string} - When session is paused
     *
     * @example
     * ```typescript
     * session.pause();
     * console.log('Session paused');
     * ```
     */
    pause(): void;
    /**
     * Resumes a paused session
     *
     * @public
     * @async
     * @returns {Promise<CurrentItem|null>} The current item or null if session is complete
     * @throws {Error} When session is not currently paused
     * @emits {sessionId: string} - When session is resumed
     *
     * @example
     * ```typescript
     * const currentItem = await session.resume();
     * console.log('Session resumed with item:', currentItem?.question);
     * ```
     */
    resume(): Promise<CurrentItem | null>;
    /**
     * Completes the session and calculates final statistics
     *
     * @public
     * @returns {SessionSummary} Complete session summary with final statistics
     * @emits SessionCompletedEventData - When session completes successfully
     *
     * @example
     * ```typescript
     * const summary = session.complete();
     * console.log('Session completed with accuracy:', summary.stats.accuracy);
     * ```
     */
    complete(): SessionSummary;
    /**
     * Abandons the session without completion
     *
     * @public
     * @emits SessionAbandonedEventData - When session is abandoned
     *
     * @example
     * ```typescript
     * session.abandon();
     * console.log('Session abandoned');
     * ```
     */
    abandon(): void;
    private generateSessionItems;
    private selectItems;
    private getDueItems;
    private getNewItems;
    private getReviewItems;
    /**
     * Gets the current item in the session with progress information
     *
     * @public
     * @returns {CurrentItem|null} The current item with progress data or null if session is complete
     *
     * @example
     * ```typescript
     * const currentItem = session.getCurrentItem();
     * if (currentItem) {
     *   console.log(`Question ${currentItem.index + 1}/${currentItem.total}: ${currentItem.question}`);
     * }
     * ```
     */
    getCurrentItem(): CurrentItem | null;
    /**
     * Submits a response for the current item and advances to the next item
     *
     * @public
     * @param {Object} response - The response data
     * @param {string} response.answer - User's answer
     * @param {boolean} response.isCorrect - Whether the answer is correct
     * @param {number} [response.responseTime] - Time taken to respond in milliseconds
     * @param {number} [response.hintsUsed] - Number of hints used
     * @param {'easy'|'medium'|'hard'} [response.difficulty] - Perceived difficulty
     * @returns {CurrentItem|null} The next item or null if session is complete
     * @throws {Error} When there is no current item to respond to
     * @emits ResponseSubmittedEventData - When response is submitted
     * @emits UpdateSpacedRepetitionEventData - For spaced repetition updates
     *
     * @example
     * ```typescript
     * const nextItem = session.submitResponse({
     *   answer: 'Haus',
     *   isCorrect: true,
     *   responseTime: 3000,
     *   hintsUsed: 0,
     *   difficulty: 'easy'
     * });
     * ```
     */
    submitResponse(response: {
        answer: string;
        isCorrect: boolean;
        responseTime?: number;
        hintsUsed?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
    }): CurrentItem | null;
    /**
     * Skips the current item and moves to the next one
     *
     * @public
     * @param {string} [reason='user_skip'] - Reason for skipping the item
     * @returns {CurrentItem|null} The next item or null if session is complete
     * @throws {Error} When there is no current item to skip
     * @emits ItemSkippedEventData - When item is skipped
     *
     * @example
     * ```typescript
     * const nextItem = session.skipItem('too_difficult');
     * console.log('Skipped item, moved to next');
     * ```
     */
    skipItem(reason?: string): CurrentItem | null;
    private updateStats;
    private calculateFinalStats;
    private calculateEfficiencyScore;
    private calculateDifficultyRating;
    private updateSpacedRepetition;
    private responseToGrade;
    private saveSession;
    private loadSession;
    private loadAllSessions;
    private generateSessionId;
    private shuffleArray;
    getTotalTime(): number;
    getProgress(): SessionProgress;
    getSessionSummary(): SessionSummary;
    getItemTypeDistribution(): Record<string, number>;
    private setupAutoSave;
    private clearAutoSave;
    /**
     * Registers an event listener for the specified event
     *
     * @public
     * @template T - Type of event data
     * @param {string} event - Event name to listen for
     * @param {EventCallback<T>} callback - Callback function to execute when event occurs
     * @returns {() => void} Function to unregister the event listener
     *
     * @example
     * ```typescript
     * const unsubscribe = session.on('responseSubmitted', (data) => {
     *   console.log('Response submitted:', data.response.isCorrect);
     * });
     *
     * // Later, to stop listening:
     * unsubscribe();
     * ```
     */
    on<T = EventData>(event: string, callback: EventCallback<T>): () => void;
    /**
     * Removes an event listener for the specified event
     *
     * @public
     * @template T - Type of event data
     * @param {string} event - Event name to stop listening for
     * @param {EventCallback<T>} callback - Callback function to remove
     *
     * @example
     * ```typescript
     * const callback = (data) => console.log('Event:', data);
     * session.on('responseSubmitted', callback);
     * session.off('responseSubmitted', callback);
     * ```
     */
    off<T = EventData>(event: string, callback: EventCallback<T>): void;
    /**
     * Emits an event to all registered listeners
     *
     * @private
     * @template T - Type of event data
     * @param {string} event - Event name to emit
     * @param {T} data - Event data to pass to listeners
     */
    private emit;
    /**
     * Cleans up the session and releases all resources
     *
     * @public
     * @description This method should be called when the session is no longer needed.
     * It will stop auto-save, clear all event listeners, and abandon the session
     * if it's still active.
     *
     * @example
     * ```typescript
     * session.destroy();
     * console.log('Session cleaned up');
     * ```
     */
    destroy(): void;
    /**
     * Gets the unique session identifier
     *
     * @public
     * @readonly
     * @type {string}
     *
     * @example
     * ```typescript
     * console.log('Session ID:', session.sessionIdValue);
     * ```
     */
    get sessionIdValue(): string;
    /**
     * Gets the current session status
     *
     * @public
     * @readonly
     * @type {SessionStatus}
     *
     * @example
     * ```typescript
     * if (session.sessionStatus === 'active') {
     *   console.log('Session is currently active');
     * }
     * ```
     */
    get sessionStatus(): SessionStatus;
    /**
     * Gets a copy of the current session statistics
     *
     * @public
     * @readonly
     * @type {SessionStats}
     *
     * @example
     * ```typescript
     * const stats = session.sessionStats;
     * console.log(`Accuracy: ${stats.accuracy}%`);
     * console.log(`Items completed: ${stats.completedItems}/${stats.totalItems}`);
     * ```
     */
    get sessionStats(): SessionStats;
    /**
     * Gets a copy of the session configuration
     *
     * @public
     * @readonly
     * @type {LearningSessionConfig}
     *
     * @example
     * ```typescript
     * const config = session.sessionConfig;
     * console.log('Session type:', config.sessionType);
     * console.log('Max items:', config.maxItems);
     * ```
     */
    get sessionConfig(): LearningSessionConfig;
}
export default LearningSession;
//# sourceMappingURL=learning-session.d.ts.map