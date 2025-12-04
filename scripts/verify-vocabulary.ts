import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'glob';
import { VocabularyItemSchema } from '../src/lib/schemas/vocabulary.js';
import { z } from 'zod';

/**
 * Comprehensive vocabulary data verification system
 * with detailed error reporting and automatic fixes
 */
class VocabularyVerifier {
  private issues: Array<{
    id: string;
    type: string;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    data?: any;
  }> = [];

  // Verification checks with automatic correction capabilities
  private checks = [
    {
      name: 'ID Uniqueness',
      test: (items: any[]) => {
        const idMap = new Map();
        return items.filter(item => {
          if (idMap.has(item.id)) {
            this.issues.push({
              id: item.id,
              type: 'duplicate_id',
              message: `Duplicate ID found: ${item.id}`,
              severity: 'critical',
              data: { existing: idMap.get(item.id), duplicate: item }
            });
            return false;
          }
          idMap.set(item.id, item);
          return true;
        });
      },
      fix: (items: any[]) => {
        const idMap = new Map();
        return items.map(item => {
          if (idMap.has(item.id)) {
            const newId = `${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            this.issues.push({
              id: item.id,
              type: 'duplicate_id_fixed',
              message: `Duplicate ID fixed: ${item.id} → ${newId}`,
              severity: 'critical',
              data: { oldId: item.id, newId }
            });
            return { ...item, id: newId };
          }
          idMap.set(item.id, item);
          return item;
        });
      }
    },
    {
      name: 'partOfSpeech Consistency',
      test: (items: any[]) => {
        const posMap = new Map<string, Set<string>>();
        items.forEach(item => {
          const baseId = item.id.replace(/_\d+$/, '');
          if (!posMap.has(baseId)) posMap.set(baseId, new Set());
          posMap.get(baseId)?.add(item.partOfSpeech);
        });

        return items.filter(item => {
          const baseId = item.id.replace(/_\d+$/, '');
          const posSet = posMap.get(baseId) || new Set();
          if (posSet.size > 2) { // Allow noun + adjective pairs
            this.issues.push({
              id: item.id,
              type: 'inconsistent_pos',
              message: `Inconsistent partOfSpeech for ${baseId}: ${Array.from(posSet).join(', ')}`,
              severity: 'high',
              data: { baseId, posSet: Array.from(posSet) }
            });
            return false;
          }
          return true;
        });
      },
      fix: (items: any[]) => {
        const posRules: Record<string, string[]> = {
          'бърз': ['adjective'],
          'болен': ['adjective'],
          'весел': ['adjective'],
          'аз': ['pronoun'],
          'ако': ['conjunction'],
          'в': ['preposition']
        };

        return items.map(item => {
          const baseId = item.id.replace(/_\d+$/, '');
          if (posRules[baseId] && !posRules[baseId].includes(item.partOfSpeech)) {
            this.issues.push({
              id: item.id,
              type: 'pos_fixed',
              message: `Fixed partOfSpeech for ${item.id}: ${item.partOfSpeech} → ${posRules[baseId][0]}`,
              severity: 'high',
              data: { oldPos: item.partOfSpeech, newPos: posRules[baseId][0] }
            });
            return { ...item, partOfSpeech: posRules[baseId][0] };
          }
          return item;
        });
      }
    },
    {
      name: 'Example Completeness',
      test: (items: any[]) => {
        return items.filter(item => {
          if (!item.metadata?.examples || item.metadata.examples.length === 0) {
            this.issues.push({
              id: item.id,
              type: 'missing_examples',
              message: `Missing examples for ${item.id}`,
              severity: 'medium'
            });
            return false;
          }
          return true;
        });
      },
      fix: (items: any[]) => {
        const exampleTemplates = {
          adjective: [
            { german: 'Er ist {german}.', bulgarian: 'Той е {bulgarian}.' },
            { german: 'Sie ist {german}.', bulgarian: 'Тя е {bulgarian}.' },
            { german: 'Es ist {german}.', bulgarian: 'То е {bulgarian}.' }
          ],
          noun: [
            { german: 'Ich habe {article} {german}.', bulgarian: 'Имам {bulgarian}.' },
            { german: 'Das ist {article} {german}.', bulgarian: 'Това е {bulgarian}.' }
          ],
          verb: [
            { german: 'Ich {german} jeden Tag.', bulgarian: 'Аз {bulgarian} всеки ден.' },
            { german: 'Er {german} jetzt.', bulgarian: 'Той {bulgarian} сега.' }
          ]
        };

        return items.map(item => {
          if (!item.metadata?.examples || item.metadata.examples.some((e: any) => !e.german)) {
            const templates = exampleTemplates[item.partOfSpeech as keyof typeof exampleTemplates]
              || exampleTemplates.noun;
            const examples = templates.map(template => ({
              german: template.german
                .replace('{german}', item.german)
                .replace('{article}', this.getGermanArticle(item.german)),
              bulgarian: template.bulgarian.replace('{bulgarian}', item.bulgarian),
              context: 'Generated example'
            }));

            this.issues.push({
              id: item.id,
              type: 'examples_generated',
              message: `Generated ${examples.length} examples for ${item.id}`,
              severity: 'medium',
              data: { examples }
            });

            return {
              ...item,
              metadata: {
                ...item.metadata,
                examples
              }
            };
          }
          return item;
        });
      }
    },
    {
      name: 'German Translation Quality',
      test: (items: any[]) => {
        const badPatterns = [
          /wenn,\s*falls/i,
          /Sofia\/hier/i,
          /Ich\s+bin\s+\w+\s+\w+/i,
          /dem\s+\w+\s+\w+/i,
          /\/\// // Double slashes
        ];

        return items.filter(item => {
          if (!item.metadata?.examples) return true;

          const hasBadExamples = item.metadata.examples.some((example: any) => {
            return badPatterns.some(pattern => pattern.test(example.german));
          });

          if (hasBadExamples) {
            this.issues.push({
              id: item.id,
              type: 'poor_translation',
              message: `Poor German translation quality in ${item.id}`,
              severity: 'high',
              data: {
                examples: item.metadata.examples.filter((example: any) =>
                  badPatterns.some(pattern => pattern.test(example.german))
                )
              }
            });
            return false;
          }
          return true;
        });
      },
      fix: (items: any[]) => {
        // This would be enhanced with proper translation logic
        // For now, we'll just flag these for manual review
        return items;
      }
    }
  ];

  private getGermanArticle(word: string): string {
    // Simple heuristic for German articles
    const firstLetter = word.charAt(0).toLowerCase();
    if (['a', 'o', 'u'].includes(firstLetter)) return 'der';
    if (['e', 'i'].includes(firstLetter)) return 'die';
    return 'das';
  }

  async verify(filePath: string, fix = false): Promise<void> {
    const data = JSON.parse(await readFile(filePath, 'utf-8'));
    let items = data.items;

    console.log(`🔍 Verifying ${items.length} vocabulary items...`);

    // Run tests
    this.checks.forEach(check => {
      items = check.test(items);
    });

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      totalItems: data.items.length,
      verifiedItems: items.length,
      issues: this.issues,
      passRate: `${Math.round((items.length / data.items.length) * 100)}%`
    };

    await writeFile(
      'data/vocabulary-verification-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log(`✅ Verification complete. Report saved to data/vocabulary-verification-report.json`);
    console.log(`📊 Pass rate: ${report.passRate}`);
    console.log(`⚠️  Issues found: ${this.issues.length}`);

    if (fix) {
      console.log('🔧 Applying automatic fixes...');
      let fixedItems = [...items];

      this.checks.forEach(check => {
        if (check.fix) {
          fixedItems = check.fix(fixedItems);
        }
      });

      // Update the original file with fixes
      const fixedData = { ...data, items: fixedItems };
      await writeFile(filePath, JSON.stringify(fixedData, null, 2));

      console.log(`💾 Fixed data saved to ${filePath}`);
    }
  }
}

// CLI Usage
const verifier = new VocabularyVerifier();
const [,, filePath, fixFlag] = process.argv;
verifier.verify(filePath, fixFlag === '--fix')
  .catch(console.error);