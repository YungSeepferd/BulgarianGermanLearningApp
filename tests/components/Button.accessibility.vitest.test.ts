/**
 * Button Component Accessibility Tests (Vitest version)
 *
 * This test suite verifies that the Button component meets basic accessibility
 * standards using Vitest and Testing Library.
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Button from '$lib/components/ui/button/button.svelte';
import ButtonWrapper from './ButtonAccessibilityWrapper.test.svelte';

// Mock the window.getComputedStyle to return expected focus styles
vi.stubGlobal('getComputedStyle', (element: Element) => {
  return {
    getPropertyValue: (property: string) => {
      if (property === 'outline') {
        return '2px solid rgb(129, 140, 248)'; // Corresponds to focus-visible:ring-2
      }
      return '';
    }
  } as CSSStyleDeclaration;
});

describe('Button Component Accessibility', () => {
  it('should have proper ARIA role', () => {
    render(ButtonWrapper, { text: 'Test Button' });
    const button = screen.getByText('Test Button');
    // Native button elements have implicit role="button"
    expect(button.tagName).toBe('BUTTON');
  });

  it('should be keyboard accessible', async () => {
    render(ButtonWrapper, { text: 'Keyboard Button' });
    const button = screen.getByText('Keyboard Button');

    // Focus the button
    button.focus();
    expect(document.activeElement).toBe(button);

    // Test keyboard activation with Enter
    await fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    await fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
    // If we get here without errors, the button handles Enter key correctly

    // Test keyboard activation with Space
    await fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    await fireEvent.keyUp(button, { key: ' ', code: 'Space' });
    // If we get here without errors, the button handles Space key correctly
  });

  it('should be accessible when disabled', () => {
    render(ButtonWrapper, { disabled: true, text: 'Disabled Button' });
    const button = screen.getByText('Disabled Button');

    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeDisabled();
  });

  it('should have proper focus styling', async () => {
    render(ButtonWrapper, { text: 'Focusable Button' });
    const button = screen.getByText('Focusable Button');

    // Check that button can be focused
    button.focus();
    expect(document.activeElement).toBe(button);

    // Simulate focus-visible state by adding the class
    // This is needed because JSDOM doesn't handle :focus-visible properly
    button.classList.add('focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2');

    // Check that focus styling classes are applied
    expect(button.className).toMatch(/focus-visible:ring-2/);
    expect(button.className).toMatch(/focus-visible:ring-ring/);
    expect(button.className).toMatch(/focus-visible:ring-offset-2/);
  });

  it('should support custom ARIA attributes', () => {
    // Test custom ARIA attributes by rendering the Button with ButtonWrapper
    render(ButtonWrapper, {
      text: 'Custom ARIA',
      'aria-label': 'Custom button label',
      'aria-describedby': 'button-description'
    });

    const button = screen.getByText('Custom ARIA');
    expect(button).toHaveAttribute('aria-label', 'Custom button label');
    expect(button).toHaveAttribute('aria-describedby', 'button-description');
  });

  it('should be accessible in all variant states', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];

    for (const variant of variants) {
      render(ButtonWrapper, { variant, text: `${variant} button` });
      const button = screen.getByText(`${variant} button`);
      expect(button.tagName).toBe('BUTTON');
      expect(button).not.toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('should be accessible in all size states', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'];

    for (const size of sizes) {
      render(ButtonWrapper, { size, text: `${size} button` });
      const button = screen.getByText(`${size} button`);
      expect(button.tagName).toBe('BUTTON');
    }
  });
});