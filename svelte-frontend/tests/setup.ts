import { vi, beforeEach, afterEach, expect } from 'vitest';
import type { MockedFunction } from 'vitest';
import * as matchers from '@testing-library/jest-dom';

// Add jest-dom matchers to expect
expect.extend(matchers);

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

// Mock browser APIs that might not be available in test environment
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
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);

// Mock fetch
global.fetch = vi.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  },
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock crypto
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

// Mock navigator
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

// Mock location
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

// Mock history
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

// Mock document methods
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
});

Object.defineProperty(document, 'visibilityState', {
  writable: true,
  value: 'visible',
});

// Mock setTimeout and setInterval with proper implementation
const setTimeoutMock = vi.fn().mockImplementation((fn, delay) => {
  // Use a simple counter for timeout IDs to avoid stack overflow
  const timeoutId = `timeout-${Date.now()}-${Math.random()}`;
  
  // Execute the function asynchronously without using real setTimeout
  if (delay === 0) {
    Promise.resolve().then(fn);
  } else {
    // For non-zero delays, use a simple approach
    Promise.resolve().then(fn);
  }
  
  return timeoutId;
});

const setIntervalMock = vi.fn().mockImplementation((fn, interval) => {
  const intervalId = `interval-${Date.now()}-${Math.random()}`;
  // Don't actually set up repeating intervals in tests
  return intervalId;
});

const clearTimeoutMock = vi.fn();
const clearIntervalMock = vi.fn();

global.setTimeout = setTimeoutMock;
global.setInterval = setIntervalMock;
global.clearTimeout = clearTimeoutMock;
global.clearInterval = clearIntervalMock;

// Mock alert, confirm, prompt
global.alert = vi.fn();
global.confirm = vi.fn(() => true);
global.prompt = vi.fn(() => 'test-input');

// Mock HTMLElement methods
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.focus = vi.fn();
HTMLElement.prototype.blur = vi.fn();
HTMLElement.prototype.click = vi.fn();

// Mock Selection
global.Selection = vi.fn().mockImplementation(() => ({
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
  toString: vi.fn(() => ''),
})) as any;

global.getSelection = vi.fn(() => ({
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
  toString: vi.fn(() => ''),
}));

// Mock DOMRect
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

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}));

// Mock getComputedStyle
global.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
}));

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

// Mock EventTarget
EventTarget.prototype.addEventListener = vi.fn();
EventTarget.prototype.removeEventListener = vi.fn();
EventTarget.prototype.dispatchEvent = vi.fn();

// Mock Event
global.Event = vi.fn().mockImplementation((type, options) => ({
  type,
  bubbles: options?.bubbles || false,
  cancelable: options?.cancelable || false,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
})) as any;

// Export types for use in tests
export type MockedFunction<T extends (...args: any[]) => any> = ReturnType<typeof vi.fn> & T;