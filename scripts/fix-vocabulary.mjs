#!/usr/bin/env node

/**
 * Fix Vocabulary Data Quality Issues
 * - Removes items with placeholders (underscores)
 * - Fixes categorization errors
 * - Ensures all items have required fields
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../static/data/unified-vocabulary.json');
const backupPath = path.join(__dirname, '../static/data/vocabulary-backup-before-fixes.json');

// Category corrections
const CATEGORY_CORRECTIONS = {
  1202: 'food', // 'Tomaten' should be food, not greetings
};

// Categories that are clearly wrong based on word content
const AUTO_FIX_RULES = [
  {
    pattern: /\b(rot|blau|gelb|grün|weiß|schwarz|grau|braun|rosa|orange|violett|lila|türkis)\b/i,
    category: 'colors',
    reason: 'Color word'
  },
  {
    pattern: /\b(hund|katze|vogel|fisch|pferd|kuh|schwein|schaf|ziege|huhn|ente|gans|kaninchen|ratte|maus|löwe|tiger|elefant|affe|bär)\b/i,
    category: 'animals',
    reason: 'Animal name'
  },
  {
    pattern: /\b(kopf|auge|ohr|nase|mund|zahn|zunge|hals|kehle|nacken|schulter|brust|bauch|arm|ellbogen|hand|finger|rücken|bein|oberschenkel|unterschenkel|knie|fuß|zehe|herz|lunge|magen|leber)\b/i,
    category: 'body-parts',
    reason: 'Body part'
  }
];

function fixVocabularyData() {
  console.log('🔧 Starting Vocabulary Data Fixes...\n');

  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const items = data.items || [];
    const originalCount = items.length;

    // Backup original data
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log(`✅ Backup created: vocabulary-backup-before-fixes.json\n`);

    let removed = 0;
    let fixed = 0;
    const fixedItems = [];

    items.forEach((item, index) => {
      // Skip items with placeholders (underscores)
      if (item.german?.includes('_') || item.bulgarian?.includes('_')) {
        console.log(`⛔ Removing [${index}]: "${item.german}" (contains placeholder)`);
        removed++;
        return;
      }

      let itemFixed = false;

      // Apply manual corrections
      if (CATEGORY_CORRECTIONS[index]) {
        const oldCategory = item.categories?.[0] || 'N/A';
        item.categories = [CATEGORY_CORRECTIONS[index]];
        console.log(`🔧 Fixed [${index}]: "${item.german}" category from "${oldCategory}" → "${CATEGORY_CORRECTIONS[index]}"`);
        itemFixed = true;
      }

      // Apply auto-fix rules
      AUTO_FIX_RULES.forEach(rule => {
        if (item.categories && item.categories.length > 0) {
          // Check if current category seems wrong
          const currentCategory = item.categories[0];
          if (currentCategory === 'greetings' || currentCategory === 'phrases') {
            // Only auto-fix obvious greeting/phrase misses
            if (rule.pattern.test(item.german)) {
              const oldCategory = item.categories?.[0] || 'N/A';
              item.categories = [rule.category];
              console.log(`🔧 Auto-fixed [${index}]: "${item.german}" category from "${oldCategory}" → "${rule.category}" (${rule.reason})`);
              itemFixed = true;
            }
          }
        }
      });

      // Ensure category exists
      if (!item.categories || item.categories.length === 0) {
        console.log(`⚠️  [${index}]: "${item.german}" has no category - keeping as is`);
      }

      if (itemFixed) fixed++;
      fixedItems.push(item);
    });

    // Write fixed data
    data.items = fixedItems;
    data.totalItems = fixedItems.length;
    data.lastUpdated = new Date().toISOString();

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Original count: ${originalCount}`);
    console.log(`   Items removed: ${removed}`);
    console.log(`   Items fixed: ${fixed}`);
    console.log(`   New count: ${fixedItems.length}`);
    console.log(`   Net change: ${fixedItems.length - originalCount}\n`);

    console.log(`✅ Fixed data saved to: unified-vocabulary.json\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixVocabularyData();
