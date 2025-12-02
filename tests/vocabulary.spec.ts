import { test, expect } from '@playwright/test';

test('Vocabulary page loads successfully', async ({ page }) => {
  // Navigate to the vocabulary page
  await page.goto('/vocabulary');

  // Verify the page title
  await expect(page).toHaveTitle(/Vocabulary - Bulgarian Language Learning App/);

  // Verify the header is present
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText('Vocabulary');

  // Verify the vocabulary list is present
  const vocabList = page.locator('.vocabulary-list');
  await expect(vocabList).toBeVisible();

  // Verify the vocabulary items are present
  const vocabItems = page.locator('.vocabulary-item');
  await expect(vocabItems).toHaveCountGreaterThan(0);

  // Verify each vocabulary item has a word and translation
  const firstItem = vocabItems.first();
  await expect(firstItem.locator('.word')).toBeVisible();
  await expect(firstItem.locator('.translation')).toBeVisible();
});

test('Vocabulary search functionality', async ({ page }) => {
  // Navigate to the vocabulary page
  await page.goto('/vocabulary');

  // Find the search input
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeVisible();

  // Type a search term
  await searchInput.fill('apple');

  // Verify the search results
  const searchResults = page.locator('.vocabulary-item');
  await expect(searchResults).toHaveCountGreaterThan(0);

  // Verify the search results contain the search term
  const firstResult = searchResults.first();
  await expect(firstResult.locator('.word')).toContainText(/apple/i);
});