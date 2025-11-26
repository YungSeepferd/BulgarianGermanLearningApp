/**
 * Type definitions for BulgarianGermanLearningApp - SvelteKit Version
 * @file types/index.ts
 * @description TypeScript interfaces and types for the SvelteKit application
 * @version 1.0.0
 * @updated November 2025
 */

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
 * SvelteKit specific types for flashcard components
 */
export interface FlashcardComponentProps {
  vocabularyItem: VocabularyItem;
  direction: LanguageDirection;
  onGrade?: (grade: number, state: ReviewState) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showProgress?: boolean;
  autoFlip?: boolean;
}

export interface FlashcardStoreState {
  currentCard: VocabularyItem | null;
  currentIndex: number;
  cards: VocabularyItem[];
  isFlipped: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  sessionStats: SessionStats;
  uiState: FlashcardUIState;
}

export interface FlashcardStoreActions {
  setCurrentCard: (index: number) => void;
  flipCard: () => void;
  nextCard: () => void;
  previousCard: () => void;
  gradeCard: (grade: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  resetSession: () => void;
  updateSessionStats: (stats: Partial<SessionStats>) => void;
}

// Export all types for easy importing
export type {
  ProgressDashboardInstance,
  VocabularyExample,
  VocabularyItem,
  VocabularyFilters,
  VocabularyState,
  ReviewState,
  LegacyReviewState,
  Profile,
  ProfileStatistics,
  ProfileSettings,
  CustomVocabularyEntry,
  PhaseDetails,
  MigrationLogEntry,
  MigrationResults,
  ExportData,
  ImportResults,
  DueItemsStats,
  PhaseStatistics,
  SessionStats,
  CardText,
  SpeechRecognitionState,
  FlashcardConfig,
  FlashcardMode,
  LanguageDirection,
  GradeFeedback,
  SpeechRecognitionEvent,
  FlashcardUIState,
  PracticeSessionResult,
  FlashcardKeyboardShortcuts,
  ScreenReaderAnnouncement,
  FlashcardAnimationState,
  FlashcardVocabularyItem,
  ProfileComparison,
  ProfileComparisonItem,
  VocabularyAPIResponse,
  VocabularyLoadingState,
  VocabularyChunkMetadata,
  BackgroundSyncItem,
  PerformanceMetrics,
  ErrorContext,
  FlashcardInstance,
  FlashcardComponentProps,
  FlashcardStoreState,
  FlashcardStoreActions
/**
 * Memory information
 */
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Lazy loading configuration
 */
export interface LazyLoadConfig {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Performance monitoring options
 */
export interface PerformanceMonitoringOptions {
  enableLongTaskMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  sampleRate?: number;
}

/**
 * Component performance data
 */
export interface ComponentPerformance {
  mountTime: number;
  renderTime: number;
  updateTime: number;
  destroyTime: number;
  memoryUsage: MemoryInfo | null;
  interactions: number;
  errors: number;
}

/**
 * Performance budget
 */
export interface PerformanceBudget {
  maxLoadTime: number;
  maxRenderTime: number;
  maxMemoryUsage: number;
  maxBundleSize: number;
  maxNetworkRequests: number;
}

/**
 * Performance recommendation
 */
export interface PerformanceRecommendation {
  type: 'warning' | 'error' | 'info';
  category: 'performance' | 'memory' | 'network' | 'accessibility';
  message: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  memory: number;
  cores: number;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  touchSupport: boolean;
}

/**
 * Performance optimization strategy
 */
export interface OptimizationStrategy {
  lazyLoading: boolean;
  codeSplitting: boolean;
  virtualScrolling: boolean;
  imageOptimization: boolean;
  animationOptimization: boolean;
  memoryOptimization: boolean;
}

// Export new performance types
export type {
  MemoryInfo,
  LazyLoadConfig,
  PerformanceMonitoringOptions,
  ComponentPerformance,
  PerformanceBudget,
  PerformanceRecommendation,
  DeviceCapabilities,
  OptimizationStrategy
};
};