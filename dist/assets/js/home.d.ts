import type { VocabularyItem } from './types';
interface ProgressTracker {
    getDueItems(vocabulary: VocabularyItem[]): VocabularyItem[];
    getStats(): {
        streak: number;
    };
    data: {
        vocabulary: Record<string, unknown>;
    };
}
declare global {
    interface Window {
        progressTracker?: ProgressTracker;
        HomeApp: typeof HomeApp;
    }
}
declare class HomeApp {
    private vocabulary;
    constructor(options: {
        vocabulary?: VocabularyItem[];
    });
    init(): void;
    bindEvents(): void;
    updateActivityCards(): void;
    updateDueItemsCard(): void;
    updateNewItemsCard(): void;
    updateStreakCard(): void;
}
export {};
//# sourceMappingURL=home.d.ts.map