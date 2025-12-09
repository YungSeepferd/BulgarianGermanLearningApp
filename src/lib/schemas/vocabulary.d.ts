/**
 * Vocabulary Schema - Defines the structure and validation rules for vocabulary items
 * Used for runtime validation, type safety, and data integrity
 */
import { z } from 'zod';
export declare const PartOfSpeechSchema: z.ZodEnum<["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", "article", "number", "phrase"]>;
export declare const VocabularyCategorySchema: z.ZodEnum<["greetings", "numbers", "family", "food", "colors", "animals", "body", "clothing", "house", "nature", "transport", "technology", "time", "weather", "professions", "places", "grammar", "culture", "common_phrases", "uncategorized"]>;
export declare const DifficultyLevelSchema: z.ZodEnum<["beginner", "elementary", "intermediate", "upper_intermediate", "advanced"]>;
export declare const VocabularyMetadataSchema: z.ZodObject<{
    gender: z.ZodOptional<z.ZodEnum<["masculine", "feminine", "neuter"]>>;
    pluralForm: z.ZodOptional<z.ZodString>;
    conjugation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        german: z.ZodString;
        bulgarian: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        german: string;
        bulgarian: string;
        context?: string | undefined;
    }, {
        german: string;
        bulgarian: string;
        context?: string | undefined;
    }>, "many">>;
    synonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    antonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    relatedWords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
    mnemonic: z.ZodOptional<z.ZodString>;
    culturalNote: z.ZodOptional<z.ZodString>;
    etymology: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    gender?: "masculine" | "feminine" | "neuter" | undefined;
    pluralForm?: string | undefined;
    conjugation?: Record<string, string> | undefined;
    examples?: {
        german: string;
        bulgarian: string;
        context?: string | undefined;
    }[] | undefined;
    synonyms?: string[] | undefined;
    antonyms?: string[] | undefined;
    relatedWords?: string[] | undefined;
    notes?: string | undefined;
    mnemonic?: string | undefined;
    culturalNote?: string | undefined;
    etymology?: string | undefined;
}, {
    gender?: "masculine" | "feminine" | "neuter" | undefined;
    pluralForm?: string | undefined;
    conjugation?: Record<string, string> | undefined;
    examples?: {
        german: string;
        bulgarian: string;
        context?: string | undefined;
    }[] | undefined;
    synonyms?: string[] | undefined;
    antonyms?: string[] | undefined;
    relatedWords?: string[] | undefined;
    notes?: string | undefined;
    mnemonic?: string | undefined;
    culturalNote?: string | undefined;
    etymology?: string | undefined;
}>;
/**
 * Schema for legacy ID formats (numeric, string, UUID)
 * Supports: UUIDs, numeric IDs, string IDs, and auto-generation
 */
