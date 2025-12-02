const { test, expect } = require('@playwright/test');

/**
 * Test Chunk 1: Practice Page Initialization
 * Tests the basic loading and initialization of the practice page
 */

test.describe('Practice Page Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await page.evaluate(() => localStorage.clear());
  });

  test('practice page loads successfully', async ({ page }) => {
    await page.goto('practice/');
    
    // Verify URL
    expect(page.url()).toContain('/practice/');
    
    // Verify title
    const title = await page.title();
    expect(title).toContain('Practice');
    
    console.log('✓ Practice page loads');
  });

  test('practice session initializes', async ({ page }) => {
    await page.goto('practice/');
    
    // Wait for practice session to initialize
    await page.waitForFunction(() => {
      return window.practiceSession && 
             window.practiceSession.sessionCards && 
             window.practiceSession.sessionCards.length > 0;
    }, { timeout: 15000 });
    
    const sessionData = await page.evaluate(() => {
      return {
        hasSession: !!window.practiceSession,
        cardCount: window.practiceSession?.sessionCards?.length || 0,
        currentDirection: window.practiceSession?.currentDirection
      };
    });
    
    expect(sessionData.hasSession).toBeTruthy();
    expect(sessionData.cardCount).toBeGreaterThan(0);
    expect(['bg-de', 'de-bg']).toContain(sessionData.currentDirection);
    
    console.log(`✓ Session initialized with ${sessionData.cardCount} cards`);
  });

  test('flashcard DOM elements exist', async ({ page }) => {
    await page.goto('practice/');
    
    await page.waitForFunction(() => window.practiceSession, { timeout: 15000 });
    
    // Check for flashcard elements
    await expect(page.locator('#flashcard')).toBeVisible();
    await expect(page.locator('#flashcard-front')).toBeVisible();
    await expect(page.locator('#show-answer')).toBeVisible();
    await expect(page.locator('#progress')).toBeVisible();
    await expect(page.locator('#accuracy')).toBeVisible();
    
    console.log('✓ All flashcard DOM elements present');
  });

  test('vocabulary data loaded', async ({ page }) => {
    await page.goto('practice/');
    
    await page.waitForFunction(() => window.practiceSession, { timeout: 15000 });
    
    const dataLoaded = await page.evaluate(() => {
      const scriptEl = document.getElementById('practice-vocabulary-data');
      if (!scriptEl) return false;
      
      try {
        const data = JSON.parse(scriptEl.textContent);
        return Array.isArray(data) && data.length > 0;
      } catch {
        return false;
      }
    });
    
    expect(dataLoaded).toBeTruthy();
    console.log('✓ Vocabulary data embedded and parsed');
  });

  test('spaced repetition system loaded', async ({ page }) => {
    await page.goto('practice/');
    
    await page.waitForFunction(() => window.unifiedSpacedRepetition, { timeout: 15000 });
    
    const srData = await page.evaluate(() => {
      return {
        hasSR: !!window.unifiedSpacedRepetition,
        hasClass: !!window.UnifiedSpacedRepetition,
        methods: window.unifiedSpacedRepetition ? 
          Object.getOwnPropertyNames(Object.getPrototypeOf(window.unifiedSpacedRepetition)) : []
      };
    });
    
    expect(srData.hasSR).toBeTruthy();
    expect(srData.hasClass).toBeTruthy();
    expect(srData.methods).toContain('scheduleNext');
    expect(srData.methods).toContain('loadState');
    
    console.log('✓ Spaced repetition system loaded');
  });
});
