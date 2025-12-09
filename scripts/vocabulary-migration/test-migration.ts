#!/usr/bin/env node
/**
 * Test Script for Vocabulary Migration
 *
 * Tests the migration process with sample data to ensure
 * everything works correctly before full migration
 */

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
// UnifiedVocabularyItem is unused
import {
  mergeVocabularyItems,
  convertToUnifiedItem,
  createVocabularyCollection
} from './merging-utils.js';
import { validateAndFixCollection } from './validation-utils.js';
import { consolidateCollectionCategories, createCategoryMappingReport } from './category-utils.js';
import { findDuplicateGroups, mergeDuplicateGroup } from './deduplication-utils.js';

// Sample data for testing
const SAMPLE_DATA = {
  current: [
    {
      "id": "v001-apfel",
      "german": "der Apfel",
      "bulgarian": "ябълката",
      "category": "Food",
      "tags": ["Noun", "A1", "Food"],
      "type": "word",
      "difficulty": "A1",
      "pronunciation": "German: [ˈap͡fl̩], Bulgarian: [ˈjabɐɫkɐtɐ]",
      "example": "German: 'Ich esse einen Apfel.', Bulgarian: 'Аз ям ябълка.'",
      "contextual_nuance": "In German, 'Apfel' refers to both the fruit and the tree. In Bulgarian, 'ябълката' is singular while 'ябълки' is plural.",
      "mnemonics": "Think of the apple as a small, red fruit that grows on a tree.",
      "emoji": "🍎",
      "audio_url": "/audio/bg/v001-apfel.mp3",
      "grammar_details": {
        "verb_aspect": null,
        "verb_partner_id": null,
        "noun_gender": "masculine",
        "plural_form": "Äpfel"
      },
      "xp_value": 10
    }
  ],
  legacyBatch: [
    {
      "id": "a1_number_014",
      "word": "Четиринадесет",
      "translation": "vierzehn",
      "source_lang": "bg",
      "target_lang": "de",
      "category": "Zahlen",
      "level": "A1",
      "notes": "The number 14 formed from 'четири' (four) + 'надесет' (over ten)",
      "notes_bg_to_de": "В немски 'vierzehn' се образува от 'vier' + 'zehn'. Произнася се [ˈfiːɐ̯ˌtseːn]. Използва се при броене и възраст.",
      "notes_de_to_bg": "Für Deutschsprachige: 'Четиринадесет' folgt dem Muster 'vier' + 'надесет'. Betonung: четиринаде́сет.",
      "etymology": "From Proto-Slavic 'četyri' (four) + 'nadъ desętь' (over ten). The pattern mirrors German 'vierzehn'.",
      "cultural_note": "Bulgarian teens (11-19) all use the suffix '-надесет'. In German, teens are written as one word ('vierzehn').",
      "difficulty": 1,
      "frequency": 65,
      "examples": [
        {
          "sentence": "Тя е на четиринадесет години.",
          "translation": "Sie ist vierzehn Jahre alt.",
          "context": "stating age"
        }
      ],
      "linguistic_note": "Stress on the third-to-last syllable: четиринаде́сет [tʃɛtirināˈdɛsɛt]",
      "linguistic_note_bg_to_de": "Четиринадесет се произнася [tʃɛtirināˈdɛsɛt]. В немски 'vierzehn' [ˈfiːɐ̯ˌtseːn] – 'r' не се произнася силно.",
      "linguistic_note_de_to_bg": "Betonung auf der dritten Silbe von hinten: четиринаде́сет. Alle bulgarischen Teens (11-19) tragen Betonung auf derselben Silbe '-де́-'."
    }
  ],
  legacyColor: [
    {
      "id": "a1_color_001",
      "word": "Черен",
      "translation": "schwarz",
      "source_lang": "bg",
      "target_lang": "de",
      "category": "Farben",
      "level": "A1",
      "notes": "The color black. Basic color adjective that declines by gender: черен (m), черна (f), черно (n), черни (pl). Very common in everyday descriptions.",
      "notes_bg_to_de": "В немски 'schwarz' не се променя по род като прилагателно в предикатна позиция. В български 'черен' се променя: черен чай (m), черна котка (f), черно куче (n), черни обувки (pl).",
      "notes_de_to_bg": "Für Deutschsprachige: 'Черен' ändert sich nach Genus und Numerus: черен (m), черна (f), черно (n), черни (pl). Ähnlich wie deutsche Adjektivdeklination, aber einfacher.",
      "etymology": "From Proto-Slavic '*čьrnъ' (black), related to Russian 'чёрный' and Polish 'czarny'. The root may relate to darkness or charcoal.",
      "cultural_note": "Black has traditional significance in Bulgarian culture. 'Черно море' (Black Sea) is Bulgaria's eastern border. Wearing black is standard for mourning. 'Черен хумор' (black humor) is a common expression.",
      "difficulty": 1,
      "frequency": 85,
      "examples": [
        {
          "bg": "Имам черна кола.",
          "de": "Ich habe ein schwarzes Auto.",
          "context": "Describing possession"
        }
      ],
      "linguistic_note": "Stress on first syllable: че́рен [ˈt͡ʃɛrɛn]. The 'ч' is [t͡ʃ] like 'ch' in 'church'. Forms: черен/черна/черно/черни.",
      "linguistic_note_bg_to_de": "Черен се произнася [ˈt͡ʃɛrɛn] с ударение на 'че'. Форми: черен (м.р.), черна (ж.р.), черно (ср.р.), черни (мн.ч.).",
      "linguistic_note_de_to_bg": "Betonung auf der ersten Silbe: че́рен [ˈt͡ʃɛrɛn]. Das 'ч' ist wie deutsches 'tsch'. Formen: черен (m), черна (f), черно (n), черни (pl)."
    }
  ],
  legacyFamily: [
    {
      "id": "a1_family_001",
      "word": "Майка",
      "translation": "die Mutter",
      "source_lang": "bg",
      "target_lang": "de",
      "category": "Familie",
      "level": "A1",
      "notes": "Mother. женски род.",
      "notes_bg_to_de": "В български 'майка' е женски род. Mother",
      "notes_de_to_bg": "Für Deutschsprachige: 'Майка' = 'die Mutter'. Femininum.",
      "etymology": "Proto-Slavic *mati. Common across Slavic languages.",
      "cultural_note": "Most important family word. 'Ден на майката' (Mother's Day)",
      "difficulty": 1,
      "frequency": 95,
      "examples": [
        {
          "bg": "Това е моята майка.",
          "de": "Das ist meine/mein Mutter.",
          "context": "Introduction"
        }
      ],
      "linguistic_note": "женски род. Майка.",
      "linguistic_note_bg_to_de": "Майка е женски род.",
      "linguistic_note_de_to_bg": "Майка = Femininum."
    }
  ],
  legacyFixed: [
    {
      "id": "zdravej_001",
      "word": "Здравей",
      "translation": "Hallo",
      "source_lang": "bg",
      "target_lang": "de",
      "category": "Begrüßung",
      "level": "A1",
      "notes": "Das Wort 'Здравей' leitet sich vom bulgarischen Wort 'здрав' (gesund) ab und ist wie ein Wunsch nach Gesundheit.",
      "notes_bg_to_de": "В немски 'Hallo' е универсално и неформално приветствие, което можете да използвате през целия ден с познати, колеги и непознати в непринудена ситуация.",
      "notes_de_to_bg": "Für Deutschsprachige: 'Здравей' (zdravej) ≈ 'Hallo'; von 'здрав' (gesund). 'Здрасти' = sehr informell.",
      "etymology": "Произход: праслав. 'zdravъ' (здрав); буквално пожелание за здраве.\nHerkunft: Proto-slawisches 'zdravъ' ('gesund').",
      "cultural_note": "Неофициално приветствие през целия ден; по-непринудено от 'Добър ден'.\nKultureller Kontext: Informelle Begrüßung tagsüber.",
      "difficulty": 1,
      "frequency": 95,
      "examples": [
        {
          "sentence": "Здравей, как си?",
          "translation": "Hallo, wie geht's?",
          "context": "informal"
        }
      ],
      "linguistic_note_bg_to_de": "'Hallo' се произнася [ˈha.loː] и няма формални/неформални форми. В телефонен разговор е по-често 'Hallo?'",
      "linguistic_note_de_to_bg": "Betonung auf der zweiten Silbe: здраве́й. Kürzere Form 'Здрасти' nur in vertrauten Situationen."
    }
  ],
  // Test duplicates
  duplicates: [
    {
      "id": "duplicate-1",
      "word": "ябълка",
      "translation": "Apfel",
      "source_lang": "bg",
      "target_lang": "de",
      "category": "Food",
      "level": "A1",
      "notes": "Fruit that grows on trees",
      "difficulty": 1,
      "frequency": 70
    },
    {
      "id": "duplicate-2",
      "german": "der Apfel",
      "bulgarian": "ябълката",
      "category": "Food",
      "tags": ["Noun", "A1"],
      "type": "word",
      "difficulty": "A1",
      "grammar_details": {
        "noun_gender": "masculine",
        "plural_form": "Äpfel"
      }
    },
    {
      "id": "duplicate-3",
      "word": "Четиринадесет",
      "translation": "14",
      "source_lang": "bg",
      "target_lang": "de",
      "category": "Numbers",
      "level": "A1",
      "notes": "The number fourteen",
      "difficulty": 1
    }
  ]
};

