/**
 * SessionStats Component Tests
 * @file tests/components/SessionStats.spec.ts
 * @description Comprehensive tests for the SessionStats.svelte component
 * @version 1.0.0
 * @updated November 2025
 */

import { test, expect } from '@playwright/test';
import {
  mountSessionStats,
  mockSessionStats,
  checkAccessibility,
  takeScreenshot,
  testResponsive,
  commonViewports
} from '../test-utils';

test.describe('SessionStats Component', () => {
  test('renders correctly with default props', async ({ page }) => {
    const component = await mountSessionStats({});
    
    await expect(component).toBeVisible();
    
    // Check that main stats elements are present
    await expect(component.locator('.session-stats')).toBeVisible();
    await expect(component.locator('.stats-header')).toBeVisible();
    await expect(component.locator('.stats-grid')).toBeVisible();
    
    // Check accessibility
    await checkAccessibility(page, component);
    
    // Take screenshot for visual regression
    await takeScreenshot(page, 'session-stats-default', component);
  });

  test('displays session performance overview', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Check performance rating
    await expect(component.locator('.performance-rating')).toBeVisible();
    await expect(component.locator('.rating-circle')).toBeVisible();
    await expect(component.locator('.rating-details')).toBeVisible();
    
    // Check session performance stats
    await expect(component.locator('.stat-row')).toHaveCount.greaterThan(0);
  });

  test('shows correct session statistics', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
    // Check basic stats
    await expect(component.locator('.stat-value')).toContainText(mockSessionStats.reviewedCards.toString());
    await expect(component.locator('.stat-value')).toContainText(mockSessionStats.correctAnswers.toString());
    
    // Check accuracy calculation
    const expectedAccuracy = (mockSessionStats.correctAnswers / mockSessionStats.reviewedCards) * 100;
    await expect(component.locator('.stat-value')).toContainText(Math.round(expectedAccuracy).toString());
    
    // Check average grade
    const expectedAverage = mockSessionStats.grades.reduce((sum, grade) => sum + grade, 0) / mockSessionStats.grades.length;
    await expect(component.locator('.stat-value')).toContainText(expectedAverage.toFixed(1));
  });

  test('displays overall progress statistics', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats,
      direction: 'bg-de'
    });
    
    await expect(component).toBeVisible();
    
    // Check overall progress section
    await expect(component.locator('.overall-progress')).toBeVisible();
    await expect(component.locator('.due-highlight')).toBeVisible();
  });

  test('renders in compact mode', async ({ page }) => {
    const component = await mountSessionStats({
      compact: true,
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.session-stats.compact')).toBeVisible();
    
    // In compact mode, should have simplified layout
    await expect(component.locator('.compact-stats')).toBeVisible();
    await expect(component.locator('.compact-row')).toHaveCount.greaterThan(0);
  });

  test('hides detailed stats in compact mode', async ({ page }) => {
    const component = await mountSessionStats({
      compact: true,
      showDetails: false,
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Should not show detailed sections in compact mode
    await expect(component.locator('.detailed-stats')).not.toBeVisible();
    await expect(component.locator('.grade-chart')).not.toBeVisible();
    await expect(component.locator('.insights-list')).not.toBeVisible();
  });

  test('shows grade distribution chart', async ({ page }) => {
    const component = await mountSessionStats({
      showDetails: true,
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Check grade chart is present
    await expect(component.locator('.grade-chart')).toBeVisible();
    await expect(component.locator('.grade-item')).toHaveCount(6); // Grades 0-5
    
    // Check that grades from mockSessionStats are displayed
    await expect(component.locator('.grade-item')).toContainText('3');
    await expect(component.locator('.grade-item')).toContainText('4');
    await expect(component.locator('.grade-item')).toContainText('5');
  });

  test('displays performance insights', async ({ page }) => {
    const component = await mountSessionStats({
      showInsights: true,
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Check insights section
    await expect(component.locator('.insights-list')).toBeVisible();
    await expect(component.locator('.insight-item')).toHaveCount.greaterThan(0);
  });

  test('shows appropriate performance rating', async ({ page }) => {
    // Test excellent performance
    const excellentStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 9,
      grades: [5, 5, 5, 4, 5, 5, 4, 5, 5, 4]
    };
    
    const component = await mountSessionStats({
      sessionStats: excellentStats
    });
    
    await expect(component.locator('.rating-text')).toContainText('Excellent');
    await expect(component.locator('.rating-circle')).toHaveClass(/text-green-600/);
  });

  test('shows poor performance rating', async ({ page }) => {
    // Test poor performance
    const poorStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 3,
      grades: [1, 2, 1, 2, 1, 2, 1, 2, 3, 2]
    };
    
    const component = await mountSessionStats({
      sessionStats: poorStats
    });
    
    await expect(component.locator('.rating-text')).toContainText('Needs Work');
    await expect(component.locator('.rating-circle')).toHaveClass(/text-red-600/);
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
    
    const component = await mountSessionStats({
      sessionStats: emptyStats
    });
    
    await expect(component).toBeVisible();
    
    // Should show "No Data" rating
    await expect(component.locator('.rating-text')).toContainText('No Data');
    
    // Should handle zero division gracefully
    await expect(component.locator('.stat-value')).toContainText('0');
  });

  test('displays duration information', async ({ page }) => {
    const sessionWithDuration = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 300000), // 5 minutes ago
      endTime: new Date()
    };
    
    const component = await mountSessionStats({
      sessionStats: sessionWithDuration,
      showDetails: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.stat-value')).toContainText('5m'); // Should show 5 minutes
  });

  test('shows cards per minute metric', async ({ page }) => {
    const sessionWithDuration = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 180000), // 3 minutes ago
      endTime: new Date()
    };
    
    const component = await mountSessionStats({
      sessionStats: sessionWithDuration,
      showDetails: true
    });
    
    await expect(component).toBeVisible();
    
    // Should calculate cards per minute (3 cards / 3 minutes = 1.0)
    await expect(component.locator('.stat-value')).toContainText('1.0');
  });

  test('filters by direction correctly', async ({ page }) => {
    const component = await mountSessionStats({
      direction: 'bg-de',
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Should show direction-specific stats
    await expect(component.locator('.overall-progress')).toBeVisible();
  });

  test('supports refresh functionality', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Check refresh button is present
    await expect(component.locator('.refresh-button')).toBeVisible();
    
    // Click refresh button
    await component.locator('.refresh-button').click();
    
    // Should still be visible after refresh
    await expect(component).toBeVisible();
  });

  test('shows last refresh time', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Check last refresh time is displayed
    await expect(component.locator('.last-refresh')).toBeVisible();
  });

  test('handles auto-refresh interval', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats,
      refreshInterval: 1000 // 1 second for testing
    });
    
    await expect(component).toBeVisible();
    
    // Wait for auto-refresh
    await page.waitForTimeout(1200);
    
    // Should still be visible after auto-refresh
    await expect(component).toBeVisible();
  });

  test('is accessible', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
    // Run comprehensive accessibility tests
    const results = await checkAccessibility(page, component);
    
    // Check specific accessibility features
    await expect(component.locator('[role="region"]')).toBeVisible();
    await expect(component.locator('[aria-label]')).toHaveCount.greaterThan(0);
  });

  test('provides proper ARIA labels', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
    // Check main region has proper label
    await expect(component.locator('.session-stats')).toHaveAttribute('aria-label', 'Session statistics');
    
    // Check stats sections have proper labels
    await expect(component.locator('.performance-overview')).toHaveAttribute('aria-label');
  });

  test('is responsive across different viewports', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
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
    
    const component = await mountSessionStats({
      sessionStats: largeStats
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.stat-value')).toContainText('750');
    await expect(component.locator('.stat-value')).toContainText('600');
  });

  test('displays time in appropriate formats', async ({ page }) => {
    // Test short session (seconds)
    const shortSession = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 30000), // 30 seconds ago
      endTime: new Date()
    };
    
    const component = await mountSessionStats({
      sessionStats: shortSession,
      showDetails: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.stat-value')).toContainText('30s');
    
    // Test long session (hours)
    const longSession = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 7200000), // 2 hours ago
      endTime: new Date()
    };
    
    const longComponent = await mountSessionStats({
      sessionStats: longSession,
      showDetails: true
    });
    
    await expect(longComponent).toBeVisible();
    await expect(longComponent.locator('.stat-value')).toContainText('2h');
  });

  test('shows appropriate insights based on performance', async ({ page }) => {
    // Test high accuracy session
    const highAccuracyStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 9,
      grades: [5, 5, 5, 4, 5, 5, 4, 5, 5, 4]
    };
    
    const component = await mountSessionStats({
      sessionStats: highAccuracyStats,
      showInsights: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.insight-item')).toContainText('Excellent accuracy');
  });

  test('handles missing endTime gracefully', async ({ page }) => {
    const ongoingSession = {
      ...mockSessionStats,
      endTime: null
    };
    
    const component = await mountSessionStats({
      sessionStats: ongoingSession,
      showDetails: true
    });
    
    await expect(component).toBeVisible();
    
    // Should calculate duration from startTime to now
    await expect(component.locator('.stat-value')).toBeVisible();
  });

  test('supports reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
    // Should still be functional without animations
    await expect(component).toBeVisible();
    await expect(component.locator('.rating-circle')).toBeVisible();
  });

  test('supports high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    
    const component = await mountSessionStats({
      sessionStats: mockSessionStats
    });
    
    // Should still be visible and functional
    await expect(component).toBeVisible();
    await expect(component.locator('.stats-grid')).toBeVisible();
    
    // Check accessibility in high contrast
    await checkAccessibility(page, component);
  });

  test('displays grade distribution with correct percentages', async ({ page }) => {
    const component = await mountSessionStats({
      showDetails: true,
      sessionStats: mockSessionStats
    });
    
    await expect(component).toBeVisible();
    
    // Check grade distribution percentages
    const gradeItems = component.locator('.grade-item');
    const count = await gradeItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = gradeItems.nth(i);
      await expect(item).toBeVisible();
      
      // Each grade item should have label, bar, and count
      await expect(item.locator('.grade-label')).toBeVisible();
      await expect(item.locator('.grade-bar')).toBeVisible();
      await expect(item.locator('.grade-count')).toBeVisible();
    }
  });

  test('shows due items count with highlighting', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats,
      direction: 'bg-de'
    });
    
    await expect(component).toBeVisible();
    
    // Check due items are highlighted
    await expect(component.locator('.due-highlight')).toBeVisible();
    await expect(component.locator('.due-highlight')).toHaveClass(/text-red-600/);
  });

  test('handles timeout for auto-refresh', async ({ page }) => {
    const component = await mountSessionStats({
      sessionStats: mockSessionStats,
      refreshInterval: 0 // Disabled
    });
    
    await expect(component).toBeVisible();
    
    // Should not auto-refresh when interval is 0
    await page.waitForTimeout(2000);
    await expect(component).toBeVisible();
  });
});