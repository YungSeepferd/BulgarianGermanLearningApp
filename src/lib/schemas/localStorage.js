import { z } from 'zod';
import { PracticeSessionSchema } from './vocabulary';
/**
 * Schema for individual practice stat entry
 */
export const PracticeStatSchema = z.object({
    id: z.string(),
    correct: z.number().int().nonnegative(),
    incorrect: z.number().int().nonnegative(),
    lastPracticed: z.string().datetime()
});
/**
 * Schema for user progress storage
 */
export const UserProgressStorageSchema = z.object({
    stats: z.array(PracticeStatSchema),
    favorites: z.array(z.string()),
    recentSearches: z.array(z.string()),
    lastUpdated: z.string().datetime()
});
/**
 * Schema for exported user data
 */
export const ExportedUserDataSchema = z.object({
    progress: UserProgressStorageSchema.optional(),
    session: PracticeSessionSchema.optional(),
    exportedAt: z.string().datetime()
});
/**
 * Validation functions
 */
export function validatePracticeStat(data) {
    return PracticeStatSchema.parse(data);
}
export function validateUserProgressStorage(data) {
    return UserProgressStorageSchema.parse(data);
}
export function safeValidateUserProgressStorage(data) {
    const result = UserProgressStorageSchema.safeParse(data);
    return result.success
        ? { success: true, data: result.data }
        : { success: false, error: result.error };
}
export function validateExportedUserData(data) {
    return ExportedUserDataSchema.parse(data);
}
export function safeValidateExportedUserData(data) {
    const result = ExportedUserDataSchema.safeParse(data);
    return result.success
        ? { success: true, data: result.data }
        : { success: false, error: result.error };
}
/**
 * Type guard for PracticeStat
 */
export function isPracticeStat(data) {
    return PracticeStatSchema.safeParse(data).success;
}
/**
 * Type guard for UserProgressStorage
 */
export function isUserProgressStorage(data) {
    return UserProgressStorageSchema.safeParse(data).success;
}
//# sourceMappingURL=localStorage.js.map