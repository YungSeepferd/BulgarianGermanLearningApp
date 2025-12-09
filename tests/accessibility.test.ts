import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import {
  testAriaAttributes,
  testColorContrast,
  testKeyboardNavigation,
  testFocusManagement
} from './accessibility/helpers';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test('should have no accessibility violations on the home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard');
    await checkA11y(page);
  });

  test('should have no accessibility violations on the vocabulary page', async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForSelector('.page-grid');
    await checkA11y(page);
  });

  test('should have no accessibility violations on the grammar page', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForSelector('.grammar-container');
    await checkA11y(page);
  });

  test('should have no accessibility violations on the practice page', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForSelector('.tandem-practice');
    await checkA11y(page);
  });

  test('should have no accessibility violations on the learn page', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForSelector('.learn-page');
    await checkA11y(page);
  });

  test('should have no accessibility violations in responsive viewports', async ({ page }) => {
    const viewports = [
      { width: 320, height: 480 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 800 }  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForSelector('.dashboard');
      await checkA11y(page);
    }
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForSelector('.dashboard');
    await checkA11y(page);
  });

  test('should have proper ARIA attributes on navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard');

    await testAriaAttributes(page.locator('nav'), {
      'role': 'navigation',
      'aria-label': /Main navigation/
    });

    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();

    for (let i = 0; i < linkCount; i++) {
      await testAriaAttributes(navLinks.nth(i), {
        'role': 'link'
      });
    }
  });

  test('should have proper keyboard navigation for the application', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard');

    const navLinks = [
      'nav a[href="/"]',
      'nav a[href="/vocabulary"]',
      'nav a[href="/grammar"]',
      'nav a[href="/practice"]',
      'nav a[href="/learn"]'
    ];

    await testKeyboardNavigation(page, navLinks);
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard');

    await testFocusManagement(
      page,
      'nav a[href="/vocabulary"]',
      '.vocabulary-page'
    );
  });

  test('should have proper color contrast for all elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard');

    await testColorContrast(page.locator('nav'));
    await testColorContrast(page.locator('nav a'));
    await testColorContrast(page.locator('.btn-primary'));
    await testColorContrast(page.locator('.btn-secondary'));
    await testColorContrast(page.locator('.card'));
  });

  test('should have proper heading structure and landmarks', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard');

    const mainLandmark = await page.$('main, [role="main"]');
    expect(mainLandmark).not.toBeNull();

    const navLandmark = await page.$('nav, [role="navigation"]');
    expect(navLandmark).not.toBeNull();
  });
});