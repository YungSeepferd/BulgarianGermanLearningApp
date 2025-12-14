/**
 * Enrichment Data Templates
 * 
 * Defines schemas for grammar enrichment data (declension, conjugation).
 * These are applied to vocabulary items to add detailed linguistic data.
 */

/**
 * Noun Declension Template (German)
 * 
 * German nouns decline in 4 cases: Nominative, Accusative, Dative, Genitive
 * Each case has singular and plural forms
 * 
 * @example
 * {
 *   gender: 'm',
 *   nominative: { singular: 'der Mann', plural: 'die Männer' },
 *   accusative: { singular: 'den Mann', plural: 'die Männer' },
 *   dative: { singular: 'dem Mann', plural: 'den Männern' },
 *   genitive: { singular: 'des Mannes', plural: 'der Männer' }
 * }
 */
export const NounDeclensionTemplate = {
  gender: '', // 'm' | 'f' | 'n'
  nominative: { singular: '', plural: '' },
  accusative: { singular: '', plural: '' },
  dative: { singular: '', plural: '' },
  genitive: { singular: '', plural: '' }
};

/**
 * Verb Conjugation Template (German)
 * 
 * German verbs conjugate for:
 * - Present indicative (ich, du, er/sie/es, wir, ihr, sie/Sie)
 * - Past indicative (simple past)
 * - Perfect (past participle with auxiliary)
 * - Infinitive + Participles
 * 
 * @example
 * {
 *   infinitive: 'arbeiten',
 *   auxiliary: 'haben',
 *   presentIndicative: {
 *     ich: 'arbeite',
 *     du: 'arbeitest',
 *     erSieEs: 'arbeitet',
 *     wir: 'arbeiten',
 *     ihr: 'arbeitet',
 *     sieSie: 'arbeiten'
 *   },
 *   pastParticiple: 'gearbeitet',
 *   presentParticiple: 'arbeitend'
 * }
 */
export const VerbConjugationTemplate = {
  infinitive: '',
  auxiliary: '', // 'haben' | 'sein' | both
  presentIndicative: {
    ich: '',
    du: '',
    erSieEs: '',
    wir: '',
    ihr: '',
    sieSie: ''
  },
  simpleStPast: {
    ich: '',
    du: '',
    erSieEs: '',
    wir: '',
    ihr: '',
    sieSie: ''
  },
  pastParticiple: '',
  presentParticiple: ''
};

/**
 * Adjective Comparison Template
 * 
 * German adjectives have three forms:
 * - Positive: base form
 * - Comparative: -er form
 * - Superlative: -est or -st form
 * 
 * @example
 * {
 *   positive: 'schön',
 *   comparative: 'schöner',
 *   superlative: 'schönster'
 * }
 */
export const AdjectiveComparisonTemplate = {
  positive: '',
  comparative: '',
  superlative: ''
};

/**
 * Bulgarian Declension Template (Nouns & Adjectives)
 * 
 * Bulgarian nouns and adjectives have:
 * - Definite article forms (different for masculine, feminine, neuter)
 * - Gender variants
 * - Plural forms
 * 
 * @example
 * {
 *   indefinite: 'человек',
 *   definite: 'човекът',
 *   gender: 'm',
 *   plural: 'хора',
 *   pluralDefinite: 'хората'
 * }
 */
export const BulgarianNounTemplate = {
  indefinite: '',
  definite: '',
  gender: '', // 'm' | 'f' | 'n'
  plural: '',
  pluralDefinite: ''
};

/**
 * Example with Cultural Context
 * 
 * Enriched examples can include:
 * - German and Bulgarian translations
 * - Formal/Informal usage notes
 * - Regional variants
 * - Usage frequency/context
 * 
 * @example
 * {
 *   german: 'Guten Morgen!',
 *   bulgarian: 'Добро утро!',
 *   context: 'greeting',
 *   formality: 'formal',
 *   frequency: 'common',
 *   notes: 'Use in professional or respectful contexts'
 * }
 */
export const EnrichedExampleTemplate = {
  german: '',
  bulgarian: '',
  context: '', // 'greeting', 'business', 'casual', 'formal', etc.
  formality: '', // 'informal', 'formal', 'neutral'
  frequency: '', // 'common', 'occasional', 'rare'
  notes: ''
};

/**
 * Complete Enrichment Package
 * 
 * Combines all enrichment data for a single vocabulary item.
 */
export const EnrichmentPackageTemplate = {
  id: '',
  german: '',
  bulgarian: '',
  
  // Grammar enrichment
  grammar: {
    declension: {}, // For nouns/adjectives
    conjugation: {}, // For verbs
    comparison: {} // For adjectives
  },
  
  // Bulgarian variants
  bulgarianForms: {},
  
  // Enhanced examples
  examples: [],
  
  // Cultural context
  culturalNotes: '',
  regionalVariants: [],
  
  // Mnemonics and learning tips
  mnemonics: {
    memory_tip: '',
    common_collocations: [],
    false_cognates: []
  },
  
  // Metadata
  enrichedBy: 'auto-fixer v1.0',
  enrichedAt: new Date().toISOString(),
  reviewStatus: 'pending' // 'pending' | 'reviewed' | 'approved'
};

/**
 * Batch Enrichment Manifest
 * 
 * Tracks enrichment progress for a batch
 */
export const BatchEnrichmentManifest = {
  batchId: 0,
  batchSize: 0,
  totalItems: 0,
  enrichedItems: 0,
  enrichmentType: '', // 'declension' | 'conjugation' | 'comparison' | 'examples'
  startedAt: new Date().toISOString(),
  completedAt: null,
  status: 'in-progress', // 'pending' | 'in-progress' | 'completed' | 'failed'
  issues: [],
  notes: ''
};

// Export all templates
export default {
  NounDeclensionTemplate,
  VerbConjugationTemplate,
  AdjectiveComparisonTemplate,
  BulgarianNounTemplate,
  EnrichedExampleTemplate,
  EnrichmentPackageTemplate,
  BatchEnrichmentManifest
};
