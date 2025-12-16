import { test, expect } from '@playwright/test';

test('Practice page loads successfully', async ({ page }) => {
  await page.goto('/practice');

  // Verify the page title
  // "Üben" (DE) or "Упражнения" (BG)
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText(/Üben|Упражнения/);

  // Verify the practice card is present (or loading state)
  // We might see a loading spinner first
  const practiceCard = page.locator('.practice-card');
  // Wait for it to appear (it might take a moment to load the item)
  await expect(practiceCard).toBeVisible({ timeout: 10000 });

  // Verify we have an input field for the answer
  const answerInput = page.locator('input.answer-input');
  await expect(answerInput).toBeVisible();
});

test('Practice interaction', async ({ page }) => {
  await page.goto('/practice');

  // Wait for the practice card
  const practiceCard = page.locator('.practice-card');
  await expect(practiceCard).toBeVisible({ timeout: 10000 });

  // Find the input
  const answerInput = page.locator('input.answer-input');
  await expect(answerInput).toBeVisible();

  // Type an answer (doesn't matter if correct for this test, just testing interaction)
  await answerInput.fill('Test Answer');

  // Find the check button
  // It usually says "Antwort prüfen" or "Провери отговор"
  const checkButton = page.locator('button', { hasText: /Antwort prüfen|Провери отговор/ });
  await expect(checkButton).toBeVisible();
  await expect(checkButton).toBeEnabled();

  // Click it
  await checkButton.click();

  // We should see feedback (correct or incorrect)
  // The feedback usually appears in a specific container or changes the UI
  // We can check for "Richtig" or "Falsch" or just that the input is disabled or button text changes
  // Based on TandemPractice.svelte, it shows "Nächstes Wort" / "Следваща дума" after answering
  const nextButton = page.locator('button', { hasText: /Nächstes Wort|Следваща дума/ });
  await expect(nextButton).toBeVisible({ timeout: 5000 });
});
