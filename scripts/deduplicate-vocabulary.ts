import { readFile, writeFile } from 'node:fs/promises';

/**
 * Advanced vocabulary deduplication system
 * with semantic merging capabilities
 */
class VocabularyDeduplicator {
  private duplicateGroups: Map<string, any[]> = new Map();
  private mergeStrategies: Record<string, (items: any[]) => any> = {
    // Merge by semantic equivalence (same meaning)
    semantic: (items) => {
      // Keep the most complete version
      return items.reduce((best, current) => {
        const currentScore = this.calculateCompletenessScore(current);
        const bestScore = this.calculateCompletenessScore(best);
        return currentScore > bestScore ? current : best;
      });
    },

    // Merge aspect variations (perfective/imperfective verbs)
    aspect: (items) => {
      // Combine into single entry with aspect notes
      const baseItem = items[0];
      return {
        ...baseItem,
        metadata: {
          ...baseItem.metadata,
          notes: `${baseItem.metadata?.notes || ''}\n\nAspect variations: ${items.map(i => i.partOfSpeech).join(', ')}`
        },
        aspectVariations: items.map(item => ({
          id: item.id,
          partOfSpeech: item.partOfSpeech,
          examples: item.metadata?.examples || []
        }))
      };
    },

    // Merge POS variations (noun/adjective pairs)
    pos: (items) => {
      // Create separate entries with clear classification
      return items.map(item => ({
        ...item,
        categories: [...new Set([
          ...(item.categories || []),
          'grammar',
          item.partOfSpeech
        ])]
      }));
    }
  };

  private calculateCompletenessScore(item: any): number {
    let score = 0;
    if (item.metadata?.examples?.length) score += 10;
    if (item.metadata?.notes) score += 5;
    if (item.metadata?.examples?.every((e: any) => e.german && e.bulgarian)) score += 15;
    if (item.categories?.length && !item.categories.includes('uncategorized')) score += 5;
    return score;
  }

  private generateUniqueId(baseId: string, suffix: string): string {
    return `${baseId}-${suffix}-${Date.now().toString(36)}`;
  }

  async deduplicate(filePath: string): Promise<void> {
    const data = JSON.parse(await readFile(filePath, 'utf-8'));
    const originalCount = data.items.length;

    // Group duplicates by semantic key
    const semanticGroups = new Map<string, any[]>();
    data.items.forEach((item: any) => {
      const semanticKey = `${item.bulgarian.toLowerCase()}-${item.german.toLowerCase()}`;
      if (!semanticGroups.has(semanticKey)) {
        semanticGroups.set(semanticKey, []);
      }
      semanticGroups.get(semanticKey)?.push(item);
    });

    // Process each group
    const deduplicatedItems: any[] = [];
    const duplicateReport: any[] = [];

    semanticGroups.forEach((group, semanticKey) => {
      if (group.length === 1) {
        deduplicatedItems.push(group[0]);
        return;
      }

      // Determine merge strategy
      const strategy = this.determineMergeStrategy(group);
      const mergedItem = this.mergeStrategies[strategy](group);

      // Handle ID conflicts
      if (group.some(item => item.id === mergedItem.id)) {
        mergedItem.id = this.generateUniqueId(
          mergedItem.id.replace(/-.*$/, ''),
          strategy
        );
      }

      deduplicatedItems.push(mergedItem);
      duplicateReport.push({
        semanticKey,
        originalCount: group.length,
        strategy,
        mergedId: mergedItem.id,
        originalIds: group.map(item => item.id)
      });
    });

    // Update data
    const deduplicatedData = {
      ...data,
      items: deduplicatedItems,
      metadata: {
        ...data.metadata,
        deduplication: {
          timestamp: new Date().toISOString(),
          originalCount,
          deduplicatedCount: deduplicatedItems.length,
          reductionRate: `${Math.round(((originalCount - deduplicatedItems.length) / originalCount) * 100)}%`
        }
      }
    };

    // Save results
    await writeFile(filePath, JSON.stringify(deduplicatedData, null, 2));
    await writeFile(
      'data/vocabulary-deduplication-report.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        duplicates: duplicateReport,
        summary: {
          originalCount,
          deduplicatedCount: deduplicatedItems.length,
          reductionRate: `${Math.round(((originalCount - deduplicatedItems.length) / originalCount) * 100)}%`
        }
      }, null, 2)
    );

    console.log(`✅ Deduplication complete`);
    console.log(`📊 Original items: ${originalCount}`);
    console.log(`📊 Deduplicated items: ${deduplicatedItems.length}`);
    console.log(`📈 Reduction rate: ${Math.round(((originalCount - deduplicatedItems.length) / originalCount) * 100)}%`);
    console.log(`📋 Report saved to data/vocabulary-deduplication-report.json`);
  }

  private determineMergeStrategy(group: any[]): string {
    // Check for aspect variations (verbs)
    const isAspectVariation = group.every(item =>
      item.partOfSpeech.includes('verb') &&
      (item.bulgarian.includes('(perfektiv)') || item.bulgarian.includes('(imperfektiv)'))
    );

    if (isAspectVariation) return 'aspect';

    // Check for POS variations
    const uniquePOS = new Set(group.map(item => item.partOfSpeech));
    if (uniquePOS.size > 1) return 'pos';

    // Default to semantic merge
    return 'semantic';
  }
}

// CLI Usage
const deduplicator = new VocabularyDeduplicator();
deduplicator.deduplicate(process.argv[2])
  .catch(console.error);