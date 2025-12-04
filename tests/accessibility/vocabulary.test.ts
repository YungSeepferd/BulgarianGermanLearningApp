/**
 * Accessibility tests for the Vocabulary page
 *
 * This test suite verifies WCAG 2.1 AA compliance for the vocabulary
 * browsing, searching, and filtering functionality.
 */

import { test, expect } from '@playwright/test';
import {
  expectNoAccessibilityViolations,
  testKeyboardNavigation,
  testAriaAttributes,
  testColorContrast,
  testFocusManagement,
  testResponsiveAccessibility,
  testDarkModeAccessibility
} from '../accessibility-utils';

test.describe('Vocabulary Page Accessibility', () => {
  test('should have no accessibility violations on the vocabulary page', async ({ page }) => {
    await page.goto('/vocabulary');

    // Wait for the vocabulary list to load
    await page.waitForSelector('.vocabulary-list');

    // Run comprehensive accessibility scan
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/vocabulary');
      await page.waitForSelector('.vocabulary-list');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/vocabulary');
      await page.waitForSelector('.vocabulary-list');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on vocabulary page elements', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.vocabulary-list');

    // Check search input
    await testAriaAttributes(page.locator('.vocabulary-search-input'), {
      'aria-label': /Search vocabulary/,
      'role': 'searchbox',
      'placeholder': /Search vocabulary.../
    });

    // Check filter controls
    await testAriaAttributes(page.locator('.vocabulary-filter'), {
      'role': 'region',
      'aria-label': /Vocabulary filters/
    });

    // Check filter buttons
    const filterButtons = page.locator('.filter-btn');
    const buttonCount = await filterButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      await testAriaAttributes(filterButtons.nth(i), {
        'role': 'button',
        'aria-pressed': /true|false/
      });
    }

    // Check vocabulary list
    await testAriaAttributes(page.locator('.vocabulary-list'), {
      'role': 'list',
      'aria-label': /Vocabulary items/
    });

    // Check vocabulary items
    const vocabularyItems = page.locator('.vocabulary-item');
    const itemCount = await vocabularyItems.count();

    for (let i = 0; i < Math.min(itemCount, 5); i++) { // Test first 5 items
      await testAriaAttributes(vocabularyItems.nth(i), {
        'role': 'listitem',
        'aria-label': /Vocabulary item/
      });
    }
  });

  test('should have proper keyboard navigation for vocabulary page', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.vocabulary-list');

    // Test tab order of interactive elements
    const interactiveElements = [
      '.vocabulary-search-input',     // Search input
      '.filter-btn',                  // First filter button
      '.vocabulary-item',             // First vocabulary item
      '.favorite-btn',                // Favorite button (if exists)
      '.pagination-btn'               // Pagination button (if exists)
    ];

    await testKeyboardNavigation(page, interactiveElements, { startWithFocus: true });
  });

  test('should have proper focus management for vocabulary interactions', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.vocabulary-list');

    // Test focus management when selecting a vocabulary item
    const firstItem = page.locator('.vocabulary-item').first();
    await firstItem.click();
    await expect(firstItem).toBeFocused();

    // Test focus management when opening vocabulary details
    const detailsButton = page.locator('.vocabulary-details-btn').first();
    if (await detailsButton.isVisible()) {
      await testFocusManagement(
        page,
        '.vocabulary-details-btn',     // Trigger: details button
        '.vocabulary-details-modal'    // Target: details modal
      );
    }

    // Test focus management for search results
    await page.fill('.vocabulary-search-input', 'test');
    await page.waitForSelector('.vocabulary-item');

    // Focus should stay on search input
    await expect(page.locator('.vocabulary-search-input')).toBeFocused();
  });

  test('should have proper color contrast for vocabulary elements', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.vocabulary-list');

    // Check text elements
    await testColorContrast(page.locator('.vocabulary-search-input'));
    await testColorContrast(page.locator('.filter-btn'));
    await testColorContrast(page.locator('.vocabulary-item .german-text'));
    await testColorContrast(page.locator('.vocabulary-item .bulgarian-text'));
    await testColorContrast(page.locator('.vocabulary-item .difficulty-indicator'));

    // Check interactive elements
    await testColorContrast(page.locator('.favorite-btn'));
    await testColorContrast(page.locator('.vocabulary-details-btn'));
    await testColorContrast(page.locator('.pagination-btn'));
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.vocabulary-list');

    // Check for h1 heading
    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBeGreaterThan(0);
    const h1Text = await page.textContent('h1');
    expect(h1Text).toMatch(/Vocabulary|Words|Dictionary/i);

    // Check heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => {
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || ''
      }));
    });

    // Should have logical heading structure
    expect(headings.length).toBeGreaterThan(2);

    // Check landmarks
    const mainLandmark = await page.$('main, [role="main"]');
    expect(mainLandmark).not.toBeNull();

    const searchRegion = await page.$('[role="search"]');
    expect(searchRegion).not.toBeNull();

    const listRegion = await page.$('[role="region"][aria-label*="vocabulary"]');
    expect(listRegion).not.toBeNull();
  });

  test('should be keyboard accessible for search and filter functionality', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.vocabulary-list');

    // Focus search input
    await page.focus('.vocabulary-search-input');
    await expect(page.locator('.vocabulary-search-input')).toBeFocused();

    // Type search query
    await page.keyboard.type('Hallo');
    await page.waitForSelector('.vocabulary-item');

    // Test arrow key navigation through search results
    await page.keyboard.press('ArrowDown');
    const firstItem = page.locator('.vocabulary-item').first();
    await expect(firstItem).toHaveAttribute('aria-selected', 'true');

    // Test Enter key to select item
    await page.keyboard.press('Enter');
    await expect(firstItem).toHaveClass(/active/);

    // Test filter buttons with keyboard
    const firstFilter = page.locator('.filter-btn').first();
    await firstFilter.focus();
    await expect(firstFilter).toBeFocused();

    // Test Space key to toggle filter
    const initialAriaPressed = await firstFilter.getAttribute('aria-pressed');
    await page.keyboard.press('Space');
    const toggledAriaPressed = await firstFilter.getAttribute('aria-pressed');
    expect(toggledAriaPressed).not.toBe(initialAriaPressed);
  });

  test('should provide accessible feedback for search results', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.vocabulary-list');

    // Test search with no results
    await page.fill('.vocabulary-search-input', 'xyzabc123');
    await page.waitForSelector('.no-results');

    const noResults = page.locator('.no-results');
    await expect(noResults).toHaveAttribute('aria-live', 'polite');
    await expect(noResults).toContainText(/No vocabulary found/i);

    // Test search with results
    await page.fill('.vocabulary-search-input', 'Hallo');
    await page.waitForSelector('.vocabulary-item');

    const resultsCount = await page.locator('.vocabulary-item').count();
    expect(resultsCount).toBeGreaterThan(0);

    // Results status should be announced
    const resultsStatus = page.locator('.results-status');
    if (await resultsStatus.isVisible()) {
      await expect(resultsStatus).toHaveAttribute('aria-live', 'polite');
      await expect(resultsStatus).toContainText(new RegExp(`${resultsCount} result(s)? found`, 'i'));
    }
  });
});