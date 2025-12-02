/**
 * ProgressIndicator Component Tests
 * @file tests/components/ProgressIndicator.spec.ts
 * @description Comprehensive tests for the ProgressIndicator.svelte component
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { mountProgressIndicator, mockSessionStats, checkAccessibility } from '../test-utils';
import ProgressIndicator from '$lib/components/ProgressIndicator.svelte';

describe('ProgressIndicator Component', () => {
  it('renders correctly with default props', async () => {
    const { container } = await mountProgressIndicator({});
    
    expect(container).toBeTruthy();
    
    // Check that progress elements are present
    expect(container!.querySelector('.progress-indicator')).toBeTruthy();
    expect(container!.querySelector('.progress-bar')).toBeTruthy();
    expect(container!.querySelector('.progress-text')).toBeTruthy();
    
    // Check accessibility
    await checkAccessibility(ProgressIndicator, {});
  });

  it('displays correct progress percentage', async () => {
    const { container } = render(ProgressIndicator, {
      props: { sessionStats: mockSessionStats }
    });
    
    // Calculate expected percentage (3 reviewed out of 10 total = 30%)
    const expectedPercentage = (mockSessionStats.reviewedCards / mockSessionStats.totalCards) * 100;
    
    // Check progress text
    const progressText = container!.querySelector('.progress-text');
    expect(progressText?.textContent).toContain(`${mockSessionStats.reviewedCards}/${mockSessionStats.totalCards}`);
    
    const progressPercentage = container!.querySelector('.progress-percentage');
    expect(progressPercentage?.textContent).toContain(`${Math.round(expectedPercentage)}%`);
    
    // Check progress bar width
    const progressBar = container!.querySelector('.progress-bar-fill');
    const progressWidth = getComputedStyle(progressBar!).width;
    expect(progressWidth).toContain('30%'); // Should be approximately 30%
  });

  it('renders in compact mode', async () => {
    const { container } = await mountProgressIndicator({
      compact: true
    });
    
    expect(container).toBeTruthy();
    expect(container!.querySelector('.progress-indicator.compact')).toBeTruthy();
    
    // In compact mode, should have smaller elements
    expect(container!.querySelector('.progress-text.compact')).toBeTruthy();
    expect(container!.querySelector('.progress-bar.compact')).toBeTruthy();
  });

  it('shows detailed statistics in full mode', async () => {
    const { container } = await mountProgressIndicator({
      compact: false,
      sessionStats: mockSessionStats
    });
    
    expect(container).toBeTruthy();
    
    // Should show detailed stats
    expect(container!.querySelector('.detailed-stats')).toBeTruthy();
    expect(container!.querySelector('.accuracy-stat')).toBeTruthy();
    expect(container!.querySelector('.time-stat')).toBeTruthy();
    expect(container!.querySelector('.grade-distribution')).toBeTruthy();
  });

  it('hides detailed statistics in compact mode', async () => {
    const { container } = await mountProgressIndicator({
      compact: true,
      sessionStats: mockSessionStats
    });
    
    expect(container).toBeTruthy();
    
    // Should not show detailed stats in compact mode
    expect(container!.querySelector('.detailed-stats')).toBeFalsy();
  });

  it('displays accuracy information', async () => {
    const { container } = render(ProgressIndicator, {
      props: { sessionStats: mockSessionStats }
    });
    
    // Calculate expected accuracy (2 correct out of 3 reviewed = 66.67%)
    const expectedAccuracy = (mockSessionStats.correctAnswers / mockSessionStats.reviewedCards) * 100;
    
    const accuracyStat = container!.querySelector('.accuracy-stat');
    expect(accuracyStat?.textContent).toContain(`${Math.round(expectedAccuracy)}%`);
  });

  it('displays time information when session has duration', async () => {
    const sessionWithTime = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 300_000), // 5 minutes ago
      endTime: new Date()
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: sessionWithTime
    });
    
    expect(container!.querySelector('.time-stat')).toBeTruthy();
    expect(container!.querySelector('.time-stat')?.textContent).toContain('5m'); // Should show 5 minutes
  });

  it('shows grade distribution', async () => {
    const { container } = render(ProgressIndicator, {
      props: { sessionStats: mockSessionStats }
    });
    
    expect(container!.querySelector('.grade-distribution')).toBeTruthy();
    
    // Should show bars for each grade level
    for (let i = 1; i <= 5; i++) {
      expect(container!.querySelector(`.grade-bar-${i}`)).toBeTruthy();
    }
    
    // Check that grade 3, 4, 5 have counts (from mockSessionStats.grades = [3, 4, 5])
    expect(container!.querySelector('.grade-bar-3')?.textContent).toContain('1');
    expect(container!.querySelector('.grade-bar-4')?.textContent).toContain('1');
    expect(container!.querySelector('.grade-bar-5')?.textContent).toContain('1');
  });

  it('handles empty session stats gracefully', async () => {
    const emptyStats = {
      startTime: new Date(),
      endTime: null,
      totalCards: 0,
      reviewedCards: 0,
      correctAnswers: 0,
      grades: []
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: emptyStats
    });
    
    expect(container).toBeTruthy();
    
    // Should show 0% progress
    expect(container!.querySelector('.progress-percentage')?.textContent).toContain('0%');
    expect(container!.querySelector('.progress-text')?.textContent).toContain('0/0');
    
    // Should handle division by zero for accuracy
    expect(container!.querySelector('.accuracy-stat')?.textContent).toContain('0%');
  });

  it('updates when session stats change', async () => {
    let currentStats = { ...mockSessionStats };
    
    const { container } = await mountProgressIndicator({
      sessionStats: currentStats
    });
    
    // Initial state
    expect(container!.querySelector('.progress-text')?.textContent).toContain('3/10');
    
    // Update stats (simulate completing another card)
    currentStats = {
      ...currentStats,
      reviewedCards: 4,
      correctAnswers: 3,
      grades: [3, 4, 5, 4]
    };
    
    // Remount with updated stats
    const { container: updatedContainer } = await mountProgressIndicator({
      sessionStats: currentStats
    });
    
    // Should reflect updated stats
    expect(updatedContainer!.querySelector('.progress-text')?.textContent).toContain('4/10');
  });

  it('displays session completion state', async () => {
    const completedStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      endTime: new Date()
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: completedStats
    });
    
    expect(container).toBeTruthy();
    
    // Should show 100% progress
    expect(container!.querySelector('.progress-percentage')?.textContent).toContain('100%');
    expect(container!.querySelector('.progress-text')?.textContent).toContain('10/10');
    
    // Should show completion indicator
    expect(container!.querySelector('.completion-indicator')).toBeTruthy();
  });

  it('shows performance rating based on accuracy', async () => {
    // Test excellent performance
    const excellentStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 9,
      grades: [5, 5, 5, 4, 5, 5, 4, 5, 5, 4]
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: excellentStats
    });
    
    expect(container!.querySelector('.performance-rating')?.textContent).toContain('Excellent');
    expect(container!.querySelector('.performance-rating')?.className).toContain('excellent');
  });

  it('shows appropriate color coding for performance levels', async () => {
    // Test poor performance
    const poorStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 3,
      grades: [1, 2, 1, 2, 1, 2, 1, 2, 3, 2]
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: poorStats
    });
    
    expect(container!.querySelector('.performance-rating')?.className).toContain('poor');
    expect(container!.querySelector('.progress-bar-fill')?.className).toContain('poor');
  });

  it('is accessible', async () => {
    const { container } = await mountProgressIndicator({});
    
    // Run comprehensive accessibility tests
    await checkAccessibility(ProgressIndicator, {});
    
    // Check specific accessibility features
    expect(container!.querySelector('[role="progressbar"]')).toBeTruthy();
    expect(container!.querySelectorAll('[aria-label]').length).toBeGreaterThan(0);
    expect(container!.querySelector('[aria-valuenow]')).toBeTruthy();
    expect(container!.querySelector('[aria-valuemin]')).toBeTruthy();
    expect(container!.querySelector('[aria-valuemax]')).toBeTruthy();
  });

  it('provides proper ARIA attributes for progress bar', async () => {
    const { container } = render(ProgressIndicator, {
      props: { sessionStats: mockSessionStats }
    });
    
    const progressBar = container!.querySelector('[role="progressbar"]');
    
    // Check ARIA attributes
    expect(progressBar?.getAttribute('aria-valuenow')).toBe('30'); // 3/10 = 30%
    expect(progressBar?.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar?.getAttribute('aria-valuemax')).toBe('100');
    expect(progressBar?.getAttribute('aria-label')).toBeTruthy();
  });

  it('handles very large numbers gracefully', async () => {
    const largeStats = {
      startTime: new Date(Date.now() - 3_600_000), // 1 hour ago
      endTime: new Date(),
      totalCards: 1000,
      reviewedCards: 750,
      correctAnswers: 600,
      grades: Array.from({ length: 750 }).fill(0).map(() => Math.floor(Math.random() * 5) + 1)
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: largeStats
    });
    
    expect(container).toBeTruthy();
    expect(container!.querySelector('.progress-text')?.textContent).toContain('750/1000');
    expect(container!.querySelector('.progress-percentage')?.textContent).toContain('75%');
  });

  it('displays time in appropriate format', async () => {
    // Test short session (seconds)
    const shortSession = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 30_000), // 30 seconds ago
      endTime: new Date()
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: shortSession
    });
    
    expect(container!.querySelector('.time-stat')?.textContent).toContain('30s');
    
    // Test long session (hours)
    const longSession = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 7_200_000), // 2 hours ago
      endTime: new Date()
    };
    
    const { container: longContainer } = await mountProgressIndicator({
      sessionStats: longSession
    });
    
    expect(longContainer!.querySelector('.time-stat')?.textContent).toContain('2h');
  });

  it('shows average grade information', async () => {
    const { container } = render(ProgressIndicator, {
      props: { sessionStats: mockSessionStats }
    });
    
    // Calculate average grade (3 + 4 + 5) / 3 = 4.0
    const expectedAverage = mockSessionStats.grades.reduce((sum, grade) => sum + grade, 0) / mockSessionStats.grades.length;
    
    expect(container!.querySelector('.average-grade')?.textContent).toContain(expectedAverage.toFixed(1));
  });

  it('handles missing endTime gracefully', async () => {
    const ongoingSession = {
      ...mockSessionStats,
      endTime: null
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: ongoingSession
    });
    
    expect(container).toBeTruthy();
    
    // Should show ongoing time
    expect(container!.querySelector('.time-stat')).toBeTruthy();
    // Should not show completion indicator
    expect(container!.querySelector('.completion-indicator')).toBeFalsy();
  });

  it('supports reduced motion preferences', async () => {
    // Simulate reduced motion preference
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { container } = await mountProgressIndicator({});
    
    // Should still be functional without animations
    expect(container).toBeTruthy();
    expect(container!.querySelector('.progress-bar')).toBeTruthy();
    
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('supports high contrast mode', async () => {
    // Simulate high contrast mode
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(forced-colors: active)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { container } = await mountProgressIndicator({});
    
    // Should still be visible and functional
    expect(container).toBeTruthy();
    expect(container!.querySelector('.progress-bar')).toBeTruthy();
    
    // Check accessibility in high contrast
    await checkAccessibility(ProgressIndicator, {});
    
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('displays streak information when available', async () => {
    // This would require extending the session stats to include streak data
    const { container } = render(ProgressIndicator, {
      props: { sessionStats: mockSessionStats }
    });
    
    expect(container).toBeTruthy();
    // Streak display would be tested here if implemented
  });

  it('handles zero total cards gracefully', async () => {
    const zeroTotalStats = {
      startTime: new Date(),
      endTime: null,
      totalCards: 0,
      reviewedCards: 0,
      correctAnswers: 0,
      grades: []
    };
    
    const { container } = await mountProgressIndicator({
      sessionStats: zeroTotalStats
    });
    
    expect(container).toBeTruthy();
    
    // Should handle zero division gracefully
    expect(container!.querySelector('.progress-text')?.textContent).toContain('0/0');
    expect(container!.querySelector('.progress-percentage')?.textContent).toContain('0%');
  });

  it('updates progress bar animation smoothly', async () => {
    const { container } = render(ProgressIndicator, {
      props: { sessionStats: mockSessionStats }
    });
    
    const progressBar = container!.querySelector('.progress-bar-fill');
    
    // Check that progress bar has transition styles
    const transition = getComputedStyle(progressBar!).transition;
    expect(transition).toContain('width');
  });
});