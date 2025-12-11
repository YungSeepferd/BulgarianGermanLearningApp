/**
 * Language toggle coverage
 *
 * Verifies the global navigation toggle switches UI language and that the
 * practice page direction toggle reflects and updates the direction state.
 */
import { test, expect, type Locator } from '@playwright/test';

const languageToggleRole = /language direction/i;

async function getText(locator: Locator) {
  const text = await locator.textContent();
  return text ? text.trim() : '';
}

test.describe('Language toggle', () => {
  test('updates navigation labels and practice direction', async ({ page }) => {
    await page.goto('/');

    const navToggle = page.getByRole('button', { name: languageToggleRole });
    await expect(navToggle).toBeVisible();

    const homeLink = page.getByRole('link', { name: /Startseite|Начало/ });
    await expect(homeLink).toBeVisible();

    const beforeHome = await getText(homeLink);
    await navToggle.click();
    const afterHome = await getText(homeLink);

    // Language switch should change the home link label
    expect(afterHome).not.toEqual(beforeHome);

    await page.goto('/practice');
    const practiceDirection = page.locator('.direction-toggle .direction-text');
    await expect(practiceDirection).toBeVisible();

    const beforeDirection = await getText(practiceDirection);
    await page.locator('.direction-toggle button').click();
    const afterDirection = await getText(practiceDirection);

    expect(afterDirection).not.toEqual(beforeDirection);
  });
});
