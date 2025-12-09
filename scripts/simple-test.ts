/**
 * Simple test for unified vocabulary import
 */
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

async function testImport() {
  try {
    console.log('🧪 Testing unified vocabulary import...');

    // Read the file directly
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = path.join(__dirname, '../src/lib/data/unified-vocabulary.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    console.log('✅ Import successful!');
    console.log('📚 Collection:', jsonData.name);
    console.log('📊 Items:', jsonData.itemCount);
    console.log('🏷️  Categories:', jsonData.categories.length);
    console.log('📈 Difficulty range:', jsonData.difficultyRange);

    // Test a few items
    console.log('\n🔹 Sample items:');
    for (let i = 0; i < 3; i++) {
      const item = jsonData.items[i];
      console.log(`   ${i+1}. ${item.german} → ${item.bulgarian} (${item.partOfSpeech}, ${item.difficulty})`);
      console.log(`      Categories: ${item.categories.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

testImport();