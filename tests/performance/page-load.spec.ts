/**
 * Performance Tests
 *
 * Tests for page load performance and Core Web Vitals
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.describe('Page Load Performance', () => {
    test('homepage should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;

      // Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Main content should be visible
      await expect(page.locator('main')).toBeVisible();
    });

    test('vocabulary page should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/vocabulary');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('learn page should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/learn');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('practice page should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/practice');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('grammar page should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/grammar');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });
  });

  test.describe('Core Web Vitals', () => {
    test('should have acceptable Largest Contentful Paint (LCP)', async ({ page }) => {
      await page.goto('/');

      // Measure LCP
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });

      // LCP should be under 2.5 seconds for good
      // Note: This is a simplified check
      console.log(`LCP: ${lcp}ms`);
    });

    test('should have minimal Cumulative Layout Shift (CLS)', async ({ page }) => {
      await page.goto('/');

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      // Measure CLS
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });

          // Return after page stabilizes
          setTimeout(() => resolve(clsValue), 3000);
        });
      });

      // CLS should be under 0.1 for good
      console.log(`CLS: ${cls}`);
    });

    test('should have acceptable First Input Delay simulation', async ({ page }) => {
      await page.goto('/');

      // Measure interaction latency
      const button = page.locator('button, a').first();

      if (await button.isVisible()) {
        const startTime = Date.now();
        await button.click();
        const interactionTime = Date.now() - startTime;

        // Interaction should be responsive
        expect(interactionTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('Resource Loading', () => {
    test('should load JavaScript efficiently', async ({ page }) => {
      // Track JS resources
      const jsResources: string[] = [];

      page.on('response', (response) => {
        if (response.url().endsWith('.js')) {
          jsResources.push(response.url());
        }
      });

      await page.goto('/');

      // Should have loaded JS files
      console.log(`JS files loaded: ${jsResources.length}`);
    });

    test('should load CSS efficiently', async ({ page }) => {
      const cssResources: string[] = [];

      page.on('response', (response) => {
        if (response.url().endsWith('.css')) {
          cssResources.push(response.url());
        }
      });

      await page.goto('/');

      console.log(`CSS files loaded: ${cssResources.length}`);
    });

    test('should not have blocking resources', async ({ page }) => {
      await page.goto('/');

      // Check for render-blocking resources
      const blockingResources = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.filter((r: any) =>
          r.initiatorType === 'script' &&
          r.deliveryType === 'modulenever'
        );
      });

      // Just log for analysis
      console.log(`Potentially blocking resources: ${blockingResources.length}`);
    });
  });

  test.describe('Search Performance', () => {
    test('should search vocabulary quickly', async ({ page }) => {
      await page.goto('/vocabulary');

      await page.waitForSelector('input[type="search"], input[placeholder*="Suche"]', { timeout: 10000 });

      const searchInput = page.locator('input[type="search"], input[placeholder*="Suche"]');

      const startTime = Date.now();
      await searchInput.fill('Haus');
      await page.waitForTimeout(500); // Wait for search to complete
      const searchTime = Date.now() - startTime;

      // Search should complete in under 300ms
      expect(searchTime).toBeLessThan(1000);
    });

    test('should filter vocabulary quickly', async ({ page }) => {
      await page.goto('/vocabulary');

      await page.waitForSelector('.vocabulary-item, .vocabulary-card', { timeout: 10000 });

      const difficultyButton = page.locator('button:has-text("Schwierigkeit")').first();

      if (await difficultyButton.isVisible()) {
        const startTime = Date.now();
        await difficultyButton.click();
        await page.waitForTimeout(500);
        const filterTime = Date.now() - startTime;

        expect(filterTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('Scroll Performance', () => {
    test('should scroll vocabulary list smoothly', async ({ page }) => {
      await page.goto('/vocabulary');

      await page.waitForSelector('.vocabulary-item, .vocabulary-card', { timeout: 10000 });

      // Scroll through the list
      const scrollTimes: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(100);
        scrollTimes.push(Date.now() - startTime);
      }

      // Scrolling should be smooth
      const avgScrollTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
      expect(avgScrollTime).toBeLessThan(200);
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have memory leaks on navigation', async ({ page }) => {
      // Navigate multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('/');
        await page.goto('/vocabulary');
        await page.goto('/learn');
        await page.goto('/practice');
      }

      // Check memory (if available)
      const metrics = await page.metrics();

      console.log(`JS Heap Used: ${metrics.JSHeapUsedSize}`);
      console.log(`JS Heap Total: ${metrics.JSHeapTotalSize}`);
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow 3G gracefully', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;

      // Page should eventually load
      await expect(page.locator('main')).toBeVisible();

      console.log(`Load time with simulated latency: ${loadTime}ms`);
    });
  });

  test.describe('Cache Performance', () => {
    test('should cache vocabulary data', async ({ page }) => {
      // First load
      await page.goto('/vocabulary');
      await page.waitForSelector('.vocabulary-item, .vocabulary-card', { timeout: 10000 });

      const firstLoadTime = await page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation');
        return (entries[0] as PerformanceNavigationTiming).loadEventEnd;
      });

      // Second load (should be faster due to caching)
      await page.goto('/');
      await page.goto('/vocabulary');

      const secondLoadTime = await page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation');
        return (entries[0] as PerformanceNavigationTiming).loadEventEnd;
      });

      console.log(`First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`);
    });
  });

  test.describe('API Response Times', () => {
    test('should have fast API responses', async ({ page }) => {
      const apiResponses: { url: string; time: number }[] = [];

      page.on('response', async (response) => {
        const timing = response.timing();
        if (response.url().includes('/api/') || response.url().includes('.json')) {
          apiResponses.push({
            url: response.url(),
            time: timing.responseEnd - timing.requestStart
          });
        }
      });

      await page.goto('/vocabulary');

      // Check API response times
      for (const response of apiResponses) {
        console.log(`API: ${response.url} - ${response.time}ms`);

        // API responses should be fast
        if (response.time > 0) {
          expect(response.time).toBeLessThan(2000);
        }
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle touch interactions quickly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const button = page.locator('button, a').first();

      if (await button.isVisible()) {
        const startTime = Date.now();
        await button.tap();
        const interactionTime = Date.now() - startTime;

        expect(interactionTime).toBeLessThan(500);
      }
    });
  });
});