export declare const LegacyIdSchema: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodString, z.ZodNumber]>, string, string | number>;
export declare const VocabularyCategorySchemaWithFallback: z.ZodUnion<[z.ZodEnum<["greetings", "numbers", "family", "food", "colors", "animals", "body", "clothing", "house", "nature", "transport", "technology", "time", "weather", "professions", "places", "grammar", "culture", "common_phrases", "uncategorized"]>, z.ZodLiteral<"uncategorized">]>;
declare const BaseVocabularyItemSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodString, z.ZodNumber]>, string, string | number>;
    german: z.ZodString;
    bulgarian: z.ZodString;
    partOfSpeech: z.ZodDefault<z.ZodEnum<["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", "article", "number", "phrase"]>>;
    difficulty: z.ZodDefault<z.ZodNumber>;
    categories: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodEnum<["greetings", "numbers", "family", "food", "colors", "animals", "body", "clothing", "house", "nature", "transport", "technology", "time", "weather", "professions", "places", "grammar", "culture", "common_phrases", "uncategorized"]>, z.ZodLiteral<"uncategorized">]>, "many">>;
    transliteration: z.ZodOptional<z.ZodString>;
    emoji: z.ZodOptional<z.ZodString>;
    literalBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
        segment: z.ZodString;
        literal: z.ZodString;
        grammarTag: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        segment: string;
        literal: string;
        grammarTag: string;
    }, {
        segment: string;
        literal: string;
        grammarTag: string;
    }>, "many">>;
    metadata: z.ZodOptional<z.ZodObject<{
        gender: z.ZodOptional<z.ZodEnum<["masculine", "feminine", "neuter"]>>;
        pluralForm: z.ZodOptional<z.ZodString>;
        conjugation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
            german: z.ZodString;
            bulgarian: z.ZodString;
            context: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }, {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }>, "many">>;
        synonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        antonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relatedWords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        notes: z.ZodOptional<z.ZodString>;
        mnemonic: z.ZodOptional<z.ZodString>;
        culturalNote: z.ZodOptional<z.ZodString>;
        etymology: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        gender?: "masculine" | "feminine" | "neuter" | undefined;
        pluralForm?: string | undefined;
        conjugation?: Record<string, string> | undefined;
        examples?: {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }[] | undefined;
        synonyms?: string[] | undefined;
        antonyms?: string[] | undefined;
        relatedWords?: string[] | undefined;
        notes?: string | undefined;
        mnemonic?: string | undefined;
        culturalNote?: string | undefined;
        etymology?: string | undefined;
    }, {
        gender?: "masculine" | "feminine" | "neuter" | undefined;
        pluralForm?: string | undefined;
        conjugation?: Record<string, string> | undefined;
        examples?: {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }[] | undefined;
        synonyms?: string[] | undefined;
        antonyms?: string[] | undefined;
        relatedWords?: string[] | undefined;
        notes?: string | undefined;
        mnemonic?: string | undefined;
        culturalNote?: string | undefined;
        etymology?: string | undefined;
    }>>;
    createdAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
    updatedAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
    isCommon: z.ZodDefault<z.ZodBoolean>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    learningPhase: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    partOfSpeech: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase";
    difficulty: number;
    categories: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[];
    german: string;
    bulgarian: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isCommon: boolean;
    isVerified: boolean;
    learningPhase: number;
    emoji?: string | undefined;
    transliteration?: string | undefined;
    literalBreakdown?: {
        segment: string;
        literal: string;
        grammarTag: string;
    }[] | undefined;
    metadata?: {
        gender?: "masculine" | "feminine" | "neuter" | undefined;
        pluralForm?: string | undefined;
        conjugation?: Record<string, string> | undefined;
        examples?: {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }[] | undefined;
        synonyms?: string[] | undefined;
        antonyms?: string[] | undefined;
        relatedWords?: string[] | undefined;
        notes?: string | undefined;
        mnemonic?: string | undefined;
        culturalNote?: string | undefined;
        etymology?: string | undefined;
    } | undefined;
}, {
    german: string;
    bulgarian: string;
    id: string | number;
    partOfSpeech?: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase" | undefined;
    difficulty?: number | undefined;
    categories?: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[] | undefined;
    emoji?: string | undefined;
    transliteration?: string | undefined;
    literalBreakdown?: {
        segment: string;
        literal: string;
        grammarTag: string;
    }[] | undefined;
    metadata?: {
        gender?: "masculine" | "feminine" | "neuter" | undefined;
        pluralForm?: string | undefined;
        conjugation?: Record<string, string> | undefined;
        examples?: {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }[] | undefined;
        synonyms?: string[] | undefined;
        antonyms?: string[] | undefined;
        relatedWords?: string[] | undefined;
        notes?: string | undefined;
        mnemonic?: string | undefined;
        culturalNote?: string | undefined;
        etymology?: string | undefined;
    } | undefined;
    createdAt?: string | Date | undefined;
    updatedAt?: string | Date | undefined;
    isCommon?: boolean | undefined;
    isVerified?: boolean | undefined;
    learningPhase?: number | undefined;
}>;
export type VocabularyItem = z.infer<typeof BaseVocabularyItemSchema>;
/**
 * Fallback vocabulary item for failed validations
 * Creates a valid item with fallback values when validation fails
 */
