/**
 * Virtual Scrolling Integration Tests
 * @file tests/integration/virtual-scrolling.spec.ts
 * @description Integration tests for virtual scrolling with large datasets
 * @version 1.0.0
 * @updated November 2025
 */

import { test, expect } from '@playwright/test';
import { render } from '@testing-library/svelte';
import type { VocabularyItem } from '$lib/types';
import { VirtualScrollingManager, DEFAULT_VIRTUAL_SCROLLING_CONFIG } from '$lib/utils/virtual-scrolling';
import VirtualList from '$lib/components/VirtualList.svelte';

/**
 * Generate mock vocabulary items for testing
 * @function generateMockVocabularyItems
 * @param {number} count - Number of items to generate
 * @returns {VocabularyItem[]} Array of mock vocabulary items
 */
function generateMockVocabularyItems(count: number): VocabularyItem[] {
  const items: VocabularyItem[] = [];
  const categories = ['nouns', 'verbs', 'adjectives', 'phrases'];
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  for (let i = 0; i < count; i++) {
    items.push({
      id: `vocab-${i}`,
      word: `Word ${i}`,
      translation: `Translation ${i}`,
      source_lang: 'de',
      target_lang: 'bg',
      category: categories[i % categories.length],
      level: levels[i % levels.length] as any,
      notes: `Notes for word ${i}`,
      notes_bg_to_de: `BG to DE notes ${i}`,
      notes_de_to_bg: `DE to BG notes ${i}`,
      etymology: `Etymology ${i}`,
      cultural_note: `Cultural note ${i}`,
      difficulty: Math.floor(Math.random() * 5) + 1,
      frequency: Math.floor(Math.random() * 100) + 1,
      examples: [
        {
          sentence: `Example sentence ${i}`,
          translation: `Example translation ${i}`,
          context: `Context ${i}`
        }
      ],
      linguistic_note_bg_to_de: `Linguistic note BG-DE ${i}`,
      linguistic_note_de_to_bg: `Linguistic note DE-BG ${i}`,
      linguistic_note: `Linguistic note ${i}`
    });
  }

  return items;
}

test.describe('VirtualList Component', () => {
  test.describe('Basic functionality', () => {
    test('should render all items when virtual scrolling is disabled', async ({ page }) => {
      const items = generateMockVocabularyItems(50);
      
      const { container } = render(VirtualList, {
        props: {
          items,
          enabled: false,
          threshold: 100
        }
      });

      // Wait for component to render
      await expect(page.locator('text=Word 0')).toBeVisible();
      await expect(page.locator('text=Word 49')).toBeVisible();
    });

    test('should render virtual scrolling when enabled with large dataset', async ({ page }) => {
      const items = generateMockVocabularyItems(1000);
      
      const { container } = render(VirtualList, {
        props: {
          items,
          enabled: true,
          threshold: 100
        }
      });

      // Should render only visible items + overscan
      await expect(page.locator('text=Word 0')).toBeVisible();
      // Should not render items beyond the initial viewport
      await expect(page.locator('text=Word 500')).not.toBeVisible();
    });

    test('should handle empty items array', async () => {
      const { container } = render(VirtualList, {
        props: {
          items: [],
          enabled: true
        }
      });

      await expect(screen.getByText('No vocabulary items to display')).toBeTruthy();
    });
  });

  test.describe('Performance optimization', () => {
    test('should only render visible items with overscan', async ({ page }) => {
      const items = generateMockVocabularyItems(500);
      
      const { container } = render(VirtualList, {
        props: {
          items,
          enabled: true,
          threshold: 100,
          overscan: 5
        }
      });

      const renderedItems = page.locator('.virtual-list-item');
      const count = await renderedItems.count();
      
      // Should render approximately overscan * 2 + visible items
      expect(count).toBeLessThan(50); // Much less than 500
      expect(count).toBeGreaterThan(10); // At least some items
    });

    test('should update rendering when items change', async ({ page }) => {
      const initialItems = generateMockVocabularyItems(100);
      const updatedItems = generateMockVocabularyItems(200);
      
      const { container } = render(VirtualList, {
        props: {
          items: initialItems,
          enabled: true,
          threshold: 50
        }
      });

      await expect(page.locator('text=Word 0')).toBeVisible();

      // Update items - re-render with new props
      component.rerender({ props: { items: updatedItems } });

      await expect(page.locator('text=Word 0')).toBeVisible();
      // Should handle the increased item count
      const items = page.locator('text=/Word \\d+/');
      const itemCount = await items.count();
      expect(itemCount).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      const items = generateMockVocabularyItems(100);
      
      const { container } = render(VirtualList, {
        props: {
          items,
          enabled: true
        }
      });

      const container = screen.getByRole('list');
      expect(container).toHaveAttribute('aria-label', 'Vocabulary list');
      
      const listItems = page.locator('role=listitem');
      const itemCount = await listItems.count();
      expect(itemCount).toBeGreaterThan(0);
      
      // Check ARIA position attributes
      for (let i = 0; i < itemCount; i++) {
        const item = listItems.nth(i);
        await expect(item).toHaveAttribute('aria-posinset', (i + 1).toString());
        await expect(item).toHaveAttribute('aria-setsize', '100');
      }
    });

    test('should handle keyboard navigation', async ({ page }) => {
      const items = generateMockVocabularyItems(100);
      
      const { container } = render(VirtualList, {
        props: {
          items,
          enabled: true
        }
      });

      const listContainer = page.locator('.virtual-list-container');
      await expect(listContainer).toBeVisible();
      
      // Simulate scroll with keyboard (Page Down)
      await listContainer.focus();
      await page.keyboard.press('PageDown');
      // Should handle the scroll event without errors
    });
  });

  test.describe('Configuration options', () => {
    test('should respect threshold configuration', async ({ page }) => {
      const items = generateMockVocabularyItems(150); // Above threshold
      
      const { container } = render(VirtualList, {
        props: {
          items,
          enabled: true,
          threshold: 200 // Higher than item count
        }
      });

      // Should render all items since count < threshold
      const renderedItems = page.locator('.virtual-list-item');
      const count = await renderedItems.count();
      expect(count).toBe(150);
    });

    test('should apply custom CSS classes', async ({ page }) => {
      const items = generateMockVocabularyItems(50);
      
      const { container } = render(VirtualList, {
        props: {
          items,
          containerClass: 'custom-container',
          itemClass: 'custom-item'
        }
      });

      const container = screen.getByRole('list');
      expect(container).toHaveClass('custom-container');
      
      const itemsList = page.locator('role=listitem');
      const firstItem = itemsList.first();
      await expect(firstItem).toHaveClass('custom-item');
    });
  });
});

