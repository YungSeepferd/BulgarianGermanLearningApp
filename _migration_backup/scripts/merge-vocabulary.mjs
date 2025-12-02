#!/usr/bin/env node
/**
 * @file merge-vocabulary.mjs
 * @description Merge vocabulary.json and vocabulary-enhanced.json into single source
 * @usage node scripts/merge-vocabulary.mjs [--dry-run] [--output=path]
 */

import { readFile, writeFile } from 'node:fs/promises';

const PRIMARY_PATH = 'data/vocabulary.json';
const ENHANCED_PATH = 'data/vocabulary-enhanced.json';
const BACKUP_SUFFIX = `.backup.${new Date().toISOString().split('T')[0]}.json`;

function mergeExamples(primEx = [], enhEx = []) {
  const seen = new Set();
  const merged = [];
  
  for (const ex of [...primEx, ...enhEx]) {
    const key = ex.sentence?.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(ex);
    }
  }
  
  return merged.length > 0 ? merged : undefined;
}

function mergeEntries(prim, enh) {
  // Start with primary entry as base
  const merged = { ...prim };
  
  // Override with enhanced values if present and non-null
  for (const key of Object.keys(enh)) {
    if (enh[key] !== null && enh[key] !== undefined) {
      // Skip overwriting for certain fields
      if (key === 'examples') {
        continue;
      } // Handle separately
      if (key === 'id') {
        continue;
      } // Never override ID
      
      // For string fields, prefer non-empty enhanced value
      if (typeof enh[key] === 'string' && enh[key].trim().length > 0) {
        merged[key] = enh[key];
      } else if (typeof enh[key] !== 'string') {
        merged[key] = enh[key];
      }
    }
  }
  
  // Merge examples arrays
  merged.examples = mergeExamples(prim.examples, enh.examples);
  
  // Ensure directional notes are populated
  if (!merged.notes_bg_to_de && merged.notes) {
    merged.notes_bg_to_de = merged.notes;
  }
  if (!merged.notes_de_to_bg && merged.notes) {
    merged.notes_de_to_bg = merged.notes;
  }
  
  return merged;
}

async function loadJSON(path) {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load ${path}:`, error.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const outputArg = args.find(arg => arg.startsWith('--output='));
  const outputPath = outputArg ? outputArg.split('=')[1] : 'data/vocabulary-merged.json';
  
  console.log('🔍 Loading vocabulary datasets...\n');
  
  const primary = await loadJSON(PRIMARY_PATH);
  const enhanced = await loadJSON(ENHANCED_PATH);
  
  if (!primary) {
    console.error(`❌ Failed to load primary dataset: ${PRIMARY_PATH}`);
    process.exit(1);
  }
  
  if (!enhanced) {
    console.warn(`⚠️  Enhanced dataset not found or invalid: ${ENHANCED_PATH}`);
    console.log('Proceeding with primary dataset only.\n');
  }
  
  // Build ID map from primary
  const idMap = new Map();
  for (const entry of primary) {
    idMap.set(entry.id, { source: 'primary', data: entry });
  }
  
  console.log(`📚 Primary dataset: ${primary.length} entries`);
  console.log(`✨ Enhanced dataset: ${enhanced ? enhanced.length : 0} entries\n`);
  
  // Merge enhanced entries
  let mergedCount = 0;
  let addedCount = 0;
  
  if (enhanced && Array.isArray(enhanced)) {
    for (const enhEntry of enhanced) {
      if (!enhEntry.id) {
        console.warn('⚠️  Skipping enhanced entry without ID');
        continue;
      }
      
      if (idMap.has(enhEntry.id)) {
        const primEntry = idMap.get(enhEntry.id).data;
        const merged = mergeEntries(primEntry, enhEntry);
        idMap.set(enhEntry.id, { source: 'merged', data: merged });
        mergedCount++;
      } else {
        idMap.set(enhEntry.id, { source: 'enhanced', data: enhEntry });
        addedCount++;
      }
    }
  }
  
  // Build final merged array
  const mergedArray = [...idMap.values()].map(entry => entry.data);
  
  // Report
  console.log('📊 Merge Statistics:');
  console.log(`   Total entries: ${mergedArray.length}`);
  console.log(`   Merged (enhanced data): ${mergedCount}`);
  console.log(`   Added (enhanced only): ${addedCount}`);
  console.log(`   Primary only: ${mergedArray.length - mergedCount - addedCount}\n`);
  
  // Check for entries with generic notes but missing directional notes
  let warningCount = 0;
  for (const entry of mergedArray) {
    if (entry.notes && !entry.notes_bg_to_de && !entry.notes_de_to_bg) {
      if (warningCount < 5) {
        console.warn(`⚠️  ${entry.id}: has generic notes but missing directional notes`);
      }
      warningCount++;
    }
  }
  
  if (warningCount > 5) {
    console.warn(`   ... and ${warningCount - 5} more warnings\n`);
  } else if (warningCount > 0) {
    console.log('');
  }
  
  if (isDryRun) {
    console.log('🔍 DRY RUN - No files written');
    console.log(`   Would write to: ${outputPath}\n`);
    
    // Show sample merged entry
    const sample = mergedArray.find(e => idMap.get(e.id).source === 'merged');
    if (sample) {
      console.log('Sample merged entry:');
      console.log(JSON.stringify(sample, null, 2).split('\n').slice(0, 20).join('\n'));
      console.log('   ...\n');
    }
  } else {
    // Create backup of primary
    const backupPath = PRIMARY_PATH.replace('.json', BACKUP_SUFFIX);
    try {
      await writeFile(backupPath, JSON.stringify(primary, null, 2));
      console.log(`✅ Backup created: ${backupPath}`);
    } catch (error) {
      console.error(`❌ Failed to create backup: ${error.message}`);
      process.exit(1);
    }
    
    // Write merged data
    try {
      await writeFile(outputPath, JSON.stringify(mergedArray, null, 2));
      console.log(`✅ Merged data written: ${outputPath}`);
      console.log(`   ${mergedArray.length} entries\n`);
    } catch (error) {
      console.error(`❌ Failed to write merged data: ${error.message}`);
      process.exit(1);
    }
    
    console.log('🎉 Merge complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run lint:data');
    console.log('2. Test: npm run dev (verify practice sessions)');
    console.log(`3. Replace: mv ${outputPath} ${PRIMARY_PATH}`);
    console.log(`4. Archive: mv ${ENHANCED_PATH} data/archive/\n`);
  }
}

main().catch(error => {
  console.error('❌ Merge script failed:', error);
  process.exit(1);
});
