import { browser } from '$app/environment';
import { db } from '$lib/data/db.svelte';
import * as dataLoader from '$lib/data/loader';
import { LocalStorageManager } from '$lib/utils/localStorage';
export class AppState {
    constructor() {
        // Replaces currentDirection with languageMode
        // languageMode = $state<LanguageMode>('DE_BG');
        this.languageMode = 'DE_BG';
        // UI State
        // searchQuery = $state('');
        // currentItem = $state<VocabularyItem | null>(null);
        // showAnswer = $state(false);
        // practiceMode = $state(false);
        // isLoading = $state(false);
        // error = $state<string | null>(null);
        this.searchQuery = '';
        this.currentItem = null;
        this.showAnswer = false;
        this.practiceMode = false;
        this.isLoading = false;
        this.error = null;
        // Enhanced state for progress tracking
        // practiceStats = $state<Map<string, { correct: number; incorrect: number; lastPracticed: string }>>(new Map());
        // recentSearches = $state<string[]>([]);
        // favorites = $state<string[]>([]);
        this.practiceStats = new Map();
        this.recentSearches = [];
        this.favorites = [];
        // Derived state
        this.filteredItems = $derived.by(() => {
            if (!this.searchQuery)
                return db.items;
            const q = this.searchQuery.toLowerCase();
            return db.items.filter((item) => item.german.toLowerCase().includes(q) ||
                item.bulgarian.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.tags.some(tag => tag.toLowerCase().includes(q)));
        });
        this.displayDirection = $derived(this.languageMode === 'DE_BG' ? 'German → Bulgarian' : 'Bulgarian → German');
        // Enhanced derived state for practice recommendations
        this.practiceRecommendations = $derived.by(() => {
            return db.items
                .filter(item => {
                const stats = this.practiceStats.get(item.id);
                if (!stats)
                    return true; // Include new items
                // Prioritize items that need more practice
                const totalAttempts = stats.correct + stats.incorrect;
                const successRate = totalAttempts > 0 ? stats.correct / totalAttempts : 0;
                // Include items with low success rate or few attempts
                return successRate < 0.8 || totalAttempts < 3;
            })
                .slice(0, 10); // Limit to top 10 recommendations
        });
    }
    toggleLanguageMode() {
        this.languageMode = this.languageMode === 'DE_BG' ? 'BG_DE' : 'DE_BG';
        // Automatic syncing is now handled by $effect
    }
    // Legacy support alias for compatibility
    toggleDirection() {
        this.toggleLanguageMode();
    }
    setSearchQuery(query) {
        this.searchQuery = query;
        // Add to recent searches if not empty and not already in list
        if (query.trim() && !this.recentSearches.includes(query)) {
            this.recentSearches = [query, ...this.recentSearches.slice(0, 9)]; // Keep last 10
            this.saveProgress();
        }
    }
    setCurrentItem(item) {
        this.currentItem = item;
        this.showAnswer = false;
    }
    togglePracticeMode() {
        this.practiceMode = !this.practiceMode;
        if (!this.practiceMode) {
            this.setCurrentItem(null);
        }
    }
    /**
     * Enhanced practice session management for "Practice This" quick actions
     * This method provides a seamless way to start practicing a specific item
     */
    startPracticeSession(item) {
        // Set up the practice session
        this.practiceMode = true;
        this.setCurrentItem(item);
        this.showAnswer = false;
        // Clear any existing search query to focus on practice
        this.searchQuery = '';
        // Track session start for analytics
        // Analytics tracking is now handled by the gamification system
        // Optionally, you could add session tracking here
        // this.trackSessionStart(item);
    }
    toggleShowAnswer() {
        this.showAnswer = !this.showAnswer;
    }
    setError(error) {
        this.error = error;
    }
    // Enhanced progress tracking
    async recordPracticeResult(itemId, correct, responseTime) {
        try {
            await dataLoader.updateStats(itemId, correct, responseTime);
            // Update local stats
            const current = this.practiceStats.get(itemId) || { correct: 0, incorrect: 0, lastPracticed: '' };
            if (correct) {
                current.correct++;
            }
            else {
                current.incorrect++;
            }
            current.lastPracticed = new Date().toISOString();
            // Create a new Map to trigger reactivity with Svelte 5 Runes
            const newStats = new Map(this.practiceStats);
            newStats.set(itemId, current);
            this.practiceStats = newStats;
            this.saveProgress();
        }
        catch (_error) {
            // Silently fail if recording practice result fails
            // Error recording practice result
        }
    }
    toggleFavorite(itemId) {
        const index = this.favorites.indexOf(itemId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        }
        else {
            this.favorites.push(itemId);
        }
        this.saveProgress();
    }
    isFavorite(itemId) {
        return this.favorites.includes(itemId);
    }
    // Enhanced localStorage integration
    saveProgress() {
        if (!browser)
            return;
        try {
            LocalStorageManager.saveUserProgress({
                stats: this.practiceStats,
                favorites: this.favorites,
                recentSearches: this.recentSearches
            });
        }
        catch (_error) {
            // Silently fail if saving progress fails
        }
    }
    loadProgress() {
        if (!browser)
            return;
        try {
            const progress = LocalStorageManager.loadUserProgress();
            if (progress) {
                this.practiceStats = progress.stats;
                this.favorites = progress.favorites;
                this.recentSearches = progress.recentSearches;
            }
        }
        catch (_error) {
            // Silently fail if loading progress fails
        }
    }
    init() {
        if (browser) {
            try {
                // Load initial language mode
                const saved = localStorage.getItem('app-language-mode');
                const oldSaved = localStorage.getItem('tandem-direction');
                if (saved === 'DE_BG' || saved === 'BG_DE') {
                    this.languageMode = saved;
                }
                else if (oldSaved === 'DE->BG') {
                    this.languageMode = 'DE_BG';
                }
                else if (oldSaved === 'BG->DE') {
                    this.languageMode = 'BG_DE';
                }
                // Load user progress
                this.loadProgress();
                // Set up automatic syncing with $effect
                $effect.root(() => {
                    if (browser) {
                        try {
                            localStorage.setItem('app-language-mode', this.languageMode);
                        }
                        catch (_error) {
                            // Silently fail if saving language mode fails
                        }
                    }
                });
                // Set up progress auto-save
                $effect.root(() => {
                    // Auto-save when stats, favorites, or recent searches change
                    this.saveProgress();
                });
            }
            catch (_error) {
                // Silently fail if initializing state fails
            }
        }
    }
    // Utility methods for enhanced functionality
    clearAllData() {
        this.practiceStats.clear();
        this.favorites = [];
        this.recentSearches = [];
        this.saveProgress();
        // Clear vocabulary cache
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('vocabulary-cache');
        }
    }
    exportData() {
        return LocalStorageManager.exportUserData();
    }
    importData(jsonData) {
        try {
            LocalStorageManager.importUserData(jsonData);
            this.loadProgress();
        }
        catch (_error) {
            throw new Error('Failed to import data');
        }
    }
}
export const appState = new AppState();
appState.init();
//# sourceMappingURL=app.svelte.js.map