export declare const createFallbackItem: (input: unknown) => VocabularyItem;
export declare const VocabularyItemSchema: z.ZodCatch<z.ZodObject<{
    id: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodString, z.ZodNumber]>, string, string | number>;
    german: z.ZodString;
    bulgarian: z.ZodString;
    partOfSpeech: z.ZodDefault<z.ZodEnum<["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", "article", "number", "phrase"]>>;
    difficulty: z.ZodDefault<z.ZodNumber>;
    categories: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodEnum<["greetings", "numbers", "family", "food", "colors", "animals", "body", "clothing", "house", "nature", "transport", "technology", "time", "weather", "professions", "places", "grammar", "culture", "common_phrases", "uncategorized"]>, z.ZodLiteral<"uncategorized">]>, "many">>;
    transliteration: z.ZodOptional<z.ZodString>;
    emoji: z.ZodOptional<z.ZodString>;
    literalBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
        segment: z.ZodString;
        literal: z.ZodString;
        grammarTag: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        segment: string;
        literal: string;
        grammarTag: string;
    }, {
        segment: string;
        literal: string;
        grammarTag: string;
    }>, "many">>;
    metadata: z.ZodOptional<z.ZodObject<{
        gender: z.ZodOptional<z.ZodEnum<["masculine", "feminine", "neuter"]>>;
        pluralForm: z.ZodOptional<z.ZodString>;
        conjugation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
            german: z.ZodString;
            bulgarian: z.ZodString;
            context: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }, {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }>, "many">>;
        synonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        antonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relatedWords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        notes: z.ZodOptional<z.ZodString>;
        mnemonic: z.ZodOptional<z.ZodString>;
        culturalNote: z.ZodOptional<z.ZodString>;
        etymology: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        gender?: "masculine" | "feminine" | "neuter" | undefined;
        pluralForm?: string | undefined;
        conjugation?: Record<string, string> | undefined;
        examples?: {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }[] | undefined;
        synonyms?: string[] | undefined;
        antonyms?: string[] | undefined;
        relatedWords?: string[] | undefined;
        notes?: string | undefined;
        mnemonic?: string | undefined;
        culturalNote?: string | undefined;
        etymology?: string | undefined;
    }, {
        gender?: "masculine" | "feminine" | "neuter" | undefined;
        pluralForm?: string | undefined;
        conjugation?: Record<string, string> | undefined;
        examples?: {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }[] | undefined;
        synonyms?: string[] | undefined;
        antonyms?: string[] | undefined;
        relatedWords?: string[] | undefined;
        notes?: string | undefined;
        mnemonic?: string | undefined;
        culturalNote?: string | undefined;
        etymology?: string | undefined;
    }>>;
    createdAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
    updatedAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
    isCommon: z.ZodDefault<z.ZodBoolean>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    learningPhase: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    partOfSpeech: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase";
    difficulty: number;
    categories: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[];
    german: string;
    bulgarian: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isCommon: boolean;
    isVerified: boolean;
    learningPhase: number;
    emoji?: string | undefined;
    transliteration?: string | undefined;
    literalBreakdown?: {
        segment: string;
        literal: string;
        grammarTag: string;
    }[] | undefined;
    metadata?: {
        gender?: "masculine" | "feminine" | "neuter" | undefined;
        pluralForm?: string | undefined;
        conjugation?: Record<string, string> | undefined;
        examples?: {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }[] | undefined;
        synonyms?: string[] | undefined;
        antonyms?: string[] | undefined;
        relatedWords?: string[] | undefined;
        notes?: string | undefined;
        mnemonic?: string | undefined;
        culturalNote?: string | undefined;
        etymology?: string | undefined;
    } | undefined;
}, {
    german: string;
    bulgarian: string;
    id: string | number;
    partOfSpeech?: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase" | undefined;
    difficulty?: number | undefined;
    categories?: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[] | undefined;
    emoji?: string | undefined;
    transliteration?: string | undefined;
    literalBreakdown?: {
        segment: string;
        literal: string;
        grammarTag: string;
    }[] | undefined;
    metadata?: {
        gender?: "masculine" | "feminine" | "neuter" | undefined;
        pluralForm?: string | undefined;
        conjugation?: Record<string, string> | undefined;
        examples?: {
            german: string;
            bulgarian: string;
            context?: string | undefined;
        }[] | undefined;
        synonyms?: string[] | undefined;
        antonyms?: string[] | undefined;
        relatedWords?: string[] | undefined;
        notes?: string | undefined;
        mnemonic?: string | undefined;
        culturalNote?: string | undefined;
        etymology?: string | undefined;
    } | undefined;
    createdAt?: string | Date | undefined;
    updatedAt?: string | Date | undefined;
    isCommon?: boolean | undefined;
    isVerified?: boolean | undefined;
    learningPhase?: number | undefined;
}>>;
export declare const VocabularyCollectionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    items: z.ZodArray<z.ZodCatch<z.ZodObject<{
        id: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodString, z.ZodNumber]>, string, string | number>;
        german: z.ZodString;
        bulgarian: z.ZodString;
        partOfSpeech: z.ZodDefault<z.ZodEnum<["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", "article", "number", "phrase"]>>;
        difficulty: z.ZodDefault<z.ZodNumber>;
        categories: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodEnum<["greetings", "numbers", "family", "food", "colors", "animals", "body", "clothing", "house", "nature", "transport", "technology", "time", "weather", "professions", "places", "grammar", "culture", "common_phrases", "uncategorized"]>, z.ZodLiteral<"uncategorized">]>, "many">>;
        transliteration: z.ZodOptional<z.ZodString>;
        emoji: z.ZodOptional<z.ZodString>;
        literalBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
            segment: z.ZodString;
            literal: z.ZodString;
            grammarTag: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            segment: string;
            literal: string;
            grammarTag: string;
        }, {
            segment: string;
            literal: string;
            grammarTag: string;
        }>, "many">>;
        metadata: z.ZodOptional<z.ZodObject<{
            gender: z.ZodOptional<z.ZodEnum<["masculine", "feminine", "neuter"]>>;
            pluralForm: z.ZodOptional<z.ZodString>;
            conjugation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
                german: z.ZodString;
                bulgarian: z.ZodString;
                context: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                german: string;
                bulgarian: string;
                context?: string | undefined;
            }, {
                german: string;
                bulgarian: string;
                context?: string | undefined;
            }>, "many">>;
            synonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            antonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            relatedWords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            notes: z.ZodOptional<z.ZodString>;
            mnemonic: z.ZodOptional<z.ZodString>;
            culturalNote: z.ZodOptional<z.ZodString>;
            etymology: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            gender?: "masculine" | "feminine" | "neuter" | undefined;
            pluralForm?: string | undefined;
            conjugation?: Record<string, string> | undefined;
            examples?: {
                german: string;
                bulgarian: string;
                context?: string | undefined;
            }[] | undefined;
            synonyms?: string[] | undefined;
            antonyms?: string[] | undefined;
            relatedWords?: string[] | undefined;
            notes?: string | undefined;
            mnemonic?: string | undefined;
            culturalNote?: string | undefined;
            etymology?: string | undefined;
        }, {
            gender?: "masculine" | "feminine" | "neuter" | undefined;
            pluralForm?: string | undefined;
            conjugation?: Record<string, string> | undefined;
            examples?: {
                german: string;
                bulgarian: string;
                context?: string | undefined;
            }[] | undefined;
            synonyms?: string[] | undefined;
            antonyms?: string[] | undefined;
            relatedWords?: string[] | undefined;
            notes?: string | undefined;
            mnemonic?: string | undefined;
            culturalNote?: string | undefined;
            etymology?: string | undefined;
        }>>;
        createdAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
        updatedAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
        isCommon: z.ZodDefault<z.ZodBoolean>;
        isVerified: z.ZodDefault<z.ZodBoolean>;
        learningPhase: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        partOfSpeech: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase";
        difficulty: number;
        categories: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[];
        german: string;
        bulgarian: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isCommon: boolean;
        isVerified: boolean;
        learningPhase: number;
        emoji?: string | undefined;
        transliteration?: string | undefined;
        literalBreakdown?: {
            segment: string;
            literal: string;
            grammarTag: string;
        }[] | undefined;
        metadata?: {
            gender?: "masculine" | "feminine" | "neuter" | undefined;
            pluralForm?: string | undefined;
            conjugation?: Record<string, string> | undefined;
            examples?: {
                german: string;
                bulgarian: string;
                context?: string | undefined;
            }[] | undefined;
            synonyms?: string[] | undefined;
            antonyms?: string[] | undefined;
            relatedWords?: string[] | undefined;
            notes?: string | undefined;
            mnemonic?: string | undefined;
            culturalNote?: string | undefined;
            etymology?: string | undefined;
        } | undefined;
    }, {
        german: string;
        bulgarian: string;
        id: string | number;
        partOfSpeech?: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase" | undefined;
        difficulty?: number | undefined;
        categories?: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[] | undefined;
        emoji?: string | undefined;
        transliteration?: string | undefined;
        literalBreakdown?: {
            segment: string;
            literal: string;
            grammarTag: string;
        }[] | undefined;
        metadata?: {
            gender?: "masculine" | "feminine" | "neuter" | undefined;
            pluralForm?: string | undefined;
            conjugation?: Record<string, string> | undefined;
            examples?: {
                german: string;
                bulgarian: string;
                context?: string | undefined;
            }[] | undefined;
            synonyms?: string[] | undefined;
            antonyms?: string[] | undefined;
            relatedWords?: string[] | undefined;
            notes?: string | undefined;
            mnemonic?: string | undefined;
            culturalNote?: string | undefined;
            etymology?: string | undefined;
        } | undefined;
        createdAt?: string | Date | undefined;
        updatedAt?: string | Date | undefined;
        isCommon?: boolean | undefined;
        isVerified?: boolean | undefined;
        learningPhase?: number | undefined;
    }>>, "many">;
    languagePair: z.ZodEnum<["de-bg", "bg-de"]>;
    difficultyRange: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    categories: z.ZodArray<z.ZodEnum<["greetings", "numbers", "family", "food", "colors", "animals", "body", "clothing", "house", "nature", "transport", "technology", "time", "weather", "professions", "places", "grammar", "culture", "common_phrases", "uncategorized"]>, "many">;
    createdAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
    updatedAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
}, "strip", z.ZodTypeAny, {
    categories: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[];
    items: {
        partOfSpeech: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase";
        difficulty: number;
        categories: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[];
        german: string;
        bulgarian: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isCommon: boolean;
        isVerified: boolean;
        learningPhase: number;
        emoji?: string | undefined;
        transliteration?: string | undefined;
        literalBreakdown?: {
            segment: string;
            literal: string;
            grammarTag: string;
        }[] | undefined;
        metadata?: {
            gender?: "masculine" | "feminine" | "neuter" | undefined;
            pluralForm?: string | undefined;
            conjugation?: Record<string, string> | undefined;
            examples?: {
                german: string;
                bulgarian: string;
                context?: string | undefined;
            }[] | undefined;
            synonyms?: string[] | undefined;
            antonyms?: string[] | undefined;
            relatedWords?: string[] | undefined;
            notes?: string | undefined;
            mnemonic?: string | undefined;
            culturalNote?: string | undefined;
            etymology?: string | undefined;
        } | undefined;
    }[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    languagePair: "de-bg" | "bg-de";
    difficultyRange: [number, number];
}, {
    categories: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[];
    items: unknown[];
    id: string;
    name: string;
    description: string;
    languagePair: "de-bg" | "bg-de";
    difficultyRange: [number, number];
    createdAt?: string | Date | undefined;
    updatedAt?: string | Date | undefined;
}>;
export declare const VocabularySearchParamsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    partOfSpeech: z.ZodOptional<z.ZodEnum<["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", "article", "number", "phrase"]>>;
    difficulty: z.ZodOptional<z.ZodNumber>;
    categories: z.ZodOptional<z.ZodArray<z.ZodEnum<["greetings", "numbers", "family", "food", "colors", "animals", "body", "clothing", "house", "nature", "transport", "technology", "time", "weather", "professions", "places", "grammar", "culture", "common_phrases", "uncategorized"]>, "many">>;
    learningPhase: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["german", "bulgarian", "difficulty", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    sortBy: "difficulty" | "german" | "bulgarian" | "createdAt";
    sortOrder: "asc" | "desc";
    query?: string | undefined;
    partOfSpeech?: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase" | undefined;
    difficulty?: number | undefined;
    categories?: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[] | undefined;
    learningPhase?: number | undefined;
}, {
    query?: string | undefined;
    partOfSpeech?: "number" | "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "article" | "phrase" | undefined;
    difficulty?: number | undefined;
    categories?: ("greetings" | "numbers" | "family" | "food" | "colors" | "animals" | "body" | "clothing" | "house" | "nature" | "transport" | "technology" | "time" | "weather" | "professions" | "places" | "grammar" | "culture" | "common_phrases" | "uncategorized")[] | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    learningPhase?: number | undefined;
    sortBy?: "difficulty" | "german" | "bulgarian" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const VocabularyProgressSchema: z.ZodObject<{
    userId: z.ZodString;
    vocabularyId: z.ZodString;
    learned: z.ZodDefault<z.ZodBoolean>;
    proficiency: z.ZodDefault<z.ZodNumber>;
    lastReviewed: z.ZodOptional<z.ZodDate>;
    reviewCount: z.ZodDefault<z.ZodNumber>;
    nextReviewDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    vocabularyId: string;
    learned: boolean;
    proficiency: number;
    reviewCount: number;
    lastReviewed?: Date | undefined;
    nextReviewDate?: Date | undefined;
}, {
    userId: string;
    vocabularyId: string;
    learned?: boolean | undefined;
    proficiency?: number | undefined;
    lastReviewed?: Date | undefined;
    reviewCount?: number | undefined;
    nextReviewDate?: Date | undefined;
}>;
export declare const PracticeSessionSchema: z.ZodObject<{
    id: z.ZodString;
    currentItemId: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodOptional<z.ZodString>;
    score: z.ZodDefault<z.ZodNumber>;
    itemsPracticed: z.ZodDefault<z.ZodNumber>;
    correctAnswers: z.ZodDefault<z.ZodNumber>;
    incorrectAnswers: z.ZodDefault<z.ZodNumber>;
    sessionType: z.ZodEnum<["vocabulary", "grammar", "listening", "speaking"]>;
    completed: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    currentItemId: string;
    startTime: string;
    score: number;
    itemsPracticed: number;
    correctAnswers: number;
    incorrectAnswers: number;
    sessionType: "grammar" | "vocabulary" | "listening" | "speaking";
    completed: boolean;
    endTime?: string | undefined;
}, {
    id: string;
    currentItemId: string;
    startTime: string;
    sessionType: "grammar" | "vocabulary" | "listening" | "speaking";
    endTime?: string | undefined;
    score?: number | undefined;
    itemsPracticed?: number | undefined;
    correctAnswers?: number | undefined;
    incorrectAnswers?: number | undefined;
    completed?: boolean | undefined;
}>;
export type PartOfSpeech = z.infer<typeof PartOfSpeechSchema>;
export type VocabularyCategory = z.infer<typeof VocabularyCategorySchema>;
export type VocabularyCollection = z.infer<typeof VocabularyCollectionSchema>;
export type VocabularySearchParams = z.infer<typeof VocabularySearchParamsSchema>;
export type VocabularyProgress = z.infer<typeof VocabularyProgressSchema>;
export type PracticeSession = z.infer<typeof PracticeSessionSchema>;
export declare function getDifficultyLabel(difficulty: number): string;
export declare function getPartOfSpeechLabel(partOfSpeech: PartOfSpeech): string;
export {};
//# sourceMappingURL=vocabulary.d.ts.map