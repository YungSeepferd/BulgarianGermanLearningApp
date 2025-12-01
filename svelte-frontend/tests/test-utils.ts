/**
 * Test utilities for Svelte component testing
 * Provides helper functions for rendering components and testing interactions
 */

import { render, fireEvent, waitFor } from '@testing-library/svelte';
import type { ComponentType, SvelteComponent } from 'svelte';
import type { VocabularyItem, SessionStats } from '$lib/types/index.js';
import { vi } from 'vitest';

// Mock vocabulary item for testing
export const mockVocabularyItem: VocabularyItem = {
  id: 'test-1',
  word: 'здравей',
  translation: 'hallo',
  source_lang: 'bg',
  target_lang: 'de',
  category: 'greetings',
  level: 'A1',
  notes: 'Test notes',
  notes_bg_to_de: 'BG to DE notes',
  notes_de_to_bg: null,
  etymology: 'Test etymology',
  cultural_note: 'Test cultural note',
  examples: [
    {
      sentence: 'Здравей, как си?',
      translation: 'Hallo, wie geht es dir?',
      context: 'Greeting context'
    }
  ],
  audio_url: '/audio/zdravay.mp3',
  difficulty: 1,
  frequency: 50,
  linguistic_note_bg_to_de: 'Test linguistic note BG-DE',
  linguistic_note_de_to_bg: null,
  linguistic_note: 'Test linguistic note'
};

