/**
 * Svelte 5 Test Utilities
 * @file tests/svelte5-test-utils.ts
 * @description Testing utilities for Svelte 5 components using proper mount/unmount APIs
 * @version 2.0.0
 * @updated December 2025
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { mount, unmount, flushSync } from 'svelte';
import { expect, vi, beforeEach } from 'vitest';
import type { ComponentType } from 'svelte';
import type { VocabularyItem } from '$lib/types/index.js';

// Mock vocabulary item for testing
export const mockVocabularyItem: VocabularyItem = {
  id: 'test-1',
  word: 'здравей',
  translation: 'hallo',
  source_lang: 'bg',
  target_lang: 'de',
  category: 'greetings',
  level: 'A1',
  notes: 'Test notes',
  notes_bg_to_de: 'BG to DE notes',
  notes_de_to_bg: null,
  etymology: 'Test etymology',
  cultural_note: 'Test cultural note',
  examples: [
    { sentence: 'Здравей, как си?', translation: 'Hallo, wie geht es dir?', context: 'greeting' }
  ],
  audio_url: '/audio/zdravay.mp3',
  difficulty: 1,
  frequency: 50,
  linguistic_note_bg_to_de: 'Test linguistic note BG-DE',
  linguistic_note_de_to_bg: null,
  linguistic_note: 'Test linguistic note'
};

/**
 * Mount a Svelte 5 component using Testing Library
 */
export async function renderComponent<T extends ComponentType>(
  component: T,
  options: {
    props?: Record<string, any>;
    target?: HTMLElement;
  } = {}
) {
  const { props = {}, target = document.body } = options;
  
  const result = render(component, {
    props,
    target
  });
  
  return result;
}

/**
 * Mount a Svelte 5 component using Svelte's mount API (for low-level testing)
 */
export function mountSvelteComponent<T extends ComponentType>(
  component: T,
  options: {
    props?: Record<string, any>;
    target?: HTMLElement;
  } = {}
) {
  const { props = {}, target = document.body } = options;
  
  const instance = mount(component, {
    target,
    props
  });
  
  return {
    component: instance,
    unmount: () => unmount(instance),
    target
  };
}

/**
 * Mount Flashcard component with default props
 */
export async function mountFlashcard(options: {
  vocabularyItem?: VocabularyItem;
  direction?: 'bg-de' | 'de-bg';
  showProgress?: boolean;
  onGrade?: (grade: number, state: any) => void;
  onNext?: () => void;
} = {}) {
  const { vocabularyItem = mockVocabularyItem, ...props } = options;
  
  // Dynamic import to avoid SSR issues
  const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
  
  return await renderComponent(Flashcard, {
    props: {
      vocabularyItem,
      ...props
    }
  });
}

/**
 * Setup user event for testing
 */
export function setupUserEvent() {
  return userEvent.setup();
}

/**
 * Simulate click event
 */
export async function simulateClick(element: HTMLElement) {
  const user = setupUserEvent();
  await user.click(element);
}

/**
 * Simulate key press event
 */
export async function simulateKeyPress(element: HTMLElement, key: string) {
  const user = setupUserEvent();
  await user.keyboard(key);
}

/**
 * Flush Svelte reactivity
 */
export function flushAndWait(fn?: () => void) {
  flushSync(fn);
}

/**
 * Clean up test environment
 */
export function cleanup() {
  // Clean up DOM
  document.body.innerHTML = '';
  
  // Clear all mocks
  vi.clearAllMocks();
}

/**
 * Wait for element to appear (alternative to waitFor to avoid mock issues)
 */
export async function waitForElement(
  query: () => HTMLElement,
  options: { timeout?: number } = { timeout: 5000 }
): Promise<HTMLElement> {
  const { timeout = 5000 } = options;
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        const element = query();
        if (element) {
          resolve(element);
          return;
        }
      } catch (error) {
        // Element not found, continue waiting
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element not found within ${timeout}ms`));
        return;
      }
      
      setTimeout(check, 50);
    };
    
    check();
  });
}

/**
 * Wait for text to appear
 */
export async function waitForText(
  text: string,
  options: { timeout?: number } = { timeout: 5000 }
): Promise<HTMLElement> {
  return waitForElement(() => screen.getByText(text), options);
}

/**
 * Wait for test ID to appear
 */
export async function waitForTestId(
  testId: string,
  options: { timeout?: number } = { timeout: 5000 }
): Promise<HTMLElement> {
  return waitForElement(() => screen.getByTestId(testId), options);
}

// Re-export Testing Library utilities
export { screen, fireEvent } from '@testing-library/svelte';
export { userEvent };

// Re-export Vitest utilities
export { expect, vi, beforeEach, afterEach, describe, test } from 'vitest';