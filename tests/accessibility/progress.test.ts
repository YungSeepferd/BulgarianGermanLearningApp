/**
 * Accessibility tests for the Progress functionality
 *
 * Note: Progress functionality is currently integrated into the Learn page
 * and other components rather than having a dedicated /progress route.
 */
import { test, expect } from '@playwright/test';
import {
  expectNoAccessibilityViolations,
  testKeyboardNavigation,
  testAriaAttributes,
  testColorContrast,
  testFocusManagement
} from '../accessibility-utils';

test.describe('Progress Accessibility (Integrated)', () => {
  test('should have accessible progress indicators on learn page', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.progress-container');

    // Check progress bar accessibility
    const progressBar = page.locator('.progress-bar');
    await testAriaAttributes(progressBar, {
      'role': 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': '100'
    });

    // Check progress bar has a valid value
    const valueNow = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(valueNow || '0')).toBeGreaterThanOrEqual(0);
    expect(parseInt(valueNow || '100')).toBeLessThanOrEqual(100);

    // Check color contrast for progress elements
    await testColorContrast(page.locator('.progress-container'));
    await testColorContrast(page.locator('.xp-summary'));
    await testColorContrast(page.locator('.streak'));
  });

  test('should have accessible progress feedback', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.progress-container');

    // Check that progress updates are announced
    const xpSummary = page.locator('.xp-summary');
    if (await xpSummary.isVisible()) {
      await expect(xpSummary).toHaveAttribute('aria-live', 'polite');
    }

    const dailyGoal = page.locator('.daily-goal');
    if (await dailyGoal.isVisible()) {
      await expect(dailyGoal).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('should have keyboard accessible progress elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.progress-container');

    // Test that progress elements are part of tab order if interactive
    const interactiveElements = [
      '.btn-primary:has-text("Practice Again")',
      '.btn-secondary:has-text("Back to Dashboard")'
    ];

    for (const selector of interactiveElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        await element.focus();
        await expect(element).toBeFocused();
      }
    }
  });
});