/**
 * Search Functionality Regression Test
 * Prevents loading order race conditions affecting search
 */

import { test, expect } from '@playwright/test';

test.describe('Vocabulary Search Functionality', () => {
  test('search input filters vocabulary cards in real-time', async ({ page }) => {
    // Navigate to vocabulary page
    await page.goto('/vocabulary/');
    
    // Wait for vocabulary grid to load
    await page.waitForSelector('#vocabulary-grid .vocab-card', { timeout: 10000 });
    
    // Count initial cards
    const initialCards = await page.locator('#vocabulary-grid .vocab-card:visible').count();
    expect(initialCards).toBeGreaterThan(0);
    
    // Get initial showing count
    const initialCount = await page.textContent('#showing-count');
    expect(parseInt(initialCount)).toBe(initialCards);
    
    console.log(`Initial cards: ${initialCards}`);
    
    // Test search functionality
    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();
    
    // Search for a common Bulgarian word
    await searchInput.fill('дом');
    
    // Wait for search to process (with debouncing)
    await page.waitForTimeout(500);
    
    // Count filtered cards
    const filteredCards = await page.locator('#vocabulary-grid .vocab-card:visible').count();
    console.log(`Filtered cards for "дом": ${filteredCards}`);
    
    // Verify filtering worked
    expect(filteredCards).toBeLessThan(initialCards);
    expect(filteredCards).toBeGreaterThan(0);
    
    // Verify counter updated
    const updatedCount = await page.textContent('#showing-count');
    expect(parseInt(updatedCount)).toBe(filteredCards);
    
    // Test clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);
    
    // Verify all cards are visible again
    const restoredCards = await page.locator('#vocabulary-grid .vocab-card:visible').count();
    expect(restoredCards).toBe(initialCards);
    
    // Test search with no results
    await searchInput.fill('xyznonexistent');
    await page.waitForTimeout(300);
    
    const noResultCards = await page.locator('#vocabulary-grid .vocab-card:visible').count();
    expect(noResultCards).toBe(0);
    
    // Verify no results message appears
    const noResultsMessage = page.locator('#no-results');
    await expect(noResultsMessage).toBeVisible();
  });
  
  test('search works with both word and translation matching', async ({ page }) => {
    await page.goto('/vocabulary/');
    await page.waitForSelector('#vocabulary-grid .vocab-card', { timeout: 10000 });
    
    const searchInput = page.locator('#search-input');
    
    // Test German word search
    await searchInput.fill('Hallo');
    await page.waitForTimeout(300);
    
    let matchingCards = await page.locator('#vocabulary-grid .vocab-card:visible').count();
    expect(matchingCards).toBeGreaterThan(0);
    
    // Test Bulgarian word search
    await searchInput.fill('Здравей');
    await page.waitForTimeout(300);
    
    matchingCards = await page.locator('#vocabulary-grid .vocab-card:visible').count();
    expect(matchingCards).toBeGreaterThan(0);
  });
  
  test('module initialization debugging logs', async ({ page }) => {
    // Capture console logs
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('[VocabPage]')) {
        logs.push(msg.text());
      }
    });
    
    await page.goto('/vocabulary/');
    await page.waitForTimeout(2000); // Allow initialization to complete
    
    // Verify initialization logs are present
    const initLogs = logs.filter(log => log.includes('Init attempt'));
    expect(initLogs.length).toBeGreaterThan(0);
    
    // Verify successful initialization or fallback
    const successLogs = logs.filter(log => 
      log.includes('Successfully initialized') || 
      log.includes('Initializing basic search fallback')
    );
    expect(successLogs.length).toBeGreaterThan(0);
    
    console.log('Initialization logs:', logs);
  });
  
  test('vocabulary adapter and module are globally available', async ({ page }) => {
    await page.goto('/vocabulary/');
    await page.waitForTimeout(2000);
    
    // Check global availability
    const adapterAvailable = await page.evaluate(() => !!window.VocabularyAdapter);
    const moduleAvailable = await page.evaluate(() => !!window.VocabularyPageModule);
    const instanceAvailable = await page.evaluate(() => !!window.vocabPageInstance);
    
    expect(adapterAvailable).toBe(true);
    expect(moduleAvailable).toBe(true);
    expect(instanceAvailable).toBe(true);
    
    console.log('Global objects available:', {
      adapter: adapterAvailable,
      module: moduleAvailable,
      instance: instanceAvailable
    });
  });
});