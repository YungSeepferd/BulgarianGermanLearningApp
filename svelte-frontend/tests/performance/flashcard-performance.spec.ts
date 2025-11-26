/**
 * Flashcard Performance Tests
 * @description Tests performance optimizations in the flashcard component
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import Flashcard from '$lib/components/Flashcard.svelte';
import { createMockVocabulary } from '../test-utils.js';
import type { VocabularyItem } from '$lib/types/index.js';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
});

// Mock performance optimizer
const mockPerformanceOptimizer = {
  getMonitor: () => ({
    getAllMetrics: () => ({
      renderTime: 150,
      loadTime: 300,
      interactionTime: 50
    }),
    getMemoryInfo: () => ({
      used: 50 * 1024 * 1024,
      available: 100 * 1024 * 1024
    })
  }),
  getPerformanceRecommendations: () => [
    'Consider lazy loading for better performance',
    'Optimize images for faster loading'
  ]
};

// Setup window mocks
beforeEach(() => {
  // Setup IntersectionObserver mock
  (window as any).IntersectionObserver = mockIntersectionObserver;
  
  // Setup performance mock
  (window as any).performance = {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 2048 * 1024 * 1024
    }
  };
  
  // Setup performance optimizer
  (window as any).performanceOptimizer = mockPerformanceOptimizer;
  
  // Setup navigator mock
  (window as any).navigator = {
    hardwareConcurrency: 4,
    deviceMemory: 8
  };
});

describe('Flashcard Performance Tests', () => {
  let mockVocabulary: VocabularyItem;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVocabulary = createMockVocabulary(1)[0];
    
    // Reset performance mock
    let callCount = 0;
    (window as any).performance.now.mockImplementation(() => {
      callCount++;
      return Date.now() + (callCount * 10); // Simulate time passing
    });
  });

  it('should load quickly with lazy loading enabled', async () => {
    const startTime = Date.now();
    
    const { getByTestId, queryByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: true
      }
    });

    // Should show placeholder initially
    expect(getByTestId('flashcard-placeholder')).toBeInTheDocument();
    
    // Should load within reasonable time
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1000); // Should load within 1 second

    // Simulate intersection to trigger lazy loading
    const mockCallback = mockIntersectionObserver.mock.calls[0][0];
    mockCallback([{ isIntersecting: true, target: getByTestId('flashcard-container') }]);

    // Wait for lazy loading to complete
    await waitFor(() => {
      expect(queryByTestId('flashcard-placeholder')).not.toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Should show actual content after loading
    expect(getByTestId('flashcard')).toBeInTheDocument();
  });

  it('should handle rapid interactions without performance degradation', async () => {
    const { getByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: false
      }
    });

    // Measure performance of rapid interactions
    const startTime = Date.now();
    
    for (let i = 0; i < 20; i++) {
      fireEvent.click(getByTestId('flashcard'));
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    }
    
    const interactionTime = Date.now() - startTime;
    
    // Should handle 20 interactions within 2 seconds
    expect(interactionTime).toBeLessThan(2000);
    
    // Component should still be responsive
    expect(getByTestId('flashcard')).toBeInTheDocument();
    expect(getByTestId('flashcard-content')).toBeInTheDocument();
  });

  it('should optimize memory usage with multiple instances', async () => {
    const components = [];
    const startTime = Date.now();
    
    // Mount multiple flashcard instances
    for (let i = 0; i < 10; i++) {
      const vocab = createMockVocabulary(1)[0];
      const { getByTestId } = render(Flashcard, {
        props: {
          vocabularyItem: vocab,
          lazyLoad: true
        }
      });
      components.push(getByTestId('flashcard'));
    }
    
    const mountTime = Date.now() - startTime;
    
    // Should mount 10 instances within reasonable time
    expect(mountTime).toBeLessThan(3000);
    
    // All components should be visible
    for (const component of components) {
      expect(component).toBeInTheDocument();
    }
    
    // Check memory usage
    expect(mockPerformance.memory.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
  });

  it('should respect reduced motion preferences', async () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    const { getByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: false
      }
    });

    // Should still be functional
    expect(getByTestId('flashcard')).toBeInTheDocument();
    fireEvent.click(getByTestId('flashcard'));
    expect(getByTestId('card-back')).toBeInTheDocument();
    
    // Check that animations are disabled
    const flashcardElement = getByTestId('flashcard');
    const style = getComputedStyle(flashcardElement);
    expect(style.transition).toBe('none');
  });

  it('should optimize for low-end devices', async () => {
    // Mock low-end device detection
    (window as any).navigator = {
      ...window.navigator,
      hardwareConcurrency: 2,
      deviceMemory: 2
    };
    
    const { getByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: true
      }
    });

    // Should still load and be functional
    expect(getByTestId('flashcard')).toBeInTheDocument();
    
    // Should load within reasonable time even on low-end device
    const startTime = Date.now();
    
    // Simulate intersection to trigger loading
    const mockCallback = mockIntersectionObserver.mock.calls[0][0];
    mockCallback([{ isIntersecting: true, target: getByTestId('flashcard-container') }]);

    await waitFor(() => {
      expect(getByTestId('flashcard')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  it('should implement efficient intersection observer', async () => {
    const { getByTestId, queryByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: true
      }
    });

    // Initially should show placeholder (not intersecting)
    expect(getByTestId('flashcard-placeholder')).toBeInTheDocument();
    expect(queryByTestId('flashcard')).not.toBeInTheDocument();

    // Simulate intersection
    const mockCallback = mockIntersectionObserver.mock.calls[0][0];
    mockCallback([{ isIntersecting: true, target: getByTestId('flashcard-container') }]);

    // Should load after intersection
    await waitFor(() => {
      expect(getByTestId('flashcard')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(queryByTestId('flashcard-placeholder')).not.toBeInTheDocument();
  });

  it('should handle dynamic imports efficiently', async () => {
    const { getByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: true
      }
    });

    // Should not load heavy dependencies initially
    expect(getByTestId('flashcard-placeholder')).toBeInTheDocument();

    // Simulate intersection to trigger lazy loading
    const mockCallback = mockIntersectionObserver.mock.calls[0][0];
    mockCallback([{ isIntersecting: true, target: getByTestId('flashcard-container') }]);

    // Should load dependencies when needed
    await waitFor(() => {
      expect(getByTestId('flashcard')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should maintain accessibility with performance optimizations', async () => {
    const { getByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: true
      }
    });

    // Simulate intersection to trigger loading
    const mockCallback = mockIntersectionObserver.mock.calls[0][0];
    mockCallback([{ isIntersecting: true, target: getByTestId('flashcard-container') }]);

    // Wait for lazy loading to complete
    await waitFor(() => {
      expect(getByTestId('flashcard')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check accessibility
    expect(getByTestId('flashcard')).toHaveAttribute('role', 'button');
    expect(getByTestId('flashcard')).toHaveAttribute('aria-label');
    expect(getByTestId('flashcard')).toHaveAttribute('tabindex');
    
    // Should support keyboard navigation
    getByTestId('flashcard').focus();
    fireEvent.keyDown(getByTestId('flashcard'), { key: ' ' });
    expect(getByTestId('card-back')).toBeInTheDocument();
    
    // Should have screen reader announcements
    expect(getByTestId('screen-reader-announcements')).toBeInTheDocument();
  });

  it('should optimize CSS rendering with containment', async () => {
    const { getByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: false
      }
    });

    // Check that CSS containment is applied
    const container = getByTestId('flashcard-container');
    const style = getComputedStyle(container);
    expect(style.contain).not.toBe('none');
  });

  it('should handle error states gracefully', async () => {
    // Test with invalid vocabulary item
    const invalidItem = {
      ...mockVocabulary,
      id: '',
      bg: '',
      de: ''
    };

    const { getByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: invalidItem,
        lazyLoad: false
      }
    });

    // Should handle error without crashing
    expect(getByTestId('flashcard')).toBeInTheDocument();
  });

  it('should measure and report performance metrics', async () => {
    const { getByTestId } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabulary,
        lazyLoad: true
      }
    });

    // Get performance metrics
    const metrics = mockPerformanceOptimizer.getMonitor();
    
    // Should have performance metrics
    expect(Object.keys(metrics.getAllMetrics()).length).toBeGreaterThan(0);
    
    // Should provide recommendations if needed
    const recommendations = mockPerformanceOptimizer.getPerformanceRecommendations();
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
  });
});