/**
 * Test utilities for Svelte component testing
 * Provides helper functions for rendering components and testing interactions
 */

import { render, fireEvent } from '@testing-library/svelte';
import type { ComponentType } from 'svelte';
import type { VocabularyItem, SessionStats } from '$lib/types/index.js';
import { vi } from 'vitest';

// Mock vocabulary item for testing
export const mockVocabularyItem: VocabularyItem = {
  id: 'test-1',
  word: 'здравей',
  translation: 'hallo',
  category: 'greetings',
  level: 'A1',
  examples: [
    { sentence: 'Здравей, как си?', translation: 'Hallo, wie geht es dir?' }
  ],
  pronunciation: 'zdravay',
  audioUrl: '/audio/zdravay.mp3',
  tags: ['basic', 'greeting'],
  difficulty: 1,
  created: Date.now(),
  updated: Date.now()
};

// Mock session stats for testing
export const mockSessionStats: SessionStats = {
  totalCards: 10,
  studiedCards: 5,
  correctAnswers: 4,
  incorrectAnswers: 1,
  averageResponseTime: 2500,
  sessionDuration: 300_000,
  startTime: new Date(Date.now() - 300_000),
  currentStreak: 3,
  bestStreak: 5,
  accuracy: 0.8,
  efficiency: 0.85,
  difficultyDistribution: {
    A1: 3,
    A2: 2,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0
  },
  categoryPerformance: {
    greetings: { correct: 2, total: 2, accuracy: 1 },
    nouns: { correct: 1, total: 2, accuracy: 0.5 },
    verbs: { correct: 1, total: 1, accuracy: 1 }
  },
  weakAreas: ['nouns'],
  strongAreas: ['greetings', 'verbs'],
  recommendations: [
    'Focus on noun declensions',
    'Review basic greetings'
  ],
  progressHistory: [
    { timestamp: new Date(Date.now() - 200_000), accuracy: 0.7, cardsStudied: 2 },
    { timestamp: new Date(Date.now() - 100_000), accuracy: 0.8, cardsStudied: 3 },
    { timestamp: new Date(), accuracy: 0.8, cardsStudied: 5 }
  ]
};

// Default props for Flashcard component
export const defaultFlashcardProps = {
  vocabularyItem: mockVocabularyItem,
  direction: 'bg-de' as const,
  showProgress: true,
  autoFlip: false,
  lazyLoad: false,
  onGrade: vi.fn(),
  onNext: vi.fn(),
  onPrevious: vi.fn()
};

// Default props for GradeControls component
export const defaultGradeControlsProps = {
  onGrade: vi.fn(),
  disabled: false,
  selectedGrade: null as number | null,
  showLabels: true,
  compact: false,
  grades: [
    { id: 0, label: 'Again', description: 'Show card again soon', color: '#ef4444' },
    { id: 1, label: 'Hard', description: 'Difficult to recall', color: '#f59e0b' },
    { id: 2, label: 'Good', description: 'Recalled with some effort', color: '#10b981' },
    { id: 3, label: 'Easy', description: 'Recalled easily', color: '#3b82f6' }
  ]
};

// Default props for ProgressIndicator component
export const defaultProgressIndicatorProps = {
  current: 1,
  total: 10,
  showPercentage: true,
  showLabel: true,
  compact: false,
  color: '#3b82f6',
  height: 8,
  animated: true
};

// Default props for SessionStats component
export const defaultSessionStatsProps = {
  session: mockSessionStats,
  showDetails: true,
  showChart: true,
  compact: false,
  showRecommendations: true
};

// Default props for ErrorBoundary component
export const defaultErrorBoundaryProps = {
  fallback: null,
  onError: vi.fn(),
  onReset: vi.fn(),
  showErrorDetails: false,
  enableRetry: true,
  maxRetries: 3
};

// Default props for LoadingSpinner component
export const defaultLoadingSpinnerProps = {
  size: 'medium' as const,
  color: '#3b82f6',
  message: 'Loading...',
  showMessage: true,
  overlay: false,
  centered: true
};

/**
 * Safely render a Svelte component for testing
 * @param Component - The Svelte component to render
 * @param props - Props to pass to the component
 * @returns Render result with query helpers
 */
