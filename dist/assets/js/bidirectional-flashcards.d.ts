/**
 * Bidirectional Flashcard System
 * Integrates with existing language toggle to provide direction-aware flashcards
 */
type Direction = 'bg-de' | 'de-bg';
declare class BiDirectionalFlashcards {
    private currentDirection;
    constructor();
    init(): void;
    private bindLanguageToggle;
    private updateFlashcardDirection;
    private updateSingleFlashcard;
    private updateLanguageIndicators;
    private observeFlashcards;
    private readDirection;
    private normalizeDirection;
    setDirection(direction: Direction): void;
}
export default BiDirectionalFlashcards;
//# sourceMappingURL=bidirectional-flashcards.d.ts.map