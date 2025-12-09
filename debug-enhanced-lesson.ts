/**
 * Debug script for EnhancedLessonService
 */

import { enhancedLessonService } from './src/lib/services/enhanced-lesson';
import { lessonGenerationEngine } from './src/lib/services/lesson-generation/lesson-generator';

async function debugEnhancedLesson() {
  console.log('Starting debug...');

  // Test initialization
  await enhancedLessonService.initialize();
  console.log('Service initialized:', enhancedLessonService.isInitialized());

  // Test lesson generation
  try {
    const params = {
      type: 'vocabulary',
      difficulty: 'A1',
      criteria: {
        categories: ['home']
      }
    };

    console.log('Calling generateDynamicLesson with params:', params);

    const result = await enhancedLessonService.generateDynamicLesson(params);

    console.log('Result:', result);
    console.log('Result type:', typeof result);
    console.log('Result is defined:', result !== undefined);

    if (result) {
      console.log('Result id:', result.id);
      console.log('Result title:', result.title);
    }

  } catch (error) {
    console.error('Error in generateDynamicLesson:', error);
  }
}

debugEnhancedLesson();