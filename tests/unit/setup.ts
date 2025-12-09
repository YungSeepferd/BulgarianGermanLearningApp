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