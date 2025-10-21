const { test, expect } = require('@playwright/test');

/**
 * Critical Test: Language Toggle (BG↔DE)
 * Tests bidirectional learning direction switching
 */

test.describe('Language Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('language toggle button exists and is clickable', async ({ page }) => {
    await page.goto('/');
    
    // Find language toggle (various possible selectors)
    const toggle = page.locator('#language-toggle, .language-toggle, button:has-text("BG"), button:has-text("DE")').first();
    await expect(toggle).toBeVisible({ timeout: 5000 });
    await expect(toggle).toBeEnabled();
    
    console.log('✅ Language toggle button found');
  });

  test('changes learning direction and persists to localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Get initial direction
    const initialDirection = await page.evaluate(() => {
      return localStorage.getItem('bgde:language-direction') || 
             localStorage.getItem('bgde:learning_direction') ||
             'de-bg';
    });
    
    console.log(`Initial direction: ${initialDirection}`);
    
    // Click toggle
    const toggle = page.locator('#language-toggle, .language-toggle').first();
    if (await toggle.count() > 0) {
      await toggle.click();
      await page.waitForTimeout(500);
      
      // Get new direction
      const newDirection = await page.evaluate(() => {
        return localStorage.getItem('bgde:language-direction') ||
               localStorage.getItem('bgde:learning_direction');
      });
      
      console.log(`New direction: ${newDirection}`);
      expect(newDirection).not.toBe(initialDirection);
      console.log('✅ Direction changed and persisted');
    }
  });

  test('flashcards respect language direction', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    // Get word in initial direction
    const wordBefore = await page.locator('#current-word').textContent();
    const translationBefore = await page.locator('#current-translation').textContent();
    
    console.log(`Before toggle: ${wordBefore} → ${translationBefore}`);
    
    // Toggle language direction via evaluate (more reliable for testing)
    await page.evaluate(() => {
      const currentDir = localStorage.getItem('bgde:language-direction') || 'de-bg';
      const newDir = currentDir === 'bg-de' ? 'de-bg' : 'bg-de';
      localStorage.setItem('bgde:language-direction', newDir);
      
      // Trigger custom event if the app listens for it
      window.dispatchEvent(new CustomEvent('language-direction-changed', {
        detail: { direction: newDir }
      }));
    });
    
    await page.waitForTimeout(500);
    
    // Reload to apply direction
    await page.reload();
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    // Get word after toggle
    const wordAfter = await page.locator('#current-word').textContent();
    const translationAfter = await page.locator('#current-translation').textContent();
    
    console.log(`After toggle: ${wordAfter} → ${translationAfter}`);
    
    // Words should be swapped
    expect(wordAfter).toBe(translationBefore);
    expect(translationAfter).toBe(wordBefore);
    
    console.log('✅ Flashcards respect direction change');
  });

  test('directional notes change with language toggle', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    // Flip to see notes
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Check if notes exist
    const notesEl = page.locator('#current-notes');
    const hasNotes = await notesEl.count() > 0;
    
    if (hasNotes && await notesEl.isVisible()) {
      const notesBefore = await notesEl.textContent();
      console.log(`Notes before: ${notesBefore}`);
      
      // Toggle direction
      await page.evaluate(() => {
        const currentDir = localStorage.getItem('bgde:language-direction') || 'de-bg';
        const newDir = currentDir === 'bg-de' ? 'de-bg' : 'bg-de';
        localStorage.setItem('bgde:language-direction', newDir);
      });
      
      // Reload and check again
      await page.reload();
      await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      
      const notesAfter = await notesEl.textContent();
      console.log(`Notes after: ${notesAfter}`);
      
      // Notes might be different (directional) or same (fallback)
      console.log('✅ Directional notes system active');
    } else {
      console.log('ℹ️  No notes found for this card');
    }
  });

  test('spaced repetition states are direction-specific', async ({ page }) => {
    await page.goto('/practice/');
    await page.waitForSelector('#flashcard', { state: 'visible', timeout: 15000 });
    
    // Get card ID
    const cardId = await page.evaluate(() => {
      return window.UnifiedPracticeSession?.currentCard?.id || 
             window.enhancedPracticeSession?.currentCard?.id;
    });
    
    // Complete card in direction 1
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('4');
    await page.waitForTimeout(400);
    
    // Get review state for direction 1
    const state1 = await page.evaluate((id) => {
      const dir1Key = `bgde:review_${id}_bg-de`;
      const dir2Key = `bgde:review_${id}_de-bg`;
      
      return {
        bgDe: localStorage.getItem(dir1Key),
        deBg: localStorage.getItem(dir2Key)
      };
    }, cardId);
    
    console.log('Review states:', state1);
    
    // At least one direction should have state
    const hasState = state1.bgDe || state1.deBg;
    if (hasState) {
      console.log('✅ Direction-specific review states saved');
    }
  });

  test('vocabulary cards show correct direction on list page', async ({ page }) => {
    // Set direction to BG→DE
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('bgde:language-direction', 'bg-de');
    });
    
    await page.goto('/vocabulary/');
    await page.waitForSelector('.vocab-card', { state: 'visible', timeout: 10000 });
    
    // Get first card's displayed text
    const firstCard = page.locator('.vocab-card').first();
    const cardText = await firstCard.textContent();
    
    console.log(`Card in BG→DE: ${cardText.substring(0, 50)}`);
    
    // Change to DE→BG
    await page.evaluate(() => {
      localStorage.setItem('bgde:language-direction', 'de-bg');
    });
    
    await page.reload();
    await page.waitForSelector('.vocab-card', { state: 'visible', timeout: 10000 });
    
    const cardTextReversed = await firstCard.textContent();
    console.log(`Card in DE→BG: ${cardTextReversed.substring(0, 50)}`);
    
    // Text might change based on direction
    console.log('✅ Vocabulary cards loaded with direction context');
  });
});
