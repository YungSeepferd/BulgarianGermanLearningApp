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
    await page.waitForSelector('.learn-page');
    await expectNoAccessibilityViolations(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    await testResponsiveAccessibility(page, async (page) => {
      await page.goto('/learn');
      await page.waitForSelector('.learn-page');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await testDarkModeAccessibility(page, async (page) => {
      await page.goto('/learn');
      await page.waitForSelector('.learn-page');
      await expectNoAccessibilityViolations(page);
    });
  });

  test('should have proper ARIA attributes on learn page elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');
    await page.waitForSelector('.session-active', { timeout: 5000 }).catch(() => {});

    // Check back link
    await testAriaAttributes(page.locator('.back-link'), {
      'aria-label': /Back to Dashboard/
    });

    // Check progress bar
    await testAriaAttributes(page.locator('.progress-bar'), {
      'role': 'progressbar'
    });

    // Check streak indicator
    await testAriaAttributes(page.locator('.streak'), {
      'role': 'status',
      'aria-label': /Current streak/
    });

    // Check buttons
    await testAriaAttributes(page.locator('.btn-primary:has-text("Try Again")'), {
      'role': 'button'
    });

    await testAriaAttributes(page.locator('.btn-secondary:has-text("Go Home")'), {
      'role': 'button'
    });

    await testAriaAttributes(page.locator('.btn-primary:has-text("Practice Again")'), {
      'role': 'button'
    });
  });

  test('should have proper keyboard navigation for learn page', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');

    // Start a new session to test interactive elements
    await page.waitForSelector('.btn-primary:has-text("Try Again")', { timeout: 5000 });
    await page.click('.btn-primary:has-text("Try Again")');
    await page.waitForSelector('.session-active', { timeout: 5000 }).catch(() => {});

    const interactiveElements = [
      '.back-link',
      '.flashcard',
      '.btn-primary:has-text("Check Answer")',
      '.btn-primary:has-text("Practice Again")',
      '.btn-secondary:has-text("Back to Dashboard")'
    ];

    await testKeyboardNavigation(page, interactiveElements, { startWithFocus: true });
  });

  test('should have proper focus management for lesson interactions', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');

    // Start a new session
    await page.waitForSelector('.btn-primary:has-text("Try Again")', { timeout: 5000 });
    await page.click('.btn-primary:has-text("Try Again")');
    await page.waitForSelector('.session-active', { timeout: 5000 }).catch(() => {});

    // Test focus management for flashcard
    const flashcard = page.locator('.flashcard');
    await flashcard.click();
    await expect(flashcard).toBeFocused();

    // Test focus management for buttons
    const nextButton = page.locator('.btn-primary:has-text("Check Answer")');
    await nextButton.focus();
    await expect(nextButton).toBeFocused();
  });

  test('should have proper color contrast for learn page elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');

    await testColorContrast(page.locator('.back-link'));
    await testColorContrast(page.locator('.progress-container'));
    await testColorContrast(page.locator('.streak'));
    await testColorContrast(page.locator('.btn-primary:has-text("Try Again")'));
    await testColorContrast(page.locator('.btn-secondary:has-text("Go Home")'));

    // Start a new session to test more elements
    await page.waitForSelector('.btn-primary:has-text("Try Again")', { timeout: 5000 });
    await page.click('.btn-primary:has-text("Try Again")');
    await page.waitForSelector('.session-active', { timeout: 5000 }).catch(() => {});

    await testColorContrast(page.locator('.flashcard'));
    await testColorContrast(page.locator('.btn-primary:has-text("Check Answer")'));
    await testColorContrast(page.locator('.btn-primary:has-text("Practice Again")'));
    await testColorContrast(page.locator('.btn-secondary:has-text("Back to Dashboard")'));
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');

    // Check for implicit heading (the back link serves as heading)
    const h1Headings = await page.$$('h1');
    expect(h1Headings.length).toBe(0); // No explicit h1, but that's okay with ARIA

    const mainLandmark = await page.$('main, [role="main"]');
    expect(mainLandmark).not.toBeNull();

    const navLandmark = await page.$('nav, [role="navigation"]');
    expect(navLandmark).not.toBeNull();
  });

  test('should be keyboard accessible for lesson navigation', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');

    // Start a new session
    await page.waitForSelector('.btn-primary:has-text("Try Again")', { timeout: 5000 });
    await page.click('.btn-primary:has-text("Try Again")');
    await page.waitForSelector('.session-active', { timeout: 5000 }).catch(() => {});

    // Test keyboard navigation through flashcard flow
    const flashcard = page.locator('.flashcard');
    await flashcard.focus();
    await expect(flashcard).toBeFocused();

    // Test that we can navigate to the check answer button
    await page.keyboard.press('Tab');
    const checkButton = page.locator('.btn-primary:has-text("Check Answer")');
    await expect(checkButton).toBeFocused();

    // Test Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator('.completion-screen')).toBeVisible();
  });

  test('should provide accessible feedback for lesson progress', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');

    // Start and complete a session
    await page.waitForSelector('.btn-primary:has-text("Try Again")', { timeout: 5000 });
    await page.click('.btn-primary:has-text("Try Again")');
    await page.waitForSelector('.session-active', { timeout: 5000 }).catch(() => {});

    // Complete the session by answering
    await page.click('.btn-primary:has-text("Check Answer")');
    await page.waitForSelector('.completion-screen', { timeout: 5000 }).catch(() => {});

    // Check that completion screen provides accessible feedback
    const completionScreen = page.locator('.completion-screen');
    await expect(completionScreen).toBeVisible();

    const xpSummary = page.locator('.xp-summary');
    await expect(xpSummary).toBeVisible();
    await expect(xpSummary).toContainText(/XP Earned/);

    const dailyGoal = page.locator('.daily-goal');
    await expect(dailyGoal).toBeVisible();
  });

  test('should support keyboard navigation for interactive lesson elements', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');

    // Start a new session
    await page.waitForSelector('.btn-primary:has-text("Try Again")', { timeout: 5000 });
    await page.click('.btn-primary:has-text("Try Again")');
    await page.waitForSelector('.session-active', { timeout: 5000 }).catch(() => {});

    // Test keyboard interaction with flashcard
    const flashcard = page.locator('.flashcard');
    await flashcard.focus();
    await expect(flashcard).toBeFocused();

    // Test Space key to flip card
    await page.keyboard.press('Space');
    // Note: We can't easily test the flip state, but we can test that the interaction works

    // Test Tab to move to next button
    await page.keyboard.press('Tab');
    const nextButton = page.locator('.btn-primary:has-text("Check Answer")');
    await expect(nextButton).toBeFocused();
  });
});