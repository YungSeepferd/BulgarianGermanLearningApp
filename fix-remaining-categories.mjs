#!/usr/bin/env node
/**
 * Script to categorize uncategorized vocabulary items in unified-vocabulary.json
 *
 * This script:
 * 1. Creates a backup of the original file
 * 2. Processes items with "uncategorized" in categories
 * 3. Uses regex patterns and partOfSpeech to assign appropriate categories
 * 4. Handles multi-category assignments
 * 5. Flags items for manual review when uncertain
 * 6. Generates a comprehensive report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// CLI args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry');
const limitIdx = args.indexOf('--limit');
const hardLimit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : undefined;

// Get directory and file paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const dataPath = path.join(dataDir, 'unified-vocabulary.json');
const backupPath = path.join(dataDir, `unified-vocabulary-backup-${Date.now()}.json`);
const reportPath = path.join(__dirname, 'reports', 'category-fix-report.json');

// Valid categories from the schema
const VALID_CATEGORIES = [
  'greetings',
  'numbers',
  'family',
  'food',
  'colors',
  'animals',
  'body',
  'clothing',
  'home',
  'nature',
  'transport',
  'technology',
  'time',
  'weather',
  'professions',
  'places',
  'grammar',
  'culture',
  'everyday-phrases'
];

// Invalid categories to remove (legacy placeholders / schema-invalid values)
const INVALID_CATEGORIES = [
  'uncategorized',
  'adjectives',
  'adverbs',
  'verbs',
  'pronouns',
  'common_phrases',
  'house'
];

// Statistics tracking
const stats = {
  totalItems: 0,
  processedItems: 0,
  fixedItems: 0,
  multiCategoryItems: 0,
  flaggedForReview: 0,
  categoryDistribution: {},
  startTime: new Date()
};

// Report data
const report = {
  timestamp: new Date().toISOString(),
  scriptVersion: '1.0.0',
  totalItems: 0,
  processedItems: 0,
  fixedItems: 0,
  multiCategoryItems: 0,
  flaggedForReview: 0,
  categoryDistribution: {},
  fixes: [],
  flaggedItems: [],
  summary: ''
};

/**
 * Create backup of the original file
 */
