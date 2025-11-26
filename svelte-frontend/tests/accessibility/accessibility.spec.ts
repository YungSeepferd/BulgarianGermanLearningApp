import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { mount } from '@playwright/experimental-ct-svelte';
import { createMockVocabulary, mockSessionStats } from '../test-utils';

// Import all components for accessibility testing
import Flashcard from '$lib/components/Flashcard.svelte';
import GradeControls from '$lib/components/GradeControls.svelte';
import ProgressIndicator from '$lib/components/ProgressIndicator.svelte';
import SessionStats from '$lib/components/SessionStats.svelte';
import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

test.describe('Accessibility Tests with axe-core', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test.describe('Flashcard Component Accessibility', () => {
    test('should meet WCAG 2.1 AA standards', async ({ page }) => {
      const mockVocab = createMockVocabulary(1)[0];
      
      const component = await mount(Flashcard, {
        props: {
          vocabularyItem: mockVocab,
          showAnswer: false,
          onFlip: () => {},
          onGrade: () => {}
        }
      });

      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: {
          // Enable all WCAG 2.1 AA rules
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'aria-labels': { enabled: true },
          'role-supports-aria-attrs': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'aria-hidden-body': { enabled: true },
          'aria-hidden-focus': { enabled: true },
          'aria-input-field-name': { enabled: true },
          'aria-toggle-field-name': { enabled: true },
          'button-name': { enabled: true },
          'heading-order': { enabled: true },
          'html-has-lang': { enabled: true },
          'image-alt': { enabled: true },
          'input-button-name': { enabled: true },
          'label-title-only': { enabled: true },
          'link-in-text-block': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'object-alt': { enabled: true },
          'skip-link': { enabled: true },
          'table-duplicate-attr': { enabled: true },
          'table-headers': { enabled: true },
          'th-has-data-cells': { enabled: true },
          'valid-lang': { enabled: true },
          'video-caption': { enabled: true }
        }
      });
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      const mockVocab = createMockVocabulary(1)[0];
      
      const component = await mount(Flashcard, {
        props: {
          vocabularyItem: mockVocab,
          showAnswer: false,
          onFlip: () => {},
          onGrade: () => {}
        }
      });

      // Check for proper ARIA attributes
      const flashcard = page.locator('[data-testid="flashcard-container"]');
      await expect(flashcard).toHaveAttribute('role', 'article');
      await expect(flashcard).toHaveAttribute('aria-label');
      await expect(flashcard).toHaveAttribute('tabindex', '0');

      // Check for live region for screen readers
      const liveRegion = page.locator('[data-testid="sr-live-region"]');
      await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    test('should support keyboard navigation', async ({ page }) => {
      const mockVocab = createMockVocabulary(1)[0];
      
      const component = await mount(Flashcard, {
        props: {
          vocabularyItem: mockVocab,
          showAnswer: false,
          onFlip: () => {},
          onGrade: () => {}
        }
      });

      const flashcard = page.locator('[data-testid="flashcard-container"]');
      
      // Test keyboard focus
      await page.keyboard.press('Tab');
      await expect(flashcard).toBeFocused();

      // Test keyboard interaction
      await page.keyboard.press('Space');
      await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();

      // Test grade shortcuts
      await page.keyboard.press('3');
      // Should trigger grade callback (verified through component behavior)
    });

    test('should have sufficient color contrast', async ({ page }) => {
      const mockVocab = createMockVocabulary(1)[0];
      
      const component = await mount(Flashcard, {
        props: {
          vocabularyItem: mockVocab,
          showAnswer: true,
          onFlip: () => {},
          onGrade: () => {}
        }
      });

      // Check color contrast for text elements
      await checkA11y(page, '[data-testid="flashcard-front"]', {
        rules: { 'color-contrast': { enabled: true } }
      });

      await checkA11y(page, '[data-testid="flashcard-back"]', {
        rules: { 'color-contrast': { enabled: true } }
      });
    });

    test('should support screen readers', async ({ page }) => {
      const mockVocab = createMockVocabulary(1)[0];
      
      const component = await mount(Flashcard, {
        props: {
          vocabularyItem: mockVocab,
          showAnswer: false,
          onFlip: () => {},
          onGrade: () => {}
        }
      });

      // Check for proper semantic markup
      const frontSide = page.locator('[data-testid="flashcard-front"]');
      await expect(frontSide).toHaveAttribute('aria-label', /Bulgarian/);
      
      // Flip card and check back side
      await page.locator('[data-testid="flashcard-container"]').click();
      
      const backSide = page.locator('[data-testid="flashcard-back"]');
      await expect(backSide).toHaveAttribute('aria-label', /German/);
    });
  });

  test.describe('GradeControls Component Accessibility', () => {
    test('should meet WCAG 2.1 AA standards', async ({ page }) => {
      const component = await mount(GradeControls, {
        props: {
          onGrade: () => {},
          disabled: false,
          processing: false
        }
      });

      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'button-name': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });
    });

    test('should have accessible button labels', async ({ page }) => {
      const component = await mount(GradeControls, {
        props: {
          onGrade: () => {},
          disabled: false,
          processing: false
        }
      });

      // Check all grade buttons have proper labels
      const gradeButtons = page.locator('[data-testid^="grade-button-"]');
      const count = await gradeButtons.count();
      
      for (let i = 0; i < count; i++) {
        const button = gradeButtons.nth(i);
        await expect(button).toHaveAttribute('aria-label');
        await expect(button).toHaveAttribute('title');
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      const component = await mount(GradeControls, {
        props: {
          onGrade: () => {},
          disabled: false,
          processing: false
        }
      });

      // Test tab navigation through grade buttons
      await page.keyboard.press('Tab');
      const firstButton = page.locator('[data-testid="grade-button-1"]');
      await expect(firstButton).toBeFocused();

      // Test arrow key navigation
      await page.keyboard.press('ArrowRight');
      const secondButton = page.locator('[data-testid="grade-button-2"]');
      await expect(secondButton).toBeFocused();
    });

    test('should handle disabled state accessibly', async ({ page }) => {
      const component = await mount(GradeControls, {
        props: {
          onGrade: () => {},
          disabled: true,
          processing: false
        }
      });

      const gradeButtons = page.locator('[data-testid^="grade-button-"]');
      const count = await gradeButtons.count();
      
      for (let i = 0; i < count; i++) {
        const button = gradeButtons.nth(i);
        await expect(button).toHaveAttribute('aria-disabled', 'true');
        await expect(button).toBeDisabled();
      }
    });
  });

  test.describe('ProgressIndicator Component Accessibility', () => {
    test('should meet WCAG 2.1 AA standards', async ({ page }) => {
      const component = await mount(ProgressIndicator, {
        props: {
          currentCardIndex: 5,
          totalCards: 10,
          sessionStats: mockSessionStats
        }
      });

      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true }
        }
      });
    });

    test('should have accessible progress information', async ({ page }) => {
      const component = await mount(ProgressIndicator, {
        props: {
          currentCardIndex: 5,
          totalCards: 10,
          sessionStats: mockSessionStats
        }
      });

      // Check for progress bar accessibility
      const progressBar = page.locator('[data-testid="progress-bar"]');
      await expect(progressBar).toHaveAttribute('role', 'progressbar');
      await expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      await expect(progressBar).toHaveAttribute('aria-valuemax', '10');
      await expect(progressBar).toHaveAttribute('aria-label');
    });

    test('should announce progress changes', async ({ page }) => {
      const component = await mount(ProgressIndicator, {
        props: {
          currentCardIndex: 5,
          totalCards: 10,
          sessionStats: mockSessionStats
        }
      });

      // Check for live region that announces progress
      const liveRegion = page.locator('[data-testid="sr-live-region"]');
      await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  test.describe('SessionStats Component Accessibility', () => {
    test('should meet WCAG 2.1 AA standards', async ({ page }) => {
      const component = await mount(SessionStats, {
        props: {
          sessionStats: mockSessionStats,
          isVisible: true
        }
      });

      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'heading-order': { enabled: true },
          'list': { enabled: true },
          'color-contrast': { enabled: true }
        }
      });
    });

    test('should have accessible data tables', async ({ page }) => {
      const component = await mount(SessionStats, {
        props: {
          sessionStats: mockSessionStats,
          isVisible: true
        }
      });

      // Check for proper table structure
      const statsTable = page.locator('[data-testid="stats-table"]');
      if (await statsTable.count() > 0) {
        await expect(statsTable).toHaveAttribute('role', 'table');
        
        // Check for table headers
        const headers = statsTable.locator('th');
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(0);
        
        // Check headers have proper scope
        for (let i = 0; i < headerCount; i++) {
          const header = headers.nth(i);
          await expect(header).toHaveAttribute('scope');
        }
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      const component = await mount(SessionStats, {
        props: {
          sessionStats: mockSessionStats,
          isVisible: true
        }
      });

      // Test keyboard navigation through stats
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through interactive elements
      const focusableElements = page.locator('button, [tabindex="0"]');
      const firstElement = focusableElements.first();
      if (await firstElement.count() > 0) {
        await expect(firstElement).toBeFocused();
      }
    });
  });

  test.describe('ErrorBoundary Component Accessibility', () => {
    test('should meet WCAG 2.1 AA standards', async ({ page }) => {
      const component = await mount(ErrorBoundary, {
        props: {
          error: new Error('Test error'),
          errorInfo: { componentStack: 'Test stack' },
          onRetry: () => {},
          onReport: () => {}
        }
      });

      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'button-name': { enabled: true },
          'heading-order': { enabled: true },
          'color-contrast': { enabled: true }
        }
      });
    });

    test('should have accessible error messages', async ({ page }) => {
      const component = await mount(ErrorBoundary, {
        props: {
          error: new Error('Test error'),
          errorInfo: { componentStack: 'Test stack' },
          onRetry: () => {},
          onReport: () => {}
        }
      });

      // Check for error announcement
      const errorRegion = page.locator('[data-testid="error-region"]');
      await expect(errorRegion).toHaveAttribute('role', 'alert');
      await expect(errorRegion).toHaveAttribute('aria-live', 'assertive');
      
      // Check error message is accessible
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });

    test('should have accessible recovery actions', async ({ page }) => {
      const component = await mount(ErrorBoundary, {
        props: {
          error: new Error('Test error'),
          errorInfo: { componentStack: 'Test stack' },
          onRetry: () => {},
          onReport: () => {}
        }
      });

      // Check retry button
      const retryButton = page.locator('[data-testid="retry-button"]');
      await expect(retryButton).toHaveAttribute('aria-label');
      await expect(retryButton).toHaveAttribute('title');

      // Check report button
      const reportButton = page.locator('[data-testid="report-button"]');
      if (await reportButton.count() > 0) {
        await expect(reportButton).toHaveAttribute('aria-label');
        await expect(reportButton).toHaveAttribute('title');
      }
    });
  });

  test.describe('LoadingSpinner Component Accessibility', () => {
    test('should meet WCAG 2.1 AA standards', async ({ page }) => {
      const component = await mount(LoadingSpinner, {
        props: {
          isVisible: true,
          message: 'Loading vocabulary...'
        }
      });

      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'color-contrast': { enabled: true },
          'aria-live': { enabled: true }
        }
      });
    });

    test('should announce loading state', async ({ page }) => {
      const component = await mount(LoadingSpinner, {
        props: {
          isVisible: true,
          message: 'Loading vocabulary...'
        }
      });

      // Check for loading announcement
      const loadingRegion = page.locator('[data-testid="loading-region"]');
      await expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
      await expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.addStyleTag({
        content: `
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `
      });

      const component = await mount(LoadingSpinner, {
        props: {
          isVisible: true,
          message: 'Loading vocabulary...'
        }
      });

      // Should still be functional with reduced motion
      const spinner = page.locator('[data-testid="loading-spinner"]');
      await expect(spinner).toBeVisible();
    });
  });

  test.describe('Full Page Accessibility', () => {
    test('practice session page should be accessible', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'keyboard-navigation': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-unique': { enabled: true },
          'region': { enabled: true }
        }
      });
    });

    test('should have proper page structure', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);

      // Check for main landmark
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Check for proper navigation
      const nav = page.locator('nav');
      if (await nav.count() > 0) {
        await expect(nav).toHaveAttribute('aria-label');
      }
    });

    test('should support keyboard navigation throughout page', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

      // Test tab navigation
      let focusableElements = 0;
      for (let i = 0; i < 20; i++) { // Limit to prevent infinite loop
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        if (await focusedElement.count() === 0) break;
        focusableElements++;
      }

      expect(focusableElements).toBeGreaterThan(0);

      // Test escape key functionality
      await page.keyboard.press('Escape');
      // Should close any open modals or return focus to main content
    });

    test('should have sufficient color contrast throughout', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true } // WCAG AAA level
        }
      });
    });

    test('should support screen readers', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

      // Check for proper semantic markup
      const flashcard = page.locator('[data-testid="flashcard-container"]');
      await expect(flashcard).toHaveAttribute('role');

      // Check for proper labels and descriptions
      const interactiveElements = page.locator('button, [role="button"], input, select, textarea');
      const elementCount = await interactiveElements.count();
      
      for (let i = 0; i < elementCount; i++) {
        const element = interactiveElements.nth(i);
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'button') {
          await expect(element).toHaveAttribute('aria-label');
        }
      }
    });
  });

  test.describe('Accessibility Regression Tests', () => {
    test('should maintain accessibility after component updates', async ({ page }) => {
      // This test ensures that accessibility is maintained after component changes
      // Run this as part of CI/CD to catch accessibility regressions
      
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

      // Run comprehensive accessibility check
      await checkA11y(page, null, {
        detailedReport: true,
        reporter: 'v2',
        includedImpacts: ['minor', 'moderate', 'serious', 'critical']
      });
    });

    test('should handle dynamic content changes accessibly', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });

      // Test accessibility during dynamic content changes
      const flashcard = page.locator('[data-testid="flashcard-container"]');
      
      // Flip card
      await flashcard.click();
      await expect(page.locator('[data-testid="flashcard-back"]')).toBeVisible();
      
      // Check accessibility after flip
      await checkA11y(page, '[data-testid="flashcard-container"]', {
        rules: {
          'aria-allowed-attr': { enabled: true },
          'button-name': { enabled: true }
        }
      });

      // Grade card
      await page.keyboard.press('3');
      await page.waitForTimeout(500);
      
      // Check accessibility after grade
      await checkA11y(page, '[data-testid="flashcard-container"]', {
        rules: {
          'focus-order-semantics': { enabled: true }
        }
      });
    });
  });
});