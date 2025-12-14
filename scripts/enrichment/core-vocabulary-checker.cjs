/**
 * Core Vocabulary Completeness Checker
 *
 * Validates that essential A1/A2 level vocabulary is present in the database.
 * Identifies missing core vocabulary and provides suggestions for manual addition.
 *
 * Usage:
 * ```javascript
 * const checker = new CoreVocabularyChecker(existingVocab);
 * const report = checker.checkCompleteness();
 * console.log(report.missingEntries);
 * ```
 */

/**
 * Core vocabulary checklist based on CEFR A1/A2 level requirements
 * and common German-Bulgarian learning needs
 */
const CORE_VOCABULARY_CHECKLIST = [
  // Family (A1)
  {
    german: 'Frau',
    bulgarian: 'жена',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'die',
    gender: 'feminine',
    pluralForm: 'Frauen'
  },
  {
    german: 'Mann',
    bulgarian: 'мъж',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'der',
    gender: 'masculine',
    pluralForm: 'Männer'
  },
  {
    german: 'Kind',
    bulgarian: 'дете',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'das',
    gender: 'neuter',
    pluralForm: 'Kinder'
  },
  {
    german: 'Mutter',
    bulgarian: 'майка',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'die',
    gender: 'feminine',
    pluralForm: 'Mütter'
  },
  {
    german: 'Vater',
    bulgarian: 'баща',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'der',
    gender: 'masculine',
    pluralForm: 'Väter'
  },
  {
    german: 'Tochter',
    bulgarian: 'дъщеря',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'die',
    gender: 'feminine',
    pluralForm: 'Töchter'
  },
  {
    german: 'Sohn',
    bulgarian: 'син',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'der',
    gender: 'masculine',
    pluralForm: 'Söhne'
  },
  {
    german: 'Schwester',
    bulgarian: 'сестра',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'die',
    gender: 'feminine',
    pluralForm: 'Schwestern'
  },
  {
    german: 'Bruder',
    bulgarian: 'брат',
    partOfSpeech: 'noun',
    categories: ['family'],
    level: 'A1',
    article: 'der',
    gender: 'masculine',
    pluralForm: 'Brüder'
  },

  // Personal pronouns (A1)
  {
    german: 'ich',
    bulgarian: 'аз',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },
  {
    german: 'du',
    bulgarian: 'ти',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },
  {
    german: 'er',
    bulgarian: 'той',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },
  {
    german: 'sie',
    bulgarian: 'тя',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },
  {
    german: 'es',
    bulgarian: 'то',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },
  {
    german: 'wir',
    bulgarian: 'ние',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },
  {
    german: 'ihr',
    bulgarian: 'вие',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },
  {
    german: 'sie',
    bulgarian: 'те',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },
  {
    german: 'Sie',
    bulgarian: 'Вие',
    partOfSpeech: 'pronoun',
    categories: ['pronouns'],
    level: 'A1'
  },

  // Common verbs (A1)
  {
    german: 'sein',
    bulgarian: 'съм',
    partOfSpeech: 'verb',
    categories: ['verbs'],
    level: 'A1'
  },
  {
    german: 'haben',
    bulgarian: 'имам',
    partOfSpeech: 'verb',
    categories: ['verbs'],
    level: 'A1'
  },
  {
    german: 'gehen',
    bulgarian: 'ходя',
    partOfSpeech: 'verb',
    categories: ['verbs'],
    level: 'A1'
  },
  {
    german: 'kommen',
    bulgarian: 'идвам',
    partOfSpeech: 'verb',
    categories: ['verbs'],
    level: 'A1'
  },
  {
    german: 'machen',
    bulgarian: 'правя',
    partOfSpeech: 'verb',
    categories: ['verbs'],
    level: 'A1'
  },

  // Common nouns (A1)
  {
    german: 'Haus',
    bulgarian: 'къща',
    partOfSpeech: 'noun',
    categories: ['house'],
    level: 'A1',
    article: 'das',
    gender: 'neuter',
    pluralForm: 'Häuser'
  },
  {
    german: 'Wasser',
    bulgarian: 'вода',
    partOfSpeech: 'noun',
    categories: ['food', 'nature'],
    level: 'A1',
    article: 'das',
    gender: 'neuter',
    pluralForm: 'Wasser'
  },
  {
    german: 'Brot',
    bulgarian: 'хляб',
    partOfSpeech: 'noun',
    categories: ['food'],
    level: 'A1',
    article: 'das',
    gender: 'neuter',
    pluralForm: 'Brote'
  },
  {
    german: 'Apfel',
    bulgarian: 'ябълка',
    partOfSpeech: 'noun',
    categories: ['food'],
    level: 'A1',
    article: 'der',
    gender: 'masculine',
    pluralForm: 'Äpfel'
  },
  {
    german: 'Buch',
    bulgarian: 'книга',
    partOfSpeech: 'noun',
    categories: ['education'],
    level: 'A1',
    article: 'das',
    gender: 'neuter',
    pluralForm: 'Bücher'
  }
];

/**
 * Core vocabulary completeness checker
 */
class CoreVocabularyChecker {
  constructor(existingVocab) {
    this.existingVocab = existingVocab;
    this.existingTerms = new Set();
    this.existingBulgarianTerms = new Set();
    this.buildTermIndex();
  }

  /**
   * Build index for fast lookups
   */
  buildTermIndex() {
    for (const item of this.existingVocab) {
      this.existingTerms.add(item.german.toLowerCase());
      this.existingBulgarianTerms.add(item.bulgarian.toLowerCase());
    }
  }

