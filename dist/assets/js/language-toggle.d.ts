/**
 * @file language-toggle.ts
 * @description Bidirectional language learning direction controller
 * @status ACTIVE
 * @dependencies None (pure implementation)
 * @used_by flashcards.ts, vocab-cards.ts, enhanced-*.ts modules, layouts/partials/language-toggle.html
 * @features
 *   - Toggle between BG→DE and DE→BG learning directions
 *   - localStorage persistence (bgde:language-direction)
 *   - Event-based notifications for direction changes
 *   - Cultural context adaptation based on native language
 *   - Difficulty multipliers for SM-2 (BG→DE: 1.2x, DE→BG: 1.1x)
 * @see docs/BIDIRECTIONAL_IMPLEMENTATION_PLAN.md for design
 * @version 2.0.0
 * @updated October 2025
 */
interface LanguageLabels {
    source: {
        code: string;
        name: string;
        flag: string;
    };
    target: {
        code: string;
        name: string;
        flag: string;
    };
    sourceField: string;
    targetField: string;
}
interface GradeConfig {
    label: string;
    desc: string;
}
interface UITexts {
    loading: string;
    error: string;
    retry: string;
    noCards: string;
    categories: string;
    levels: string;
    shuffle: string;
    flip: string;
    grade: string;
    gradeHelp: string;
    grades: Record<number, GradeConfig>;
    sessionComplete: string;
    newSession: string;
    backToVocab: string;
}
declare const DIRECTION: {
    readonly BG_TO_DE: "bg-de";
    readonly DE_TO_BG: "de-bg";
};
declare class LanguageToggle {
    private storageKey;
    private legacyStorageKey;
    private toggleButton;
    private currentDirection;
    constructor();
    private init;
    private createToggleButton;
    private updateToggleButton;
    private bindEvents;
    private toggleDirection;
    private setDirection;
    private applyDirection;
    private updateMetaDescription;
    private broadcastDirectionChange;
    private announceDirectionChange;
    getDirection(): string;
    isGermanBase(): boolean;
    isBulgarianBase(): boolean;
    getSourceLanguage(): string;
    getTargetLanguage(): string;
    getLanguageLabels(): LanguageLabels;
    getUITexts(): UITexts;
    private loadDirection;
    private migrateLegacyDirection;
    private normalizeDirection;
    private saveDirection;
    private announceToScreenReader;
    showToastNotification(message: any): void;
}
declare let languageToggle: any;
export { languageToggle, LanguageToggle, DIRECTION };
export default languageToggle;
//# sourceMappingURL=language-toggle.d.ts.map