#!/usr/bin/env node

/**
 * Vocabulary Audit Script
 * Identifies categorization errors and other data quality issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../static/data/unified-vocabulary.json');

// Define expected categories and their semantic meanings
const CATEGORY_KEYWORDS = {
  'Begrüßungen': ['hallo', 'guten', 'morgen', 'tag', 'nacht', 'abend', 'auf wiedersehen', 'bis', 'später', 'servus', 'moin', 'grüß'],
  'Zahlen': ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'hundert', 'tausend', 'million'],
  'Familie': ['vater', 'mutter', 'sohn', 'tochter', 'bruder', 'schwester', 'großvater', 'großmutter', 'onkel', 'tante', 'cousin', 'oma', 'opa', 'eltern'],
  'Essen': ['brot', 'käse', 'butter', 'milch', 'ei', 'fleisch', 'fisch', 'obst', 'gemüse', 'kartoffel', 'nudelsuppe', 'wurst', 'sauce', 'zucker', 'salz', 'tomate', 'apfel', 'orange', 'birne', 'kirsche', 'erdbeere'],
  'Farben': ['rot', 'blau', 'gelb', 'grün', 'weiß', 'schwarz', 'grau', 'braun', 'rosa', 'orange', 'violett', 'lila', 'türkis', 'farbe'],
  'Tiere': ['hund', 'katze', 'vogel', 'fisch', 'pferd', 'kuh', 'schwein', 'schaf', 'ziege', 'huhn', 'ente', 'gans', 'kaninchen', 'ratte', 'maus', 'löwe', 'tiger', 'elefant', 'affe', 'bär'],
  'Körperteile': ['kopf', 'auge', 'ohr', 'nase', 'mund', 'zahn', 'zunge', 'hals', 'kehle', 'nacken', 'schulter', 'brust', 'bauch', 'arm', 'ellbogen', 'hand', 'finger', 'rücken', 'rippe', 'wirbelsäule', 'bein', 'oberschenkel', 'unterschenkel', 'knie', 'fuß', 'zehe', 'herz', 'lunge', 'magen', 'leber'],
  'Kleidung': ['hemd', 'hose', 'schuh', 'schuh', 'strumpf', 'schale', 'weste', 'jacke', 'mantel', 'kleid', 'rock', 'bluse', 'pullover', 'beanie', 'hut', 'kappe', 'schal', 'krawatte', 'gürtel', 'handschuh', 'socke'],
  'Zuhause': ['haus', 'wohnung', 'zimmer', 'bett', 'tisch', 'stuhl', 'sofa', 'schrank', 'tür', 'fenster', 'dach', 'keller', 'wand', 'fußboden', 'treppe', 'balkon', 'veranda', 'küche', 'wohnzimmer', 'schlafzimmer', 'badezimmer', 'toilette', 'gang'],
  'Natur': ['baum', 'wald', 'berg', 'fluss', 'see', 'meer', 'ozean', 'strand', 'blume', 'pflanze', 'gras', 'blatt', 'wurzel', 'stamm', 'ast', 'stein', 'wasser', 'wind', 'sonne', 'mond', 'stern', 'himmel', 'wolke', 'regen', 'schnee'],
  'Verkehr': ['auto', 'laster', 'bus', 'bahn', 'zug', 'flugzeug', 'schiff', 'motorrad', 'fahrrad', 'roller', 'straße', 'weg', 'bürgersteig', 'brücke', 'tunnel', 'bahnhof', 'flughafen', 'hafen', 'parkplatz', 'gas', 'bremse', 'lenkrad'],
  'Technologie': ['computer', 'handy', 'telefon', 'internet', 'email', 'bildschirm', 'tastatur', 'maus', 'drucker', 'monitor', 'prozessor', 'speicher', 'software', 'hardware', 'app', 'program', 'digital', 'elektronik', 'batterie', 'strom'],
  'Zeit': ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag', 'januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember', 'morgen', 'mittag', 'abend', 'nacht', 'tag', 'woche', 'monat', 'jahr', 'stunde', 'minute', 'sekunde', 'moment'],
  'Wetter': ['sonne', 'regen', 'schnee', 'wind', 'wolke', 'sturm', 'gewitter', 'nebel', 'frost', 'eis', 'hagel', 'blitz', 'donner', 'hitze', 'kälte', 'feuchte', 'luft', 'temperatur', 'grad'],
  'Berufe': ['arzt', 'lehrer', 'ingenieur', 'mechaniker', 'elektriker', 'klempner', 'koch', 'kellner', 'friseur', 'zahnarzt', 'apotheker', 'richter', 'anwalt', 'polizist', 'feuerwehrmann', 'soldat', 'farmer', 'gärtner', 'maler', 'handwerker', 'arbeiter'],
  'Orte': ['stadt', 'dorf', 'land', 'kontinent', 'stadt', 'plaza', 'markt', 'park', 'garten', 'schule', 'universität', 'hospital', 'kirche', 'moschee', 'tempel', 'synagoge', 'kino', 'theater', 'museum', 'bibliothek', 'kneipe', 'restaurant', 'laden', 'geschäft', 'büro', 'fabrik', 'werkstatt'],
};

const EXPECTED_PARTS_OF_SPEECH = [
  'Substantiv', 'Verb', 'Adjektiv', 'Adverb', 'Pronomen',
  'Präposition', 'Konjunktion', 'Artikel', 'Zahlwort', 'Interjektion', 'Redewendung'
];

const VALID_DIFFICULTIES = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Check if a word semantically belongs to a category
 */
