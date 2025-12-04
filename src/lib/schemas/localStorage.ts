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
 * TypeScript types derived from Zod schemas
 */
export type PracticeStat = z.infer<typeof PracticeStatSchema>;
export type UserProgressStorage = z.infer<typeof UserProgressStorageSchema>;
export type ExportedUserData = z.infer<typeof ExportedUserDataSchema>;

/**
 * Validation functions
 */
export function validatePracticeStat(data: unknown): PracticeStat {
  return PracticeStatSchema.parse(data);
}

export function validateUserProgressStorage(data: unknown): UserProgressStorage {
  return UserProgressStorageSchema.parse(data);
}

export function safeValidateUserProgressStorage(data: unknown): { success: true; data: UserProgressStorage } | { success: false; error: z.ZodError } {
  const result = UserProgressStorageSchema.safeParse(data);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

export function validateExportedUserData(data: unknown): ExportedUserData {
  return ExportedUserDataSchema.parse(data);
}

export function safeValidateExportedUserData(data: unknown): { success: true; data: ExportedUserData } | { success: false; error: z.ZodError } {
  const result = ExportedUserDataSchema.safeParse(data);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

/**
 * Type guard for PracticeStat
 */
export function isPracticeStat(data: unknown): data is PracticeStat {
  return PracticeStatSchema.safeParse(data).success;
}

/**
 * Type guard for UserProgressStorage
 */
export function isUserProgressStorage(data: unknown): data is UserProgressStorage {
  return UserProgressStorageSchema.safeParse(data).success;
}