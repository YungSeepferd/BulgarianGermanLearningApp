/**
 * @file a11y.test.ts
 * @description Automated accessibility testing using axe-core with Playwright
 * @tags @a11y
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Test configuration for accessibility testing
const A11Y_CONFIG = {
  rules: [
    // WCAG 2.1 Level A & AA rules
    'color-contrast',
    'document-title',
    'html-has-lang',
    'image-alt',
    'input-image-alt',
    'link-name',
    'list',
    'listitem',
    'meta-viewport',
    'region',
    'aria-allowed-attr',
    'aria-hidden-focus',
    'aria-required-attr',
    'aria-roles',
    'aria-valid-attr-value',
    'button-name',
    'frame-title',
    'html-lang-valid',
    'label',
    'landmark-one-main',
    'page-has-heading-one',
    'tabindex',
    'valid-lang'
  ]
};

test.describe('Accessibility Tests @a11y', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure page is fully loaded before accessibility testing
    await page.waitForLoadState('networkidle');
  });

  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('./');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Generate detailed report for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Homepage accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
  });

  test('vocabulary page should have no accessibility violations', async ({ page }) => {
    await page.goto('vocabulary/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Vocabulary page accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
  });

  test('practice page should have no accessibility violations', async ({ page }) => {
    await page.goto('practice/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Practice page accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
  });

  test('grammar page should have no accessibility violations', async ({ page }) => {
    await page.goto('grammar/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Grammar page accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
  });

  test('flashcard component should have proper ARIA attributes', async ({ page }) => {
    await page.goto('practice/');
    
    // Wait for flashcard to load
    await page.waitForSelector('#flashcard');
    
    // Check ARIA attributes on flashcard
    const flashcard = page.locator('#flashcard');
    await expect(flashcard).toHaveAttribute('role', 'region');
    await expect(flashcard).toHaveAttribute('aria-label', /flashcard|card/i);
    
    // Check front and back sections
    const front = page.locator('#flashcard-front');
    const back = page.locator('#flashcard-back');
    
    await expect(front).toHaveAttribute('aria-hidden', 'false');
    await expect(back).toHaveAttribute('aria-hidden', 'true');
    
    // Flip the card and check ARIA updates
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    await expect(front).toHaveAttribute('aria-hidden', 'true');
    await expect(back).toHaveAttribute('aria-hidden', 'false');
  });

  test('response buttons should have proper accessibility attributes', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#flashcard');
    
    // Flip card to show response buttons
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    const responseButtons = page.locator('#response-buttons button');
    const count = await responseButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = responseButtons.nth(i);
      await expect(button).toHaveAttribute('role', 'button');
      await expect(button).toHaveAttribute('aria-label', /difficulty|grade/i);
      await expect(button).toBeVisible();
    }
  });

  test('navigation should have proper landmark roles', async ({ page }) => {
    await page.goto('./');
    
    // Check for main navigation landmark
    const nav = page.locator('nav');
    if (await nav.count() > 0) {
      await expect(nav).toHaveAttribute('role', 'navigation');
      await expect(nav).toHaveAttribute('aria-label', /main|primary/i);
    }
    
    // Check for main content landmark
    const main = page.locator('main');
    if (await main.count() > 0) {
      await expect(main).toHaveAttribute('role', 'main');
    }
    
    // Check for header landmark
    const header = page.locator('header');
    if (await header.count() > 0) {
      await expect(header).toHaveAttribute('role', 'banner');
    }
  });

  test('images should have proper alt text', async ({ page }) => {
    await page.goto('./');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // Decorative images should have empty alt, others should have descriptive alt
      const isDecorative = await image.evaluate((img) => {
        return img.hasAttribute('role') && img.getAttribute('role') === 'presentation' ||
               img.hasAttribute('aria-hidden') && img.getAttribute('aria-hidden') === 'true';
      });
      
      if (isDecorative) {
        expect(alt).toBe('');
      } else {
        expect(alt).not.toBeNull();
        expect(alt).not.toBe('');
      }
    }
  });

  test('color contrast should meet WCAG AA standards', async ({ page }) => {
    await page.goto('./');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();

    // Filter only color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
    
    if (contrastViolations.length > 0) {
      console.log('Color contrast violations:', JSON.stringify(contrastViolations, null, 2));
    }
  });

  test('keyboard focus should be visible and logical', async ({ page }) => {
    await page.goto('./');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Get focused element
    const focused = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        tagName: active?.tagName,
        role: active?.getAttribute('role'),
        tabIndex: active?.getAttribute('tabindex'),
        hasFocusVisible: active?.classList.contains('focus-visible') || 
                        getComputedStyle(active).outline !== 'none'
      };
    });
    
    expect(focused.tagName).toMatch(/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/);
    expect(focused.hasFocusVisible).toBe(true);
  });

  test('form elements should have proper labels', async ({ page }) => {
    await page.goto('./');
    
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      
      // Skip hidden inputs
      if (type === 'hidden') continue;
      
      // Check for associated label or aria-label
      const hasLabel = await input.evaluate((el) => {
        return !!el.labels?.length || 
               el.hasAttribute('aria-label') || 
               el.hasAttribute('aria-labelledby');
      });
      
      expect(hasLabel).toBe(true);
    }
  });

  test('dynamic content updates should be announced to screen readers', async ({ page }) => {
    await page.goto('practice/');
    await page.waitForSelector('#flashcard');
    
    // Check for live region attributes on dynamic content
    const progress = page.locator('#progress');
    const accuracy = page.locator('#accuracy');
    
    if (await progress.count() > 0) {
      const hasLiveRegion = await progress.evaluate((el) => {
        return el.hasAttribute('aria-live') || el.hasAttribute('aria-atomic');
      });
      expect(hasLiveRegion).toBe(true);
    }
    
    if (await accuracy.count() > 0) {
      const hasLiveRegion = await accuracy.evaluate((el) => {
        return el.hasAttribute('aria-live') || el.hasAttribute('aria-atomic');
      });
      expect(hasLiveRegion).toBe(true);
    }
  });

  test('page should have proper document structure', async ({ page }) => {
    await page.goto('./');
    
    // Check document language
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');
    
    // Check page title
    const title = await page.title();
    expect(title).not.toBe('');
    expect(title).not.toBe('Untitled');
    
    // Check for heading structure
    const h1 = page.locator('h1');
    expect(await h1.count()).toBeGreaterThan(0);
    
    // Check heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) => {
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim()
      }));
    });
    
    // Ensure proper heading order (no skipping levels)
    let lastLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.tag.substring(1));
      expect(level).toBeLessThanOrEqual(lastLevel + 1);
      lastLevel = level;
    }
  });
});