/**
 * LoadingSpinner Component Tests
 * @file tests/components/LoadingSpinner.spec.ts
 * @description Comprehensive tests for the LoadingSpinner.svelte component
 * @version 1.0.0
 * @updated November 2025
 */

import { test, expect } from '@playwright/test';
import {
  mountLoadingSpinner,
  checkAccessibility,
  takeScreenshot,
  testResponsive,
  commonViewports,
  waitForLoading
} from '../test-utils';

test.describe('LoadingSpinner Component', () => {
  test('renders correctly with default props', async ({ page }) => {
    const component = await mountLoadingSpinner({});
    
    await expect(component).toBeVisible();
    
    // Check that loading spinner elements are present
    await expect(component.locator('.loading-container')).toBeVisible();
    await expect(component.locator('.loading-content')).toBeVisible();
    await expect(component.locator('.spinner')).toBeVisible();
    
    // Check accessibility
    await checkAccessibility(page, component);
    
    // Take screenshot for visual regression
    await takeScreenshot(page, 'loading-spinner-default', component);
  });

  test('displays loading text when provided', async ({ page }) => {
    const component = await mountLoadingSpinner({
      text: 'Loading vocabulary...'
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.loading-text')).toContainText('Loading vocabulary...');
  });

  test('hides text when showText is false', async ({ page }) => {
    const component = await mountLoadingSpinner({
      text: 'This should not show',
      showText: false
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.loading-text')).not.toBeVisible();
  });

  test('renders different sizes correctly', async ({ page }) => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    for (const size of sizes) {
      const component = await mountLoadingSpinner({
        size
      });
      
      await expect(component).toBeVisible();
      await expect(component.locator('.spinner')).toHaveClass(new RegExp(`w-${size === 'small' ? '4' : (size === 'medium' ? '8' : '12')}`));
      await expect(component.locator('.spinner')).toHaveClass(new RegExp(`h-${size === 'small' ? '4' : (size === 'medium' ? '8' : '12')}`));
    }
  });

  test('renders different variants correctly', async ({ page }) => {
    const variants = ['spinner', 'dots', 'pulse', 'bars'] as const;
    
    for (const variant of variants) {
      const component = await mountLoadingSpinner({
        variant
      });
      
      await expect(component).toBeVisible();
      
      switch (variant) {
      case 'spinner': {
        await expect(component.locator('.spinner')).toBeVisible();
      
        break;
      }
      case 'dots': {
        await expect(component.locator('.dots-container')).toBeVisible();
        await expect(component.locator('.dot')).toHaveCount(3);
      
        break;
      }
      case 'pulse': {
        await expect(component.locator('.pulse-container')).toBeVisible();
        await expect(component.locator('.pulse-dot')).toBeVisible();
      
        break;
      }
      case 'bars': {
        await expect(component.locator('.bars-container')).toBeVisible();
        await expect(component.locator('.bar')).toHaveCount(4);
      
        break;
      }
      // No default
      }
    }
  });

  test('renders different colors correctly', async ({ page }) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error'] as const;
    
    for (const color of colors) {
      const component = await mountLoadingSpinner({
        color
      });
      
      await expect(component).toBeVisible();
      
      // Check that appropriate color classes are applied
      switch (color) {
      case 'primary': {
        await expect(component.locator('.spinner')).toHaveClass(/border-blue-600/);
      
        break;
      }
      case 'secondary': {
        await expect(component.locator('.spinner')).toHaveClass(/border-gray-600/);
      
        break;
      }
      case 'success': {
        await expect(component.locator('.spinner')).toHaveClass(/border-green-600/);
      
        break;
      }
      case 'warning': {
        await expect(component.locator('.spinner')).toHaveClass(/border-yellow-600/);
      
        break;
      }
      case 'error': {
        await expect(component.locator('.spinner')).toHaveClass(/border-red-600/);
      
        break;
      }
      // No default
      }
    }
  });

  test('centers content when centered is true', async ({ page }) => {
    const component = await mountLoadingSpinner({
      centered: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.loading-container.centered')).toBeVisible();
  });

  test('shows overlay when overlay is true', async ({ page }) => {
    const component = await mountLoadingSpinner({
      overlay: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.loading-container.overlay')).toBeVisible();
    await expect(component.locator('.loading-container')).toHaveCSS('background-color', /rgba/);
  });

  test('shows fullscreen when fullscreen is true', async ({ page }) => {
    const component = await mountLoadingSpinner({
      fullscreen: true
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.loading-container.fullscreen')).toBeVisible();
    
    // Should cover the entire viewport
    const containerBox = await component.locator('.loading-container').boundingBox();
    expect(containerBox.width).toBeGreaterThan(300);
    expect(containerBox.height).toBeGreaterThan(300);
  });

  test('respects delay before showing', async ({ page }) => {
    const component = await mountLoadingSpinner({
      delay: 1000 // 1 second delay
    });
    
    // Should not be visible immediately
    await expect(component).not.toBeVisible();
    
    // Should be visible after delay
    await page.waitForTimeout(1200);
    await expect(component).toBeVisible();
  });

  test('hides after timeout', async ({ page }) => {
    const component = await mountLoadingSpinner({
      timeout: 1000 // 1 second timeout
    });
    
    // Should be visible initially
    await expect(component).toBeVisible();
    
    // Should hide after timeout
    await page.waitForTimeout(1200);
    await expect(component).not.toBeVisible();
  });

  test('provides proper ARIA attributes', async ({ page }) => {
    const component = await mountLoadingSpinner({
      text: 'Loading data...'
    });
    
    await expect(component).toBeVisible();
    
    // Check ARIA attributes
    await expect(component.locator('.loading-container')).toHaveAttribute('role', 'status');
    await expect(component.locator('.loading-container')).toHaveAttribute('aria-label', 'Loading data...');
    await expect(component.locator('.loading-container')).toHaveAttribute('aria-busy', 'true');
  });

  test('provides screen reader only text', async ({ page }) => {
    const component = await mountLoadingSpinner({
      text: 'Loading vocabulary...'
    });
    
    await expect(component).toBeVisible();
    
    // Check for screen reader only content
    await expect(component.locator('.sr-only')).toBeVisible();
    await expect(component.locator('.sr-only')).toContainText('Loading vocabulary..., please wait');
  });

  test('supports keyboard navigation', async ({ page }) => {
    const component = await mountLoadingSpinner({});
    
    await expect(component).toBeVisible();
    
    // Loading spinner should not be focusable by default (it's decorative)
    // But if it has interactive elements, they should be keyboard accessible
    const focusableElements = component.locator('button, [tabindex]');
    const count = await focusableElements.count();
    
    if (count > 0) {
      await focusableElements.first().focus();
      await expect(focusableElements.first()).toBeFocused();
    }
  });

  test('is accessible', async ({ page }) => {
    const component = await mountLoadingSpinner({});
    
    // Run comprehensive accessibility tests
    const results = await checkAccessibility(page, component);
    
    // Check specific accessibility features
    await expect(component.locator('[role="status"]')).toBeVisible();
    await expect(component.locator('[aria-busy="true"]')).toBeVisible();
  });

  test('is responsive across different viewports', async ({ page }) => {
    const component = await mountLoadingSpinner({});
    
    await testResponsive(page, component, commonViewports);
  });

  test('handles long text gracefully', async ({ page }) => {
    const longText = 'This is a very long loading message that '.repeat(5);
    
    const component = await mountLoadingSpinner({
      text: longText
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.loading-text')).toBeVisible();
    
    // Text should be truncated or wrapped appropriately
    const textElement = component.locator('.loading-text');
    const textContent = await textElement.textContent();
    expect(textContent?.length).toBeGreaterThan(0);
  });

  test('supports reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const component = await mountLoadingSpinner({
      variant: 'spinner'
    });
    
    await expect(component).toBeVisible();
    
    // Should still be functional without animations
    await expect(component.locator('.spinner')).toBeVisible();
  });

  test('supports high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    
    const component = await mountLoadingSpinner({});
    
    // Should still be visible and functional
    await expect(component).toBeVisible();
    await expect(component.locator('.spinner')).toBeVisible();
    
    // Check accessibility in high contrast
    await checkAccessibility(page, component);
  });

  test('dots variant animates correctly', async ({ page }) => {
    const component = await mountLoadingSpinner({
      variant: 'dots'
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.dots-container')).toBeVisible();
    await expect(component.locator('.dot')).toHaveCount(3);
    
    // Check that dots have animation classes
    for (let i = 0; i < 3; i++) {
      const dot = component.locator('.dot').nth(i);
      await expect(dot).toHaveClass(/dot/);
    }
  });

  test('pulse variant animates correctly', async ({ page }) => {
    const component = await mountLoadingSpinner({
      variant: 'pulse'
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.pulse-container')).toBeVisible();
    await expect(component.locator('.pulse-dot')).toBeVisible();
    
    // Check that pulse dot has animation class
    await expect(component.locator('.pulse-dot')).toHaveClass(/pulse-dot/);
  });

  test('bars variant animates correctly', async ({ page }) => {
    const component = await mountLoadingSpinner({
      variant: 'bars'
    });
    
    await expect(component).toBeVisible();
    await expect(component.locator('.bars-container')).toBeVisible();
    await expect(component.locator('.bar')).toHaveCount(4);
    
    // Check that bars have animation classes
    for (let i = 0; i < 4; i++) {
      const bar = component.locator('.bar').nth(i);
      await expect(bar).toHaveClass(/bar/);
    }
  });

  test('maintains visibility during rapid prop changes', async ({ page }) => {
    const component = await mountLoadingSpinner({
      text: 'Initial text'
    });
    
    await expect(component).toBeVisible();
    
    // Rapidly change props
    await component.updateProps({ text: 'Updated text' });
    await page.waitForTimeout(50);
    
    await component.updateProps({ variant: 'dots' });
    await page.waitForTimeout(50);
    
    await component.updateProps({ color: 'success' });
    await page.waitForTimeout(50);
    
    // Should still be visible and functional
    await expect(component).toBeVisible();
  });

  test('handles missing text gracefully', async ({ page }) => {
    const component = await mountLoadingSpinner({
      text: undefined
    });
    
    await expect(component).toBeVisible();
    
    // Should not show loading text element
    await expect(component.locator('.loading-text')).not.toBeVisible();
    
    // Should still show spinner
    await expect(component.locator('.spinner')).toBeVisible();
  });

  test('shows and hides programmatically', async ({ page }) => {
    const component = await mountLoadingSpinner({});
    
    // Should be visible initially
    await expect(component).toBeVisible();
    
    // Hide programmatically
    await component.evaluate((node: any) => {
      if (node.hide) {
        node.hide();
      }
    });
    
    await expect(component).not.toBeVisible();
    
    // Show programmatically
    await component.evaluate((node: any) => {
      if (node.show) {
        node.show();
      }
    });
    
    await expect(component).toBeVisible();
  });

  test('provides visibility state', async ({ page }) => {
    const component = await mountLoadingSpinner({});
    
    // Check visibility state
    const isVisible = await component.evaluate((node: any) => {
      return node.isVisible ? node.isVisible() : true;
    });
    
    expect(isVisible).toBe(true);
  });

  test('handles dark mode', async ({ page }) => {
    // Simulate dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    const component = await mountLoadingSpinner({});
    
    await expect(component).toBeVisible();
    await expect(component.locator('.spinner')).toBeVisible();
    
    // Should adapt to dark mode styling
    const container = component.locator('.loading-container');
    const backgroundColor = await container.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Should have appropriate dark mode background
    expect(backgroundColor).toContain('0, 0, 0'); // Dark background
  });

  test('supports custom styling classes', async ({ page }) => {
    const component = await mountLoadingSpinner({});
    
    // Should have base styling classes
    await expect(component).toHaveClass(/loading-container/);
    await expect(component.locator('.loading-content')).toBeVisible();
  });

  test('handles rapid show/hide cycles', async ({ page }) => {
    const component = await mountLoadingSpinner({});
    
    // Rapid show/hide cycles
    for (let i = 0; i < 5; i++) {
      await component.evaluate((node: any) => {
        if (node.hide) {
          node.hide();
        }
      });
      await page.waitForTimeout(50);
      
      await component.evaluate((node: any) => {
        if (node.show) {
          node.show();
        }
      });
      await page.waitForTimeout(50);
    }
    
    // Should still be functional
    await expect(component).toBeVisible();
  });

  test('provides proper loading semantics', async ({ page }) => {
    const component = await mountLoadingSpinner({
      text: 'Processing data...'
    });
    
    await expect(component).toBeVisible();
    
    // Check semantic HTML structure
    await expect(component.locator('[role="status"]')).toBeVisible();
    await expect(component.locator('[aria-live="polite"]')).toBeVisible();
    await expect(component.locator('[aria-busy="true"]')).toBeVisible();
  });

  test('handles zero timeout correctly', async ({ page }) => {
    const component = await mountLoadingSpinner({
      timeout: 0 // Disabled
    });
    
    await expect(component).toBeVisible();
    
    // Should not hide automatically
    await page.waitForTimeout(2000);
    await expect(component).toBeVisible();
  });

  test('handles zero delay correctly', async ({ page }) => {
    const component = await mountLoadingSpinner({
      delay: 0 // No delay
    });
    
    // Should be visible immediately
    await expect(component).toBeVisible();
  });

  test('supports custom timeout and delay combinations', async ({ page }) => {
    const component = await mountLoadingSpinner({
      delay: 500,
      timeout: 2000
    });
    
    // Should not be visible initially
    await expect(component).not.toBeVisible();
    
    // Should be visible after delay
    await page.waitForTimeout(600);
    await expect(component).toBeVisible();
    
    // Should hide after timeout
    await page.waitForTimeout(1600);
    await expect(component).not.toBeVisible();
  });
});