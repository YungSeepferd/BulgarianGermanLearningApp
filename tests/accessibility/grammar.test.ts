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

test.describe('Grammar Page Accessibility', () => {
  test('should have no accessibility violations on the grammar page', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/grammar');
      await page.waitForSelector('.grammar-container');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/grammar');
      await page.waitForSelector('.grammar-container');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on grammar page elements', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    await testAriaAttributes(page.locator('.grammar-nav'), {
      'role': 'navigation',
      'aria-label': /Grammar topics/
    });

    const topicButtons = page.locator('.grammar-topic-btn');
    const topicCount = await topicButtons.count();

    for (let i = 0; i < topicCount; i++) {
      await testAriaAttributes(topicButtons.nth(i), {
        'role': 'button',
        'aria-expanded': /true|false/,
        'aria-controls': /grammar-content-/
      });
    }

    await testAriaAttributes(page.locator('.grammar-content'), {
      'role': 'region',
      'aria-label': /Grammar explanation/
    });

    const examples = page.locator('.grammar-example');
    const exampleCount = await examples.count();

    for (let i = 0; i < exampleCount; i++) {
      await testAriaAttributes(examples.nth(i), {
        'role': 'region',
        'aria-label': /Grammar example/
      });
    }

    const exercises = page.locator('.grammar-exercise');
    const exerciseCount = await exercises.count();

    for (let i = 0; i < exerciseCount; i++) {
      await testAriaAttributes(exercises.nth(i), {
        'role': 'region',
        'aria-label': /Grammar exercise/
      });
    }
  });

  test('should have proper keyboard navigation for grammar page', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    const interactiveElements = [
      '.grammar-topic-btn',
      '.grammar-exercise-btn',
      '.grammar-practice-btn',
      '.grammar-quiz-btn'
    ];

    await testKeyboardNavigation(page, interactiveElements, { startWithFocus: true });
  });

  test('should have proper focus management for grammar interactions', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    const firstTopic = page.locator('.grammar-topic-btn').first();
    await firstTopic.click();
    await expect(firstTopic).toHaveAttribute('aria-expanded', 'true');
    await expect(firstTopic).toBeFocused();

    const firstExercise = page.locator('.grammar-exercise').first();
    if (await firstExercise.isVisible()) {
      const exerciseButton = firstExercise.locator('.exercise-start-btn');
      if (await exerciseButton.isVisible()) {
        await testFocusManagement(
          page,
          '.exercise-start-btn',
          '.exercise-container'
        );
      }
    }
  });

  test('should have proper color contrast for grammar elements', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    await testColorContrast(page.locator('.grammar-topic-btn'));
    await testColorContrast(page.locator('.grammar-explanation'));
    await testColorContrast(page.locator('.grammar-example'));
    await testColorContrast(page.locator('.grammar-exercise'));
    await testColorContrast(page.locator('.grammar-exercise-btn'));
    await testColorContrast(page.locator('.grammar-practice-btn'));
    await testColorContrast(page.locator('.grammar-quiz-btn'));

    const codeExamples = page.locator('.grammar-code-example');
    const codeCount = await codeExamples.count();

    for (let i = 0; i < codeCount; i++) {
      await testColorContrast(codeExamples.nth(i));
    }
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBeGreaterThan(0);
    const h1Text = await page.textContent('h1');
    expect(h1Text).toMatch(/Grammar|Grammatik/i);

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

  test('should be keyboard accessible for grammar exercises', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    const exercises = page.locator('.grammar-exercise');
    const exerciseCount = await exercises.count();

    if (exerciseCount > 0) {
      const firstExercise = exercises.first();
      const startButton = firstExercise.locator('.exercise-start-btn');

      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForSelector('.exercise-container.visible');

        const exerciseElements = [
          '.exercise-question',
          '.exercise-input',
          '.exercise-submit-btn',
          '.exercise-feedback'
        ];

        await testKeyboardNavigation(page, exerciseElements, { startWithFocus: false });

        await page.focus('.exercise-input');
        await expect(page.locator('.exercise-input')).toBeFocused();

        await page.keyboard.type('Test answer');
        await page.keyboard.press('Enter');

        const feedback = page.locator('.exercise-feedback.visible');
        await expect(feedback).toHaveAttribute('aria-live', 'polite');
      }
    }
  });

  test('should provide accessible feedback for grammar exercises', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    const exercises = page.locator('.grammar-exercise');
    const exerciseCount = await exercises.count();

    if (exerciseCount > 0) {
      const firstExercise = exercises.first();
      const startButton = firstExercise.locator('.exercise-start-btn');

      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForSelector('.exercise-container.visible');

        await page.click('.exercise-submit-btn');

        const feedback = page.locator('.exercise-feedback.visible');
        await expect(feedback).toHaveAttribute('aria-live', 'polite');

        const feedbackText = await feedback.textContent();
        expect(feedbackText).toMatch(/correct|incorrect|try again/i);
      }
    }
  });

  test('should support keyboard navigation for grammar topic expansion', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');

    const firstTopic = page.locator('.grammar-topic-btn').first();
    await firstTopic.focus();
    await expect(firstTopic).toBeFocused();

    const initialAriaExpanded = await firstTopic.getAttribute('aria-expanded');
    await page.keyboard.press('Enter');
    const toggledAriaExpanded = await firstTopic.getAttribute('aria-expanded');
    expect(toggledAriaExpanded).not.toBe(initialAriaExpanded);

    await page.keyboard.press('Space');
    const finalAriaExpanded = await firstTopic.getAttribute('aria-expanded');
    expect(finalAriaExpanded).not.toBe(toggledAriaExpanded);
    expect(finalAriaExpanded).toBe(initialAriaExpanded);
  });
});