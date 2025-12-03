/**
 * Represents a vocabulary or grammar item in the learning system
 * @interface VocabularyItem
 */
export interface VocabularyItem {
  /**
   * Unique identifier for the item (slug format)
   * @example "greetings-hello"
   */
  id: string;

  /**
   * German word or phrase
   * @example "Hallo"
   */
  german: string;

  /**
   * Bulgarian translation
   * @example "Здравей"
   */
  bulgarian: string;

  /**
   * Category or topic the item belongs to
   * @example "Greetings"
   */
  category: string;

  /**
   * Tags for additional categorization
   * @example ["A1", "Basic", "Social"]
   */
  tags: string[];

  /**
   * Type of item
   * - 'word': Standard vocabulary item
   * - 'rule': Grammar rule or explanation
   */
  type: 'word' | 'rule';

  /**
   * CEFR difficulty level (optional)
   * @example "A1"
   */
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

  /**
   * Pronunciation guidance (optional)
   * @example "German: [hahlo], Bulgarian: [zdravei]"
   */
  pronunciation?: string;

  /**
   * Example sentence using the word (optional)
   * @example "German: 'Hallo, wie geht es dir?', Bulgarian: 'Здравей, как си?'"
   */
  example?: string;

  /**
   * Global statistics about the item's usage (optional)
   */
  global_stats?: {
    /**
     * Total correct answers across all users
     */
    correct_count: number;

    /**
     * Total incorrect answers across all users
     */
    incorrect_count: number;

    /**
     * Calculated success rate (0-100)
     */
    success_rate: number;

    /**
     * Timestamp of last practice
     */
    last_practiced?: string;
  };

  /**
   * Timestamp when the item was created
   */
  created_at?: string;

  /**
   * Timestamp when the item was last updated
   */
  updated_at?: string;

  // Enhanced fields for better performance and features
  /**
   * Search index for faster text searching (computed field)
   */
  searchIndex?: string;

  /**
   * Frequency ranking for practice prioritization
   */
  frequency?: number;

  /**
   * Related item IDs for contextual learning
   */
  relatedItems?: string[];

  /**
   * Audio pronunciation file path (optional)
   */
  audioPath?: string;

  /**
   * Image or visual aid path (optional)
   */
  imagePath?: string;

  /**
   * Learning context hints (optional)
   */
  contextHints?: string[];
}

// Type for filtered/searched vocabulary results
export interface VocabularySearchResult {
  items: VocabularyItem[];
  total: number;
  categories: string[];
  tags: string[];
}

/**
 * Represents the state of a practice session
 * @interface PracticeSession
 */
export interface PracticeSession {
  /**
   * Current vocabulary item being practiced
   */
  currentItem: VocabularyItem | null;

  /**
   * Whether the answer is currently visible
   */
  showAnswer: boolean;

  /**
   * Direction of the current practice session
   * - 'DE->BG': German to Bulgarian
   * - 'BG->DE': Bulgarian to German
   */
  direction: 'DE->BG' | 'BG->DE';

  /**
   * When the session started
   */
  startTime: Date;

  /**
   * Total items practiced in this session
   */
  itemsPracticed: number;

  /**
   * Number of correct answers in this session
   */
  correctAnswers: number;

  /**
   * User ID if tracking individual progress
   */
  userId?: string;

  /**
   * Session ID for tracking
   */
  sessionId?: string;

  // Enhanced session tracking
  /**
   * Session type for different practice modes
   */
  sessionType?: 'random' | 'category' | 'difficulty' | 'favorites' | 'recommended';

  /**
   * Filter criteria for the session
   */
  filters?: {
    category?: string;
    difficulty?: string;
    tags?: string[];
  };

  /**
   * Response times for each item (in milliseconds)
   */
  responseTimes?: number[];

  /**
   * Items that were marked as difficult during the session
   */
  difficultItems?: string[];

  /**
   * Session duration in milliseconds
   */
  duration?: number;
}

/**
 * Enhanced user progress tracking
 */
export interface UserProgress {
  /**
   * Statistics for each vocabulary item
   */
  stats: Map<string, {
    correct: number;
    incorrect: number;
    lastPracticed: string;
    averageResponseTime?: number;
    masteryLevel?: number;
    streakCount?: number;
  }>;

  /**
   * User's favorite vocabulary items
   */
  favorites: string[];

  /**
   * Recent search queries
   */
  recentSearches: string[];

  /**
   * Overall learning statistics
   */
  overallStats: {
    totalPracticed: number;
    totalCorrect: number;
    averageAccuracy: number;
    currentStreak: number;
    longestStreak: number;
    totalTimeSpent: number;
    lastPracticeDate: string;
  };

  /**
   * Learning goals and achievements
   */
  goals?: {
    dailyTarget: number;
    weeklyTarget: number;
    currentStreak: number;
    achievements: string[];
  };
}

/**
 * Practice recommendations based on user progress
 */
export interface PracticeRecommendation {
  /**
   * Recommended vocabulary items
   */
  items: VocabularyItem[];

  /**
   * Recommendation reason
   */
  reason: 'new' | 'struggling' | 'review' | 'streak' | 'balanced';

  /**
   * Priority score (higher = more important)
   */
  priority: number;

  /**
   * Estimated difficulty for this user
   */
  userDifficulty: 'easy' | 'medium' | 'hard';
}

// Type for global statistics from Supabase
export interface GlobalStats {
  item_id: string;
  correct_count: number;
  incorrect_count: number;
  success_rate: number;
  last_practiced: string;
}