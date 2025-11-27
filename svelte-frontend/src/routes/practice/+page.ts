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
    // Extract and validate practice settings from URL parameters
    const rawSettings: Record<string, string> = {};
    
    // Get all URL parameters
    for (const [key, value] of url.searchParams) {
      rawSettings[key] = value;
    }

    // Validate and parse settings
    const settings: PracticeSettings = validatePracticeSettings(rawSettings);

    // Validate that we have the required settings
    if (!settings.direction || !settings.level) {
      throw error(400, 'Invalid practice settings: direction and level are required');
    }

    // Return validated settings for the client
    return {
      settings,
      // Pass any additional server-side data needed
      serverTimestamp: new Date().toISOString()
      // You could pre-load some vocabulary here if needed
      // vocabulary: await loadVocabularyChunk(settings)
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