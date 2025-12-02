interface GrammarItem {
    title: string;
    description: string;
    level: string;
    examples?: string[];
    notes_bg_to_de?: string;
    notes_de_to_bg?: string;
}
interface GrammarAppOptions {
    container?: string;
    data?: GrammarItem[];
}
interface LanguageToggle {
    getDirection(): string;
}
export {};
declare global {
    interface Window {
        languageToggle?: LanguageToggle;
        GrammarApp?: typeof GrammarApp;
    }
}
declare class GrammarApp {
    private container;
    private languageDirection;
    private data;
    private useServerRendering;
    private filteredData;
    private filters;
    constructor(options: GrammarAppOptions);
    init(): void;
    private getServerRenderedItems;
    private bindEvents;
    private applyFilters;
    private applyFiltersToDOM;
    private applyFiltersToData;
    private render;
    private renderGrammarItem;
    private buildNotesHtml;
    private toggleExamples;
    private startGrammarExercise;
    private toggleBookmark;
    private isBookmarked;
    private getBookmarks;
    private updateStats;
    private updateDirectionNotes;
    private clearAllFilters;
    private getLanguageDirection;
    private markdownToHtml;
    private slugify;
    private escapeHtml;
}
//# sourceMappingURL=grammar.d.ts.map