import { loadVocabulary } from '$lib/data/loader';
import type { VocabularyItem } from '$lib/schemas/vocabulary';

export class GameState {
	// cards = $state<VocabularyItem[]>([]);
	// currentCardIndex = $state(0);
	// streak = $state(0);
	// correctCount = $state(0);
	// loading = $state(true);
	// error = $state<string | null>(null);
	cards: VocabularyItem[] = [];
	currentCardIndex = 0;
	streak = 0;
	correctCount = 0;
	loading = true;
	error: string | null = null;

	constructor() {
		this.init();
	}

	async init() {
		try {
			this.loading = true;
			const collection = await loadVocabulary();
			this.cards = collection.items;
			this.loading = false;
		} catch (e) {
			console.error("Failed to load vocabulary:", e);
			this.error = "Failed to load vocabulary data.";
			this.loading = false;
		}
	}

	currentCard = $derived(this.cards[this.currentCardIndex]);

	rateCard(isCorrect: boolean) {
		if (isCorrect) {
			this.streak++;
			this.correctCount++;
		} else {
			this.streak = 0;
		}
		this.nextCard();
	}

	nextCard() {
		if (this.currentCardIndex < this.cards.length - 1) {
			this.currentCardIndex++;
		} else {
			// Handle end of vocabulary list
			this.currentCardIndex = 0; // or show a summary screen
		}
	}
}

let instance: GameState;

export function getGameState() {
	if (!instance) {
		instance = new GameState();
	}
	return instance;
}

export const gameState = getGameState();