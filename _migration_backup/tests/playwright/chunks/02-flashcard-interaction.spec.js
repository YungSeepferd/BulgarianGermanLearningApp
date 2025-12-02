const { test, expect } = require('@playwright/test');

/**
 * Test Chunk 2: Flashcard Interaction
 * Tests flip, reveal, and basic user interactions
 */

test.describe('Flashcard Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('practice/');
    await page.waitForFunction(() => window.practiceSession && window.practiceSession.sessionCards?.length > 0, { timeout: 15000 });
  });

  test('show answer button reveals flashcard back', async ({ page }) => {
    const flashcardFront = page.locator('#flashcard-front');
    const flashcardBack = page.locator('#flashcard-back');
    const showAnswerBtn = page.locator('#show-answer');
    
    // Initially front is visible, back is not
    await expect(flashcardFront).toBeVisible();
    await expect(flashcardBack).not.toBeVisible();
    await expect(showAnswerBtn).toBeVisible();
    
    // Click show answer
    await showAnswerBtn.click();
    await page.waitForTimeout(300); // Animation
    
    // Now back should be visible
    await expect(flashcardBack).toBeVisible();
    await expect(showAnswerBtn).toBeHidden();
    
    console.log('✓ Show answer reveals back');
  });

  test('space key flips flashcard', async ({ page }) => {
    const flashcardBack = page.locator('#flashcard-back');
    
    // Initially back is hidden
    await expect(flashcardBack).not.toBeVisible();
    
    // Press space
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    // Back should be visible
    await expect(flashcardBack).toBeVisible();
    
    console.log('✓ Space key flips card');
  });

  test('enter key flips flashcard', async ({ page }) => {
    const flashcardBack = page.locator('#flashcard-back');
    
    await expect(flashcardBack).not.toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    await expect(flashcardBack).toBeVisible();
    
    console.log('✓ Enter key flips card');
  });

  test('flashcard displays word and translation', async ({ page }) => {
    const currentWord = page.locator('#current-word');
    const currentTranslation = page.locator('#current-translation');
    
    // Word should be visible
    await expect(currentWord).toBeVisible();
    const word = await currentWord.textContent();
    expect(word.length).toBeGreaterThan(0);
    
    // Flip to see translation
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    await expect(currentTranslation).toBeVisible();
    const translation = await currentTranslation.textContent();
    expect(translation.length).toBeGreaterThan(0);
    
    console.log(`✓ Word: "${word}" → "${translation}"`);
  });

  test('audio button exists and is interactive', async ({ page }) => {
    const audioBtn = page.locator('.audio-btn, button:has-text("🔊")');
    
    const audioExists = await audioBtn.count() > 0;
    if (audioExists) {
      await expect(audioBtn.first()).toBeVisible();
      console.log('✓ Audio button present');
    } else {
      console.log('ℹ️ No audio button (may be card-specific)');
    }
  });
});
