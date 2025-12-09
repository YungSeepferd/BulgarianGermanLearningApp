import type { VocabularyItem } from '$lib/schemas/vocabulary';
export declare class GameState {
    cards: VocabularyItem[];
    currentCardIndex: number;
    streak: number;
    correctCount: number;
    loading: boolean;
    error: string | null;
    constructor();
    init(): Promise<void>;
    currentCard: any;
    rateCard(isCorrect: boolean): void;
    nextCard(): void;
}
export declare function getGameState(): GameState;
export declare const gameState: GameState;
//# sourceMappingURL=game.svelte.d.ts.map