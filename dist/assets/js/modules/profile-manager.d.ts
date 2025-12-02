/**
 * Profile Manager Module
 * Handles dual-profile system for bidirectional language learning
 *
 * Two hardcoded profiles:
 * - german_learner: Bulgarian person learning German (BG→DE)
 * - bulgarian_learner: German person learning Bulgarian (DE→BG)
 */
import type { Profile, ProfileStatistics, CustomVocabularyEntry, ProfileComparison } from '../types.js';
declare class ProfileManager {
    private PROFILES_KEY;
    private ACTIVE_PROFILE_KEY;
    private PROFILE_IDS;
    constructor();
    /**
     * Initialize profile system
     * Creates profiles if they don't exist, migrates legacy data
     */
    private initializeProfiles;
    /**
     * Create default profile structure
     */
    private createDefaultProfiles;
    /**
     * Migrate legacy localStorage data to profile system
     * Moves existing review data and statistics to german_learner profile
     */
    private migrateLegacyData;
    /**
     * Get all profiles
     */
    getAllProfiles(): Record<string, Profile>;
    /**
     * Get specific profile by ID
     */
    getProfile(profileId: string): Profile | null;
    /**
     * Get active profile
     */
    getActiveProfile(): Profile | null;
    /**
     * Get active profile ID
     */
    getActiveProfileId(): string;
    /**
     * Switch to a different profile
     */
    switchProfile(profileId: string): boolean;
    /**
     * Update profile data
     */
    updateProfile(profileId: string, updates: Partial<Profile>): boolean;
    /**
     * Update profile statistics
     */
    updateStatistics(profileId: string, statUpdates: Partial<ProfileStatistics>): boolean;
    /**
     * Add custom vocabulary to profile
     */
    addCustomVocabulary(profileId: string, vocabEntry: Omit<CustomVocabularyEntry, 'id' | 'addedAt' | 'source' | 'enrichmentStatus'>): boolean;
    /**
     * Calculate enrichment status for vocabulary
     * Returns: 'complete', 'partial', 'minimal'
     */
    private calculateEnrichmentStatus;
    /**
     * Get incomplete vocabulary count for profile
     */
    getIncompleteVocabularyCount(profileId: string): number;
    /**
     * Add custom tag to profile
     */
    addCustomTag(profileId: string, tag: string): boolean;
    /**
     * Add custom category to profile
     */
    addCustomCategory(profileId: string, category: string): boolean;
    /**
     * Get namespaced localStorage key for profile
     * Usage: profileManager.getNamespacedKey('reviews')
     * Returns: 'bgde:german_learner:reviews'
     */
    getNamespacedKey(key: string, profileId?: string | null): string;
    /**
     * Get profile-specific data from localStorage
     */
    getProfileData<T>(key: string, profileId?: string | null): T | null;
    /**
     * Set profile-specific data in localStorage
     */
    setProfileData<T>(key: string, value: T, profileId?: string | null): void;
    /**
     * Export profile data (for backup/transfer)
     */
    exportProfile(profileId: string): Record<string, unknown> | null;
    /**
     * Import profile data (from backup/transfer)
     */
    importProfile(profileId: string, importData: Record<string, unknown>): boolean;
    /**
     * Get summary statistics for both profiles (for comparison)
     */
    getProfileComparison(): ProfileComparison;
    /**
     * Clear all profile data (for testing/reset)
     */
    resetAllProfiles(): void;
}
export default ProfileManager;
//# sourceMappingURL=profile-manager.d.ts.map