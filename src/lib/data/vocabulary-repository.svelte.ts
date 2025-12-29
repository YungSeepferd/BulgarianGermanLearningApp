import { browser } from '$app/environment';
import { EventBus } from '$lib/services/event-bus';
import { ErrorHandler } from '$lib/services/errors';
import { Debug } from '$lib/utils';
import { loadVocabulary } from './loader';
import type { UnifiedVocabularyItem } from '$lib/schemas/unified-vocabulary';

/**
 * VocabularyRepository
 * Single in-memory source of truth for vocabulary items.
 * SSR-safe: does not fetch/load on server, only on client.
 */
class VocabularyRepository {
  /** In-memory items collection */
  items = $state<UnifiedVocabularyItem[]>([]);
  /** Loaded flag */
  loaded = $state<boolean>(false);
  eventBus: EventBus | undefined;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus;
  }

  /** Load collection from built artifact (client-only) */
  async load(): Promise<void> {
    if (!browser) {
      // SSR: skip loading to avoid fetch/file reads
      return;
    }
    if (this.loaded && this.items.length > 0) return;
    try {
      Debug.log('VocabularyRepository', 'Loading vocabulary collection');
      const collection = await loadVocabulary(this.eventBus);
      this.items = collection.items;
      this.loaded = true;
      Debug.log('VocabularyRepository', 'Loaded items', { count: this.items.length });
    } catch (error) {
      ErrorHandler.handleError(error, 'VocabularyRepository.load');
      this.items = [];
      this.loaded = false;
    }
  }

  /** Invalidate and clear current cache */
  invalidate(): void {
    this.items = [];
    this.loaded = false;
    Debug.log('VocabularyRepository', 'Cache invalidated');
  }

  /** Get all items */
  getAll(): UnifiedVocabularyItem[] {
    return this.items;
  }

  /** Get item by id */
  getById(id: string): UnifiedVocabularyItem | undefined {
    return this.items.find(i => i.id === id);
  }

  /** Basic search by query (german, bulgarian, tags) */
  basicSearch(query: string): UnifiedVocabularyItem[] {
    const q = (query || '').toLowerCase();
    if (!q) return [];
    return this.items.filter(item =>
      item.german.toLowerCase().includes(q) ||
      item.bulgarian.toLowerCase().includes(q) ||
      (item.tags ?? []).some(tag => tag.toLowerCase().includes(q))
    );
  }
}

// Singleton repository
export const vocabularyRepository = new VocabularyRepository();
