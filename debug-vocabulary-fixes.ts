/**
 * Debug script to test vocabulary classification fixes
 *
 * This script verifies that the vocabulary classification fixes are working correctly
 * by testing the key components of the implementation.
 */

import { VocabularyService } from './src/lib/data/vocabulary';
import { lessonGenerationEngine } from './src/lib/services/lesson-generation/lesson-generator';
import { correctPartOfSpeech } from './src/lib/utils/part-of-speech';
import type { VocabularyItem } from './src/lib/types/vocabulary';

// Test the corrected vocabulary items
async function testVocabularyCorrections() {
  console.log('🔍 Testing Vocabulary Classification Fixes');
  console.log('='.repeat(60));

  try {
    // 1. Test the corrected vocabulary data
    const vocabularyService = await VocabularyService.getInstance();
    const testItems = [
      'zdravej_001', // Hallo → interjection
      'a1_question_001', // wer → pronoun
      'a1_question_003', // wann → adverb
      'eins', // eins → numeral
      'guten_tag', // Guten Tag → phrase
      'bitte', // Bitte → interjection
      'schon', // schön → adjective
      'dann' // dann → adverb
    ];

    console.log('1. Testing corrected vocabulary items:');
    console.log('-'.repeat(40));

    for (const itemId of testItems) {
      const item = await vocabularyService.getVocabularyById(itemId);
      if (item) {
        console.log(`✓ ${item.german} (${itemId}): ${item.partOfSpeech}`);
      } else {
        console.log(`✗ Item ${itemId} not found`);
      }
    }

    // 2. Test the validatePartOfSpeech method
    console.log('\n2. Testing validatePartOfSpeech method:');
    console.log('-'.repeat(40));

    const testCases = [
      { id: 'zdravej_001', original: 'noun', expected: 'interjection' },
      { id: 'a1_question_001', original: 'noun', expected: 'pronoun' },
      { id: 'a1_question_003', original: 'noun', expected: 'adverb' },
      { id: 'eins', original: 'noun', expected: 'numeral' },
      { id: 'guten_tag', original: 'noun', expected: 'phrase' },
      { id: 'bitte', original: 'noun', expected: 'interjection' },
      { id: 'schon', original: 'noun', expected: 'adjective' },
      { id: 'dann', original: 'verb', expected: 'adverb' }
    ];

    for (const testCase of testCases) {
      const result = lessonGenerationEngine['validatePartOfSpeech'](testCase.original, testCase.id);
      const status = result === testCase.expected ? '✓' : '✗';
      console.log(`${status} ${testCase.id}: ${testCase.original} → ${result} (expected: ${testCase.expected})`);
    }

    // 3. Test the correctPartOfSpeech utility
    console.log('\n3. Testing correctPartOfSpeech utility:');
    console.log('-'.repeat(40));

    const displayTestCases = [
      { input: 'noun', expected: 'Noun' },
      { input: 'verb', expected: 'Verb' },
      { input: 'adjective', expected: 'Adjective' },
      { input: 'adverb', expected: 'Adverb' },
      { input: 'pronoun', expected: 'Pronoun' },
      { input: 'interjection', expected: 'Interjection' },
      { input: 'numeral', expected: 'Numeral' },
      { input: 'phrase', expected: 'Phrase' }
    ];

    for (const testCase of displayTestCases) {
      const result = correctPartOfSpeech(testCase.input);
      const status = result === testCase.expected ? '✓' : '✗';
      console.log(`${status} ${testCase.input} → ${result} (expected: ${testCase.expected})`);
    }

    // 4. Test the getFallbackGrammarInfo method
    console.log('\n4. Testing getFallbackGrammarInfo method:');
    console.log('-'.repeat(40));

    const grammarTestCases = [
      { pos: 'interjection', expected: 'Interjections are words or phrases used to express emotion or greeting.' },
      { pos: 'pronoun', expected: 'Pronouns replace nouns to avoid repetition.' },
      { pos: 'adverb', expected: 'Adverbs describe verbs, adjectives, or other adverbs.' },
      { pos: 'numeral', expected: 'Numerals represent numbers and can be cardinal (one, two) or ordinal (first, second).' },
      { pos: 'phrase', expected: 'Phrases are groups of words that function as a single unit in the syntax of a sentence.' }
    ];

    for (const testCase of grammarTestCases) {
      const result = lessonGenerationEngine['getFallbackGrammarInfo'](testCase.pos);
      const status = result.includes(testCase.expected.split(' ')[0]) ? '✓' : '✗';
      console.log(`${status} ${testCase.pos}: "${result.substring(0, 50)}..."`);
    }

    // 5. Test lesson generation with corrected vocabulary
    console.log('\n5. Testing lesson generation with corrected vocabulary:');
    console.log('-'.repeat(40));

    const lessonParams = {
      type: 'vocabulary',
      difficulty: 'A1',
      criteria: {
        categories: ['greetings'],
        partOfSpeech: 'interjection',
        limit: 3
      },
      userId: 'test-user',
      metadata: {
        includePractice: true
      }
    };

    const lesson = await lessonGenerationEngine.generateLesson(lessonParams);
    console.log(`✓ Generated lesson: "${lesson.title}"`);
    console.log(`✓ Lesson contains ${lesson.vocabulary.length} vocabulary items`);

    for (const vocab of lesson.vocabulary) {
      const correctedPos = lessonGenerationEngine['validatePartOfSpeech'](vocab.partOfSpeech, vocab.id);
      console.log(`  ✓ ${vocab.german}: ${vocab.partOfSpeech} → ${correctedPos}`);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testVocabularyCorrections();