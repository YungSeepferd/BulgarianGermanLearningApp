/**
 * Unified Vocabulary Schema
 *
 * This schema extends the base VocabularyItemSchema to create a comprehensive,
 * unified structure that accommodates data from all vocabulary sources,
 * including the detailed fields from the `data/vocab/*.json` files.
 *
 * The goal is to create a single, consistent schema that preserves all
 * valuable metadata during the unification and migration process.
 */
import { z } from 'zod';
export declare const UnifiedVocabularyItemSchema: z.ZodObject<{
    id: z.ZodString;
    german: z.ZodString;
    bulgarian: z.ZodString;
    partOfSpeech: z.ZodEnum<["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", "article", "number", "phrase", "expression"]>;
    difficulty: z.ZodNumber;
    categories: z.ZodArray<z.ZodEnum<["greetings", "numbers", "family", "food", "colors", "animals", "body", "clothing", "house", "nature", "transport", "technology", "time", "weather", "professions", "places", "grammar", "culture", "common_phrases", "verbs", "adjectives", "adverbs", "pronouns", "prepositions", "conjunctions", "interjections", "uncategorized"]>, "many">;
    transliteration: z.ZodOptional<z.ZodObject<{
        german: z.ZodOptional<z.ZodString>;
        bulgarian: z.ZodOptional<z.ZodString>;
    }>>;
    emoji: z.ZodOptional<z.ZodString>;
    audio: z.ZodOptional<z.ZodObject<{
        german: z.ZodOptional<z.ZodString>;
        bulgarian: z.ZodOptional<z.ZodString>;
    }>>;
    grammar: z.ZodOptional<z.ZodObject<{
        gender: z.ZodOptional<z.ZodEnum<["masculine", "feminine", "neuter"]>>;
        pluralForm: z.ZodOptional<z.ZodString>;
        verbAspect: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"perfective">, z.ZodLiteral<"imperfective">, z.ZodLiteral<null>]>>;
        verbPartnerId: z.ZodOptional<z.ZodString>;
        conjugation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }>>;
    examples: z.ZodDefault<z.ZodArray<z.ZodObject<{
        german: z.ZodString;
        bulgarian: z.ZodString;
        context: z.ZodOptional<z.ZodString>;
        source: z.ZodDefault<z.ZodEnum<["current", "legacy", "merged", "generated"]>>;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodObject<{
        general: z.ZodOptional<z.ZodString>;
        forBulgarianSpeakers: z.ZodOptional<z.ZodString>;
        forGermanSpeakers: z.ZodOptional<z.ZodString>;
        linguistic: z.ZodOptional<z.ZodString>;
        linguisticForBulgarians: z.ZodOptional<z.ZodString>;
        linguisticForGermans: z.ZodOptional<z.ZodString>;
        source: z.ZodDefault<z.ZodEnum<["current", "legacy", "merged", "generated"]>>;
    }>>;
    etymology: z.ZodOptional<z.ZodString>;
    culturalNotes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    mnemonics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    synonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    antonyms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    relatedWords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodOptional<z.ZodNumber>;
        level: z.ZodOptional<z.ZodEnum<["A1", "A2", "B1", "B2", "C1"]>>;
        isCommon: z.ZodDefault<z.ZodBoolean>;
        isVerified: z.ZodDefault<z.ZodBoolean>;
        learningPhase: z.ZodOptional<z.ZodNumber>;
        xpValue: z.ZodOptional<z.ZodNumber>;
        sourceFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        mergeSources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        createdBy: z.ZodOptional<z.ZodString>;
        lastUpdatedBy: z.ZodOptional<z.ZodString>;
    }>>;
    createdAt: z.ZodEffects<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>, Date, string | Date | undefined>;
    updatedAt: z.ZodEffects<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>, Date, string | Date | undefined>;
    version: z.ZodDefault<z.ZodNumber>;
}>;
export declare const UnifiedVocabularyCollectionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    items: z.ZodArray<any, "many">;
    languagePair: z.ZodEnum<["de-bg", "bg-de"]>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    items: any[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    languagePair: "de-bg" | "bg-de";
}, {
    items: any[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    languagePair: "de-bg" | "bg-de";
}>;
export type UnifiedVocabularyItem = z.infer<typeof UnifiedVocabularyItemSchema>;
//# sourceMappingURL=unified-vocabulary.d.ts.map