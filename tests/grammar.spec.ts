import { test, expect } from '@playwright/test';

test('Grammar page loads successfully', async ({ page }) => {
  // Navigate to the grammar page
  await page.goto('/grammar');

  // Verify the page title
  await expect(page).toHaveTitle(/Grammar - Bulgarian Language Learning App/);

  // Verify the header is present
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText('Grammar Rules');

  // Verify the grammar list is present
  const grammarList = page.locator('.grammar-list');
  await expect(grammarList).toBeVisible();

  // Verify the grammar items are present
  const grammarItems = page.locator('.grammar-item');
  await expect(grammarItems).toHaveCountGreaterThan(0);

  // Verify each grammar item has a rule and example
  const firstItem = grammarItems.first();
  await expect(firstItem.locator('.rule')).toBeVisible();
  await expect(firstItem.locator('.example')).toBeVisible();
});

test('Grammar search functionality', async ({ page }) => {
  // Navigate to the grammar page
  await page.goto('/grammar');

  // Find the search input
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeVisible();

  // Type a search term
  await searchInput.fill('present tense');

  // Verify the search results
  const searchResults = page.locator('.grammar-item');
  await expect(searchResults).toHaveCountGreaterThan(0);

  // Verify the search results contain the search term
  const firstResult = searchResults.first();
  await expect(firstResult.locator('.rule')).toContainText(/present tense/i);
});