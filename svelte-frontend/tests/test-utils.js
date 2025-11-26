/**
 * Test Utilities
 * @description Utility functions for testing
 * @version 1.0.0
 * @updated November 2025
 */

// import type { VocabularyItem } from '$lib/types/index.js';

/**
 * Create mock vocabulary items for testing
 * @param {number} count - Number of items to create
 * @returns {VocabularyItem[]} Array of mock vocabulary items
 */
export function createMockVocabulary(count = 1) {
  const items = [];
  
  for (let i = 0; i < count; i++) {
    items.push({
      id: `vocab-${i}`,
      bg: `Българска дума ${i}`,
      de: `German word ${i}`,
      notes: i % 2 === 0 ? `Note for item ${i}` : undefined,
      notes_de_to_bg: i % 3 === 0 ? `German note for item ${i}` : undefined,
      examples: i % 2 === 0 ? [
        {
          sentence: `Example sentence ${i} in Bulgarian`,
          translation: `Example sentence ${i} in German`
        },
        {
          sentence: `Another example ${i}`,
          translation: `Another translation ${i}`
        }
      ] : [],
      etymology: i % 3 === 0 ? `Etymology for word ${i}` : undefined,
      cultural_note: i % 4 === 0 ? `Cultural note for word ${i}` : undefined,
      level: 'A1',
      category: 'nouns',
      frequency: i + 1,
      difficulty: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return items;
}

/**
 * Create mock review state for testing
 * @param {string} itemId - Item ID
 * @param {string} direction - Language direction
 * @returns {object} Mock review state
 */
export function createMockReviewState(itemId = 'test-item', direction = 'bg-de') {
  return {
    itemId,
    direction,
    phase: 1,
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: new Date().toISOString(),
    lastReview: null,
    totalReviews: 0,
    correctReviews: 0,
    averageResponseTime: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Create mock progress data for testing
 * @param {object} options - Progress options
 * @returns {object} Mock progress data
 */
export function createMockProgress(options = {}) {
  const {
    current = 1,
    total = 10,
    correct = 0,
    incorrect = 0,
    skipped = 0
  } = options;
  
  return {
    current,
    total,
    correct,
    incorrect,
    skipped,
    percentage: Math.round((current / total) * 100),
    accuracy: total > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0,
    startTime: new Date().toISOString(),
    elapsedTime: 0
  };
}

/**
 * Create mock session stats for testing
 * @param {object} options - Stats options
 * @returns {object} Mock session stats
 */
export function createMockSessionStats(options = {}) {
  const {
    totalCards = 10,
    reviewedCards = 5,
    correctAnswers = 4,
    averageResponseTime = 2500,
    sessionDuration = 300000
  } = options;
  
  return {
    totalCards,
    reviewedCards,
    correctAnswers,
    incorrectAnswers: reviewedCards - correctAnswers,
    accuracy: reviewedCards > 0 ? Math.round((correctAnswers / reviewedCards) * 100) : 0,
    averageResponseTime,
    sessionDuration,
    cardsPerMinute: Math.round((reviewedCards / sessionDuration) * 60000),
    startTime: new Date(Date.now() - sessionDuration).toISOString(),
    endTime: new Date().toISOString()
  };
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock DOM element for testing
 * @param {string} tagName - Tag name of the element
 * @param {object} attributes - Attributes to set on the element
 * @param {string} textContent - Text content of the element
 * @returns {HTMLElement} Mock DOM element
 */
export function createMockElement(tagName, attributes = {}, textContent = '') {
  const element = document.createElement(tagName);
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = value;
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
  
  get length() {
    return Object.keys(this.store).length;
  }
  
  key(index) {
    return Object.keys(this.store)[index] || null;
  }
}

/**
 * Setup mock localStorage for testing
 * @returns {MockLocalStorage} Mock localStorage instance
 */
export function setupMockLocalStorage() {
  const mockLocalStorage = new MockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  return mockLocalStorage;
}

/**
 * Create a mock fetch response
 * @param {any} data - Data to return
 * @param {object} options - Response options
 * @returns {Promise} Promise that resolves to a mock Response
 */
export function createMockFetchResponse(data, options = {}) {
  const {
    status = 200,
    statusText = 'OK',
    headers = {}
  } = options;
  
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers(headers),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)]))
  });
}

/**
 * Mock fetch for testing
 * @param {object} responses - Map of URLs to responses
 * @returns {Function} Mock fetch function
 */
export function createMockFetch(responses = {}) {
  return function mockFetch(url, options = {}) {
    const key = typeof url === 'string' ? url : url.url;
    
    if (responses[key]) {
      return typeof responses[key] === 'function' 
        ? responses[key](url, options)
        : createMockFetchResponse(responses[key]);
    }
    
    return createMockFetchResponse(null, { status: 404, statusText: 'Not Found' });
  };
}

/**
 * Setup mock fetch for testing
 * @param {object} responses - Map of URLs to responses
 * @returns {Function} Cleanup function
 */
export function setupMockFetch(responses = {}) {
  const mockFetch = createMockFetch(responses);
  const originalFetch = global.fetch;
  
  global.fetch = mockFetch;
  
  return () => {
    global.fetch = originalFetch;
  };
}