import { test, expect } from '@playwright/test';
import { createMockVocabulary, createMockSessionStats } from '../test-utils';
import type { VocabularyItem, SessionStats } from '$lib/types';

test.describe('Practice Session Integration Tests', () => {
  let mockVocabulary: VocabularyItem[];
  let mockSessionStats: SessionStats;

  test.beforeEach(async () => {
    mockVocabulary = createMockVocabulary(10);
    mockSessionStats = createMockSessionStats();
  });

  test('complete practice session workflow', async ({ page }) => {
    // Navigate to practice page
    await page.goto('/practice');

    // Wait for page to load
    await expect(page.locator('[data-testid="practice-page"]')).toBeVisible();

    // Check initial state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator('[data-testid="flashcard-container"]')).not.toBeVisible();

    // Wait for vocabulary to load
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    // Verify flashcard is displayed
    await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="flashcard-front"]')).toBeVisible();
    await expect(page.locator('[data-testid="grade-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();

    // Test card flipping
    const flashcard = page.locator('[data-testid="flashcard-container"]');
    await flashcard.click();
    await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();
    await expect(page.locator('[data-testid="flashcard-front"]')).not.toBeVisible();

    // Test keyboard shortcuts
    await page.keyboard.press('Space');
    await expect(page.locator('[data-testid="flashcard-front"]')).toBeVisible();
    await expect(page.locator('[data-testid="flashcard-back"]')).not.toBeVisible();

    // Test grading
    await page.keyboard.press('Space'); // Flip card
    await page.keyboard.press('3'); // Grade 3 (medium difficulty)
    
    // Wait for next card to load
    await page.waitForTimeout(500);
    
    // Verify progress updated
    const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
    expect(progressText).toContain('1 / 10');

    // Continue through session
    for (let i = 2; i <= 5; i++) {
      await page.keyboard.press('Space'); // Flip card
      await page.keyboard.press('4'); // Grade 4
      await page.waitForTimeout(300);
    }

    // Check session stats
    await page.locator('[data-testid="session-stats-toggle"]').click();
    await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
    
    const statsText = await page.locator('[data-testid="session-stats"]').textContent();
    expect(statsText).toContain('Cards Studied: 5');
    expect(statsText).toContain('Average Grade: 3.6');
  });

  test('practice session with error handling', async ({ page }) => {
    // Mock API failure
    await page.route('/api/vocabulary/A1', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load vocabulary' })
      });
    });

    await page.goto('/practice');

    // Should show error boundary
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load vocabulary');

    // Test retry functionality
    await page.locator('[data-testid="retry-button"]').click();
    
    // Should show loading state again
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('practice session accessibility', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    // Check accessibility
    await expect(page.locator('[data-testid="flashcard-container"]')).toHaveAttribute('role', 'article');
    await expect(page.locator('[data-testid="flashcard-container"]')).toHaveAttribute('aria-label');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="flashcard-container"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="grade-button-1"]')).toBeFocused();
    
    // Test screen reader announcements
    const flashcard = page.locator('[data-testid="flashcard-container"]');
    await flashcard.click();
    
    // Should announce card flip
    await expect(page.locator('[data-testid="sr-live-region"]')).toBeVisible();
  });

  test('practice session responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/practice');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    // Check mobile layout
    await expect(page.locator('[data-testid="flashcard-container"]')).toHaveClass(/mobile/);
    await expect(page.locator('[data-testid="grade-controls"]')).toHaveClass(/mobile/);

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="flashcard-container"]')).toHaveClass(/tablet/);

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="flashcard-container"]')).toHaveClass(/desktop/);
  });

  test('practice session performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/practice');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds

    // Test card flip performance
    const flipStartTime = Date.now();
    await page.locator('[data-testid="flashcard-container"]').click();
    await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();
    const flipTime = Date.now() - flipStartTime;
    
    expect(flipTime).toBeLessThan(500); // Flip should complete in under 500ms
  });

  test('practice session offline behavior', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    await page.goto('/practice');

    // Should show offline message or cached content
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Test that cached vocabulary still works
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible();
  });

  test('practice session data persistence', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    // Complete a few cards
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Space');
      await page.keyboard.press('3');
      await page.waitForTimeout(300);
    }

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    // Should restore session state
    const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
    expect(progressText).toContain('3 /');
  });

  test('practice session touch gestures', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    await page.goto('/practice');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    const flashcard = page.locator('[data-testid="flashcard-container"]');
    
    // Test swipe to flip
    await flashcard.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0);
    await page.mouse.up();
    
    await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();
    
    // Test swipe to grade
    await page.mouse.down();
    await page.mouse.move(200, 0);
    await page.mouse.up();
    
    // Should advance to next card
    await page.waitForTimeout(500);
    const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
    expect(progressText).toContain('1 /');
  });

  test('practice session with different vocabulary levels', async ({ page }) => {
    // Test A1 level
    await page.goto('/practice?level=A1');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
    
    const flashcard = page.locator('[data-testid="flashcard-front"]');
    const cardText = await flashcard.textContent();
    expect(cardText).toBeTruthy();

    // Test B1 level
    await page.goto('/practice?level=B1');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
    
    const b1CardText = await flashcard.textContent();
    expect(b1CardText).toBeTruthy();
  });

  test('practice session session completion', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    // Complete all cards
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Space');
      await page.keyboard.press('3');
      await page.waitForTimeout(300);
    }

    // Should show completion screen
    await expect(page.locator('[data-testid="session-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-summary"]')).toBeVisible();
    
    // Test starting new session
    await page.locator('[data-testid="new-session-button"]').click();
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
    
    // Should start fresh session
    const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
    expect(progressText).toContain('0 /');
  });
});

test.describe('Practice Session Component Integration', () => {
  test('Flashcard and GradeControls integration', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    // Flip card
    await page.locator('[data-testid="flashcard-container"]').click();
    await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();

    // Grade should be enabled after flip
    const gradeButtons = page.locator('[data-testid^="grade-button-"]');
    for (const button of await gradeButtons.all()) {
      await expect(button).toBeEnabled();
    }

    // Grade the card
    await page.locator('[data-testid="grade-button-4"]').click();
    
    // Should load next card
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="flashcard-front"]')).toBeVisible();
  });

  test('ProgressIndicator and SessionStats integration', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

    // Complete a card
    await page.keyboard.press('Space');
    await page.keyboard.press('3');
    await page.waitForTimeout(500);

    // Check progress indicator updated
    const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
    expect(progressText).toContain('1 /');

    // Check session stats updated
    await page.locator('[data-testid="session-stats-toggle"]').click();
    await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
    
    const statsText = await page.locator('[data-testid="session-stats"]').textContent();
    expect(statsText).toContain('Cards Studied: 1');
  });

  test('ErrorBoundary integration', async ({ page }) => {
    // Mock component error
    await page.addInitScript(() => {
      window.addEventListener('load', () => {
        throw new Error('Test error for ErrorBoundary');
      });
    });

    await page.goto('/practice');

    // Should show error boundary
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Test error for ErrorBoundary');
  });

  test('LoadingSpinner integration', async ({ page }) => {
    // Mock slow loading
    await page.route('/api/vocabulary/A1', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockVocabulary(10))
      });
    });

    await page.goto('/practice');

    // Should show loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Should hide loading after data loads
    await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });
});
