/**
 * Helper utilities for Playwright tests
 */

/**
 * Wait for practice session to initialize
 */
async function waitForPracticeSession(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return document.getElementById('flashcard') !== null &&
           (window.UnifiedPracticeSession || window.enhancedPracticeSession);
  }, { timeout });
}

/**
 * Complete a single flashcard with a given grade
 */
async function completeCard(page, grade = 3) {
  // Flip card
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  
  // Grade card
  await page.keyboard.press(String(grade));
  await page.waitForTimeout(400);
}

/**
 * Get current session statistics
 */
async function getSessionStats(page) {
  const progress = await page.locator('#progress').textContent();
  const accuracy = await page.locator('#accuracy').textContent();
  
  return { progress: progress.trim(), accuracy: accuracy.trim() };
}

/**
 * Clear all bgde: prefixed localStorage items
 */
async function clearBgDeStorage(page) {
  await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('bgde:'));
    keys.forEach(k => localStorage.removeItem(k));
  });
}

/**
 * Set language direction
 */
async function setLanguageDirection(page, direction = 'de-bg') {
  await page.evaluate((dir) => {
    localStorage.setItem('bgde:language-direction', dir);
    window.dispatchEvent(new CustomEvent('language-direction-changed', {
      detail: { direction: dir }
    }));
  }, direction);
}

/**
 * Get all review states from localStorage
 */
async function getReviewStates(page) {
  return await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('bgde:review'));
    const states = {};
    
    keys.forEach(key => {
      try {
        states[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        states[key] = localStorage.getItem(key);
      }
    });
    
    return states;
  });
}

/**
 * Monitor console errors during test
 */
async function monitorConsoleErrors(page) {
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  return errors;
}

/**
 * Wait for element with retry
 */
async function waitForElementWithRetry(page, selector, options = {}) {
  const maxRetries = options.retries || 3;
  const timeout = options.timeout || 5000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      return true;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Take screenshot with timestamp
 */
async function takeTimestampedScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  await page.screenshot({ path: `test-results/${filename}`, fullPage: true });
  return filename;
}

/**
 * Assert no console errors occurred
 */
function assertNoConsoleErrors(errors, allowedPatterns = []) {
  const filteredErrors = errors.filter(error => {
    return !allowedPatterns.some(pattern => error.includes(pattern));
  });
  
  if (filteredErrors.length > 0) {
    console.error('Console errors detected:', filteredErrors);
    throw new Error(`Found ${filteredErrors.length} console error(s)`);
  }
}

module.exports = {
  waitForPracticeSession,
  completeCard,
  getSessionStats,
  clearBgDeStorage,
  setLanguageDirection,
  getReviewStates,
  monitorConsoleErrors,
  waitForElementWithRetry,
  takeTimestampedScreenshot,
  assertNoConsoleErrors
};
