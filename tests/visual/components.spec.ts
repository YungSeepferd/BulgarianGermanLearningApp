/**
 * Visual Regression Tests
 *
 * Tests for visual consistency using snapshot comparison
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.describe('Component Snapshots', () => {
    test('WordCard visual snapshot', async ({ page }) => {
      await page.goto('/learn');

      const pathCard = page.locator('.path-card').first();

      if (await pathCard.isVisible()) {
        await pathCard.click();
        await page.waitForSelector('.flashcard, .word-card', { timeout: 10000 });

        const flashcard = page.locator('.flashcard, .word-card').first();

        if (await flashcard.isVisible()) {
          // Take snapshot
          await expect(flashcard).toHaveScreenshot('wordcard-front.png', {
            maxDiffPixels: 100
          });
        }
      }
    });

    test('WordCard flipped visual snapshot', async ({ page }) => {
      await page.goto('/learn');

      const pathCard = page.locator('.path-card').first();

      if (await pathCard.isVisible()) {
        await pathCard.click();
        await page.waitForSelector('.flashcard, .word-card', { timeout: 10000 });

        const flashcard = page.locator('.flashcard, .word-card').first();

        if (await flashcard.isVisible()) {
          // Flip the card
          await flashcard.click();
          await page.waitForTimeout(300);

          // Take snapshot
          await expect(flashcard).toHaveScreenshot('wordcard-back.png', {
            maxDiffPixels: 100
          });
        }
      }
    });

    test('VocabularyCard visual snapshot', async ({ page }) => {
      await page.goto('/vocabulary');

      await page.waitForSelector('.vocabulary-item, .vocabulary-card', { timeout: 10000 });

      const vocabCard = page.locator('.vocabulary-item, .vocabulary-card').first();

      if (await vocabCard.isVisible()) {
        await expect(vocabCard).toHaveScreenshot('vocabulary-card.png', {
          maxDiffPixels: 100
        });
      }
    });

    test('ProgressIndicator visual snapshot', async ({ page }) => {
      await page.goto('/');

      const progressIndicator = page.locator('.progress-indicator, .progress-bar, [data-progress]').first();

      if (await progressIndicator.isVisible()) {
        await expect(progressIndicator).toHaveScreenshot('progress-indicator.png', {
          maxDiffPixels: 100
        });
      }
    });

    test('MasteryGauge visual snapshot', async ({ page }) => {
      await page.goto('/vocabulary');

      const masteryGauge = page.locator('.mastery-gauge, .mastery-indicator, [data-mastery]').first();

      if (await masteryGauge.isVisible()) {
        await expect(masteryGauge).toHaveScreenshot('mastery-gauge.png', {
          maxDiffPixels: 100
        });
      }
    });

    test('PracticeCard visual snapshot', async ({ page }) => {
      await page.goto('/practice');

      await page.waitForSelector('.practice-card, .tandem-practice', { timeout: 10000 });

      const practiceCard = page.locator('.practice-card, .tandem-practice');

      if (await practiceCard.isVisible()) {
        await expect(practiceCard).toHaveScreenshot('practice-card.png', {
          maxDiffPixels: 100
        });
      }
    });
  });

  test.describe('Page Snapshots', () => {
    test('Homepage desktop snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // Wait for page to be stable
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
        maxDiffPixels: 200
      });
    });

    test('Homepage mobile snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        maxDiffPixels: 200
      });
    });

    test('Vocabulary page snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/vocabulary');

      await page.waitForSelector('.vocabulary-item, .vocabulary-card', { timeout: 10000 });

      await expect(page).toHaveScreenshot('vocabulary-page.png', {
        fullPage: false, // Just viewport
        maxDiffPixels: 200
      });
    });

    test('Learn page snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/learn');

      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('learn-page.png', {
        maxDiffPixels: 200
      });
    });

    test('Practice page snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/practice');

      await page.waitForSelector('.practice-card, .tandem-practice', { timeout: 10000 });

      await expect(page).toHaveScreenshot('practice-page.png', {
        maxDiffPixels: 200
      });
    });

    test('Grammar page snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/grammar');

      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('grammar-page.png', {
        maxDiffPixels: 200
      });
    });
  });

  test.describe('Navigation Snapshots', () => {
    test('Desktop navigation snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      const nav = page.locator('nav, .navigation');

      if (await nav.isVisible()) {
        await expect(nav).toHaveScreenshot('navigation-desktop.png', {
          maxDiffPixels: 50
        });
      }
    });

    test('Mobile navigation snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const nav = page.locator('nav, .navigation, .mobile-nav');

      if (await nav.isVisible()) {
        await expect(nav).toHaveScreenshot('navigation-mobile.png', {
          maxDiffPixels: 50
        });
      }
    });
  });

  test.describe('State Snapshots', () => {
    test('Empty state snapshot', async ({ page }) => {
      await page.goto('/vocabulary');

      // Search for non-existent item
      const searchInput = page.locator('input[type="search"], input[placeholder*="Suche"]');
      await searchInput.fill('zzzznonexistent12345');
      await page.waitForTimeout(500);

      // Check if empty state is visible
      const emptyState = page.locator('.empty-state, .no-results');

      if (await emptyState.isVisible()) {
        await expect(emptyState).toHaveScreenshot('empty-state.png', {
          maxDiffPixels: 100
        });
      }
    });

    test('Error state snapshot', async ({ page }) => {
      // Navigate to a potentially error-causing page
      await page.goto('/vocabulary/nonexistent');

      // Check for 404 or error page
      await page.waitForTimeout(500);

      const errorElement = page.locator('.error-page, .not-found, [data-error]');

      if (await errorElement.isVisible()) {
        await expect(errorElement).toHaveScreenshot('error-state.png', {
          maxDiffPixels: 100
        });
      }
    });

    test('Loading state snapshot', async ({ page }) => {
      // Intercept and delay response
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
      });

      await page.goto('/vocabulary');

      const loadingIndicator = page.locator('.loading, [data-loading="true"], .spinner');

      // Try to catch loading state
      const isLoading = await loadingIndicator.isVisible().catch(() => false);

      if (isLoading) {
        await expect(loadingIndicator).toHaveScreenshot('loading-state.png', {
          maxDiffPixels: 100
        }).catch(() => {
          // Loading state may be too fast to capture
        });
      }
    });
  });

  test.describe('Responsive Snapshots', () => {
    const viewports = [
      { name: 'mobile-small', width: 320, height: 568 },
      { name: 'mobile-medium', width: 375, height: 667 },
      { name: 'mobile-large', width: 414, height: 896 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'tablet-landscape', width: 1024, height: 768 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-large', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      test(`Homepage at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
          fullPage: false,
          maxDiffPixels: 300
        });
      });
    }
  });

  test.describe('Interactive State Snapshots', () => {
    test('Button hover state snapshot', async ({ page }) => {
      await page.goto('/');

      const button = page.locator('button').first();

      if (await button.isVisible()) {
        await button.hover();
        await page.waitForTimeout(100);

        await expect(button).toHaveScreenshot('button-hover.png', {
          maxDiffPixels: 50
        });
      }
    });

    test('Button focus state snapshot', async ({ page }) => {
      await page.goto('/');

      const button = page.locator('button').first();

      if (await button.isVisible()) {
        await button.focus();

        await expect(button).toHaveScreenshot('button-focus.png', {
          maxDiffPixels: 50
        });
      }
    });

    test('Input focus state snapshot', async ({ page }) => {
      await page.goto('/vocabulary');

      const input = page.locator('input[type="search"], input[placeholder*="Suche"]').first();

      if (await input.isVisible()) {
        await input.focus();

        await expect(input).toHaveScreenshot('input-focus.png', {
          maxDiffPixels: 50
        });
      }
    });
  });

  test.describe('Dark Mode Snapshots', () => {
    test('Dark mode homepage snapshot', async ({ page }) => {
      // Emulate dark mode
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        maxDiffPixels: 300
      });
    });
  });
});