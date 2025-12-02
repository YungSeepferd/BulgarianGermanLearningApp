const { test, expect } = require('@playwright/test');

/**
 * Test Chunk 3: Grading and Progress Tracking
 * Tests card grading, progress updates, and statistics
 */

test.describe('Grading and Progress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('practice/');
    await page.waitForFunction(() => window.practiceSession && window.practiceSession.sessionCards?.length > 0, { timeout: 15000 });
  });

  test('grading with keyboard (grade 3)', async ({ page }) => {
    const progress = page.locator('#progress');
    const initialProgress = await progress.textContent();
    
    // Flip card
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    // Grade with 3
    await page.keyboard.press('3');
    await page.waitForTimeout(500);
    
    // Progress should update
    const newProgress = await progress.textContent();
    expect(newProgress).not.toBe(initialProgress);
    
    console.log(`✓ Progress updated: ${initialProgress} → ${newProgress}`);
  });

  test('all grade keys work (1-5)', async ({ page }) => {
    const progress = page.locator('#progress');
    
    for (let grade = 1; grade <= 5; grade++) {
      const beforeProgress = await progress.textContent();
      
      // Flip and grade
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      await page.keyboard.press(String(grade));
      await page.waitForTimeout(500);
      
      const afterProgress = await progress.textContent();
      expect(afterProgress).not.toBe(beforeProgress);
      
      console.log(`✓ Grade ${grade} key works`);
      
      // Don't continue if we've completed the session
      const sessionComplete = await page.locator('#session-complete').isVisible().catch(() => false);
      if (sessionComplete) {
        console.log('  Session completed early');
        break;
      }
    }
  });

  test('accuracy updates correctly', async ({ page }) => {
    const accuracy = page.locator('#accuracy');
    
    // Initially 0%
    let accuracyText = await accuracy.textContent();
    expect(accuracyText).toBe('0%');
    
    // Grade one card as good (4)
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('4');
    await page.waitForTimeout(500);
    
    // Accuracy should be 100%
    accuracyText = await accuracy.textContent();
    expect(accuracyText).toBe('100%');
    
    // Grade another as poor (1)
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('1');
    await page.waitForTimeout(500);
    
    // Accuracy should be 50%
    accuracyText = await accuracy.textContent();
    expect(accuracyText).toBe('50%');
    
    console.log('✓ Accuracy calculation correct');
  });

  test('progress counter increments', async ({ page }) => {
    const progress = page.locator('#progress');
    
    // Should start at 1/N
    let progressText = await progress.textContent();
    expect(progressText).toMatch(/1\/\d+/);
    
    // Complete one card
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('3');
    await page.waitForTimeout(500);
    
    // Should be 2/N
    progressText = await progress.textContent();
    expect(progressText).toMatch(/2\/\d+/);
    
    console.log(`✓ Progress counter increments: ${progressText}`);
  });

  test('session timer runs', async ({ page }) => {
    const timer = page.locator('#session-timer, #timer');
    
    if (await timer.count() > 0) {
      const initialTime = await timer.textContent();
      
      // Wait a bit
      await page.waitForTimeout(2000);
      
      const afterTime = await timer.textContent();
      expect(afterTime).not.toBe(initialTime);
      
      console.log(`✓ Timer running: ${initialTime} → ${afterTime}`);
    } else {
      console.log('ℹ️ No timer element found');
    }
  });
});