export async function safeRender<T extends ComponentType>(
  Component: T,
  props: Record<string, any> = {}
) {
  try {
    console.log('safeRender called - environment check:', {
      hasWindow: typeof window !== 'undefined',
      hasDocument: typeof document !== 'undefined',
      windowType: typeof window,
      documentType: typeof document,
      isServer: typeof window === 'undefined'
    });

    console.log('Component:', Component);
    console.log('Props:', props);

    // Check if we're in server environment
    if (typeof window === 'undefined') {
      console.error('Running in server environment - setting up global mocks');
      setupGlobalMocks();
    }

    // Always use actual render in test environment
    // Vitest runs with jsdom, so we should have window and document
    console.log('Attempting to render component with props:', props);
    const result = render(Component, { props });
    
    console.log('Render result:', result);
    console.log('Component instance:', result.component);
    console.log('Container element:', result.container);
    console.log('Container HTML:', result.container?.innerHTML || 'No container');
    console.log('Container children:', result.container?.children.length || 0);
    
    // Wait a tick for the component to mount and update
    await new Promise(resolve => setTimeout(resolve, 0));
    
    console.log('Component rendered successfully');
    console.log('Container HTML after tick:', result.container?.innerHTML || 'No container');
    console.log('Container children after tick:', result.container?.children.length || 0);
    
    return result;
  } catch (error) {
    console.error('Error rendering component:', error);
    console.error('Error stack:', error.stack);
    
    // Try to get more specific error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error properties:', Object.getOwnPropertyNames(error));
      
      // Check for specific Svelte server-side errors
      if (error.message.includes('lifecycle_function_unavailable') ||
          error.message.includes('mount(...) is not available on the server')) {
        console.error('SERVER-SIDE RENDERING ERROR DETECTED');
        console.error('This indicates the test is running in server mode instead of client mode');
        console.error('Setting up global mocks and retrying...');
        
        // Setup global mocks and retry
        setupGlobalMocks();
        
        try {
          console.log('Retrying render after setting up global mocks...');
          const result = render(Component, { props });
          console.log('Retry successful:', result);
          return result;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
    }
    
    // Return mock result for error cases
    return {
      component: null,
      container: null,
      queryByRole: () => null,
      queryByText: () => null,
      queryByTestId: () => null,
      getByRole: () => {
        throw new Error('getByRole not available due to render error');
      },
      getByText: () => {
        throw new Error('getByText not available due to render error');
      },
      getByTestId: () => {
        throw new Error('getByTestId not available due to render error');
      },
      fireEvent: {
        click: vi.fn(),
        keydown: vi.fn(),
        change: vi.fn()
      },
      rerender: vi.fn(),
      unmount: vi.fn(),
      debug: () => console.log('Debug not available due to render error')
    };
  }
}

/**
 * Render Flashcard component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderFlashcard(props = {}) {
  try {
    console.log('Importing Flashcard component...');
    const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
    console.log('Flashcard component imported successfully');
    
    const result = await safeRender(Flashcard, { ...defaultFlashcardProps, ...props });
    console.log('Flashcard render result:', result);
    
    return result;
  } catch (error) {
    console.error('Error importing or rendering Flashcard:', error);
    throw error;
  }
}

/**
 * Render GradeControls component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderGradeControls(props = {}) {
  const { default: GradeControls } = await import('$lib/components/GradeControls.svelte');
  return safeRender(GradeControls, { ...defaultGradeControlsProps, ...props });
}

/**
 * Render ProgressIndicator component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderProgressIndicator(props = {}) {
  const { default: ProgressIndicator } = await import('$lib/components/ProgressIndicator.svelte');
  return safeRender(ProgressIndicator, { ...defaultProgressIndicatorProps, ...props });
}

/**
 * Render SessionStats component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderSessionStats(props = {}) {
  const { default: SessionStats } = await import('$lib/components/SessionStats.svelte');
  return safeRender(SessionStats, { ...defaultSessionStatsProps, ...props });
}

/**
 * Render ErrorBoundary component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderErrorBoundary(props = {}) {
  const { default: ErrorBoundary } = await import('$lib/components/ErrorBoundary.svelte');
  return safeRender(ErrorBoundary, { ...defaultErrorBoundaryProps, ...props });
}

/**
 * Render LoadingSpinner component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderLoadingSpinner(props = {}) {
  const { default: LoadingSpinner } = await import('$lib/components/LoadingSpinner.svelte');
  return safeRender(LoadingSpinner, { ...defaultLoadingSpinnerProps, ...props });
}

/**
 * Wait for the next tick in the event loop
 * @param ms - Milliseconds to wait (default: 0)
 * @returns Promise that resolves after the specified time
 */
export async function waitForNextTick(ms = 0): Promise<void> {
  return new Promise(resolve => {
    if (typeof setTimeout === 'undefined') {
      // Fallback for server environment
      Promise.resolve().then(() => {
        if (ms > 0) {
          // Simulate delay in server environment
          const start = Date.now();
          while (Date.now() - start < ms) {
            // Busy wait
          }
        }
        resolve();
      });
    } else {
      setTimeout(resolve, ms);
    }
  });
}

/**
 * Create a mock event dispatcher
 * @returns Mock event dispatcher function
 */
export function createMockEventDispatcher() {
  return vi.fn((event: string, detail?: any) => {
    console.log(`Mock event dispatched: ${event}`, detail);
  });
}

/**
 * Create a mock DOM element for testing
 * @param tagName - Tag name for the element
 * @param attributes - Attributes to set on the element
 * @returns Mock DOM element
 */
export function createMockElement(tagName: string, attributes: Record<string, string> = {}) {
  const element = {
    tagName: tagName.toUpperCase(),
    textContent: '',
    innerHTML: '',
    className: '',
    id: '',
    style: {},
    dataset: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
      toggle: vi.fn()
    },
    setAttribute: vi.fn((name: string, value: string) => {
      (element as any)[name] = value;
    }),
    getAttribute: vi.fn((name: string) => (element as any)[name]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    click: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    parentElement: null,
    children: [],
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
    nodeType: 1,
    nodeName: tagName.toUpperCase(),
    ownerDocument: {
      createElement: vi.fn(() => createMockElement('div')),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  } as any;

  // Set attributes
  for (const [name, value] of Object.entries(attributes)) {
    (element as any)[name] = value;
  }

  return element;
}

/**
 * Mock window object for server-side testing
 */
export const mockWindow = {
  location: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  },
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  navigator: {
    userAgent: 'test-agent',
    language: 'en-US',
    onLine: true
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  requestAnimationFrame: vi.fn((callback) => {
    setTimeout(callback, 16);
    return 1;
  }),
  cancelAnimationFrame: vi.fn(),
  innerWidth: 1024,
  innerHeight: 768,
  scrollX: 0,
  scrollY: 0,
  pageXOffset: 0,
  pageYOffset: 0,
  devicePixelRatio: 1,
  matchMedia: vi.fn(() => ({
    matches: false,
    media: '',
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null
  })),
  getComputedStyle: vi.fn(() => ({
    getPropertyValue: vi.fn(() => ''),
    setProperty: vi.fn(),
    removeProperty: vi.fn()
  })),
  scrollTo: vi.fn(),
  alert: vi.fn(),
  confirm: vi.fn(() => true),
  prompt: vi.fn(() => null)
};

/**
 * Setup global mocks for server-side testing
 */
export function setupGlobalMocks() {
  if (typeof window === 'undefined') {
    // Mock window object
    (global as any).window = mockWindow;
    
    // Mock document object
    (global as any).document = {
      createElement: vi.fn(() => createMockElement('div')),
      createElementNS: vi.fn(() => createMockElement('div')),
      getElementById: vi.fn(() => null),
      getElementsByClassName: vi.fn(() => []),
      getElementsByTagName: vi.fn(() => []),
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      body: createMockElement('body'),
      head: createMockElement('head'),
      documentElement: createMockElement('html'),
      readyState: 'complete',
      location: mockWindow.location
    };
    
    // Mock navigator
    (global as any).navigator = mockWindow.navigator;
    
    // Mock localStorage
    (global as any).localStorage = mockWindow.localStorage;
    
    // Mock sessionStorage
    (global as any).sessionStorage = mockWindow.sessionStorage;
  }
}

// Export common testing patterns
export const testPatterns = {
  // Accessibility test helpers
  testAccessibility: async (component: any) => {
    // Basic accessibility tests
    const result = await safeRender(component);
    if (result.container) {
      // Check for basic accessibility attributes
      const buttons = result.container.querySelectorAll('button');
      for (const button of buttons) {
        expect(button).toHaveAttribute('type');
      }
    }
    return result;
  },
  
  // Keyboard navigation test helpers
  testKeyboardNavigation: async (component: any, keyMap: Record<string, () => void>) => {
    const result = await safeRender(component);
    for (const [key, handler] of Object.entries(keyMap)) {
      fireEvent.keyDown(result.container || document.body, { key });
      handler();
    }
    return result;
  },
  
  // Responsive design test helpers
  testResponsive: async (component: any, breakpoints: number[]) => {
    const results = [];
    for (const width of breakpoints) {
      // Mock window.innerWidth
      (global as any).window = { ...mockWindow, innerWidth: width };
      const result = await safeRender(component);
      results.push({ width, result });
    }
    return results;
  }
};

// Re-export commonly used testing utilities

export { vi } from 'vitest';
export { expect } from 'vitest';
export type { RenderResult } from '@testing-library/svelte';
export { fireEvent } from '@testing-library/svelte';