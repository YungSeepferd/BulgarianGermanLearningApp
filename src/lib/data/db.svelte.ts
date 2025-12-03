import { browser } from '$app/environment';
import type { VocabularyItem } from '$lib/types/vocabulary';
import { dataLoader } from '$lib/data/loader.js';

export class VocabularyDB {
    items = $state<VocabularyItem[]>([]);
    initialized = $state(false);

    constructor() {
        // Don't load data in constructor to prevent SSR fetch calls
        // Data loading will be triggered explicitly when needed
    }

    async initialize() {
        if (browser && !this.initialized) {
            await this.loadInitialData();
        }
    }

    async loadInitialData() {
        try {
            // Use the DataLoader which now includes Zod validation
            const data = await dataLoader.loadVocabulary();
    
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
        const index = this.items.findIndex((i: VocabularyItem) => i.id === id);
        if (index !== -1) {
            const current = this.items[index];
            this.items[index] = { ...current, ...updates } as VocabularyItem;
        }
    }

    get(id: string): VocabularyItem | undefined {
        return this.items.find((i: VocabularyItem) => i.id === id);
    }
}

export const db = new VocabularyDB();