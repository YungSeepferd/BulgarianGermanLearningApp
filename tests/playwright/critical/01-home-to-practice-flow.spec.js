const { test, expect } = require('@playwright/test');

/**
 * Critical Test: Home → Vocabulary → Practice Flow
 * This tests the most important user journey in the app
 */

test.describe('Home to Practice Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('completes full journey from home to practice session', async ({ page }) => {
    // Step 1: Start at home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Bulgarian.*German/i);
    
    // Step 2: Navigate to vocabulary page
    const vocabLink = page.locator('a[href*="vocabulary"]').first();
    await vocabLink.click();
    await page.waitForURL('**/vocabulary/**');
    
    // Step 3: Wait for vocabulary cards to load
    const vocabGrid = page.locator('#vocabulary-grid, .vocab-grid');
    await expect(vocabGrid).toBeVisible({ timeout: 10000 });
    
    // Step 4: Find and click a practice button
    const practiceBtn = page.locator('.practice-single-btn, button:has-text("Üben")').first();
    await expect(practiceBtn).toBeVisible({ timeout: 5000 });
    await practiceBtn.click();
    
    // Step 5: Verify redirect to practice page
    await page.waitForURL('**/practice/**', { timeout: 10000 });
    
    // Step 6: Wait for practice session to initialize
    await page.waitForFunction(() => {
      return document.getElementById('flashcard') !== null;
    }, { timeout: 15000 });
    
    // Step 7: Verify flashcard is visible
    const flashcard = page.locator('#flashcard');
    await expect(flashcard).toBeVisible();
    
    // Step 8: Verify front side shows
    const flashcardFront = page.locator('#flashcard-front');
    await expect(flashcardFront).toBeVisible();
    
    // Step 9: Verify show answer button
    const showAnswerBtn = page.locator('#show-answer');
    await expect(showAnswerBtn).toBeVisible();
    
    // Step 10: Verify progress indicator
    const progress = page.locator('#progress');
    await expect(progress).toBeVisible();
    const progressText = await progress.textContent();
    expect(progressText).toMatch(/\d+\/\d+/);
    
    console.log('✅ Home → Vocabulary → Practice flow completed successfully');
  });

  test('practice button stores selection in localStorage', async ({ page }) => {
    await page.goto('/vocabulary/');
    
    // Wait for cards
    await page.waitForSelector('.vocab-card', { timeout: 10000 });
    
    // Click practice button
    const practiceBtn = page.locator('.practice-single-btn').first();
    await practiceBtn.click();
    
    // Wait for navigation
    await page.waitForURL('**/practice/**');
    
    // Check localStorage
    const stored = await page.evaluate(() => {
      return localStorage.getItem('bgde:practice_selection');
    });
    
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(Array.isArray(parsed)).toBeTruthy();
    expect(parsed.length).toBeGreaterThan(0);
    
    console.log('✅ Practice selection stored:', parsed);
  });

  test('handles navigation when no vocabulary data available', async ({ page }) => {
    // Block vocabulary data endpoints
    await page.route('**/data/vocabulary*.json', route => route.abort());
    
    await page.goto('/vocabulary/');
    
    // Should show error or empty state
    const hasError = await page.locator('.error-message, .no-items, .empty-state').count() > 0;
    const hasCards = await page.locator('.vocab-card').count() > 0;
    
    // Either show embedded data or error state
    expect(hasError || hasCards).toBeTruthy();
  });
});
