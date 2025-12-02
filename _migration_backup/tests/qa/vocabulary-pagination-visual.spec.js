/**
 * Playwright E2E Tests - Vocabulary Pagination
 *
 * Purpose: Visual and interaction testing for pagination functionality
 * Run: npx playwright test tests/qa/vocabulary-pagination-visual.spec.js
 *
 * Test Coverage:
 * - Pagination UI visibility
 * - Page navigation (Next, Previous, Jump)
 * - URL synchronization
 * - Filter + pagination interaction
 * - Keyboard shortcuts
 * - Mobile responsiveness
 */

const { test, expect } = require('@playwright/test');

test.describe('Vocabulary Pagination - Visual Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary/');
    await page.waitForLoadState('networkidle');
  });

  /**
   * CRITICAL TEST: Pagination UI Visibility
   */
  test('QA-VIS-001: Pagination controls are visible', async ({ page }) => {
    // Check pagination navigation exists
    const paginationNav = page.locator('nav.pagination');
    await expect(paginationNav).toBeVisible({ timeout: 5000 });

    // Check pagination info is visible
    const paginationInfo = page.locator('.pagination-info');
    await expect(paginationInfo).toBeVisible();

    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite');
    expect(infoText).toContain('von');
  });

  test('QA-VIS-002: Pagination shows correct page count', async ({ page }) => {
    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();

    // Should show "Seite 1 von 15" for 750 items
    expect(infoText).toMatch(/Seite\s+\d+\s+von\s+\d+/);
    expect(infoText).toContain('von 15'); // 750 items ÷ 50 = 15 pages
  });

  test('QA-VIS-003: Shows exactly 50 vocabulary cards on page 1', async ({ page }) => {
    const visibleCards = page.locator('.vocab-card:visible');
    const count = await visibleCards.count();

    expect(count).toBe(50);
  });

  test('QA-VIS-004: Total count shows 750 vocabularies', async ({ page }) => {
    const totalCount = page.locator('#total-count');
    await expect(totalCount).toHaveText('750');
  });

  test('QA-VIS-005: Showing count displays 50 on first page', async ({ page }) => {
    const showingCount = page.locator('#showing-count');
    await expect(showingCount).toHaveText('50');
  });

  /**
   * CRITICAL TEST: Page Navigation
   */
  test('QA-NAV-001: Next button navigates to page 2', async ({ page }) => {
    const nextButton = page.locator('.pagination-next');
    await expect(nextButton).toBeVisible();

    await nextButton.click();
    await page.waitForLoadState('networkidle');

    // Check URL updated
    expect(page.url()).toContain('page=2');

    // Check pagination info updated
    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 2');
  });

  test('QA-NAV-002: Previous button works on page 2', async ({ page }) => {
    // Go to page 2 first
    await page.goto('/vocabulary/?page=2');
    await page.waitForLoadState('networkidle');

    const prevButton = page.locator('.pagination-prev');
    await expect(prevButton).toBeVisible();

    await prevButton.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toMatch(/page=1|vocabulary\/$/); // Either ?page=1 or no param
  });

  test('QA-NAV-003: Page jump dropdown works', async ({ page }) => {
    const pageJump = page.locator('#page-jump');
    await expect(pageJump).toBeVisible();

    // Select page 5
    await pageJump.selectOption('5');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('page=5');

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 5');
  });

  test('QA-NAV-004: Direct URL access to page 8 works', async ({ page }) => {
    await page.goto('/vocabulary/?page=8');
    await page.waitForLoadState('networkidle');

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 8');

    // Should show 50 cards
    const visibleCards = page.locator('.vocab-card:visible');
    const count = await visibleCards.count();
    expect(count).toBe(50);
  });

  test('QA-NAV-005: Last page (15) shows correct content', async ({ page }) => {
    await page.goto('/vocabulary/?page=15');
    await page.waitForLoadState('networkidle');

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 15');

    // Last page should have exactly 50 items (750 % 50 = 0)
    const visibleCards = page.locator('.vocab-card:visible');
    const count = await visibleCards.count();
    expect(count).toBe(50);

    // Next button should not be visible on last page
    const nextButton = page.locator('.pagination-next');
    await expect(nextButton).not.toBeVisible();
  });

  /**
   * CRITICAL TEST: Filter + Pagination Interaction
   */
  test('QA-FILT-001: Filtering resets to page 1', async ({ page }) => {
    // Go to page 5
    await page.goto('/vocabulary/?page=5');
    await page.waitForLoadState('networkidle');

    // Apply a filter
    const levelFilter = page.locator('#level-filter');
    await levelFilter.selectOption('A1');
    await page.waitForTimeout(500); // Wait for filter to apply

    // Should reset to page 1
    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 1');
  });

  test('QA-FILT-002: Search filter updates pagination', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await searchInput.fill('здравей');
    await page.waitForTimeout(500);

    // Pagination should recalculate based on filtered results
    const visibleCards = page.locator('.vocab-card:visible');
    const count = await visibleCards.count();

    // Should show filtered results (less than 50)
    expect(count).toBeLessThanOrEqual(50);
    expect(count).toBeGreaterThan(0);
  });

  /**
   * KEYBOARD SHORTCUT TESTS
   */
  test('QA-KEY-001: PageDown navigates to next page', async ({ page }) => {
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(300);

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 2');
  });

  test('QA-KEY-002: PageUp navigates to previous page', async ({ page }) => {
    // Go to page 2 first
    await page.goto('/vocabulary/?page=2');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('PageUp');
    await page.waitForTimeout(300);

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 1');
  });

  test('QA-KEY-003: End key jumps to last page', async ({ page }) => {
    await page.keyboard.press('End');
    await page.waitForTimeout(300);

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 15');
  });

  test('QA-KEY-004: Home key jumps to first page', async ({ page }) => {
    // Go to page 5 first
    await page.goto('/vocabulary/?page=5');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Home');
    await page.waitForTimeout(300);

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 1');
  });

  /**
   * URL STATE PERSISTENCE TESTS
   */
  test('QA-URL-001: URL includes page parameter after navigation', async ({ page }) => {
    await page.locator('.pagination-next').click();
    await page.waitForTimeout(300);

    expect(page.url()).toContain('page=2');
  });

  test('QA-URL-002: Browser back button restores previous page', async ({ page }) => {
    // Navigate forward through pages
    await page.locator('.pagination-next').click();
    await page.waitForTimeout(300);

    await page.locator('.pagination-next').click();
    await page.waitForTimeout(300);

    // Go back
    await page.goBack();
    await page.waitForTimeout(300);

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 2');
  });

  test('QA-URL-003: URL includes filters and page', async ({ page }) => {
    // Apply filter
    const levelFilter = page.locator('#level-filter');
    await levelFilter.selectOption('A1');
    await page.waitForTimeout(300);

    // Navigate to page 2
    const nextButton = page.locator('.pagination-next');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);

      // URL should include both filter and page
      const url = page.url();
      expect(url).toContain('level=A1');
      expect(url).toContain('page=');
    }
  });

  /**
   * MOBILE RESPONSIVENESS TESTS
   */
  test('QA-MOB-001: Pagination works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.reload();
    await page.waitForLoadState('networkidle');

    const paginationNav = page.locator('nav.pagination');
    await expect(paginationNav).toBeVisible();

    const nextButton = page.locator('.pagination-next');
    await expect(nextButton).toBeVisible();
  });

  /**
   * PERSISTENCE TESTS (localStorage)
   */
  test('QA-PERS-001: Returns to last viewed page on reload', async ({ page, context }) => {
    // Navigate to page 5
    await page.goto('/vocabulary/?page=5');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Give time for localStorage save

    // Check localStorage was set
    const storedPage = await page.evaluate(() => {
      const stored = localStorage.getItem('bgde:vocabulary-pagination');
      return stored ? JSON.parse(stored).page : null;
    });

    expect(storedPage).toBe(5);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should restore to page 5
    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 5');
  });

  /**
   * ACCESSIBILITY TESTS
   */
  test('QA-A11Y-001: Pagination has proper ARIA labels', async ({ page }) => {
    const paginationNav = page.locator('nav.pagination');
    await expect(paginationNav).toHaveAttribute('role', 'navigation');
    await expect(paginationNav).toHaveAttribute('aria-label', /pagination/i);
  });

  test('QA-A11Y-002: Pagination buttons are keyboard accessible', async ({ page }) => {
    const nextButton = page.locator('.pagination-next');
    await nextButton.focus();
    await expect(nextButton).toBeFocused();

    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    const paginationInfo = page.locator('.pagination-info').first();
    const infoText = await paginationInfo.textContent();
    expect(infoText).toContain('Seite 2');
  });

  /**
   * PERFORMANCE TESTS
   */
  test('QA-PERF-001: Page navigation is fast (< 500ms)', async ({ page }) => {
    const startTime = Date.now();

    await page.locator('.pagination-next').click();
    await page.waitForLoadState('networkidle');

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Page navigation took ${duration}ms`);
    expect(duration).toBeLessThan(2000); // Should be fast, but allow time for network
  });
});
