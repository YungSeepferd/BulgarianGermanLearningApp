import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read existing vocabulary
const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const newVocabPath = process.argv[2];

if (!newVocabPath) {
  console.error('Usage: node scripts/merge-manual-vocabulary.mjs <path-to-new-vocab>');
  process.exit(1);
}

console.log('📚 Manual Vocabulary Merge Script');
console.log('==================================================');

try {
  // Read existing vocabulary
  const existingVocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
  console.log(`✓ Loaded ${existingVocab.length} existing vocabulary items`);

  // Read new vocabulary
  const newVocab = JSON.parse(fs.readFileSync(newVocabPath, 'utf8'));
  console.log(`✓ Loaded ${newVocab.length} new vocabulary items`);

  // Find duplicates
  const existingGerman = new Set(existingVocab.map(v => v.german));
  const duplicates = newVocab.filter(v => existingGerman.has(v.german));
  const unique = newVocab.filter(v => !existingGerman.has(v.german));

  console.log(`\nDuplicate Detection:`);
  console.log(`  • Duplicates: ${duplicates.length} items`);
  if (duplicates.length > 0) {
    duplicates.slice(0, 5).forEach(v => {
      console.log(`    - ${v.german}`);
    });
    if (duplicates.length > 5) {
      console.log(`    ... and ${duplicates.length - 5} more`);
    }
  }
  console.log(`  • Unique: ${unique.length} items`);

  // Create backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, '../data/backups', `vocabulary-backup-${timestamp}.json`);
  fs.mkdirSync(path.join(__dirname, '../data/backups'), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(existingVocab, null, 2));
  console.log(`\n✓ Backup created: data/backups/vocabulary-backup-${timestamp}.json`);

  // Merge vocabularies
  const merged = [...existingVocab, ...unique];
  
  // Write merged vocabulary
  fs.writeFileSync(vocabPath, JSON.stringify(merged, null, 2));
  console.log(`\n✅ MERGE SUCCESSFUL`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Before: ${existingVocab.length} items`);
  console.log(`  Added:  ${unique.length} items`);
  console.log(`  After:  ${merged.length} items`);
  console.log(`  Growth: +${Math.round((unique.length / existingVocab.length) * 100)}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