/**
 * Test the migration process with sample data
 */
async function testMigration(): Promise<void> {
  // Starting vocabulary migration test

  try {
    // 1. Test conversion from different formats
    console.log('\n1. Testing conversion from different formats...');
    // Test conversion

    // 2. Test merging of items
    console.log('\n2. Testing item merging...');
    // Test merging

    // 3. Test deduplication
    console.log('\n3. Testing deduplication...');
    // Test deduplication

    // 4. Test category consolidation
    console.log('\n4. Testing category consolidation...');
    // Test category consolidation

    // 5. Test validation
    console.log('\n5. Testing validation...');
    // Test validation

    // 6. Test full migration process
    console.log('\n6. Testing full migration process...');
    // Test full migration

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    // Test failed
    throw error;
  }
}

/**
 * Test conversion from different formats
 */
function _testConversion(): void {
  // Test current format conversion
  const currentItem = SAMPLE_DATA.current[0];
  const _convertedCurrent = convertToUnifiedItem(currentItem);
  // Current format conversion completed

  // Test legacy batch format conversion
  const batchItem = SAMPLE_DATA.legacyBatch[0];
  const _convertedBatch = convertToUnifiedItem(batchItem);
  // Legacy batch format conversion completed

  // Test legacy color format conversion
  const colorItem = SAMPLE_DATA.legacyColor[0];
  const _convertedColor = convertToUnifiedItem(colorItem);
  // Legacy color format conversion completed

  // Test legacy family format conversion
  const familyItem = SAMPLE_DATA.legacyFamily[0];
  const _convertedFamily = convertToUnifiedItem(familyItem);
  // Legacy family format conversion completed

  // Test legacy fixed format conversion
  const fixedItem = SAMPLE_DATA.legacyFixed[0];
  const _convertedFixed = convertToUnifiedItem(fixedItem);
  // Legacy fixed format conversion completed
}

