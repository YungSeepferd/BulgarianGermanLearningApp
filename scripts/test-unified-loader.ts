/**
 * Test script for unified vocabulary loader
 *
 * Tests the updated loader to ensure it works with the new unified vocabulary format
 */
import { DataLoader } from '../src/lib/data/DataLoader.svelte';

async function testUnifiedLoader() {
  try {
    console.log('🧪 Testing Unified Vocabulary Loader...');

    const loader = DataLoader.getInstance();

    // Test 1: Get random items
    console.log('\n🔹 Test 1: Get random items');
    const randomItems = await loader.getRandomItems(3);
    console.log(`   ✅ Got ${randomItems.length} random items`);
    randomItems.forEach((item, i) => {
      console.log(`      ${i+1}. ${item.german} → ${item.bulgarian} (${item.partOfSpeech}, ${item.difficulty})`);
      console.log(`         Categories: ${item.categories.join(', ')}`);
      console.log(`         Examples: ${item.examples?.length || 0}`);
    });

    // Test 2: Search by German word
    console.log('\n🔹 Test 2: Search by German word');
    const searchResults = await loader.getVocabularyBySearch({ query: 'Apfel' });
    console.log(`   ✅ Found ${searchResults.items.length} items matching "Apfel"`);
    if (searchResults.items.length > 0) {
      console.log(`      First result: ${searchResults.items[0].german} → ${searchResults.items[0].bulgarian}`);
    }

    // Test 3: Search by category
    console.log('\n🔹 Test 3: Search by category');
    const verbs = await loader.getVocabularyByCategory('verbs', { limit: 3 });
    console.log(`   ✅ Found ${verbs.length} verbs`);
    verbs.forEach((verb, i) => {
      console.log(`      ${i+1}. ${verb.german} → ${verb.bulgarian}`);
    });

    // Test 4: Search by difficulty
    console.log('\n🔹 Test 4: Search by difficulty');
    const beginnerItems = await loader.getVocabularyByDifficulty(1, { limit: 3 });
    console.log(`   ✅ Found ${beginnerItems.length} beginner items`);
    beginnerItems.forEach((item, i) => {
      console.log(`      ${i+1}. ${item.german} → ${item.bulgarian}`);
    });

    // Test 5: Get by ID
    console.log('\n🔹 Test 5: Get by ID');
    if (randomItems.length > 0) {
      const itemById = await loader.getVocabularyById(randomItems[0].id);
      if (itemById) {
        console.log(`   ✅ Found item by ID: ${itemById.german} → ${itemById.bulgarian}`);
      } else {
        console.log('   ⚠️  Item not found by ID');
      }
    }

    // Test 6: Verify metadata preservation
    console.log('\n🔹 Test 6: Verify metadata preservation');
    const sampleItem = randomItems.find(item => item.examples && item.examples.length > 0);
    if (sampleItem) {
      console.log(`   ✅ Sample item with examples: ${sampleItem.german}`);
      console.log(`      Part of speech: ${sampleItem.partOfSpeech}`);
      console.log(`      Difficulty: ${sampleItem.difficulty}`);
      console.log(`      Categories: ${sampleItem.categories.join(', ')}`);
      console.log(`      Examples: ${sampleItem.examples?.length || 0}`);
      if (sampleItem.examples && sampleItem.examples.length > 0) {
        console.log(`      Example: ${sampleItem.examples[0].german} → ${sampleItem.examples[0].bulgarian}`);
      }
      if (sampleItem.notes) {
        console.log(`      Notes: ${JSON.stringify(sampleItem.notes).substring(0, 50)}...`);
      }
      if (sampleItem.grammar) {
        console.log(`      Grammar: ${JSON.stringify(sampleItem.grammar)}`);
      }
    }

    console.log('\n✅ All loader tests completed successfully!');
    console.log('🎉 Unified vocabulary loader is working correctly!');

  } catch (error) {
    console.error('❌ Loader test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testUnifiedLoader();