test.describe('VirtualScrollingManager', () => {
  test.describe('Basic functionality', () => {
    test('should initialize with correct state', () => {
      const items = generateMockVocabularyItems(100);
      const manager = new VirtualScrollingManager(items);
      
      const state = manager.getState();
      expect(state.totalItems).toBe(100);
      expect(state.scrollTop).toBe(0);
      expect(state.containerHeight).toBe(0);
      expect(state.measuredHeights.size).toBe(0);
    });

    test('should calculate visible range correctly', () => {
      const items = generateMockVocabularyItems(1000);
      const manager = new VirtualScrollingManager(items);
      
      // Set up container with scroll
      manager.updateContainerHeight(400); // 400px container
      manager.updateScrollPosition(200); // Scrolled 200px
      
      const result = manager.getResult();
      expect(result.startIndex).toBeGreaterThanOrEqual(0);
      expect(result.endIndex).toBeLessThanOrEqual(1000);
      expect(result.items.length).toBeLessThan(1000); // Should render subset
    });

    test('should handle scroll position changes', () => {
      const items = generateMockVocabularyItems(500);
      const manager = new VirtualScrollingManager(items);
      
      manager.updateContainerHeight(400);
      manager.updateScrollPosition(0);
      const initialResult = manager.getResult();
      
      manager.updateScrollPosition(1000);
      const scrolledResult = manager.getResult();
      
      // Should have different visible ranges
      expect(scrolledResult.startIndex).toBeGreaterThan(initialResult.startIndex);
    });
  });

  test.describe('Performance optimization', () => {
    test('should only render items in viewport with overscan', () => {
      const items = generateMockVocabularyItems(1000);
      const manager = new VirtualScrollingManager(items, {
        ...DEFAULT_VIRTUAL_SCROLLING_CONFIG,
        overscan: 3
      });
      
      manager.updateContainerHeight(400);
      manager.updateScrollPosition(0);
      
      const result = manager.getResult();
      const expectedMaxItems = Math.ceil(400 / 80) + 3 * 2; // visible + overscan * 2
      expect(result.items.length).toBeLessThanOrEqual(expectedMaxItems);
    });

    test('should optimize for different device capabilities', () => {
      const items = generateMockVocabularyItems(500);
      const manager = new VirtualScrollingManager(items);
      
      const optimizedConfig = manager.getConfig();
      // Should have reasonable defaults for low-end devices
      expect(optimizedConfig.overscan).toBe(5); // Default
    });
  });

  test.describe('Edge cases', () => {
    test('should handle very large datasets', () => {
      const items = generateMockVocabularyItems(10_000); // 10k items
      const manager = new VirtualScrollingManager(items);
      
      manager.updateContainerHeight(600);
      manager.updateScrollPosition(5000);
      
      const result = manager.getResult();
      expect(result.items.length).toBeLessThan(100); // Should render small subset
      expect(result.transformOffset).toBeGreaterThan(0);
    });

    test('should handle zero-height container', () => {
      const items = generateMockVocabularyItems(100);
      const manager = new VirtualScrollingManager(items);
      
      manager.updateContainerHeight(0);
      manager.updateScrollPosition(0);
      
      const result = manager.getResult();
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(0);
    });

    test('should handle items array changes', () => {
      const initialItems = generateMockVocabularyItems(100);
      const manager = new VirtualScrollingManager(initialItems);
      
      manager.updateContainerHeight(400);
      manager.updateScrollPosition(200);
      const initialResult = manager.getResult();
      
      const updatedItems = generateMockVocabularyItems(200);
      manager.updateItems(updatedItems);
      const updatedResult = manager.getResult();
      
      expect(updatedResult.items.length).toBeGreaterThan(0);
      expect(updatedResult.items.length).toBeGreaterThan(0);
    });
  });
});

