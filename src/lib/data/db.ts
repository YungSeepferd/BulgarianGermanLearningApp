import { browser } from '$app/environment';
import { $state } from 'svelte';
import type { VocabularyItem } from '$lib/types/vocabulary';

export class VocabularyDB {
    items = $state<VocabularyItem[]>([]);
    initialized = $state(false);

    constructor() {
        if (browser) {
            this.loadInitialData();
        }
    }

    async loadInitialData() {
        try {
            // In a real application, this would fetch from an API or database
            // For now, we rely on the static JSON file we created
            // We use a dynamic import to load the JSON data
            const module = await import('./vocabulary.json');
            // Check if the module has a default export (typical for JSON imports)
            // or if it returns the array directly
            const data = (module.default || module) as VocabularyItem[];
    
            this.items = data;
            this.initialized = true;
            // console.log('📚 VocabularyDB initialized with', this.items.length, 'items');
        } catch (_e) {
            // Silently fail if loading vocabulary fails
        }
    }

    add(item: VocabularyItem) {
        this.items.push(item);
    }

    update(id: string, updates: Partial<VocabularyItem>) {
        const index = this.items.findIndex(i => i.id === id);
        if (index !== -1) {
            const current = this.items[index];
            this.items[index] = { ...current, ...updates } as VocabularyItem;
        }
    }

    get(id: string): VocabularyItem | undefined {
        return this.items.find(i => i.id === id);
    }
}

export const db = new VocabularyDB();