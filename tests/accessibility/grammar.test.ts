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
    await page.waitForSelector('.page');
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/grammar');
      await page.waitForSelector('.page');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/grammar');
      await page.waitForSelector('.page');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on grammar page elements', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.page');

    // Check search input
    // Note: Placeholder depends on language mode, matching German default
    await testAriaAttributes(page.locator('#search'), {
      'role': 'searchbox',
      'placeholder': /Nach Regel, Beispiel oder Beschreibung suchen...|Намерете време, пример или описание.../
    });

    // Check toggle checkbox
    await testAriaAttributes(page.locator('.toggle input[type="checkbox"]'), {
      'aria-label': /Beispiele anzeigen|Покажи примерите/
    });

    // Check table structure
    // Note: .page is now a <main> element
    await testAriaAttributes(page.locator('.page'), {
      'aria-label': /Grammatikregeln|Граматични правила/
    });

    // The table wrapper has the role region and label
    await testAriaAttributes(page.locator('.table-wrapper'), {
      'role': 'region',
      'aria-label': /Таблица с граматични правила/
    });

    const tableHeaders = page.locator('table.grammar-table th');
    const headerCount = await tableHeaders.count();

    for (let i = 0; i < headerCount; i++) {
      await testAriaAttributes(tableHeaders.nth(i), {
        'scope': 'col'
      });
    }
  });

  test('should have proper keyboard navigation for grammar page', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.page');

    const interactiveElements = [
      '#search',
      '.toggle input[type="checkbox"]'
    ];

    await testKeyboardNavigation(page, interactiveElements, { startWithFocus: true });
  });

  test('should have proper focus management for grammar interactions', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.page');

    // Test focus management for search
    await page.focus('#search');
    await expect(page.locator('#search')).toBeFocused();

    // Test focus management for toggle
    const toggleCheckbox = page.locator('.toggle input[type="checkbox"]');
    await toggleCheckbox.focus();
    await expect(toggleCheckbox).toBeFocused();
  });

  test('should have proper color contrast for grammar elements', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.page');

    await testColorContrast(page.locator('#search'));
    await testColorContrast(page.locator('.toggle label').first());
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
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.page');

    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBeGreaterThan(0);
    const h1Text = await page.textContent('h1');
    expect(h1Text).toMatch(/Klare Regeln|Ясни правила/i);

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
    await page.waitForSelector('.page');

    // Test keyboard navigation for search functionality
    await page.focus('#search');
    await expect(page.locator('#search')).toBeFocused();

    // Search for "Präsens" (German) or "Сегашно" (Bulgarian)
    await page.keyboard.type('Präsens');
    await page.waitForSelector('table.grammar-table tr');

    // Test that table rows are keyboard navigable
    const firstRow = page.locator('table.grammar-table tr').first();
    await expect(firstRow).toBeVisible();
  });

  test('should provide accessible feedback for grammar interactions', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.page');

    // Test that search provides accessible feedback
    await page.fill('#search', 'xyzabc123');
    await page.waitForSelector('.empty');

    const noResults = page.locator('.empty');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText(/Keine Treffer|Няма съвпадения/i);

    // Test that search with results works
    await page.fill('#search', 'Präsens');
    await page.waitForSelector('table.grammar-table tr');

    const rows = page.locator('table.grammar-table tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(1);
  });

  test('should support keyboard navigation for grammar interactions', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.page');

    // Test toggle checkbox with keyboard
    const toggleCheckbox = page.locator('.toggle input[type="checkbox"]');
    await toggleCheckbox.focus();
    await expect(toggleCheckbox).toBeFocused();

    const initialChecked = await toggleCheckbox.isChecked();
    await page.keyboard.press('Space');
    const toggledChecked = await toggleCheckbox.isChecked();
    expect(toggledChecked).not.toBe(initialChecked);
  });
});