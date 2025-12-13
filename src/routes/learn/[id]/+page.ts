import type { PageLoad } from './$types';
import { vocabularyDb } from '$lib/data/db.svelte';

export const load: PageLoad = async ({ params }) => {
  await vocabularyDb.initialize();
  const all = vocabularyDb.getVocabulary();
  const item = all.find((x) => x.id === params.id) ?? null;
  return { item };
};
