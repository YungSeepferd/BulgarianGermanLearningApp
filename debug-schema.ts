// Debug script to check UnifiedVocabularyItemSchema
import { UnifiedVocabularyItemSchema } from './src/lib/schemas/unified-vocabulary.ts';

const item = {
  id: 'schule_001',
  german: 'die Schule',
  bulgarian: 'училище',
  partOfSpeech: 'noun' as const,
  difficulty: 2,
  categories: ['education'],
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    declension: {
      Nominative: { singular: 'die Schule', plural: 'die Schulen' }
    },
    links: [
      { label: 'DWDS', url: 'https://www.dwds.de/wb/Schule' }
    ]
  },
  examples: []
};

const r = UnifiedVocabularyItemSchema.safeParse(item);
console.log('Success:', r.success);
if (!r.success) {
  console.log('Errors:');
  r.error.errors.forEach(e => {
    console.log(`  Path: ${e.path.join('.')}, Message: ${e.message}`);
  });
}
