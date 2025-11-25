/**
 * @file a11y-helpers.ts
 * @description Accessibility testing utilities and helpers for Playwright tests
 */

import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility test configuration for WCAG 2.1 AA compliance
 */
export const A11Y_CONFIG = {
  rules: [
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
  ],
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
};

/**
 * Run accessibility scan on a page and return detailed results
 */
export async function runAccessibilityScan(page: Page, options?: { 
  includeTags?: string[];
  excludeTags?: string[];
  rules?: string[];
}) {
  const builder = new AxeBuilder({ page })
    .withTags(options?.includeTags || A11Y_CONFIG.tags);

  if (options?.excludeTags) {
    builder.excludeTags(options.excludeTags);
  }

  if (options?.rules) {
    options.rules.forEach(rule => builder.withRules(rule));
  }

  return await builder.analyze();
}

/**
 * Check if page has proper document structure
 */
export async function checkDocumentStructure(page: Page) {
  const issues = [];

  // Check HTML lang attribute
  const htmlLang = await page.locator('html').getAttribute('lang');
  if (!htmlLang) {
    issues.push('HTML element missing lang attribute');
  }

  // Check page title
  const title = await page.title();
  if (!title || title === 'Untitled') {
    issues.push('Page missing descriptive title');
  }

  // Check heading structure
  const h1Count = await page.locator('h1').count();
  if (h1Count === 0) {
    issues.push('Page missing h1 heading');
  }

  // Check heading hierarchy
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) => {
    return elements.map(el => ({
      tag: el.tagName,
      level: parseInt(el.tagName.substring(1)),
      text: el.textContent?.trim() || ''
    }));
  });

  let lastLevel = 0;
  for (const heading of headings) {
    if (heading.level > lastLevel + 1) {
      issues.push(`Heading hierarchy skipped: h${lastLevel} to h${heading.level}`);
    }
    lastLevel = heading.level;
  }

  return issues;
}

/**
 * Check focus management and keyboard navigation
 */
export async function checkKeyboardNavigation(page: Page) {
  const issues = [];

  // Get all focusable elements
  const focusableElements = await page.$$eval(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    (elements) => elements.map(el => ({
      tagName: el.tagName,
      text: el.textContent?.trim() || el.getAttribute('aria-label') || '',
      tabIndex: el.tabIndex,
      isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
    })).filter(el => el.isVisible)
  );

  if (focusableElements.length === 0) {
    issues.push('No focusable elements found on page');
    return issues;
  }

  // Test tab navigation
  await page.keyboard.press('Tab');
  const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

  if (!firstFocused) {
    issues.push('First tab press did not focus any element');
  }

  // Check focus indicators
  for (const element of focusableElements) {
    const hasFocusIndicator = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      
      const style = getComputedStyle(el);
      return style.outline !== 'none' || 
             style.boxShadow !== 'none' ||
             el.classList.contains('focus-visible');
    }, `[tabindex="${element.tabIndex}"]`);

    if (!hasFocusIndicator) {
      issues.push(`Focusable element missing visible focus indicator: ${element.tagName}`);
    }
  }

  return issues;
}

/**
 * Check ARIA attributes and roles
 */
export async function checkAriaAttributes(page: Page) {
  const issues = [];

  // Check for required ARIA attributes on common components
  const components = [
    { selector: '[role="button"]', requiredAttrs: ['aria-label', 'aria-pressed'] },
    { selector: '[role="dialog"]', requiredAttrs: ['aria-label', 'aria-modal'] },
    { selector: '[role="tablist"]', requiredAttrs: ['aria-label'] },
    { selector: '[role="tab"]', requiredAttrs: ['aria-selected', 'aria-controls'] },
    { selector: '[role="region"]', requiredAttrs: ['aria-label'] }
  ];

  for (const component of components) {
    const elements = await page.locator(component.selector);
    const count = await elements.count();

    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      
      for (const attr of component.requiredAttrs) {
        const hasAttr = await element.getAttribute(attr);
        if (!hasAttr) {
          issues.push(`Element with role="${await element.getAttribute('role')}" missing ${attr} attribute`);
        }
      }
    }
  }

  return issues;
}

/**
 * Check color contrast compliance
 */
export async function checkColorContrast(page: Page) {
  const scanResults = await runAccessibilityScan(page, {
    rules: ['color-contrast']
  });

  const contrastViolations = scanResults.violations.filter(
    violation => violation.id === 'color-contrast'
  );

  return contrastViolations.map(violation => ({
    description: violation.description,
    nodes: violation.nodes.map(node => node.html)
  }));
}

/**
 * Check image accessibility
 */
export async function checkImageAccessibility(page: Page) {
  const issues = [];

  const images = await page.locator('img');
  const count = await images.count();

  for (let i = 0; i < count; i++) {
    const image = images.nth(i);
    const alt = await image.getAttribute('alt');
    const role = await image.getAttribute('role');
    const ariaHidden = await image.getAttribute('aria-hidden');

    const isDecorative = role === 'presentation' || ariaHidden === 'true';

    if (isDecorative && alt !== '') {
      issues.push('Decorative image should have empty alt attribute');
    } else if (!isDecorative && (!alt || alt === '')) {
      issues.push('Informative image missing alt attribute');
    }
  }

  return issues;
}

/**
 * Check form accessibility
 */
export async function checkFormAccessibility(page: Page) {
  const issues = [];

  const formControls = await page.locator('input, select, textarea');
  const count = await formControls.count();

  for (let i = 0; i < count; i++) {
    const control = formControls.nth(i);
    const type = await control.getAttribute('type');

    // Skip hidden inputs
    if (type === 'hidden') continue;

    const hasLabel = await control.evaluate((el) => {
      return !!el.labels?.length || 
             el.hasAttribute('aria-label') || 
             el.hasAttribute('aria-labelledby');
    });

    if (!hasLabel) {
      issues.push(`Form control missing label: ${await control.getAttribute('type') || 'unknown'}`);
    }
  }

  return issues;
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(violations: any[], pageUrl: string) {
  if (violations.length === 0) {
    return {
      status: 'PASS',
      message: 'No accessibility violations found',
      url: pageUrl,
      timestamp: new Date().toISOString()
    };
  }

  const report = {
    status: 'FAIL',
    url: pageUrl,
    timestamp: new Date().toISOString(),
    violations: violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node: any) => ({
        html: node.html,
        failureSummary: node.failureSummary
      }))
    })),
    summary: {
      totalViolations: violations.length,
      byImpact: violations.reduce((acc, violation) => {
        acc[violation.impact] = (acc[violation.impact] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }
  };

  return report;
}

/**
 * Wait for page to be fully accessible (dynamic content loaded)
 */
export async function waitForAccessibilityReady(page: Page, timeout = 10000) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Additional wait for dynamic content
  
  // Wait for any ongoing animations or transitions
  await page.evaluate(() => {
    return new Promise(resolve => {
      const checkAnimations = () => {
        const animations = document.getAnimations();
        if (animations.length === 0) {
          resolve(true);
        } else {
          setTimeout(checkAnimations, 100);
        }
      };
      checkAnimations();
    });
  });
}