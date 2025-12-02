/**
 * Type definitions for BulgarianGermanLearningApp
 * @file types.ts
 * @description TypeScript interfaces and types for the application
 *
 * This file serves as both a global declaration file and exportable types.
 */

// Exportable interfaces for module usage

// Import ProgressDashboardInstance from progress-dashboard-init
interface ProgressDashboardInstance {
  initialize(): Promise<void>;
}

/**
 * Vocabulary example structure
 */
export interface VocabularyExample {
  sentence: string;
  translation: string;
  context: string;
}

/**
 * Main vocabulary item interface
 */
export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  source_lang: 'bg' | 'de';
  target_lang: 'bg' | 'de';
  category: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  notes: string | null;
  notes_bg_to_de: string | null;
  notes_de_to_bg: string | null;
  etymology: string | null;
  cultural_note: string | null;
  difficulty: number;
  frequency: number;
  examples: VocabularyExample[];
  linguistic_note_bg_to_de: string | null;
  linguistic_note_de_to_bg: string | null;
  linguistic_note: string | null;
  audio_url?: string | undefined;
}

/**
 * Vocabulary filter interface
 */
export interface VocabularyFilters {
  level: string;
  category: string;
  search: string;
}

/**
 * Vocabulary state interface
 */
export interface VocabularyState {
  data: VocabularyItem[];
  filteredData: VocabularyItem[];
  selectedWords: Set<string>;
  filters: VocabularyFilters;
}
export interface ReviewState {
  itemId: string;
  direction: 'bg-de' | 'de-bg';
  schemaVersion: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  phase: number;
  nextReview: number;
  lastReview: number | null;
  totalReviews: number;
  correctAnswers: number;
  correctStreak: number;
  created: number;
  updated: number;
}

/**
 * Legacy review state (for migration purposes)
 */
export interface LegacyReviewState {
  interval?: number;
  easeFactor?: number;
  easinessFactor?: number;
  repetitions?: number;
  nextReviewDate?: string | number;
  lastReviewDate?: string | number;
  totalReviews?: number;
  correctAnswers?: number;
  streak?: number;
  correctStreak?: number;
  created?: string | number;
}

/**
 * Profile interface for dual-profile system
 */
export interface Profile {
  id: string;
  name: string;
  displayName: string;
  direction: 'bg-de' | 'de-bg';
  sourceLanguage: 'bg' | 'de';
  targetLanguage: 'bg' | 'de';
  createdAt: string;
  lastAccessedAt: string;
  statistics: ProfileStatistics;
  settings: ProfileSettings;
  customVocabulary: CustomVocabularyEntry[];
  customTags: string[];
  customCategories: string[];
}

/**
 * Profile statistics
 */
export interface ProfileStatistics {
  totalReviews: number;
  totalCorrect: number;
  totalTime: number;
  streak: number;
}

/**
 * Profile settings
 */
export interface ProfileSettings {
  dailyGoal: number;
  autoPlayAudio: boolean;
  voiceGender: 'male' | 'female';
}

/**
 * Custom vocabulary entry
 */
export interface CustomVocabularyEntry {
  id: string;
  bulgarian: string;
  german: string;
  category?: string;
  level?: string;
  examples?: string[];
  notes?: string;
  etymology?: string;
  cultural_note?: string;
  addedAt: string;
  source: 'custom';
  enrichmentStatus: 'complete' | 'partial' | 'minimal';
}

/**
 * Phase details for 6-phase learning system
 */
export interface PhaseDetails {
  min: number;
  max: number;
  name: string;
  color: string;
}

/**
 * Migration log entry
 */
export interface MigrationLogEntry {
  timestamp: number;
  type: 'detection' | 'migration' | 'batch_migration';
  count?: number;
  itemId?: string;
  direction?: 'bg-de' | 'de-bg';
  from?: string;
  to?: string;
  results?: MigrationResults;
}

/**
 * Migration results
 */
export interface MigrationResults {
  migrated: number;
  failed: number;
  skipped: number;
}

/**
 * Export data structure
 */
export interface ExportData {
  version: number;
  exported: number;
  states: Record<string, ReviewState>;
}

/**
 * Import results
 */
export interface ImportResults {
  imported: number;
  skipped: number;
  failed: number;
}

/**
 * Statistics for due items
 */
export interface DueItemsStats {
  total: number;
  due: number;
  avgEaseFactor: number;
  avgAccuracy: number;
  direction: 'bg-de' | 'de-bg' | 'all';
}

