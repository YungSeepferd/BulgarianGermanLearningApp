import { test, expect } from '@playwright/test';

test('Homepage loads successfully', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');

  // Verify the page title
  await expect(page).toHaveTitle(/Bulgarian Language Learning App/);

  // Verify the header is present
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText('Welcome to Bulgarian Language Learning');

  // Verify the navigation menu is present
  const navMenu = page.locator('nav');
  await expect(navMenu).toBeVisible();

  // Verify the footer is present
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
});