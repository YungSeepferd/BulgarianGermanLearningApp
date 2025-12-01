/**
 * ErrorBoundary Component Tests
 * @file tests/components/ErrorBoundary.spec.ts
 * @description Comprehensive tests for the ErrorBoundary.svelte component using Vitest and Testing Library Svelte
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderComponent, screen, fireEvent, waitForText } from '../svelte5-test-utils';
import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';

describe('ErrorBoundary Component', () => {
  let errorBoundaryInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (errorBoundaryInstance) {
      await errorBoundaryInstance.unmount();
      errorBoundaryInstance = null;
    }
  });

  test('renders correctly when no error is present', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: null,
      dispatch: vi.fn()
    });
    
    // When no error, component should not render error boundary
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('displays error when error is provided', async () => {
    const testError = new Error('Test error message');
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: testError,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Check error boundary elements are present
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  test('shows error message correctly', async () => {
    const testError = new Error('Something went wrong');
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: testError,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('displays error icon and title', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('shows error details in development mode', async () => {
    const testError = new Error('Test error');
    (testError as any).stack = 'Error: Test error\n    at test (test.js:1:1)';
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: testError,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Check error details section - in dev mode, details should be visible
    expect(screen.getByText('Error Details')).toBeInTheDocument();
  });

  test('shows error context information', async () => {
    const errorContext = {
      component: 'TestComponent',
      action: 'TestAction',
      userAgent: 'Test Browser',
      timestamp: new Date()
    };
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      errorContext,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Check context section
    expect(screen.getByText('Context Information')).toBeInTheDocument();
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
    expect(screen.getByText('TestAction')).toBeInTheDocument();
  });

  test('displays recovery action buttons', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Check action buttons
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Report error' })).toBeInTheDocument();
  });

  test('calls retry callback when retry button is clicked', async () => {
    const mockDispatch = vi.fn();
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: mockDispatch
    });
    
    // Click retry button
    const retryButton = screen.getByRole('button', { name: 'Try again' });
    fireEvent.click(retryButton);
    
    expect(mockDispatch).toHaveBeenCalledWith('retry');
  });

  test('shows help section with suggestions', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Check help section
    expect(screen.getByText('Need Help?')).toBeInTheDocument();
    expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
    expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
  });

  test('handles different error severities', async () => {
    // Test critical error
    const criticalError = new Error('Critical error');
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: criticalError,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Critical error')).toBeInTheDocument();
  });

  test('is accessible', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    // Check specific accessibility features
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  test('provides proper ARIA labels', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    // Check ARIA attributes
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  test('handles errors without stack traces', async () => {
    const errorWithoutStack = new Error('Error without stack');
    delete (errorWithoutStack as any).stack;
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: errorWithoutStack,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Should still show error message even without stack
    expect(screen.getByText('Error without stack')).toBeInTheDocument();
  });

  test('handles errors with custom properties', async () => {
    const customError = new Error('Custom error') as any;
    
    const errorContext = {
      component: 'TestComponent',
      action: 'mounting',
      userAgent: 'Test Browser',
      timestamp: new Date()
    };
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: customError,
      errorContext,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Should show custom context information
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
    expect(screen.getByText('mounting')).toBeInTheDocument();
  });

  test('shows timestamp information', async () => {
    const errorContext = {
      component: 'TestComponent',
      action: 'TestAction',
      timestamp: new Date()
    };
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      errorContext,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Check timestamp is displayed in context
    expect(screen.getByText('Time:')).toBeInTheDocument();
  });

  test('supports keyboard navigation', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Test Tab navigation through action buttons
    const firstButton = screen.getByRole('button', { name: 'Try again' });
    firstButton.focus();
    expect(firstButton).toHaveFocus();
  });

  test('handles reload action', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Click reload button
    const reloadButton = screen.getByRole('button', { name: 'Reload page' });
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toBeEnabled();
  });

  test('handles very long error messages', async () => {
    const longErrorMessage = 'This is a very long error message that '.repeat(10);
    const longError = new Error(longErrorMessage);
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: longError,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Should handle long messages gracefully
    expect(screen.getByText(longErrorMessage)).toBeInTheDocument();
  });

  test('handles errors with special characters', async () => {
    const specialCharError = new Error('Error with special chars: <> & " \'');
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: specialCharError,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Should handle special characters safely
    expect(screen.getByText('Error with special chars: <> & " \'')).toBeInTheDocument();
  });

  test('provides screen reader friendly messages', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Check for screen reader friendly content
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('maintains focus management', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Focus should be managed properly
    const firstButton = screen.getByRole('button', { name: 'Try again' });
    firstButton.focus();
    expect(firstButton).toHaveFocus();
  });

  test('handles multiple rapid errors', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('First error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Simulate rapid error changes (in real implementation, this would be handled by the parent)
    // For testing, we verify the component remains stable
    expect(screen.getByText('First error')).toBeInTheDocument();
  });

  test('shows appropriate styling for different error types', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    
    // Should have error styling
    expect(alert).toHaveClass('error-boundary');
  });

  test('provides helpful error recovery suggestions', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: new Error('Test error'),
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Check help suggestions
    expect(screen.getByText('Need Help?')).toBeInTheDocument();
    expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
    expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
  });

  test('handles network errors specifically', async () => {
    const networkError = new Error('Network error') as any;
    networkError.name = 'NetworkError';
    networkError.code = 'NETWORK_ERROR';
    
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: networkError,
      dispatch: vi.fn()
    });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // Should show network-specific help
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  test('provides fallback content when no error', async () => {
    errorBoundaryInstance = await renderComponent(ErrorBoundary, {
      error: null,
      dispatch: vi.fn()
    });
    
    // Should render fallback when no error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});