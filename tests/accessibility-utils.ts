/**
 * Accessibility test utilities for Playwright
 *
 * This module provides reusable utilities for testing accessibility compliance
 * across the application using Playwright and axe-core.
 */

import { Page, Locator, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { AxeResults } from 'axe-core';

/**
 * Configuration options for accessibility scans
 */
export const ACCESSIBILITY_CONFIG = {
  // WCAG 2.1 AA compliance tags
  wcagTags: ['wcag2a', 'wcag2aa', 'best-practice'],

  // Rules to exclude (temporary exclusions should be documented)
  excludedRules: [
    // Example: 'color-contrast' // Temporarily excluded for dark mode testing
  ],

  // Rules to include with custom configuration
  includedRules: {
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'color-contrast': { enabled: true },
    'keyboard': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true }
  },

  // Viewport configurations for responsive testing
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1366, height: 768 }
  }
};

/**
 * Run an accessibility scan on a page or specific element
 *
 * @param page - Playwright page object
 * @param context - Optional selector or locator to test
 * @param options - Custom options for the scan
 * @returns Promise<AxeResults> - Axe scan results
 */
export async function runAccessibilityScan(
  page: Page,
  context?: string | Locator,
  options: { tags?: string[]; rules?: any } = {}
): Promise<AxeResults> {
  // Create axe builder with default configuration
  let builder = new AxeBuilder({ page })
    .withTags(options.tags || ACCESSIBILITY_CONFIG.wcagTags)
    .disableRules(ACCESSIBILITY_CONFIG.excludedRules);

  // Apply custom rule configurations
  Object.entries(ACCESSIBILITY_CONFIG.includedRules).forEach(([rule, config]) => {
    builder = builder.configureRule(rule, config);
  });

  // Apply custom options
  if (options.rules) {
    Object.entries(options.rules).forEach(([rule, config]) => {
      builder = builder.configureRule(rule, config);
    });
  }

  // Run scan on specific context if provided
  if (context) {
    if (typeof context === 'string') {
      return await builder.include(context).analyze();
    } else {
      return await builder.include(context).analyze();
    }
  }

  return await builder.analyze();
}

/**
 * Assert that an element has no accessibility violations
 *
 * @param page - Playwright page object
 * @param selector - Optional selector to test
 * @param options - Custom options for the scan
 */
export async function expectNoAccessibilityViolations(
  page: Page,
  selector?: string,
  options: { tags?: string[]; rules?: any } = {}
) {
  const results = await runAccessibilityScan(page, selector, options);

  // Filter out inconclusive results
  const criticalViolations = results.violations.filter(v => v.impact !== 'minor');

  if (criticalViolations.length > 0) {
    console.error('Accessibility violations found:', JSON.stringify(criticalViolations, null, 2));
  }

  // Assert no critical violations
  expect(criticalViolations).toEqual([]);

  // Assert no violations at all (including minor)
  expect(results.violations).toEqual([]);
}

/**
 * Test keyboard navigation between elements
 *
 * @param page - Playwright page object
 * @param selectors - Array of selectors in tab order
 * @param options - Options for keyboard navigation test
 */
export async function testKeyboardNavigation(
  page: Page,
  selectors: string[],
  options: { startWithFocus?: boolean } = {}
) {
  // Focus first element if specified
  if (options.startWithFocus && selectors.length > 0) {
    await page.focus(selectors[0]);
    await expect(page.locator(selectors[0])).toBeFocused();
  }

  // Test tab navigation through all elements
  for (let i = 0; i < selectors.length; i++) {
    await page.keyboard.press('Tab');

    // Verify the correct element is focused
    const expectedSelector = selectors[i];
    const focusedElement = page.locator(expectedSelector);

    await expect(focusedElement).toBeFocused();

    // Additional check: verify element is visible and enabled
    await expect(focusedElement).toBeVisible();
    await expect(focusedElement).toBeEnabled();
  }
}

/**
 * Test ARIA attributes on interactive elements
 *
 * @param locator - Playwright locator for the element
 * @param expectedAttributes - Object with expected ARIA attributes
 */
