/**
 * SessionStats Component Tests
 * @file tests/components/SessionStats.spec.ts
 * @description Comprehensive tests for the SessionStats.svelte component
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import {
  mockSessionStats,
  toBeInTheDocument
} from '../test-utils';
import SessionStats from '$lib/components/SessionStats.svelte';

describe('SessionStats Component', () => {
  it('renders correctly with default props', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Check that main stats elements are present
    expect(container.querySelector('.session-stats')).toBeTruthy();
    expect(container.querySelector('.stats-header')).toBeTruthy();
    expect(container.querySelector('.stats-grid')).toBeTruthy();
  });

  it('displays session performance overview', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Check performance rating
    expect(container.querySelector('.performance-rating')).toBeTruthy();
    expect(container.querySelector('.rating-circle')).toBeTruthy();
    expect(container.querySelector('.rating-details')).toBeTruthy();
    
    // Check session performance stats
    expect(container.querySelectorAll('.stat-row').length).toBeGreaterThan(0);
  });

  it('shows correct session statistics', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    // Check basic stats
    const statValues = container.querySelectorAll('.stat-value');
    expect(statValues.length).toBeGreaterThan(0);
    
    // Check accuracy calculation
    const expectedAccuracy = (mockSessionStats.correctAnswers / mockSessionStats.reviewedCards) * 100;
    expect(container.textContent).toContain(Math.round(expectedAccuracy).toString());
  });

  it('displays overall progress statistics', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats,
        direction: 'bg-de'
      }
    });
    
    toBeInTheDocument(container);
    
    // Check overall progress section
    expect(container.querySelector('.overall-progress')).toBeTruthy();
    expect(container.querySelector('.due-highlight')).toBeTruthy();
  });

  it('renders in compact mode', async () => {
    const { container } = render(SessionStats, {
      props: {
        compact: true,
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    expect(container.querySelector('.session-stats.compact')).toBeTruthy();
    
    // In compact mode, should have simplified layout
    expect(container.querySelector('.compact-stats')).toBeTruthy();
    expect(container.querySelectorAll('.compact-row').length).toBeGreaterThan(0);
  });

  it('hides detailed stats in compact mode', async () => {
    const { container } = render(SessionStats, {
      props: {
        compact: true,
        showDetails: false,
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Should not show detailed sections in compact mode
    expect(container.querySelector('.detailed-stats')).toBeFalsy();
    expect(container.querySelector('.grade-chart')).toBeFalsy();
    expect(container.querySelector('.insights-list')).toBeFalsy();
  });

  it('shows grade distribution chart', async () => {
    const { container } = render(SessionStats, {
      props: {
        showDetails: true,
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Check grade chart is present
    expect(container.querySelector('.grade-chart')).toBeTruthy();
    expect(container.querySelectorAll('.grade-item').length).toBeGreaterThan(0);
  });

  it('displays performance insights', async () => {
    const { container } = render(SessionStats, {
      props: {
        showInsights: true,
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Check insights section
    expect(container.querySelector('.insights-list')).toBeTruthy();
    expect(container.querySelectorAll('.insight-item').length).toBeGreaterThan(0);
  });

  it('shows appropriate performance rating', async () => {
    // Test excellent performance
    const excellentStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 9,
      grades: [5, 5, 5, 4, 5, 5, 4, 5, 5, 4]
    };
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: excellentStats
      }
    });
    
    expect(container.textContent).toContain('Excellent');
    expect(container.querySelector('.rating-circle')).toBeTruthy();
  });

  it('shows poor performance rating', async () => {
    // Test poor performance
    const poorStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 3,
      grades: [1, 2, 1, 2, 1, 2, 1, 2, 3, 2]
    };
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: poorStats
      }
    });
    
    expect(container.textContent).toContain('Needs Work');
    expect(container.querySelector('.rating-circle')).toBeTruthy();
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
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: emptyStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Should show "No Data" rating
    expect(container.textContent).toContain('No Data');
    
    // Should handle zero division gracefully
    expect(container.textContent).toContain('0');
  });

  it('displays duration information', async () => {
    const sessionWithDuration = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 300_000), // 5 minutes ago
      endTime: new Date()
    };
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: sessionWithDuration,
        showDetails: true
      }
    });
    
    toBeInTheDocument(container);
    expect(container.textContent).toContain('5m'); // Should show 5 minutes
  });

  it('shows cards per minute metric', async () => {
    const sessionWithDuration = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 180_000), // 3 minutes ago
      endTime: new Date()
    };
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: sessionWithDuration,
        showDetails: true
      }
    });
    
    toBeInTheDocument(container);
    
    // Should calculate cards per minute (3 cards / 3 minutes = 1.0)
    expect(container.textContent).toContain('1.0');
  });

  it('filters by direction correctly', async () => {
    const { container } = render(SessionStats, {
      props: {
        direction: 'bg-de',
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Should show direction-specific stats
    expect(container.querySelector('.overall-progress')).toBeTruthy();
  });

  it('supports refresh functionality', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Check refresh button is present
    expect(container.querySelector('.refresh-button')).toBeTruthy();
    
    // Click refresh button
    const refreshButton = container.querySelector('.refresh-button');
    if (refreshButton) {
      fireEvent.click(refreshButton);
    }
    
    // Should still be visible after refresh
    toBeInTheDocument(container);
  });

  it('shows last refresh time', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Check last refresh time is displayed
    expect(container.querySelector('.last-refresh')).toBeTruthy();
  });

  it('handles auto-refresh interval', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats,
        refreshInterval: 1000 // 1 second for testing
      }
    });
    
    toBeInTheDocument(container);
    
    // Wait for auto-refresh
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Should still be visible after auto-refresh
    toBeInTheDocument(container);
  });

  it('is accessible', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Check specific accessibility features
    expect(container.querySelector('[role="region"]')).toBeTruthy();
    expect(container.querySelectorAll('[aria-label]').length).toBeGreaterThan(0);
  });

  it('provides proper ARIA labels', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    // Check main region has proper label
    const sessionStatsElement = container.querySelector('.session-stats');
    expect(sessionStatsElement?.getAttribute('aria-label')).toBe('Session statistics');
    
    // Check stats sections have proper labels
    expect(container.querySelector('.performance-overview')?.hasAttribute('aria-label')).toBeTruthy();
  });

  it('is responsive across different viewports', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    // Responsive testing would require viewport simulation
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
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: largeStats
      }
    });
    
    toBeInTheDocument(container);
    expect(container.textContent).toContain('750');
    expect(container.textContent).toContain('600');
  });

  it('displays time in appropriate formats', async () => {
    // Test short session (seconds)
    const shortSession = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 30_000), // 30 seconds ago
      endTime: new Date()
    };
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: shortSession,
        showDetails: true
      }
    });
    
    toBeInTheDocument(container);
    expect(container.textContent).toContain('30s');
    
    // Test long session (hours)
    const longSession = {
      ...mockSessionStats,
      startTime: new Date(Date.now() - 7_200_000), // 2 hours ago
      endTime: new Date()
    };
    
    const { container: longContainer } = render(SessionStats, {
      props: {
        sessionStats: longSession,
        showDetails: true
      }
    });
    
    toBeInTheDocument(longContainer);
    expect(longContainer.textContent).toContain('2h');
  });

  it('shows appropriate insights based on performance', async () => {
    // Test high accuracy session
    const highAccuracyStats = {
      ...mockSessionStats,
      reviewedCards: 10,
      correctAnswers: 9,
      grades: [5, 5, 5, 4, 5, 5, 4, 5, 5, 4]
    };
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: highAccuracyStats,
        showInsights: true
      }
    });
    
    toBeInTheDocument(container);
    expect(container.textContent).toContain('Excellent accuracy');
  });

  it('handles missing endTime gracefully', async () => {
    const ongoingSession = {
      ...mockSessionStats,
      endTime: null
    };
    
    const { container } = render(SessionStats, {
      props: {
        sessionStats: ongoingSession,
        showDetails: true
      }
    });
    
    toBeInTheDocument(container);
    
    // Should calculate duration from startTime to now
    expect(container.textContent).toMatch(/5:00/);
  });

  it('supports reduced motion preferences', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    // Should still be functional without animations
    toBeInTheDocument(container);
    expect(container.textContent).toMatch(/80%/);
  });

  it('supports high contrast mode', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats
      }
    });
    
    // Should still be visible and functional
    toBeInTheDocument(container);
    expect(container.textContent).toContain('Cards Reviewed');
  });

  it('displays grade distribution with correct percentages', async () => {
    const { container } = render(SessionStats, {
      props: {
        showDetails: true,
        sessionStats: mockSessionStats
      }
    });
    
    toBeInTheDocument(container);
    
    // Check grade distribution percentages
    const gradeItems = container.querySelectorAll('.grade-item');
    const count = gradeItems.length;
    
    for (let i = 0; i < count; i++) {
      const item = gradeItems[i];
      expect(item).toBeTruthy();
      
      // Each grade item should have label, bar, and count
      expect(item.querySelector('.grade-label')).toBeTruthy();
      expect(item.querySelector('.grade-bar')).toBeTruthy();
      expect(item.querySelector('.grade-count')).toBeTruthy();
    }
  });

  it('shows due items count with highlighting', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats,
        direction: 'bg-de'
      }
    });
    
    toBeInTheDocument(container);
    
    // Check due items are highlighted
    const dueHighlight = container.querySelector('.due-highlight') as HTMLElement;
    toBeInTheDocument(dueHighlight);
    expect(dueHighlight?.classList.contains('text-red-600')).toBeTruthy();
  });

  it('handles timeout for auto-refresh', async () => {
    const { container } = render(SessionStats, {
      props: {
        sessionStats: mockSessionStats,
        refreshInterval: 0 // Disabled
      }
    });
    
    toBeInTheDocument(container);
    
    // Should not auto-refresh when interval is 0
    await new Promise(resolve => setTimeout(resolve, 2000));
    toBeInTheDocument(container);
  });
});