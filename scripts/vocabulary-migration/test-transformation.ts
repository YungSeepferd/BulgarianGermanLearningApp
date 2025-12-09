/**
 * Test script to verify vocabulary item transformation functions
 */
import { convertToUnifiedItem } from './merging-utils.js';

// Test data
const testItems = [
  // Current format
  {
    id: "v001-apfel",
    german: "der Apfel",
    bulgarian: "ябълката",
    category: "Food",
    type: "noun",
    difficulty: "A1"
  },
  // Legacy format (BG -> DE)
  {
    id: "a1_number_014",
    word: "Четиринадесет",
    translation: "vierzehn",
    source_lang: "bg",
    target_lang: "de",
    category: "Zahlen",
    level: "A1"
  },
  // Legacy format (DE -> BG)
  {
    id: "test-de-bg",
    word: "Haus",
    translation: "къща",
    source_lang: "de",
    target_lang: "bg",
    category: "Household"
  },
  // Alternative field names
  {
    id: "test-alt-fields",
    de: "Brot",
    bg: "хляб",
    category: "Food"
  },
  // Incomplete item
  {
    id: "test-incomplete",
    german: "Wasser"
  }
];

// Test the transformation functions
console.log("Testing vocabulary item transformation functions...");
console.log("=".repeat(60));

for (const [index, item] of testItems.entries()) {
  console.log(`\nTest Item ${index + 1}:`);
  console.log("Input:", JSON.stringify(item, null, 2));

  try {
    const result = convertToUnifiedItem(item);
    console.log("Output:", JSON.stringify(result, null, 2));

    // Verify translation content
    if (result.german === 'unknown' || result.bulgarian === 'unknown') {
      console.log("❌ ERROR: Translation content not extracted properly!");
      console.log(`   German: "${result.german}", Bulgarian: "${result.bulgarian}"`);
    } else {
      console.log("✅ SUCCESS: Translation content extracted correctly");
      console.log(`   German: "${result.german}", Bulgarian: "${result.bulgarian}"`);
    }
  } catch (error) {
    console.log("❌ ERROR:", error instanceof Error ? error.message : String(error));
  }
}

console.log("\n" + "=".repeat(60));
console.log("Transformation test completed.");