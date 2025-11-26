/**
 * SvelteKit Test Setup (Vitest compatible)
 * Configures the testing environment for SvelteKit unit tests
 * @since 1.0.0
 */

import { vi } from 'vitest';

// Setup JSDOM environment for Svelte component testing
const { JSDOM } = await import('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.Document = dom.window.Document;
global.Event = dom.window.Event;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.MouseEvent = dom.window.MouseEvent;
global.CustomEvent = dom.window.CustomEvent;

// Force Svelte to use client-side version for testing
global.process = {
  ...global.process,
  env: {
    ...global.process?.env,
    NODE_ENV: 'test'
  },
  browser: true
};

// Mock Svelte's mount function to use client version
vi.mock('svelte', async () => {
  const actual = await vi.importActual('svelte');
  return {
    ...actual,
    mount: actual.mount || vi.fn()
  };
});

// Mock DOM APIs that might not be available in JSDOM
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock fetch API
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024,
    totalJSHeapSize: 100 * 1024 * 1024,
    jsHeapSizeLimit: 2048 * 1024 * 1024
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock URL constructor
global.URL = class URL {
  constructor(url) {
    this.href = url || 'http://localhost';
    this.origin = 'http://localhost';
    this.protocol = 'http:';
    this.host = 'localhost';
    this.hostname = 'localhost';
    this.port = '';
    this.pathname = '/';
    this.search = '';
    this.hash = '';
  }
  
  static createObjectURL(blob) {
    return 'blob:mock-url';
  }
};

// Mock Blob
global.Blob = vi.fn(() => ({
  size: 0,
  type: '',
  slice: vi.fn()
}));

// Mock File
global.File = vi.fn(() => ({
  size: 0,
  type: '',
  name: 'test.txt',
  slice: vi.fn()
}));

// Mock FileReader
global.FileReader = vi.fn(() => ({
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  result: null,
  onload: null,
  onerror: null
}));

// Mock matchMedia for CSS media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock getComputedStyle for CSS testing
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn(() => ({
    getPropertyValue: vi.fn(),
    transition: 'all 0.3s ease',
    contain: 'layout style paint'
  }))
});

// Setup and teardown hooks
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset localStorage mock
  if (localStorage.getItem && typeof localStorage.getItem.mockClear === 'function') {
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
    localStorage.clear.mockClear();
  }
  
  // Reset sessionStorage mock
  if (sessionStorage.getItem && typeof sessionStorage.getItem.mockClear === 'function') {
    sessionStorage.getItem.mockClear();
    sessionStorage.setItem.mockClear();
    sessionStorage.removeItem.mockClear();
    sessionStorage.clear.mockClear();
  }
  
  // Reset fetch mock
  if (fetch && typeof fetch.mockClear === 'function') {
    fetch.mockClear();
  }
  
  // Reset performance mock
  if (performance.now && typeof performance.now.mockClear === 'function') {
    performance.now.mockClear();
  }
});

afterEach(() => {
  // Clean up any remaining timers
  vi.clearAllTimers();
});

// Export utilities for tests
global.testUtils = {
  createMockError: (message = 'Test error') => {
    const error = new Error(message);
    error.stack = 'Error: Test error\n    at test (test.js:1:1)';
    return error;
  },
  
  createMockVocabularyError: (message, category = 'validation', severity = 'medium') => {
    const error = new Error(message);
    error.category = category;
    error.severity = severity;
    error.timestamp = new Date();
    error.retryable = category === 'network';
    error.userMessage = 'User-friendly error message';
    error.toJSON = () => ({
      name: 'VocabularyError',
      message,
      category,
      severity,
      timestamp: error.timestamp.toISOString(),
      retryable: error.retryable,
      userMessage: error.userMessage
    });
    return error;
  },
  
  createMockLoadingState: (overrides = {}) => {
    return {
      operationId: 'test-operation',
      status: 'loading',
      progress: 0,
      totalItems: 10,
      loadedItems: 0,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      description: 'Test operation',
      stage: null,
      error: null,
      metadata: {},
      chunks: {},
      estimatedTimeRemaining: null,
      result: null,
      reason: null,
      ...overrides
    };
  },
  
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  flushPromises: () => new Promise(resolve => setImmediate(resolve))
};