test.describe('Virtual Scrolling Integration', () => {
  test('should handle realistic scrolling scenarios', async ({ page }) => {
    const items = generateMockVocabularyItems(2000);
    
    const { container } = render(VirtualList, {
      props: {
        items,
        enabled: true,
        threshold: 500,
        overscan: 10,
        autoDetectHeight: false
      }
    });

    await expect(page.locator('text=Word 0')).toBeVisible();

    // Simulate scrolling by updating scroll position
    const listContainer = page.locator('.virtual-list-container');
    await expect(listContainer).toBeVisible();
    
    // Simulate scroll by updating component props
    component.rerender({ props: { scrollPosition: 1000 } });
    
    // Should render different items after scroll
    await expect(page.locator('text=Word 0')).not.toBeVisible();
    // Should render items around scroll position
    await expect(page.locator('text=/Word \\d+/')).toBeVisible();
  });

  test('should maintain performance with large datasets', async ({ page }) => {
    const items = generateMockVocabularyItems(5000);
    
    const renderStart = performance.now();
    
    const { container } = render(VirtualList, {
      props: {
        items,
        enabled: true,
        threshold: 1000
      }
    });

    await expect(page.locator('text=Word 0')).toBeVisible();

    const renderTime = performance.now() - renderStart;
    
    // Should render quickly even with 5000 items
    expect(renderTime).toBeLessThan(1000); // Under 1 second
  });

  test('should handle rapid scroll events', async ({ page }) => {
    const items = generateMockVocabularyItems(1000);
    
    const { container } = render(VirtualList, {
      props: {
        items,
        enabled: true
      }
    });

    await expect(page.locator('text=Word 0')).toBeVisible();

    // Simulate rapid scrolling
    for (let i = 0; i < 10; i++) {
      component.rerender({ props: { scrollPosition: i * 100 } });
    }

    // Should handle rapid scrolling without errors
    await expect(page.locator('text=/Word \\d+/')).toBeVisible();
  });
});

// Performance benchmarks
test.describe('Virtual Scrolling Performance Benchmarks', () => {
  test('should benchmark rendering time for different dataset sizes', async ({ page }) => {
    const datasetSizes = [100, 500, 1000, 5000];
    const results: { size: number; time: number }[] = [];

    for (const size of datasetSizes) {
      const items = generateMockVocabularyItems(size);
      const startTime = performance.now();
      
      const { container } = render(VirtualList, {
        props: { items, enabled: true }
      });

      await expect(page.locator('text=Word 0')).toBeVisible();

      const endTime = performance.now();
      results.push({ size, time: endTime - startTime });
    }

    // Basic performance expectations
    expect(results[0].time).toBeLessThan(100); // 100 items should render quickly
    expect(results[3].time).toBeLessThan(2000); // 5000 items should render in under 2 seconds
  });
});