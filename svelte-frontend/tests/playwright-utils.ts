/**
 * Playwright Test Utilities for SvelteKit Components
 * @file tests/playwright-utils.ts
 * @description Utilities specifically for Playwright component testing
 * @version 1.0.0
 * @updated November 2025
 */

import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

// Mock data for testing
export const mockVocabularyItem = {
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

export const mockSessionStats = {
  startTime: new Date(),
  endTime: null,
  totalCards: 10,
  reviewedCards: 3,
  correctAnswers: 2,
  grades: [3, 4, 5]
};

// Extend Playwright test with custom fixtures
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('http://localhost:5173'); // Assuming dev server is running
    await use(page);
  }
});

// Component mounting utilities for Playwright
export async function mountFlashcard(page: Page, props = {}) {
  const defaultProps = {
    direction: 'bg-de',
    showProgress: true,
    autoFlip: false,
    vocabularyItem: mockVocabularyItem,
    ...props
  };
  
  // Navigate to a test page or use a test harness
  await page.goto('http://localhost:5173/test/flashcard');
  
  // Set component props via page context
  await page.evaluate((props) => {
    // This would be implemented with a proper test harness
    (window as any).testProps = props;
  }, defaultProps);
  
  return page.locator('[data-testid="flashcard-container"]');
}

export async function mountGradeControls(page: Page, props = {}) {
  const defaultProps = {
    compact: false,
    showFeedback: true,
    ...props
  };
  
  await page.goto('http://localhost:5173/test/grade-controls');
  
  
  return page.locator('[data-testid="grade-controls-container"]');
}

export async function mountErrorBoundary(page: Page, props = {}) {
  const defaultProps = {
    error: new Error('Test error'),
    ...props
  };
  
  await page.goto('http://localhost:5173/test/error-boundary');
  
  
  return page.locator('[data-testid="error-boundary-container"]');
}

// Event utilities for Playwright
export async function pressKey(page: Page, key: string) {
  await page.keyboard.press(key);
  await page.waitForTimeout(100); // Small delay for state updates
}

export async function clickElement(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.click();
  await page.waitForTimeout(100);
}

// Accessibility testing utilities for Playwright
export async function checkAccessibility(page: Page, component: any) {
  // This would integrate with axe-playwright or similar
  // For now, return a mock result
  return { violations: [] };
}

// Visual testing utilities
export async function takeScreenshot(page: Page, name: string, component?: any) {
  const element = component || page.locator('body');
  await element.screenshot({ path: `test-results/screenshots/${name}.png` });
}

// Responsive testing utilities
export const commonViewports = [
  { width: 320, height: 568, name: 'mobile' },    // iPhone SE
  { width: 375, height: 667, name: 'mobile-large' }, // iPhone 8
  { width: 768, height: 1024, name: 'tablet' },   // iPad
  { width: 1024, height: 768, name: 'tablet-landscape' },
  { width: 1280, height: 720, name: 'desktop' },
  { width: 1920, height: 1080, name: 'desktop-large' }
];

export async function testResponsive(page: Page, component: any, viewports: typeof commonViewports) {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(200); // Wait for responsive layout
    
    // Verify component is still visible and functional
    await expect(component).toBeVisible();
  }
}

// Keyboard navigation testing
export async function testKeyboardNavigation(page: Page, component: any) {
  await component.focus();
  
  // Test Tab navigation
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  
  // Test Enter/Space for activation
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
}

// Error testing utilities
export async function expectError(page: Page, errorMessage: string) {
  const errorElement = page.locator('[role="alert"]') || page.locator(`text=${errorMessage}`);
  await expect(errorElement).toBeVisible();
}

// Performance testing utilities
export async function measurePerformance(page: Page, action: () => Promise<void>) {
  const start = await page.evaluate(() => performance.now());
  await action();
  const end = await page.evaluate(() => performance.now());
  
  return {
    duration: end - start,
    startTime: start,
    endTime: end
  };
}

// Form testing utilities
export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [field, value] of Object.entries(formData)) {
    const input = page.locator(`input[name="${field}"]`) || page.locator(`label:has-text("${field}") + input`);
    await input.fill(value);
  }
}

export async function submitForm(page: Page, buttonSelector = 'button[type="submit"]') {
  const button = page.locator(buttonSelector) || page.locator('button:has-text("Submit")');
  await button.click();
  await page.waitForTimeout(200);
}