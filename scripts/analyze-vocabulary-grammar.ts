#!/usr/bin/env ts-node

/**
 * Vocabulary Grammar Analyzer
 *
 * This script analyzes the unified vocabulary data for grammatical errors,
 * focusing on German article-noun agreement, gender consistency, and plural forms.
 *
 * Usage:
 *   pnpm exec ts-node scripts/analyze-vocabulary-grammar.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Type definitions
type Gender = 'masculine' | 'feminine' | 'neuter';
type Article = 'der' | 'die' | 'das' | 'ein' | 'eine';

interface GrammarRule {
  article: Article;
  gender: Gender;
  pluralForm: string;
  notes?: string;
}

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  difficulty: number;
  categories: string[];
  metadata?: {
    gender?: Gender;
    article?: Article;
    pluralForm?: string;
    frequency?: number;
    level?: string;
    isCommon?: boolean;
    isVerified?: boolean;
    createdBy?: string;
  };
  notes?: {
    forBulgarianSpeakers?: string;
    forGermanSpeakers?: string;
    linguisticForBulgarians?: string;
    linguisticForGermans?: string;
  };
}

interface GrammarError {
  itemId: string;
  germanTerm: string;
  partOfSpeech: string;
  errorType: string;
  field?: string;
  currentValue?: any;
  expectedValue?: any;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface GrammarAnalysisReport {
  totalItems: number;
  totalNouns: number;
  itemsWithErrors: number;
  errorCount: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  detailedErrors: GrammarError[];
  suggestions: {
    itemId: string;
    germanTerm: string;
    suggestions: Record<string, any>;
  }[];
}

// German noun grammar rules database
const GERMAN_NOUN_GRAMMAR_RULES: Record<string, GrammarRule> = {
  // Family-related nouns
  'Familie': { article: 'die', gender: 'feminine', pluralForm: 'Familien' },
  'Mutter': { article: 'die', gender: 'feminine', pluralForm: 'Mütter' },
  'Vater': { article: 'der', gender: 'masculine', pluralForm: 'Väter' },
  'Eltern': { article: 'die', gender: 'plural', pluralForm: 'Eltern' },
  'Kind': { article: 'das', gender: 'neuter', pluralForm: 'Kinder' },
  'Sohn': { article: 'der', gender: 'masculine', pluralForm: 'Söhne' },
  'Tochter': { article: 'die', gender: 'feminine', pluralForm: 'Töchter' },
  'Bruder': { article: 'der', gender: 'masculine', pluralForm: 'Brüder' },
  'Schwester': { article: 'die', gender: 'feminine', pluralForm: 'Schwestern' },
  'Oma': { article: 'die', gender: 'feminine', pluralForm: 'Omas' },
  'Opa': { article: 'der', gender: 'masculine', pluralForm: 'Opas' },

  // House-related nouns
  'Haus': { article: 'das', gender: 'neuter', pluralForm: 'Häuser' },
  'Wohnung': { article: 'die', gender: 'feminine', pluralForm: 'Wohnungen' },
  'Zimmer': { article: 'das', gender: 'neuter', pluralForm: 'Zimmer' },
  'Küche': { article: 'die', gender: 'feminine', pluralForm: 'Küchen' },
  'Bad': { article: 'das', gender: 'neuter', pluralForm: 'Bäder' },
  'Toilette': { article: 'die', gender: 'feminine', pluralForm: 'Toiletten' },
  'Tür': { article: 'die', gender: 'feminine', pluralForm: 'Türen' },
  'Fenster': { article: 'das', gender: 'neuter', pluralForm: 'Fenster' },
  'Wand': { article: 'die', gender: 'feminine', pluralForm: 'Wände' },
  'Boden': { article: 'der', gender: 'masculine', pluralForm: 'Böden' },

  // Common nouns
  'Mensch': { article: 'der', gender: 'masculine', pluralForm: 'Menschen' },
  'Frau': { article: 'die', gender: 'feminine', pluralForm: 'Frauen' },
  'Mann': { article: 'der', gender: 'masculine', pluralForm: 'Männer' },
  'Schule': { article: 'die', gender: 'feminine', pluralForm: 'Schulen' },
  'Stadt': { article: 'die', gender: 'feminine', pluralForm: 'Städte' },
  'Dorf': { article: 'das', gender: 'neuter', pluralForm: 'Dörfer' },
  'Land': { article: 'das', gender: 'neuter', pluralForm: 'Länder' },
  'Wasser': { article: 'das', gender: 'neuter', pluralForm: 'Wasser' },
  'Feuer': { article: 'das', gender: 'neuter', pluralForm: 'Feuer' },
  'Luft': { article: 'die', gender: 'feminine', pluralForm: 'Lüfte' },
  'Erde': { article: 'die', gender: 'feminine', pluralForm: 'Erden' },

  // Objects
  'Tisch': { article: 'der', gender: 'masculine', pluralForm: 'Tische' },
  'Stuhl': { article: 'der', gender: 'masculine', pluralForm: 'Stühle' },
  'Bett': { article: 'das', gender: 'neuter', pluralForm: 'Betten' },
  'Lampe': { article: 'die', gender: 'feminine', pluralForm: 'Lampen' },
  'Buch': { article: 'das', gender: 'neuter', pluralForm: 'Bücher' },
  'Stift': { article: 'der', gender: 'masculine', pluralForm: 'Stifte' },
  'Computer': { article: 'der', gender: 'masculine', pluralForm: 'Computer' },
  'Handy': { article: 'das', gender: 'neuter', pluralForm: 'Handys' },
  'Auto': { article: 'das', gender: 'neuter', pluralForm: 'Autos' },
  'Fahrrad': { article: 'das', gender: 'neuter', pluralForm: 'Fahrräder' },

  // Food
  'Essen': { article: 'das', gender: 'neuter', pluralForm: 'Essen' },
  'Wasser': { article: 'das', gender: 'neuter', pluralForm: 'Wasser' },
  'Brot': { article: 'das', gender: 'neuter', pluralForm: 'Brote' },
  'Apfel': { article: 'der', gender: 'masculine', pluralForm: 'Äpfel' },
  'Banane': { article: 'die', gender: 'feminine', pluralForm: 'Bananen' },
  'Käse': { article: 'der', gender: 'masculine', pluralForm: 'Käse' },
  'Milch': { article: 'die', gender: 'feminine', pluralForm: 'Milch' },
  'Fleisch': { article: 'das', gender: 'neuter', pluralForm: 'Fleischsorten' },
  'Gemüse': { article: 'das', gender: 'neuter', pluralForm: 'Gemüse' },
  'Obst': { article: 'das', gender: 'neuter', pluralForm: 'Obst' },

  // Time
  'Tag': { article: 'der', gender: 'masculine', pluralForm: 'Tage' },
  'Woche': { article: 'die', gender: 'feminine', pluralForm: 'Wochen' },
  'Monat': { article: 'der', gender: 'masculine', pluralForm: 'Monate' },
  'Jahr': { article: 'das', gender: 'neuter', pluralForm: 'Jahre' },
  'Stunde': { article: 'die', gender: 'feminine', pluralForm: 'Stunden' },
  'Minute': { article: 'die', gender: 'feminine', pluralForm: 'Minuten' },
  'Sekunde': { article: 'die', gender: 'feminine', pluralForm: 'Sekunden' },
  'Uhr': { article: 'die', gender: 'feminine', pluralForm: 'Uhren' },
  'Zeit': { article: 'die', gender: 'feminine', pluralForm: 'Zeiten' },

  // Nature
  'Baum': { article: 'der', gender: 'masculine', pluralForm: 'Bäume' },
  'Blume': { article: 'die', gender: 'feminine', pluralForm: 'Blumen' },
  'Tier': { article: 'das', gender: 'neuter', pluralForm: 'Tiere' },
  'Hund': { article: 'der', gender: 'masculine', pluralForm: 'Hunde' },
  'Katze': { article: 'die', gender: 'feminine', pluralForm: 'Katzen' },
  'Vogel': { article: 'der', gender: 'masculine', pluralForm: 'Vögel' },
  'Fisch': { article: 'der', gender: 'masculine', pluralForm: 'Fische' },
  'Wald': { article: 'der', gender: 'masculine', pluralForm: 'Wälder' },
  'Berg': { article: 'der', gender: 'masculine', pluralForm: 'Berge' },
  'Fluss': { article: 'der', gender: 'masculine', pluralForm: 'Flüsse' }
};

// Common article-gender patterns
const ARTICLE_GENDER_PATTERNS: Record<string, {article: Article, gender: Gender}> = {
  // Feminine patterns
  'ung': { article: 'die', gender: 'feminine' },  // Bildung, Zeitung
  'heit': { article: 'die', gender: 'feminine' }, // Freiheit, Gesundheit
  'keit': { article: 'die', gender: 'feminine' }, // Möglichkeit, Schnelligkeit
  'schaft': { article: 'die', gender: 'feminine' }, // Freundschaft, Gesellschaft
  'ion': { article: 'die', gender: 'feminine' },  // Nation, Information
  'tät': { article: 'die', gender: 'feminine' },  // Universität, Qualität
  'ik': { article: 'die', gender: 'feminine' },   // Musik, Politik

  // Masculine patterns
  'er': { article: 'der', gender: 'masculine' },  // Lehrer, Computer
  'ling': { article: 'der', gender: 'masculine' }, // Lehrling, Frühling
  'ismus': { article: 'der', gender: 'masculine' }, // Sozialismus, Kapitalismus
  'or': { article: 'der', gender: 'masculine' },   // Motor, Professor
  'ig': { article: 'der', gender: 'masculine' },   // König, Honig

  // Neuter patterns
  'chen': { article: 'das', gender: 'neuter' },   // Mädchen, Häuschen
  'lein': { article: 'das', gender: 'neuter' },   // Büchlein, Fräulein
  'um': { article: 'das', gender: 'neuter' },     // Museum, Datum
  'ment': { article: 'das', gender: 'neuter' },   // Dokument, Instrument
  'tum': { article: 'das', gender: 'neuter' }    // Eigentum, Christentum
};

class VocabularyGrammarAnalyzer {
  private vocabularyData: VocabularyItem[] = [];
  private report: GrammarAnalysisReport;

  constructor() {
    this.report = {
      totalItems: 0,
      totalNouns: 0,
      itemsWithErrors: 0,
      errorCount: 0,
      errorsByType: {},
      errorsBySeverity: {},
      detailedErrors: [],
      suggestions: []
    };
  }

  /**
   * Load vocabulary data from JSON file
   */
  async loadVocabularyData(): Promise<void> {
    try {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const filePath = path.join(__dirname, '../src/lib/data/unified-vocabulary.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const parsedData = JSON.parse(data);
      this.vocabularyData = parsedData.items;

      console.log(`Loaded ${this.vocabularyData ? this.vocabularyData.length : 'undefined'} vocabulary items`);
    } catch (error) {
      console.error('Error loading vocabulary data:', error);
      throw error;
    }
  }

  /**
   * Analyze vocabulary data for grammatical errors
   */
  async analyze(): Promise<GrammarAnalysisReport> {
    if (this.vocabularyData.length === 0) {
      await this.loadVocabularyData();
    }

    this.report.totalItems = this.vocabularyData ? this.vocabularyData.length : 0;

    for (const item of this.vocabularyData) {
      this.analyzeItem(item);
    }

    this.generateSummary();
    return this.report;
  }

  /**
   * Analyze a single vocabulary item
   */
  private analyzeItem(item: VocabularyItem): void {
    // Only analyze nouns for grammatical errors
    if (item.partOfSpeech !== 'noun') {
      return;
    }

    this.report.totalNouns++;

    const itemErrors: GrammarError[] = [];
    const suggestions: Record<string, any> = {};

    // Check if this noun is in our grammar rules database
    const normalizedTerm = this.normalizeTerm(item.german);
    const grammarRule = GERMAN_NOUN_GRAMMAR_RULES[normalizedTerm];

    // Check article
    if (item.metadata?.article) {
      if (grammarRule) {
        if (item.metadata.article !== grammarRule.article) {
          itemErrors.push(this.createError(
            item,
            'article_mismatch',
            'metadata.article',
            item.metadata.article,
            grammarRule.article,
            `Incorrect article. Expected '${grammarRule.article}', got '${item.metadata.article}'.`,
            'critical'
          ));
        }
      } else {
        // Check article-gender agreement
        if (item.metadata.gender) {
          const expectedArticle = this.getExpectedArticle(item.metadata.gender);
          if (item.metadata.article !== expectedArticle) {
            itemErrors.push(this.createError(
              item,
              'article_gender_mismatch',
              'metadata.article',
              item.metadata.article,
              expectedArticle,
              `Article '${item.metadata.article}' doesn't match gender '${item.metadata.gender}'. Expected '${expectedArticle}'.`,
              'critical'
            ));
          }
        }
      }
    } else {
      // Missing article
      if (grammarRule) {
        itemErrors.push(this.createError(
          item,
          'missing_article',
          'metadata.article',
          undefined,
          grammarRule.article,
          `Missing article. Should be '${grammarRule.article}'.`,
          'high'
        ));
        suggestions['metadata.article'] = grammarRule.article;
      } else if (item.metadata?.gender) {
        const expectedArticle = this.getExpectedArticle(item.metadata.gender);
        itemErrors.push(this.createError(
          item,
          'missing_article',
          'metadata.article',
          undefined,
          expectedArticle,
          `Missing article. Should be '${expectedArticle}' based on gender '${item.metadata.gender}'.`,
          'high'
        ));
        suggestions['metadata.article'] = expectedArticle;
      } else {
        // Try to infer article from term patterns
        const inferredArticle = this.inferArticleFromTerm(item.german);
        if (inferredArticle) {
          itemErrors.push(this.createError(
            item,
            'missing_article',
            'metadata.article',
            undefined,
            inferredArticle.article,
            `Missing article. Based on term pattern, should likely be '${inferredArticle.article}'.`,
            'medium'
          ));
          suggestions['metadata.article'] = inferredArticle.article;
          suggestions['metadata.gender'] = inferredArticle.gender;
        } else {
          itemErrors.push(this.createError(
            item,
            'missing_article',
            'metadata.article',
            undefined,
            undefined,
            'Missing article. Could not determine correct article.',
            'medium'
          ));
        }
      }
    }

    // Check gender
    if (item.metadata?.gender) {
      if (grammarRule && item.metadata.gender !== grammarRule.gender) {
        itemErrors.push(this.createError(
          item,
          'gender_mismatch',
          'metadata.gender',
          item.metadata.gender,
          grammarRule.gender,
          `Incorrect gender. Expected '${grammarRule.gender}', got '${item.metadata.gender}'.`,
          'critical'
        ));
      }
    } else {
      // Missing gender
      if (grammarRule) {
        itemErrors.push(this.createError(
          item,
          'missing_gender',
          'metadata.gender',
          undefined,
          grammarRule.gender,
          `Missing gender. Should be '${grammarRule.gender}'.`,
          'high'
        ));
        suggestions['metadata.gender'] = grammarRule.gender;
      } else {
        // Try to infer gender from term patterns
        const inferredArticle = this.inferArticleFromTerm(item.german);
        if (inferredArticle) {
          itemErrors.push(this.createError(
            item,
            'missing_gender',
            'metadata.gender',
            undefined,
            inferredArticle.gender,
            `Missing gender. Based on term pattern, should likely be '${inferredArticle.gender}'.`,
            'medium'
          ));
          suggestions['metadata.gender'] = inferredArticle.gender;
        } else {
          itemErrors.push(this.createError(
            item,
            'missing_gender',
            'metadata.gender',
            undefined,
            undefined,
            'Missing gender. Could not determine correct gender.',
            'medium'
          ));
        }
      }
    }

    // Check article-gender agreement
    if (item.metadata?.article && item.metadata?.gender) {
      const expectedArticle = this.getExpectedArticle(item.metadata.gender);
      if (item.metadata.article !== expectedArticle) {
        itemErrors.push(this.createError(
          item,
          'article_gender_mismatch',
          'metadata',
          { article: item.metadata.article, gender: item.metadata.gender },
          { article: expectedArticle, gender: item.metadata.gender },
          `Article '${item.metadata.article}' doesn't match gender '${item.metadata.gender}'. Expected '${expectedArticle}'.`,
          'critical'
        ));
        suggestions['metadata.article'] = expectedArticle;
      }
    }

    // Check plural form
    if (item.metadata?.pluralForm) {
      if (grammarRule && item.metadata.pluralForm !== grammarRule.pluralForm) {
        itemErrors.push(this.createError(
          item,
          'plural_form_mismatch',
          'metadata.pluralForm',
          item.metadata.pluralForm,
          grammarRule.pluralForm,
          `Incorrect plural form. Expected '${grammarRule.pluralForm}', got '${item.metadata.pluralForm}'.`,
          'high'
        ));
      }
    } else {
      // Missing plural form
      if (grammarRule) {
        itemErrors.push(this.createError(
          item,
          'missing_plural_form',
          'metadata.pluralForm',
          undefined,
          grammarRule.pluralForm,
          `Missing plural form. Should be '${grammarRule.pluralForm}'.`,
          'medium'
        ));
        suggestions['metadata.pluralForm'] = grammarRule.pluralForm;
      } else {
        itemErrors.push(this.createError(
          item,
          'missing_plural_form',
          'metadata.pluralForm',
          undefined,
          undefined,
          'Missing plural form. Could not determine correct plural form.',
          'medium'
        ));
      }
    }

    // Check for uncategorized items
    if (item.categories.includes('uncategorized')) {
      itemErrors.push(this.createError(
        item,
        'uncategorized',
        'categories',
        item.categories,
        this.suggestCategory(item),
        'Item is categorized as "uncategorized".',
        'low'
      ));
      suggestions['categories'] = this.suggestCategory(item);
    }

    // Add errors to report
    if (itemErrors.length > 0) {
      this.report.itemsWithErrors++;
      this.report.detailedErrors.push(...itemErrors);

      // Add suggestions if we have any
      if (Object.keys(suggestions).length > 0) {
        this.report.suggestions.push({
          itemId: item.id,
          germanTerm: item.german,
          suggestions
        });
      }
    }
  }

  /**
   * Create a grammar error object
   */
  private createError(
    item: VocabularyItem,
    errorType: string,
    field: string,
    currentValue: any,
    expectedValue: any,
    message: string,
    severity: 'critical' | 'high' | 'medium' | 'low'
  ): GrammarError {
    // Update error type count
    this.report.errorsByType[errorType] = (this.report.errorsByType[errorType] || 0) + 1;

    // Update severity count
    this.report.errorsBySeverity[severity] = (this.report.errorsBySeverity[severity] || 0) + 1;

    return {
      itemId: item.id,
      germanTerm: item.german,
      partOfSpeech: item.partOfSpeech,
      errorType,
      field,
      currentValue,
      expectedValue,
      message,
      severity
    };
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(): void {
    this.report.errorCount = this.report.detailedErrors.length;

    // Sort errors by severity
    this.report.detailedErrors.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Normalize term for comparison
   */
  private normalizeTerm(term: string): string {
    return term.trim().replace(/[^a-zA-ZäöüßÄÖÜ]/g, '');
  }

  /**
   * Get expected article based on gender
   */
  private getExpectedArticle(gender: Gender): Article {
    const articleMap: Record<Gender, Article[]> = {
      masculine: ['der', 'ein'],
      feminine: ['die', 'eine'],
      neuter: ['das', 'ein']
    };

    // Return the definite article
    return articleMap[gender][0];
  }

  /**
   * Infer article and gender from term patterns
   */
  private inferArticleFromTerm(term: string): {article: Article, gender: Gender} | null {
    const normalizedTerm = this.normalizeTerm(term).toLowerCase();

    // Check for common suffix patterns
    for (const [suffix, pattern] of Object.entries(ARTICLE_GENDER_PATTERNS)) {
      if (normalizedTerm.endsWith(suffix.toLowerCase())) {
        return pattern;
      }
    }

    // Check for common exceptions
    const exceptions: Record<string, {article: Article, gender: Gender}> = {
      'mädchen': { article: 'das', gender: 'neuter' }, // das Mädchen
      'fräulein': { article: 'das', gender: 'neuter' }, // das Fräulein
      'weib': { article: 'das', gender: 'neuter' }, // das Weib
      'männlein': { article: 'das', gender: 'neuter' } // das Männlein
    };

    if (exceptions[normalizedTerm]) {
      return exceptions[normalizedTerm];
    }

    return null;
  }

  /**
   * Suggest a category based on the term
   */
  private suggestCategory(item: VocabularyItem): string[] {
    const term = item.german.toLowerCase();

    // Family-related terms
    const familyTerms = ['familie', 'mutter', 'vater', 'eltern', 'kind', 'sohn', 'tochter', 'bruder', 'schwester', 'oma', 'opa'];
    if (familyTerms.includes(term)) {
      return ['family'];
    }

    // House-related terms
    const houseTerms = ['haus', 'wohnung', 'zimmer', 'küche', 'bad', 'toilette', 'tür', 'fenster', 'wand', 'boden'];
    if (houseTerms.includes(term)) {
      return ['home', 'house'];
    }

    // Time-related terms
    const timeTerms = ['tag', 'woche', 'monat', 'jahr', 'stunde', 'minute', 'sekunde', 'uhr', 'zeit'];
    if (timeTerms.includes(term)) {
      return ['time'];
    }

    // Food-related terms
    const foodTerms = ['essen', 'wasser', 'brot', 'apfel', 'banane', 'käse', 'milch', 'fleisch', 'gemüse', 'obst'];
    if (foodTerms.includes(term)) {
      return ['food'];
    }

    // Nature-related terms
    const natureTerms = ['baum', 'blume', 'tier', 'hund', 'katze', 'vogel', 'fisch', 'wald', 'berg', 'fluss'];
    if (natureTerms.includes(term)) {
      return ['nature'];
    }

    // Default: keep existing categories but remove 'uncategorized'
    return item.categories.filter(cat => cat !== 'uncategorized');
  }

  /**
   * Generate a markdown report
   */
  async generateMarkdownReport(report: GrammarAnalysisReport): Promise<string> {
    const timestamp = new Date().toISOString();
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let markdown = `# Vocabulary Grammar Analysis Report\n\n`;
    markdown += `**Generated:** ${date}\n`;
    markdown += `**Timestamp:** ${timestamp}\n\n`;

    markdown += `## Summary Statistics\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total vocabulary items | ${report.totalItems} |\n`;
    markdown += `| Total nouns analyzed | ${report.totalNouns} |\n`;
    markdown += `| Items with grammatical errors | ${report.itemsWithErrors} |\n`;
    markdown += `| Total grammatical errors found | ${report.errorCount} |\n`;
    markdown += `| Error rate | ${((report.itemsWithErrors / report.totalNouns) * 100).toFixed(2)}% |\n\n`;

    markdown += `## Errors by Type\n\n`;
    markdown += `| Error Type | Count | Percentage |\n`;
    markdown += `|------------|-------|------------|\n`;

    for (const [errorType, count] of Object.entries(report.errorsByType)) {
      const percentage = ((count / report.errorCount) * 100).toFixed(2);
      markdown += `| ${errorType} | ${count} | ${percentage}% |\n`;
    }

    markdown += `\n## Errors by Severity\n\n`;
    markdown += `| Severity | Count | Percentage |\n`;
    markdown += `|----------|-------|------------|\n`;

    for (const [severity, count] of Object.entries(report.errorsBySeverity)) {
      const percentage = ((count / report.errorCount) * 100).toFixed(2);
      markdown += `| ${severity} | ${count} | ${percentage}% |\n`;
    }

    markdown += `\n## Critical Errors\n\n`;
    const criticalErrors = report.detailedErrors.filter(error => error.severity === 'critical');

    if (criticalErrors.length > 0) {
      markdown += `| ID | Term | Error Type | Current | Expected | Message |\n`;
      markdown += `|----|------|------------|---------|----------|---------|\n`;

      for (const error of criticalErrors) {
        markdown += `| ${error.itemId} | ${error.germanTerm} | ${error.errorType} | `;
        markdown += `${error.currentValue || 'N/A'} | ${error.expectedValue || 'N/A'} | ${error.message} |\n`;
      }
    } else {
      markdown += `No critical errors found.\n`;
    }

    markdown += `\n## High Severity Errors\n\n`;
    const highErrors = report.detailedErrors.filter(error => error.severity === 'high');

    if (highErrors.length > 0) {
      markdown += `| ID | Term | Error Type | Current | Expected | Message |\n`;
      markdown += `|----|------|------------|---------|----------|---------|\n`;

      for (const error of highErrors) {
        markdown += `| ${error.itemId} | ${error.germanTerm} | ${error.errorType} | `;
        markdown += `${error.currentValue || 'N/A'} | ${error.expectedValue || 'N/A'} | ${error.message} |\n`;
      }
    } else {
      markdown += `No high severity errors found.\n`;
    }

    markdown += `\n## Suggested Fixes\n\n`;
    if (report.suggestions.length > 0) {
      for (const suggestion of report.suggestions) {
        markdown += `### ${suggestion.germanTerm} (ID: ${suggestion.itemId})\n\n`;
        markdown += `| Field | Suggested Value |\n`;
        markdown += `|-------|------------------|\n`;

        for (const [field, value] of Object.entries(suggestion.suggestions)) {
          markdown += `| ${field} | \`${JSON.stringify(value)}\` |\n`;
        }
        markdown += `\n`;
      }
    } else {
      markdown += `No suggestions available.\n`;
    }

    markdown += `\n## Detailed Error List\n\n`;
    markdown += `| Severity | ID | Term | Error Type | Field | Current | Expected | Message |\n`;
    markdown += `|----------|----|------|------------|-------|---------|----------|---------|\n`;

    for (const error of report.detailedErrors) {
      markdown += `| ${error.severity} | ${error.itemId} | ${error.germanTerm} | ${error.errorType} | `;
      markdown += `${error.field} | ${error.currentValue || 'N/A'} | ${error.expectedValue || 'N/A'} | ${error.message} |\n`;
    }

    return markdown;
  }

  /**
   * Save report to file
   */
  async saveReport(report: GrammarAnalysisReport, format: 'json' | 'md' = 'md'): Promise<void> {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const reportsDir = path.join(__dirname, '../../reports');

    try {
      // Ensure reports directory exists
      await fs.mkdir(reportsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let filePath: string;
      let content: string;

      if (format === 'json') {
        filePath = path.join(reportsDir, `vocabulary-grammar-report-${timestamp}.json`);
        content = JSON.stringify(report, null, 2);
      } else {
        filePath = path.join(reportsDir, `vocabulary-grammar-report-${timestamp}.md`);
        content = await this.generateMarkdownReport(report);
      }

      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`Report saved to ${filePath}`);
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('Starting vocabulary grammar analysis...');

    const analyzer = new VocabularyGrammarAnalyzer();
    const report = await analyzer.analyze();

    // Save both JSON and Markdown reports
    await analyzer.saveReport(report, 'json');
    await analyzer.saveReport(report, 'md');

    console.log('Grammar analysis completed successfully!');
    console.log(`Found ${report.errorCount} grammatical errors in ${report.itemsWithErrors} items.`);

    // Exit with error code if critical errors found
    const criticalErrors = report.detailedErrors.filter(error => error.severity === 'critical');
    if (criticalErrors.length > 0) {
      console.log(`\n⚠️  Found ${criticalErrors.length} critical errors that need immediate attention!`);
      process.exit(1);
    }

  } catch (error) {
    console.error('Error during grammar analysis:', error);
    process.exit(1);
  }
}

// Run the analysis
main();