/**
 * Test fixtures for vocabulary items with declension, links, and composition
 * Used to verify schema validation, German normalization, and UI rendering
 */

import type { VocabularyItem } from '$lib/types/vocabulary';

/**
 * Example noun with full declension and dictionary links
 * Activates: declension table + links rendering in Flashcard
 */
export const nounWithDeclension: VocabularyItem = {
  id: 'schule_001',
  german: 'die Schule',
  bulgarian: 'училище',
  partOfSpeech: 'noun',
  difficulty: 2,
  categories: ['education'],
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    gender: 'feminine',
    article: 'die',
    pluralForm: 'Schulen',
    declension: {
      Nominative: { singular: 'die Schule', plural: 'die Schulen' },
      Accusative: { singular: 'die Schule', plural: 'die Schulen' },
      Dative: { singular: 'der Schule', plural: 'den Schulen' },
      Genitive: { singular: 'der Schule', plural: 'der Schulen' }
    },
    links: [
      { label: 'DWDS', url: 'https://www.dwds.de/wb/Schule' },
      { label: 'Duden', url: 'https://www.duden.de/rechtschreibung/Schule' }
    ],
    examples: [
      {
        german: 'Ich gehe zur Schule.',
        bulgarian: 'Отивам в училище.',
        context: 'everyday'
      }
    ]
  }
};

/**
 * Compound word with literal breakdown and cultural context
 * Activates: composition display + cultural note in Flashcard
 */
export const compoundWordWithBreakdown: VocabularyItem = {
  id: 'zusammen_001',
  german: 'zusammen',
  bulgarian: 'заедно',
  partOfSpeech: 'adverb',
  difficulty: 2,
  categories: ['common_phrases'],
  createdAt: new Date(),
  updatedAt: new Date(),
  literalBreakdown: [
    { segment: 'za', literal: 'für', grammarTag: 'prep' },
    { segment: 'edino', literal: 'eins', grammarTag: 'num' }
  ],
  contextualNuance: 'Emphasizes togetherness and joint action.',
  metadata: {
    culturalNote: 'Булгарский язык ценит концепцию единства и сообщества.',
    components: [
      { part: 'за', meaning: 'für', note: 'preposition' },
      { part: 'едно', meaning: 'eins', note: 'number' }
    ],
    examples: [
      {
        german: 'Wir lernen zusammen.',
        bulgarian: 'Ние учим заедно.',
        context: 'neutral'
      },
      {
        german: 'Gemeinsam sind wir stark.',
        bulgarian: 'Заедно сме силни.',
        context: 'idiom'
      }
    ]
  }
};

/**
 * Simple word with German article normalization required
 * Tests: formatGermanTerm helper strips/normalizes articles
 */
export const wordNeedingNormalization: VocabularyItem = {
  id: 'apple_001',
  german: 'der apfel', // lowercase, needs capitalization
  bulgarian: 'ябълка',
  partOfSpeech: 'noun',
  difficulty: 1,
  categories: ['food'],
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    gender: 'masculine',
    article: 'der'
  }
};

/**
 * Verb without explicit article (should not add one)
 */
export const verbWithoutArticle: VocabularyItem = {
  id: 'lesen_001',
  german: 'lesen',
  bulgarian: 'чета',
  partOfSpeech: 'verb',
  difficulty: 2,
  categories: ['verbs'],
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Adjective without explicit article (should not add one)
 */
export const adjectiveWithoutArticle: VocabularyItem = {
  id: 'groß_001',
  german: 'groß',
  bulgarian: 'голям',
  partOfSpeech: 'adjective',
  difficulty: 2,
  categories: ['adjectives'],
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Word with only links, no declension
 * Tests: links render independently of declension
 */
export const wordWithOnlyLinks: VocabularyItem = {
  id: 'beispiel_001',
  german: 'das Beispiel',
  bulgarian: 'пример',
  partOfSpeech: 'noun',
  difficulty: 2,
  categories: ['grammar'],
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    gender: 'neuter',
    article: 'das',
    links: [
      { label: 'Wiktionary', url: 'https://en.wiktionary.org/wiki/Beispiel' }
    ]
  }
};

/**
 * Full featured item: noun with all optional fields
 * Tests: schema accepts and preserves all new fields
 */
export const fullyFeaturedNoun: VocabularyItem = {
  id: 'fenster_001',
  german: 'das Fenster',
  bulgarian: 'прозорец',
  partOfSpeech: 'noun',
  difficulty: 1,
  categories: ['house'],
  emoji: '🪟',
  literalBreakdown: [],
  contextualNuance: 'Transparent opening in a wall.',
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    gender: 'neuter',
    article: 'das',
    pluralForm: 'Fenster',
    declension: {
      Nominative: { singular: 'das Fenster', plural: 'die Fenster' },
      Accusative: { singular: 'das Fenster', plural: 'die Fenster' },
      Dative: { singular: 'dem Fenster', plural: 'den Fenstern' },
      Genitive: { singular: 'des Fensters', plural: 'der Fenster' }
    },
    links: [
      { label: 'DWDS', url: 'https://www.dwds.de/wb/Fenster' },
      { label: 'Duden', url: 'https://www.duden.de/rechtschreibung/Fenster' }
    ],
    culturalNote: 'German homes often feature large windows for natural light.',
    examples: [
      {
        german: 'Das Fenster ist offen.',
        bulgarian: 'Прозорецът е отворен.',
        context: 'statement'
      }
    ],
    synonyms: ['Fensterscheibe'],
    mnemonic: 'Fenster sounds like "windows"'
  }
};

/**
 * Collection of all test fixtures for easy bulk import
 */
export const vocabularyTestFixtures = {
  nounWithDeclension,
  compoundWordWithBreakdown,
  wordNeedingNormalization,
  verbWithoutArticle,
  adjectiveWithoutArticle,
  wordWithOnlyLinks,
  fullyFeaturedNoun
};
