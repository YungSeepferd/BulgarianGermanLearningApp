/**
 * @file unified-practice-session.ts
 * @description Consolidated practice session with bidirectional support
 * @status ACTIVE
 * @replaces enhanced-practice-session.js, practice.js
 * @dependencies unified-spaced-repetition.ts (loaded globally)
 * @features
 *   - Direction-aware flashcards (respects language toggle)
 *   - Directional notes (notes_bg_to_de, notes_de_to_bg)
 *   - Keyboard shortcuts (Space/Enter flip, 1-5 grade)
 *   - Session statistics and progress tracking
 *   - Unified SM-2 integration with automatic migration
 * @version 2.0.1
 * @updated October 2025
 */
interface SessionStats {
    correct: number;
    total: number;
    startTime: number;
    mistakes: Array<{
        id: string;
        word: string;
        translation: string;
    }>;
}
interface PracticeSessionOptions {
    sessionLength?: number;
    enableAudio?: boolean;
}
declare class UnifiedPracticeSession {
    private vocabularyData;
    private sessionCards;
    private currentIndex;
    private currentCard;
    private isFlipped;
    private currentDirection;
    private sessionStats;
    private sessionLength;
    private enableAudio;
    private spacedRepetition;
    constructor(options?: PracticeSessionOptions);
    private init;
    private loadData;
    private getLanguageDirection;
    private normalizeDirection;
    private bindEvents;
    private startSession;
    private prepareSessionCards;
    private shuffleArray;
    private showCurrentCard;
    private updateCurrentCard;
    private updateHints;
    private updateProgress;
    private updateUI;
    private showAnswer;
    private playAudio;
    private gradeCard;
    private completeSession;
    private updateFinalStats;
    private saveSessionHistory;
    private showError;
    private showNoItemsState;
    private hideScreen;
    private showScreen;
}
export { UnifiedPracticeSession, type SessionStats, type PracticeSessionOptions };
export { type VocabularyItem } from './types.js';
//# sourceMappingURL=unified-practice-session.d.ts.map