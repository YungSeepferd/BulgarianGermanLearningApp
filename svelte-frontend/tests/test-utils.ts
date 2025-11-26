/**
 * Test Utilities and Fixtures
 * @file tests/test-utils.ts
 * @description Common utilities, fixtures, and helpers for SvelteKit component testing
 * @version 1.0.0
 * @updated November 2025
 */

import { expect, type Page, type Locator } from '@playwright/test';
import { mount } from '@playwright/experimental-ct-svelte';
import type { VocabularyItem, ReviewState, SessionStats } from '$lib/types/index.js';

// Mock data for testing
export const mockVocabularyItem: VocabularyItem = {
  id: 'test-word-1',
  word: 'здравей',
  translation: 'hello',
  source_lang: 'bg',
  target_lang: 'de',
  category: 'greetings',
  level: 'A1',
  notes: null,
  notes_bg_to_de: null,
  notes_de_to_bg: null,
  etymology: null,
  cultural_note: null,
  difficulty: 1,
  frequency: 100,
  examples: [
    {
      sentence: 'Здравей, как си?',
      translation: 'Hello, how are you?',
      context: 'informal greeting'
    }
  ],
  linguistic_note_bg_to_de: null,
  linguistic_note_de_to_bg: null,
  linguistic_note: null,
  audio_url: undefined
};

export const mockReviewState: ReviewState = {
  itemId: 'test-word-1',
  direction: 'bg-de',
  schemaVersion: 1,
  interval: 1,
  easeFactor: 2.5,
  repetitions: 0,
  phase: 1,
  nextReview: Date.now() + 86400000, // tomorrow
  lastReview: null,
  totalReviews: 0,
  correctAnswers: 0,
  correctStreak: 0,
  created: Date.now(),
  updated: Date.now()
};

export const mockSessionStats: SessionStats = {
  startTime: new Date(),
  endTime: null,
  totalCards: 10,
  reviewedCards: 3,
  correctAnswers: 2,
  grades: [3, 4, 5]
};

// Component mounting utilities
export async function mountFlashcard(props: {
  vocabularyItem: VocabularyItem;
  direction?: 'bg-de' | 'de-bg';
  onGrade?: (grade: number, state: ReviewState) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showProgress?: boolean;
  autoFlip?: boolean;
}) {
  return mount('./src/lib/components/Flashcard.svelte', {
    props: {
      direction: 'bg-de',
      showProgress: true,
      autoFlip: false,
      ...props
    }
  });
}

export async function mountGradeControls(props: {
  onGrade?: (grade: number) => void;
  compact?: boolean;
  showFeedback?: boolean;
}) {
  return mount('./src/lib/components/GradeControls.svelte', {
    props: {
      compact: false,
      showFeedback: true,
      ...props
    }
  });
}

export async function mountProgressIndicator(props: {
  sessionStats?: SessionStats;
  compact?: boolean;
}) {
  return mount('./src/lib/components/ProgressIndicator.svelte', {
    props: {
      sessionStats: mockSessionStats,
      compact: false,
      ...props
    }
  });
}

export async function mountSessionStats(props: {
  sessionStats?: SessionStats;
  direction?: 'bg-de' | 'de-bg' | 'all';
  showDetails?: boolean;
  showInsights?: boolean;
  compact?: boolean;
}) {
  return mount('./src/lib/components/SessionStats.svelte', {
    props: {
      sessionStats: mockSessionStats,
      direction: 'all',
      showDetails: true,
      showInsights: true,
      compact: false,
      ...props
    }
  });
}

export async function mountErrorBoundary(props: {
  error?: Error;
  fallback?: () => void;
}) {
  return mount('./src/lib/components/ErrorBoundary.svelte', {
    props: {
      error: new Error('Test error'),
      ...props
    }
  });
}

export async function mountLoadingSpinner(props: {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  text?: string;
  showText?: boolean;
  centered?: boolean;
  overlay?: boolean;
  fullscreen?: boolean;
}) {
  return mount('./src/lib/components/LoadingSpinner.svelte', {
    props: {
      size: 'medium',
      variant: 'spinner',
      color: 'primary',
      text: 'Loading...',
      showText: true,
      centered: true,
      overlay: false,
      fullscreen: false,
      ...props
    }
  });
}

// Accessibility testing utilities
export async function checkAccessibility(page: Page, component?: Locator) {
  const target = component || page;
  
  // Inject axe-core
  await target.evaluate(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js';
    script.onload = () => {
      (window as any).axe.run();
    };
    document.head.appendChild(script);
  });
  
  // Wait for axe to load
  await page.waitForTimeout(1000);
  
  // Run accessibility checks
  const results = await target.evaluate(() => {
    return (window as any).axe.run();
  });
  
  // Assert no violations
  expect(results.violations).toEqual([]);
  
  return results;
}

// Visual regression utilities
export async function takeScreenshot(page: Page, name: string, component?: Locator) {
  const target = component || page;
  
  // Wait for animations to complete
  await page.waitForTimeout(300);
  
  // Take screenshot
  await target.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: !component
  });
}

