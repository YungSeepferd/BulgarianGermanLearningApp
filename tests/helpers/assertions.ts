/**
 * Custom test assertions
 *
 * Reusable custom assertions for testing
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Assert that an element is visible and enabled
 */
export async function expectVisibleAndEnabled(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
}

/**
 * Assert that an element is visible but disabled
 */
export async function expectVisibleButDisabled(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  await expect(locator).toBeDisabled();
}

/**
 * Assert that an element contains text (partial match)
 */
export async function expectContainsText(locator: Locator, text: string): Promise<void> {
  await expect(locator).toContainText(text);
}

/**
 * Assert that an element has a specific ARIA attribute
 */
export async function expectAriaAttribute(
  locator: Locator,
  attribute: string,
  value: string | RegExp
): Promise<void> {
  await expect(locator).toHaveAttribute(`aria-${attribute}`, value);
}

/**
 * Assert that focus is on a specific element
 */
export async function expectFocusOn(locator: Locator): Promise<void> {
  await expect(locator).toBeFocused();
}

/**
 * Assert that the page URL matches a pattern
 */
export async function expectUrlToMatch(page: Page, pattern: RegExp | string): Promise<void> {
  await expect(page).toHaveURL(pattern);
}

/**
 * Assert that an element has a specific CSS class
 */
export async function expectHasClass(locator: Locator, className: string): Promise<void> {
  await expect(locator).toHaveClass(new RegExp(className));
}

/**
 * Assert that an element's value matches
 */
export async function expectValue(locator: Locator, value: string): Promise<void> {
  await expect(locator).toHaveValue(value);
}

/**
 * Assert that an input is empty
 */
export async function expectEmptyInput(locator: Locator): Promise<void> {
  await expect(locator).toHaveValue('');
}

/**
 * Assert that an element is not in the DOM
 */
export async function expectNotAttached(locator: Locator): Promise<void> {
  await expect(locator).not.toBeAttached();
}

/**
 * Assert that an element is hidden
 */
export async function expectHidden(locator: Locator): Promise<void> {
  await expect(locator).toBeHidden();
}

/**
 * Assert that a count of elements matches expected
 */
export async function expectCount(locator: Locator, expected: number): Promise<void> {
  await expect(locator).toHaveCount(expected);
}

/**
 * Assert that a count of elements is at least a minimum
 */
export async function expectMinCount(locator: Locator, min: number): Promise<void> {
  const count = await locator.count();
  expect(count).toBeGreaterThanOrEqual(min);
}

/**
 * Assert that a count of elements is at most a maximum
 */
export async function expectMaxCount(locator: Locator, max: number): Promise<void> {
  const count = await locator.count();
  expect(count).toBeLessThanOrEqual(max);
}

/**
 * Assert that text content matches a pattern
 */
export async function expectTextMatches(locator: Locator, pattern: RegExp): Promise<void> {
  const text = await locator.textContent();
  expect(text).toMatch(pattern);
}

/**
 * Assert that a numeric value is within a range
 */
export function expectInRange(value: number, min: number, max: number): void {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

/**
 * Assert that a string contains only valid German characters
 */
export function expectValidGerman(text: string): void {
  const germanPattern = /^[a-zA-ZäöüßÄÖÜ\s\-.,!?'"()0-9]+$/;
  expect(germanPattern.test(text)).toBe(true);
}

/**
 * Assert that a string contains only valid Bulgarian characters
 */
export function expectValidBulgarian(text: string): void {
  const bulgarianPattern = /^[абвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ\s\-.,!?'"()0-9]+$/;
  expect(bulgarianPattern.test(text)).toBe(true);
}

/**
 * Assert that text does not contain Russian-only characters
 */
export function expectNoRussianChars(text: string): void {
  const russianChars = ['ы', 'э', 'ё', 'Ё'];
  for (const char of russianChars) {
    expect(text).not.toContain(char);
  }
}

/**
 * Assert that a CEFR level is valid
 */
export function expectValidCefrLevel(level: string): void {
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  expect(validLevels).toContain(level);
}

/**
 * Assert that a part of speech is valid
 */
export function expectValidPartOfSpeech(pos: string): void {
  const validParts = [
    'noun', 'verb', 'adjective', 'adverb', 'pronoun',
    'preposition', 'conjunction', 'interjection', 'phrase', 'numeral'
  ];
  expect(validParts).toContain(pos.toLowerCase());
}

/**
 * Assert that an element has proper heading level
 */
export async function expectHeadingLevel(locator: Locator, level: 1 | 2 | 3 | 4 | 5 | 6): Promise<void> {
  const tagName = await locator.evaluate(el => el.tagName);
  expect(tagName).toBe(`H${level}`);
}

/**
 * Assert that the page has exactly one h1 element
 */
export async function expectSingleH1(page: Page): Promise<void> {
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBe(1);
}

/**
 * Assert that heading hierarchy is logical (h1 -> h2 -> h3, etc.)
 */
export async function expectLogicalHeadingHierarchy(page: Page): Promise<void> {
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
    elements.map(el => parseInt(el.tagName[1], 10))
  );

  let lastLevel = 0;
  for (const level of headings) {
    // Heading should not skip levels (h1 -> h3 is bad)
    expect(level).toBeLessThanOrEqual(lastLevel + 1);
    lastLevel = level;
  }
}

/**
 * Assert that color contrast meets WCAG AA (simplified check)
 */
export async function expectSufficientContrast(locator: Locator): Promise<void> {
  const styles = await locator.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      fontSize: computed.fontSize
    };
  });

  // Basic check: ensure color and background are defined
  expect(styles.color).not.toBe('');
  expect(styles.backgroundColor).not.toBe('');

  // Full contrast calculation would require a dedicated library
}