/**
 * Phase statistics
 */
export interface PhaseStatistics {
  learned: { count: number; percentage: string };
  phase1: { count: number; percentage: string };
  phase2: { count: number; percentage: string };
  phase3: { count: number; percentage: string };
  phase4: { count: number; percentage: string };
  phase5: { count: number; percentage: string };
  phase6: { count: number; percentage: string };
  total: number;
}

/**
 * Flashcard session statistics
 */
export interface SessionStats {
  startTime: Date | null;
  endTime: Date | null;
  totalCards: number;
  reviewedCards: number;
  correctAnswers: number;
  grades: number[];
}

/**
 * Flashcard text content (front and back)
 */
export interface CardText {
  frontText: string;
  backText: string;
}

/**
 * Speech recognition status and feedback
 */
export interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  expectedSpeech: string;
  lastTone: 'info' | 'success' | 'warning' | 'error';
  feedback: string;
}

/**
 * Flashcard configuration options
 */
export interface FlashcardConfig {
  category: string;
  level: string;
  limit: number;
  mode: 'practice' | 'due' | 'review';
  shuffle: boolean;
}

/**
 * Flashcard practice modes
 */
export type FlashcardMode = 'practice' | 'due' | 'review';

/**
 * Language direction for flashcards
 */
export type LanguageDirection = 'bg-de' | 'de-bg';

/**
 * Grade feedback information
 */
export interface GradeFeedback {
  grade: number;
  nextReview: string;
  interval: number;
  phase?: number;
  phaseName?: string;
}

/**
 * Speech recognition event data
 */
export interface SpeechRecognitionEvent {
  status: 'listening' | 'idle' | 'error' | 'result';
  transcript?: string;
  confidence?: number;
  error?: string;
}

/**
 * Flashcard UI state
 */
export interface FlashcardUIState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  isPaused: boolean;
  isComplete: boolean;
  currentCardIndex: number;
  isFlipped: boolean;
  showGradingControls: boolean;
}

/**
 * Practice session result
 */
export interface PracticeSessionResult {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  totalCards: number;
  reviewedCards: number;
  correctAnswers: number;
  accuracy: number;
  averageGrade: number;
  duration: number; // in minutes
  mistakes: number[];
  newWordsLearned: number[];
  wordsReviewed: string[];
}

/**
 * Keyboard shortcuts for flashcard navigation
 */
export interface FlashcardKeyboardShortcuts {
  flip: 'Space' | 'Enter' | 'f' | 'F';
  grade: '0' | '1' | '2' | '3' | '4' | '5';
  pause: 'Escape';
  next: 'n' | 'N';
  previous: 'p' | 'P';
  speech: 's' | 'S';
}

/**
 * Accessibility announcements
 */
export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  timeout: number;
}

/**
 * Flashcard animation states
 */
export interface FlashcardAnimationState {
  isFlipping: boolean;
  flipDirection: 'horizontal' | 'vertical';
  duration: number;
  easing: string;
}

/**
 * Vocabulary item for flashcards (simplified version)
 */
export interface FlashcardVocabularyItem {
  word: string;
  translation: string;
  category?: string;
  level?: string;
  notes?: string;
  notes_bg_to_de?: string;
  notes_de_to_bg?: string;
}

/**
 * Profile comparison data
 */
export interface ProfileComparison {
  german_learner: ProfileComparisonItem;
  bulgarian_learner: ProfileComparisonItem;
}

/**
 * Profile comparison item
 */
export interface ProfileComparisonItem {
  name: string;
  totalReviews: number;
  accuracy: string;
  streak: number;
  lastAccessed: string;
}

/**
 * Vocabulary API response types
 */
export interface VocabularyAPIResponse {
  data: VocabularyItem[];
  total: number;
  loaded: number;
  hasMore: boolean;
  timestamp: number;
}

/**
 * Vocabulary loading state
 */
export interface VocabularyLoadingState {
  isLoading: boolean;
  progress: number;
  totalChunks: number;
  loadedChunks: number;
  currentChunk: string;
  error: string | null;
}

/**
 * Vocabulary chunk metadata
 */
export interface VocabularyChunkMetadata {
  name: string;
  level: string;
  category: string;
  count: number;
  size: number;
  lastModified: number;
}

/**
 * Background sync queue item
 */
