/**
 * Accessibility tests for the Progress page
 *
 * This test suite verifies WCAG 2.1 AA compliance for the progress tracking
 * dashboard and related components.
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

test.describe('Progress Page Accessibility', () => {
  test('should have no accessibility violations on the progress page', async ({ page }) => {
    await page.goto('/progress');

    // Wait for the progress dashboard to load
    await page.waitForSelector('.progress-dashboard');

    // Run comprehensive accessibility scan
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/progress');
      await page.waitForSelector('.progress-dashboard');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/progress');
      await page.waitForSelector('.progress-dashboard');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on progress dashboard elements', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForSelector('.progress-dashboard');

    // Check progress cards
    const progressCards = page.locator('.progress-card');
    await expect(progressCards).toHaveCount(6); // Should have 6 progress cards

    // Check level card
    await testAriaAttributes(page.locator('.level-card'), {
      'role': 'region',
      'aria-label': /Level and XP progress/
    });

    // Check daily goal card
    await testAriaAttributes(page.locator('.daily-goal-card'), {
      'role': 'region',
      'aria-label': /Daily goal progress/
    });

    // Check progress bars
    const progressBars = page.locator('[role="progressbar"]');
    const barCount = await progressBars.count();

    for (let i = 0; i < barCount; i++) {
      const bar = progressBars.nth(i);
      await testAriaAttributes(bar, {
        'role': 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': '100'
      });

      // Verify progress bar has a valid value
      const valueNow = await bar.getAttribute('aria-valuenow');
      expect(parseInt(valueNow || '0')).toBeGreaterThanOrEqual(0);
      expect(parseInt(valueNow || '100')).toBeLessThanOrEqual(100);
    }
  });

  test('should have proper keyboard navigation for progress dashboard', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForSelector('.progress-dashboard');

    // Test tab order of interactive elements
    const interactiveElements = [
      '.level-card',            // Level card
      '.daily-goal-card',       // Daily goal card
      '.streak-card',           // Streak card
      '.vocabulary-card',       // Vocabulary card
      '.lessons-card',          // Lessons card
      '.recent-activity-card',  // Recent activity card
      '.export-btn'             // Export button (if exists)
    ];

    await testKeyboardNavigation(page, interactiveElements, { startWithFocus: true });
  });

  test('should have proper focus management for interactive elements', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForSelector('.progress-dashboard');

    // Test focus management for level up modal (if it appears)
    const levelUpModal = page.locator('.level-up-modal');
    if (await levelUpModal.isVisible()) {
      await testFocusManagement(
        page,
        '.level-up-modal',       // Modal trigger
        '.level-up-modal h2'     // Modal heading should receive focus
      );
    }

    // Test focus management for tooltips
    const tooltipTriggers = page.locator('[aria-haspopup="tooltip"]');
    const tooltipCount = await tooltipTriggers.count();

    for (let i = 0; i < tooltipCount; i++) {
      const trigger = tooltipTriggers.nth(i);
      await trigger.hover();
      await page.waitForSelector('.tooltip:visible');

      // Tooltip should be accessible via keyboard
      await expect(page.locator('.tooltip:visible')).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('should have proper color contrast for progress elements', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForSelector('.progress-dashboard');

    // Check text elements
    await testColorContrast(page.locator('.level-text'));
    await testColorContrast(page.locator('.xp-text'));
    await testColorContrast(page.locator('.streak-text'));
    await testColorContrast(page.locator('.vocabulary-stats'));
    await testColorContrast(page.locator('.lesson-stats'));

    // Check progress bars
    const progressBars = page.locator('[role="progressbar"]');
    const barCount = await progressBars.count();

    for (let i = 0; i < barCount; i++) {
      await testColorContrast(progressBars.nth(i));
    }

    // Check interactive elements
    await testColorContrast(page.locator('.export-btn'));
    await testColorContrast(page.locator('.settings-btn'));
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForSelector('.progress-dashboard');

    // Check for h1 heading
    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBeGreaterThan(0);
    const h1Text = await page.textContent('h1');
    expect(h1Text).toMatch(/Progress|Dashboard/i);

    // Check heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => {
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || ''
      }));
    });

    // Should have logical heading structure
    expect(headings.length).toBeGreaterThan(3);

    // Check landmarks
    const mainLandmark = await page.$('main, [role="main"]');
    expect(mainLandmark).not.toBeNull();

    const regionLandmarks = await page.$$('[role="region"]');
    expect(regionLandmarks.length).toBeGreaterThan(3); // Should have multiple regions
  });

  test('should be keyboard accessible for all interactive elements', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForSelector('.progress-dashboard');

    // Test all interactive elements are keyboard accessible
    const interactiveSelectors = [
      '.export-btn',
      '.settings-btn',
      '[aria-haspopup="dialog"]',
      '[aria-haspopup="tooltip"]',
      '[role="button"]'
    ];

    for (const selector of interactiveSelectors) {
      const elements = await page.$$(selector);
      for (let i = 0; i < elements.length; i++) {
        const element = page.locator(selector).nth(i);

        // Element should be focusable
        await element.focus();
        await expect(element).toBeFocused();

        // Element should have proper ARIA attributes
        await expect(element).toHaveAttribute('tabindex', /0|-1/);

        // If it's a button, it should be operable with Enter/Space
        if (await element.getAttribute('role') === 'button') {
          // Test Enter key
          await element.click({ force: true }); // Some buttons might be hidden

          // Test Space key
          await element.focus();
          await page.keyboard.press('Space');
        }
      }
    }
  });

  test('should provide accessible feedback for level up events', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForSelector('.progress-dashboard');

    // Check if level up modal exists and is accessible
    const levelUpModal = page.locator('.level-up-modal');
    if (await levelUpModal.isVisible()) {
      await expect(levelUpModal).toHaveAttribute('aria-live', 'assertive');
      await expect(levelUpModal).toHaveAttribute('role', 'alertdialog');

      // Check modal has proper focus management
      const modalHeading = levelUpModal.locator('h2');
      await expect(modalHeading).toBeFocused();

      // Check modal has close button
      const closeButton = levelUpModal.locator('[aria-label="Close"]');
      await expect(closeButton).toBeVisible();
      await expect(closeButton).toHaveAttribute('role', 'button');
    }

    // Check confetti animation is accessible
    const confettiCanvas = page.locator('.confetti-canvas');
    if (await confettiCanvas.isVisible()) {
      await expect(confettiCanvas).toHaveAttribute('aria-hidden', 'true');
    }
  });
});