function createBackup() {
  try {
    fs.copyFileSync(dataPath, backupPath);
    console.log(`✅ Backup created: ${path.relative(__dirname, backupPath)}`);
  } catch (error) {
    console.error(`❌ Failed to create backup: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Load vocabulary data
 */
function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
    stats.totalItems = items.length;
    report.totalItems = items.length;
    return Array.isArray(data) ? { items: data } : data;
  } catch (error) {
    console.error(`❌ Failed to load data: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Save updated data
 */
function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Data saved: ${path.relative(__dirname, dataPath)}`);
  } catch (error) {
    console.error(`❌ Failed to save data: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Save report
 */
function saveReport() {
  try {
    // Ensure reports directory exists
    if (!fs.existsSync(path.join(__dirname, 'reports'))) {
      fs.mkdirSync(path.join(__dirname, 'reports'), { recursive: true });
    }

    // Update report with final stats
    report.processedItems = stats.processedItems;
    report.fixedItems = stats.fixedItems;
    report.multiCategoryItems = stats.multiCategoryItems;
    report.flaggedForReview = stats.flaggedForReview;
    report.categoryDistribution = stats.categoryDistribution;
    report.duration = (new Date() - stats.startTime) / 1000; // in seconds

    // Generate summary
    report.summary = generateSummary();

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`✅ Report saved: ${path.relative(__dirname, reportPath)}`);
  } catch (error) {
    console.error(`❌ Failed to save report: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Generate summary text for the report
 */
function generateSummary() {
  const percentFixed = Math.round((stats.fixedItems / stats.processedItems) * 100);
  const percentFlagged = Math.round((stats.flaggedForReview / stats.processedItems) * 100);

  return `Category Fix Report Summary:
- Processed ${stats.processedItems} items with "uncategorized" category
- Fixed ${stats.fixedItems} items (${percentFixed}%)
- Assigned multiple categories to ${stats.multiCategoryItems} items
- Flagged ${stats.flaggedForReview} items (${percentFlagged}%) for manual review
- Script executed in ${report.duration.toFixed(2)} seconds
- ${stats.fixedItems >= 180 ? '✅ Success' : '⚠️ Warning'}: ${stats.fixedItems} of ${stats.processedItems} items automatically categorized (${percentFixed}%)`;
}

/**
 * Initialize category distribution tracking
 */
function initializeCategoryDistribution() {
  VALID_CATEGORIES.forEach(category => {
    stats.categoryDistribution[category] = 0;
  });
}

/**
 * Update category distribution statistics
 */
function updateCategoryDistribution(categories) {
  categories.forEach(category => {
    if (VALID_CATEGORIES.includes(category)) {
      stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
    }
  });
}

/**
 * Create regex patterns for categorization
 */
function createCategorizationRules() {
  return [
    // Numbers - matches German number words or partOfSpeech is numeral
    {
      name: 'numbers',
      patterns: [
        { regex: /^(ein|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|null|hundert|tausend|million)/i, type: 'german' },
        { regex: /^(eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|dreizehn|vierzehn|fünfzehn|sechzehn|siebzehn|achtzehn|neunzehn|zwanzig|dreißig|vierzig|fünfzig|sechzig|siebzig|achtzig|neunzig|hundert|tausend)/i, type: 'german' }
      ],
      partOfSpeech: ['number', 'numeral'],
      description: 'Number words or numerals'
    },

    // Time - matches time-related words
    {
      name: 'time',
      patterns: [
        { regex: /(tag|woche|monat|jahr|stunde|minute|sekunde|uhr|morgen|mittag|abend|nacht|januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)/i, type: 'german' },
        { regex: /(uhr|zeit|datum|kalender|woche|monat|jahr|stunde|minute|sekunde|tag|woche|wochenende)/i, type: 'german' }
      ],
      partOfSpeech: [],
      description: 'Time-related words'
    },

    // Greetings & Phrases - common greeting words
    {
      name: 'greetings',
      patterns: [
        { regex: /(hallo|guten tag|auf wiedersehen|tschüss|danke|bitte|entschuldigung|ja|nein|vielleicht|guten morgen|guten abend|gute nacht)/i, type: 'german' }
      ],
      partOfSpeech: ['interjection', 'phrase'],
      description: 'Greeting words and phrases'
    },

    // Everyday phrases - common conversational phrases
    {
      name: 'everyday-phrases',
      patterns: [
        { regex: /(wie geht|mir geht|darf ich|kann ich|was ist|wer ist|wo ist|wann ist|bitte|danke|entschuldigung|es tut mir leid)/i, type: 'german' }
      ],
      partOfSpeech: ['phrase'],
      description: 'Common conversational phrases'
    },

    // Colors - color words
    {
      name: 'colors',
      patterns: [
        { regex: /(rot|blau|grün|gelb|orange|lila|rosa|schwarz|weiß|grau|braun|farbe|bunt)/i, type: 'german' }
      ],
      partOfSpeech: ['adjective'],
      description: 'Color words'
    },

    // Family - family-related words
    {
      name: 'family',
      patterns: [
        { regex: /(mutter|vater|eltern|bruder|schwester|sohn|tochter|kind|opa|oma|onkel|tante|familie|ehemann|ehefrau|freund|freundin|mann|frau|mama|papa|kind|baby)/i, type: 'german' }
      ],
      partOfSpeech: ['noun'],
      description: 'Family members and relationships'
    },

    // Food - food-related words
    {
      name: 'food',
      patterns: [
        { regex: /(essen|trinken|brot|käse|fleisch|wurst|obst|gemüse|apfel|banane|wasser|milch|kaffee|tee|bier|wein|restaurant|küche|mahlzeit|frühstück|mittagessen|abendessen|nahrung|lebensmittel)/i, type: 'german' }
      ],
      partOfSpeech: ['noun', 'verb'],
      description: 'Food and drink items'
    },

    // Body Parts - body-related words
    {
      name: 'body',
      patterns: [
        { regex: /(kopf|auge|ohr|nase|mund|hand|fuß|arm|bein|herz|körper|haar|zahn|gesicht|rücken|bauch|brust|hals|schulter|finger|zeh)/i, type: 'german' },
        { regex: /(arzt|krankenhaus|apotheke|medikament|schmerz|gesundheit|fieber|erkältung|hilfe|notfall)/i, type: 'german' }
      ],
      partOfSpeech: ['noun'],
      description: 'Body parts and health-related words'
    },

    // Clothing - clothing-related words
    {
      name: 'clothing',
      patterns: [
        { regex: /(hemd|hose|kleid|schuh|jacke|mantel|rock|pullover|socke|hut|kleidung|anzug|bluse|schal|mütze|handschuh|unterwäsche)/i, type: 'german' }
      ],
      partOfSpeech: ['noun'],
      description: 'Clothing items'
    },

    // Animals - animal-related words
    {
      name: 'animals',
      patterns: [
        { regex: /(hund|katze|pferd|vogel|fisch|tier|kuh|schwein|schaf|ziege|löwe|tiger|bär|affe|elefant|maus|ratte|hase|ente|huhn)/i, type: 'german' }
      ],
      partOfSpeech: ['noun'],
      description: 'Animals'
    },

    // Home & Living - home-related words
    {
      name: 'home',
      patterns: [
        { regex: /(haus|wohnung|zimmer|küche|bad|schlafzimmer|tür|fenster|tisch|stuhl|bett|möbel|lampe|teppich|vorhang|spiegel|regal|schrank)/i, type: 'german' }
      ],
      partOfSpeech: ['noun'],
      description: 'Home and household items'
    },

    // Nature - nature-related words
    {
      name: 'nature',
      patterns: [
        { regex: /(baum|blume|pflanze|wald|berg|fluss|see|sonne|mond|stern|himmel|erde|natur|hügel|tal|wiese|feld|garten)/i, type: 'german' }
      ],
      partOfSpeech: ['noun'],
      description: 'Nature and outdoor elements'
    },

    // Transport - transportation-related words
    {
      name: 'transport',
      patterns: [
        { regex: /(auto|bus|zug|flugzeug|fahrrad|schiff|straße|bahnhof|flughafen|taxi|verkehr|fahren|flug|reise|ticket|fahrkarte)/i, type: 'german' }
      ],
      partOfSpeech: ['noun', 'verb'],
      description: 'Transportation and travel'
    },

    // Weather - weather-related words
    {
      name: 'weather',
      patterns: [
        { regex: /(wetter|regen|schnee|sonne|wind|wolke|gewitter|nebel|warm|kalt|heiß|kühl|temperatur|grad|sturm|hagel)/i, type: 'german' }
      ],
      partOfSpeech: ['noun', 'adjective'],
      description: 'Weather and climate terms'
    },

    // Professions - job-related words
    {
      name: 'professions',
      patterns: [
        { regex: /(arbeit|beruf|arzt|lehrer|ingenieur|koch|verkäufer|arbeiter|chef|kollege|polizist|feuerwehrmann|anwalt|richter|kellner|krankenschwester|programmierer|handwerker)/i, type: 'german' }
      ],
      partOfSpeech: ['noun'],
      description: 'Professions and occupations'
    },

    // Places - location-related words
    {
      name: 'places',
      patterns: [
        { regex: /(stadt|land|platz|straße|geschäft|laden|markt|kirche|museum|park|ort|hotel|restaurant|café|schule|universität|bibliothek|kino|theater|schwimmbad)/i, type: 'german' }
      ],
      partOfSpeech: ['noun'],
      description: 'Places and locations'
    },

    // Grammar Particles - grammar-related words
    {
      name: 'grammar',
      patterns: [],
      partOfSpeech: ['conjunction', 'preposition', 'article', 'pronoun', 'particle'],
      description: 'Grammar particles and function words'
    }
  ];
}

/**
 * Check if an item should be processed (has uncategorized category)
 */
function shouldProcessItem(item) {
  if (!item.categories || !Array.isArray(item.categories)) {
    return false;
  }

  // Check if item has uncategorized or adjectives (invalid) categories
  return item.categories.some(category =>
    INVALID_CATEGORIES.includes(category) ||
    category === 'uncategorized'
  );
}

/**
 * Clean categories by removing invalid ones
 */
function cleanCategories(categories) {
  if (!categories || !Array.isArray(categories)) {
    return [];
  }

  return categories.filter(category =>
    !INVALID_CATEGORIES.includes(category) &&
    VALID_CATEGORIES.includes(category)
  );
}

/**
 * Apply categorization rules to an item
 */
function categorizeItem(item, rules) {
  const matched = [];
  let isUncertain = false;

  if (item.german) {
    const germanWord = item.german.toLowerCase();

    rules.forEach(rule => {
      // Exact/regex against full term
      for (const pattern of rule.patterns) {
        if (pattern.regex.test(germanWord)) {
          matched.push({ category: rule.name, reason: `german pattern: ${pattern.regex.toString()}` });
          return; // Stop at first pattern match for this rule
        }
      }

      // Multi-word support
      if (germanWord.includes(' ')) {
        for (const word of germanWord.split(' ')) {
          for (const pattern of rule.patterns) {
            if (pattern.regex.test(word)) {
              matched.push({ category: rule.name, reason: `multi-word: ${word} matches ${pattern.regex.toString()}` });
              return;
            }
          }
        }
      }
    });
  }

  // Deduplicate and enforce a conservative cap (max 2 categories)
  const uniqueCategories = [];
  const reasons = [];
  for (const entry of matched) {
    if (!uniqueCategories.includes(entry.category)) {
      uniqueCategories.push(entry.category);
      reasons.push(entry.reason);
    }
    if (uniqueCategories.length === 2) {
      break;
    }
  }

  if (uniqueCategories.length === 0) {
    isUncertain = true;
    reasons.push('No matching patterns found');
  } else if (matched.length > 2) {
    // More than two plausible categories suggests ambiguity
    isUncertain = true;
    reasons.push('Multiple category matches detected; capped to first two');
  }

  return {
    categories: uniqueCategories,
    reason: reasons.join('; '),
    isUncertain
  };
}

/**
 * Process a batch of items
 */
function processBatch(data, batchSize = 50, processedTarget = Infinity) {
  const rules = createCategorizationRules();
  let processedInBatch = 0;
  const items = Array.isArray(data.items) ? data.items : [];

  for (let i = 0; i < items.length && processedInBatch < batchSize && stats.processedItems < processedTarget; i++) {
    const item = items[i];

    if (shouldProcessItem(item)) {
      stats.processedItems++;
      processedInBatch++;

      // Clean existing categories
      const oldCategories = cleanCategories(item.categories);
      const originalCategories = [...item.categories]; // Keep original for report

      // Categorize the item
      const { categories, reason, isUncertain } = categorizeItem(item, rules);

      // Update item categories
      item.categories = categories.length > 0 ? categories : ['uncategorized'];

      // Update statistics
      if (categories.length > 0) {
        stats.fixedItems++;
        if (categories.length > 1) {
          stats.multiCategoryItems++;
        }
        updateCategoryDistribution(categories);
      }

      if (isUncertain) {
        stats.flaggedForReview++;
        report.flaggedItems.push({
          id: item.id,
          german: item.german,
          bulgarian: item.bulgarian,
          partOfSpeech: item.partOfSpeech,
          oldCategories: originalCategories,
          reason: reason
        });
      }

      // Add to report
      report.fixes.push({
        id: item.id,
        german: item.german,
        bulgarian: item.bulgarian,
        partOfSpeech: item.partOfSpeech,
        oldCategories: originalCategories,
        newCategories: item.categories,
        reason: reason,
        flaggedForReview: isUncertain
      });

      // Log progress for every 10 items
      if (stats.processedItems % 10 === 0) {
        console.log(`Processed ${stats.processedItems} items...`);
      }
    }
  }

  return processedInBatch;
}

/**
 * Validate the final data
 */
function validateData(data) {
  let hasInvalidCategories = false;
  let hasUncategorized = false;

  data.items.forEach(item => {
    if (!item.categories || !Array.isArray(item.categories)) {
      console.warn(`⚠️ Item ${item.id} has no categories array`);
      hasInvalidCategories = true;
      return;
    }

    // Check for invalid categories
    const invalidCats = item.categories.filter(category =>
      !VALID_CATEGORIES.includes(category) && !INVALID_CATEGORIES.includes(category)
    );

    if (invalidCats.length > 0) {
      console.warn(`⚠️ Item ${item.id} has invalid categories: ${invalidCats.join(', ')}`);
      hasInvalidCategories = true;
    }

    // Check for uncategorized
    if (item.categories.includes('uncategorized')) {
      hasUncategorized = true;
    }
  });

  if (hasInvalidCategories) {
    console.error('❌ Validation failed: Found items with invalid categories');
    return false;
  }

  if (hasUncategorized) {
    console.warn('⚠️ Validation warning: Some items still have "uncategorized" category');
  }

  console.log('✅ Data validation passed');
  return true;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting category fixing process...');
  console.log(`📁 Data file: ${path.relative(__dirname, dataPath)}`);

  // Initialize
  initializeCategoryDistribution();

  // Create backup (skip on dry-run to avoid noise)
  if (!isDryRun) createBackup();

  // Load data
  const data = loadData();

  // Determine dry-run preview limit
  const previewLimit = hardLimit && Number.isFinite(hardLimit) && hardLimit > 0 ? hardLimit : Infinity;

  // Process items in batches
  const batchSize = 50;
  let processedInBatch;
  do {
    processedInBatch = processBatch(data, batchSize, previewLimit);
    console.log(`Processed batch: ${processedInBatch} items`);
  } while (processedInBatch === batchSize && stats.processedItems < previewLimit);

  // Validate data (always)
  const isValid = validateData(data);
  if (!isValid) {
    console.error('❌ Data validation failed. Check the report for details.');
  }

  // Save updated data unless dry-run
  if (!isDryRun) {
    saveData(data);
  } else {
    console.log(`🧪 Dry run complete. Previewed ${stats.processedItems}/${stats.totalItems} items.`);
  }

  // Save report
  saveReport();

  // Final summary
  console.log('\n' + generateSummary());
  console.log(`\n📊 Full report: ${path.relative(__dirname, reportPath)}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});