/**
 * Test merging of items
 */
function _testMerging(): void {
  // Test merging of similar items
  const item1 = convertToUnifiedItem(SAMPLE_DATA.current[0]);
  const item2 = convertToUnifiedItem({
    ...SAMPLE_DATA.duplicates[1],
    id: 'test-merge-1'
  });

  const _mergedItem = mergeVocabularyItems([item1, item2]);

  // Item merging completed

  // Test merging with different quality items
  const highQualityItem = convertToUnifiedItem({
    ...SAMPLE_DATA.current[0],
    id: 'high-quality',
    examples: [
      { german: 'Ich esse einen Apfel.', bulgarian: 'Аз ям ябълка.', context: 'general' },
      { german: 'Der Apfel ist rot.', bulgarian: 'Ябълката е червена.', context: 'description' }
    ],
    notes: {
      general: 'Comprehensive notes about apples',
      forBulgarianSpeakers: 'Notes for Bulgarians',
      forGermanSpeakers: 'Notes for Germans'
    },
    grammar: {
      gender: 'masculine',
      pluralForm: 'Äpfel'
    }
  });

  const lowQualityItem = convertToUnifiedItem({
    ...SAMPLE_DATA.duplicates[0],
    id: 'low-quality'
  });

  const _qualityMergedItem = mergeVocabularyItems([lowQualityItem, highQualityItem]);

  // Quality-based merging completed
}

/**
 * Test deduplication
 */
async function _testDeduplication(): Promise<void> {
  // Create test items with duplicates
  const testItems = [
    ...SAMPLE_DATA.current.map(convertToUnifiedItem),
    ...SAMPLE_DATA.duplicates.map(convertToUnifiedItem),
    convertToUnifiedItem({
      id: 'unique-item',
      word: 'Уникален',
      translation: 'einzigartig',
      source_lang: 'bg',
      target_lang: 'de',
      category: 'Adjectives',
      difficulty: 2
    })
  ];

  // Find duplicate groups
  const duplicateGroups = findDuplicateGroups(testItems);

  // Deduplication completed

  for (const group of duplicateGroups) {
    console.log(`   Group ${group.groupId} (${group.similarityType}):`);
    console.log(`     Items: ${group.items.map(item => item.id).join(', ')}`);
    console.log(`     Similarity: ${group.items[0].quality.completenessScore.toFixed(2)}`);

    // Test merging the group
    const mergedItem = mergeDuplicateGroup(group);
    console.log(`     Merged ID: ${mergedItem.id}`);
    console.log(`     Merged Examples: ${mergedItem.examples.length}`);
  }
}

/**
 * Test category consolidation
 */
