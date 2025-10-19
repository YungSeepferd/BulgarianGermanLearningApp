const { test, expect } = require('@playwright/test');

test.describe('Smoke Tests', () => {
  test('homepage loads body', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('body')).toBeVisible();
  });

  test('vocabulary page loads and shows cards', async ({ page }) => {
    await page.goto('vocabulary/');
    
    // SSR grid on list page
    await expect(page.locator('#vocabulary-grid')).toBeVisible();
    
    const cards = page.locator('.vocab-card');
    await expect(cards.first()).toBeVisible();
  });

  test('vocab-grid cards flip via button (test page)', async ({ page }) => {
    // Dedicated demo page rendering the vocab-grid shortcode with flip button
    await page.goto('test-hugo-go/');
    const firstCard = page.locator('.vocab-card').first();
    await expect(firstCard).toBeVisible();

    const flipBtn = firstCard.locator('.flip-btn');
    await expect(flipBtn).toBeVisible();

    // Click to toggle flipped state
    await flipBtn.click();
    await expect(firstCard).toHaveClass(/flipped/);

    // Click again to unflip
    await flipBtn.click();
    await expect(firstCard).not.toHaveClass(/flipped/);
  });

  test('navigation to vocabulary/grammar if links exist', async ({ page }) => {
    await page.goto('./');
    
    const vocabLink = page.locator('a[href$="/vocabulary/"]');
    if (await vocabLink.count()) {
      await vocabLink.first().click();
      await expect(page).toHaveURL(/\/vocabulary\//);
    }

    const grammarLink = page.locator('a[href$="/grammar/"]');
    if (await grammarLink.count()) {
      await grammarLink.first().click();
      await expect(page).toHaveURL(/\/grammar\//);
    }
  });
});
