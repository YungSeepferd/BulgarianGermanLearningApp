#!/usr/bin/env node

/**
 * Vocabulary Merge Script
 * Merges extracted vocabulary with existing database
 * 
 * Usage: node scripts/merge-vocabulary.mjs [--input extracted-vocabulary.json] [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ENRICHMENT_DIR = path.join(__dirname, '../data/vocab/enrichment-output');
const VOCAB_PATH = path.join(__dirname, '../data/unified-vocabulary.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  input: 'extracted-vocabulary.json',
  dryRun: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' && args[i + 1]) {
    options.input = args[i + 1];
    i++;
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  }
}

console.log(`${colors.blue}🔗 Vocabulary Merge Script${colors.reset}`);
console.log('='.repeat(50));
console.log(`Input: ${options.input}`);
console.log(`Mode: ${options.dryRun ? 'DRY RUN (no changes)' : 'LIVE (will modify database)'}`);
console.log('');

// Create backup
function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `vocabulary-backup-${timestamp}.json`);
  
  if (fs.existsSync(VOCAB_PATH)) {
    fs.copyFileSync(VOCAB_PATH, backupPath);
    console.log(`${colors.green}✓${colors.reset} Backup created: ${backupPath}`);
    return backupPath;
  }
  
  return null;
}

// Load vocabulary files
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Could not load ${filePath}`);
    return null;
  }
}

// Validate vocabulary item
function validateItem(item) {
  const required = ['id', 'german', 'bulgarian', 'partOfSpeech', 'cefr'];
  const missing = required.filter(field => !item[field]);
  
  if (missing.length > 0) {
    return { valid: false, errors: [`Missing fields: ${missing.join(', ')}`] };
  }
  
  // Check examples
  if (!item.examples || item.examples.length === 0) {
    return { valid: false, errors: ['Missing examples'] };
  }
  
  return { valid: true, errors: [] };
}

// Check for duplicates
function findDuplicates(newItem, existing) {
  return existing.filter(v => 
    v.german.toLowerCase() === newItem.german.toLowerCase() ||
    v.bulgarian.toLowerCase() === newItem.bulgarian.toLowerCase()
  );
}

// Merge vocabularies
function mergeVocabularies(existing, newItems) {
  const merged = Array.isArray(existing) ? [...existing] : [];
  const stats = {
    total: newItems.length,
    added: 0,
    duplicates: 0,
    invalid: 0,
    errors: []
  };
  
  for (const item of newItems) {
    // Validate
    const validation = validateItem(item);
    if (!validation.valid) {
      stats.invalid++;
      stats.errors.push({
        item: `${item.german} → ${item.bulgarian}`,
        errors: validation.errors
      });
      continue;
    }
    
    // Check duplicates
    const duplicates = findDuplicates(item, merged);
    if (duplicates.length > 0) {
      stats.duplicates++;
      console.log(`${colors.yellow}⚠${colors.reset} Duplicate: ${item.german} (already exists)`);
      continue;
    }
    
    // Add to merged
    merged.push(item);
    stats.added++;
    console.log(`${colors.green}+${colors.reset} Added: ${item.german} → ${item.bulgarian}`);
  }
  
  return { merged, stats };
}

// Main execution
async function main() {
  try {
    // Load input file
    const inputPath = path.join(ENRICHMENT_DIR, options.input);
    console.log(`${colors.cyan}Loading vocabularies...${colors.reset}\n`);
    
    const newItems = loadJSON(inputPath);
    if (!newItems) {
      console.log(`${colors.red}❌ Could not load input file: ${inputPath}${colors.reset}`);
      process.exit(1);
    }
    
    const existing = loadJSON(VOCAB_PATH) || [];
    
    console.log(`${colors.green}✓${colors.reset} Loaded ${existing.length} existing items`);
    console.log(`${colors.green}✓${colors.reset} Loaded ${newItems.length} new items`);
    console.log('');
    
    // Create backup (unless dry run)
    if (!options.dryRun) {
      createBackup();
      console.log('');
    }
    
    // Merge
    console.log(`${colors.cyan}Merging vocabularies...${colors.reset}\n`);
    const { merged, stats } = mergeVocabularies(existing, newItems);
    
    // Display results
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.cyan}Merge Summary:${colors.reset}`);
    console.log(`  Total new items: ${stats.total}`);
    console.log(`  ${colors.green}✓ Added: ${stats.added}${colors.reset}`);
    console.log(`  ${colors.yellow}⚠ Duplicates: ${stats.duplicates}${colors.reset}`);
    console.log(`  ${colors.red}✗ Invalid: ${stats.invalid}${colors.reset}`);
    console.log(`  Final count: ${merged.length} items`);
    console.log('');
    
    // Display errors if any
    if (stats.errors.length > 0) {
      console.log(`${colors.red}Validation Errors:${colors.reset}`);
      stats.errors.forEach(({ item, errors }) => {
        console.log(`  • ${item}`);
        errors.forEach(err => console.log(`    - ${err}`));
      });
      console.log('');
    }
    
    // Save merged vocabulary
    if (!options.dryRun) {
      fs.writeFileSync(VOCAB_PATH, JSON.stringify(merged, null, 2));
      console.log(`${colors.green}✅ Saved merged vocabulary${colors.reset}`);
      console.log(`   → ${VOCAB_PATH}`);
    } else {
      console.log(`${colors.yellow}ℹ DRY RUN - No changes made${colors.reset}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.green}✅ Merge complete!${colors.reset}\n`);
    
    if (!options.dryRun && stats.added > 0) {
      console.log('Next steps:');
      console.log('  1. Test vocabulary in application');
      console.log('  2. Verify all fields are correct');
      console.log('  3. Commit changes to git');
      console.log('');
      console.log('Git commands:');
      console.log(`  git add ${VOCAB_PATH}`);
      console.log(`  git commit -m "feat: add ${stats.added} ${options.input.includes('A1') ? 'A1' : ''} vocabulary items"`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
