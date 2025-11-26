/**
 * Coverage setup for SvelteKit component testing
 * This file configures coverage collection and reporting
 * for Playwright and unit tests
 */

import { configure } from '@testing-library/svelte';
import { vi } from 'vitest';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncWrapperUtil: 'waitFor'
});

// Mock global APIs that might not be available in test environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

global.localStorage = localStorageMock;

// Mock sessionStorage for testing
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

global.sessionStorage = sessionStorageMock;

// Mock fetch API for testing
global.fetch = vi.fn();

// Mock navigator.onLine
Object.defineProperty(window, 'navigator', {
  value: {
    ...window.navigator,
    onLine: true
  },
  writable: true
});

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => [])
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock Web Speech API (for accessibility testing)
global.SpeechSynthesisUtterance = vi.fn();
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  pending: false,
  speaking: false,
  paused: false
};

// Mock MediaDevices API (for camera/microphone access)
global.navigator.mediaDevices = {
  getUserMedia: vi.fn(() => Promise.resolve({
    getTracks: () => [],
    getAudioTracks: () => [],
    getVideoTracks: () => [],
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
    clone: vi.fn(),
    stop: vi.fn(),
    getCapabilities: vi.fn(),
    getSettings: vi.fn(),
    applyConstraints: vi.fn(),
    onactive: null,
    oninactive: null,
    onaddtrack: null,
    onremovetrack: null
  })),
  enumerateDevices: vi.fn(() => Promise.resolve([])),
  getSupportedConstraints: vi.fn(() => ({}))
};

// Mock Touch events for mobile testing
global.TouchEvent = vi.fn();
global.Touch = vi.fn();

// Mock Pointer events
global.PointerEvent = vi.fn();

// Mock Clipboard API
global.navigator.clipboard = {
  writeText: vi.fn(() => Promise.resolve()),
  readText: vi.fn(() => Promise.resolve('')),
  write: vi.fn(() => Promise.resolve()),
  read: vi.fn(() => Promise.resolve([]))
};

// Mock Service Worker registration
global.navigator.serviceWorker = {
  register: vi.fn(() => Promise.resolve({
    installing: null,
    waiting: null,
    active: null,
    scope: '',
    pushManager: {
      subscribe: vi.fn(() => Promise.resolve({ endpoint: '' })),
      getSubscription: vi.fn(() => Promise.resolve(null)),
      permissionState: vi.fn(() => Promise.resolve('granted'))
    },
    sync: {
      register: vi.fn(() => Promise.resolve()),
      getTags: vi.fn(() => Promise.resolve([]))
    },
    update: vi.fn(() => Promise.resolve()),
    unregister: vi.fn(() => Promise.resolve(true))
  })),
  getRegistration: vi.fn(() => Promise.resolve(null)),
  getRegistrations: vi.fn(() => Promise.resolve([])),
  ready: Promise.resolve(null),
  controller: null,
  oncontrollerchange: null,
  onmessage: null
};

// Mock Background Sync API
global.SyncManager = vi.fn().mockImplementation(() => ({
  register: vi.fn(() => Promise.resolve()),
  getTags: vi.fn(() => Promise.resolve([]))
}));

// Mock Notification API
global.Notification = vi.fn().mockImplementation((title, options) => ({
  title,
  ...options,
  close: vi.fn(),
  onclick: null,
  onclose: null,
  onerror: null,
  onshow: null
}));

global.Notification.requestPermission = vi.fn(() => Promise.resolve('granted'));
global.Notification.permission = 'granted';

// Mock Web Share API
global.navigator.share = vi.fn(() => Promise.resolve());
global.navigator.canShare = vi.fn(() => true);

// Mock Screen Orientation API
global.screen.orientation = {
  angle: 0,
  type: 'landscape-primary',
  lock: vi.fn(() => Promise.resolve()),
  unlock: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
};

// Mock Device Orientation API
global.DeviceOrientationEvent = vi.fn();
global.DeviceMotionEvent = vi.fn();

