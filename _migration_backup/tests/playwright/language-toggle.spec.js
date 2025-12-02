const { test, expect } = require('@playwright/test');

const toggleButtonSelector = '.language-toggle-btn';

async function captureVocabularyCard(page) {
  const card = page.locator('.vocab-card').first();
  await expect(card).toBeVisible();

  return card.evaluate((node) => ({
    front: node.querySelector('.vocab-word')?.textContent?.trim() || '',
    back: node.querySelector('.vocab-translation')?.textContent?.trim() || '',
  }));
}

async function capturePracticeCard(page) {
  const word = page.locator('#current-word');
  const translation = page.locator('#current-translation');

  await expect(word).toBeVisible();
  await expect(translation).toBeVisible();

  // Ensure we have real vocabulary loaded (not fallback copy)
  await expect(word).not.toHaveText(/No word/i);
  await expect(translation).not.toHaveText(/No translation/i);

  return {
    front: (await word.textContent())?.trim() || '',
    back: (await translation.textContent())?.trim() || '',
  };
}

test.describe('Language toggle integration', () => {
  test('vocabulary cards swap language sides when toggled', async ({ page }) => {
    await page.goto('vocabulary/');
    await page.waitForLoadState('networkidle');

    const initial = await captureVocabularyCard(page);
    const initialDirection = await page.evaluate(() => document.body.dataset.languageDirection);
    expect(initialDirection).toBe('de-bg');
    expect(initial.front).not.toEqual('');
    expect(initial.back).not.toEqual('');

    // Toggle to BG→DE
    await page.locator(toggleButtonSelector).click();
    await expect(page.locator('.vocab-word').first()).toHaveText(initial.back, { timeout: 5000 });
    await expect(async () => {
      const currentDirection = await page.evaluate(() => document.body.dataset.languageDirection);
      expect(currentDirection).toBe('bg-de');
    }).toPass();

    const afterToggle = await captureVocabularyCard(page);
    expect(afterToggle.front).toBe(initial.back);
    expect(afterToggle.back).toBe(initial.front);

    // Toggle back to DE→BG
    await page.locator(toggleButtonSelector).click();
    await expect(page.locator('.vocab-word').first()).toHaveText(initial.front, { timeout: 5000 });
    await expect(async () => {
      const currentDirection = await page.evaluate(() => document.body.dataset.languageDirection);
      expect(currentDirection).toBe('de-bg');
    }).toPass();
  });

  test('practice flashcards reflect language direction changes', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#practice-session', { timeout: 10000 });

    const initial = await capturePracticeCard(page);
    const progressBefore = await page.locator('#session-progress').textContent();
    expect(initial.front).not.toEqual('');

    // Toggle to BG→DE and expect the card faces to swap
    await page.locator(toggleButtonSelector).click();
    await expect(page.locator('#current-word')).toHaveText(initial.back, { timeout: 5000 });
    await expect(async () => {
      const currentDirection = await page.evaluate(() => document.body.dataset.languageDirection);
      expect(currentDirection).toBe('bg-de');
    }).toPass();

    const afterToggle = await capturePracticeCard(page);
    expect(afterToggle.front).toBe(initial.back);
    expect(afterToggle.back).toBe(initial.front);

    // Session stats should still be present
    const progressAfter = await page.locator('#session-progress').textContent();
    expect(progressAfter?.trim()).toBe(progressBefore?.trim());

    // Toggle back to restore original direction for subsequent tests
    await page.locator(toggleButtonSelector).click();
    await expect(page.locator('#current-word')).toHaveText(initial.front, { timeout: 5000 });
  });
});
