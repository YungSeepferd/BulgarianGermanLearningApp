import { vi, beforeEach, afterEach, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock console methods to reduce noise in tests
const originalConsole = global.console;

beforeEach(() => {
  global.console = {
    ...originalConsole,
    // Keep error and warn for debugging test failures
    error: originalConsole.error,
    warn: originalConsole.warn,
    // Silence info, log, and debug
    log: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
});

afterEach(() => {
  global.console = originalConsole;
});

// Force browser environment for Svelte 5
Object.defineProperty(global, 'window', {
  writable: true,
  value: global.window || {}
});

Object.defineProperty(global, 'document', {
  writable: true,
  value: global.document || {
    createElement: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
    getElementById: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  }
});

// Minimal browser APIs needed for Svelte 5 testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Svelte 5 compatibility
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for Svelte 5 compatibility
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage for Svelte 5
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock sessionStorage for Svelte 5
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);

// Mock fetch for Svelte 5
global.fetch = vi.fn();

// Mock requestAnimationFrame for Svelte 5
global.requestAnimationFrame = vi.fn((cb) => {
  const id = setTimeout(cb, 16);
  return id as unknown as number;
});
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id as unknown as NodeJS.Timeout));

// Mock crypto for Svelte 5
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    getRandomValues: vi.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  },
});

// Mock navigator for Svelte 5
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    userAgent: 'test-user-agent',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    clipboard: {
      writeText: vi.fn(),
      readText: vi.fn(),
    },
  },
});

// Mock location for Svelte 5
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
  },
});

// Mock history for Svelte 5
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    length: 1,
    state: null,
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
});

// Mock document methods for Svelte 5
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
});

Object.defineProperty(document, 'visibilityState', {
  writable: true,
  value: 'visible',
});

// Mock setTimeout and setInterval for Svelte 5
const setTimeoutMock = vi.fn().mockImplementation((fn, delay) => {
  const timeoutId = `timeout-${Date.now()}-${Math.random()}`;
  
  if (delay === 0) {
    Promise.resolve().then(fn);
  } else {
    Promise.resolve().then(fn);
  }
  
  return timeoutId;
});

const setIntervalMock = vi.fn().mockImplementation((fn, interval) => {
  const intervalId = `interval-${Date.now()}-${Math.random()}`;
  return intervalId;
});

const clearTimeoutMock = vi.fn();
const clearIntervalMock = vi.fn();

global.setTimeout = setTimeoutMock as unknown as typeof setTimeout;
global.setInterval = setIntervalMock as unknown as typeof setInterval;
global.clearTimeout = clearTimeoutMock;
global.clearInterval = clearIntervalMock;

// Mock alert, confirm, prompt for Svelte 5
global.alert = vi.fn();
global.confirm = vi.fn(() => true);
global.prompt = vi.fn(() => 'test-input');

// Mock HTMLElement methods for Svelte 5
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.focus = vi.fn();
HTMLElement.prototype.blur = vi.fn();
HTMLElement.prototype.click = vi.fn();

// Mock Selection for Svelte 5
global.Selection = vi.fn().mockImplementation(() => ({
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
  toString: vi.fn(() => ''),
})) as any;

global.getSelection = vi.fn(() => null);

// Mock DOMRect for Svelte 5
global.DOMRect = vi.fn().mockImplementation(() => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
})) as any;

// Mock getBoundingClientRect for Svelte 5
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 0,
  right: 100,
  bottom: 100,
  left: 0,
  toJSON: vi.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    right: 100,
    bottom: 100,
    left: 0
  }))
}));

// Mock getComputedStyle for Svelte 5
global.getComputedStyle = vi.fn(() => {
  const style = {
    getPropertyValue: vi.fn(() => ''),
    setProperty: vi.fn(),
    removeProperty: vi.fn()
  } as any;
  
  return style;
});

// Mock MutationObserver for Svelte 5 and Testing Library compatibility
global.MutationObserver = class {
  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
};

// Mock EventTarget for Svelte 5
EventTarget.prototype.addEventListener = vi.fn();
EventTarget.prototype.removeEventListener = vi.fn();
EventTarget.prototype.dispatchEvent = vi.fn();

// Mock Event for Svelte 5
global.Event = vi.fn().mockImplementation((type, options) => ({
  type,
  bubbles: options?.bubbles || false,
  cancelable: options?.cancelable || false,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
})) as any;

// Export types for use in tests
export type MockedFunction<T extends (...args: any[]) => any> = ReturnType<typeof vi.fn> & T;