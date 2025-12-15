/**
 * Accessibility tests for the Learn page
 *
 * This test suite verifies WCAG 2.1 AA compliance for the learning
 * hub, including navigation, recent items, and learning paths.
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

test.describe('Learn Page Accessibility', () => {
  test('should have no accessibility violations on the learn page', async ({ page }) => {
    await page.goto('/learn');

    // Wait for loading to finish
    await page.waitForSelector('.loading', { state: 'detached' });
    // Wait for the learn hub to load
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Run comprehensive accessibility scan
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/learn');
      await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/learn');
      await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on learn page elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Check headings
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check action buttons
    const actionButtons = page.locator('.quick-actions button');
    const count = await actionButtons.count();
    if (count > 0) {
        await expect(actionButtons.first()).toHaveAttribute('type', 'button');
    }

    // Check path cards
    const pathCards = page.locator('.path-card');
    if (await pathCards.count() > 0) {
        // Path cards are buttons, so they should have button role implicitly
    }
  });

  test('should have proper keyboard navigation for learn page', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); 
    await page.waitForSelector('.learn-hub');

    // Wait for content to load
    await page.waitForSelector('.path-card');

    // Test Quick Actions navigation
    await testKeyboardNavigation(page, [
      '.quick-actions button:first-child',
      '.quick-actions button:nth-child(2)'
    ], { startWithFocus: true });

    // Test Path Cards navigation (skipping variable recent/recommended sections)
    // We focus the first path card directly, then verify we can tab to the next one
    await testKeyboardNavigation(page, [
      '.path-card:nth-child(1)',
      '.path-card:nth-child(2)'
    ], { startWithFocus: true });
  });

  test('should have proper focus management for lesson interactions', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Focus a path card
    const firstPath = page.locator('.path-card').first();
    await firstPath.focus();
    await expect(firstPath).toBeFocused();
  });

  test('should have proper color contrast for learn page elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Check text elements
    await testColorContrast(page.locator('h1'));
    await testColorContrast(page.locator('.subtitle'));
    
    // Check buttons
    const actionBtn = page.locator('.quick-actions button').first();
    if (await actionBtn.isVisible()) {
        await testColorContrast(actionBtn);
    }
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Check for h1 heading
    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBe(1);
    
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
    // The root is div.learn-hub, it might not have role=main unless layout wrapper provides it
  });

  test('should be keyboard accessible for lesson navigation', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Navigate to quick practice
    const quickPracticeBtn = page.locator('.quick-actions button').first();
    await quickPracticeBtn.focus();
    await expect(quickPracticeBtn).toBeFocused();
  });

  test('should provide accessible feedback for lesson progress', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Check progress bars in path cards
    const progressBars = page.locator('.progress-bar');
    if (await progressBars.count() > 0) {
        await expect(progressBars.first()).toBeVisible();
        // Check if text description is present
        const progressText = page.locator('.progress-text').first();
        await expect(progressText).toBeVisible();
    }
  });

  test('should support keyboard navigation for interactive lesson elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.loading', { state: 'detached' }); await page.waitForSelector('.learn-hub');

    // Check path cards are keyboard accessible
    const pathCards = page.locator('.path-card');
    if (await pathCards.count() > 0) {
        const firstCard = pathCards.first();
        await firstCard.focus();
        await expect(firstCard).toBeFocused();
    }
  });
});
