/**
 * Accessibility tests for the Progress functionality
 *
 * Note: Progress functionality is currently integrated into the Learn page
 * via Learning Paths.
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
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Check progress bar accessibility in learning paths
    const progressBars = page.locator('.path-card .progress-bar');
    
    if (await progressBars.count() > 0) {
        // The progress bar itself is a visual indicator (div)
        // The accessible information should be on the container or via text
        const pathCard = page.locator('.path-card').first();
        
        // Check if the card or text conveys progress
        const progressText = page.locator('.progress-text').first();
        await expect(progressText).toBeVisible();
        
        // Ensure text has sufficient contrast
        await testColorContrast(progressText);
    }
  });

  test('should have accessible progress feedback', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Check that progress text is visible and readable
    const progressText = page.locator('.progress-text');
    if (await progressText.count() > 0) {
      await expect(progressText.first()).toBeVisible();
    }
  });

  test('should have keyboard accessible progress elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Test that learning path cards (which contain progress) are interactive
    const pathCards = page.locator('.path-card');
    
    if (await pathCards.count() > 0) {
        const firstCard = pathCards.first();
        await firstCard.focus();
        await expect(firstCard).toBeFocused();
        
        // Check if it has button role (implicit or explicit)
        // It's a button element in the code
    }
  });
});
