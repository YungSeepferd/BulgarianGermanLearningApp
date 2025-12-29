import { test, expect } from '@playwright/test';

// Basic SSR route test to ensure /learn renders safely
// Assumes dev server is managed via playwright.config.ts webServer

test.describe('SSR: Learn route', () => {
  test('renders page header and handles empty state without errors', async ({ page }) => {
    await page.goto('/learn');

    // Header present
    const header = page.locator('.page-header');
    await expect(header).toBeVisible();

    // Basic content should render without client-only crashes
    await expect(page.locator('body')).toBeVisible();
  });
});