function belongsToCategory(word, category) {
  const lowerWord = word.toLowerCase();
  const keywords = CATEGORY_KEYWORDS[category] || [];
  
  // Check if word starts with or contains keywords
  return keywords.some(keyword => {
    return lowerWord.includes(keyword) || keyword.includes(lowerWord.split(' ')[0]);
  });
}

/**
 * Audit a single vocabulary item
 */
function auditItem(item, index) {
  const issues = [];

  // Check required fields
  if (!item.german) issues.push(`Missing German word`);
  if (!item.bulgarian) issues.push(`Missing Bulgarian word`);
  if (!item.partOfSpeech) issues.push(`Missing part of speech`);
  if (!item.category) issues.push(`Missing category`);

  // Validate part of speech
  if (item.partOfSpeech && !EXPECTED_PARTS_OF_SPEECH.includes(item.partOfSpeech)) {
    issues.push(`Invalid part of speech: "${item.partOfSpeech}" (expected one of: ${EXPECTED_PARTS_OF_SPEECH.join(', ')})`);
  }

  // Validate difficulty
  if (item.difficulty && !VALID_DIFFICULTIES.includes(item.difficulty)) {
    issues.push(`Invalid difficulty: "${item.difficulty}"`);
  }

  // Check category accuracy
  if (item.german && item.category && !belongsToCategory(item.german, item.category)) {
    issues.push(`Category mismatch: "${item.german}" categorized as "${item.category}" - likely incorrect`);
  }

  // Check for common issues
  if (item.german && item.german.includes('_')) {
    issues.push(`German word contains underscore: "${item.german}"`);
  }
  if (item.bulgarian && item.bulgarian.includes('_')) {
    issues.push(`Bulgarian word contains underscore: "${item.bulgarian}"`);
  }

  // Check for placeholder text
  if (item.german && (item.german.includes('MISSING') || item.german.includes('TODO'))) {
    issues.push(`German word contains placeholder text: "${item.german}"`);
  }
  if (item.bulgarian && (item.bulgarian.includes('MISSING') || item.bulgarian.includes('TODO'))) {
    issues.push(`Bulgarian word contains placeholder text: "${item.bulgarian}"`);
  }

  return issues;
}

/**
 * Run full audit
 */
function runAudit() {
  console.log('📋 Starting Vocabulary Audit...\n');

  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const items = data.items || [];

    console.log(`Total items: ${items.length}\n`);

    const categoryMismatches = [];
    const missingFields = [];
    const invalidValues = [];
    const allIssues = [];

    items.forEach((item, index) => {
      const issues = auditItem(item, index);
      
      if (issues.length > 0) {
        allIssues.push({
          index,
          item,
          issues
        });

        issues.forEach(issue => {
          if (issue.includes('Category mismatch')) {
            categoryMismatches.push({ index, item, issue });
          } else if (issue.includes('Missing')) {
            missingFields.push({ index, item, issue });
          } else {
            invalidValues.push({ index, item, issue });
          }
        });
      }
    });

    // Print category mismatches
    if (categoryMismatches.length > 0) {
      console.log(`\n⚠️  CATEGORY MISMATCHES: ${categoryMismatches.length} items\n`);
      categoryMismatches.slice(0, 20).forEach(({ index, item, issue }) => {
        console.log(`  [${index}] "${item.german}" → "${item.bulgarian}"`);
        console.log(`       Category: ${item.category}`);
        console.log(`       Issue: ${issue}`);
        console.log('');
      });
      if (categoryMismatches.length > 20) {
        console.log(`  ... and ${categoryMismatches.length - 20} more category issues\n`);
      }
    }

    // Print missing fields
    if (missingFields.length > 0) {
      console.log(`\n❌ MISSING FIELDS: ${missingFields.length} items\n`);
      missingFields.slice(0, 10).forEach(({ index, item, issue }) => {
        console.log(`  [${index}] "${item.german || 'N/A'}" → "${item.bulgarian || 'N/A'}"`);
        console.log(`       Issue: ${issue}`);
        console.log('');
      });
      if (missingFields.length > 10) {
        console.log(`  ... and ${missingFields.length - 10} more missing field issues\n`);
      }
    }

    // Print invalid values
    if (invalidValues.length > 0) {
      console.log(`\n🔴 INVALID VALUES: ${invalidValues.length} items\n`);
      invalidValues.slice(0, 10).forEach(({ index, item, issue }) => {
        console.log(`  [${index}] "${item.german || 'N/A'}" → "${item.bulgarian || 'N/A'}"`);
        console.log(`       Issue: ${issue}`);
        console.log('');
      });
      if (invalidValues.length > 10) {
        console.log(`  ... and ${invalidValues.length - 10} more invalid value issues\n`);
      }
    }

    // Summary
    console.log('\n📊 AUDIT SUMMARY:');
    console.log(`   Category mismatches: ${categoryMismatches.length}`);
    console.log(`   Missing fields: ${missingFields.length}`);
    console.log(`   Invalid values: ${invalidValues.length}`);
    console.log(`   Total issues: ${allIssues.length}\n`);

    // Export detailed report
    const reportPath = path.join(__dirname, '../vocabulary-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalItems: items.length,
      summary: {
        categoryMismatches: categoryMismatches.length,
        missingFields: missingFields.length,
        invalidValues: invalidValues.length,
        totalIssues: allIssues.length
      },
      categoryMismatches: categoryMismatches.slice(0, 50),
      missingFields: missingFields.slice(0, 50),
      invalidValues: invalidValues.slice(0, 50)
    }, null, 2));

    console.log(`✅ Detailed report saved to: vocabulary-audit-report.json\n`);

    process.exit(allIssues.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

runAudit();
