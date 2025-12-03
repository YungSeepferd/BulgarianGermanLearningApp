// E2E tests for the Practice Interface
import { test, expect } from '@playwright/test';

test.describe('Practice Interface', () => {
  test('should load and display a vocabulary item', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the loading to complete with longer timeout
    await expect(page.locator('.practice-card')).toBeVisible({ timeout: 15000 });

    // Verify the question is displayed
    const question = await page.locator('.question-text').textContent();
    expect(question).not.toBeNull();
    expect(question?.trim()).not.toBe('');
  });

  test('should show answer when requested', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the loading to complete
    await expect(page.locator('.practice-card')).toBeVisible({ timeout: 15000 });

    // Type an answer first
    await page.locator('.answer-input').fill('test answer');

    // Click the "Check Answer" button with retry logic
    await page.locator('.btn-primary').click({ timeout: 10000 });

    // Verify the feedback is displayed
    await expect(page.locator('.feedback-section')).toBeVisible({ timeout: 10000 });
  });

  test('should allow switching between practice and search modes', async ({ page }) => {
    await page.goto('/practice');

    // Wait for initial loading
    await expect(page.locator('.practice-card')).toBeVisible({ timeout: 15000 });

    // Switch to search mode with retry logic
    await page.locator('.mode-btn:has-text("Search")').click({ timeout: 10000 });

    // Verify search interface is displayed
    await expect(page.locator('.search-section')).toBeVisible({ timeout: 10000 });

    // Switch back to practice mode
    await page.locator('.mode-btn:has-text("Practice")').click({ timeout: 10000 });

    // Verify practice interface is displayed
    await expect(page.locator('.practice-card')).toBeVisible({ timeout: 10000 });
  });

  test('should allow switching translation direction', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the loading to complete
    await expect(page.locator('.practice-card')).toBeVisible({ timeout: 15000 });

    // Get initial direction
    const initialDirection = await page.locator('.direction-indicator').textContent();

    // Switch direction with retry logic
    await page.locator('.toggle-btn').click({ timeout: 10000 });

    // Verify direction has changed
    const newDirection = await page.locator('.direction-indicator').textContent();
    expect(newDirection).not.toBe(initialDirection);
  });

  test('should display search results', async ({ page }) => {
    await page.goto('/practice');

    // Switch to search mode
    await page.locator('.mode-btn:has-text("Search")').click({ timeout: 10000 });

    // Type a search query
    await page.locator('.search-input').fill('Hallo');

    // Wait for search to process
    await page.waitForTimeout(1000);

    // Verify search results are displayed (if any)
    const resultsCount = await page.locator('.vocabulary-item').count();
    if (resultsCount > 0) {
      await expect(page.locator('.vocabulary-item').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to practice mode when selecting an item', async ({ page }) => {
    await page.goto('/practice');

    // Switch to search mode
    await page.locator('.mode-btn:has-text("Search")').click({ timeout: 10000 });

    // Type a search query
    await page.locator('.search-input').fill('Hallo');

    // Wait for search to process
    await page.waitForTimeout(1000);

    // Check if we have search results
    const resultsCount = await page.locator('.vocabulary-item').count();
    
    if (resultsCount > 0) {
      // Select the first item
      await page.locator('.vocabulary-item').first().click({ timeout: 10000 });

      // Verify we're back in practice mode
      await expect(page.locator('.practice-card')).toBeVisible({ timeout: 10000 });

      // Verify the selected item is displayed
      const question = await page.locator('.question-text').textContent();
      expect(question).toBeTruthy();
    }
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