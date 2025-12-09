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

    // Wait for the vocabulary page to load
    await page.waitForSelector('.page-grid');

    // Run comprehensive accessibility scan
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/vocabulary');
      await page.waitForSelector('ul.vocabulary-list');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/vocabulary');
      await page.waitForSelector('ul.vocabulary-list');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on vocabulary page elements', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.page-grid');

    // Check search input
    await testAriaAttributes(page.locator('.search-input'), {
      'role': 'searchbox',
      'placeholder': /Search vocabulary.../
    });

    // Check vocabulary list - it's inside .page-grid
    await testAriaAttributes(page.locator('ul.vocabulary-list'), {
      'role': 'list'
    });

    // Check vocabulary items
    const vocabularyItems = page.locator('ul.vocabulary-list li');
    const itemCount = await vocabularyItems.count();

    for (let i = 0; i < Math.min(itemCount, 5); i++) { // Test first 5 items
      await testAriaAttributes(vocabularyItems.nth(i), {
        'role': 'listitem'
      });
    }

    // Check load more button
    await testAriaAttributes(page.locator('button:has-text("Load More Vocabulary")'), {
      'role': 'button',
      'aria-label': /Load more vocabulary/
    });
  });

  test('should have proper keyboard navigation for vocabulary page', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.page-grid');

    // Test tab order of interactive elements
    const interactiveElements = [
      '.search-input',                // Search input
      'ul.vocabulary-list li:first-child', // First vocabulary item
      'button:has-text("Load More Vocabulary")' // Load more button
    ];

    await testKeyboardNavigation(page, interactiveElements, { startWithFocus: true });
  });

  test('should have proper focus management for vocabulary interactions', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.page-grid');

    // Test focus management for search
    await page.focus('.search-input');
    await expect(page.locator('.search-input')).toBeFocused();

    // Test focus management when clicking a vocabulary item
    const firstItem = page.locator('ul.vocabulary-list li').first();
    await firstItem.click();
    await expect(firstItem).toBeFocused();

    // Test focus management for load more button
    const loadMoreButton = page.locator('button:has-text("Load More Vocabulary")');
    await loadMoreButton.focus();
    await expect(loadMoreButton).toBeFocused();
  });

  test('should have proper color contrast for vocabulary elements', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.page-grid');

    // Check text elements
    await testColorContrast(page.locator('.search-input'));

    const vocabularyItems = page.locator('ul.vocabulary-list li');
    const itemCount = await vocabularyItems.count();
    for (let i = 0; i < Math.min(itemCount, 5); i++) { // Test first 5 items
      await testColorContrast(vocabularyItems.nth(i).locator('.word'));
      await testColorContrast(vocabularyItems.nth(i).locator('.translation'));
    }

    // Check interactive elements
    await testColorContrast(page.locator('button:has-text("Load More Vocabulary")'));
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.page-grid');

    // Check for h1 heading
    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBeGreaterThan(0);
    const h1Text = await page.textContent('h1');
    expect(h1Text).toMatch(/Bulgarian Vocabulary/i);

    // Check heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => {
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || ''
      }));
    });

    // Should have logical heading structure
    expect(headings.length).toBeGreaterThan(0);

    // Check landmarks
    const mainLandmark = await page.$('main, [role="main"]');
    expect(mainLandmark).not.toBeNull();

    const navLandmark = await page.$('nav, [role="navigation"]');
    expect(navLandmark).not.toBeNull();
  });

  test('should be keyboard accessible for search functionality', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.page-grid');

    // Focus search input
    await page.focus('.search-input');
    await expect(page.locator('.search-input')).toBeFocused();

    // Type search query
    await page.keyboard.type('Apple');
    await page.waitForSelector('ul.vocabulary-list li');

    // Test that search results are keyboard navigable
    const firstItem = page.locator('ul.vocabulary-list li').first();
    await expect(firstItem).toBeVisible();
  });

  test('should provide accessible feedback for search results', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.page-grid');

    // Test search with no results
    await page.fill('.search-input', 'xyzabc123');
    await page.waitForSelector('.no-results');

    const noResults = page.locator('.no-results');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText(/No vocabulary items match your search/i);

    // Test search with results
    await page.fill('.search-input', 'Apple');
    await page.waitForSelector('ul.vocabulary-list li');

    const resultsCount = await page.locator('ul.vocabulary-list li').count();
    expect(resultsCount).toBeGreaterThan(0);
  });
});