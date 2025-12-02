import { browser } from '$app/environment';
import { $state, $derived } from 'svelte';
import { db } from '$lib/data/db';
import type { VocabularyItem } from '$lib/types/vocabulary';

export type LanguageMode = 'DE_BG' | 'BG_DE';

export class AppState {
    // Replaces currentDirection with languageMode
    languageMode = $state<LanguageMode>('DE_BG');
    
    // UI State
    searchQuery = $state('');
    currentItem = $state<VocabularyItem | null>(null);
    showAnswer = $state(false);
    practiceMode = $state(false);
    isLoading = $state(false);
    error = $state<string | null>(null);

    // Derived state
    filteredItems = $derived.by(() => {
        if (!this.searchQuery) return db.items;
        const q = this.searchQuery.toLowerCase();
        return db.items.filter(item => 
            item.german.toLowerCase().includes(q) || 
            item.bulgarian.toLowerCase().includes(q)
        );
    });

    displayDirection = $derived(
        this.languageMode === 'DE_BG' ? 'German → Bulgarian' : 'Bulgarian → German'
    );

    toggleLanguageMode() {
        this.languageMode = this.languageMode === 'DE_BG' ? 'BG_DE' : 'DE_BG';
        if (browser) {
            try {
                localStorage.setItem('app-language-mode', this.languageMode);
            } catch (_error) {
                // Silently fail if saving language mode fails
            }
        }
    }
    
    // Legacy support alias for compatibility
    toggleDirection() {
        this.toggleLanguageMode();
    }

    setSearchQuery(query: string) {
        this.searchQuery = query;
    }

    setCurrentItem(item: VocabularyItem | null) {
        this.currentItem = item;
        this.showAnswer = false;
    }
    
    togglePracticeMode() {
        this.practiceMode = !this.practiceMode;
        if (!this.practiceMode) {
            this.setCurrentItem(null);
        }
    }
    
    toggleShowAnswer() {
        this.showAnswer = !this.showAnswer;
    }

    setError(error: string | null) {
        this.error = error;
    }

    init() {
        if (browser) {
            try {
                const saved = localStorage.getItem('app-language-mode');
                // Check for new key first, then fallback to old key 'tandem-direction'
                const oldSaved = localStorage.getItem('tandem-direction');
    
                if (saved === 'DE_BG' || saved === 'BG_DE') {
                    this.languageMode = saved as LanguageMode;
                } else if (oldSaved === 'DE->BG') {
                    this.languageMode = 'DE_BG';
                } else if (oldSaved === 'BG->DE') {
                    this.languageMode = 'BG_DE';
                }
            } catch (_error) {
                // Silently fail if initializing state fails
            }
        }
    }
}

export const appState = new AppState();
appState.init();