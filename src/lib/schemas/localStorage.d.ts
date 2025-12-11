import { z } from 'zod';
/**
 * Schema for individual practice stat entry
 */
export declare const PracticeStatSchema: z.ZodObject<{
    id: z.ZodString;
    correct: z.ZodNumber;
    incorrect: z.ZodNumber;
    lastPracticed: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    correct: number;
    incorrect: number;
    lastPracticed: string;
}, {
    id: string;
    correct: number;
    incorrect: number;
    lastPracticed: string;
}>;
/**
 * Schema for user progress storage
 */
export declare const UserProgressStorageSchema: z.ZodObject<{
    stats: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        correct: z.ZodNumber;
        incorrect: z.ZodNumber;
        lastPracticed: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        correct: number;
        incorrect: number;
        lastPracticed: string;
    }, {
        id: string;
        correct: number;
        incorrect: number;
        lastPracticed: string;
    }>, "many">;
    favorites: z.ZodArray<z.ZodString, "many">;
    recentSearches: z.ZodArray<z.ZodString, "many">;
    lastUpdated: z.ZodString;
}, "strip", z.ZodTypeAny, {
    stats: {
        id: string;
        correct: number;
        incorrect: number;
        lastPracticed: string;
    }[];
    favorites: string[];
    recentSearches: string[];
    lastUpdated: string;
}, {
    stats: {
        id: string;
        correct: number;
        incorrect: number;
        lastPracticed: string;
    }[];
    favorites: string[];
    recentSearches: string[];
    lastUpdated: string;
}>;
/**
 * Schema for exported user data
 */
export declare const ExportedUserDataSchema: z.ZodObject<{
    progress: z.ZodOptional<z.ZodObject<{
        stats: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            correct: z.ZodNumber;
            incorrect: z.ZodNumber;
            lastPracticed: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            correct: number;
            incorrect: number;
            lastPracticed: string;
        }, {
            id: string;
            correct: number;
            incorrect: number;
            lastPracticed: string;
        }>, "many">;
        favorites: z.ZodArray<z.ZodString, "many">;
        recentSearches: z.ZodArray<z.ZodString, "many">;
        lastUpdated: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        stats: {
            id: string;
            correct: number;
            incorrect: number;
            lastPracticed: string;
        }[];
        favorites: string[];
        recentSearches: string[];
        lastUpdated: string;
    }, {
        stats: {
            id: string;
            correct: number;
            incorrect: number;
            lastPracticed: string;
        }[];
        favorites: string[];
        recentSearches: string[];
        lastUpdated: string;
    }>>;
    session: z.ZodUndefined;
    exportedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    progress?: unknown;
    session?: unknown;
    exportedAt?: unknown;
}, {
    [x: string]: any;
    progress?: unknown;
    session?: unknown;
    exportedAt?: unknown;
}>;
/**
 * TypeScript types derived from Zod schemas
 */
export type PracticeStat = z.infer<typeof PracticeStatSchema>;
export type UserProgressStorage = z.infer<typeof UserProgressStorageSchema>;
export type ExportedUserData = z.infer<typeof ExportedUserDataSchema>;
/**
 * Validation functions
 */
export declare function validatePracticeStat(data: unknown): PracticeStat;
export declare function validateUserProgressStorage(data: unknown): UserProgressStorage;
export declare function safeValidateUserProgressStorage(data: unknown): {
    success: true;
    data: UserProgressStorage;
} | {
    success: false;
    error: z.ZodError;
};
export declare function validateExportedUserData(data: unknown): ExportedUserData;
export declare function safeValidateExportedUserData(data: unknown): {
    success: true;
    data: ExportedUserData;
} | {
    success: false;
    error: z.ZodError;
};
/**
 * Type guard for PracticeStat
 */
export declare function isPracticeStat(data: unknown): data is PracticeStat;
/**
 * Type guard for UserProgressStorage
 */
export declare function isUserProgressStorage(data: unknown): data is UserProgressStorage;
//# sourceMappingURL=localStorage.d.ts.map