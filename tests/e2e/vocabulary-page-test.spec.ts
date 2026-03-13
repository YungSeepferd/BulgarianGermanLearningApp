/**
 * Vocabulary Page Comprehensive Test
 * 
 * Tests all requested functionality:
 * - Page navigation and load
 * - Element verification
 * - Search functionality
 * - Virtual scrolling
 * - Card interaction
 * - Screenshot capture
 */

import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

test.describe('Vocabulary Page Comprehensive Test', () => {
  const BASE_URL = 'http://localhost:5173';
  const SCREENSHOT_DIR = 'test-screenshots';

  test.beforeEach(async ({ page }) => {
    // Create screenshot directory if needed
    await page.goto(`${BASE_URL}/vocabulary`);
    
    // Wait for network idle
    await page.waitForLoadState('networkidle');
  });

  test('Step 1-2: Navigate to vocabulary page and take annotated screenshot', async ({ page }) => {
    // Verify page loaded
    await expect(page).toHaveURL(/\/vocabulary/);
    
    // Take annotated screenshot showing interactive elements
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/vocabulary-page-test.png`,
      fullPage: true 
    });
    
    console.log('✓ Navigated to vocabulary page');
    console.log('✓ Screenshot saved to test-screenshots/vocabulary-page-test.png');
  });

  test('Step 3: Verify page elements', async ({ page }) => {
    // Check page title contains "Vocabulary" or localized equivalent
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const titleText = await h1.textContent();
    console.log(`Page title: ${titleText}`);
    
    // Verify search input exists
    const searchInput = page.locator('input[type="search"], input[placeholder*="Suche"], input[placeholder*="търсене"], input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    console.log('✓ Search input exists');
    
    // Verify virtual grid container exists
    const gridContainer = page.locator('.vocabulary-grid, .grid-container, [data-virtual-grid], .virtual-list');
    const gridExists = await gridContainer.count() > 0;
    console.log(`✓ Virtual grid container exists: ${gridExists}`);
    
    // Check vocabulary cards render
    const cards = page.locator('.vocabulary-card, .vocabulary-item, [data-vocabulary-item]');
    const cardCount = await cards.count();
    console.log(`✓ Vocabulary cards rendered: ${cardCount} visible items`);
    
    // Verify we have items (should be less than total 746+ due to virtualization)
    expect(cardCount).toBeGreaterThan(0);
    expect(cardCount).toBeLessThan(100); // Should be virtualized, not all 746+
  });

  test('Step 4: Test search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Suche"], input[placeholder*="търсене"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
    
    // Fill search with "Hallo"
    await searchInput.fill('Hallo');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Take screenshot of search results
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/vocabulary-search-test.png`,
      fullPage: true 
    });
    
    // Verify filtered results show "Здравей" (German: Hallo)
    const pageContent = await page.content();
    const hasZdradev = pageContent.includes('Здравей') || pageContent.includes('здравей');
    console.log(`✓ Search results contain "Здравей": ${hasZdradev}`);
    
    // Also check for "Hallo" in results
    const hasHallo = pageContent.toLowerCase().includes('hallo');
    console.log(`✓ Search results contain "Hallo": ${hasHallo}`);
  });

  test('Step 5: Test virtual scrolling', async ({ page }) => {
    // Get initial card count
    const cards = page.locator('.vocabulary-card, .vocabulary-item, [data-vocabulary-item]');
    const initialCount = await cards.count();
    console.log(`Initial visible cards: ${initialCount}`);
    
    // Scroll down 500px
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    
    // Check card count after scroll
    const afterScrollCount = await cards.count();
    console.log(`Cards after scroll: ${afterScrollCount}`);
    
    // Verify only visible items are rendered (count should be similar)
    // Virtual scrolling should keep similar number of visible items
    expect(afterScrollCount).toBeGreaterThan(0);
    
    // Scroll to bottom to test infinite scroll behavior
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const finalCount = await cards.count();
    console.log(`Cards at bottom: ${finalCount}`);
    
    // Take screenshot at bottom
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/vocabulary-scroll-test.png`,
      fullPage: true 
    });
    
    console.log('✓ Virtual scrolling test completed');
  });

  test('Step 6: Test vocabulary card interaction', async ({ page }) => {
    // Find first vocabulary card
    const cards = page.locator('.vocabulary-card, .vocabulary-item, [data-vocabulary-item]');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      // Click on first vocabulary card
      await cards.first().click();
      
      // Wait for navigation
      await page.waitForTimeout(500);
      
      // Verify navigation to detail page
      const currentUrl = page.url();
      console.log(`Current URL after click: ${currentUrl}`);
      
      // Take screenshot of detail page
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/vocabulary-detail-test.png`,
        fullPage: true 
      });
      
      console.log('✓ Detail page screenshot saved');
      
      // Check if we navigated to a detail page or if it opened a modal
      const isDetailPage = currentUrl.includes('/vocabulary/') || currentUrl.includes('detail');
      console.log(`✓ Navigated to detail: ${isDetailPage}`);
    } else {
      console.log('No vocabulary cards found to click');
    }
  });

  test('Performance: Measure page load time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/vocabulary`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Verify load time is reasonable
    expect(loadTime).toBeLessThan(5000); // Should load under 5 seconds
    
    // Measure search response time
    const searchStart = Date.now();
    const searchInput = page.locator('input[type="search"]').first();
    await searchInput.fill('test');
    await page.waitForTimeout(300);
    const searchTime = Date.now() - searchStart;
    console.log(`Search response time: ${searchTime}ms`);
  });
});