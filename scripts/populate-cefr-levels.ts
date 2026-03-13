import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * CEFR Level Inference Script (Improved)
 * 
 * Populates cefrLevel field for vocabulary items based on:
 * 1. Difficulty level (primary factor, highest weight)
 * 2. Category difficulty patterns
 * 3. Part of speech complexity
 * 4. Word length and complexity
 * 5. Source material (Peace Corps = beginner)
 */

// CEFR levels
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

// Category complexity mapping (1-5 scale)
const CATEGORY_COMPLEXITY: Record<string, number> = {
  // A1 - Beginner (basic vocabulary)
  'greetings': 1,
  'numbers': 1,
  'family': 1,
  'food': 1,
  'colors': 1,
  'animals': 1,
  'body-parts': 1,
  'clothing': 1,
  'home': 1,
  
  // A2 - Elementary (common topics)
  'time': 2,
  'weather': 2,
  'everyday-phrases': 2,
  
  // B1 - Intermediate (specific domains)
  'nature': 3,
  'transport': 3,
  'professions': 3,
  'places': 3,
  
  // B2 - Upper Intermediate (complex topics)
  'technology': 4,
  'grammar': 4,
  
  // C1 - Advanced (abstract concepts)
  'culture': 5
};

// Part of speech complexity (1-5 scale)
const POS_COMPLEXITY: Record<string, number> = {
  // A1 - Beginner (most common)
  'number': 1,
  'article': 1,
  'noun': 1,
  'pronoun': 1,
  'interjection': 1,
  
  // A2 - Elementary
  'adjective': 2,
  'verb': 2,
  'phrase': 2,
  
  // B1 - Intermediate
  'adverb': 3,
  'preposition': 3,
  
  // B2 - Upper Intermediate
  'conjunction': 4,
  
  // C1 - Advanced
  'expression': 5
};

// Source complexity (1-5 scale)
const SOURCE_COMPLEXITY: Record<string, number> = {
  'current': 2,
  'merged': 2,
  'peace-corps-pdf': 1, // Peace Corps materials are typically beginner
  'langenscheidt': 3,
  'dwds': 4
};

// Difficulty to CEFR direct mapping (when difficulty is reliable)
function difficultyToCEFR(difficulty: number | null | undefined): CEFRLevel {
  if (!difficulty || difficulty === null) return 'A1';
  
  const mapping: Record<number, CEFRLevel> = {
    1: 'A1',
    2: 'A2',
    3: 'B1',
    4: 'B2',
    5: 'C1'
  };
  
  return mapping[Math.min(5, Math.max(1, difficulty))] || 'A1';
}

// Calculate word complexity score (1-5 scale, conservative)
function calculateWordComplexity(text: string): number {
  if (!text) return 1;
  
  const length = text.length;
  const wordCount = text.split(/\s+/).length;
  
  // Single words
  if (wordCount === 1) {
    if (length <= 6) return 1;
    if (length <= 10) return 2;
    if (length <= 15) return 3;
    return 4;
  }
  
  // Multi-word phrases
  if (wordCount <= 2) return 2;
  if (wordCount <= 4) return 3;
  return 4;
}

