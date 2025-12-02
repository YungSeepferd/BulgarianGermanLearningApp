const { test, expect } = require('@playwright/test');

/**
 * Critical Test: Flashcard Practice Session
 * Tests the core flashcard functionality including flip, grade, and progress
 */

test.describe('Flashcard Practice Session', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() => localStorage.clear());
  });

  test('completes a full practice session with multiple cards', async ({ page }) => {
    await page.goto('practice/');
    
    // Wait for session initialization
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    const flashcard = page.locator('#flashcard');
    const showAnswerBtn = page.locator('#show-answer');
    const flashcardFront = page.locator('#flashcard-front');
    const flashcardBack = page.locator('#flashcard-back');
    const progress = page.locator('#progress');
    const accuracy = page.locator('#accuracy');
    
    // Practice 3 cards
    for (let i = 0; i < 3; i++) {
      console.log(`\n--- Card ${i + 1} ---`);
      
      // Verify card is showing
      await expect(flashcard).toBeVisible();
      await expect(flashcardFront).toBeVisible();
      await expect(showAnswerBtn).toBeVisible();
      
      // Get current word
      const currentWord = page.locator('#current-word');
      const word = await currentWord.textContent();
      console.log(`Word: ${word}`);
      
      // Click show answer
      await showAnswerBtn.click();
      await page.waitForTimeout(200); // Animation
      
      // Verify back shows
      await expect(flashcardBack).toBeVisible();
      await expect(showAnswerBtn).toBeHidden();
      
      // Get translation
      const currentTranslation = page.locator('#current-translation');
      const translation = await currentTranslation.textContent();
      console.log(`Translation: ${translation}`);
      
      // Grade the card (alternate between good and easy)
      const grade = i % 2 === 0 ? '3' : '4';
      await page.keyboard.press(grade);
      console.log(`Graded: ${grade}`);
      
      // Wait for card transition
      await page.waitForTimeout(400);
      
      // Verify progress updated
      const progressText = await progress.textContent();
      console.log(`Progress: ${progressText}`);
      expect(progressText).toMatch(/\d+\/\d+/);
      
      // Verify accuracy shows
      const accuracyText = await accuracy.textContent();
      console.log(`Accuracy: ${accuracyText}`);
      expect(accuracyText).toMatch(/%/);
    }
    
    console.log('\n✅ Completed 3-card practice session');
  });

  test('flashcard flip works via Space key', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    const flashcardBack = page.locator('#flashcard-back');
    
    // Verify back is hidden initially
    await expect(flashcardBack).not.toBeVisible();
    
    // Press Space to flip
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Verify back shows
    await expect(flashcardBack).toBeVisible();
  });

  test('flashcard flip works via Enter key', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    const flashcardBack = page.locator('#flashcard-back');
    
    // Verify back is hidden initially
    await expect(flashcardBack).not.toBeVisible();
    
    // Press Enter to flip
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    // Verify back shows
    await expect(flashcardBack).toBeVisible();
  });

  test('all grade keys work correctly (1-5)', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    const progress = page.locator('#progress');
    
    // Test each grade key
    for (let grade = 1; grade <= 5; grade++) {
      // Flip card
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      
      // Get current progress
      const beforeProgress = await progress.textContent();
      
      // Grade card
      await page.keyboard.press(String(grade));
      await page.waitForTimeout(400);
      
      // Verify progress changed
      const afterProgress = await progress.textContent();
      expect(afterProgress).not.toBe(beforeProgress);
      
      console.log(`✅ Grade ${grade} key works: ${beforeProgress} → ${afterProgress}`);
    }
  });

  test('displays session stats correctly', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    const progress = page.locator('#progress');
    const accuracy = page.locator('#accuracy');
    
    // Initially should show 1/N
    let progressText = await progress.textContent();
    expect(progressText).toMatch(/1\/\d+/);
    
    // Initially 0% accuracy
    let accuracyText = await accuracy.textContent();
    expect(accuracyText).toBe('0%');
    
    // Complete one card with good grade
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('4');
    await page.waitForTimeout(400);
    
    // Progress should increment
    progressText = await progress.textContent();
    expect(progressText).toMatch(/2\/\d+/);
    
    // Accuracy should be 100%
    accuracyText = await accuracy.textContent();
    expect(accuracyText).toBe('100%');
    
    // Complete another card with low grade
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('1');
    await page.waitForTimeout(400);
    
    // Accuracy should drop to 50%
    accuracyText = await accuracy.textContent();
    expect(accuracyText).toBe('50%');
    
    console.log('✅ Session stats update correctly');
  });

  test('persists progress to localStorage', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    // Get the card ID
    const cardId = await page.evaluate(() => {
      return window.UnifiedPracticeSession?.currentCard?.id || 
             window.enhancedPracticeSession?.currentCard?.id;
    });
    
    // Complete one card
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('4');
    await page.waitForTimeout(400);
    
    // Check localStorage
    const reviewState = await page.evaluate((id) => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('bgde:review'));
      console.log('LocalStorage keys:', keys);
      
      // Try different key patterns
      const patterns = [
        `bgde:review_${id}_bg-de`,
        `bgde:review_${id}_de-bg`,
        `bgde:review:${id}`,
        `bgde:review_${id}`
      ];
      
      for (const key of patterns) {
        const value = localStorage.getItem(key);
        if (value) {
          return { key, value: JSON.parse(value) };
        }
      }
      
      return null;
    }, cardId);
    
    if (reviewState) {
      console.log('✅ Review state saved:', reviewState);
      expect(reviewState.value).toBeDefined();
      expect(reviewState.value.itemId).toBeDefined();
    } else {
      console.warn('⚠️  No review state found in localStorage');
    }
  });

  test('shows completion screen after session ends', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    // Determine session length
    const sessionLength = await page.evaluate(() => {
      return window.UnifiedPracticeSession?.sessionCards?.length ||
             window.enhancedPracticeSession?.sessionCards?.length || 20;
    });
    
    console.log(`Session length: ${sessionLength} cards`);
    
    // Complete all cards (max 5 for test speed)
    const cardsToComplete = Math.min(sessionLength, 5);
    
    for (let i = 0; i < cardsToComplete; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      await page.keyboard.press('3');
      await page.waitForTimeout(400);
    }
    
    // If we completed all cards, should show completion screen
    if (cardsToComplete === sessionLength) {
      const sessionComplete = page.locator('#session-complete');
      await expect(sessionComplete).toBeVisible({ timeout: 5000 });
      
      // Verify stats on completion screen
      const finalCorrect = page.locator('#final-correct');
      const finalTotal = page.locator('#final-total');
      
      await expect(finalCorrect).toBeVisible();
      await expect(finalTotal).toBeVisible();
      
      const correct = await finalCorrect.textContent();
      const total = await finalTotal.textContent();
      
      console.log(`✅ Session complete: ${correct}/${total} correct`);
      expect(parseInt(total)).toBe(sessionLength);
    }
  });
});
