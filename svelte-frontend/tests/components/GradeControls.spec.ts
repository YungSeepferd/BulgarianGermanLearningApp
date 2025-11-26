/**
 * GradeControls Component Tests
 * @file tests/components/GradeControls.spec.ts
 * @description Comprehensive tests for the GradeControls.svelte component
 * @version 1.0.0
 * @updated November 2025
 */

import { test, expect } from '@playwright/test';
import {
  mountGradeControls,
  checkAccessibility,
  takeScreenshot,
  pressKey,
  testKeyboardNavigation,
  testResponsive,
  commonViewports
} from '../test-utils';

test.describe('GradeControls Component', () => {
  test('renders correctly with default props', async ({ page }) => {
    const component = await mountGradeControls({});
    
    await expect(component).toBeVisible();
    
    // Check that all grade buttons are present
    for (let i = 1; i <= 5; i++) {
      await expect(component.locator(`button[aria-label*="Grade ${i}"]`)).toBeVisible();
    }
    
    // Check accessibility
    await checkAccessibility(page, component);
    
    // Take screenshot for visual regression
    await takeScreenshot(page, 'grade-controls-default', component);
  });

  test('renders in compact mode', async ({ page }) => {
    const component = await mountGradeControls({
      compact: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.grade-controls.compact')).toBeVisible();
    
    // In compact mode, should have smaller buttons
    const buttons = component.locator('.grade-button');
    const count = await buttons.count();
    expect(count).toBe(5);
    
    // Check that compact styling is applied
    await expect(component.locator('.grade-button.compact')).toHaveCount(5);
  });

  test('shows feedback when showFeedback is true', async ({ page }) => {
    const component = await mountGradeControls({
      showFeedback: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.feedback-section')).toBeVisible();
  });

  test('hides feedback when showFeedback is false', async ({ page }) => {
    const component = await mountGradeControls({
      showFeedback: false
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.feedback-section')).not.toBeVisible();
  });

  test('calls onGrade callback when grade button is clicked', async ({ page }) => {
    let gradeReceived: number | null = null;
    
    const component = await mountGradeControls({
      onGrade: (grade: number) => {
        gradeReceived = grade;
      }
    });
    
    // Click grade 3 button
    await component.locator('button[aria-label="Grade 3"]').click();
    
    // Check callback was called
    expect(gradeReceived).toBe(3);
  });

  test('calls onGrade callback for all grade levels', async ({ page }) => {
    const gradesReceived: number[] = [];
    
    const component = await mountGradeControls({
      onGrade: (grade: number) => {
        gradesReceived.push(grade);
      }
    });
    
    // Test all grade buttons
    for (let i = 1; i <= 5; i++) {
      await component.locator(`button[aria-label="Grade ${i}"]`).click();
      await page.waitForTimeout(100); // Small delay between clicks
    }
    
    // Check all grades were received
    expect(gradesReceived).toEqual([1, 2, 3, 4, 5]);
  });

  test('displays correct colors for each grade level', async ({ page }) => {
    const component = await mountGradeControls({});
    
    // Grade 1 (Poor) - Red
    const grade1Button = component.locator('button[aria-label="Grade 1"]');
    await expect(grade1Button).toHaveClass(/grade-1/);
    await expect(grade1Button).toHaveCSS('background-color', /rgb\(220, 38, 38\)/); // red-600
    
    // Grade 2 (Poor) - Orange
    const grade2Button = component.locator('button[aria-label="Grade 2"]');
    await expect(grade2Button).toHaveClass(/grade-2/);
    await expect(grade2Button).toHaveCSS('background-color', /rgb\(249, 115, 22\)/); // orange-600
    
    // Grade 3 (Good) - Yellow
    const grade3Button = component.locator('button[aria-label="Grade 3"]');
    await expect(grade3Button).toHaveClass(/grade-3/);
    await expect(grade3Button).toHaveCSS('background-color', /rgb\(245, 158, 11\)/); // amber-600
    
    // Grade 4 (Good) - Light Green
    const grade4Button = component.locator('button[aria-label="Grade 4"]');
    await expect(grade4Button).toHaveClass(/grade-4/);
    await expect(grade4Button).toHaveCSS('background-color', /rgb\(34, 197, 94\)/); // green-600
    
    // Grade 5 (Excellent) - Green
    const grade5Button = component.locator('button[aria-label="Grade 5"]');
    await expect(grade5Button).toHaveClass(/grade-5/);
    await expect(grade5Button).toHaveCSS('background-color', /rgb(16, 185, 129\)/); // emerald-600
  });

  test('shows feedback message when grade is selected', async ({ page }) => {
    const component = await mountGradeControls({
      showFeedback: true
    });
    
    // Click grade 5 button
    await component.locator('button[aria-label="Grade 5"]').click();
    
    // Should show feedback
    await expect(component.locator('.feedback-message')).toBeVisible();
    await expect(component.locator('.feedback-message')).toContainText('Excellent!');
  });

  test('shows appropriate feedback for each grade level', async ({ page }) => {
    const component = await mountGradeControls({
      showFeedback: true
    });
    
    const feedbackMessages = [
      'Keep practicing!', // Grade 1
      'Getting better!',   // Grade 2
      'Good job!',         // Grade 3
      'Great work!',       // Grade 4
      'Excellent!'        // Grade 5
    ];
    
    for (let i = 1; i <= 5; i++) {
      // Click grade button
      await component.locator(`button[aria-label="Grade ${i}"]`).click();
      await page.waitForTimeout(100);
      
      // Check feedback message
      await expect(component.locator('.feedback-message')).toContainText(feedbackMessages[i - 1]);
      
      // Clear feedback for next test
      await component.locator('.clear-feedback').click();
    }
  });

  test('supports keyboard navigation', async ({ page }) => {
    const component = await mountGradeControls({});
    
    await testKeyboardNavigation(page, component);
    
    // Test number keys for grades
    await component.focus();
    
    for (let i = 1; i <= 5; i++) {
      await pressKey(page, i.toString());
      await page.waitForTimeout(100);
    }
  });

  test('highlights active grade on hover', async ({ page }) => {
    const component = await mountGradeControls({});
    
    const grade3Button = component.locator('button[aria-label="Grade 3"]');
    
    // Hover over grade 3 button
    await grade3Button.hover();
    
    // Should have hover state
    await expect(grade3Button).toHaveClass(/hover:/);
    
    // Check visual feedback
    await expect(grade3Button).toHaveCSS('transform', /scale/);
  });

  test('shows processing state during grade submission', async ({ page }) => {
    let isProcessing = false;
    
    const component = await mountGradeControls({
      onGrade: async (grade: number) => {
        isProcessing = true;
        await page.waitForTimeout(500); // Simulate async operation
        isProcessing = false;
      }
    });
    
    // Click grade button
    await component.locator('button[aria-label="Grade 3"]').click();
    
    // Should show processing state
    await expect(component.locator('.processing-indicator')).toBeVisible();
    await expect(component.locator('button[aria-label="Grade 3"]')).toBeDisabled();
    
    // Wait for processing to complete
    await page.waitForTimeout(600);
    
    // Should not be processing anymore
    await expect(component.locator('.processing-indicator')).not.toBeVisible();
    await expect(component.locator('button[aria-label="Grade 3"]')).not.toBeDisabled();
  });

  test('disables all buttons during processing', async ({ page }) => {
    const component = await mountGradeControls({
      onGrade: async (grade: number) => {
        await page.waitForTimeout(300);
      }
    });
    
    // Click grade button to start processing
    await component.locator('button[aria-label="Grade 3"]').click();
    
    // All buttons should be disabled
    for (let i = 1; i <= 5; i++) {
      await expect(component.locator(`button[aria-label="Grade ${i}"]`)).toBeDisabled();
    }
    
    // Wait for processing to complete
    await page.waitForTimeout(400);
    
    // All buttons should be enabled again
    for (let i = 1; i <= 5; i++) {
      await expect(component.locator(`button[aria-label="Grade ${i}"]`)).not.toBeDisabled();
    }
  });

  test('is accessible', async ({ page }) => {
    const component = await mountGradeControls({});
    
    // Run comprehensive accessibility tests
    const results = await checkAccessibility(page, component);
    
    // Check specific accessibility features
    const buttons = component.locator('button[aria-label*="Grade"]');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      await expect(button).toHaveAttribute('aria-label');
      await expect(button).toHaveAttribute('role', 'button');
    }
  });

  test('provides screen reader feedback', async ({ page }) => {
    const component = await mountGradeControls({
      showFeedback: true
    });
    
    // Click grade button
    await component.locator('button[aria-label="Grade 5"]').click();
    
    // Should have screen reader announcement
    const liveRegion = component.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();
    await expect(liveRegion).toContainText('Excellent!');
  });

  test('is responsive across different viewports', async ({ page }) => {
    const component = await mountGradeControls({});
    
    await testResponsive(page, component, commonViewports);
  });

  test('handles rapid clicking gracefully', async ({ page }) => {
    let gradeCount = 0;
    
    const component = await mountGradeControls({
      onGrade: (grade: number) => {
        gradeCount++;
      }
    });
    
    // Rapidly click multiple grade buttons
    for (let i = 0; i < 10; i++) {
      await component.locator('button[aria-label="Grade 3"]').click();
      await page.waitForTimeout(10);
    }
    
    // Should handle rapid clicks without errors
    await expect(component).toBeVisible();
    expect(gradeCount).toBeGreaterThan(0);
  });

  test('supports custom styling classes', async ({ page }) => {
    const component = await mountGradeControls({});
    
    // Should have base styling classes
    await expect(component).toHaveClass(/grade-controls/);
    await expect(component.locator('.grade-button')).toHaveCount(5);
  });

  test('shows tooltips on hover', async ({ page }) => {
    const component = await mountGradeControls({});
    
    const grade3Button = component.locator('button[aria-label="Grade 3"]');
    
    // Hover over button
    await grade3Button.hover();
    await page.waitForTimeout(200); // Wait for tooltip
    
    // Should show tooltip
    await expect(component.locator('.tooltip')).toBeVisible();
    await expect(component.locator('.tooltip')).toContainText('Good - Remembered well');
  });

  test('supports keyboard shortcuts with number keys', async ({ page }) => {
    let gradeReceived: number | null = null;
    
    const component = await mountGradeControls({
      onGrade: (grade: number) => {
        gradeReceived = grade;
      }
    });
    
    await component.focus();
    
    // Test number keys 1-5
    for (let i = 1; i <= 5; i++) {
      await pressKey(page, i.toString());
      expect(gradeReceived).toBe(i);
      gradeReceived = null; // Reset for next test
    }
  });

  test('supports Enter key for focused grade button', async ({ page }) => {
    let gradeReceived: number | null = null;
    
    const component = await mountGradeControls({
      onGrade: (grade: number) => {
        gradeReceived = grade;
      }
    });
    
    // Focus on grade 3 button
    const grade3Button = component.locator('button[aria-label="Grade 3"]');
    await grade3Button.focus();
    
    // Press Enter
    await pressKey(page, 'Enter');
    
    // Should trigger grade selection
    expect(gradeReceived).toBe(3);
  });

  test('supports Space key for focused grade button', async ({ page }) => {
    let gradeReceived: number | null = null;
    
    const component = await mountGradeControls({
      onGrade: (grade: number) => {
        gradeReceived = grade;
      }
    });
    
    // Focus on grade 4 button
    const grade4Button = component.locator('button[aria-label="Grade 4"]');
    await grade4Button.focus();
    
    // Press Space
    await pressKey(page, 'Space');
    
    // Should trigger grade selection
    expect(gradeReceived).toBe(4);
  });

  test('maintains focus state after grade selection', async ({ page }) => {
    const component = await mountGradeControls({});
    
    // Focus on grade 3 button
    const grade3Button = component.locator('button[aria-label="Grade 3"]');
    await grade3Button.focus();
    
    // Verify focus
    await expect(grade3Button).toBeFocused();
    
    // Click grade button
    await grade3Button.click();
    
    // Should maintain focus or move focus appropriately
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('supports reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const component = await mountGradeControls({});
    
    // Should still be functional without animations
    await expect(component).toBeVisible();
    
    const grade3Button = component.locator('button[aria-label="Grade 3"]');
    await grade3Button.click();
    
    // Should work without animation delays
    await expect(component.locator('.feedback-message')).toBeVisible();
  });

  test('supports high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    
    const component = await mountGradeControls({});
    
    // Should still be visible and functional
    await expect(component).toBeVisible();
    await expect(component.locator('.grade-button')).toHaveCount(5);
    
    // Check accessibility in high contrast
    await checkAccessibility(page, component);
  });
});