export interface BackgroundSyncItem {
  id: string;
  type: 'progress' | 'vocabulary' | 'preferences';
  data: unknown;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  networkRequests: number;
  errorCount: number;
}

/**
 * Error context information
 */
export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  stackTrace?: string;
}

/**
 * Flashcard instance interface
 */
export interface FlashcardInstance {
  init(): Promise<void>;
  showCard(index: number): void;
  handleGrade(grade: number): void;
  flipCard(): void;
  pauseSession(): void;
  endSession(): void;
  startNewSession(): void;
  reviewMistakes(): void;
  cleanup(): void;
}

/**
 * Global namespace for BulgarianGermanLearningApp
 */
declare global {
  interface Window {
    BgDeApp: {
      init: () => void;
      initNavigation: () => void;
      initLanguageToggle: () => void;
      initPerformanceMonitor: () => void;
      initVocabulary: () => void;
      initGrammar: () => void;
      initPracticeSession: () => void;
      initProgressDashboard: () => void;
      updateLanguageText: (lang: string) => void;
      startPractice: (level: string, category: string) => void;
      initChart: (container: HTMLElement, chartType: string) => void;
      handleError: (error: Error, context: string) => void;
      debounce: <T extends (...args: unknown[]) => void>(func: T, wait: number) => T;
      throttle: <T extends (...args: unknown[]) => void>(func: T, limit: number) => T;
      vocabulary: VocabularyState;
      loadVocabularyData: () => void;
      bindVocabularyEvents: () => void;
      renderVocabulary: () => void;
      updateVocabularyStats: () => void;
      applyVocabularyFilters: () => void;
      clearAllVocabularyFilters: () => void;
      bindCardSelectionEvents: () => void;
      toggleWordSelection: (word: string, cardElement: HTMLElement) => void;
      flipVocabularyCard: (cardElement: HTMLElement) => void;
      startPracticeWithSelected: () => void;
      shuffleArray: <T>(array: T[]) => T[];
    };
    gtag: (command: string, eventName: string, params?: unknown) => void;
    profileManager?: {
      getActiveProfileId(): string;
      onProfileChange(callback: () => void): void;
    };
    profileSwitcherUI: unknown;
    progressDashboard?: ProgressDashboardInstance;
    UnifiedSpacedRepetition: unknown;
    languageToggle?: {
      getDirection(): string;
    };
    UnifiedPracticeSession: unknown;
    VocabularyAdapter: unknown; // Revert to unknown since VocabularyAdapter is not in scope here
    Chart?: {
      new (context: CanvasRenderingContext2D, config: unknown): unknown;
    };
    vocabulary?: VocabularyItem[];
    phaseCalculator?: {
      calculatePhase(easeFactor: number, repetitions: number): number;
    };
    unifiedSpacedRepetition?: {
      initReviewState(itemId: string, direction?: LanguageDirection): ReviewState;
      scheduleNext(state: ReviewState, grade: number, direction?: LanguageDirection): ReviewState;
      loadState(itemId: string, direction?: LanguageDirection): ReviewState;
      saveState(state: ReviewState): boolean;
      getDueItems(direction?: LanguageDirection): ReviewState[];
      getStats(direction?: LanguageDirection): DueItemsStats;
    };
    vocabularyAPI?: {
      loadAll(): Promise<VocabularyItem[]>;
      loadChunk(chunkName: string): Promise<VocabularyItem[]>;
      getMetadata(): VocabularyChunkMetadata[];
      isLoading(): boolean;
      getProgress(): VocabularyLoadingState;
    };
    flashcards?: {
      new (container: HTMLElement): FlashcardInstance;
    };
    speechPractice?: {
      isSupported(): boolean;
      start(options: { lang: string }): void;
      stop(): void;
    };
  }

  // Extend DOM interfaces for custom properties
  interface Element {
    dataset: DOMStringMap;
    style: CSSStyleDeclaration;
  }

  interface HTMLElement {
    focus(): void;
  }

  // Extend DocumentEventMap for custom events
  interface DocumentEventMap {
    'language-direction-changed': CustomEvent<{ direction: string }>;
  }

  // Extend WindowEventMap for custom events
  interface WindowEventMap {
    'profile-switched': CustomEvent<{ profileId: string; profile: Profile; previousProfileId: string }>;
  }

  // Performance memory interface (non-standard but available in some browsers)
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

// Export the global declarations
export {};