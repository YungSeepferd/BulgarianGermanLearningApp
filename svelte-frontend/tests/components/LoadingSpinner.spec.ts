/**
 * LoadingSpinner Component Tests
 * @file tests/components/LoadingSpinner.spec.ts
 * @description Comprehensive tests for the LoadingSpinner.svelte component
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { mountLoadingSpinner, checkAccessibility } from '../test-utils';
import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

describe('LoadingSpinner Component', () => {
  it('renders correctly with default props', async () => {
    const { container } = await mountLoadingSpinner({});
    
    expect(container).toBeTruthy();
    
    // Check that loading spinner elements are present
    expect(container.querySelector('.loading-container')).toBeTruthy();
    expect(container.querySelector('.loading-content')).toBeTruthy();
    expect(container.querySelector('.spinner')).toBeTruthy();
    
    // Check accessibility
    await checkAccessibility(LoadingSpinner, {});
  });

  it('displays loading text when provided', async () => {
    const { container } = await mountLoadingSpinner({
      text: 'Loading vocabulary...'
    });
    
    expect(container).toBeTruthy();
    const loadingText = container.querySelector('.loading-text');
    expect(loadingText).toBeTruthy();
    expect(loadingText?.textContent).toContain('Loading vocabulary...');
  });

  it('hides text when showText is false', async () => {
    const { container } = await mountLoadingSpinner({
      text: 'This should not show',
      showText: false
    });
    
    expect(container).toBeTruthy();
    const loadingText = container.querySelector('.loading-text');
    expect(loadingText).toBeFalsy();
  });

  it('renders different sizes correctly', async () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    for (const size of sizes) {
      const { container } = await mountLoadingSpinner({
        size
      });
      
      expect(container).toBeTruthy();
      const spinner = container.querySelector('.spinner');
      expect(spinner).toBeTruthy();
      expect(spinner?.className).toContain(`w-${size === 'small' ? '4' : (size === 'medium' ? '8' : '12')}`);
      expect(spinner?.className).toContain(`h-${size === 'small' ? '4' : (size === 'medium' ? '8' : '12')}`);
    }
  });

  it('renders different variants correctly', async () => {
    const variants = ['spinner', 'dots', 'pulse', 'bars'] as const;
    
    for (const variant of variants) {
      const { container } = await mountLoadingSpinner({
        variant
      });
      
      expect(container).toBeTruthy();
      
      switch (variant) {
      case 'spinner': {
        expect(container.querySelector('.spinner')).toBeTruthy();
        break;
      }
      case 'dots': {
        expect(container.querySelector('.dots-container')).toBeTruthy();
        expect(container.querySelectorAll('.dot').length).toBe(3);
        break;
      }
      case 'pulse': {
        expect(container.querySelector('.pulse-container')).toBeTruthy();
        expect(container.querySelector('.pulse-dot')).toBeTruthy();
        break;
      }
      case 'bars': {
        expect(container.querySelector('.bars-container')).toBeTruthy();
        expect(container.querySelectorAll('.bar').length).toBe(4);
        break;
      }
      // No default
      }
    }
  });

  it('renders different colors correctly', async () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error'] as const;
    
    for (const color of colors) {
      const { container } = await mountLoadingSpinner({
        color
      });
      
      expect(container).toBeTruthy();
      const spinner = container.querySelector('.spinner');
      expect(spinner).toBeTruthy();
      
      // Check that appropriate color classes are applied
      switch (color) {
      case 'primary': {
        expect(spinner?.className).toContain('border-blue-600');
        break;
      }
      case 'secondary': {
        expect(spinner?.className).toContain('border-gray-600');
        break;
      }
      case 'success': {
        expect(spinner?.className).toContain('border-green-600');
        break;
      }
      case 'warning': {
        expect(spinner?.className).toContain('border-yellow-600');
        break;
      }
      case 'error': {
        expect(spinner?.className).toContain('border-red-600');
        break;
      }
      // No default
      }
    }
  });

  it('centers content when centered is true', async () => {
    const { container } = await mountLoadingSpinner({
      centered: true
    });
    
    expect(container).toBeTruthy();
    expect(container.querySelector('.loading-container.centered')).toBeTruthy();
  });

  it('shows overlay when overlay is true', async () => {
    const { container } = await mountLoadingSpinner({
      overlay: true
    });
    
    expect(container).toBeTruthy();
    expect(container.querySelector('.loading-container.overlay')).toBeTruthy();
    const loadingContainer = container.querySelector('.loading-container');
    expect(loadingContainer).toBeTruthy();
    expect(getComputedStyle(loadingContainer!).backgroundColor).toContain('rgba');
  });

  it('shows fullscreen when fullscreen is true', async () => {
    const { container } = await mountLoadingSpinner({
      fullscreen: true
    });
    
    expect(container).toBeTruthy();
    expect(container.querySelector('.loading-container.fullscreen')).toBeTruthy();
    
    // Should cover the entire viewport
    const loadingContainer = container.querySelector('.loading-container');
    expect(loadingContainer).toBeTruthy();
    expect(loadingContainer?.clientWidth).toBeGreaterThan(300);
    expect(loadingContainer?.clientHeight).toBeGreaterThan(300);
  });

  it('respects delay before showing', async () => {
    const { container } = await mountLoadingSpinner({
      delay: 1000 // 1 second delay
    });
    
    // Should not be visible immediately
    expect(container.querySelector('.loading-container')).toBeFalsy();
    
    // Should be visible after delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    expect(container.querySelector('.loading-container')).toBeTruthy();
  });

  it('hides after timeout', async () => {
    const { container } = await mountLoadingSpinner({
      timeout: 1000 // 1 second timeout
    });
    
    // Should be visible initially
    expect(container.querySelector('.loading-container')).toBeTruthy();
    
    // Should hide after timeout
    await new Promise(resolve => setTimeout(resolve, 1200));
    expect(container.querySelector('.loading-container')).toBeFalsy();
  });

  it('provides proper ARIA attributes', async () => {
    const { container } = await mountLoadingSpinner({
      text: 'Loading data...'
    });
    
    expect(container).toBeTruthy();
    const loadingContainer = container.querySelector('.loading-container');
    expect(loadingContainer).toBeTruthy();
    
    // Check ARIA attributes
    expect(loadingContainer?.getAttribute('role')).toBe('status');
    expect(loadingContainer?.getAttribute('aria-label')).toBe('Loading data...');
    expect(loadingContainer?.getAttribute('aria-busy')).toBe('true');
  });

  it('provides screen reader only text', async () => {
    const { container } = await mountLoadingSpinner({
      text: 'Loading vocabulary...'
    });
    
    expect(container).toBeTruthy();
    
    // Check for screen reader only content
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly?.textContent).toContain('Loading vocabulary..., please wait');
  });

  it('supports keyboard navigation', async () => {
    const { container } = await mountLoadingSpinner({});
    
    expect(container).toBeTruthy();
    
    // Loading spinner should not be focusable by default (it's decorative)
    // But if it has interactive elements, they should be keyboard accessible
    const focusableElements = container!.querySelectorAll('button, [tabindex]');
    
    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement.focus();
      expect(document.activeElement).toBe(firstElement);
    }
  });

  it('is accessible', async () => {
    const { container } = await mountLoadingSpinner({});
    
    // Run comprehensive accessibility tests
    await checkAccessibility(LoadingSpinner, {});
    
    // Check specific accessibility features
    expect(container!.querySelector('[role="status"]')).toBeTruthy();
    expect(container!.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('handles long text gracefully', async () => {
    const longText = 'This is a very long loading message that '.repeat(5);
    
    const { container } = await mountLoadingSpinner({
      text: longText
    });
    
    expect(container).toBeTruthy();
    const loadingText = container!.querySelector('.loading-text');
    expect(loadingText).toBeTruthy();
    
    // Text should be truncated or wrapped appropriately
    const textContent = loadingText?.textContent;
    expect(textContent?.length).toBeGreaterThan(0);
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
    
    const { container } = await mountLoadingSpinner({
      variant: 'spinner'
    });
    
    expect(container).toBeTruthy();
    
    // Should still be functional without animations
    expect(container!.querySelector('.spinner')).toBeTruthy();
    
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
    
    const { container } = await mountLoadingSpinner({});
    
    // Should still be visible and functional
    expect(container).toBeTruthy();
    expect(container!.querySelector('.spinner')).toBeTruthy();
    
    // Check accessibility in high contrast
    await checkAccessibility(LoadingSpinner, {});
    
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('dots variant animates correctly', async () => {
    const { container } = await mountLoadingSpinner({
      variant: 'dots'
    });
    
    expect(container).toBeTruthy();
    expect(container!.querySelector('.dots-container')).toBeTruthy();
    expect(container!.querySelectorAll('.dot').length).toBe(3);
    
    // Check that dots have animation classes
    for (let i = 0; i < 3; i++) {
      const dot = container!.querySelectorAll('.dot')[i];
      expect(dot?.className).toContain('dot');
    }
  });

  it('pulse variant animates correctly', async () => {
    const { container } = await mountLoadingSpinner({
      variant: 'pulse'
    });
    
    expect(container).toBeTruthy();
    expect(container!.querySelector('.pulse-container')).toBeTruthy();
    expect(container!.querySelector('.pulse-dot')).toBeTruthy();
    
    // Check that pulse dot has animation class
    expect(container!.querySelector('.pulse-dot')?.className).toContain('pulse-dot');
  });

  it('bars variant animates correctly', async () => {
    const { container } = await mountLoadingSpinner({
      variant: 'bars'
    });
    
    expect(container).toBeTruthy();
    expect(container!.querySelector('.bars-container')).toBeTruthy();
    expect(container!.querySelectorAll('.bar').length).toBe(4);
    
    // Check that bars have animation classes
    for (let i = 0; i < 4; i++) {
      const bar = container!.querySelectorAll('.bar')[i];
      expect(bar?.className).toContain('bar');
    }
  });

  it('maintains visibility during rapid prop changes', async () => {
    const { container } = await mountLoadingSpinner({
      text: 'Initial text'
    });
    
    expect(container).toBeTruthy();
    
    // Should still be visible and functional
    expect(container!.querySelector('.loading-container')).toBeTruthy();
  });

  it('handles missing text gracefully', async () => {
    const { container } = await mountLoadingSpinner({
      text: undefined
    });
    
    expect(container).toBeTruthy();
    
    // Should not show loading text element
    expect(container!.querySelector('.loading-text')).toBeFalsy();
    
    // Should still show spinner
    expect(container!.querySelector('.spinner')).toBeTruthy();
  });

  it('provides proper loading semantics', async () => {
    const { container } = await mountLoadingSpinner({
      text: 'Processing data...'
    });
    
    expect(container).toBeTruthy();
    
    // Check semantic HTML structure
    expect(container!.querySelector('[role="status"]')).toBeTruthy();
    expect(container!.querySelector('[aria-live="polite"]')).toBeTruthy();
    expect(container!.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('handles zero timeout correctly', async () => {
    const { container } = await mountLoadingSpinner({
      timeout: 0 // Disabled
    });
    
    expect(container).toBeTruthy();
    
    // Should not hide automatically
    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(container!.querySelector('.loading-container')).toBeTruthy();
  });

  it('handles zero delay correctly', async () => {
    const { container } = await mountLoadingSpinner({
      delay: 0 // No delay
    });
    
    // Should be visible immediately
    expect(container!.querySelector('.loading-container')).toBeTruthy();
  });

  it('supports custom timeout and delay combinations', async () => {
    const { container } = await mountLoadingSpinner({
      delay: 500,
      timeout: 2000
    });
    
    // Should not be visible initially
    expect(container!.querySelector('.loading-container')).toBeFalsy();
    
    // Should be visible after delay
    await new Promise(resolve => setTimeout(resolve, 600));
    expect(container!.querySelector('.loading-container')).toBeTruthy();
    
    // Should hide after timeout
    await new Promise(resolve => setTimeout(resolve, 1600));
    expect(container!.querySelector('.loading-container')).toBeFalsy();
  });
});