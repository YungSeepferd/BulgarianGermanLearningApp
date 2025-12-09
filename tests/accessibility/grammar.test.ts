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

test.describe('Grammar Page Accessibility', () => {
  test('should have no accessibility violations on the grammar page', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/grammar');
      await page.waitForSelector('.grammar-container');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/grammar');
      await page.waitForSelector('.grammar-container');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on grammar page elements', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    // Check search input
    await testAriaAttributes(page.locator('.search-input'), {
      'role': 'searchbox',
      'aria-label': /Search grammar rules/,
      'placeholder': /Search grammar rules.../
    });

    // Check toggle checkbox
    await testAriaAttributes(page.locator('.toggle-container input[type="checkbox"]'), {
      'role': 'switch',
      'aria-label': /Show examples/
    });

    // Check table structure
    await testAriaAttributes(page.locator('.grammar-container'), {
      'role': 'region',
      'aria-label': /Grammar rules/
    });

    await testAriaAttributes(page.locator('table.grammar-table'), {
      'aria-label': /Grammar rules table/
    });

    const tableHeaders = page.locator('table.grammar-table th');
    const headerCount = await tableHeaders.count();

    for (let i = 0; i < headerCount; i++) {
      await testAriaAttributes(tableHeaders.nth(i), {
        'role': 'columnheader'
      });
    }
  });

  test('should have proper keyboard navigation for grammar page', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    const interactiveElements = [
      '.search-input',
      '.toggle-container input[type="checkbox"]',
      'button:has-text("Show More Examples")'
    ];

    await testKeyboardNavigation(page, interactiveElements, { startWithFocus: true });
  });

  test('should have proper focus management for grammar interactions', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    // Test focus management for search
    await page.focus('.search-input');
    await expect(page.locator('.search-input')).toBeFocused();

    // Test focus management for toggle
    const toggleCheckbox = page.locator('.toggle-container input[type="checkbox"]');
    await toggleCheckbox.focus();
    await expect(toggleCheckbox).toBeFocused();
  });

  test('should have proper color contrast for grammar elements', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    await testColorContrast(page.locator('.search-input'));
    await testColorContrast(page.locator('.toggle-container label'));
    const tableHeaders = page.locator('table.grammar-table th');
    const headerCount = await tableHeaders.count();
    for (let i = 0; i < headerCount; i++) {
      await testColorContrast(tableHeaders.nth(i));
    }
    const tableCells = page.locator('table.grammar-table td');
    const cellCount = await tableCells.count();
    for (let i = 0; i < Math.min(cellCount, 5); i++) { // Test first 5 cells
      await testColorContrast(tableCells.nth(i));
    }
    await testColorContrast(page.locator('button:has-text("Show More Examples")'));
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBeGreaterThan(0);
    const h1Text = await page.textContent('h1');
    expect(h1Text).toMatch(/Bulgarian Grammar Rules/i);

    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => {
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || ''
      }));
    });

    expect(headings.length).toBeGreaterThan(0);

    const mainLandmark = await page.$('main, [role="main"]');
    expect(mainLandmark).not.toBeNull();

    const navLandmark = await page.$('nav, [role="navigation"]');
    expect(navLandmark).not.toBeNull();
  });

  test('should be keyboard accessible for grammar exercises', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    // Test keyboard navigation for search functionality
    await page.focus('.search-input');
    await expect(page.locator('.search-input')).toBeFocused();

    await page.keyboard.type('Present');
    await page.waitForSelector('table.grammar-table tr');

    // Test that table rows are keyboard navigable
    const firstRow = page.locator('table.grammar-table tr').first();
    await expect(firstRow).toBeVisible();
  });

  test('should provide accessible feedback for grammar interactions', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    // Test that search provides accessible feedback
    await page.fill('.search-input', 'xyzabc123');
    await page.waitForSelector('.no-results');

    const noResults = page.locator('.no-results');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText(/No grammar rules match your search/i);

    // Test that search with results works
    await page.fill('.search-input', 'Present');
    await page.waitForSelector('table.grammar-table tr');

    const rows = page.locator('table.grammar-table tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(1);
  });

  test('should support keyboard navigation for grammar interactions', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    // Test toggle checkbox with keyboard
    const toggleCheckbox = page.locator('.toggle-container input[type="checkbox"]');
    await toggleCheckbox.focus();
    await expect(toggleCheckbox).toBeFocused();

    const initialChecked = await toggleCheckbox.getAttribute('checked') !== null;
    await page.keyboard.press('Space');
    const toggledChecked = await toggleCheckbox.getAttribute('checked') !== null;
    expect(toggledChecked).not.toBe(initialChecked);
  });
});