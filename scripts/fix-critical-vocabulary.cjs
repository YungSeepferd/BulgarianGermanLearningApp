/**
 * Vocabulary Data Cleanup Script
 * Fixes critical data errors identified during audit.
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'unified-vocabulary.json');
const BACKUP_PATH = path.join(__dirname, '..', 'data', 'unified-vocabulary-backup.json');

function main() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);
  fs.writeFileSync(BACKUP_PATH, raw, 'utf-8');

  let changes = 0;
  const stats = { removed: 0, fixedExamples: 0, fixedCategory: 0, fixedTranslation: 0 };

  for (let i = data.length - 1; i >= 0; i--) {
    const item = data[i];
    let modified = false;

    // === REMOVE completely wrong "Bitte, nehmen Sie Platz" duplicates ===
    if (item.german === 'Bitte, nehmen Sie Platz' && item.bulgarian === 'А мляко') {
      data.splice(i, 1);
      stats.removed++;
      continue;
    }

    // === FIX wrong Bulgarian for "Bitte, nehmen Sie Platz" ===
    if (item.german === 'Bitte, nehmen Sie Platz' && item.bulgarian === 'Да, благодаря') {
      item.bulgarian = 'Моля, седнете';
      if (item.examples && item.examples[0]) {
        item.examples[0].bulgarian = 'Моля, седнете';
      }
      item.correctionNote = 'Fixed incorrect translation (was "Да, благодаря")';
      item.needsReview = false;
      modified = true;
      stats.fixedTranslation++;
    }

    // === FIX Bulgarian example for the correct "Bitte, nehmen Sie Platz" entry ===
    if (item.german === 'Bitte, nehmen Sie Platz' && item.bulgarian === 'Моля, седнете') {
      if (item.examples && item.examples[0] && item.examples[0].bulgarian !== 'Моля, седнете') {
        item.examples[0].bulgarian = 'Моля, седнете';
        item.correctionNote = 'Fixed example Bulgarian';
        item.needsReview = false;
        modified = true;
        stats.fixedExamples++;
      }
    }

    // === FIX category: "Bitte, nehmen Sie Platz" should be greetings, not food ===
    if (item.german === 'Bitte, nehmen Sie Platz') {
      if (item.categories && item.categories[0] === 'food') {
        item.categories[0] = 'greetings';
        modified = true;
        stats.fixedCategory++;
      }
    }

    // === REMOVE placeholder "Ich habe X" / "Ich mag X" examples ===
    if (item.examples) {
      const filteredExamples = item.examples.filter(ex => {
        const g = ex.german || '';
        // Remove generic placeholder examples
        if (g.startsWith('Ich habe ') || g.startsWith('Ich mag ') || g.startsWith('Ich habe starke/n/s ')) {
          stats.fixedExamples++;
          modified = true;
          return false;
        }
        return true;
      });
      if (filteredExamples.length < item.examples.length) {
        item.examples = filteredExamples;
        modified = true;
      }
    }

    if (modified) {
      item.updatedAt = new Date().toISOString();
      item.version = (item.version || 1) + 1;
      changes++;
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');

  console.log('=== Vocabulary Cleanup Complete ===');
  console.log('Total items after cleanup:', data.length);
  console.log('Items removed:', stats.removed);
  console.log('Translations fixed:', stats.fixedTranslation);
  console.log('Examples removed/fixed:', stats.fixedExamples);
  console.log('Categories fixed:', stats.fixedCategory);
  console.log('Total items modified:', changes);
  console.log('Backup saved to:', BACKUP_PATH);
}

main();
