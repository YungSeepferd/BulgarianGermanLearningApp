import { readFile, writeFile } from 'node:fs/promises';

/**
 * Vocabulary data cleaning pipeline
 * with comprehensive data normalization
 */
class VocabularyCleaner {
  private cleaningRules = [
    {
      name: 'Standardize Categories',
      test: (item: any) => item.categories && Array.isArray(item.categories),
      fix: (item: any) => ({
        ...item,
        categories: item.categories ? item.categories.map((category: string) =>
          category.toLowerCase().trim().replace(/\s+/g, '_')
        ) : ['uncategorized']
      })
    },
    {
      name: 'Normalize Difficulty',
      test: (item: any) => typeof item.difficulty === 'number',
      fix: (item: any) => ({
        ...item,
        difficulty: Math.min(5, Math.max(1, Math.round(item.difficulty)))
      })
    },
   {
     name: 'Initialize Metadata',
     test: (item: any) => item.metadata !== undefined,
     fix: (item: any) => ({
       ...item,
       metadata: item.metadata || {}
     })
   },
   {
     name: 'Clean Metadata',
     test: (item: any) => item.metadata,
     fix: (item: any) => ({
       ...item,
       metadata: {
         ...item.metadata,
         examples: item.metadata.examples && Array.isArray(item.metadata.examples)
           ? item.metadata.examples.map((example: any) => ({
               ...example,
               german: example.german?.trim(),
               bulgarian: example.bulgarian?.trim(),
               context: example.context?.trim() || 'general'
             }))
           : item.metadata.examples || [],
         notes: item.metadata.notes?.trim()
       }
     })
   },
    {
      name: 'Add Timestamps',
      test: (item: any) => item.createdAt !== undefined && item.updatedAt !== undefined,
      fix: (item: any) => {
        // Convert ISO strings to Date objects
        const createdAt = typeof item.createdAt === 'string'
          ? new Date(item.createdAt)
          : item.createdAt || new Date();
        const updatedAt = new Date();

        return {
          ...item,
          createdAt,
          updatedAt
        };
      }
    },
    {
      name: 'Initialize Boolean Fields',
      test: (item: any) => item.isCommon !== undefined && item.isVerified !== undefined,
      fix: (item: any) => ({
        ...item,
        isCommon: item.isCommon !== undefined ? Boolean(item.isCommon) : false,
        isVerified: item.isVerified !== undefined ? Boolean(item.isVerified) : false
      })
    },
    {
      name: 'Standardize Boolean Fields',
      test: (item: any) => typeof item.isCommon === 'boolean' && typeof item.isVerified === 'boolean',
      fix: (item: any) => ({
        ...item,
        isCommon: Boolean(item.isCommon),
        isVerified: Boolean(item.isVerified)
      })
    },
   {
     name: 'Initialize partOfSpeech',
     test: (item: any) => item.partOfSpeech !== undefined,
     fix: (item: any) => ({
       ...item,
       partOfSpeech: item.partOfSpeech || 'noun'
     })
   },
   {
     name: 'Normalize partOfSpeech',
     test: (item: any) => item.partOfSpeech && typeof item.partOfSpeech === 'string',
     fix: (item: any) => ({
       ...item,
       partOfSpeech: item.partOfSpeech.toLowerCase().trim()
     })
   },
  ];

  async clean(filePath: string): Promise<void> {
    const data = JSON.parse(await readFile(filePath, 'utf-8'));
    const originalCount = data.items.length;

    // Apply cleaning rules
    const cleanedItems = data.items.map((item: any) => {
      // Create a safe copy with proper initialization
      let cleanedItem = {
        id: 'temp-' + Math.random().toString(36).substring(2, 9),
        german: 'unknown',
        bulgarian: 'unknown',
        partOfSpeech: 'noun',
        difficulty: 1,
        categories: ['uncategorized'],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCommon: false,
        isVerified: false,
        ...item
      };

      this.cleaningRules.forEach(rule => {
        try {
          if (!rule.test(cleanedItem)) {
            cleanedItem = rule.fix(cleanedItem);
          }
        } catch (ruleError) {
          console.warn(`⚠️ Rule "${rule.name}" failed:`, ruleError instanceof Error ? ruleError.message : ruleError);
        }
      });
      return cleanedItem;
    });

    // Validate against schema
    const validationResult = await this.validateAgainstSchema(cleanedItems);
    if (!validationResult.valid) {
      console.error('❌ Schema validation failed after cleaning');
      console.error(validationResult.errors);
      throw new Error('Schema validation failed');
    }

    // Update data
    const cleanedData = {
      ...data,
      items: cleanedItems,
      metadata: {
        ...data.metadata,
        cleaning: {
          timestamp: new Date().toISOString(),
          originalCount,
          cleanedCount: cleanedItems.length,
          rulesApplied: this.cleaningRules.map(rule => rule.name)
        }
      }
    };

    // Save results
    await writeFile(filePath, JSON.stringify(cleanedData, null, 2));
    await writeFile(
      'data/vocabulary-cleaning-report.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
          originalCount,
          cleanedCount: cleanedItems.length,
          validationPassed: validationResult.valid
        },
        schemaValidation: validationResult,
        rulesApplied: this.cleaningRules.map(rule => rule.name)
      }, null, 2)
    );

    console.log(`✅ Cleaning complete`);
    console.log(`📊 Items processed: ${originalCount}`);
    console.log(`📋 Report saved to data/vocabulary-cleaning-report.json`);
  }

  private async validateAgainstSchema(items: any[]) {
    // Dynamic import to avoid circular dependencies
    try {
      const { VocabularyItemSchema } = await import('../src/lib/schemas/vocabulary.js');
      const result = {
        valid: true,
        errors: [] as Array<{ id: string; errors: string; details?: any }>
      };

      for (const item of items) {
        try {
          const validation = VocabularyItemSchema.safeParse(item);
          if (!validation.success) {
            result.valid = false;
            result.errors.push({
              id: item.id || 'unknown',
              errors: validation.error.errors.map((e: any) =>
                `${e.path.join('.')}: ${e.message}`
              ).join(', '),
              details: validation.error.flatten()
            });
          }
        } catch (itemError) {
          result.valid = false;
          result.errors.push({
            id: item.id || 'unknown',
            errors: `Item validation failed: ${itemError instanceof Error ? itemError.message : String(itemError)}`
          });
        }
      }

      return result;
    } catch (importError) {
      console.error('❌ Failed to import vocabulary schema:', importError);
      throw new Error(`Schema import failed: ${importError instanceof Error ? importError.message : String(importError)}`);
    }
  }
}

// CLI Usage
const cleaner = new VocabularyCleaner();
cleaner.clean(process.argv[2])
  .catch(console.error);