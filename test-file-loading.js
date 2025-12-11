// Simple test to check if the vocabulary file can be loaded
import { readFile } from 'fs/promises';
import path from 'path';

async function testFileLoading() {
  try {
    console.log('Testing vocabulary file loading...');
    
    const filePath = path.join(process.cwd(), 'src/lib/data/unified-vocabulary.json');
    console.log('File path:', filePath);
    
    const fileContent = await readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log('✅ File loaded successfully!');
    console.log(`Collection name: ${data.name}`);
    console.log(`Number of items: ${data.items.length}`);
    console.log(`Language pair: ${data.languagePair}`);
    console.log(`Categories: ${data.categories.join(', ')}`);
    
    // Test a few items
    console.log('\nSample items:');
    data.items.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.german} -> ${item.bulgarian} (Difficulty: ${item.difficulty})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to load file:', error.message);
    console.error(error);
    return false;
  }
}

// Run the test
testFileLoading().then(success => {
  process.exit(success ? 0 : 1);
});