/**
 * Practice page load function - Server-side data loading for practice session
 * @description Handles server-side data loading and validation for practice sessions
 * @version 1.0.0
 * @updated November 2025
 */

import type { PageLoad } from './$types';
import type { PracticeSettings } from '$lib/types/index.js';
import { error } from '@sveltejs/kit';
import { validatePracticeSettings } from '$lib/utils/validation.js';

export const load: PageLoad = async ({ url }) => {
  try {
    // For static/prerendered sites, URL parameters are not available during build
    // We'll handle parameter validation on the client side instead
    
    // Return minimal data for static generation
    return {
      // Provide default settings that can be overridden by client-side logic
      settings: {
        direction: 'bg-de', // Default direction
        level: 'A1', // Default level
        category: 'all', // Default category
        limit: 10 // Default limit
      },
      // Indicate that this is a static build
      isStaticBuild: true,
      serverTimestamp: new Date().toISOString()
    };

  } catch (error_) {
    console.error('[Practice Page Load] Error:', error_);
    
    // Return a user-friendly error
    if (error_ instanceof Error) {
      throw error(500, `Failed to load practice session: ${error_.message}`);
    }
    
    throw error(500, 'An unexpected error occurred while loading the practice session');
  }
};