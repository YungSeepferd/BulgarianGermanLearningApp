import { test, expect } from '@playwright/test';
import {
  expectNoAccessibilityViolations,
  testKeyboardNavigation,
  testAriaAttributes,
  testColorContrast,
  testFocusManagement,
  testResponsiveAccessibility,
  testDarkModeAccessibility
} from '../accessibility-utils';

test.describe('Learn Page Accessibility', () => {
  test('should have no accessibility violations on the learn page', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/learn');
      await page.waitForSelector('.lesson-container');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/learn');
      await page.waitForSelector('.lesson-container');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on learn page elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');

    await testAriaAttributes(page.locator('.lesson-nav'), {
      'role': 'navigation',
      'aria-label': /Lesson navigation/
    });

    await testAriaAttributes(page.locator('.lesson-list'), {
      'role': 'list',
      'aria-label': /Available lessons/
    });

    const lessonItems = page.locator('.lesson-item');
    const itemCount = await lessonItems.count();

    for (let i = 0; i < itemCount; i++) {
      await testAriaAttributes(lessonItems.nth(i), {
        'role': 'listitem',
        'aria-label': /Lesson/
      });
    }

    await testAriaAttributes(page.locator('.lesson-content'), {
      'role': 'region',
      'aria-label': /Lesson content/
    });

    await testAriaAttributes(page.locator('.lesson-progress'), {
      'role': 'region',
      'aria-label': /Lesson progress/
    });

    const interactiveElements = page.locator('.lesson-interactive-element');
    const interactiveCount = await interactiveElements.count();

    for (let i = 0; i < interactiveCount; i++) {
      await testAriaAttributes(interactiveElements.nth(i), {
        'role': /button|link/,
        'aria-label': /Interactive element/
      });
    }
  });

  test('should have proper keyboard navigation for learn page', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');

    const interactiveElements = [
      '.lesson-item',
      '.lesson-start-btn',
      '.lesson-continue-btn',
      '.lesson-next-btn',
      '.lesson-previous-btn',
      '.lesson-complete-btn'
    ];

    await testKeyboardNavigation(page, interactiveElements, { startWithFocus: true });
  });

  test('should have proper focus management for lesson interactions', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');

    const firstLesson = page.locator('.lesson-item').first();
    await firstLesson.click();
    await expect(firstLesson).toBeFocused();

    const startButton = page.locator('.lesson-start-btn');
    if (await startButton.isVisible()) {
      await testFocusManagement(
        page,
        '.lesson-start-btn',
        '.lesson-content'
      );
    }

    const interactiveElements = page.locator('.lesson-interactive-element');
    const interactiveCount = await interactiveElements.count();

    if (interactiveCount > 0) {
      const firstInteractive = interactiveElements.first();
      await firstInteractive.click();
      await expect(firstInteractive).toBeFocused();
    }
  });

  test('should have proper color contrast for learn page elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');

    await testColorContrast(page.locator('.lesson-title'));
    await testColorContrast(page.locator('.lesson-description'));
    await testColorContrast(page.locator('.lesson-content'));
    await testColorContrast(page.locator('.lesson-instructions'));
    await testColorContrast(page.locator('.lesson-item'));
    await testColorContrast(page.locator('.lesson-start-btn'));
    await testColorContrast(page.locator('.lesson-continue-btn'));
    await testColorContrast(page.locator('.lesson-next-btn'));
    await testColorContrast(page.locator('.lesson-previous-btn'));
    await testColorContrast(page.locator('.lesson-complete-btn'));
    await testColorContrast(page.locator('.lesson-progress'));
    await testColorContrast(page.locator('.progress-text'));
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');

    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBeGreaterThan(0);
    const h1Text = await page.textContent('h1');
    expect(h1Text).toMatch(/Learn|Lessons|Lektionen/i);

    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => {
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || ''
      }));
    });

    expect(headings.length).toBeGreaterThan(3);

    const mainLandmark = await page.$('main, [role="main"]');
    expect(mainLandmark).not.toBeNull();

    const navLandmark = await page.$('nav, [role="navigation"]');
    expect(navLandmark).not.toBeNull();

    const regionLandmarks = await page.$$('[role="region"]');
    expect(regionLandmarks.length).toBeGreaterThan(2);
  });

  test('should be keyboard accessible for lesson navigation', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');

    const firstLesson = page.locator('.lesson-item').first();
    await firstLesson.focus();
    await expect(firstLesson).toBeFocused();

    await page.keyboard.press('ArrowDown');
    const secondLesson = page.locator('.lesson-item').nth(1);
    await expect(secondLesson).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(firstLesson).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('.lesson-content')).toBeVisible();

    const nextButton = page.locator('.lesson-next-btn');
    if (await nextButton.isVisible()) {
      await nextButton.focus();
      await expect(nextButton).toBeFocused();

      await page.keyboard.press('Enter');
      await expect(page.locator('.lesson-content')).toBeVisible();
    }
  });

  test('should provide accessible feedback for lesson progress', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');

    const firstLesson = page.locator('.lesson-item').first();
    await firstLesson.click();
    await page.waitForSelector('.lesson-content');

    const completeButton = page.locator('.lesson-complete-btn');
    if (await completeButton.isVisible()) {
      await completeButton.click();

      const feedback = page.locator('.lesson-feedback');
      if (await feedback.isVisible()) {
        await expect(feedback).toHaveAttribute('aria-live', 'polite');
        const feedbackText = await feedback.textContent();
        expect(feedbackText).toMatch(/completed|finished|success/i);
      }

      const progressUpdate = page.locator('.progress-update');
      if (await progressUpdate.isVisible()) {
        await expect(progressUpdate).toHaveAttribute('aria-live', 'polite');
      }
    }
  });

  test('should support keyboard navigation for interactive lesson elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.lesson-container');

    const firstLesson = page.locator('.lesson-item').first();
    await firstLesson.click();
    await page.waitForSelector('.lesson-content');

    const interactiveElements = page.locator('.lesson-interactive-element');
    const interactiveCount = await interactiveElements.count();

    if (interactiveCount > 0) {
      const firstInteractive = interactiveElements.first();
      await firstInteractive.focus();
      await expect(firstInteractive).toBeFocused();

      if (await firstInteractive.getAttribute('role') === 'button') {
        const initialState = await firstInteractive.getAttribute('aria-pressed');
        await page.keyboard.press('Space');
        const toggledState = await firstInteractive.getAttribute('aria-pressed');
        expect(toggledState).not.toBe(initialState);
      }

      await page.keyboard.press('Tab');
      const secondInteractive = interactiveElements.nth(1);
      await expect(secondInteractive).toBeFocused();
    }
  });
});