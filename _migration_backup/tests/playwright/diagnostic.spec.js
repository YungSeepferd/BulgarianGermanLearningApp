const { test, expect } = require('@playwright/test');

test('diagnostic - check practice page initialization', async ({ page }) => {
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  await page.goto('practice/');
  
  // Wait a bit for scripts to load
  await page.waitForTimeout(5000);
  
  // Check what's available on window
  const windowVars = await page.evaluate(() => {
    return {
      hasUnifiedPracticeSession: typeof window.UnifiedPracticeSession !== 'undefined',
      hasPracticeSession: typeof window.practiceSession !== 'undefined',
      hasEnhancedPracticeSession: typeof window.enhancedPracticeSession !== 'undefined',
      windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('practice')),
      flashcardExists: !!document.getElementById('flashcard'),
      showAnswerExists: !!document.getElementById('show-answer'),
      vocabularyData: !!document.getElementById('practice-vocabulary-data')
    };
  });
  
  console.log('\n=== DIAGNOSTIC RESULTS ===');
  console.log('Window variables:', JSON.stringify(windowVars, null, 2));
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(msg));
  console.log('\n=== ERRORS ===');
  errors.forEach(err => console.log(err));
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/diagnostic-practice-page.png', fullPage: true });
});
