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
interface VocabularyExample {
  sentence: string;
  translation: string;
  context: string;
}

/**
 * Main vocabulary item interface
 */
interface VocabularyItem {
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
interface VocabularyFilters {
  level: string;
  category: string;
  search: string;
}

/**
 * Vocabulary state interface
 */
interface VocabularyState {
  data: VocabularyItem[];
  filteredData: VocabularyItem[];
  selectedWords: Set<string>;
  filters: VocabularyFilters;
}

interface ReviewState {
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
interface LegacyReviewState {
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
interface Profile {
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
interface ProfileStatistics {
  totalReviews: number;
  totalCorrect: number;
  totalTime: number;
  streak: number;
}

/**
 * Profile settings
 */
interface ProfileSettings {
  dailyGoal: number;
  autoPlayAudio: boolean;
  voiceGender: 'male' | 'female';
}

/**
 * Custom vocabulary entry
 */
interface CustomVocabularyEntry {
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
interface PhaseDetails {
  min: number;
  max: number;
  name: string;
  color: string;
}

/**
 * Migration log entry
 */
interface MigrationLogEntry {
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
interface MigrationResults {
  migrated: number;
  failed: number;
  skipped: number;
}

/**
 * Export data structure
 */
interface ExportData {
  version: number;
  exported: number;
  states: Record<string, ReviewState>;
}

/**
 * Import results
 */
interface ImportResults {
  imported: number;
  skipped: number;
  failed: number;
}

/**
 * Statistics for due items
 */
interface DueItemsStats {
  total: number;
  due: number;
  avgEaseFactor: number;
  avgAccuracy: number;
  direction: 'bg-de' | 'de-bg' | 'all';
}

/**
 * Phase statistics
 */
interface PhaseStatistics {
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
interface SessionStats {
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
interface CardText {
  frontText: string;
  backText: string;
}

/**
 * Speech recognition status and feedback
 */
interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  expectedSpeech: string;
  lastTone: 'info' | 'success' | 'warning' | 'error';
  feedback: string;
}

/**
 * Flashcard configuration options
 */
interface FlashcardConfig {
  category?: string;
  level?: string;
  limit?: number;
  mode?: 'practice' | 'due' | 'review';
  shuffle?: boolean;
}

/**
 * Flashcard practice modes
 */
type FlashcardMode = 'practice' | 'due' | 'review';

/**
 * Language direction for flashcards
 */
type LanguageDirection = 'bg-de' | 'de-bg';

/**
 * Grade feedback information
 */
interface GradeFeedback {
  grade: number;
  nextReview: string;
  interval: number;
  phase?: number;
  phaseName?: string;
}

/**
 * Speech recognition event data
 */
interface SpeechRecognitionEvent {
  status: 'listening' | 'idle' | 'error' | 'result';
  transcript?: string;
  confidence?: number;
  error?: string;
}

/**
 * Flashcard UI state
 */
interface FlashcardUIState {
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
interface PracticeSessionResult {
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
interface FlashcardKeyboardShortcuts {
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
interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  timeout: number;
}

/**
 * Flashcard animation states
 */
interface FlashcardAnimationState {
  isFlipping: boolean;
  flipDirection: 'horizontal' | 'vertical';
  duration: number;
  easing: string;
}

/**
 * Vocabulary item for flashcards (simplified version)
 */
interface FlashcardVocabularyItem {
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
interface ProfileComparison {
  german_learner: ProfileComparisonItem;
  bulgarian_learner: ProfileComparisonItem;
}

/**
 * Profile comparison item
 */
interface ProfileComparisonItem {
  name: string;
  totalReviews: number;
  accuracy: string;
  streak: number;
  lastAccessed: string;
}

/**
 * Vocabulary API response types
 */
interface VocabularyAPIResponse {
  items?: VocabularyItem[];
  data?: VocabularyItem[];
  total: number;
  loaded: number;
  hasMore: boolean;
  timestamp: number;
  page?: number;
  pageSize?: number;
}

/**
 * Vocabulary loading state
 */
interface VocabularyLoadingState {
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
interface VocabularyChunkMetadata {
  name: string;
  level: string;
  category: string;
  count: number;
  size: number;
  totalItems: number;
  levels: string[];
  categories: string[];
  description: string;
  lastModified: number;
}

/**
 * Background sync queue item
 */
interface BackgroundSyncItem {
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
interface PerformanceMetrics {
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
interface ErrorContext {
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
interface FlashcardInstance {
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
interface FlashcardComponentProps {
  vocabularyItem: VocabularyItem;
  direction: LanguageDirection;
  onGrade?: (grade: number, state: ReviewState) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showProgress?: boolean;
  autoFlip?: boolean;
}

interface FlashcardStoreState {
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

interface FlashcardStoreActions {
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
  FlashcardStoreActions,
  MemoryInfo,
  LazyLoadConfig,
  PerformanceMonitoringOptions,
  ComponentPerformance,
  PerformanceBudget,
  PerformanceRecommendation,
  DeviceCapabilities,
  OptimizationStrategy,
  PracticeSettings,
  VocabularyEntry
};

/**
 * Memory information
 */
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Lazy loading configuration
 */
interface LazyLoadConfig {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Performance monitoring options
 */
interface PerformanceMonitoringOptions {
  enableLongTaskMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  sampleRate?: number;
}

/**
 * Component performance data
 */
interface ComponentPerformance {
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
interface PerformanceBudget {
  maxLoadTime: number;
  maxRenderTime: number;
  maxMemoryUsage: number;
  maxBundleSize: number;
  maxNetworkRequests: number;
}

/**
 * Performance recommendation
 */
interface PerformanceRecommendation {
  type: 'warning' | 'error' | 'info';
  category: 'performance' | 'memory' | 'network' | 'accessibility';
  message: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Device capabilities
 */
interface DeviceCapabilities {
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
interface OptimizationStrategy {
  lazyLoading: boolean;
  codeSplitting: boolean;
  virtualScrolling: boolean;
  imageOptimization: boolean;
  animationOptimization: boolean;
  memoryOptimization: boolean;
}

/**
 * Practice settings interface
 */
interface PracticeSettings {
  direction: 'bg-de' | 'de-bg' | 'all';
  level: string;
  category: string;
  maxCards: number;
  showHints: boolean;
  autoAdvance: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Vocabulary entry interface (legacy format)
 */
interface VocabularyEntry {
  id: string;
  bg: string;
  de: string;
  level: string;
  category: string;
  pronunciation?: string;
  gender?: 'masculine' | 'feminine' | 'neuter';
  wordType?: string;
  examples?: string[];
  tags?: string[];
  notes?: string;
  spacedRepetition?: any;
}
