import { z } from 'zod';
export declare const VocabularyReferenceSchema: z.ZodUnion<[z.ZodObject<Omit<{
    id: any;
    german: z.ZodString;
    bulgarian: z.ZodString;
    partOfSpeech: any;
    difficulty: z.ZodDefault<z.ZodNumber>;
    categories: z.ZodDefault<z.ZodArray<any, "many">>;
    metadata: any;
    createdAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
    updatedAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
    isCommon: z.ZodDefault<z.ZodBoolean>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
}, "id">, "strip", z.ZodTypeAny, {
    [x: string]: any;
    partOfSpeech?: unknown;
    difficulty?: unknown;
    categories?: unknown;
    german?: unknown;
    bulgarian?: unknown;
    metadata?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
    isCommon?: unknown;
    isVerified?: unknown;
}, {
    [x: string]: any;
    partOfSpeech?: unknown;
    difficulty?: unknown;
    categories?: unknown;
    german?: unknown;
    bulgarian?: unknown;
    metadata?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
    isCommon?: unknown;
    isVerified?: unknown;
}>, any, z.ZodString]>;
export declare const LessonDifficultySchema: z.ZodEnum<["A1", "A2", "B1", "B2", "C1"]>;
export declare const LessonTypeSchema: z.ZodEnum<["vocabulary", "grammar", "conversation", "reading", "listening", "writing", "culture", "mixed"]>;
export declare const LearningObjectiveSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    isCompleted: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    description: string;
    isCompleted: boolean;
}, {
    id: string;
    description: string;
    createdAt?: Date | undefined;
    isCompleted?: boolean | undefined;
}>;
export declare const LessonMetadataSchema: z.ZodDefault<z.ZodObject<{
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    prerequisites: z.ZodDefault<z.ZodArray<any, "many">>;
    relatedLessons: z.ZodDefault<z.ZodArray<any, "many">>;
    isPremium: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    prerequisites: any[];
    relatedLessons: any[];
    isPremium: boolean;
}, {
    tags?: string[] | undefined;
    prerequisites?: any[] | undefined;
    relatedLessons?: any[] | undefined;
    isPremium?: boolean | undefined;
}>>;
export declare const LessonSchema: z.ZodCatch<z.ZodObject<{
    id: any;
    title: z.ZodString;
    description: z.ZodString;
    difficulty: z.ZodDefault<z.ZodEnum<["A1", "A2", "B1", "B2", "C1"]>>;
    type: z.ZodDefault<z.ZodEnum<["vocabulary", "grammar", "conversation", "reading", "listening", "writing", "culture", "mixed"]>>;
    duration: z.ZodDefault<z.ZodNumber>;
    vocabulary: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodObject<Omit<{
        id: any;
        german: z.ZodString;
        bulgarian: z.ZodString;
        partOfSpeech: any;
        difficulty: z.ZodDefault<z.ZodNumber>;
        categories: z.ZodDefault<z.ZodArray<any, "many">>;
        metadata: any;
        createdAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
        updatedAt: z.ZodEffects<z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>, Date, string | Date | undefined>;
        isCommon: z.ZodDefault<z.ZodBoolean>;
        isVerified: z.ZodDefault<z.ZodBoolean>;
    }, "id">, "strip", z.ZodTypeAny, {
        [x: string]: any;
        partOfSpeech?: unknown;
        difficulty?: unknown;
        categories?: unknown;
        german?: unknown;
        bulgarian?: unknown;
        metadata?: unknown;
        createdAt?: unknown;
        updatedAt?: unknown;
        isCommon?: unknown;
        isVerified?: unknown;
    }, {
        [x: string]: any;
        partOfSpeech?: unknown;
        difficulty?: unknown;
        categories?: unknown;
        german?: unknown;
        bulgarian?: unknown;
        metadata?: unknown;
        createdAt?: unknown;
        updatedAt?: unknown;
        isCommon?: unknown;
        isVerified?: unknown;
    }>, any, z.ZodString]>, "many">>;
    objectives: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        isCompleted: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDefault<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        description: string;
        isCompleted: boolean;
    }, {
        id: string;
        description: string;
        createdAt?: Date | undefined;
        isCompleted?: boolean | undefined;
    }>, "many">>;
    content: z.ZodOptional<z.ZodString>;
    isCompleted: z.ZodDefault<z.ZodBoolean>;
    completionPercentage: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>;
    updatedAt: z.ZodDefault<z.ZodUnion<[z.ZodDate, z.ZodEffects<z.ZodString, Date, string>]>>;
    metadata: z.ZodDefault<z.ZodObject<{
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        prerequisites: z.ZodDefault<z.ZodArray<any, "many">>;
        relatedLessons: z.ZodDefault<z.ZodArray<any, "many">>;
        isPremium: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        prerequisites: any[];
        relatedLessons: any[];
        isPremium: boolean;
    }, {
        tags?: string[] | undefined;
        prerequisites?: any[] | undefined;
        relatedLessons?: any[] | undefined;
        isPremium?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    id?: unknown;
    title?: unknown;
    description?: unknown;
    difficulty?: unknown;
    type?: unknown;
    duration?: unknown;
    vocabulary?: unknown;
    objectives?: unknown;
    content?: unknown;
    isCompleted?: unknown;
    completionPercentage?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
    metadata?: unknown;
}, {
    [x: string]: any;
    id?: unknown;
    title?: unknown;
    description?: unknown;
    difficulty?: unknown;
    type?: unknown;
    duration?: unknown;
    vocabulary?: unknown;
    objectives?: unknown;
    content?: unknown;
    isCompleted?: unknown;
    completionPercentage?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
    metadata?: unknown;
}>>;
export type VocabularyReference = z.infer<typeof VocabularyReferenceSchema>;
export type LessonDifficulty = z.infer<typeof LessonDifficultySchema>;
export type LessonType = z.infer<typeof LessonTypeSchema>;
export type LearningObjective = z.infer<typeof LearningObjectiveSchema>;
export type LessonMetadata = z.infer<typeof LessonMetadataSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
//# sourceMappingURL=lesson.d.ts.map