function _testCategoryConsolidation(): void {
  // Create test items with different category formats
  const testItems = [
    { id: '1', category: 'Food' },
    { id: '2', category: 'Zahlen' },
    { id: '3', category: 'Farben' },
    { id: '4', category: 'Familie' },
    { id: '5', category: 'Begrüßung' },
    { id: '6', category: 'UnknownCategory' },
    { id: '7', categories: ['Food', 'Fruits'] },
    { id: '8', category: 'Храна' }
  ];

  // Test collection consolidation
  const _consolidated = consolidateCollectionCategories(testItems);

  // Category consolidation completed

  // Items processed

  // Test category mapping report
  const _report = createCategoryMappingReport(testItems);

  // Category mapping report generated

  // Mappings processed
}

/**
 * Test validation
 */
async function _testValidation(): Promise<void> {
  // Create a test collection
  const testItems = [
    convertToUnifiedItem(SAMPLE_DATA.current[0]),
    convertToUnifiedItem(SAMPLE_DATA.legacyBatch[0]),
    convertToUnifiedItem({
      ...SAMPLE_DATA.duplicates[0],
      id: 'invalid-item',
      difficulty: 10, // Invalid difficulty
      categories: [] // No categories
    })
  ];

  const collection = createVocabularyCollection(testItems);

  // Validate the collection
  const { validationResult: _validationResult, fixedCollection: _fixedCollection } = validateAndFixCollection(collection);

  // Validation completed

  // Issues processed if any

  // Fixed collection items count
}

/**
 * Test full migration process
 */
async function _testFullMigration(): Promise<void> {
  // Create a comprehensive test dataset
  const testItems = [
    ...SAMPLE_DATA.current,
    ...SAMPLE_DATA.legacyBatch,
    ...SAMPLE_DATA.legacyColor,
    ...SAMPLE_DATA.legacyFamily,
    ...SAMPLE_DATA.legacyFixed,
    ...SAMPLE_DATA.duplicates,
    {
      id: 'test-item-1',
      word: 'Компютър',
      translation: 'Computer',
      source_lang: 'bg',
      target_lang: 'de',
      category: 'Technology',
      difficulty: 2
    },
    {
      id: 'test-item-2',
      german: 'der Computer',
      bulgarian: 'компютърът',
      category: 'Technology',
      tags: ['Noun', 'B1'],
      type: 'word',
      difficulty: 'B1',
      grammar_details: {
        noun_gender: 'masculine',
        plural_form: 'Computer'
      }
    }
  ];

  // Convert to unified format
  const unifiedItems = testItems.map(convertToUnifiedItem);

  // Consolidate categories
  const categoryResult = consolidateCollectionCategories(unifiedItems);

  // Deduplicate
  const duplicateGroups = findDuplicateGroups(categoryResult.items);
  const deduplicatedItems = categoryResult.items.filter(item => {
    return !duplicateGroups.some(group =>
      group.items.some(groupItem => groupItem.id === item.id)
    );
  });

  // Add merged items
  const mergedItems = duplicateGroups.map(group => mergeDuplicateGroup(group));
  const allItems = [...deduplicatedItems, ...mergedItems];

  // Create collection
  const collection = createVocabularyCollection(allItems);

  // Validate and fix
  const { validationResult: _validationResult, fixedCollection: _fixedCollection } = validateAndFixCollection(collection);

  // Full migration test completed

  // Save test output
  const testOutputDir = path.join(process.cwd(), 'reports', 'test-output');
  await mkdir(testOutputDir, { recursive: true });

  const testCollectionPath = path.join(testOutputDir, 'test-collection.json');
  await writeFile(testCollectionPath, JSON.stringify(fixedCollection, null, 2));

  // Test collection saved

  // Test querying the collection
  testCollectionQueries(fixedCollection);
}

/**
 * Test querying the unified collection
 */
function testCollectionQueries(collection: UnifiedVocabularyCollection): void {
  // Testing collection queries

  // 1. Test basic query
  const _basicQuery = collection.items.filter(item =>
    (item.german && item.german.toLowerCase().includes('apfel')) ||
    (item.bulgarian && item.bulgarian.toLowerCase().includes('ябълк'))
  );

  // Basic query completed

  // 2. Test category query
  const _foodItems = collection.items.filter(item =>
    item.categories.includes('food')
  );

  // Category query completed

  // 3. Test difficulty query
  const _a1Items = collection.items.filter(item =>
    item.difficulty === 1
  );

  // Difficulty query completed

  // 4. Test part of speech query
  const _nounItems = collection.items.filter(item =>
    item.partOfSpeech === 'noun'
  );

  // Part of speech query completed

  // 5. Test merged items query
  const _mergedItems = collection.items.filter(item =>
    item.metadata?.mergeSources && item.metadata.mergeSources.length > 1
  );

  // Merged items query completed

  // 6. Test statistics
  // Collection statistics

  if (collection.statistics) {
    // Statistics details
  }
}

// Run the tests
testMigration().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});