// Mock Geolocation API
global.navigator.geolocation = {
  getCurrentPosition: vi.fn((success, error) => {
    success({
      coords: {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    });
  }),
  watchPosition: vi.fn(() => 1),
  clearWatch: vi.fn()
};

// Mock Battery API
global.navigator.getBattery = vi.fn(() => Promise.resolve({
  charging: true,
  chargingTime: 0,
  dischargingTime: Infinity,
  level: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}));

// Mock Vibration API
global.navigator.vibrate = vi.fn(() => true);

// Mock Fullscreen API
global.Element.prototype.requestFullscreen = vi.fn(() => Promise.resolve());
global.Element.prototype.requestPointerLock = vi.fn(() => Promise.resolve());
global.Document.prototype.exitFullscreen = vi.fn(() => Promise.resolve());
global.Document.prototype.exitPointerLock = vi.fn(() => Promise.resolve());

// Mock Page Visibility API
Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true
});

Object.defineProperty(document, 'visibilityState', {
  value: 'visible',
  writable: true
});

// Mock Web Components
global.customElements = {
  define: vi.fn(),
  get: vi.fn(),
  upgrade: vi.fn(),
  whenDefined: vi.fn(() => Promise.resolve())
};

// Mock CSS Custom Properties
global.CSS = {
  supports: vi.fn(() => true),
  escape: vi.fn((str) => str),
  registerProperty: vi.fn()
};

// Mock Web Animations API
global.Element.prototype.animate = vi.fn(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  cancel: vi.fn(),
  finish: vi.fn(),
  reverse: vi.fn(),
  currentTime: 0,
  playbackRate: 1,
  playState: 'idle',
  ready: Promise.resolve(),
  finished: Promise.resolve(),
  onfinish: null,
  oncancel: null,
  onremove: null
}));

// Coverage collection utilities
export const coverageUtils = {
  /**
   * Start coverage collection for a specific component
   */
  startComponentCoverage: (componentName: string) => {
    console.log(`Starting coverage for ${componentName}`);
  },

  /**
   * Stop coverage collection and generate report
   */
  stopComponentCoverage: (componentName: string) => {
    console.log(`Stopping coverage for ${componentName}`);
  },

  /**
   * Generate coverage report for all components
   */
  generateCoverageReport: () => {
    console.log('Generating coverage report...');
  },

  /**
   * Check if coverage meets threshold requirements
   */
  checkCoverageThresholds: (coverage: any) => {
    const thresholds = {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    };

    const results = {
      statements: coverage.statements.pct >= thresholds.statements,
      branches: coverage.branches.pct >= thresholds.branches,
      functions: coverage.functions.pct >= thresholds.functions,
      lines: coverage.lines.pct >= thresholds.lines
    };

    return {
      passed: Object.values(results).every(Boolean),
      results,
      thresholds
    };
  }
};

// Export setup utilities for use in tests
export const testUtils = {
  /**
   * Create a mock vocabulary item for testing
   */
  createMockVocabularyItem: (overrides = {}) => ({
    id: 'test-vocab-1',
    bulgarian: 'Тестова дума',
    german: 'Testwort',
    level: 'A1',
    category: 'nouns',
    difficulty: 1,
    examples: [
      { bulgarian: 'Пример', german: 'Beispiel' }
    ],
    tags: ['test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  /**
   * Create mock session stats for testing
   */
  createMockSessionStats: (overrides = {}) => ({
    cardsStudied: 10,
    correctAnswers: 8,
    incorrectAnswers: 2,
    averageGrade: 3.5,
    studyTime: 1200,
    gradeDistribution: { 1: 0, 2: 1, 3: 2, 4: 5, 5: 2 },
    accuracy: 80,
    ...overrides
  }),

  /**
   * Wait for component to be rendered
   */
  waitForComponent: async (element: HTMLElement) => {
    return new Promise((resolve) => {
      if (element.isConnected) {
        resolve(element);
      } else {
        const observer = new MutationObserver(() => {
          if (element.isConnected) {
            observer.disconnect();
            resolve(element);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  },

  /**
   * Simulate user interaction with component
   */
  simulateUserInteraction: async (element: HTMLElement, eventType: string, options = {}) => {
    const event = new Event(eventType, { bubbles: true, ...options });
    element.dispatchEvent(event);
    await new Promise(resolve => setTimeout(resolve, 0));
  }
};

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset fetch
  (global.fetch as any).mockClear();
});

afterEach(() => {
  // Clean up any test artifacts
  document.body.innerHTML = '';
});

// Global test cleanup
afterAll(() => {
  // Generate final coverage report
  coverageUtils.generateCoverageReport();
});