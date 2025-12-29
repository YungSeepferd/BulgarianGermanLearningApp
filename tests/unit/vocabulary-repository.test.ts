import { describe, it, expect } from 'vitest';
import { vocabularyRepository } from '$lib/data/vocabulary-repository.svelte';

// SSR-safety: ensure load() doesn't throw and accessors remain safe on server
// Vitest runs in a jsdom environment; treat as SSR for repository semantics

describe('VocabularyRepository SSR safety', () => {
  it('load() resolves safely on server and accessors work', async () => {
    const initialAll = vocabularyRepository.getAll();
    expect(Array.isArray(initialAll)).toBe(true);

    await expect(vocabularyRepository.load()).resolves.toBeUndefined();

    const afterAll = vocabularyRepository.getAll();
    expect(Array.isArray(afterAll)).toBe(true);
  });
});
