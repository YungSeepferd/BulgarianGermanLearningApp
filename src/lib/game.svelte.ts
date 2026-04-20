import { loadVocabulary } from '$lib/data/loader';
import type { UnifiedVocabularyItem } from '$lib/schemas/unified-vocabulary';
import { logger } from '$lib/services/logger';

export class GameState {
	// cards = $state<VocabularyItem[]>([]);
	// currentCardIndex = $state(0);
	// streak = $state(0);
	// correctCount = $state(0);
	// loading = $state(true);
	// error = $state<string | null>(null);
	cards: UnifiedVocabularyItem[] = [];
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
			logger.debug('GameState', 'Loading vocabulary...');
			const collection = await loadVocabulary();
			logger.debug('GameState', 'Vocabulary loaded', { itemCount: collection.items.length });
			// The items are already of type UnifiedVocabularyItem
			this.cards = collection.items;
			logger.info('GameState', `Loaded ${this.cards.length} vocabulary items`);
			this.loading = false;
		} catch (_error) {
		    // Error loading vocabulary
		    this.error = "Failed to load vocabulary data.";
		    this.loading = false;
		}
	}

	currentCard = $derived(this.cards[this.currentCardIndex] as UnifiedVocabularyItem);

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