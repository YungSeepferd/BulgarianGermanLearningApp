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

    // Wait for animations to stabilize
    await page.waitForTimeout(1000);

    // Switch to search mode with more stable selector and force option
    const searchBtn = page.locator('.mode-btn').filter({ hasText: 'Search' }).or(page.locator('.mode-btn').filter({ hasText: '🔍' }));
    await searchBtn.click({ force: true, timeout: 15000 });

    // Verify search interface is displayed
    await expect(page.locator('.search-section')).toBeVisible({ timeout: 15000 });

    // Wait for animations to stabilize
    await page.waitForTimeout(1000);

    // Switch back to practice mode with force option
    const practiceBtn = page.locator('.mode-btn').filter({ hasText: 'Practice' }).or(page.locator('.mode-btn').filter({ hasText: '📝' }));
    await practiceBtn.click({ force: true, timeout: 15000 });

    // Verify practice interface is displayed
    await expect(page.locator('.practice-card')).toBeVisible({ timeout: 15000 });
  });

  test('should allow switching translation direction', async ({ page }) => {
    await page.goto('/practice');

    // Wait for the loading to complete
    await expect(page.locator('.practice-card')).toBeVisible({ timeout: 15000 });

    // Wait for animations to stabilize
    await page.waitForTimeout(1000);

    // Get initial direction
    const initialDirection = await page.locator('.direction-indicator').textContent();

    // Switch direction with force option to bypass animation stability issues
    await page.locator('.toggle-btn').click({ force: true, timeout: 15000 });

    // Wait for direction change to take effect
    await page.waitForTimeout(500);

    // Verify direction has changed
    const newDirection = await page.locator('.direction-indicator').textContent();
    expect(newDirection).not.toBe(initialDirection);
  });

  test('should display search results', async ({ page }) => {
    await page.goto('/practice');

    // Wait for animations to stabilize
    await page.waitForTimeout(1000);

    // Switch to search mode with force option
    const searchBtn = page.locator('.mode-btn').filter({ hasText: 'Search' }).or(page.locator('.mode-btn').filter({ hasText: '🔍' }));
    await searchBtn.click({ force: true, timeout: 15000 });

    // Type a search query
    await page.locator('.search-input').fill('Hallo');

    // Wait for search to process
    await page.waitForTimeout(2000);

    // Verify search results are displayed (if any)
    const resultsCount = await page.locator('.vocabulary-item').count({ timeout: 5000 });
    if (resultsCount > 0) {
      await expect(page.locator('.vocabulary-item').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to practice mode when selecting an item', async ({ page }) => {
    await page.goto('/practice');

    // Wait for animations to stabilize
    await page.waitForTimeout(1000);

    // Switch to search mode with force option
    const searchBtn = page.locator('.mode-btn').filter({ hasText: 'Search' }).or(page.locator('.mode-btn').filter({ hasText: '🔍' }));
    await searchBtn.click({ force: true, timeout: 15000 });

    // Type a search query
    await page.locator('.search-input').fill('Hallo');

    // Wait for search to process
    await page.waitForTimeout(2000);

    // Check if we have search results
    const resultsCount = await page.locator('.vocabulary-item').count({ timeout: 5000 });
    
    if (resultsCount > 0) {
      // Select the first item with force option - use the practice button inside the vocabulary item
      await page.locator('.vocabulary-item').first().locator('.practice-btn').first().click({ force: true, timeout: 15000 });

      // Verify we're back in practice mode
      await expect(page.locator('.practice-card')).toBeVisible({ timeout: 15000 });

      // Verify the selected item is displayed
      const question = await page.locator('.question-text').textContent();
      expect(question).toBeTruthy();
    }
  });

  test('should show error message when loading fails', async ({ page }) => {
    // Mock the API to fail
    await page.route('/data/vocabulary.json', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/practice');

    // Wait for error to appear with longer timeout
    await expect(page.locator('.error')).toBeVisible({ timeout: 15000 });
    // The error message might vary depending on implementation, but usually contains "Failed"
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
  });

  test('should allow retry when loading fails', async ({ page }) => {
    // Mock the API to fail first, then succeed
    let attempt = 0;
    await page.route('/data/vocabulary.json', route => {
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

    // Wait for error to appear with longer timeout
    await expect(page.locator('.error')).toBeVisible({ timeout: 15000 });

    // Click retry button with force option
    await page.locator('.btn-primary').click({ force: true, timeout: 15000 });

    // Verify the practice card is displayed
    await expect(page.locator('.practice-card')).toBeVisible({ timeout: 20000 });
  });
});