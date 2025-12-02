import { test, expect } from '@playwright/test';

test('Practice page loads successfully', async ({ page }) => {
  // Navigate to the practice page
  await page.goto('/practice');

  // Verify the page title
  await expect(page).toHaveTitle(/Practice - Bulgarian Language Learning App/);

  // Verify the header is present
  const header = page.locator('h1');
  await expect(header).toBeVisible();
  await expect(header).toHaveText('Practice Exercises');

  // Verify the exercise list is present
  const exerciseList = page.locator('.exercise-list');
  await expect(exerciseList).toBeVisible();

  // Verify the exercise items are present
  const exerciseItems = page.locator('.exercise-item');
  await expect(exerciseItems).toHaveCountGreaterThan(0);

  // Verify each exercise item has a title and description
  const firstItem = exerciseItems.first();
  await expect(firstItem.locator('.title')).toBeVisible();
  await expect(firstItem.locator('.description')).toBeVisible();
});

test('Practice exercise completion', async ({ page }) => {
  // Navigate to the practice page
  await page.goto('/practice');

  // Select the first exercise
  const firstExercise = page.locator('.exercise-item').first();
  await firstExercise.click();

  // Verify the exercise page is loaded
  const exerciseTitle = page.locator('.exercise-title');
  await expect(exerciseTitle).toBeVisible();

  // Complete the exercise (implementation depends on the actual exercise type)
  // For example, if it's a multiple-choice question:
  const answerOption = page.locator('.answer-option').first();
  await answerOption.click();

  // Submit the answer
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Verify the result
  const resultMessage = page.locator('.result-message');
  await expect(resultMessage).toBeVisible();
});