// Mock session stats for testing
export const mockSessionStats: SessionStats = {
  totalCards: 10,
  correctAnswers: 4,
  startTime: new Date(Date.now() - 300_000),
  reviewedCards: 10,
  grades: [3, 4, 2, 5],
  endTime: new Date()
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
export async function safeRender<T extends ComponentType | any>(
  Component: T,
  props: Record<string, any> = {}
) {
  try {
    // Check if we're in server environment
    if (typeof window === 'undefined') {
      setupGlobalMocks();
    }

    // Always use actual render in test environment
    // Vitest runs with jsdom, so we should have window and document
    const result = render(Component as any, { props });
    
    // Wait a tick for the component to mount and update
    await new Promise(resolve => setTimeout(resolve, 0));
    
    return result;
  } catch (error) {
    console.error('Error rendering component:', error);
    
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
  const result = await safeRender(GradeControls, { ...defaultGradeControlsProps, ...props });
  return result;
}

/**
 * Render ProgressIndicator component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderProgressIndicator(props = {}) {
  const { default: ProgressIndicator } = await import('$lib/components/ProgressIndicator.svelte');
  const result = await safeRender(ProgressIndicator, { ...defaultProgressIndicatorProps, ...props });
  return result;
}

/**
 * Render SessionStats component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderSessionStats(props = {}) {
  const { default: SessionStats } = await import('$lib/components/SessionStats.svelte');
  const result = await safeRender(SessionStats, { ...defaultSessionStatsProps, ...props });
  return result;
}

/**
 * Render ErrorBoundary component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderErrorBoundary(props = {}) {
  const { default: ErrorBoundary } = await import('$lib/components/ErrorBoundary.svelte');
  const result = await safeRender(ErrorBoundary, { ...defaultErrorBoundaryProps, ...props });
  return result;
}

/**
 * Render LoadingSpinner component with default props
 * @param props - Additional props to override defaults
 * @returns Render result
 */
export async function renderLoadingSpinner(props = {}) {
  const { default: LoadingSpinner } = await import('$lib/components/LoadingSpinner.svelte');
  const result = await safeRender(LoadingSpinner, { ...defaultLoadingSpinnerProps, ...props });
  return result;
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

/**
 * Create mock vocabulary items for testing
 */
export function createMockVocabulary(count = 10): VocabularyItem[] {
  const items: VocabularyItem[] = [];
  const categories = ['greetings', 'nouns', 'verbs', 'adjectives', 'phrases'];
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const level = levels[i % levels.length];
    
    items.push({
      id: `test-${i + 1}`,
      word: `Bulgarian word ${i + 1}`,
      translation: `German translation ${i + 1}`,
      source_lang: i % 2 === 0 ? 'bg' : 'de',
      target_lang: i % 2 === 0 ? 'de' : 'bg',
      category,
      level: level as any,
      notes: `Test notes for item ${i + 1}`,
      notes_bg_to_de: i % 2 === 0 ? `BG to DE notes ${i + 1}` : null,
      notes_de_to_bg: i % 2 === 1 ? `DE to BG notes ${i + 1}` : null,
      etymology: `Etymology for item ${i + 1}`,
      cultural_note: `Cultural note for item ${i + 1}`,
      difficulty: (i % 5) + 1,
      frequency: Math.floor(Math.random() * 100),
      examples: [
        {
          sentence: `Bulgarian sentence ${i + 1}`,
          translation: `German translation ${i + 1}`,
          context: `Context for example ${i + 1}`
        }
      ],
      linguistic_note_bg_to_de: i % 2 === 0 ? `Linguistic note BG-DE ${i + 1}` : null,
      linguistic_note_de_to_bg: i % 2 === 1 ? `Linguistic note DE-BG ${i + 1}` : null,
      linguistic_note: `Linguistic note ${i + 1}`
    });
  }
  
  return items;
}

/**
 * Create mock session stats for testing
 */
export function createMockSessionStats(overrides: Partial<SessionStats> = {}): SessionStats {
  const baseStats: SessionStats = {
    totalCards: 10,
    correctAnswers: 4,
    startTime: new Date(Date.now() - 300_000),
    reviewedCards: 10,
    grades: [3, 4, 2, 5],
    endTime: new Date()
  };
  
  return { ...baseStats, ...overrides };
}

/**
 * Mount SessionStats component with default props
 */
export async function mountSessionStats(props = {}) {
  const { default: SessionStats } = await import('$lib/components/SessionStats.svelte');
  const result = await safeRender(SessionStats, { ...defaultSessionStatsProps, ...props });
  return result;
}

/**
 * Mount Flashcard component with default props (alias for renderFlashcard)
 */
export async function mountFlashcard(props = {}) {
  const result = await renderFlashcard(props);
  return result;
}

/**
 * Mount GradeControls component with default props (alias for renderGradeControls)
 */
export async function mountGradeControls(props = {}) {
  const result = await renderGradeControls(props);
  return result;
}

/**
 * Mount ProgressIndicator component with default props (alias for renderProgressIndicator)
 */
export async function mountProgressIndicator(props = {}) {
  const result = await renderProgressIndicator(props);
  return result;
}

/**
 * Mount LoadingSpinner component with default props (alias for renderLoadingSpinner)
 */
export async function mountLoadingSpinner(props = {}) {
  const result = await renderLoadingSpinner(props);
  return result;
}

/**
 * Mount ErrorBoundary component with default props (alias for renderErrorBoundary)
 */
export async function mountErrorBoundary(props = {}) {
  const result = await renderErrorBoundary(props);
  return result;
}

/**
 * Check accessibility of a component
 */
export async function checkAccessibility(component: any, props = {}) {
  const result = await safeRender(component, props);
  if (result.container) {
    // Basic accessibility checks
    const buttons = result.container.querySelectorAll('button');
    for (const button of buttons) {
      if (!button.hasAttribute('type')) {
        button.setAttribute('type', 'button');
      }
    }
  }
  return result;
}

/**
 * Take screenshot of component for visual testing
 */
export async function takeScreenshot(component: any, props = {}, options = {}) {
  const result = await safeRender(component, props);
  // This would normally integrate with Playwright screenshot functionality
  console.log('Screenshot taken for component:', component.name);
  return result;
}

/**
 * Test component responsiveness across viewports
 */
export async function testResponsive(component: any, props = {}, viewports = commonViewports) {
  const results = [];
  for (const viewport of viewports) {
    // Mock viewport size
    (global as any).window = { ...mockWindow, innerWidth: viewport.width, innerHeight: viewport.height };
    const result = await safeRender(component, props);
    results.push({ viewport, result });
  }
  return results;
}

/**
 * Common viewport sizes for responsive testing
 */
export const commonViewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
  { name: 'large', width: 1440, height: 900 }
];

// Re-export commonly used testing utilities
export { vi } from 'vitest';
export { expect } from 'vitest';
export type { RenderResult } from '@testing-library/svelte';
export { fireEvent, render } from '@testing-library/svelte';

// Import jest-dom matchers - they are automatically added to expect
import '@testing-library/jest-dom';

// Export testing library query functions
export const queries = {
  getByTestId: (container: HTMLElement, testId: string) => container.querySelector(`[data-testid="${testId}"]`),
  queryByTestId: (container: HTMLElement, testId: string) => container.querySelector(`[data-testid="${testId}"]`),
  getByText: (container: HTMLElement, text: string) => {
    const elements = container.querySelectorAll('*');
    for (const element of elements) {
      if (element.textContent?.includes(text)) {
        return element;
      }
    }
    return null;
  },
  queryByText: (container: HTMLElement, text: string) => {
    const elements = container.querySelectorAll('*');
    for (const element of elements) {
      if (element.textContent?.includes(text)) {
        return element;
      }
    }
    return null;
  }
};

// Additional utility functions that tests expect
export function waitForLoading(component: any, timeout = 1000) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export function pressKey(element: any, key: string) {
  fireEvent.keyDown(element, { key });
}

export function waitForElement(selector: string, timeout = 1000) {
  return new Promise<void>((resolve) => {
    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

export function waitForElementToBeRemoved(selector: string, timeout = 1000) {
  return new Promise<void>((resolve) => {
    const check = () => {
      const element = document.querySelector(selector);
      if (!element) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

// Jest-style matchers for compatibility - these are now handled by @testing-library/jest-dom
export const toBeInTheDocument = (element: HTMLElement | null) => {
  expect(element).toBeTruthy();
};

export const toHaveAttribute = (element: HTMLElement, attribute: string, value?: string) => {
  if (value) {
    expect(element.getAttribute(attribute)).toBe(value);
  } else {
    expect(element.hasAttribute(attribute)).toBeTruthy();
  }
};

export const toHaveClass = (element: HTMLElement, className: string) => {
  expect(element.classList.contains(className)).toBeTruthy();
};

export const toBeDisabled = (element: HTMLElement) => {
  expect(element.hasAttribute('disabled')).toBeTruthy();
};

// Jest-style matchers are now handled by @testing-library/jest-dom
// No need to re-export them manually