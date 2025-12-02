/**
 * Vocabulary Adapter
 * Provides backward compatibility and data transformation for vocabulary systems
 * BUGFIX: Added defensive checks in transformForDirection to handle non-array data
 * UPDATE: Now uses modular vocabulary API for lazy loading
 */
import type { VocabularyItem } from './types.js';
interface TransformedVocabularyItem extends VocabularyItem {
    displayWord: string;
    displayTranslation: string;
    sourceLanguage: string;
    targetLanguage: string;
}
interface VocabularyFilters {
    level?: string;
    category?: string;
    search?: string;
}
declare class VocabularyAdapter {
    private vocabularyData;
    private enhancedData;
    private useModularAPI;
    constructor();
    init(): Promise<void>;
    loadData(): Promise<void>;
    getVocabularyData(): VocabularyItem[];
    getFilteredDataAsync(filters?: VocabularyFilters): Promise<VocabularyItem[]>;
    getVocabularyItem(id: string): VocabularyItem | undefined;
    transformForDirection(data: VocabularyItem[] | VocabularyItem, direction: string): TransformedVocabularyItem[];
    getItemsForDirection(direction: string): TransformedVocabularyItem[];
    getFilteredData(filters?: VocabularyFilters): VocabularyItem[];
    /**
     * Convert VocabularyEntry to VocabularyItem
     */
    private convertEntryToItem;
}
export { VocabularyAdapter, type TransformedVocabularyItem, type VocabularyFilters };
export { type VocabularyItem } from './types.js';
//# sourceMappingURL=vocabulary-adapter.d.ts.map