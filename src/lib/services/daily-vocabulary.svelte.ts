/**
 * Daily Vocabulary Service
 *
 * Provides vocabulary items per day with deterministic selection
 * based on date seeding. Same words available all day for consistent practice.
 *
 * Uses svelte-persisted-store for automatic storage synchronization.
 */

import { browser } from '$app/environment';
import { vocabularyDb } from '$lib/data/db.svelte';
import type { VocabularyItem } from '$lib/types/vocabulary';
import { DAILY_VOCABULARY_COUNT } from '$lib/constants/app';
import { persisted } from '$lib/stores/persisted';
import { get, type Unsubscriber } from 'svelte/store';

export interface DailyProgress {
  date: string; // YYYY-MM-DD format
  completedIds: string[];
  swipedRight: string[]; // "Know it" - correct
  swipedLeft: string[]; // "Practice more" - needs work
  currentIndex: number;
}

interface DailyItemsData {
  date: string;
  ids: string[];
}

// Persisted stores for daily vocabulary
const dailyProgressStore = persisted<DailyProgress>('daily-vocabulary-progress', {
  date: '',
  completedIds: [],
  swipedRight: [],
  swipedLeft: [],
  currentIndex: 0
});

const dailyItemsStore = persisted<DailyItemsData>('daily-vocabulary-items', {
  date: '',
  ids: []
});

class DailyVocabularyService {
  // Reactive state
  private _dailyItems = $state<VocabularyItem[]>([]);
  private _progress = $state<DailyProgress>({
    date: '',
    completedIds: [],
    swipedRight: [],
    swipedLeft: [],
    currentIndex: 0
  });
  private _initialized = $state(false);
  private _initializing = $state(false); // Lock to prevent race conditions
  private _loading = $state(false);
  private _error = $state<Error | null>(null);
  private _initPromise: Promise<void> | null = null; // Track initialization promise
  private _unsubscribeProgress: Unsubscriber | null = null; // Store subscription

  // Public getters
  get dailyItems(): VocabularyItem[] {
    return this._dailyItems;
  }

