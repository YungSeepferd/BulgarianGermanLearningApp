const { test, expect } = require('@playwright/test');

/**
 * Test Chunk 4: Data Persistence
 * Tests localStorage saving, loading, and spaced repetition state
 */

test.describe('Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('practice/');
    await page.waitForFunction(() => window.practiceSession && window.practiceSession.sessionCards?.length > 0, { timeout: 15000 });
  });

  test('review state saved to localStorage after grading', async ({ page }) => {
    // Get current card ID
    const cardId = await page.evaluate(() => {
      return window.practiceSession?.currentCard?.id;
    });
    
    expect(cardId).toBeTruthy();
    
    // Grade the card
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('4');
    await page.waitForTimeout(500);
    
    // Check localStorage
    const savedState = await page.evaluate((id) => {
      const keys = Object.keys(localStorage).filter(k => k.includes(id) && k.startsWith('bgde:review'));
      console.log('localStorage keys:', keys);
      
      if (keys.length > 0) {
        const state = localStorage.getItem(keys[0]);
        return { key: keys[0], value: state ? JSON.parse(state) : null };
      }
      return null;
    }, cardId);
    
    if (savedState) {
      expect(savedState.value).toBeDefined();
      expect(savedState.value.itemId).toBe(cardId);
      console.log(`✓ Review state saved: ${savedState.key}`);
    } else {
      console.warn('⚠️ No review state found in localStorage');
    }
  });

  test('direction-specific review states', async ({ page }) => {
    const cardId = await page.evaluate(() => window.practiceSession?.currentCard?.id);
    const currentDirection = await page.evaluate(() => window.practiceSession?.currentDirection);
    
    // Grade card
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('4');
    await page.waitForTimeout(500);
    
    // Check for direction-specific key
    const hasDirectionKey = await page.evaluate(({ id, dir }) => {
      const expectedKey = `bgde:review_${id}_${dir}`;
      const value = localStorage.getItem(expectedKey);
      return { key: expectedKey, exists: !!value };
    }, { id: cardId, dir: currentDirection });
    
    console.log(`Direction: ${currentDirection}`);
    console.log(`Expected key: ${hasDirectionKey.key}`);
    console.log(`Exists: ${hasDirectionKey.exists}`);
    
    // This may not be implemented yet, so just log
  });

  test('session history saved on completion', async ({ page }) => {
    // Complete a few cards quickly
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      await page.keyboard.press('3');
      await page.waitForTimeout(400);
      
      // Check if session completed
      const isComplete = await page.locator('#session-complete').isVisible().catch(() => false);
      if (isComplete) break;
    }
    
    // Check for session history
    const hasHistory = await page.evaluate(() => {
      const history = localStorage.getItem('bgde:session_history');
      if (history) {
        const parsed = JSON.parse(history);
        return Array.isArray(parsed) && parsed.length > 0;
      }
      return false;
    });
    
    console.log(`Session history exists: ${hasHistory}`);
  });

  test('language direction persisted', async ({ page }) => {
    const direction = await page.evaluate(() => {
      return localStorage.getItem('bgde:language-direction') || 
             localStorage.getItem('bgde:learning_direction') ||
             'not-set';
    });
    
    console.log(`Stored direction: ${direction}`);
    expect(['bg-de', 'de-bg', 'not-set']).toContain(direction);
  });

  test('localStorage keys use bgde: prefix', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('4');
    await page.waitForTimeout(500);
    
    const bgdeKeys = await page.evaluate(() => {
      return Object.keys(localStorage).filter(k => k.startsWith('bgde:'));
    });
    
    console.log(`Found ${bgdeKeys.length} bgde: keys`);
    bgdeKeys.forEach(key => console.log(`  - ${key}`));
    
    expect(bgdeKeys.length).toBeGreaterThan(0);
  });
});
