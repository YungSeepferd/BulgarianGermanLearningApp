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
 * Internal state of a learning session
 *
 * @interface SessionState
 * @property {SessionStatus} status - Current session status
 * @property {number} currentIndex - Index of current item
 * @property {SessionItem[]} items - All items in the session
 * @property {ResponseData[]} responses - User responses collected
 * @property {number|null} startTime - Session start timestamp
 * @property {number|null} endTime - Session end timestamp
 * @property {number} pausedTime - Total time spent paused
 * @property {number} lastActivityTime - Timestamp of last user activity
 */
interface SessionState {
  status: SessionStatus;
  currentIndex: number;
  items: SessionItem[];
  responses: ResponseData[];
  startTime: number | null;
  endTime: number | null;
  pausedTime: number;
  lastActivityTime: number;
}

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
type EventData =
  | InitializedEventData
  | ItemsGeneratedEventData
  | ResponseSubmittedEventData
  | ItemSkippedEventData
  | SessionCompletedEventData
  | SessionAbandonedEventData
  | UpdateSpacedRepetitionEventData;

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
class LearningSession {
  private sessionId: string;
  private storageKey: string;
  private config: LearningSessionConfig;
  private state: SessionState;
  private stats: SessionStats;
  private listeners: Map<string, Set<EventCallback>>;
  private autoSaveInterval: number | null;

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
  constructor(options: LearningSessionConfig = {}) {
    this.sessionId = this.generateSessionId();
    this.storageKey = 'bgde:learning-sessions';
    
    // Session configuration
    this.config = {
      maxItems: options.maxItems || 20,
      sessionType: options.sessionType || 'mixed', // 'vocabulary', 'grammar', 'mixed'
      difficulty: options.difficulty || 'adaptive',
      categories: options.categories || [],
      levels: options.levels || ['A1', 'A2'],
      direction: options.direction || 'bg-de',
      reviewType: options.reviewType || 'due', // 'due', 'new', 'review', 'mixed'
      ...options
    };
    
    // Session state
    this.state = {
      status: 'initialized', // 'initialized', 'active', 'paused', 'completed', 'abandoned'
      currentIndex: 0,
      items: [],
      responses: [],
      startTime: null,
      endTime: null,
      pausedTime: 0,
      lastActivityTime: Date.now()
    };
    
    // Session statistics
    this.stats = {
      totalItems: 0,
      completedItems: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedItems: 0,
      hintsUsed: 0,
      averageResponseTime: 0,
      totalTime: 0,
      accuracy: 0,
      streak: 0,
      maxStreak: 0
    };
    
    // Event listeners
    this.listeners = new Map();
    
    // Auto-save interval
    this.autoSaveInterval = null;
    
    // Initialize session
    this.initialize();
  }

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
  private async initialize(): Promise<void> {
    try {
      // Load any existing session data
      this.loadSession();
      
      // Generate items for the session
      await this.generateSessionItems();
      
      // Set up auto-save
      this.setupAutoSave();
      
      this.emit('initialized', { sessionId: this.sessionId, config: this.config });
      
    } catch (error) {
      console.error('[LearningSession] Initialization failed:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

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
  public async start(): Promise<CurrentItem | null> {
    if (this.state.status !== 'initialized' && this.state.status !== 'paused') {
      throw new Error('Session cannot be started from current state');
    }
    
    this.state.status = 'active';
    this.state.startTime = this.state.startTime || Date.now();
    this.state.lastActivityTime = Date.now();
    
    this.emit('started', { sessionId: this.sessionId });
    this.saveSession();
    
    return this.getCurrentItem();
  }

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
  public pause(): void {
    if (this.state.status !== 'active') {
      throw new Error('Session is not active');
    }
    
    this.state.status = 'paused';
    this.state.pausedTime += Date.now() - this.state.lastActivityTime;
    
    this.emit('paused', { sessionId: this.sessionId });
    this.saveSession();
  }

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
  public resume(): Promise<CurrentItem | null> {
    if (this.state.status !== 'paused') {
      throw new Error('Session is not paused');
    }
    
    this.state.status = 'active';
    this.state.lastActivityTime = Date.now();
    
    this.emit('resumed', { sessionId: this.sessionId });
    this.saveSession();
    
    return Promise.resolve(this.getCurrentItem());
  }

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
  public complete(): SessionSummary {
    this.state.status = 'completed';
    this.state.endTime = Date.now();
    
    this.calculateFinalStats();
    this.emit('completed', {
      sessionId: this.sessionId,
      stats: this.stats,
      duration: this.getTotalTime()
    });
    
    this.saveSession();
    this.clearAutoSave();
    
    return this.getSessionSummary();
  }

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
  public abandon(): void {
    this.state.status = 'abandoned';
    this.state.endTime = Date.now();
    
    this.calculateFinalStats();
    this.emit('abandoned', { sessionId: this.sessionId, stats: this.stats });
    
    this.saveSession();
    this.clearAutoSave();
  }

  // Item management
  private async generateSessionItems(): Promise<void> {
    try {
      // Get items based on session configuration
      const items = await this.selectItems();
      
      // Shuffle items for variety
      this.state.items = this.shuffleArray([...items]);
      this.stats.totalItems = this.state.items.length;
      
      this.emit('itemsGenerated', { 
        count: this.state.items.length,
        types: this.getItemTypeDistribution()
      });
      
    } catch (error) {
      console.error('[LearningSession] Failed to generate items:', error);
      throw error;
    }
  }

  private async selectItems(): Promise<SessionItem[]> {
    const { maxItems, categories, levels, reviewType } = this.config;
    
    // This would typically call the API client or spaced repetition service
    // For now, we'll simulate the selection logic
    
    let selectedItems: SessionItem[] = [];
    
    switch (reviewType) {
    case 'due': {
      // Get due items from spaced repetition
      selectedItems = await this.getDueItems();
    
      break;
    }
    case 'new': {
      // Get new items user hasn't seen
      selectedItems = await this.getNewItems();
    
      break;
    }
    case 'review': {
      // Get items for review (recently learned)
      selectedItems = await this.getReviewItems();
    
      break;
    }
    default: {
      // Mixed selection
      const dueItems = await this.getDueItems();
      const newItems = await this.getNewItems();
      const reviewItems = await this.getReviewItems();
      
      // Balance the selection
      selectedItems = [
        ...dueItems.slice(0, Math.floor(maxItems! * 0.5)),
        ...newItems.slice(0, Math.floor(maxItems! * 0.3)),
        ...reviewItems.slice(0, Math.floor(maxItems! * 0.2))
      ];
    }
    }
    
    // Apply filters
    selectedItems = selectedItems.filter(item => {
      if (categories!.length > 0 && !categories!.includes(item.category)) {
        return false;
      }
      if (levels!.length > 0 && !levels!.includes(item.level)) {
        return false;
      }
      return true;
    });
    
    // Limit to max items
    return selectedItems.slice(0, maxItems);
  }

  private async getDueItems(): Promise<SessionItem[]> {
    // Placeholder - would integrate with spaced repetition service
    return [];
  }

  private async getNewItems(): Promise<SessionItem[]> {
    // Placeholder - would get items user hasn't practiced
    return [];
  }

  private async getReviewItems(): Promise<SessionItem[]> {
    // Placeholder - would get recently learned items
    return [];
  }

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
  public getCurrentItem(): CurrentItem | null {
    if (this.state.currentIndex >= this.state.items.length) {
      return null;
    }
    
    const item = this.state.items[this.state.currentIndex];
    return {
      ...item,
      index: this.state.currentIndex,
      total: this.state.items.length,
      progress: (this.state.currentIndex / this.state.items.length) * 100
    };
  }

  // Response handling
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
  public submitResponse(response: {
    answer: string;
    isCorrect: boolean;
    responseTime?: number;
    hintsUsed?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }): CurrentItem | null {
    const currentItem = this.getCurrentItem();
    if (!currentItem) {
      throw new Error('No current item to respond to');
    }
    
    const responseData: ResponseData = {
      itemId: currentItem.id,
      response: response.answer,
      isCorrect: response.isCorrect,
      responseTime: response.responseTime || 0,
      hintsUsed: response.hintsUsed || 0,
      timestamp: Date.now(),
      difficulty: response.difficulty || 'medium'
    };
    
    // Store the response
    this.state.responses.push(responseData);
    
    // Update statistics
    this.updateStats(responseData);
    
    // Update spaced repetition data
    this.updateSpacedRepetition(currentItem, responseData);
    
    // Move to next item
    this.state.currentIndex++;
    this.state.lastActivityTime = Date.now();
    
    this.emit('responseSubmitted', {
      response: responseData,
      currentItem,
      nextItem: this.getCurrentItem()
    });
    
    // Check if session is complete
    if (this.state.currentIndex >= this.state.items.length) {
      this.complete();
      return null;
    }
    
    this.saveSession();
    return this.getCurrentItem();
  }

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
  public skipItem(reason = 'user_skip'): CurrentItem | null {
    const currentItem = this.getCurrentItem();
    if (!currentItem) {
      throw new Error('No current item to skip');
    }
    
    const skipData = {
      itemId: currentItem.id,
      reason: reason,
      timestamp: Date.now()
    };
    
    this.state.responses.push({
      ...skipData,
      response: null,
      isCorrect: false,
      responseTime: 0,
      hintsUsed: 0,
      difficulty: 'medium'
    });
    
    this.stats.skippedItems++;
    this.stats.streak = 0; // Reset streak on skip
    
    this.state.currentIndex++;
    this.state.lastActivityTime = Date.now();
    
    this.emit('itemSkipped', { skipData, currentItem });
    
    if (this.state.currentIndex >= this.state.items.length) {
      this.complete();
      return null;
    }
    
    this.saveSession();
    return this.getCurrentItem();
  }

  // Statistics and analytics
  private updateStats(responseData: ResponseData): void {
    this.stats.completedItems++;
    
    if (responseData.isCorrect) {
      this.stats.correctAnswers++;
      this.stats.streak++;
      this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.streak);
    } else {
      this.stats.incorrectAnswers++;
      this.stats.streak = 0;
    }
    
    this.stats.hintsUsed += responseData.hintsUsed;
    
    // Update average response time
    const totalResponseTime = this.stats.averageResponseTime * (this.stats.completedItems - 1) + responseData.responseTime;
    this.stats.averageResponseTime = totalResponseTime / this.stats.completedItems;
    
    // Calculate accuracy
    this.stats.accuracy = (this.stats.correctAnswers / this.stats.completedItems) * 100;
  }

  private calculateFinalStats(): void {
    this.stats.totalTime = this.getTotalTime();
    
    // Calculate additional metrics
    this.stats.itemsPerMinute = this.stats.totalTime > 0 ? 
      (this.stats.completedItems / (this.stats.totalTime / 60_000)) : 0;
    
    this.stats.efficiencyScore = this.calculateEfficiencyScore();
    this.stats.difficultyRating = this.calculateDifficultyRating();
  }

  private calculateEfficiencyScore(): number {
    // Combine accuracy, speed, and hint usage into efficiency score
    const accuracyWeight = 0.5;
    const speedWeight = 0.3;
    const hintWeight = 0.2;
    
    const accuracyScore = this.stats.accuracy;
    const speedScore = Math.max(0, 100 - (this.stats.averageResponseTime / 1000) * 10);
    const hintScore = Math.max(0, 100 - (this.stats.hintsUsed / this.stats.completedItems) * 50);
    
    return (accuracyScore * accuracyWeight + speedScore * speedWeight + hintScore * hintWeight);
  }

  private calculateDifficultyRating(): 'easy' | 'medium' | 'hard' | 'very_hard' {
    // Estimate session difficulty based on performance
    if (this.stats.accuracy >= 90) {
      return 'easy';
    }
    if (this.stats.accuracy >= 70) {
      return 'medium';
    }
    if (this.stats.accuracy >= 50) {
      return 'hard';
    }
    return 'very_hard';
  }

  // Spaced repetition integration
  private updateSpacedRepetition(item: CurrentItem, response: ResponseData): void {
    // This would integrate with the spaced repetition service
    // to update review intervals based on performance
    
    const grade = this.responseToGrade(response);
    
    // Emit event for spaced repetition service to handle
    this.emit('updateSpacedRepetition', {
      itemId: item.id,
      grade: grade,
      direction: this.config.direction!,
      timestamp: response.timestamp
    });
  }

  private responseToGrade(response: ResponseData): number {
    // Convert response to SM-2 grade (0-5)
    if (!response.isCorrect) {
      return 0;
    } // Failed
    
    if (response.hintsUsed > 0) {
      return 3;
    } // Correct with hints
    if (response.responseTime > 10_000) {
      return 4;
    } // Slow but correct
    return 5; // Quick and correct
  }

  // Persistence
  private saveSession(): void {
    try {
      const sessionData = {
        sessionId: this.sessionId,
        config: this.config,
        state: this.state,
        stats: this.stats,
        lastSaved: Date.now()
      };
      
      const sessions = this.loadAllSessions();
      sessions[this.sessionId] = sessionData;
      
      localStorage.setItem(this.storageKey, JSON.stringify(sessions));
      
    } catch (error) {
      console.error('[LearningSession] Failed to save session:', error);
    }
  }

  private loadSession(): void {
    try {
      const sessions = this.loadAllSessions();
      const sessionData = sessions[this.sessionId];
      
      if (sessionData) {
        this.config = { ...this.config, ...sessionData.config };
        this.state = { ...this.state, ...sessionData.state };
        this.stats = { ...this.stats, ...sessionData.stats };
      }
      
    } catch (error) {
      console.error('[LearningSession] Failed to load session:', error);
    }
  }

  private loadAllSessions(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[LearningSession] Failed to load sessions:', error);
      return {};
    }
  }

  // Utility methods
  private generateSessionId(): string {
    // Use crypto.getRandomValues for secure randomness
    const array = new Uint8Array(9);
    window.crypto.getRandomValues(array);
    const randomStr = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `session_${Date.now()}_${randomStr}`;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  public getTotalTime(): number {
    if (!this.state.startTime) {
      return 0;
    }
    
    const endTime = this.state.endTime || Date.now();
    return endTime - this.state.startTime - this.state.pausedTime;
  }

  public getProgress(): SessionProgress {
    return {
      current: this.state.currentIndex,
      total: this.state.items.length,
      percentage: (this.state.currentIndex / this.state.items.length) * 100,
      completed: this.state.status === 'completed'
    };
  }

  public getSessionSummary(): SessionSummary {
    return {
      sessionId: this.sessionId,
      config: this.config,
      stats: this.stats,
      duration: this.getTotalTime(),
      progress: this.getProgress(),
      status: this.state.status,
      responses: this.state.responses
    };
  }

  public getItemTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const item of this.state.items) {
      const type = item.type || 'vocabulary';
      distribution[type] = (distribution[type] || 0) + 1;
    }
    return distribution;
  }

