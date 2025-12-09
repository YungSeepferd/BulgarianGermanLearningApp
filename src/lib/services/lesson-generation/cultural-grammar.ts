/**
 * CulturalGrammarService - Service for managing and querying cultural grammar concepts
 *
 * This service provides access to grammar concepts that include cultural context and
 * cross-linguistic explanations between Bulgarian and German.
 */

import { $state } from 'svelte';
import type {
  CulturalGrammarConcept,
  GrammarQueryCriteria,
  LessonDifficulty,
  PartOfSpeech,
  ICulturalGrammarService
} from './types';
import { LessonGenerationError, DataValidationError } from './types';

/**
 * CulturalGrammarService class
 *
 * Implements the ICulturalGrammarService interface to provide grammar concept
 * management functionality for the dynamic lesson generation system.
 */
export class CulturalGrammarService implements ICulturalGrammarService {
  private grammarConcepts: CulturalGrammarConcept[] = [];
  private _initialized = false;

  /**
   * Get the initialization status
   */
  get initialized(): boolean {
    return this._initialized;
  }

  /**
   * Initialize the service by loading grammar concepts
   */
  async initialize(): Promise<void> {
    if (this._initialized) return;

    try {
      this.grammarConcepts = await this.loadGrammarData();
      this._initialized = true;
    } catch (error) {
      console.error('Failed to initialize CulturalGrammarService:', error);
      throw new LessonGenerationError('Failed to initialize grammar service');
    }
  }

  /**
   * Query grammar concepts based on criteria
   * @param criteria - Query criteria
   * @returns Promise resolving to an array of grammar concepts
   */
  async query(criteria: GrammarQueryCriteria): Promise<CulturalGrammarConcept[]> {
    if (!this._initialized) {
      await this.initialize();
    }

    return this.grammarConcepts.filter(concept => {
      const difficultyMatch = criteria.difficulty ?
        concept.difficulty === criteria.difficulty : true;

      const posMatch = criteria.partOfSpeech ?
        this.conceptAppliesToPartOfSpeech(concept, criteria.partOfSpeech) : true;

      const conceptTypeMatch = criteria.conceptType ?
        concept.id.includes(criteria.conceptType) || concept.relatedConcepts.includes(criteria.conceptType) : true;

      return difficultyMatch && posMatch && conceptTypeMatch;
    }).slice(0, criteria.limit || 1);
  }

  /**
   * Get all grammar concepts
   * @returns Promise resolving to all grammar concepts
   */
  async getAllConcepts(): Promise<CulturalGrammarConcept[]> {
    if (!this._initialized) {
      await this.initialize();
    }
    return [...this.grammarConcepts];
  }

  /**
   * Check if a grammar concept applies to a specific part of speech
   * @param concept - Grammar concept to check
   * @param partOfSpeech - Part of speech to check
   * @returns True if the concept applies to the part of speech
   */
  conceptAppliesToPartOfSpeech(concept: CulturalGrammarConcept, partOfSpeech: PartOfSpeech): boolean {
    return concept.partOfSpeech.includes(partOfSpeech);
  }

  /**
   * Load grammar data from the file system
   * @returns Promise resolving to an array of grammar concepts
   */
  private async loadGrammarData(): Promise<CulturalGrammarConcept[]> {
    try {
      // In test environment, use fallback data
      if (import.meta.env?.MODE === 'test') {
        return this.getFallbackGrammarData();
      }

      // Load grammar data from JSON file
      const data = await import('$lib/data/cultural-grammar.json');
      const concepts = data.default.concepts || data.default;

      if (!Array.isArray(concepts)) {
        console.warn('Grammar data is not an array. Using fallback data.');
        return this.getFallbackGrammarData();
      }

      // Validate all concepts
      const validConcepts = concepts.filter(concept => this.validateConcept(concept));

      if (validConcepts.length === 0) {
        console.warn('No valid grammar concepts found. Using fallback data.');
        return this.getFallbackGrammarData();
      }

      return validConcepts;
    } catch (error) {
      console.error('Error loading grammar data:', error);
      return this.getFallbackGrammarData();
    }
  }

