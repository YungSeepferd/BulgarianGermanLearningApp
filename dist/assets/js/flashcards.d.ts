/**
 * @file flashcards.ts
 * @description Core flashcard practice system with SM-2 spaced repetition integration
 * @status ACTIVE
 * @dependencies spaced-repetition.ts, language-toggle.ts, speech-recognition.ts
 * @used_by layouts/practice/single.html
 * @features
 *   - Flip animations with CSS transitions
 *   - Keyboard shortcuts (Space/Enter to flip, 0-5 to grade)
 *   - Progress tracking and session statistics
 *   - Bidirectional learning (Bulgarian↔German)
 *   - Speech recognition integration
 *   - localStorage persistence via bgde: prefix
 * @see docs/ARCHITECTURE.md for system design
 * @version 2.0.0
 * @updated October 2025
 */
import type { DueItemsStats, ReviewState, CardText, FlashcardVocabularyItem, LanguageDirection, FlashcardInstance } from './types.js';
export declare class Flashcards implements FlashcardInstance {
    private container;
    private vocabularyData;
    private sessionCards;
    private currentIndex;
    private currentCard;
    private isFlipped;
    private languageDirection;
    private sessionStats;
    private spacedRepetition;
    private category;
    private level;
    private limit;
    private mode;
    private shuffle;
    private stage;
    private flashcard;
    private wordText;
    private translationText;
    private wordMeta;
    private wordNotes;
    private reviewStats;
    private gradingControls;
    private sessionComplete;
    private loading;
    private error;
    private speechBtn;
    private speechFeedback;
    private progressFill;
    private sessionProgress;
    private sessionAccuracy;
    private pauseBtn;
    private endBtn;
    private retryBtn;
    private onGlobalKeydown;
    private onLanguageDirectionChanged;
    private globalKeyListenerAttached;
    private languageListenerAttached;
    private eventsBound;
    private speechPractice;
    private speechPracticeAvailable;
    private expectedSpeech;
    private isListening;
    private lastSpeechTone;
    constructor(container: HTMLElement);
    getCardNote(vocab: FlashcardVocabularyItem): string;
    init(): Promise<void>;
    readInlineVocabulary(): FlashcardVocabularyItem[] | null;
    bindEvents(): void;
    setupSpeechControls(): void;
    toggleSpeechPractice(): void;
    stopSpeechPractice(): void;
    resetSpeechPracticeForNextCard(): void;
    updateSpeechStatus(status: string): void;
    updateSpeechFeedback(message: string, tone?: string): void;
    handleSpeechResult(transcript: string): void;
    normalizeSpeechText(value: string): string;
    updateSpeechPrompt(): void;
    loadVocabulary(): Promise<void>;
    prepareSession(): Promise<void>;
    startSession(): void;
    showCard(index: number): void;
    updateCardContent(): void;
    getCardText(vocab: FlashcardVocabularyItem): CardText;
    renderCurrentCard(): void;
    updateReviewStats(stats: DueItemsStats): void;
    handleCardClick(): void;
    handleCardKeyboard(e: KeyboardEvent): void;
    handleLanguageDirectionChange(e: CustomEvent<{
        direction: LanguageDirection;
    }>): void;
    handleGlobalKeyboard(e: KeyboardEvent): void;
    flipCard(): void;
    handleGrade(grade: number): void;
    showGradeFeedback(grade: number, reviewState: ReviewState): void;
    formatNextReview(dateString: string): string;
    updateProgress(): void;
    pauseSession(): void;
    endSession(): void;
    completeSession(): void;
    /**
     * Cleanup method to remove event listeners
     * Prevents keyboard event persistence issues (P1 bug fix)
     */
    cleanup(): void;
    showSessionComplete(): void;
    startNewSession(): void;
    reviewMistakes(): void;
    backToVocabulary(): void;
    showLoading(show: boolean): void;
    showError(show: boolean, message?: string): void;
    generateWordId(word: string): string;
    shuffleArray<T>(array: T[]): T[];
    announceToScreenReader(message: string): void;
}
export default Flashcards;
//# sourceMappingURL=flashcards.d.ts.map