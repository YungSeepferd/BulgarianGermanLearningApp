/**
 * Debug test for Flashcard component
 * This test helps identify the root cause of rendering issues
 */

import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { defaultFlashcardProps } from './test-utils';

describe('Flashcard Debug Test', () => {
  test('direct render test', async () => {
    try {
      console.log('Starting direct render test...');
      
      // Import the component directly
      const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
      console.log('Flashcard component imported successfully:', Flashcard);
      
      // Try to render directly without safeRender wrapper
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
      console.error('Error in direct render test:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  });
});