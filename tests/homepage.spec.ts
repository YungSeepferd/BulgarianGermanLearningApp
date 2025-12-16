import { test, expect } from '@playwright/test';

test('Homepage loads successfully', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');

  // Verify the page title
  // Default language is German, so title should be "Übersicht"
  await expect(page).toHaveTitle(/Übersicht|Dashboard/);

  // Verify the header is present
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText(/Übersicht|Dashboard/);

  // Verify the navigation menu is present
  const navMenu = page.locator('nav');
  await expect(navMenu).toBeVisible();
});