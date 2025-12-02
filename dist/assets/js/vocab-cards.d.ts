/**
 * @file vocab-cards.ts
 * @description Interactive vocabulary card display system
 * @status ACTIVE
 * @dependencies language-toggle.ts
 * @used_by layouts/_shortcodes/vocab.html, layouts/vocabulary/list.html
 * @features
 *   - Category and CEFR level filtering
 *   - Text search with debouncing
 *   - Card flip animations
 *   - Bidirectional display (Bulgarian↔German)
 *   - Accessibility (keyboard navigation, ARIA)
 * @see docs/ARCHITECTURE.md for system design
 * @version 1.0.0
 * @updated October 2025
 */
export declare class VocabCards {
    private container;
    private vocabularyData;
    private filteredData;
    private currentCategory;
    private currentLevel;
    private limit;
    private interactive;
    private languageDirection;
    private grid;
    private loading;
    private error;
    private cardCount;
    private categoryFilter;
    private levelFilter;
    private shuffleBtn;
    private retryBtn;
    private onLanguageDirectionChanged;
    private languageListenerAttached;
    constructor(container: HTMLElement);
    init(): Promise<void>;
    private bindEvents;
    private loadVocabulary;
    private readInlineVocabulary;
    private populateFilters;
    private applyInitialFilters;
    private handleFilterChange;
    private shuffleCards;
    private shuffleArray;
    private renderCards;
    private createCard;
    private buildNotesHtml;
    /**
     * Get language-direction-specific content from vocabulary item
     * @param vocab - Vocabulary item
     * @param fieldName - Base field name (e.g., 'notes', 'etymology')
     * @returns Content in appropriate language
     */
    private getDirectionSpecificContent;
    private getCardText;
    private flipCard;
    private renderEmptyState;
    private updateCardCount;
    private handleKeyboardNavigation;
    private showLoading;
    private showError;
    private escapeHtml;
    private handleLanguageDirectionChange;
    private announceToScreenReader;
    /**
     * Cleanup method to remove event listeners
     * Prevents event listener accumulation (P1 bug fix)
     */
    cleanup(): void;
}
export default VocabCards;
//# sourceMappingURL=vocab-cards.d.ts.map