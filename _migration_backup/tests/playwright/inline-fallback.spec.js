const { test, expect } = require('@playwright/test');

// Verify that vocabulary cards render from inline JSON even when JSON endpoints fail
// This validates the offline-first loader path in assets/js/vocab-cards.js

test('inline JSON fallback renders cards when endpoints fail', async ({ page }) => {
  await page.route('**/data/vocabulary.json', route => route.abort());
  await page.route('**/static/data/vocabulary.json', route => route.abort());

  await page.goto('test-vocab-inline/');

  const grid = page.locator('#vocab-grid');
  await expect(grid).toBeVisible();

  const cards = page.locator('.vocab-card');
  await expect(cards.first()).toBeVisible();
});
