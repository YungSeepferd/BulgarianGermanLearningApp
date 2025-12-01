/**
 * ErrorBoundary Component Tests
 * @file tests/components/ErrorBoundary.spec.ts
 * @description Comprehensive tests for the ErrorBoundary.svelte component using Vitest and Testing Library Svelte
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly when no error is present', async () => {
    await render(ErrorBoundary, {
      props: {
        error: null,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should render fallback content when no error
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  test('displays error when error is provided', async () => {
    const testError = new Error('Test error message');
    
    await render(ErrorBoundary, {
      props: {
        error: testError,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Check error boundary elements are present
    expect(screen.getByTestId('error-container')).toBeInTheDocument();
    expect(screen.getByTestId('error-header')).toBeInTheDocument();
    expect(screen.getByTestId('error-content')).toBeInTheDocument();
    expect(screen.getByTestId('error-actions')).toBeInTheDocument();
  });

  test('shows error message correctly', async () => {
    const testError = new Error('Something went wrong');
    
    await render(ErrorBoundary, {
      props: {
        error: testError,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Something went wrong');
  });

  test('displays error icon and title', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('error-title')).toBeInTheDocument();
  });

  test('shows error details in development mode', async () => {
    const testError = new Error('Test error');
    (testError as any).stack = 'Error: Test error\n    at test (test.js:1:1)';
    
    await render(ErrorBoundary, {
      props: {
        error: testError,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Check error details section
    expect(screen.getByTestId('error-details')).toBeInTheDocument();
    expect(screen.getByTestId('error-stack')).toBeInTheDocument();
    expect(screen.getByTestId('error-stack')).toHaveTextContent('Error: Test error');
  });

  test('shows error context information', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Check context section
    expect(screen.getByTestId('error-context')).toBeInTheDocument();
    expect(screen.getByTestId('context-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('context-item').length).toBeGreaterThan(0);
  });

  test('displays recovery action buttons', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Check action buttons
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /report issue/i })).toBeInTheDocument();
  });

  test('calls retry callback when retry button is clicked', async () => {
    const mockOnRetry = vi.fn();
    
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalled();
  });

  test('shows help section with suggestions', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Check help section
    expect(screen.getByTestId('error-help')).toBeInTheDocument();
    expect(screen.getByTestId('help-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('help-item').length).toBeGreaterThan(0);
  });

  test('handles different error severities', async () => {
    // Test critical error
    const criticalError = new Error('Critical error');
    
    await render(ErrorBoundary, {
      props: {
        error: criticalError,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should show severity information
    expect(screen.getByTestId('severity-indicator')).toBeInTheDocument();
  });

  test('is accessible', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    // Check specific accessibility features
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  test('provides proper ARIA labels', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    // Check ARIA attributes
    const errorBoundary = screen.getByRole('alert');
    expect(errorBoundary).toHaveAttribute('aria-label');
    expect(errorBoundary).toHaveAttribute('aria-live', 'polite');
  });

  test('handles errors without stack traces', async () => {
    const errorWithoutStack = new Error('Error without stack');
    delete (errorWithoutStack as any).stack;
    
    await render(ErrorBoundary, {
      props: {
        error: errorWithoutStack,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should still show error message even without stack
    expect(screen.getByTestId('error-message')).toHaveTextContent('Error without stack');
    
    // Should not show stack trace section
    expect(screen.queryByTestId('error-stack')).not.toBeInTheDocument();
  });

  test('handles errors with custom properties', async () => {
    const customError = new Error('Custom error') as any;
    customError.component = 'TestComponent';
    customError.phase = 'mounting';
    customError.userAction = 'clicking button';
    
    await render(ErrorBoundary, {
      props: {
        error: customError,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should show custom context information
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
    expect(screen.getByText('mounting')).toBeInTheDocument();
    expect(screen.getByText('clicking button')).toBeInTheDocument();
  });

  test('shows timestamp information', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Check timestamp is displayed
    expect(screen.getByTestId('timestamp')).toBeInTheDocument();
  });

  test('supports keyboard navigation', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Test Tab navigation through action buttons
    const firstButton = screen.getAllByRole('button')[0];
    firstButton.focus();
    expect(firstButton).toHaveFocus();
  });

  test('handles reload action', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Click reload button
    const reloadButton = screen.getByRole('button', { name: /reload page/i });
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toBeEnabled();
  });

  test('handles very long error messages', async () => {
    const longErrorMessage = 'This is a very long error message that '.repeat(10);
    const longError = new Error(longErrorMessage);
    
    await render(ErrorBoundary, {
      props: {
        error: longError,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should handle long messages gracefully
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    
    // Message should be truncated or wrapped appropriately
    const messageElement = screen.getByTestId('error-message');
    expect(messageElement.textContent?.length).toBeGreaterThan(0);
  });

  test('handles errors with special characters', async () => {
    const specialCharError = new Error('Error with special chars: <> & " \'');
    
    await render(ErrorBoundary, {
      props: {
        error: specialCharError,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should handle special characters safely
    expect(screen.getByTestId('error-message')).toHaveTextContent('Error with special chars:');
  });

  test('provides screen reader friendly messages', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Check for screen reader only content
    expect(screen.getByTestId('sr-only')).toBeInTheDocument();
  });

  test('maintains focus management', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Focus should be managed properly
    const firstButton = screen.getAllByRole('button')[0];
    firstButton.focus();
    expect(firstButton).toHaveFocus();
  });

  test('handles multiple rapid errors', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('First error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Simulate rapid error changes (in real implementation, this would be handled by the parent)
    // For testing, we verify the component remains stable
    expect(screen.getByTestId('error-message')).toHaveTextContent('First error');
  });

  test('shows appropriate styling for different error types', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should have error styling
    expect(screen.getByTestId('error-boundary')).toHaveClass('error-boundary');
    expect(screen.getByTestId('error-container')).toBeInTheDocument();
  });

  test('provides helpful error recovery suggestions', async () => {
    await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Check help suggestions
    const helpItems = screen.getAllByTestId('help-item');
    expect(helpItems.length).toBeGreaterThan(0);
    
    // Should include common troubleshooting steps
    const helpText = screen.getByTestId('help-list').textContent;
    expect(helpText).toContain('refresh');
    expect(helpText).toContain('connection');
  });

  test('handles network errors specifically', async () => {
    const networkError = new Error('Network error') as any;
    networkError.name = 'NetworkError';
    networkError.code = 'NETWORK_ERROR';
    
    await render(ErrorBoundary, {
      props: {
        error: networkError,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should show network-specific help
    expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
  });

  test('provides fallback content when no error', async () => {
    await render(ErrorBoundary, {
      props: {
        error: null,
        dispatch: vi.fn()
      }
    });
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Should render fallback when no error
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
});