  /**
   * Validate a grammar concept structure
   * @param concept - Concept to validate
   * @returns True if concept is valid
   * @throws DataValidationError if concept is invalid
   */
  private validateConcept(concept: CulturalGrammarConcept): boolean {
    // Check required fields
    if (!concept.id || typeof concept.id !== 'string') {
      throw new DataValidationError('Concept id is required and must be a string');
    }

    if (!concept.name || typeof concept.name !== 'object' ||
        !concept.name.bulgarian || !concept.name.german) {
      throw new DataValidationError('Concept name is required and must have bulgarian and german properties');
    }

    if (!concept.description || typeof concept.description !== 'object' ||
        !concept.description.bulgarian || !concept.description.german) {
      throw new DataValidationError('Concept description is required and must have bulgarian and german properties');
    }

    if (!concept.difficulty || !['A1', 'A2', 'B1', 'B2', 'C1'].includes(concept.difficulty)) {
      throw new DataValidationError('Concept difficulty is required and must be a valid LessonDifficulty');
    }

    if (!concept.partOfSpeech || !Array.isArray(concept.partOfSpeech) ||
        concept.partOfSpeech.length === 0) {
      throw new DataValidationError('Concept partOfSpeech is required and must be a non-empty array');
    }

    if (!concept.culturalContext || typeof concept.culturalContext !== 'object') {
      throw new DataValidationError('Concept culturalContext is required and must be an object');
    }

    if (!concept.examples || !Array.isArray(concept.examples) ||
        concept.examples.length === 0) {
      throw new DataValidationError('Concept examples is required and must be a non-empty array');
    }

    if (!concept.commonMistakes || typeof concept.commonMistakes !== 'object') {
      throw new DataValidationError('Concept commonMistakes is required and must be an object');
    }

    if (!concept.relatedConcepts || !Array.isArray(concept.relatedConcepts)) {
      throw new DataValidationError('Concept relatedConcepts is required and must be an array');
    }

    // Validate part of speech values
    for (const pos of concept.partOfSpeech) {
      if (!['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'article', 'numeral'].includes(pos)) {
        throw new DataValidationError(`Invalid part of speech: ${pos}`);
      }
    }

    return true;
  }

  /**
   * Get fallback grammar data for error recovery
   * @returns Array of fallback grammar concepts
   */
  private getFallbackGrammarData(): CulturalGrammarConcept[] {
    return [
      {
        id: 'fallback-article-usage',
        name: {
          bulgarian: 'Употреба на членове',
          german: 'Artikelgebrauch'
        },
        description: {
          bulgarian: 'Основна употреба на членове в немски език',
          german: 'Grundlegender Artikelgebrauch im Deutschen'
        },
        difficulty: 'A1',
        partOfSpeech: ['noun'],
        culturalContext: {
          bulgarianPerspective: 'В български няма членове, което създава трудности при изучаването на немски.',
          germanPerspective: 'Im Deutschen sind Artikel obligatorisch, was für bulgarische Lernende ungewohnt ist.',
          crossLinguisticExplanation: {
            bgToDe: 'В български няма членове. В немски трябва да използвате der, die, das според рода.',
            deToBg: 'Im Bulgarischen gibt es keine Artikel. Substantive werden ohne Artikel verwendet.'
          }
        },
        examples: [
          {
            bulgarian: 'Книгата е на масата.',
            german: 'Das Buch ist auf dem Tisch.',
            explanationBgToDe: 'В български няма членове. В немски се използват der/die/das.',
            explanationDeToBg: 'Im Deutschen gibt es Artikel (das, dem), im Bulgarischen nicht.'
          }
        ],
        commonMistakes: {
          bgToDe: ['Забравяне на членове', 'Грешен род'],
          deToBg: ['Добавяне на несъществуващи членове']
        },
        relatedConcepts: ['noun-gender'],
        metadata: {}
      }
    ];
  }
}

/**
 * Singleton instance of CulturalGrammarService
 */
export const culturalGrammarService = new CulturalGrammarService();