// Infer CEFR level with weighted factors
function inferCEFRLevel(item: any): CEFRLevel {
  const factors: number[] = [];
  const weights: number[] = [];
  
  // Factor 1: Difficulty level (HIGH weight - 5x)
  if (item.difficulty && typeof item.difficulty === 'number') {
    factors.push(item.difficulty);
    weights.push(5);
  }
  
  // Factor 2: Category complexity (MEDIUM weight - 2x)
  if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
    const catComplexities = item.categories
      .map((cat: string) => CATEGORY_COMPLEXITY[cat] || 2) // Default to 2 (A2)
      .filter((n: number) => n !== undefined);
    if (catComplexities.length > 0) {
      const avgCat = catComplexities.reduce((a: number, b: number) => a + b, 0) / catComplexities.length;
      factors.push(avgCat);
      weights.push(2);
    }
  }
  
  // Factor 3: Part of speech complexity (MEDIUM-LOW weight - 1.5x)
  if (item.partOfSpeech && POS_COMPLEXITY[item.partOfSpeech]) {
    factors.push(POS_COMPLEXITY[item.partOfSpeech]);
    weights.push(1.5);
  }
  
  // Factor 4: Word complexity (LOW weight - 1x)
  const deComplexity = calculateWordComplexity(item.german || '');
  const bgComplexity = calculateWordComplexity(item.bulgarian || '');
  const avgWordComplexity = (deComplexity + bgComplexity) / 2;
  factors.push(avgWordComplexity);
  weights.push(1);
  
  // Factor 5: Source complexity (MEDIUM-LOW weight - 1.5x)
  if (item.examples && Array.isArray(item.examples) && item.examples.length > 0) {
    const sources = item.examples
      .map((ex: any) => ex.source)
      .filter((s: string) => s && SOURCE_COMPLEXITY[s]);
    if (sources.length > 0) {
      const avgSource = sources.reduce((a: number, b: number) => a + b, 0) / sources.length;
      factors.push(avgSource);
      weights.push(1.5);
    }
  }
  
  // Calculate weighted average
  if (factors.length === 0) {
    return 'A1'; // Default to beginner
  }
  
  // Weighted average calculation
  let totalWeight = 0;
  let weightedSum = 0;
  for (let i = 0; i < factors.length; i++) {
    weightedSum += factors[i] * weights[i];
    totalWeight += weights[i];
  }
  const avgScore = weightedSum / totalWeight;
  
  // Map to CEFR level (conservative thresholds)
  if (avgScore <= 1.3) return 'A1';
  if (avgScore <= 2.3) return 'A2';
  if (avgScore <= 3.3) return 'B1';
  if (avgScore <= 4.3) return 'B2';
  return 'C1';
}

// Main function to populate CEFR levels
export function populateCEFRLevels(data: any[]): any[] {
  console.log(`Processing ${data.length} vocabulary items...`);
  
  const stats = {
    total: data.length,
    updated: 0,
    alreadyHad: 0,
    a1: 0,
    a2: 0,
    b1: 0,
    b2: 0,
    c1: 0
  };
  
  const processed = data.map(item => {
    // Check if already has cefrLevel
    if (item.cefrLevel) {
      stats.alreadyHad++;
      return item;
    }
    
    // Infer CEFR level
    const cefrLevel = inferCEFRLevel(item);
    
    // Update stats
    stats[cefrLevel.toLowerCase() as keyof typeof stats]++;
    stats.updated++;
    
    // Return updated item
    return {
      ...item,
      cefrLevel,
      updatedAt: new Date().toISOString(),
      cefrInference: {
        inferredAt: new Date().toISOString(),
        difficulty: item.difficulty,
        categories: item.categories,
        partOfSpeech: item.partOfSpeech,
        sources: item.examples?.map((ex: any) => ex.source).filter(Boolean),
        method: 'multi-factor-inference-v2'
      }
    };
  });
  
  console.log('\n=== CEFR Level Inference Results ===');
  console.log(`Total items: ${stats.total}`);
  console.log(`Already had CEFR: ${stats.alreadyHad}`);
  console.log(`Updated: ${stats.updated}`);
  console.log(`\nDistribution:`);
  console.log(`  A1 (Beginner): ${stats.a1} (${((stats.a1 / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  A2 (Elementary): ${stats.a2} (${((stats.a2 / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  B1 (Intermediate): ${stats.b1} (${((stats.b1 / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  B2 (Upper Intermediate): ${stats.b2} (${((stats.b2 / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  C1 (Advanced): ${stats.c1} (${((stats.c1 / stats.total) * 100).toFixed(1)}%)`);
  
  return processed;
}

// Always run CLI if arguments provided
if (process.argv.length > 2) {
  const inputFile = process.argv[2] || 'data/unified-vocabulary.json';
  const outputFile = process.argv[3] || 'data/unified-vocabulary-with-cefr.json';
  
  try {
    console.log(`Reading from: ${inputFile}`);
    const data = JSON.parse(readFileSync(inputFile, 'utf-8'));
    
    const processed = populateCEFRLevels(data);
    
    console.log(`\nWriting to: ${outputFile}`);
    writeFileSync(outputFile, JSON.stringify(processed, null, 2), 'utf-8');
    console.log('\nDone! ✓');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
