/**
 * Daily Vocabulary Service
 * 
 * Provides 10 vocabulary items per day with deterministic selection
 * based on date seeding. Same 10 words available all day for consistent practice.
 */

import { browser } from '$app/environment';
import { vocabularyDb } from '$lib/data/db.svelte';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Local storage key for daily progress
const DAILY_PROGRESS_KEY = 'daily-vocabulary-progress';
const DAILY_ITEMS_KEY = 'daily-vocabulary-items';

export interface DailyProgress {
  date: string; // YYYY-MM-DD format
  completedIds: string[];
  swipedRight: string[]; // "Know it" - correct
  swipedLeft: string[]; // "Practice more" - needs work
  currentIndex: number;
}

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
  private _loading = $state(false);

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

  get currentItem(): VocabularyItem | null {
    if (this._dailyItems.length === 0) return null;
    return this._dailyItems[this._progress.currentIndex] ?? null;
  }

  get completedCount(): number {
    return this._progress.completedIds.length;
  }

  get remainingCount(): number {
    return 10 - this.completedCount;
  }

  get isComplete(): boolean {
    return this.completedCount >= 10;
  }

  /**
   * Initialize the daily vocabulary service
   */
  async initialize(): Promise<void> {
    if (!browser || this._initialized) return;
    
    this._loading = true;
    
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
    } catch (error) {
      console.error('Failed to initialize daily vocabulary:', error);
    } finally {
      this._loading = false;
    }
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
    // For now, just take first 10 from shuffled list
    return shuffled.slice(0, 10);
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
   * Save progress to localStorage
   */
  private saveProgress(): void {
    if (!browser) return;
    try {
      localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(this._progress));
    } catch (error) {
      console.error('Failed to save daily progress:', error);
    }
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): DailyProgress | null {
    if (!browser) return null;
    try {
      const saved = localStorage.getItem(DAILY_PROGRESS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save daily items to localStorage
   */
  private saveItems(items: VocabularyItem[]): void {
    if (!browser) return;
    try {
      // Save only IDs to reduce storage size
      const ids = items.map(item => item.id);
      localStorage.setItem(DAILY_ITEMS_KEY, JSON.stringify({
        date: this.getTodayString(),
        ids
      }));
    } catch (error) {
      console.error('Failed to save daily items:', error);
    }
  }

  /**
   * Load saved items from localStorage
   */
  private loadSavedItems(): VocabularyItem[] | null {
    if (!browser) return null;
    try {
      const saved = localStorage.getItem(DAILY_ITEMS_KEY);
      if (!saved) return null;
      
      const { date, ids } = JSON.parse(saved);
      if (date !== this.getTodayString()) return null;
      
      // Reconstruct items from IDs
      const allItems = vocabularyDb.getVocabulary();
      const itemMap = new Map(allItems.map(item => [item.id, item]));
      
      return ids
        .map((id: string) => itemMap.get(id))
        .filter((item: VocabularyItem | undefined): item is VocabularyItem => item !== undefined);
    } catch {
      return null;
    }
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
