const { test, expect } = require('@playwright/test');

test.describe('Flashcards keyboard flow', () => {
  test('retains keyboard grading after re-initialization', async ({ page }) => {
    await page.goto('test-flashcards/');

    const card = page.locator('#current-flashcard');
    const gradingControls = page.locator('#grading-controls');
    const progress = page.locator('#session-progress');
    const speechButton = page.locator('#start-pronunciation');
    const speechFeedback = page.locator('#speech-feedback');

    await expect(card).toBeVisible();
    await expect(speechButton).toBeVisible();

    await card.focus();
    await page.keyboard.press('Space');
    await expect(gradingControls).toBeVisible();

    await page.keyboard.press('3');
    await expect(progress).toHaveText('1 / 3');

    const disabled = await speechButton.getAttribute('disabled');
    if (!disabled) {
      await speechButton.click();
      await expect(speechButton).toHaveAttribute('aria-pressed', 'true');
      await speechButton.click();
      await expect(speechButton).toHaveAttribute('aria-pressed', 'false');
    } else {
      await expect(speechFeedback).toContainText(/speech recognition is not supported/i);
    }

    await page.evaluate(() => window.testFlashcards.init());

    await expect(progress).toHaveText('0 / 3');

    await card.focus();
    await page.keyboard.press('Space');
    await expect(gradingControls).toBeVisible();

    await page.keyboard.press('3');
    await expect(progress).toHaveText('1 / 3');
  });
});
