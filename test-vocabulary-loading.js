// Test script to verify vocabulary loading functionality
import { loadVocabulary } from './src/lib/data/loader.js';

async function testVocabularyLoading() {
  try {
    console.log('Testing vocabulary loading...');
    
    const vocabulary = await loadVocabulary();
    
    console.log('✅ Vocabulary loaded successfully!');
    console.log(`Collection name: ${vocabulary.name}`);
    console.log(`Number of items: ${vocabulary.items.length}`);
    console.log(`Language pair: ${vocabulary.languagePair}`);
    console.log(`Categories: ${vocabulary.categories.join(', ')}`);
    
    // Test a few items
    console.log('\nSample items:');
    vocabulary.items.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.german} -> ${item.bulgarian} (Difficulty: ${item.difficulty})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to load vocabulary:', error.message);
    console.error(error);
    return false;
  }
}

// Run the test
testVocabularyLoading().then(success => {
  process.exit(success ? 0 : 1);
});