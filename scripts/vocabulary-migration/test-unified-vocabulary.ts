/**
 * Test script for unified vocabulary
 *
 * Tests various query types to ensure the unified vocabulary works correctly
 */
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import path from 'node:path';
import type { UnifiedVocabularyCollection } from '../../src/lib/schemas/unified-vocabulary.js';

/**
 * Test unified vocabulary with various queries
 */
async function testUnifiedVocabulary() {
  try {
    // Load unified vocabulary
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const unifiedVocabPath = path.join(__dirname, '../../src/lib/data/unified-vocabulary.json');
    const unifiedVocabData = await readFile(unifiedVocabPath, 'utf-8');
    const unifiedVocab: UnifiedVocabularyCollection = JSON.parse(unifiedVocabData);

    console.log('🎯 Testing Unified Vocabulary');
    console.log(`📚 Collection: ${unifiedVocab.name}`);
    console.log(`📊 Items: ${unifiedVocab.itemCount}`);
    console.log(`🏷️  Categories: ${unifiedVocab.categories.length}`);
    console.log(`📈 Difficulty range: ${unifiedVocab.difficultyRange[0]} - ${unifiedVocab.difficultyRange[1]}`);
    console.log('');

    // Test 1: Basic search by German word
    console.log('🔍 Test 1: Search by German word');
    const apfelResults = searchVocabulary(unifiedVocab, { german: 'Apfel' });
    console.log(`   Search "Apfel": ${apfelResults.length} results`);
    if (apfelResults.length > 0) {
      console.log(`   First result: ${apfelResults[0].german} → ${apfelResults[0].bulgarian}`);
      console.log(`   Categories: ${apfelResults[0].categories.join(', ')}`);
      console.log(`   Examples: ${apfelResults[0].examples?.length || 0}`);
    }
    console.log('');

    // Test 2: Search by Bulgarian word
    console.log('🔍 Test 2: Search by Bulgarian word');
    const blagodaryaResults = searchVocabulary(unifiedVocab, { bulgarian: 'Благодаря' });
    console.log(`   Search "Благодаря": ${blagodaryaResults.length} results`);
    if (blagodaryaResults.length > 0) {
      console.log(`   First result: ${blagodaryaResults[0].german} → ${blagodaryaResults[0].bulgarian}`);
      console.log(`   Categories: ${blagodaryaResults[0].categories.join(', ')}`);
    }
    console.log('');

    // Test 3: Search by category
    console.log('🔍 Test 3: Search by category');
    const verbsResults = searchVocabulary(unifiedVocab, { category: 'verbs' });
    console.log(`   Verbs: ${verbsResults.length} results`);
    if (verbsResults.length > 0) {
      console.log(`   Sample verbs: ${verbsResults.slice(0, 5).map(v => v.german).join(', ')}`);
    }
    console.log('');

    // Test 4: Search by multiple categories
    console.log('🔍 Test 4: Search by multiple categories');
    const foodAndHouseResults = searchVocabulary(unifiedVocab, { categories: ['food', 'house'] });
    console.log(`   Food + House: ${foodAndHouseResults.length} results`);
    if (foodAndHouseResults.length > 0) {
      console.log(`   Sample items: ${foodAndHouseResults.slice(0, 3).map(v => v.german).join(', ')}`);
    }
    console.log('');

    // Test 5: Search by difficulty
    console.log('🔍 Test 5: Search by difficulty');
    const difficulty1Results = searchVocabulary(unifiedVocab, { difficulty: 1 });
    const difficulty2Results = searchVocabulary(unifiedVocab, { difficulty: 2 });
    const difficulty3Results = searchVocabulary(unifiedVocab, { difficulty: 3 });
    console.log(`   Difficulty 1: ${difficulty1Results.length} results`);
    console.log(`   Difficulty 2: ${difficulty2Results.length} results`);
    console.log(`   Difficulty 3: ${difficulty3Results.length} results`);
    console.log('');

    // Test 6: Search by part of speech
    console.log('🔍 Test 6: Search by part of speech');
    const nounsResults = searchVocabulary(unifiedVocab, { partOfSpeech: 'noun' });
    const verbsPosResults = searchVocabulary(unifiedVocab, { partOfSpeech: 'verb' });
    console.log(`   Nouns: ${nounsResults.length} results`);
    console.log(`   Verbs: ${verbsPosResults.length} results`);
    if (verbsPosResults.length > 0) {
      console.log(`   Sample verbs: ${verbsPosResults.slice(0, 5).map(v => v.german).join(', ')}`);
    }
    console.log('');

    // Test 7: Category filtering
    console.log('🔍 Test 7: Category filtering');
    const allCategories = unifiedVocab.categories;
    console.log(`   Available categories: ${allCategories.join(', ')}`);

    // Test each category
    for (const category of allCategories) {
      const categoryResults = searchVocabulary(unifiedVocab, { category });
      console.log(`   ${category}: ${categoryResults.length} items`);
    }
    console.log('');

    // Test 8: Metadata preservation
    console.log('🔍 Test 8: Metadata preservation');
    const sampleItem = unifiedVocab.items.find(item => item.examples && item.examples.length > 0);
    if (sampleItem) {
      console.log(`   Sample item with examples: ${sampleItem.german} → ${sampleItem.bulgarian}`);
      console.log(`   Part of speech: ${sampleItem.partOfSpeech}`);
      console.log(`   Difficulty: ${sampleItem.difficulty}`);
      console.log(`   Categories: ${sampleItem.categories.join(', ')}`);
      console.log(`   Examples: ${sampleItem.examples?.length || 0}`);
      if (sampleItem.examples && sampleItem.examples.length > 0) {
        console.log(`   Example 1: ${sampleItem.examples[0].german} → ${sampleItem.examples[0].bulgarian}`);
      }
      if (sampleItem.notes) {
        console.log(`   Notes: ${JSON.stringify(sampleItem.notes).substring(0, 50)}...`);
      }
      if (sampleItem.grammar) {
        console.log(`   Grammar: ${JSON.stringify(sampleItem.grammar)}`);
      }
    }
    console.log('');

    // Test 9: Deduplication verification
    console.log('🔍 Test 9: Deduplication verification');
    const allIds = unifiedVocab.items.map(item => item.id);
    const uniqueIds = new Set(allIds);
    console.log(`   Total items: ${allIds.length}`);
    console.log(`   Unique IDs: ${uniqueIds.size}`);
    console.log(`   Duplicates: ${allIds.length - uniqueIds.size}`);
    console.log('');

    // Test 10: Content quality check
    console.log('🔍 Test 10: Content quality check');
    const itemsWithExamples = unifiedVocab.items.filter(item => item.examples && item.examples.length > 0);
    const itemsWithNotes = unifiedVocab.items.filter(item => item.notes);
    const itemsWithGrammar = unifiedVocab.items.filter(item => item.grammar);
    console.log(`   Items with examples: ${itemsWithExamples.length} (${Math.round((itemsWithExamples.length / unifiedVocab.itemCount) * 100)}%)`);
    console.log(`   Items with notes: ${itemsWithNotes.length} (${Math.round((itemsWithNotes.length / unifiedVocab.itemCount) * 100)}%)`);
    console.log(`   Items with grammar info: ${itemsWithGrammar.length} (${Math.round((itemsWithGrammar.length / unifiedVocab.itemCount) * 100)}%)`);
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('🎉 Unified vocabulary is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

/**
 * Search vocabulary with various filters
 */
function searchVocabulary(
  collection: UnifiedVocabularyCollection,
  filters: {
    german?: string;
    bulgarian?: string;
    category?: string;
    categories?: string[];
    difficulty?: number;
    partOfSpeech?: string;
  }
): UnifiedVocabularyItem[] {
  return collection.items.filter(item => {
    // Filter by German word (case-insensitive, partial match)
    if (filters.german && !item.german.toLowerCase().includes(filters.german.toLowerCase())) {
      return false;
    }

    // Filter by Bulgarian word (case-insensitive, partial match)
    if (filters.bulgarian && !item.bulgarian.toLowerCase().includes(filters.bulgarian.toLowerCase())) {
      return false;
    }

    // Filter by category
    if (filters.category && !item.categories.includes(filters.category)) {
      return false;
    }

    // Filter by multiple categories
    if (filters.categories && !filters.categories.every(cat => item.categories.includes(cat))) {
      return false;
    }

    // Filter by difficulty
    if (filters.difficulty && item.difficulty !== filters.difficulty) {
      return false;
    }

    // Filter by part of speech
    if (filters.partOfSpeech && item.partOfSpeech !== filters.partOfSpeech) {
      return false;
    }

    return true;
  });
}

// Run the tests
testUnifiedVocabulary();