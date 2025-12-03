import { vocabulary } from '$lib/data/vocabulary';
import type { VocabCard } from '$lib/schemas/voccard';

export class GameState {
	cards = $state<VocabCard[]>([]);
	currentCardIndex = $state(0);
	streak = $state(0);
	correctCount = $state(0);

	constructor() {
		this.cards = vocabulary;
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