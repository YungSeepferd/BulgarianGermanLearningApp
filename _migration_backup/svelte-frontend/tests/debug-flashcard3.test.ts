/**
 * Debug test for Flashcard component - Browser environment approach
 * This test ensures client-side rendering by checking browser environment
 */

import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { defaultFlashcardProps } from './test-utils';
import { browser } from '$app/environment';

describe('Flashcard Debug Test - Browser Environment', () => {
  test('browser environment render test', async () => {
    try {
      console.log('Starting browser environment render test...');
      console.log('Browser environment:', browser);
      
      // Check if we're in browser environment
      if (!browser) {
        console.error('NOT IN BROWSER ENVIRONMENT - this is the problem!');
        console.error('Current environment:', {
          hasWindow: typeof window !== 'undefined',
          hasDocument: typeof document !== 'undefined',
          browser: browser
        });
        
        // Try to force browser environment
        console.log('Attempting to force browser environment...');
        // We need to ensure the component is loaded in client mode
      }

      // Import the component with browser check
      console.log('Importing Flashcard component...');
      const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
      console.log('Flashcard component imported successfully:', Flashcard);
      
      // Try to render directly
      console.log('Attempting render with browser environment:', browser);
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
      console.error('Error in browser environment render test:', error);
      console.error('Error stack:', (error as any).stack);

      // Check if it's the server-side rendering error
      if ((error as any).message.includes('lifecycle_function_unavailable') ||
          (error as any).message.includes('mount(...) is not available on the server')) {
        console.error('SERVER-SIDE RENDERING ERROR DETECTED');
        console.error('The component is being loaded in server mode instead of client mode');
        console.error('This is likely a SvelteKit testing configuration issue');
      }
      
      throw error;
    }
  });
});