  get progress(): DailyProgress {
    return this._progress;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  get loading(): boolean {
    return this._loading;
  }

  get error(): Error | null {
    return this._error;
  }

  get currentItem(): VocabularyItem | null {
    if (this._dailyItems.length === 0) return null;
    return this._dailyItems[this._progress.currentIndex] ?? null;
  }

  get completedCount(): number {
    return this._progress.completedIds.length;
  }

  get remainingCount(): number {
    return DAILY_VOCABULARY_COUNT - this.completedCount;
  }

  get isComplete(): boolean {
    return this.completedCount >= DAILY_VOCABULARY_COUNT;
  }

  /**
   * Initialize the daily vocabulary service
   * Uses lock pattern to prevent race conditions from concurrent calls
   */
  async initialize(): Promise<void> {
    if (!browser) return;

    // Return existing promise if initialization is in progress
    if (this._initPromise) {
      return this._initPromise;
    }

    // Already initialized
    if (this._initialized) {
      return;
    }

    // Create initialization promise
    this._initPromise = this.doInitialize();
    return this._initPromise;
  }

  /**
   * Actual initialization logic (protected by lock)
   */
  private async doInitialize(): Promise<void> {
    // Double-check after getting the lock
    if (this._initialized || this._initializing) {
      return;
    }

    this._initializing = true;
    this._loading = true;
    this._error = null;

    try {
      // Ensure vocabulary database is loaded
      await vocabularyDb.initialize();

      const today = this.getTodayString();
      const savedProgress = this.loadProgress();

      // Check if we have saved data for today
      if (savedProgress && savedProgress.date === today) {
        this._progress = savedProgress;
        this._dailyItems = this.loadSavedItems() || this.selectDailyItems(today);
      } else {
        // New day - select fresh items
        this._dailyItems = this.selectDailyItems(today);
        this._progress = {
          date: today,
          completedIds: [],
          swipedRight: [],
          swipedLeft: [],
          currentIndex: 0
        };
        this.saveItems(this._dailyItems);
        this.saveProgress();
      }

      this._initialized = true;

      // Set up cross-tab synchronization
      this._setupStoreSync();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this._error = err;
      console.error('Failed to initialize daily vocabulary:', err);
      throw err; // Re-throw so callers can handle
    } finally {
      this._initializing = false;
      this._loading = false;
    }
  }

  /**
   * Set up store subscription for cross-tab synchronization
   */
  private _setupStoreSync(): void {
    // Clean up existing subscription
    if (this._unsubscribeProgress) {
      this._unsubscribeProgress();
    }

    // Subscribe to store changes from other tabs
    this._unsubscribeProgress = dailyProgressStore.subscribe(progress => {
      // Only update if different and from another source (date won't match if not same day)
      if (progress.date === this._progress.date &&
          (progress.currentIndex !== this._progress.currentIndex ||
           progress.completedIds.length !== this._progress.completedIds.length)) {
        this._progress = { ...progress };
      }
    });
  }

  /**
   * Clean up subscriptions when service is destroyed
   */
  destroy(): void {
    if (this._unsubscribeProgress) {
      this._unsubscribeProgress();
      this._unsubscribeProgress = null;
    }
  }

  /**
   * Retry initialization after failure
   */
  async retry(): Promise<void> {
    if (this._initializing) return;

    // Reset state
    this._initialized = false;
    this._error = null;
    this._initPromise = null;

    return this.initialize();
  }

  /**
   * Select 10 vocabulary items for today using deterministic seeding
   */
  private selectDailyItems(dateString: string): VocabularyItem[] {
    const allItems = vocabularyDb.getVocabulary();
    if (allItems.length === 0) return [];
    
    // Create deterministic seed from date
    const seed = this.dateToSeed(dateString);
    
    // Shuffle array using seeded random
    const shuffled = this.seededShuffle([...allItems], seed);
    
    // Prioritize items user hasn't mastered (optional enhancement)
    // Take first N items from shuffled list
    return shuffled.slice(0, DAILY_VOCABULARY_COUNT);
  }

  /**
   * Convert date string to numeric seed
   */
  private dateToSeed(dateString: string): number {
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Fisher-Yates shuffle with seeded random
   */
  private seededShuffle<T>(array: T[], seed: number): T[] {
    const seededRandom = this.createSeededRandom(seed);
    
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      const temp = array[i]!;
      array[i] = array[j]!;
      array[j] = temp;
    }
    
    return array;
  }

  /**
   * Create a seeded random number generator (mulberry32)
   */
  private createSeededRandom(seed: number): () => number {
    return () => {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /**
   * Get today's date as YYYY-MM-DD string
   */
  private getTodayString(): string {
    const now = new Date();
    const isoString = now.toISOString();
    const datePart = isoString.split('T')[0];
    return datePart ?? isoString.substring(0, 10);
  }

  /**
   * Handle swipe right (user knows the word)
   */
  swipeRight(): void {
    const currentItem = this.currentItem;
    if (!currentItem) return;
    
    // Mark as completed and known
    this._progress.completedIds.push(currentItem.id);
    this._progress.swipedRight.push(currentItem.id);
    
    // Move to next card
    this.moveToNext();
    this.saveProgress();
  }

  /**
   * Handle swipe left (user needs more practice)
   */
  swipeLeft(): void {
    const currentItem = this.currentItem;
    if (!currentItem) return;
    
    // Mark as completed but needs practice
    this._progress.completedIds.push(currentItem.id);
    this._progress.swipedLeft.push(currentItem.id);
    
    // Move to next card
    this.moveToNext();
    this.saveProgress();
  }

  /**
   * Move to next card index
   */
  private moveToNext(): void {
    if (this._progress.currentIndex < this._dailyItems.length - 1) {
      this._progress.currentIndex++;
    }
  }

  /**
   * Go to specific card index
   */
  goToIndex(index: number): void {
    if (index >= 0 && index < this._dailyItems.length) {
      this._progress.currentIndex = index;
    }
  }

  /**
   * Reset daily progress (for testing or starting over)
   */
  resetProgress(): void {
    this._progress = {
      date: this.getTodayString(),
      completedIds: [],
      swipedRight: [],
      swipedLeft: [],
      currentIndex: 0
    };
    this.saveProgress();
  }

  /**
   * Save progress to persisted store
   */
  private saveProgress(): void {
    dailyProgressStore.set(this._progress);
  }

  /**
   * Load progress from persisted store
   */
  private loadProgress(): DailyProgress | null {
    if (!browser) return null;
    const saved = get(dailyProgressStore);
    // Return null if empty/default
    if (!saved.date) return null;
    return saved;
  }

  /**
   * Save daily items to persisted store
   */
  private saveItems(items: VocabularyItem[]): void {
    const ids = items.map(item => item.id);
    dailyItemsStore.set({
      date: this.getTodayString(),
      ids
    });
  }

  /**
   * Load saved items from persisted store
   */
  private loadSavedItems(): VocabularyItem[] | null {
    if (!browser) return null;
    const saved = get(dailyItemsStore);

    // Check if data is for today
    if (saved.date !== this.getTodayString()) return null;
    if (!saved.ids.length) return null;

    // Reconstruct items from IDs
    const allItems = vocabularyDb.getVocabulary();
    const itemMap = new Map(allItems.map(item => [item.id, item]));

    return saved.ids
      .map((id: string) => itemMap.get(id))
      .filter((item: VocabularyItem | undefined): item is VocabularyItem => item !== undefined);
  }

  /**
   * Check if a specific item has been completed today
   */
  isCompleted(itemId: string): boolean {
    return this._progress.completedIds.includes(itemId);
  }

  /**
   * Check if user knew the word (swiped right)
   */
  wasKnown(itemId: string): boolean {
    return this._progress.swipedRight.includes(itemId);
  }

  /**
   * Check if user needs practice (swiped left)
   */
  needsPractice(itemId: string): boolean {
    return this._progress.swipedLeft.includes(itemId);
  }
}

// Export singleton instance
export const dailyVocabularyService = new DailyVocabularyService();
