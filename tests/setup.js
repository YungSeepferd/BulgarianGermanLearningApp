/**
 * Test Setup (Jest and Vitest compatible)
 * Configures the testing environment for unit tests
 * @since 1.0.0
 */

// Check if we're in a Vitest environment (vi is available) or Jest environment (jest is available)
const isVitest = typeof vi !== 'undefined';
const isJest = typeof jest !== 'undefined';

// Use appropriate mock function based on environment
const fn = isVitest ? vi.fn : (isJest ? jest.fn : () => {});

// Mock DOM APIs that might not be available in JSDOM
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: fn(),
    setItem: fn(),
    removeItem: fn(),
    clear: fn()
  },
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: fn(),
    setItem: fn(),
    removeItem: fn(),
    clear: fn()
  },
  writable: true
});

// Mock fetch API
global.fetch = fn();

// Mock console methods to reduce noise in tests
// Use no-op functions for console methods to reduce test noise
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
};

// Mock performance API
global.performance = {
  ...global.performance,
  now: fn(() => Date.now())
};

// Mock requestAnimationFrame
global.requestAnimationFrame = fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = fn((id) => clearTimeout(id));

// Mock IntersectionObserver
global.IntersectionObserver = fn(() => ({
  observe: fn(),
  disconnect: fn(),
  unobserve: fn()
}));

// Mock ResizeObserver
global.ResizeObserver = fn(() => ({
  observe: fn(),
  disconnect: fn(),
  unobserve: fn()
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
global.Blob = fn(() => ({
  size: 0,
  type: '',
  slice: fn()
}));

// Mock File
global.File = fn(() => ({
  size: 0,
  type: '',
  name: 'test.txt',
  slice: fn()
}));

// Mock FileReader
global.FileReader = fn(() => ({
  readAsText: fn(),
  readAsDataURL: fn(),
  readAsArrayBuffer: fn(),
  result: null,
  onload: null,
  onerror: null
}));

// Export utilities for tests

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