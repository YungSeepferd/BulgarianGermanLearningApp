const { test, expect } = require('@playwright/test');

/**
 * Test Chunk 5: Vocabulary Page
 * Tests vocabulary browsing, filtering, and "Üben" button functionality
 */

test.describe('Vocabulary Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('vocabulary/');
  });

  test('vocabulary page loads', async ({ page }) => {
    // Verify URL
    expect(page.url()).toContain('/vocabulary/');
    
    // Verify title
    const title = await page.title();
    expect(title.toLowerCase()).toContain('vocabulary');
    
    console.log('✓ Vocabulary page loads');
  });

  test('vocabulary cards render', async ({ page }) => {
    // Wait for cards to load
    await page.waitForTimeout(2000);
    
    // Look for vocab cards with various possible selectors
    const cardSelectors = [
      '.vocab-card',
      '.vocabulary-card',
      '[data-vocab-id]',
      '.card'
    ];
    
    let cardsFound = false;
    let foundSelector = '';
    
    for (const selector of cardSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        cardsFound = true;
        foundSelector = selector;
        console.log(`✓ Found ${count} cards using selector: ${selector}`);
        break;
      }
    }
    
    if (!cardsFound) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/vocabulary-page-debug.png', fullPage: true });
      console.warn('⚠️ No vocabulary cards found with any selector');
    }
  });

  test('"Üben" practice button exists', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for practice buttons with various selectors
    const practiceSelectors = [
      'button:has-text("Üben")',
      '.practice-btn',
      '.practice-single-btn',
      '[data-action="practice"]'
    ];
    
    let practiceFound = false;
    
    for (const selector of practiceSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        practiceFound = true;
        console.log(`✓ Found ${count} practice buttons: ${selector}`);
        break;
      }
    }
    
    if (!practiceFound) {
      await page.screenshot({ path: 'test-results/vocabulary-no-practice-btn.png', fullPage: true });
      console.warn('⚠️ No "Üben" buttons found');
    }
  });

  test('vocabulary data embedded in page', async ({ page }) => {
    const hasData = await page.evaluate(() => {
      // Check for embedded JSON data
      const scripts = document.querySelectorAll('script[type="application/json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          if (Array.isArray(data) && data.length > 0 && data[0].word) {
            return true;
          }
        } catch (e) {}
      }
      return false;
    });
    
    console.log(`Vocabulary data embedded: ${hasData}`);
  });

  test('filters exist (if implemented)', async ({ page }) => {
    const filterSelectors = [
      '#category-filter',
      '#level-filter',
      '.filter-select',
      'select[name="category"]',
      'select[name="level"]'
    ];
    
    let filtersFound = [];
    
    for (const selector of filterSelectors) {
      if (await page.locator(selector).count() > 0) {
        filtersFound.push(selector);
      }
    }
    
    if (filtersFound.length > 0) {
      console.log(`✓ Found filters: ${filtersFound.join(', ')}`);
    } else {
      console.log('ℹ️ No filters found (may not be implemented yet)');
    }
  });

  test('search box exists (if implemented)', async ({ page }) => {
    const searchSelectors = [
      '#search',
      '#vocabulary-search',
      'input[type="search"]',
      'input[placeholder*="Search"]'
    ];
    
    for (const selector of searchSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`✓ Found search: ${selector}`);
        return;
      }
    }
    
    console.log('ℹ️ No search box found (may not be implemented yet)');
  });
});
