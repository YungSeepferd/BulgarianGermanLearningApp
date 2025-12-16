import { test, expect } from '@playwright/test';

test('Vocabulary page loads successfully', async ({ page }) => {
  await page.goto('/vocabulary');

  // Verify the page title/header
  // The app uses "Wortschatz sicher aufbauen" as the main H1
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText(/Wortschatz|Vocabulary|Речник/);

  // Verify the vocabulary list is present
  // Wait for items to load
  // The class is .vocabulary-card, not .vocabulary-item
  const vocabItems = page.locator('.vocabulary-card');
  await expect(vocabItems.first()).toBeVisible({ timeout: 10000 });
  
  // Check that we have a reasonable number of items (at least 10)
  const count = await vocabItems.count();
  expect(count).toBeGreaterThan(10);
});

test('Vocabulary search functionality', async ({ page }) => {
  await page.goto('/vocabulary');

  // Wait for initial load
  const vocabItems = page.locator('.vocabulary-card');
  await expect(vocabItems.first()).toBeVisible({ timeout: 10000 });
  const initialCount = await vocabItems.count();

  // Find the search input
  // The placeholder is localized, so we use a flexible selector or ID
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeVisible();

  // Type a search term that should exist
  await searchInput.fill('Hallo');

  // Wait for the list to update. 
  // We expect the count to decrease from the initial full list.
  // We can wait for the loading indicator to disappear if there is one, 
  // or just wait for the count to be different (and non-zero).
  
  // Let's wait for a bit to allow the filter to apply
  await page.waitForTimeout(1000);

  const searchResults = page.locator('.vocabulary-card');
  const searchCount = await searchResults.count();
  
  // We expect some results, but fewer than the total
  expect(searchCount).toBeGreaterThan(0);
  expect(searchCount).toBeLessThan(initialCount);

  // Verify the search results contain the search term
  const firstResult = searchResults.first();
  await expect(firstResult).toContainText(/Hallo|Здравей/i);
});