export async function testAriaAttributes(
  locator: Locator,
  expectedAttributes: Record<string, string | RegExp>
) {
  for (const [attr, expectedValue] of Object.entries(expectedAttributes)) {
    if (expectedValue instanceof RegExp) {
      await expect(locator).toHaveAttribute(attr, expectedValue);
    } else {
      await expect(locator).toHaveAttribute(attr, expectedValue);
    }
  }
}

/**
 * Test color contrast for text elements
 *
 * @param locator - Playwright locator for the text element
 * @param minContrastRatio - Minimum acceptable contrast ratio (default: 4.5 for WCAG AA)
 */
export async function testColorContrast(
  locator: Locator,
  minContrastRatio: number = 4.5
) {
  // Note: This is a simplified check. For accurate contrast testing,
  // consider using a dedicated contrast checking library or service.
  // This placeholder verifies that text has sufficient color definition.

  const color = await locator.evaluate(el => {
    return window.getComputedStyle(el).color;
  });

  // Basic check to ensure color is not default/inherited
  expect(color).not.toBe('rgba(0, 0, 0, 0)');
  expect(color).not.toBe('');

  // In a real implementation, you would calculate the actual contrast ratio
  // against the background color here.
}

/**
 * Test focus management for dynamic content
 *
 * @param page - Playwright page object
 * @param triggerSelector - Selector for the element that triggers dynamic content
 * @param targetSelector - Selector for the dynamic content that should receive focus
 */
export async function testFocusManagement(
  page: Page,
  triggerSelector: string,
  targetSelector: string
) {
  // Click the trigger element
  await page.click(triggerSelector);

  // Wait for the target to be visible
  await page.waitForSelector(targetSelector);

  // Verify the target receives focus
  await expect(page.locator(targetSelector)).toBeFocused();
}

/**
 * Test screen reader announcements
 *
 * @param page - Playwright page object
 * @param triggerAction - Function that triggers the announcement
 * @param expectedAnnouncement - Expected announcement text or pattern
 */
export async function testScreenReaderAnnouncement(
  page: Page,
  triggerAction: () => Promise<void>,
  expectedAnnouncement: string | RegExp
) {
  // Set up live region monitoring
  await page.evaluate(() => {
    window['lastAnnouncement'] = '';
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target instanceof HTMLElement) {
          window['lastAnnouncement'] = mutation.target.textContent || '';
        }
      });
    });

    const liveRegions = document.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => {
      observer.observe(region, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });
  });

  // Perform the action that should trigger an announcement
  await triggerAction();

  // Verify the announcement was made
  const announcement = await page.evaluate(() => window['lastAnnouncement']);

  if (expectedAnnouncement instanceof RegExp) {
    expect(announcement).toMatch(expectedAnnouncement);
  } else {
    expect(announcement).toContain(expectedAnnouncement);
  }
}

/**
 * Test responsive accessibility across different viewports
 *
 * @param page - Playwright page object
 * @param testFunction - Function that runs accessibility tests
 */
export async function testResponsiveAccessibility(
  page: Page,
  testFunction: (page: Page) => Promise<void>
) {
  // Test mobile viewport
  await page.setViewportSize(ACCESSIBILITY_CONFIG.viewports.mobile);
  await testFunction(page);

  // Test tablet viewport
  await page.setViewportSize(ACCESSIBILITY_CONFIG.viewports.tablet);
  await testFunction(page);

  // Test desktop viewport
  await page.setViewportSize(ACCESSIBILITY_CONFIG.viewports.desktop);
  await testFunction(page);
}

/**
 * Test accessibility in dark mode
 *
 * @param page - Playwright page object
 * @param testFunction - Function that runs accessibility tests
 */
export async function testDarkModeAccessibility(
  page: Page,
  testFunction: (page: Page) => Promise<void>
) {
  // Enable dark mode (implementation depends on your application)
  await page.emulateMedia({ colorScheme: 'dark' });
  await testFunction(page);

  // Reset to light mode
  await page.emulateMedia({ colorScheme: 'light' });
}