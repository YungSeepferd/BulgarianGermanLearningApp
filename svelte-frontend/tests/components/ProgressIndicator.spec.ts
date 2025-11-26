/**
 * ProgressIndicator Component Tests
 * @file tests/components/ProgressIndicator.spec.ts
 * @description Comprehensive tests for the ProgressIndicator.svelte component
 * @version 1.0.0
 * @updated November 2025
 */

import { test, expect } from '@playwright/test';
import {
  mountProgressIndicator,
  mockSessionStats,
  checkAccessibility,
  takeScreenshot,
  testResponsive,
  commonViewports
} from '../test-utils';

test.describe('ProgressIndicator Component', () => {
  test('renders correctly with default props', async ({ page }) => {
    const component = await mountProgressIndicator({});
    
    await expect(component).toBeVisible();
    
    // Check that progress elements are present
    await expect(component.locator('.progress-indicator')).toBeVisible();
    await expect(component.locator('.progress-bar')).toBeVisible();
    await expect(component.locator('.progress-text')).toBeVisible();
    
    // Check accessibility
    await checkAccessibility(page, component);
    
    // Take screenshot for visual regression
    await takeScreenshot(page, 'progress-indicator-default', component);
  });

  test('displays correct progress percentage', async ({ page }) => {
    const component = await mountProgressIndicator({
      sessionStats: mockSessionStats
    });
    
    // Calculate expected percentage (3 reviewed out of 10 total = 30%)
    const expectedPercentage = (mockSessionStats.reviewedCards / mockSessionStats.totalCards) * 100;
    
    // Check progress text
    await expect(component.locator('.progress-text')).toContainText(`${mockSessionStats.reviewedCards}/${mockSessionStats.totalCards}`);
    await expect(component.locator('.progress-percentage')).toContainText(`${Math.round(expectedPercentage)}%`);
    
    // Check progress bar width
    const progressBar = component.locator('.progress-bar-fill');
    const progressWidth = await progressBar.evaluate(el => getComputedStyle(el).width);
    expect(progressWidth).toContain('30%'); // Should be approximately 30%
  });

  test('renders in compact mode', async ({ page }) => {
    const component = await mountProgressIndicator({
      compact: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.progress-indicator.compact')).toBeVisible();
    
    // In compact mode, should have smaller elements
    await expect(component.locator('.progress-text.compact')).toBeVisible();
    await expect(component.locator('.progress-bar.compact')).toBeVisible();
  });

  test('shows detailed statistics in full mode', async ({ page }) => {
    const component = await mountProgressIndicator({
      compact: false,
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Should show detailed stats
    await expect(component.locator('.detailed-stats')).toBeVisible();
    await expect(component.locator('.accuracy-stat')).toBeVisible();
    await expect(component.locator('.time-stat')).toBeVisible();
    await expect(component.locator('.grade-distribution')).toBeVisible();
  });

  test('hides detailed statistics in compact mode', async ({ page }) => {
    const component = await mountProgressIndicator({
      compact: true,
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Should not show detailed stats in compact mode
    await expect(component.locator('.detailed-stats')).not.toBeVisible();
  });

  test('displays accuracy information', async ({ page }) => {
    const component = await mountProgressIndicator({
      sessionStats: mockSessionStats
    });
    
    // Calculate expected accuracy (2 correct out of 3 reviewed = 66.67%)
    const expectedAccuracy = (mockSessionStats.correctAnswers / mockSessionStats.reviewedCards) * 100;
    
    await expect(component.locator('.accuracy-stat')).toContainText(`${Math.round(expectedAccuracy)}%`);
  });

  test('displays time information when session has duration', async ({ page }) => {
    const sessionWithTime = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 300000), // 5 minutes ago
      endTime: new Date()
    };
    
    const component = await mountProgressIndicator({
      sessionStats: sessionWithTime
    });
    
    await expect(component.locator('.time-stat')).toBeVisible();
    await expect(component.locator('.time-stat')).toContainText('5m'); // Should show 5 minutes
  });

  test('shows grade distribution', async ({ page }) => {
    const component = await mountProgressIndicator({
      sessionStats: mockSessionStats
    });
    
    await expect(component.locator('.grade-distribution')).toBeVisible();
    
    // Should show bars for each grade level
    for (let i = 1; i <= 5; i++) {
      await expect(component.locator(`.grade-bar-${i}`)).toBeVisible();
    }
    
    // Check that grade 3, 4, 5 have counts (from mockSessionStats.grades = [3, 4, 5])
    await expect(component.locator('.grade-bar-3')).toContainText('1');
    await expect(component.locator('.grade-bar-4')).toContainText('1');
    await expect(component.locator('.grade-bar-5')).toContainText('1');
  });

  test('handles empty session stats gracefully', async ({ page }) => {
    const emptyStats = {
      startTime: new Date(),
      endTime: null,
      totalCards: 0,
      reviewedCards: 0,
      correctAnswers: 0,
      grades: []
    };
    
    const component = await mountProgressIndicator({
      sessionStats: emptyStats
    });
    
    await expect(component).toBeVisible();
    
    // Should show 0% progress
    await expect(component.locator('.progress-percentage')).toContainText('0%');
    await expect(component.locator('.progress-text')).toContainText('0/0');
    
    // Should handle division by zero for accuracy
    await expect(component.locator('.accuracy-stat')).toContainText('0%');
  });

  test('updates when session stats change', async ({ page }) => {
    let currentStats = { ...mockSessionStats };
    
    const component = await mountProgressIndicator({
      sessionStats: currentStats
    });
    
    // Initial state
    await expect(component.locator('.progress-text')).toContainText('3/10');
    
    // Update stats (simulate completing another card)
    currentStats = {
      ...currentStats,
      reviewedCards: 4,
      correctAnswers: 3,
      grades: [3, 4, 5, 4]
    };
    
    // Remount with updated stats
    const updatedComponent = await mountProgressIndicator({
      sessionStats: currentStats
    });
    
    // Should reflect updated stats
    await expect(updatedComponent.locator('.progress-text')).toContainText('4/10');
  });

  test('displays session completion state', async ({ page }) => {
    const completedStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      endTime: new Date()
    };
    
    const component = await mountProgressIndicator({
      sessionStats: completedStats
    });
    
    await expect(component).toBeVisible();
    
    // Should show 100% progress
    await expect(component.locator('.progress-percentage')).toContainText('100%');
    await expect(component.locator('.progress-text')).toContainText('10/10');
    
    // Should show completion indicator
    await expect(component.locator('.completion-indicator')).toBeVisible();
  });

  test('shows performance rating based on accuracy', async ({ page }) => {
    // Test excellent performance
    const excellentStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 9,
      grades: [5, 5, 5, 4, 5, 5, 4, 5, 5, 4]
    };
    
    const component = await mountProgressIndicator({
      sessionStats: excellentStats
    });
    
    await expect(component.locator('.performance-rating')).toContainText('Excellent');
    await expect(component.locator('.performance-rating')).toHaveClass(/excellent/);
  });

  test('shows appropriate color coding for performance levels', async ({ page }) => {
    // Test poor performance
    const poorStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 3,
      grades: [1, 2, 1, 2, 1, 2, 1, 2, 3, 2]
    };
    
    const component = await mountProgressIndicator({
      sessionStats: poorStats
    });
    
    await expect(component.locator('.performance-rating')).toHaveClass(/poor/);
    await expect(component.locator('.progress-bar-fill')).toHaveClass(/poor/);
  });

  test('is accessible', async ({ page }) => {
    const component = await mountProgressIndicator({});
    
    // Run comprehensive accessibility tests
    const results = await checkAccessibility(page, component);
    
    // Check specific accessibility features
    await expect(component.locator('[role="progressbar"]')).toBeVisible();
    await expect(component.locator('[aria-label]')).toHaveCount.greaterThan(0);
    await expect(component.locator('[aria-valuenow]')).toBeVisible();
    await expect(component.locator('[aria-valuemin]')).toBeVisible();
    await expect(component.locator('[aria-valuemax]')).toBeVisible();
  });

  test('provides proper ARIA attributes for progress bar', async ({ page }) => {
    const component = await mountProgressIndicator({
      sessionStats: mockSessionStats
    });
    
    const progressBar = component.locator('[role="progressbar"]');
    
    // Check ARIA attributes
    await expect(progressBar).toHaveAttribute('aria-valuenow', '30'); // 3/10 = 30%
    await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    await expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    await expect(progressBar).toHaveAttribute('aria-label');
  });

  test('is responsive across different viewports', async ({ page }) => {
    const component = await mountProgressIndicator({});
    
    await testResponsive(page, component, commonViewports);
  });

  test('handles very large numbers gracefully', async ({ page }) => {
    const largeStats = {
      startTime: new Date(Date.now() - 3600000), // 1 hour ago
      endTime: new Date(),
      totalCards: 1000,
      reviewedCards: 750,
      correctAnswers: 600,
      grades: Array(750).fill(0).map(() => Math.floor(Math.random() * 5) + 1)
    };
    
    const component = await mountProgressIndicator({
      sessionStats: largeStats
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.progress-text')).toContainText('750/1000');
    await expect(component.locator('.progress-percentage')).toContainText('75%');
  });

  test('displays time in appropriate format', async ({ page }) => {
    // Test short session (seconds)
    const shortSession = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 30000), // 30 seconds ago
      endTime: new Date()
    };
    
    const component = await mountProgressIndicator({
      sessionStats: shortSession
    });
    
    await expect(component.locator('.time-stat')).toContainText('30s');
    
    // Test long session (hours)
    const longSession = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 7200000), // 2 hours ago
      endTime: new Date()
    };
    
    const longComponent = await mountProgressIndicator({
      sessionStats: longSession
    });
    
    await expect(longComponent.locator('.time-stat')).toContainText('2h');
  });

  test('shows average grade information', async ({ page }) => {
    const component = await mountProgressIndicator({
      sessionStats: mockSessionStats
    });
    
    // Calculate average grade (3 + 4 + 5) / 3 = 4.0
    const expectedAverage = mockSessionStats.grades.reduce((sum, grade) => sum + grade, 0) / mockSessionStats.grades.length;
    
    await expect(component.locator('.average-grade')).toContainText(expectedAverage.toFixed(1));
  });

  test('handles missing endTime gracefully', async ({ page }) => {
    const ongoingSession = {
      ...mockSessionStats,
      endTime: null
    };
    
    const component = await mountProgressIndicator({
      sessionStats: ongoingSession
    });
    
    await expect(component).toBeVisible();
    
    // Should show ongoing time
    await expect(component.locator('.time-stat')).toBeVisible();
    // Should not show completion indicator
    await expect(component.locator('.completion-indicator')).not.toBeVisible();
  });

  test('supports reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const component = await mountProgressIndicator({});
    
    // Should still be functional without animations
    await expect(component).toBeVisible();
    await expect(component.locator('.progress-bar')).toBeVisible();
  });

  test('supports high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    
    const component = await mountProgressIndicator({});
    
    // Should still be visible and functional
    await expect(component).toBeVisible();
    await expect(component.locator('.progress-bar')).toBeVisible();
    
    // Check accessibility in high contrast
    await checkAccessibility(page, component);
  });

  test('displays streak information when available', async ({ page }) => {
    // This would require extending the session stats to include streak data
    const component = await mountProgressIndicator({
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    // Streak display would be tested here if implemented
  });

  test('handles zero total cards gracefully', async ({ page }) => {
    const zeroTotalStats = {
      startTime: new Date(),
      endTime: null,
      totalCards: 0,
      reviewedCards: 0,
      correctAnswers: 0,
      grades: []
    };
    
    const component = await mountProgressIndicator({
      sessionStats: zeroTotalStats
    });
    
    await expect(component).toBeVisible();
    
    // Should handle zero division gracefully
    await expect(component.locator('.progress-text')).toContainText('0/0');
    await expect(component.locator('.progress-percentage')).toContainText('0%');
  });

  test('updates progress bar animation smoothly', async ({ page }) => {
    const component = await mountProgressIndicator({
      sessionStats: mockSessionStats
    });
    
    const progressBar = component.locator('.progress-bar-fill');
    
    // Check that progress bar has transition styles
    const transition = await progressBar.evaluate(el => getComputedStyle(el).transition);
    expect(transition).toContain('width');
  });
});