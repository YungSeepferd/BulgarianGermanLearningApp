// Accessibility tests for the application
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should have no accessibility violations on the practice page', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the page to load
    await page.waitForSelector('.practice-card');

    // Run axe accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();

    // Log violations if any
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      console.log(accessibilityScanResults.violations);
    }

    // Assert no critical violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations on the search page', async ({ page }) => {
    await page.goto('/practice');

    // Switch to search mode
    await page.locator('.mode-btn:has-text("Search")').click();

    // Wait for the search interface to load
    await page.waitForSelector('.search-section');

    // Run axe accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();

    // Log violations if any
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      console.log(accessibilityScanResults.violations);
    }

    // Assert no critical violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA attributes on interactive elements', async ({ page }) => {
    await page.goto('/practice');

    // Check toggle direction button
    const toggleButton = page.locator('.toggle-btn');
    await expect(toggleButton).toHaveAttribute('aria-label', /Toggle translation direction/);

    // Check mode buttons
    const practiceButton = page.locator('.mode-btn:has-text("Practice")');
    const searchButton = page.locator('.mode-btn:has-text("Search")');

    await expect(practiceButton).toHaveAttribute('aria-label', /Switch to practice mode/);
    await expect(searchButton).toHaveAttribute('aria-label', /Switch to search mode/);

    // Check answer input
    const answerInput = page.locator('.answer-input');
    await expect(answerInput).toHaveAttribute('aria-label', 'Type your answer here...');

    // Check check answer button
    const checkButton = page.locator('.btn-primary:has-text("Check Answer")');
    await expect(checkButton).toHaveAttribute('aria-disabled', 'false');
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/practice');

    // Focus the toggle direction button
    await page.locator('.toggle-btn').focus();

    // Press Tab to move to next focusable element
    await page.keyboard.press('Tab');

    // Verify we've moved to the practice mode button
    const activeElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(activeElement).toContain('Practice');

    // Press Tab again to move to search mode button
    await page.keyboard.press('Tab');

    // Verify we've moved to the search mode button
    const activeElement2 = await page.evaluate(() => document.activeElement?.textContent);
    expect(activeElement2).toContain('Search');

    // Press Tab to move to answer input
    await page.keyboard.press('Tab');

    // Verify we've moved to the answer input
    const activeElement3 = await page.evaluate(() => document.activeElement?.className);
    expect(activeElement3).toContain('answer-input');
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/practice');

    // Check text contrast on various elements
    const questionText = page.locator('.question-text');
    const answerText = page.locator('.answer');
    const directionText = page.locator('.direction-text');

    // This is a simplified check - in a real application you might want to use a more sophisticated contrast checker
    await expect(questionText).toHaveCSS('color', /#2c3e50/);
    await expect(answerText).toHaveCSS('color', /#007bff/);
    await expect(directionText).toHaveCSS('color', /#495057/);

    // Check background contrast
    await expect(page.locator('.practice-card')).toHaveCSS('background-color', /white/);
    await expect(page.locator('.feedback-section.correct')).toHaveCSS('background-color', /#d4edda/);
    await expect(page.locator('.feedback-section.incorrect')).toHaveCSS('background-color', /#f8d7da/);
  });
});