import { test, expect } from '@playwright/test';

test('Grammar page loads successfully', async ({ page }) => {
  await page.goto('/grammar');

  // Verify the page title
  // The app uses "Klare Regeln für sicheren Gebrauch" (DE) or "Ясни правила за уверена употреба" (BG)
  await expect(page).toHaveTitle(/Grammar|Klare Regeln|Ясни правила/);

  // Verify the header is present
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText(/Klare Regeln|Ясни правила/);

  // Verify the grammar table is present
  const table = page.locator('table.grammar-table');
  await expect(table).toBeVisible();

  // Verify we have grammar rules listed
  const rules = page.locator('table.grammar-table tbody tr');
  const count = await rules.count();
  expect(count).toBeGreaterThan(0);
});

test('Grammar search functionality', async ({ page }) => {
  await page.goto('/grammar');

  // Wait for table to load
  const rules = page.locator('table.grammar-table tbody tr');
  await expect(rules.first()).toBeVisible();
  const initialCount = await rules.count();

  // Find the search input
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeVisible();

  // Type a search term that should exist (e.g., "Präsens" or "Сегашно")
  await searchInput.fill('Präsens');

  // Wait for filter to apply
  await page.waitForTimeout(500);

  const searchResults = page.locator('table.grammar-table tbody tr');
  const searchCount = await searchResults.count();

  // We expect some results, but fewer than total (unless everything matches)
  expect(searchCount).toBeGreaterThan(0);
  // If initial count was > 0, search count should ideally be <= initial count
  expect(searchCount).toBeLessThanOrEqual(initialCount);

  // Verify the search results contain the search term
  const firstResult = searchResults.first();
  await expect(firstResult).toContainText(/Präsens|Сегашно/i);
});
