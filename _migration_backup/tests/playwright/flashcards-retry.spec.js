const { test, expect } = require('@playwright/test');

test.describe('Flashcards keyboard flow', () => {
  test('supports flip + grading in unified practice session', async ({ page }) => {
    await page.goto('practice/');

    await page.waitForFunction(() => {
      return window.practiceSession && 
             window.practiceSession.sessionCards && 
             Array.isArray(window.practiceSession.sessionCards) && 
             window.practiceSession.sessionCards.length > 0;
    }, { timeout: 15000 });

    const flashcard = page.locator('#flashcard');
    const showAnswerBtn = page.locator('#show-answer');
    const progress = page.locator('#progress');
    const accuracy = page.locator('#accuracy');
    const flashcardFront = page.locator('#flashcard-front');
    const flashcardBack = page.locator('#flashcard-back');

    await expect(flashcard).toBeVisible();
    await expect(showAnswerBtn).toBeVisible();
    await expect(flashcardFront).toBeVisible();
    await expect(flashcardBack).not.toBeVisible();

    const initialProgress = (await progress.textContent()).trim();
    await showAnswerBtn.click();
    await page.waitForTimeout(300);
    await expect(flashcardBack).toBeVisible();
    await expect(showAnswerBtn).toBeHidden();

    await page.keyboard.press('3');
    await page.waitForTimeout(500);
    await expect(progress).not.toHaveText(initialProgress);
    await expect(accuracy).toHaveText(/%/);
    await expect(showAnswerBtn).toBeVisible();
    await expect(flashcardBack).not.toBeVisible();

    const secondProgress = (await progress.textContent()).trim();

    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await expect(flashcardBack).toBeVisible();

    await page.keyboard.press('4');
    await page.waitForTimeout(500);
    await expect(progress).not.toHaveText(secondProgress);
    await expect(flashcardBack).not.toBeVisible();
  });
});
