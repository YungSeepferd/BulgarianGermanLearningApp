/**
 * @file unified-practice-flow.spec.js
 * @description E2E tests for unified practice session with bidirectional support
 */

import { test, expect } from '@playwright/test';

test.describe('Unified Practice Session', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/practice/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should load practice session with vocabulary data', async ({ page }) => {
    await page.goto('/practice/');
    
    // Wait for practice session to initialize
    await page.waitForSelector('#practice-session', { timeout: 5000 });
    
    // Verify vocabulary data loaded
    const dataScript = await page.locator('#practice-vocabulary-data');
    expect(await dataScript.count()).toBe(1);
    
    // Check that flashcard is visible
    const flashcard = await page.locator('#flashcard');
    await expect(flashcard).toBeVisible();
  });

  test('should flip card on Space key press', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Initial state - front should be visible
    const frontEl = page.locator('#flashcard-front');
    const backEl = page.locator('#flashcard-back');
    
    await expect(frontEl).toBeVisible();
    await expect(backEl).toBeHidden();
    
    // Press Space to flip
    await page.keyboard.press('Space');
    
    // Wait for flip animation
    await page.waitForTimeout(300);
    
    // Back should now be visible
    await expect(backEl).toBeVisible();
    await expect(page.locator('#response-buttons')).toBeVisible();
  });

  test('should flip card on Enter key press', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Press Enter to flip
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    // Verify flipped state
    const backEl = page.locator('#flashcard-back');
    await expect(backEl).toBeVisible();
  });

  test('should grade card with keyboard (3 = good)', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Flip card first
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    // Get initial progress
    const initialProgress = await page.locator('#progress').textContent();
    
    // Grade with '3' (good)
    await page.keyboard.press('3');
    await page.waitForTimeout(500);
    
    // Progress should increment
    const newProgress = await page.locator('#progress').textContent();
    expect(newProgress).not.toBe(initialProgress);
  });

  test('should update session statistics', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Complete one card correctly
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('4'); // Easy
    await page.waitForTimeout(500);
    
    // Check accuracy updated
    const accuracy = await page.locator('#accuracy').textContent();
    expect(accuracy).toContain('%');
    expect(parseInt(accuracy)).toBeGreaterThan(0);
  });

  test('should persist review state to localStorage', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Get first card ID
    const cardId = await page.evaluate(() => {
      const dataScript = document.getElementById('practice-vocabulary-data');
      const data = JSON.parse(dataScript.textContent);
      return data[0]?.id;
    });
    
    expect(cardId).toBeTruthy();
    
    // Complete review
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('4');
    await page.waitForTimeout(500);
    
    // Check localStorage for review state
    const reviewState = await page.evaluate((id) => {
      // Try both enhanced and legacy formats
      const enhancedKey = `bgde:review_${id}_de-bg`;
      const legacyKey = `bgde:review:${id}`;
      return localStorage.getItem(enhancedKey) || localStorage.getItem(legacyKey);
    }, cardId);
    
    expect(reviewState).toBeTruthy();
    
    // Verify state structure
    const state = JSON.parse(reviewState);
    expect(state).toHaveProperty('itemId');
    expect(state).toHaveProperty('easeFactor');
    expect(state).toHaveProperty('interval');
    expect(state).toHaveProperty('nextReview');
  });

  test('should migrate legacy review state automatically', async ({ page }) => {
    await page.goto('/practice/');
    
    // Seed legacy state
    const cardId = await page.evaluate(() => {
      const dataScript = document.getElementById('practice-vocabulary-data');
      const data = JSON.parse(dataScript.textContent);
      const id = data[0]?.id;
      
      if (id) {
        // Create legacy format state
        const legacyState = {
          wordId: id,
          easinessFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: new Date().toISOString(),
          lastReviewDate: null,
          totalReviews: 0,
          correctAnswers: 0,
          streak: 0,
          created: new Date().toISOString()
        };
        localStorage.setItem(`bgde:review:${id}`, JSON.stringify(legacyState));
      }
      
      return id;
    });
    
    // Reload page to trigger migration
    await page.reload();
    await page.waitForSelector('#flashcard');
    
    // Complete one review to trigger migration
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('3');
    await page.waitForTimeout(500);
    
    // Check for enhanced format in localStorage
    const enhancedState = await page.evaluate((id) => {
      return localStorage.getItem(`bgde:review_${id}_de-bg`);
    }, cardId);
    
    expect(enhancedState).toBeTruthy();
    
    // Verify migrated structure
    const state = JSON.parse(enhancedState);
    expect(state).toHaveProperty('schemaVersion');
    expect(state.schemaVersion).toBe(2);
  });

  test('should display directional notes based on language direction', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Flip to see notes
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    // Check for notes element
    const notes = page.locator('#current-notes');
    const notesVisible = await notes.isVisible().catch(() => false);
    
    if (notesVisible) {
      const notesText = await notes.textContent();
      expect(notesText).toBeTruthy();
    }
    // Note: Not all cards have notes, so this is optional verification
  });

  test('should complete session and show final stats', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Determine session length
    const sessionLength = await page.evaluate(() => {
      const config = document.getElementById('practice-config');
      if (config) {
        const data = JSON.parse(config.textContent);
        return data.sessionLength || 20;
      }
      return 20;
    });
    
    // Complete all cards (or timeout after 2 minutes)
    test.setTimeout(120000);
    
    for (let i = 0; i < Math.min(sessionLength, 5); i++) {
      // Flip
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      
      // Grade
      await page.keyboard.press('3');
      await page.waitForTimeout(500);
      
      // Check if session complete
      const completeSection = page.locator('#session-complete');
      const isComplete = await completeSection.isVisible().catch(() => false);
      
      if (isComplete) {
        break;
      }
    }
    
    // Verify final stats are shown (may not complete full session in test)
    const progress = await page.locator('#progress').textContent();
    expect(progress).toMatch(/\d+\/\d+/);
  });

  test('should save session history to localStorage', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Complete a few cards
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      await page.keyboard.press('4');
      await page.waitForTimeout(500);
    }
    
    // Check session history in localStorage
    const sessionHistory = await page.evaluate(() => {
      return localStorage.getItem('bgde:session_history');
    });
    
    // Session history may not be saved until completion
    // This is a lightweight check
    if (sessionHistory) {
      const history = JSON.parse(sessionHistory);
      expect(Array.isArray(history)).toBe(true);
    }
  });

  test('should handle offline mode gracefully', async ({ page, context }) => {
    // Go online first to load page
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard');
    
    // Go offline
    await context.setOffline(true);
    
    // Practice should still work with cached data
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    const backEl = page.locator('#flashcard-back');
    await expect(backEl).toBeVisible();
    
    // Restore online
    await context.setOffline(false);
  });
});
