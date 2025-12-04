// Accessibility tests for the application
import { test, expect } from '@playwright/test';
import {
  runAccessibilityScan,
  expectNoAccessibilityViolations,
  testKeyboardNavigation,
  testAriaAttributes,
  testColorContrast,
  testFocusManagement,
  testResponsiveAccessibility,
  testDarkModeAccessibility
} from './accessibility-utils';

test.describe('Accessibility', () => {
  test.describe('Practice Page', () => {
    test('should have no accessibility violations on the practice page', async ({ page }) => {
      await page.goto('/practice');

      // Wait for the page to load
      await page.waitForSelector('.practice-card');

      // Run comprehensive accessibility scan
      await expectNoAccessibilityViolations(page);
    });

    test('should have no accessibility violations in responsive viewports', async ({ page }) => {
      await testResponsiveAccessibility(page, async (page) => {
        await page.goto('/practice');
        await page.waitForSelector('.practice-card');
        await expectNoAccessibilityViolations(page);
      });
    });

    test('should have no accessibility violations in dark mode', async ({ page }) => {
      await testDarkModeAccessibility(page, async (page) => {
        await page.goto('/practice');
        await page.waitForSelector('.practice-card');
        await expectNoAccessibilityViolations(page);
      });
    });

    test('should have proper ARIA attributes on interactive elements', async ({ page }) => {
      await page.goto('/practice');

      // Check toggle direction button
      await testAriaAttributes(page.locator('.toggle-btn'), {
        'aria-label': /Toggle translation direction/,
        'role': 'button'
      });

      // Check mode buttons
      await testAriaAttributes(page.locator('.mode-btn:has-text("Practice")'), {
        'aria-label': /Switch to practice mode/,
        'role': 'button'
      });

      await testAriaAttributes(page.locator('.mode-btn:has-text("Search")'), {
        'aria-label': /Switch to search mode/,
        'role': 'button'
      });

      // Check answer input
      await testAriaAttributes(page.locator('.answer-input'), {
        'aria-label': 'Type your answer here...',
        'role': 'textbox'
      });

      // Check check answer button
      await testAriaAttributes(page.locator('.btn-primary:has-text("Check Answer")'), {
        'aria-disabled': 'false',
        'role': 'button'
      });
    });

    test('should have proper keyboard navigation', async ({ page }) => {
      await page.goto('/practice');

      // Test tab order of interactive elements
      await testKeyboardNavigation(page, [
        '.toggle-btn',                          // Toggle direction button
        '.mode-btn:has-text("Practice")',       // Practice mode button
        '.mode-btn:has-text("Search")',         // Search mode button
        '.answer-input',                        // Answer input
        '.btn-primary:has-text("Check Answer")' // Check answer button
      ], { startWithFocus: true });
    });

    test('should have proper focus management for dynamic content', async ({ page }) => {
      await page.goto('/practice');

      // Test focus management when flipping a flashcard
      await testFocusManagement(
        page,
        '.flashcard',           // Trigger: click on flashcard
        '.flashcard'            // Target: same flashcard should receive focus
      );

      // Test focus management when showing feedback
      await page.click('.btn-primary:has-text("Check Answer")');
      await page.waitForSelector('.feedback-section.visible');

      // Feedback section should be focusable or have aria-live
      const feedbackSection = page.locator('.feedback-section.visible');
      await expect(feedbackSection).toHaveAttribute('aria-live', 'polite');
    });

    test('should have proper color contrast', async ({ page }) => {
      await page.goto('/practice');

      // Check text contrast on various elements
      await testColorContrast(page.locator('.question-text'));
      await testColorContrast(page.locator('.answer'));
      await testColorContrast(page.locator('.direction-text'));

      // Check interactive elements
      await testColorContrast(page.locator('.toggle-btn'));
      await testColorContrast(page.locator('.mode-btn:has-text("Practice")'));
      await testColorContrast(page.locator('.btn-primary:has-text("Check Answer")'));
    });

    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/practice');

      // Check for h1 heading
      const h1Headings = await page.$$('h1');
      expect(h1Headings.length).toBeGreaterThan(0);

      // Check heading hierarchy
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => {
        return elements.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim() || ''
        }));
      });

      // Should have at least one heading
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  test.describe('Search Mode', () => {
    test('should have no accessibility violations on the search page', async ({ page }) => {
      await page.goto('/practice');

      // Switch to search mode
      await page.locator('.mode-btn:has-text("Search")').click();

      // Wait for the search interface to load
      await page.waitForSelector('.search-section');

      // Run comprehensive accessibility scan
      await expectNoAccessibilityViolations(page);
    });

    test('should have proper ARIA attributes in search mode', async ({ page }) => {
      await page.goto('/practice');
      await page.locator('.mode-btn:has-text("Search")').click();
      await page.waitForSelector('.search-section');

      // Check search input
      await testAriaAttributes(page.locator('.search-input'), {
        'aria-label': /Search vocabulary/,
        'role': 'searchbox',
        'placeholder': /Search.../
      });

      // Check search results
      await page.fill('.search-input', 'test');
      await page.waitForSelector('.search-result-item');

      const firstResult = page.locator('.search-result-item').first();
      await testAriaAttributes(firstResult, {
        'role': 'option',
        'aria-selected': 'false'
      });
    });

    test('should have proper keyboard navigation in search mode', async ({ page }) => {
      await page.goto('/practice');
      await page.locator('.mode-btn:has-text("Search")').click();
      await page.waitForSelector('.search-section');

      // Test tab order in search mode
      await testKeyboardNavigation(page, [
        '.search-input',                        // Search input
        '.search-filter-btn',                   // Filter button (if exists)
        '.search-result-item'                   // First search result
      ], { startWithFocus: false });

      // Focus search input
      await page.focus('.search-input');
      await expect(page.locator('.search-input')).toBeFocused();

      // Test arrow key navigation between search results
      await page.fill('.search-input', 'test');
      await page.waitForSelector('.search-result-item');

      await page.keyboard.press('ArrowDown');
      const firstResult = page.locator('.search-result-item').first();
      await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    });
  });
});