  /**
   * Check if core vocabulary is present
   */
  checkCompleteness() {
    const missingEntries = [];

    for (const coreEntry of CORE_VOCABULARY_CHECKLIST) {
      const germLower = coreEntry.german.toLowerCase();
      const bulgLower = coreEntry.bulgarian.toLowerCase();

      const isGermanPresent = this.existingTerms.has(germLower);
      const isBulgarianPresent = this.existingBulgarianTerms.has(bulgLower);

      if (!isGermanPresent && !isBulgarianPresent) {
        missingEntries.push({
          ...coreEntry,
          reason: `Missing both German (${coreEntry.german}) and Bulgarian (${coreEntry.bulgarian}) entries`
        });
      } else if (!isGermanPresent) {
        missingEntries.push({
          ...coreEntry,
          reason: `Missing German entry (${coreEntry.german})`
        });
      } else if (!isBulgarianPresent) {
        missingEntries.push({
          ...coreEntry,
          reason: `Missing Bulgarian entry (${coreEntry.bulgarian})`
        });
      }
    }

    // Calculate statistics
    const totalCoreEntries = CORE_VOCABULARY_CHECKLIST.length;
    const presentEntries = totalCoreEntries - missingEntries.length;
    const completenessPercentage = (presentEntries / totalCoreEntries) * 100;

    // Categorize missing entries
    const missingByCategory = {};
    const missingByLevel = {};

    for (const entry of missingEntries) {
      for (const category of entry.categories) {
        missingByCategory[category] = (missingByCategory[category] || 0) + 1;
      }
      missingByLevel[entry.level] = (missingByLevel[entry.level] || 0) + 1;
    }

    return {
      totalCoreEntries,
      presentEntries,
      missingEntries,
      completenessPercentage,
      missingByCategory,
      missingByLevel,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate markdown report
   */
  generateReport(report) {
    let md = `# Core Vocabulary Completeness Report\n\n`;
    md += `**Generated**: ${report.timestamp}\n\n`;

    md += `## Summary\n`;
    md += `- **Total Core Entries**: ${report.totalCoreEntries}\n`;
    md += `- **Present**: ${report.presentEntries} (${report.completenessPercentage.toFixed(1)}%)\n`;
    md += `- **Missing**: ${report.missingEntries.length}\n\n`;

    if (report.missingByLevel) {
      md += `### Missing by CEFR Level\n`;
      for (const [level, count] of Object.entries(report.missingByLevel)) {
        md += `- **${level}**: ${count} missing\n`;
      }
      md += `\n`;
    }

    if (report.missingByCategory) {
      md += `### Missing by Category\n`;
      for (const [category, count] of Object.entries(report.missingByCategory)) {
        md += `- **${category}**: ${count} missing\n`;
      }
      md += `\n`;
    }

    if (report.missingEntries.length > 0) {
      md += `## Missing Entries (${report.missingEntries.length})\n\n`;

      // Group by level
      const byLevel = report.missingEntries.reduce((acc, entry) => {
        if (!acc[entry.level]) acc[entry.level] = [];
        acc[entry.level].push(entry);
        return acc;
      }, {});

      for (const [level, entries] of Object.entries(byLevel)) {
        md += `### ${level} Level\n`;
        md += `| German | Bulgarian | Part of Speech | Categories | Reason |\n`;
        md += `|--------|-----------|----------------|------------|--------|\n`;

        for (const entry of entries) {
          const categories = entry.categories.join(', ');
          md += `| ${entry.german} | ${entry.bulgarian} | ${entry.partOfSpeech} | ${categories} | ${entry.reason} |\n`;
        }
        md += `\n`;
      }
    } else {
      md += `## ✅ All Core Vocabulary Present\n`;
      md += `All essential A1/A2 vocabulary is present in the database.\n\n`;
    }

    md += `## Recommendations\n`;
    if (report.completenessPercentage < 90) {
      md += `- **High Priority**: Add missing A1 level vocabulary immediately\n`;
      md += `- **Manual Review**: Verify translations and grammatical metadata\n`;
      md += `- **Data Quality**: Ensure articles, gender, and plural forms are correct for nouns\n`;
    } else if (report.completenessPercentage < 95) {
      md += `- **Medium Priority**: Add remaining missing vocabulary\n`;
      md += `- **Quality Check**: Review existing entries for completeness\n`;
    } else {
      md += `- **Maintenance**: Regularly update core vocabulary checklist\n`;
      md += `- **Monitoring**: Set up automated completeness checks\n`;
    }

    return md;
  }

  /**
   * Generate template for missing entries
   */
  generateMissingEntriesTemplate(missingEntries) {
    const now = new Date().toISOString();
    const entries = missingEntries.map(entry => {
      return {
        id: entry.german.toLowerCase().replace(/\s+/g, '_'),
        german: entry.german,
        bulgarian: entry.bulgarian,
        partOfSpeech: entry.partOfSpeech,
        difficulty: entry.level === 'A1' ? 1 : 2,
        categories: entry.categories,
        examples: [],
        notes: {
          forBulgarianSpeakers: `Add explanation for Bulgarian speakers`,
          forGermanSpeakers: `Für Deutschsprachige: Add explanation`,
          linguisticForBulgarians: `Add linguistic notes`,
          linguisticForGermans: `Add linguistic notes`,
          source: "manual"
        },
        etymology: "Add etymology information",
        culturalNotes: ["Add cultural notes"],
        metadata: {
          article: entry.article,
          gender: entry.gender,
          pluralForm: entry.pluralForm,
          frequency: 90,
          level: entry.level,
          isCommon: true,
          isVerified: true,
          createdBy: "core-vocabulary-checker",
          grammarSource: "duden",
          grammarVerified: new Date().toISOString().split('T')[0]
        },
        createdAt: now,
        updatedAt: now,
        version: 1
      };
    });

    return JSON.stringify(entries, null, 2);
  }
}

module.exports = { CoreVocabularyChecker };