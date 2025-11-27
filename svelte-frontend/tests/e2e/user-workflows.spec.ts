import { test, expect } from '@playwright/test';

test.describe('End-to-End User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/');
    
    // Wait for app to load
    await expect(page.locator('body')).toBeVisible();
  });

  test.describe('Complete Learning Session Workflow', () => {
    test('user can complete a full learning session from start to finish', async ({ page }) => {
      // Navigate to practice page
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page).toHaveURL('/practice');
      
      // Wait for vocabulary to load
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Verify initial state
      await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('0 /');
      await expect(page.locator('[data-testid="flashcard-front"]')).toBeVisible();
      await expect(page.locator('[data-testid="grade-controls"]')).toBeVisible();
      
      // Complete first card
      await page.locator('[data-testid="flashcard-container"]').click();
      await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();
      
      // Grade the card
      await page.locator('[data-testid="grade-button-3"]').click();
      
      // Wait for next card
      await page.waitForTimeout(500);
      
      // Verify progress updated
      await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('1 /');
      
      // Complete several more cards
      for (let i = 2; i <= 5; i++) {
        await page.locator('[data-testid="flashcard-container"]').click();
        await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
        await page.locator('[data-testid="grade-button-4"]').click();
        await page.waitForTimeout(300);
      }
      
      // Check session statistics
      await page.locator('[data-testid="session-stats-toggle"]').click();
      await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
      
      const statsText = await page.locator('[data-testid="session-stats"]').textContent();
      expect(statsText).toContain('Cards Studied: 5');
      expect(statsText).toContain('Average Grade:');
      
      // Continue to complete session
      let cardsCompleted = 5;
      while (cardsCompleted < 10) {
        try {
          await page.locator('[data-testid="flashcard-container"]').click();
          await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible', timeout: 2000 });
          await page.locator('[data-testid="grade-button-3"]').click();
          await page.waitForTimeout(300);
          cardsCompleted++;
        } catch {
          // Session might be complete
          break;
        }
      }
      
      // Verify session completion
      if (cardsCompleted >= 10) {
        await expect(page.locator('[data-testid="session-complete"]')).toBeVisible();
        await expect(page.locator('[data-testid="session-summary"]')).toContainText('Session Complete!');
      }
    });

    test('user can pause and resume learning session', async ({ page }) => {
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Complete a few cards
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="flashcard-container"]').click();
        await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
        await page.locator('[data-testid="grade-button-3"]').click();
        await page.waitForTimeout(300);
      }
      
      // Navigate away from practice page
      await page.locator('[data-testid="nav-home"]').click();
      await expect(page).toHaveURL('/');
      
      // Return to practice page
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page).toHaveURL('/practice');
      
      // Verify session state is preserved
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible();
      const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
      expect(progressText).toContain('3 /');
      
      // Continue session
      await page.locator('[data-testid="flashcard-container"]').click();
      await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
      await page.locator('[data-testid="grade-button-4"]').click();
    });

    test('user can use keyboard shortcuts throughout session', async ({ page }) => {
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeFocused();
      
      // Test keyboard shortcuts for card flipping
      await page.keyboard.press('Space');
      await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();
      
      // Test keyboard shortcuts for grading
      await page.keyboard.press('3');
      await page.waitForTimeout(500);
      
      // Verify next card loaded
      await expect(page.locator('[data-testid="flashcard-front"]')).toBeVisible();
      
      // Test Enter key for flipping
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();
      
      // Test number keys for grading
      await page.keyboard.press('4');
      await page.waitForTimeout(500);
    });
  });

  test.describe('Mobile User Experience', () => {
    test('mobile user can complete learning session with touch gestures', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="flashcard-container"]')).toHaveClass(/mobile/);
      await expect(page.locator('[data-testid="grade-controls"]')).toHaveClass(/mobile/);
      
      // Test touch gestures for card flipping
      const flashcard = page.locator('[data-testid="flashcard-container"]');
      
      // Swipe right to flip
      await flashcard.hover();
      await page.mouse.down();
      await page.mouse.move(100, 0);
      await page.mouse.up();
      
      await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();
      
      // Test touch grading
      await page.locator('[data-testid="grade-button-3"]').tap();
      await page.waitForTimeout(500);
      
      // Verify next card
      await expect(page.locator('[data-testid="flashcard-front"]')).toBeVisible();
      
      // Test swipe to grade
      await page.locator('[data-testid="flashcard-container"]').click();
      await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
      
      // Swipe left to grade
      await page.mouse.down();
      await page.mouse.move(-150, 0);
      await page.mouse.up();
      
      await page.waitForTimeout(500);
      const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
      expect(progressText).toContain('2 /');
    });

    test('mobile user can access and use session statistics', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Start practice session and complete some cards
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="flashcard-container"]').click();
        await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
        await page.locator('[data-testid="grade-button-3"]').click();
        await page.waitForTimeout(300);
      }
      
      // Access statistics on mobile
      await page.locator('[data-testid="session-stats-toggle"]').tap();
      await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
      
      // Verify mobile statistics layout
      await expect(page.locator('[data-testid="session-stats"]')).toHaveClass(/mobile/);
      
      // Close statistics
      await page.locator('[data-testid="close-stats"]').tap();
      await expect(page.locator('[data-testid="session-stats"]')).not.toBeVisible();
    });
  });

  test.describe('Accessibility Workflow', () => {
    test('screen reader user can complete learning session', async ({ page }) => {
      // Enable screen reader mode
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Verify ARIA labels and roles
      await expect(page.locator('[data-testid="flashcard-container"]')).toHaveAttribute('role', 'article');
      await expect(page.locator('[data-testid="flashcard-container"]')).toHaveAttribute('aria-label');
      
      // Test keyboard navigation for screen reader users
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeFocused();
      
      // Test screen reader announcements
      await page.keyboard.press('Space');
      
      // Check for live region updates
      const liveRegion = page.locator('[data-testid="sr-live-region"]');
      await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      
      // Complete session with keyboard
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(200);
        await page.keyboard.press('3');
        await page.waitForTimeout(300);
      }
      
      // Verify statistics are accessible
      await page.locator('[data-testid="session-stats-toggle"]').click();
      await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
      
      // Check for proper table structure
      const statsTable = page.locator('[data-testid="stats-table"]');
      if (await statsTable.count() > 0) {
        await expect(statsTable).toHaveAttribute('role', 'table');
        
        const headers = statsTable.locator('th');
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(0);
      }
    });

    test('user with motor impairments can use the app', async ({ page }) => {
      // Test with larger touch targets and reduced precision
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Test larger click targets
      const gradeButton = page.locator('[data-testid="grade-button-3"]');
      const buttonBox = await gradeButton.boundingBox();
      
      // Click with some offset (simulating imprecise clicking)
      await page.mouse.click(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2);
      
      // Verify button still works
      await page.waitForTimeout(500);
      const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
      expect(progressText).toContain('1 /');
      
      // Test keyboard-only navigation
      await page.keyboard.press('Tab'); // Focus flashcard
      await page.keyboard.press('Space'); // Flip card
      await page.keyboard.press('Tab'); // Move to grade buttons
      await page.keyboard.press('Enter'); // Select grade button
      await page.keyboard.press('Enter'); // Confirm grade
      
      await page.waitForTimeout(500);
      const progressText2 = await page.locator('[data-testid="progress-indicator"]').textContent();
      expect(progressText2).toContain('2 /');
    });
  });

  test.describe('Offline and Sync Workflow', () => {
    test('user can use app offline and sync when back online', async ({ page }) => {
      // Start practice session online
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Complete some cards
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="flashcard-container"]').click();
        await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
        await page.locator('[data-testid="grade-button-3"]').click();
        await page.waitForTimeout(300);
      }
      
      // Go offline
      await page.context().setOffline(true);
      
      // Verify offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Continue using app offline
      await page.locator('[data-testid="flashcard-container"]').click();
      await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
      await page.locator('[data-testid="grade-button-4"]').click();
      
      // Go back online
      await page.context().setOffline(false);
      
      // Verify sync happens
      await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="sync-indicator"]')).toContainText('Syncing...');
      
      // Wait for sync to complete
      await expect(page.locator('[data-testid="sync-indicator"]')).not.toBeVisible({ timeout: 5000 });
    });

    test('app handles network interruptions gracefully', async ({ page }) => {
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Simulate network interruption
      await page.route('/api/vocabulary/**', route => {
        route.abort('failed');
      });
      
      // Complete a card (should work with cached data)
      await page.locator('[data-testid="flashcard-container"]').click();
      await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
      await page.locator('[data-testid="grade-button-3"]').click();
      
      // Restore network
      await page.unroute('/api/vocabulary/**');
      
      // Continue session
      await page.locator('[data-testid="flashcard-container"]').click();
      await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
      await page.locator('[data-testid="grade-button-4"]').click();
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('app handles vocabulary loading errors gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('/api/vocabulary/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to load vocabulary' })
        });
      });
      
      // Navigate to practice page
      await page.locator('[data-testid="nav-practice"]').click();
      
      // Should show error boundary
      await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load vocabulary');
      
      // Test retry functionality
      await page.unroute('/api/vocabulary/**');
      await page.locator('[data-testid="retry-button"]').click();
      
      // Should recover and load vocabulary
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
    });

    test('app handles component errors without crashing', async ({ page }) => {
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Simulate component error
      await page.evaluate(() => {
        throw new Error('Simulated component error');
      });
      
      // Should show error boundary
      await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
      
      // Test recovery
      await page.locator('[data-testid="retry-button"]').click();
      
      // Should recover and continue
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible();
    });
  });

  test.describe('Performance and Responsiveness', () => {
    test('app performs well under load', async ({ page }) => {
      // Monitor performance
      const performanceMetrics = [];
      
      page.on('response', response => {
        performanceMetrics.push({
          url: response.url(),
          status: response.status(),
          timing: Date.now()
        });
      });
      
      // Start practice session
      const startTime = Date.now();
      await page.locator('[data-testid="nav-practice"]').click();
      
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(3000);
      
      // Complete cards quickly
      for (let i = 0; i < 5; i++) {
        const cardStartTime = Date.now();
        
        await page.locator('[data-testid="flashcard-container"]').click();
        await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
        await page.locator('[data-testid="grade-button-3"]').click();
        
        const cardTime = Date.now() - cardStartTime;
        expect(cardTime).toBeLessThan(1000); // Each card should complete quickly
      }
    });

    test('app remains responsive during intensive use', async ({ page }) => {
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Rapidly interact with the app
      for (let i = 0; i < 10; i++) {
        await page.locator('[data-testid="flashcard-container"]').click();
        await page.waitForTimeout(100); // Small delay to simulate user interaction
        await page.locator('[data-testid="grade-button-3"]').click();
        await page.waitForTimeout(100);
      }
      
      // App should still be responsive
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible();
      
      // Test statistics panel
      await page.locator('[data-testid="session-stats-toggle"]').click();
      await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
      
      // Close and reopen should work
      await page.locator('[data-testid="close-stats"]').click();
      await expect(page.locator('[data-testid="session-stats"]')).not.toBeVisible();
      
      await page.locator('[data-testid="session-stats-toggle"]').click();
      await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('app works consistently across different browsers', async ({ page, browserName }) => {
      // Start practice session
      await page.locator('[data-testid="nav-practice"]').click();
      await expect(page.locator('[data-testid="flashcard-container"]')).toBeVisible({ timeout: 10_000 });
      
      // Complete basic workflow
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="flashcard-container"]').click();
        await page.waitForSelector('[data-testid="flashcard-back"]', { state: 'visible' });
        await page.locator('[data-testid="grade-button-3"]').click();
        await page.waitForTimeout(300);
      }
      
      // Verify progress
      const progressText = await page.locator('[data-testid="progress-indicator"]').textContent();
      expect(progressText).toContain('3 /');
      
      // Test statistics
      await page.locator('[data-testid="session-stats-toggle"]').click();
      await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
      
      const statsText = await page.locator('[data-testid="session-stats"]').textContent();
      expect(statsText).toContain('Cards Studied: 3');
      
      // Log browser info for debugging
      console.log(`Test completed on ${browserName}`);
    });
  });
});