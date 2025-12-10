import { correctPartOfSpeech } from './src/lib/utils/part-of-speech';
import { lessonGenerationEngine } from './src/lib/services/lesson-generation/lesson-generator';

// Test the correctPartOfSpeech utility
console.log('Testing correctPartOfSpeech utility:');
const testCases = [
  { input: 'noun', expected: 'Noun' },
  { input: 'verb', expected: 'Verb' },
  { input: 'adjective', expected: 'Adjective' },
  { input: 'adverb', expected: 'Adverb' },
  { input: 'pronoun', expected: 'Pronoun' },
  { input: 'interjection', expected: 'Interjection' },
  { input: 'numeral', expected: 'Numeral' },
  { input: 'phrase', expected: 'Phrase' }
];

for (const testCase of testCases) {
  const result = correctPartOfSpeech(testCase.input);
  const status = result === testCase.expected ? '✓' : '✗';
  console.log(`${status} ${testCase.input} → ${result} (expected: ${testCase.expected})`);
}

// Test the validatePartOfSpeech method
console.log('\nTesting validatePartOfSpeech method:');
const validateTestCases = [
  { id: 'zdravej_001', original: 'noun', expected: 'interjection' },
  { id: 'a1_question_001', original: 'noun', expected: 'pronoun' },
  { id: 'eins', original: 'noun', expected: 'numeral' },
  { id: 'guten_tag', original: 'noun', expected: 'phrase' }
];

for (const testCase of validateTestCases) {
  const result = lessonGenerationEngine['validatePartOfSpeech'](testCase.original, testCase.id);
  const status = result === testCase.expected ? '✓' : '✗';
  console.log(`${status} ${testCase.id}: ${testCase.original} → ${result} (expected: ${testCase.expected})`);
}

console.log('\n✅ Simple test completed!');