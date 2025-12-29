import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { vocabularyDb } from '$lib/data/db.svelte';

// Disable SSR to avoid vocabulary loading issues
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
  try {
    await vocabularyDb.initialize();
    const items = vocabularyDb.getVocabulary();
    const item = items.find((i) => i.id === params.id);

    if (!item) {
      throw error(404, 'Word not found');
    }

    return {
      item,
      allItems: items
    };
  } catch (err) {
    console.error('Error loading vocabulary detail:', err);
    throw error(500, 'Failed to load word details');
  }
};
