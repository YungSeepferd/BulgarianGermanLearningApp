/**
 * Debug test for Flashcard component - Direct import approach
 * This test helps identify the root cause of rendering issues
 */

import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { defaultFlashcardProps } from './test-utils';

// Try importing the component directly instead of using dynamic import
import Flashcard from '$lib/components/Flashcard.svelte';

describe('Flashcard Debug Test - Direct Import', () => {
  test('direct import render test', async () => {
    try {
      console.log('Starting direct import render test...');
      console.log('Flashcard component:', Flashcard);
      
      // Check if we're in server environment
      console.log('Environment check:', {
        hasWindow: typeof window !== 'undefined',
        hasDocument: typeof document !== 'undefined',
        isServer: typeof window === 'undefined'
      });
      
      // Try to render directly
      console.log('Attempting direct render...');
      const result = render(Flashcard, { props: defaultFlashcardProps });
      
      console.log('Render result:', result);
      console.log('Component:', result.component);
      console.log('Container:', result.container);
      console.log('Container HTML:', result.container?.innerHTML || 'No container');
      
      // Wait a tick for component to mount
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('After tick - Container HTML:', result.container?.innerHTML || 'No container');
      
      // Check if component is actually rendered
      if (result.container) {
        const elements = result.container.querySelectorAll('*');
        console.log('Number of elements in container:', elements.length);
        for (const [i, el] of elements.entries()) {
          console.log(`Element ${i}:`, el.tagName, el.textContent?.trim());
        }
      }
      
      // Basic expectation
      expect(result.container).toBeDefined();
      
    } catch (error) {
      console.error('Error in direct import render test:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  });
});