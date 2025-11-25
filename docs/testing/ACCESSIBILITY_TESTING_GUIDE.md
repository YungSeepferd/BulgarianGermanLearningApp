# Accessibility Testing Guide

This guide covers the automated accessibility testing implementation for the Bulgarian-German Learning App using axe-core with Playwright.

## Overview

The accessibility testing framework provides comprehensive WCAG 2.1 AA compliance testing across all critical pages and components of the application. It integrates seamlessly with the existing Playwright test suite and CI/CD pipeline.

## Features

- **WCAG 2.1 AA Compliance**: Tests for 23 critical accessibility rules
- **Cross-Browser Testing**: Runs on Chromium, Firefox, WebKit, and mobile browsers
- **Detailed Reporting**: HTML and JUnit reports with actionable violation details
- **Keyboard Navigation**: Comprehensive keyboard accessibility testing
- **ARIA Compliance**: Automated ARIA attribute validation
- **Color Contrast**: WCAG AA contrast ratio verification
- **Screen Reader Compatibility**: Dynamic content announcement testing

## Test Structure

### Main Accessibility Test File
- **Location**: `tests/playwright/a11y.test.ts`
- **Tests**: 13 comprehensive accessibility scenarios
- **Coverage**: Homepage, vocabulary, practice, grammar pages

### Keyboard Navigation Test File
- **Location**: `tests/playwright/keyboard-navigation.test.ts`
- **Tests**: 11 keyboard accessibility scenarios
- **Coverage**: Tab navigation, keyboard shortcuts, focus management

### Helper Utilities
- **Location**: `tests/playwright/helpers/a11y-helpers.ts`
- **Functions**: Reusable accessibility testing utilities

## Installation

The accessibility testing framework is automatically installed with the project dependencies:

```bash
npm install
```

## Running Tests

### All Accessibility Tests
```bash
npm run test:a11y
```

### Specific Test Files
```bash
# Accessibility tests only
npm run test:a11y

# Keyboard navigation tests only
npm run test:keyboard

# All tests with accessibility tag
npm run test:a11y:all
```

### Development and Debugging
```bash
# Run with browser UI
npm run test:a11y:headed

# Debug mode
npm run test:a11y:debug
```

## Test Coverage

### Page-Level Testing
- **Homepage**: Document structure, navigation, images, forms
- **Vocabulary Page**: Card grid, search functionality, filtering
- **Practice Page**: Flashcard interactions, keyboard controls, ARIA attributes
- **Grammar Page**: Content structure, interactive elements

### Component-Level Testing
- **Flashcards**: Flip animation, keyboard controls (Space/Enter), grading (0-5 keys)
- **Response Buttons**: ARIA labels, keyboard activation
- **Navigation**: Landmark roles, skip links, focus indicators
- **Forms**: Label associations, input validation

### WCAG 2.1 AA Rules Tested

| Rule ID | Description | Impact |
|---------|-------------|--------|
| color-contrast | Text and background contrast ratios | Critical |
| document-title | Page has descriptive title | Moderate |
| html-has-lang | HTML element has lang attribute | Critical |
| image-alt | Images have appropriate alt text | Critical |
| link-name | Links have discernible text | Critical |
| button-name | Buttons have accessible names | Critical |
| aria-allowed-attr | ARIA attributes are valid | Moderate |
| aria-required-attr | Required ARIA attributes present | Moderate |
| label | Form controls have associated labels | Critical |
| page-has-heading-one | Page has at least one h1 heading | Moderate |

## CI/CD Integration

The accessibility tests are integrated into the GitHub Actions workflow:

```yaml
- name: Run Accessibility Tests
  env:
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 1
  run: npm run test:a11y

- name: Run Keyboard Navigation Tests
  env:
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 1
  run: npm run test:keyboard
```

## Test Results and Reporting

### HTML Reports
Accessibility test results are available in HTML format:
```bash
npx playwright show-report
```

### JUnit Reports
JUnit XML reports are generated for CI integration:
- **Location**: `test-results/results.xml`

### Violation Details
When violations are detected, detailed reports include:
- Violation description and impact level
- Specific HTML elements causing issues
- Suggested fixes and WCAG references
- Screenshots of problematic elements

## Writing New Accessibility Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page should have no accessibility violations', async ({ page }) => {
  await page.goto('/path/');
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Using Helper Functions
```typescript
import { checkDocumentStructure, checkKeyboardNavigation } from '../helpers/a11y-helpers';

test('page has proper document structure', async ({ page }) => {
  await page.goto('/path/');
  const issues = await checkDocumentStructure(page);
  expect(issues).toEqual([]);
});
```

### Testing Specific Components
```typescript
test('component has proper ARIA attributes', async ({ page }) => {
  await page.goto('/path/');
  
  const component = page.locator('#component');
  await expect(component).toHaveAttribute('role', 'region');
  await expect(component).toHaveAttribute('aria-label', 'Component description');
});
```

## Common Accessibility Patterns

### Keyboard Navigation
```typescript
test('component is keyboard accessible', async ({ page }) => {
  await page.goto('/path/');
  
  // Test tab navigation
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).toBe('BUTTON');
  
  // Test activation
  await page.keyboard.press('Enter');
  // Verify expected behavior
});
```

### Dynamic Content
```typescript
test('dynamic updates are announced', async ({ page }) => {
  await page.goto('/path/');
  
  const liveRegion = page.locator('[aria-live]');
  await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
});
```

### Focus Management
```typescript
test('focus is properly managed', async ({ page }) => {
  await page.goto('/path/');
  
  // Check focus indicators
  const focusable = page.locator('button');
  const hasFocusStyle = await focusable.evaluate(el => 
    getComputedStyle(el).outline !== 'none'
  );
  expect(hasFocusStyle).toBe(true);
});
```

## Troubleshooting

### Common Issues

1. **False Positives**: Some accessibility rules may flag elements that are correctly implemented but use uncommon patterns. Review each violation carefully.

2. **Dynamic Content**: Ensure pages are fully loaded before running accessibility scans using `await page.waitForLoadState('networkidle')`.

3. **Mobile Testing**: Some accessibility issues may only appear on mobile devices. Use mobile browser projects for comprehensive testing.

4. **Color Contrast**: Automated contrast testing may miss gradient backgrounds or complex visual designs. Manual verification may be needed.

### Debugging Tips

- Use `test:a11y:debug` for interactive debugging
- Check browser console for additional context
- Review HTML reports for visual evidence of violations
- Test with screen readers for manual verification

## Best Practices

1. **Test Early and Often**: Run accessibility tests during development, not just before release.

2. **Comprehensive Coverage**: Test all user journeys, not just individual pages.

3. **Real User Testing**: Combine automated testing with manual accessibility testing.

4. **Continuous Improvement**: Regularly update tests as accessibility standards evolve.

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.2/)

## Support

For accessibility testing issues or questions, refer to:
- This documentation
- Playwright community resources
- WCAG 2.1 specification
- axe-core GitHub repository