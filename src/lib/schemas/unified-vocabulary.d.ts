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
export declare const UnifiedVocabularyItemSchema: any;
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