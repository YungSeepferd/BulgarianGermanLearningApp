import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

// Mock matchMedia for components that use it (e.g., responsive logic)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock fetch if not available in environment
if (!global.fetch) {
  global.fetch = vi.fn();
}

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
// Mock Web Animations API
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = vi.fn().mockImplementation(() => {
    return {
      onfinish: null,
      cancel: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      reverse: vi.fn(),
      finish: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
  });
}

// Mock vocabulary data for tests
const mockVocabularyData = [
  {
    id: 'test_001',
    german: 'Hallo',
    bulgarian: 'Здравей',
    partOfSpeech: 'noun',
    difficulty: 1,
    categories: ['Greetings'],
    metadata: {
      examples: [
        { german: 'Hallo, wie geht es dir?', bulgarian: 'Здравей, как си?' }
      ]
    }
  },
  {
    id: 'test_002',
    german: 'Danke',
    bulgarian: 'Благодаря',
    partOfSpeech: 'noun',
    difficulty: 1,
    categories: ['Greetings'],
    metadata: {
      examples: [
        { german: 'Danke schön!', bulgarian: 'Много благодаря!' }
      ]
    }
  }
];

// Mock the data loader module
vi.mock('$lib/data/loader', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    loadVocabulary: vi.fn().mockResolvedValue({
      id: 'mock-collection',
      name: 'Mock Vocabulary Collection',
      description: 'Mock vocabulary data for testing',
      items: mockVocabularyData,
      languagePair: 'de-bg',
      difficultyRange: [1, 5],
      categories: ['Greetings'],
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    loadVocabularyById: vi.fn().mockImplementation((id) => {
      return Promise.resolve(mockVocabularyData.find(item => item.id === id) || null);
    }),
    loadVocabularyBySearch: vi.fn().mockImplementation((params) => {
      let items = [...mockVocabularyData];

      if (params.query) {
        const query = params.query.toLowerCase();
        items = items.filter(item =>
          item.german.toLowerCase().includes(query) ||
          item.bulgarian.toLowerCase().includes(query)
        );
      }

      if (params.partOfSpeech) {
        items = items.filter(item => item.partOfSpeech === params.partOfSpeech);
      }

      if (params.difficulty) {
        items = items.filter(item => item.difficulty === params.difficulty);
      }

      if (params.categories && params.categories.length > 0) {
        items = items.filter(item =>
          item.categories.some(category => params.categories.includes(category))
        );
      }

      return Promise.resolve({
        items,
        total: items.length,
        hasMore: false
      });
    }),
    loadVocabularyByCategory: vi.fn().mockImplementation((category) => {
      return Promise.resolve(mockVocabularyData.filter(item => item.categories.includes(category)));
    }),
    loadVocabularyByDifficulty: vi.fn().mockImplementation((difficulty) => {
      return Promise.resolve(mockVocabularyData.filter(item => item.difficulty === difficulty));
    }),
    getRandomVocabulary: vi.fn().mockImplementation((count = 5) => {
      const shuffled = [...mockVocabularyData].sort(() => 0.5 - Math.random());
      return Promise.resolve(shuffled.slice(0, Math.min(count, shuffled.length)));
    })
  };
});

// Mock LocalizationService to avoid fetch calls and noisy logs in tests
vi.mock('$lib/services/localization.ts', async () => {
  const listeners: Array<(lang: string) => void> = [];
  let currentLanguage = 'de';
  const translations: Record<string, Record<string, string>> = {
    de: {
      'practice.loading_vocabulary': 'Vokabular wird geladen…',
      'practice.tandem_learning': 'Tandem Lernen',
      'practice.check_answer': 'Antwort prüfen',
      'practice.type_answer_placeholder': 'Antwort eingeben…',
      'practice.practice_word': 'Übe Wort',
      'practice.category': 'Kategorie',
      'practice.recommended_for_practice': 'Empfohlen zum Üben',
      'practice.correct': 'Richtig',
      'practice.streak': 'Serie',
      'practice.accuracy': 'Genauigkeit',
      'practice.avg_time': 'Durchschnittszeit',
      'practice.response_time': 'Reaktionszeit',
      'practice.next_word': 'Nächstes Wort',
      'practice.correct_answer': 'Korrekte Antwort',
      'practice.favorite': 'Favorit',
      'languages.german': 'Deutsch',
      'languages.bulgarian': 'Bulgarisch',
      'common.milliseconds': 'Millisekunden'
    },
    bg: {
      'practice.loading_vocabulary': 'Зареждане на речник…',
      'practice.tandem_learning': 'Тандем обучение',
      'practice.check_answer': 'Провери отговор',
      'practice.type_answer_placeholder': 'Въведете отговор…',
      'practice.practice_word': 'Учи дума',
      'practice.category': 'Категория',
      'practice.recommended_for_practice': 'Препоръчано за упражнение',
      'practice.correct': 'Вярно',
      'practice.streak': 'Поредица',
      'practice.accuracy': 'Точност',
      'practice.avg_time': 'Средно време',
      'practice.response_time': 'Време за реакция',
      'practice.next_word': 'Следваща дума',
      'practice.correct_answer': 'Правилен отговор',
      'practice.favorite': 'Любима',
      'languages.german': 'Немски',
      'languages.bulgarian': 'Български',
      'common.milliseconds': 'милисекунди'
    }
  };

  const LocalizationService = {
    async init() {
      return true;
    },
    async setLanguage(lang: 'de' | 'bg') {
      currentLanguage = lang;
      listeners.forEach((cb) => cb(currentLanguage));
    },
    getCurrentLanguage() {
      return currentLanguage;
    },
    t(key: string) {
      const table = translations[currentLanguage] || {};
      return table[key] ?? key;
    },
    onLanguageChange(cb: (lang: string) => void) {
      listeners.push(cb);
      return () => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
    offLanguageChange(cb: (lang: string) => void) {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    }
  };

  return { LocalizationService };
});

// Mock LearningSession used by DI container
vi.mock('$lib/state/session.svelte', async () => {
  class LearningSession {
    constructor() {}
    start() { /* noop */ }
    stop() { /* noop */ }
  }
  return { LearningSession };
});

// Mock LessonGenerationEngine to prevent constructor errors
vi.mock('$lib/services/lesson-generation/lesson-generator.ts', async () => {
  class LessonGenerationEngine {
    constructor() {}
    generate() { return []; }
  }
  return { LessonGenerationEngine };
});