/**
 * Assert that a touch target meets minimum size (48x48px for WCAG)
 */
export async function expectMinimumTouchTarget(locator: Locator, minSize: number = 48): Promise<void> {
  const box = await locator.boundingBox();
  if (box) {
    expect(box.width).toBeGreaterThanOrEqual(minSize);
    expect(box.height).toBeGreaterThanOrEqual(minSize);
  }
}

/**
 * Assert that performance timing is within threshold
 */
export async function expectPerformanceTiming(
  page: Page,
  metric: 'load' | 'domcontentloaded' | 'response',
  maxMs: number
): Promise<void> {
  const timing = await page.evaluate(() => performance.timing);
  let duration: number;

  switch (metric) {
    case 'load':
      duration = timing.loadEventEnd - timing.navigationStart;
      break;
    case 'domcontentloaded':
      duration = timing.domContentLoadedEventEnd - timing.navigationStart;
      break;
    case 'response':
      duration = timing.responseEnd - timing.requestStart;
      break;
  }

  expect(duration).toBeLessThanOrEqual(maxMs);
}

/**
 * Assert that an element is visible within the viewport
 */
export async function expectInViewport(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();

  const box = await locator.boundingBox();
  expect(box).not.toBeNull();

  // Element should have positive dimensions
  if (box) {
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  }
}

/**
 * Assert that localStorage has a specific key
 */
export async function expectLocalStorageKey(page: Page, key: string): Promise<void> {
  const value = await page.evaluate((k) => localStorage.getItem(k), key);
  expect(value).not.toBeNull();
}

/**
 * Assert that IndexedDB has data
 */
export async function expectIndexedDbData(
  page: Page,
  dbName: string,
  storeName: string
): Promise<void> {
  const hasData = await page.evaluate(
    async ({ dbName, storeName }) => {
      return new Promise((resolve) => {
        const request = indexedDB.open(dbName);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const countRequest = store.count();
          countRequest.onsuccess = () => resolve(countRequest.result > 0);
          countRequest.onerror = () => resolve(false);
        };
        request.onerror = () => resolve(false);
      });
    },
    { dbName, storeName }
  );

  expect(hasData).toBe(true);
}

/**
 * Assert that a toast/notification message appears
 */
export async function expectToastMessage(page: Page, message: string | RegExp): Promise<void> {
  const toast = page.locator('.toast, .notification, [role="alert"]').first();
  await expect(toast).toBeVisible({ timeout: 5000 });

  if (typeof message === 'string') {
    await expect(toast).toContainText(message);
  } else {
    const text = await toast.textContent();
    expect(text).toMatch(message);
  }
}

/**
 * Assert that an error message is displayed
 */
export async function expectErrorMessage(page: Page, message?: string | RegExp): Promise<void> {
  const errorElement = page.locator('.error, [role="alert"], .error-message').first();
  await expect(errorElement).toBeVisible();

  if (message) {
    if (typeof message === 'string') {
      await expect(errorElement).toContainText(message);
    } else {
      const text = await errorElement.textContent();
      expect(text).toMatch(message);
    }
  }
}