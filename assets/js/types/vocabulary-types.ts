/**
 * Shared TypeScript interfaces for vocabulary management
 * Provides type safety across all modules
 * @since 2.0.0
 */

/**
 * Base vocabulary entry interface
 */
export interface VocabularyEntry {
  id: string;
  bulgarian: string;
  german: string;
  category: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  cultural_note: string;
  linguistic_note: string;
  examples: string[];
  source: string;
  created_at: string;
  updated_at?: string;
  tags: string[];
}

/**
 * Vocabulary item for API responses
 */
export interface VocabularyItem {
  id: string;
  bulgarian: string;
  german: string;
  category: string;
  level: string;
  tags?: string[];
  examples?: string[];
  pronunciation?: string;
  difficulty?: number;
  frequency?: number;
  word?: string;
  translation?: string;
  notes?: string;
  audio?: string;
  etymology?: string;
}

/**
 * Grammar item interface
 */
export interface GrammarItem {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  examples: string[];
  rules: string[];
}

/**
 * Practice item interface
 */
export interface PracticeItem {
  id: string;
  type: 'vocabulary' | 'grammar';
  question: string;
  answer: string;
  category: string;
  level: string;
  difficulty: number;
  reviewType: 'due' | 'new' | 'review';
}

/**
 * Memory statistics interface
 */
export interface MemoryStatistics {
  pressure: 'low' | 'medium' | 'high' | 'critical';
  usage: number;
  available: number;
  quota: number;
}

/**
 * Connectivity status interface
 */
export interface ConnectivityStatus {
  online: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

/**
 * Vocabulary adapter interface
 */
export interface VocabularyAdapter {
  getItemsForDirection(direction: string): VocabularyItem[];
  getItem(id: string): VocabularyItem | null;
  search(query: string, options?: SearchOptions): VocabularyItem[];
}

/**
 * Spaced repetition system interface
 */
export interface SpacedRepetitionSystem {
  getAllReviewStates(): ReviewState[];
  getDueItems(reviewStates: ReviewState[]): ReviewState[];
  updateReviewState(itemId: string, correct: boolean, options?: ReviewUpdateOptions): void;
}

/**
 * Review state interface
 */
export interface ReviewState {
  itemId: string;
  nextReview: number;
  interval: number;
  easeFactor: number;
  reviewCount: number;
  lastReview?: number;
}

/**
 * Review update options
 */
export interface ReviewUpdateOptions {
  learningDirection?: string;
  difficulty?: number;
}

/**
 * Search options interface
 */
export interface SearchOptions {
  type?: 'vocabulary' | 'grammar' | 'all';
  limit?: number;
  useCache?: boolean;
}

/**
 * Audio manager interface
 */
export interface AudioManager {
  useEnhancedTTS: boolean;
  tts?: {
    speak(text: string, lang: string): void;
  };
}

/**
 * Language toggle interface
 */
export interface LanguageToggle {
  getDirection(): string;
}

/**
 * Extended window interface for global objects
 */
export interface ExtendedWindow extends Window {
  languageToggle?: LanguageToggle;
  audioManager?: AudioManager;
  apiClient?: any;
}