  // Auto-save functionality
  private setupAutoSave(): void {
    this.clearAutoSave();
    this.autoSaveInterval = window.setInterval(() => {
      if (this.state.status === 'active') {
        this.saveSession();
      }
    }, 30_000); // Auto-save every 30 seconds
  }

  private clearAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Event system
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
  public on<T = EventData>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => this.off(event, callback);
  }

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
  public off<T = EventData>(event: string, callback: EventCallback<T>): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  /**
   * Emits an event to all registered listeners
   *
   * @private
   * @template T - Type of event data
   * @param {string} event - Event name to emit
   * @param {T} data - Event data to pass to listeners
   */
  private emit<T = EventData>(event: string, data: T): void {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)!) {
        try {
          callback(data);
        } catch (error) {
          console.error('[LearningSession] Event listener error:', error);
        }
      }
    }
  }

  // Cleanup
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
  public destroy(): void {
    this.clearAutoSave();
    this.listeners.clear();
    
    if (this.state.status === 'active') {
      this.abandon();
    }
  }

  // Getters
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
  public get sessionIdValue(): string {
    return this.sessionId;
  }

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
  public get sessionStatus(): SessionStatus {
    return this.state.status;
  }

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
  public get sessionStats(): SessionStats {
    return { ...this.stats };
  }

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
  public get sessionConfig(): LearningSessionConfig {
    return { ...this.config };
  }
}

export default LearningSession;