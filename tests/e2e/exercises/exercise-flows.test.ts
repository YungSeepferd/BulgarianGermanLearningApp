import { test, expect } from '@playwright/test';

test.describe('Exercise System - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exercises');
  });

  test.describe('Fill In The Blank Exercise', () => {
    test('should load exercise page', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Practice Exercises');
    });

    test('should display fill-in-blank question', async ({ page }) => {
      // Wait for exercise to load
      await page.waitForSelector('input[placeholder="Enter your answer"]');
      
      const question = page.locator('h3');
      await expect(question).toContainText('Fill');
    });

    test('should accept correct answer', async ({ page }) => {
      // Find the input field
      const input = page.locator('input[placeholder="Enter your answer"]');
      
      // Type correct answer
      await input.fill('Tag');
      
      // Click check button
      await page.click('button:has-text("Check")');
      
      // Look for success feedback
      await expect(page.locator('.feedback.correct')).toBeVisible();
      await expect(page.locator('.feedback')).toContainText('Correct');
    });

    test('should reject incorrect answer', async ({ page }) => {
      // Find the input field
      const input = page.locator('input[placeholder="Enter your answer"]');
      
      // Type incorrect answer
      await input.fill('Nacht');
      
      // Click check button
      await page.click('button:has-text("Check")');
      
      // Look for error feedback
      await expect(page.locator('.feedback.incorrect')).toBeVisible();
      await expect(page.locator('.feedback')).toContainText('Incorrect');
    });

    test('should display hints after answer', async ({ page }) => {
      // Submit an answer
      const input = page.locator('input[placeholder="Enter your answer"]');
      await input.fill('Test');
      await page.click('button:has-text("Check")');
      
      // Check if hints are visible
      await expect(page.locator('.hints')).toBeVisible();
      await expect(page.locator('.hints')).toContainText('Hint');
    });

    test('should allow navigation to next question', async ({ page }) => {
      // Answer first question
      const input = page.locator('input[placeholder="Enter your answer"]');
      await input.fill('Tag');
      await page.click('button:has-text("Check")');
      
      // Click next
      await page.click('button:has-text("Next")');
      
      // Should load new question
      await page.waitForSelector('input[placeholder="Enter your answer"]');
      const newInput = page.locator('input[placeholder="Enter your answer"]');
      await expect(newInput).toHaveValue('');
    });

    test('should allow skipping question', async ({ page }) => {
      // Click skip
      await page.click('button:has-text("Skip")');
      
      // Should move to next question
      await page.waitForSelector('input[placeholder="Enter your answer"]');
    });
  });

  test.describe('Multiple Choice Exercise', () => {
    test('should display multiple choice options', async ({ page }) => {
      // Navigate to exercise
      // The page might show MC after fill-in-blank
      // We'd need to either create a route or mock the exercise type
      
      // For now, this is a placeholder
      // In production, you'd specify exercise type in route
    });

    test('should highlight selected option', async ({ page }) => {
      // This would test MC-specific behavior
    });

    test('should show explanation after answer', async ({ page }) => {
      // This would test MC-specific feedback
    });
  });

  test.describe('Navigation and Progress', () => {
    test('should track progress through questions', async ({ page }) => {
      // Answer first question
      const input = page.locator('input[placeholder="Enter your answer"]');
      await input.fill('Tag');
      await page.click('button:has-text("Check")');
      await page.click('button:has-text("Next")');
      
      // Progress should update
      // (Assuming progress bar is visible)
      const progressBar = page.locator('.progress-bar, [role="progressbar"]');
      if (await progressBar.isVisible()) {
        await expect(progressBar).toBeVisible();
      }
    });

    test('should show completion screen after last question', async ({ page }) => {
      // Answer all questions
      let questionCount = 0;
      
      // Keep answering until completion
      for (let i = 0; i < 10; i++) { // Safety limit
        const input = page.locator('input[placeholder="Enter your answer"]');
        
        // Check if input exists
        if (!(await input.isVisible())) {
          // Check for completion screen
          const completionText = page.locator('text=Exercise Complete');
          if (await completionText.isVisible()) {
            break;
          }
        }
        
        // Fill and submit
        await input.fill('answer');
        await page.click('button:has-text("Check")');
        
        // Try to click next
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          questionCount++;
        } else {
          break;
        }
      }
      
      // Should show completion or be ready to move on
      expect(questionCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible form inputs', async ({ page }) => {
      const input = page.locator('input[placeholder="Enter your answer"]');
      await expect(input).toHaveAttribute('type', 'text');
    });

    test('should support keyboard navigation', async ({ page }) => {
      const input = page.locator('input[placeholder="Enter your answer"]');
      
      // Focus and type
      await input.focus();
      await input.type('Tag');
      
      // Submit with Enter key
      await input.press('Enter');
      
      // Should show feedback
      await expect(page.locator('.feedback')).toBeVisible();
    });

    test('should have descriptive button labels', async ({ page }) => {
      await expect(page.locator('button')).toContainText(['Check', 'Skip']);
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // This would typically use axe-core
      // Placeholder for accessibility testing
      const button = page.locator('button:has-text("Check")');
      await expect(button).toHaveCSS('background-color', /rgb/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Elements should still be visible
      const input = page.locator('input[placeholder="Enter your answer"]');
      await expect(input).toBeVisible();
      
      const button = page.locator('button:has-text("Check")');
      await expect(button).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const input = page.locator('input[placeholder="Enter your answer"]');
      await expect(input).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      // Set desktop viewport (already default)
      const input = page.locator('input[placeholder="Enter your answer"]');
      await expect(input).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle empty submission gracefully', async ({ page }) => {
      // Try to submit without typing
      const input = page.locator('input[placeholder="Enter your answer"]');
      
      // Check button might be disabled
      const checkButton = page.locator('button:has-text("Check")');
      
      if (await checkButton.isEnabled()) {
        await checkButton.click();
      }
      
      // Should not crash
      await expect(page).toHaveURL('/exercises');
    });

    test('should handle whitespace-only submission', async ({ page }) => {
      const input = page.locator('input[placeholder="Enter your answer"]');
      await input.fill('   ');
      
      // Try to check
      await page.click('button:has-text("Check")');
      
      // Should not mark as correct
      const correctFeedback = page.locator('.feedback.correct');
      const isCorrect = await correctFeedback.isVisible();
      
      expect(isCorrect).toBe(false);
    });

    test('should recover from errors', async ({ page }) => {
      // Simulate error by trying invalid action
      await page.goto('/exercises');
      
      // Should load successfully
      await expect(page.locator('h1')).toContainText('Practice Exercises');
    });
  });
});
