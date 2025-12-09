import { loadVocabulary } from '$lib/data/loader';
export class GameState {
    constructor() {
        // cards = $state<VocabularyItem[]>([]);
        // currentCardIndex = $state(0);
        // streak = $state(0);
        // correctCount = $state(0);
        // loading = $state(true);
        // error = $state<string | null>(null);
        this.cards = [];
        this.currentCardIndex = 0;
        this.streak = 0;
        this.correctCount = 0;
        this.loading = true;
        this.error = null;
        this.currentCard = $derived(this.cards[this.currentCardIndex]);
        this.init();
    }
    async init() {
        try {
            this.loading = true;
            const collection = await loadVocabulary();
            this.cards = collection.items;
            this.loading = false;
        }
        catch (e) {
            console.error("Failed to load vocabulary:", e);
            this.error = "Failed to load vocabulary data.";
            this.loading = false;
        }
    }
    rateCard(isCorrect) {
        if (isCorrect) {
            this.streak++;
            this.correctCount++;
        }
        else {
            this.streak = 0;
        }
        this.nextCard();
    }
    nextCard() {
        if (this.currentCardIndex < this.cards.length - 1) {
            this.currentCardIndex++;
        }
        else {
            // Handle end of vocabulary list
            this.currentCardIndex = 0; // or show a summary screen
        }
    }
}
let instance;
export function getGameState() {
    if (!instance) {
        instance = new GameState();
    }
    return instance;
}
export const gameState = getGameState();
//# sourceMappingURL=game.svelte.js.map