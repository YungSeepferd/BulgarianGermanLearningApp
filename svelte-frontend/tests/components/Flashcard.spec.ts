/**
 * Flashcard Component Tests
 * @file tests/components/Flashcard.spec.ts
 * @description Comprehensive tests for the Flashcard.svelte component
 * @version 1.0.0
 * @updated November 2025
 */

import { test, expect } from '@playwright/test';
import {
  mountFlashcard,
  mockVocabularyItem,
  mockReviewState,
  checkAccessibility,
  takeScreenshot,
  pressKey,
  swipe,
  waitForAnimation,
  testKeyboardNavigation,
  testResponsive,
  commonViewports
} from '../test-utils';

test.describe('Flashcard Component', () => {
  test('renders correctly with default props', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    await expect(component).toBeVisible();
    
    // Check that vocabulary content is displayed
    await expect(component.locator('.flashcard-content')).toBeVisible();
    await expect(component.locator('.card-front')).toContainText(mockVocabularyItem.word);
    await expect(component.locator('.card-back')).toContainText(mockVocabularyItem.translation);
    
    // Check accessibility
    await checkAccessibility(page, component);
    
    // Take screenshot for visual regression
    await takeScreenshot(page, 'flashcard-default', component);
  });

  test('displays correct language direction', async ({ page }) => {
    // Test BG to DE direction
    const componentBgDe = await mountFlashcard({
      vocabularyItem: mockVocabularyItem,
      direction: 'bg-de'
    });
    
    await expect(componentBgDe.locator('.card-front')).toContainText(mockVocabularyItem.word);
    await expect(componentBgDe.locator('.card-back')).toContainText(mockVocabularyItem.translation);
    
    // Test DE to BG direction
    const componentDeBg = await mountFlashcard({
      vocabularyItem: mockVocabularyItem,
      direction: 'de-bg'
    });
    
    await expect(componentDeBg.locator('.card-front')).toContainText(mockVocabularyItem.translation);
    await expect(componentDeBg.locator('.card-back')).toContainText(mockVocabularyItem.word);
  });

  test('flips card when clicked', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Initially should show front
    await expect(component.locator('.card-front')).toBeVisible();
    await expect(component.locator('.card-back')).not.toBeVisible();
    
    // Click to flip
    await component.click();
    await waitForAnimation(page, '.flashcard-container');
    
    // Should show back after flip
    await expect(component.locator('.card-back')).toBeVisible();
    await expect(component.locator('.card-front')).not.toBeVisible();
  });

  test('flips card with keyboard shortcuts', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Focus the component
    await component.focus();
    
    // Test Space key
    await pressKey(page, 'Space');
    await waitForAnimation(page, '.flashcard-container');
    await expect(component.locator('.card-back')).toBeVisible();
    
    // Flip back
    await pressKey(page, 'Space');
    await waitForAnimation(page, '.flashcard-container');
    await expect(component.locator('.card-front')).toBeVisible();
    
    // Test Enter key
    await pressKey(page, 'Enter');
    await waitForAnimation(page, '.flashcard-container');
    await expect(component.locator('.card-back')).toBeVisible();
  });

  test('supports touch/swipe gestures', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Initially show front
    await expect(component.locator('.card-front')).toBeVisible();
    
    // Swipe left to flip
    await swipe(page, component, 'left');
    await waitForAnimation(page, '.flashcard-container');
    
    // Should show back after swipe
    await expect(component.locator('.card-back')).toBeVisible();
    
    // Swipe right to flip back
    await swipe(page, component, 'right');
    await waitForAnimation(page, '.flashcard-container');
    
    // Should show front again
    await expect(component.locator('.card-front')).toBeVisible();
  });

  test('calls onGrade callback when grade is selected', async ({ page }) => {
    let gradeReceived: number | null = null;
    let stateReceived: any = null;
    
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem,
      onGrade: (grade: number, state: any) => {
        gradeReceived = grade;
        stateReceived = state;
      }
    });
    
    // Flip card to show grading controls
    await component.click();
    await waitForAnimation(page, '.flashcard-container');
    
    // Click grade button 3
    await component.locator('button[aria-label="Grade 3"]').click();
    
    // Check callback was called
    expect(gradeReceived).toBe(3);
    expect(stateReceived).toBeDefined();
  });

  test('calls onNext callback when next button is clicked', async ({ page }) => {
    let nextCalled = false;
    
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem,
      onNext: () => { nextCalled = true; }
    });
    
    // Flip card to show navigation
    await component.click();
    await waitForAnimation(page, '.flashcard-container');
    
    // Click next button
    await component.locator('button[aria-label="Next card"]').click();
    
    // Check callback was called
    expect(nextCalled).toBe(true);
  });

  test('calls onPrevious callback when previous button is clicked', async ({ page }) => {
    let previousCalled = false;
    
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem,
      onPrevious: () => { previousCalled = true; }
    });
    
    // Flip card to show navigation
    await component.click();
    await waitForAnimation(page, '.flashcard-container');
    
    // Click previous button
    await component.locator('button[aria-label="Previous card"]').click();
    
    // Check callback was called
    expect(previousCalled).toBe(true);
  });

  test('shows progress indicator when showProgress is true', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem,
      showProgress: true
    });
    
    await expect(component.locator('.progress-indicator')).toBeVisible();
  });

  test('hides progress indicator when showProgress is false', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem,
      showProgress: false
    });
    
    await expect(component.locator('.progress-indicator')).not.toBeVisible();
  });

  test('auto-flips when autoFlip is true', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem,
      autoFlip: true
    });
    
    // Should auto-flip after a delay
    await page.waitForTimeout(2000); // Wait for auto-flip
    await waitForAnimation(page, '.flashcard-container');
    
    await expect(component.locator('.card-back')).toBeVisible();
  });

  test('displays examples when available', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Flip to see examples
    await component.click();
    await waitForAnimation(page, '.flashcard-container');
    
    // Check examples are displayed
    await expect(component.locator('.examples-section')).toBeVisible();
    await expect(component.locator('.example-sentence')).toContainText(mockVocabularyItem.examples[0].sentence);
    await expect(component.locator('.example-translation')).toContainText(mockVocabularyItem.examples[0].translation);
  });

  test('handles vocabulary items without examples', async ({ page }) => {
    const itemWithoutExamples = {
      ...mockVocabularyItem,
      examples: []
    };
    
    const component = await mountFlashcard({
      vocabularyItem: itemWithoutExamples
    });
    
    // Flip card
    await component.click();
    await waitForAnimation(page, '.flashcard-container');
    
    // Examples section should not be visible
    await expect(component.locator('.examples-section')).not.toBeVisible();
  });

  test('supports keyboard navigation', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    await testKeyboardNavigation(page, component);
    
    // Test specific flashcard keyboard shortcuts
    await component.focus();
    
    // Test number keys for grading (when flipped)
    await component.click(); // Flip first
    await waitForAnimation(page, '.flashcard-container');
    
    for (let i = 1; i <= 5; i++) {
      await pressKey(page, i.toString());
      // Should trigger grade selection
      await page.waitForTimeout(100);
    }
  });

  test('is accessible', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Run comprehensive accessibility tests
    const results = await checkAccessibility(page, component);
    
    // Check specific accessibility features
    await expect(component.locator('[role="button"]')).toHaveAttribute('aria-label');
    await expect(component.locator('.flashcard-content')).toHaveAttribute('aria-live');
    await expect(component.locator('.flashcard-content')).toHaveAttribute('aria-busy');
  });

  test('is responsive across different viewports', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    await testResponsive(page, component, commonViewports);
  });

  test('handles error states gracefully', async ({ page }) => {
    // Test with invalid vocabulary item
    const invalidItem = {
      ...mockVocabularyItem,
      word: '',
      translation: ''
    };
    
    const component = await mountFlashcard({
      vocabularyItem: invalidItem
    });
    
    // Should show error state
    await expect(component.locator('.error-message')).toBeVisible();
    await expect(component.locator('.error-message')).toContainText('Invalid vocabulary data');
  });

  test('maintains state during rapid interactions', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Rapidly flip card multiple times
    for (let i = 0; i < 5; i++) {
      await component.click();
      await page.waitForTimeout(100);
    }
    
    // Should still be functional
    await expect(component).toBeVisible();
    await expect(component.locator('.flashcard-content')).toBeVisible();
  });

  test('supports screen reader announcements', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Check for screen reader elements
    await expect(component.locator('.sr-only')).toBeVisible();
    
    // Flip card and check announcement
    await component.click();
    await waitForAnimation(page, '.flashcard-container');
    
    // Should have updated aria-live region
    const liveRegion = component.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();
  });

  test('performs well under load', async ({ page }) => {
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Measure performance of multiple flips
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await component.click();
      await page.waitForTimeout(50);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(2000); // 2 seconds max
  });

  test('supports reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Flip should be instant without animation
    await component.click();
    await page.waitForTimeout(100); // Minimal wait
    
    // Should still work but without animation
    await expect(component.locator('.card-back')).toBeVisible();
  });

  test('supports high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    
    const component = await mountFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Should still be visible and functional
    await expect(component).toBeVisible();
    await expect(component.locator('.flashcard-content')).toBeVisible();
    
    // Check accessibility in high contrast
    await checkAccessibility(page, component);
  });
});