// Keyboard navigation utilities
export async function pressKey(page: Page, key: string) {
  await page.keyboard.press(key);
  await page.waitForTimeout(100); // Small delay for state updates
}

export async function testKeyboardNavigation(page: Page, component: Locator) {
  // Test Tab navigation
  await component.focus();
  await pressKey(page, 'Tab');
  
  // Test Enter/Space for activation
  await pressKey(page, 'Enter');
  await pressKey(page, 'Space');
  
  // Test Escape for closing/canceling
  await pressKey(page, 'Escape');
}

// Touch gesture utilities
export async function swipe(page: Page, component: Locator, direction: 'left' | 'right' | 'up' | 'down') {
  const box = await component.boundingBox();
  if (!box) throw new Error('Component not visible');
  
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  
  let endX = startX;
  let endY = startY;
  
  switch (direction) {
    case 'left':
      endX = box.x;
      break;
    case 'right':
      endX = box.x + box.width;
      break;
    case 'up':
      endY = box.y;
      break;
    case 'down':
      endY = box.y + box.height;
      break;
  }
  
  await page.touchscreen.tap(startX, startY);
  await page.touchscreen.move(startX, startY);
  await page.touchscreen.down();
  await page.touchscreen.move(endX, endY);
  await page.touchscreen.up();
  
  await page.waitForTimeout(300); // Wait for animation
}

// Animation testing utilities
export async function waitForAnimation(page: Page, selector: string) {
  const element = page.locator(selector);
  
  // Wait for animation to complete
  await element.waitFor({ state: 'visible' });
  await page.waitForTimeout(300); // Allow animation to complete
  
  return element;
}

// Form testing utilities
export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [field, value] of Object.entries(formData)) {
    await page.fill(`[name="${field}"]`, value);
  }
}

export async function submitForm(page: Page, buttonSelector = 'button[type="submit"]') {
  await page.click(buttonSelector);
  await page.waitForTimeout(200); // Wait for form submission
}

// Store testing utilities
export function createMockStore(initialState: any) {
  let state = initialState;
  const subscribers = new Set<() => void>();
  
  return {
    subscribe: (callback: () => void) => {
      subscribers.add(callback);
      callback();
      return () => subscribers.delete(callback);
    },
    update: (updater: (state: any) => any) => {
      state = updater(state);
      subscribers.forEach(callback => callback());
    },
    set: (newState: any) => {
      state = newState;
      subscribers.forEach(callback => callback());
    },
    getState: () => state
  };
}

// Error testing utilities
export async function expectError(page: Page, errorMessage: string) {
  const errorElement = page.locator('[role="alert"], .error-message, .error');
  await expect(errorElement).toBeVisible();
  await expect(errorElement).toContainText(errorMessage);
}

// Loading state testing utilities
export async function waitForLoading(page: Page, selector = '.loading, [aria-busy="true"]') {
  const loadingElement = page.locator(selector);
  await expect(loadingElement).toBeVisible();
  
  // Wait for loading to complete
  await expect(loadingElement).not.toBeVisible({ timeout: 10000 });
}

// Vocabulary creation utilities
export function createMockVocabulary(count: number): VocabularyItem[] {
  const vocabulary: VocabularyItem[] = [];
  
  for (let i = 0; i < count; i++) {
    vocabulary.push({
      ...mockVocabularyItem,
      id: `test-word-${i + 1}`,
      word: `здравей${i + 1}`,
      translation: `hello${i + 1}`,
      category: `greetings${i + 1}`,
      level: i % 6 === 0 ? 'A1' : i % 6 === 1 ? 'A2' : i % 6 === 2 ? 'B1' : i % 6 === 3 ? 'B2' : i % 6 === 4 ? 'C1' : 'C2'
    });
  }
  
  return vocabulary;
}

// Performance testing utilities
export async function measurePerformance(page: Page, action: () => Promise<void>) {
  const metrics = await page.evaluate(() => {
    const start = performance.now();
    return { start };
  });

  await action();

  const endMetrics = await page.evaluate(() => {
    const end = performance.now();
    return { end };
  });

  return {
    duration: endMetrics.end - metrics.start,
    startTime: metrics.start,
    endTime: endMetrics.end
  };
}

// Responsive testing utilities
export async function testResponsive(page: Page, component: Locator, viewports: Array<{ width: number; height: number; name: string }>) {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(200); // Allow for responsive adjustments
    
    // Take screenshot for visual regression
    await takeScreenshot(page, `${component}-responsive-${viewport.name}`, component);
    
    // Test accessibility at each viewport
    await checkAccessibility(page, component);
  }
}

// Common viewports for responsive testing
export const commonViewports = [
  { width: 320, height: 568, name: 'mobile' },    // iPhone SE
  { width: 375, height: 667, name: 'mobile-large' }, // iPhone 8
  { width: 768, height: 1024, name: 'tablet' },   // iPad
  { width: 1024, height: 768, name: 'tablet-landscape' },
  { width: 1280, height: 720, name: 'desktop' },
  { width: 1920, height: 1080, name: 'desktop-large' }
];
];