// E2E tests for the Practice Interface
import { test, expect } from '@playwright/test';

test.describe('Practice Interface', () => {
  test('should load and display a vocabulary item', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the loading to complete
    await expect(page.locator('.practice-card')).toBeVisible();

    // Verify the question is displayed
    const question = await page.locator('.question-text').textContent();
    expect(question).not.toBeNull();
    expect(question?.trim()).not.toBe('');
  });

  test('should show answer when requested', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the loading to complete
    await expect(page.locator('.practice-card')).toBeVisible();

    // Click the "Show Answer" button
    await page.locator('.reveal-btn').click();

    // Verify the answer is displayed
    await expect(page.locator('.answer')).toBeVisible();
  });

  test('should allow switching between practice and search modes', async ({ page }) => {
    await page.goto('/practice');

    // Switch to search mode
    await page.locator('.mode-btn:has-text("Search")').click();

    // Verify search interface is displayed
    await expect(page.locator('.search-section')).toBeVisible();

    // Switch back to practice mode
    await page.locator('.mode-btn:has-text("Practice")').click();

    // Verify practice interface is displayed
    await expect(page.locator('.practice-card')).toBeVisible();
  });

  test('should allow switching translation direction', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the loading to complete
    await expect(page.locator('.practice-card')).toBeVisible();

    // Get initial direction
    const initialDirection = await page.locator('.direction-text').textContent();

    // Switch direction
    await page.locator('.toggle-btn').click();

    // Verify direction has changed
    const newDirection = await page.locator('.direction-text').textContent();
    expect(newDirection).not.toBe(initialDirection);
  });

  test('should display search results', async ({ page }) => {
    await page.goto('/practice');

    // Switch to search mode
    await page.locator('.mode-btn:has-text("Search")').click();

    // Type a search query
    await page.locator('.search-input').fill('Hallo');

    // Verify search results are displayed
    await expect(page.locator('.vocabulary-item')).toBeVisible();
  });

  test('should navigate to practice mode when selecting an item', async ({ page }) => {
    await page.goto('/practice');

    // Switch to search mode
    await page.locator('.mode-btn:has-text("Search")').click();

    // Type a search query
    await page.locator('.search-input').fill('Hallo');

    // Wait for search results
    await expect(page.locator('.vocabulary-item')).toBeVisible();

    // Select the first item
    await page.locator('.vocabulary-item').first().click();

    // Verify we're back in practice mode
    await expect(page.locator('.practice-card')).toBeVisible();

    // Verify the selected item is displayed
    const question = await page.locator('.question-text').textContent();
    expect(question).toContain('Hallo');
  });

  test('should show error message when loading fails', async ({ page }) => {
    // Mock the API to fail
    await page.route('/data/vocabulary-unified.json', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/practice');

    // Verify error message is displayed
    await expect(page.locator('.error')).toBeVisible();
    await expect(page.locator('.error p')).toContainText('Failed to load vocabulary');
  });

  test('should allow retry when loading fails', async ({ page }) => {
    // Mock the API to fail first, then succeed
    let attempt = 0;
    await page.route('/data/vocabulary-unified.json', route => {
      if (attempt++ === 0) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/practice');

    // Verify error message is displayed
    await expect(page.locator('.error')).toBeVisible();

    // Click retry button
    await page.locator('.btn-primary').click();

    // Verify the practice card is displayed
    await expect(page.locator('.practice-card')).toBeVisible();
  });
});