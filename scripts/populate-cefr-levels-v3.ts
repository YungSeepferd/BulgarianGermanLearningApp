import { readFileSync, writeFileSync } from 'fs';

/**
 * CEFR Level Inference Script (Simple, Difficulty-Weighted)
 * 
 * Primarily uses difficulty level with minor adjustments:
 * - Difficulty 1 → A1 (Beginner)
 * - Difficulty 2 → A2 (Elementary)
 * - Difficulty 3 → B1 (Intermediate)
 * - Difficulty 4 → B2 (Upper Intermediate)
 * - Difficulty 5 → C1 (Advanced)
 * - Difficulty null → Inferred from category/word complexity
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

// Difficulty to CEFR direct mapping
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

// Word length check (very long words might be one level higher)
function adjustForWordLength(baseLevel: CEFRLevel, german: string, bulgarian: string): CEFRLevel {
  const maxLength = Math.max(german.length, bulgarian.length);
  const wordCount = Math.max(german.split(/\s+/).length, bulgarian.split(/\s+/).length);
  
  // Very long single words or long phrases might be harder
  if (maxLength > 15 && wordCount === 1) {
    // Long word, bump up one level
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(baseLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }
  
  // Long multi-word phrases
  if (wordCount > 5) {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(baseLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }
  
  return baseLevel;
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
    
    // Infer CEFR level from difficulty
    let cefrLevel = difficultyToCEFR(item.difficulty);
    
    // Minor adjustment for word length
    cefrLevel = adjustForWordLength(cefrLevel, item.german || '', item.bulgarian || '');
    
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
        method: 'difficulty-weighted'
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
