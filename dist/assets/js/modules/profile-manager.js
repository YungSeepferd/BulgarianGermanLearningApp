/**
 * Profile Manager Module
 * Handles dual-profile system for bidirectional language learning
 *
 * Two hardcoded profiles:
 * - german_learner: Bulgarian person learning German (BG→DE)
 * - bulgarian_learner: German person learning Bulgarian (DE→BG)
 */
class ProfileManager {
    constructor() {
        this.PROFILES_KEY = 'bgde:profiles';
        this.ACTIVE_PROFILE_KEY = 'bgde:active_profile';
        this.PROFILE_IDS = {
            GERMAN_LEARNER: 'german_learner',
            BULGARIAN_LEARNER: 'bulgarian_learner'
        };
        this.initializeProfiles();
    }
    /**
     * Initialize profile system
     * Creates profiles if they don't exist, migrates legacy data
     */
    initializeProfiles() {
        const existing = localStorage.getItem(this.PROFILES_KEY);
        if (!existing) {
            console.log('[ProfileManager] No profiles found, initializing...');
            this.createDefaultProfiles();
            this.migrateLegacyData();
        }
        // Ensure active profile is set
        const activeProfile = localStorage.getItem(this.ACTIVE_PROFILE_KEY);
        if (!activeProfile) {
            localStorage.setItem(this.ACTIVE_PROFILE_KEY, this.PROFILE_IDS.GERMAN_LEARNER);
        }
    }
    /**
     * Create default profile structure
     */
    createDefaultProfiles() {
        const profiles = {
            [this.PROFILE_IDS.GERMAN_LEARNER]: {
                id: this.PROFILE_IDS.GERMAN_LEARNER,
                name: 'German Learner',
                displayName: 'Deutsch lernen (BG→DE)',
                direction: 'bg-de',
                sourceLanguage: 'bg',
                targetLanguage: 'de',
                createdAt: new Date().toISOString(),
                lastAccessedAt: new Date().toISOString(),
                statistics: {
                    totalReviews: 0,
                    totalCorrect: 0,
                    totalTime: 0,
                    streak: 0
                },
                settings: {
                    dailyGoal: 20,
                    autoPlayAudio: true,
                    voiceGender: 'female'
                },
                customVocabulary: [],
                customTags: [],
                customCategories: []
            },
            [this.PROFILE_IDS.BULGARIAN_LEARNER]: {
                id: this.PROFILE_IDS.BULGARIAN_LEARNER,
                name: 'Bulgarian Learner',
                displayName: 'Български език (DE→BG)',
                direction: 'de-bg',
                sourceLanguage: 'de',
                targetLanguage: 'bg',
                createdAt: new Date().toISOString(),
                lastAccessedAt: new Date().toISOString(),
                statistics: {
                    totalReviews: 0,
                    totalCorrect: 0,
                    totalTime: 0,
                    streak: 0
                },
                settings: {
                    dailyGoal: 20,
                    autoPlayAudio: true,
                    voiceGender: 'female'
                },
                customVocabulary: [],
                customTags: [],
                customCategories: []
            }
        };
        localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
        console.log('[ProfileManager] Created default profiles');
    }
    /**
     * Migrate legacy localStorage data to profile system
     * Moves existing review data and statistics to german_learner profile
     */
    migrateLegacyData() {
        console.log('[ProfileManager] Checking for legacy data to migrate...');
        const legacyKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('bgde:') &&
                !key.includes(this.PROFILES_KEY) &&
                !key.includes(this.ACTIVE_PROFILE_KEY)) {
                legacyKeys.push(key);
            }
        }
        if (legacyKeys.length === 0) {
            console.log('[ProfileManager] No legacy data found');
            return;
        }
        console.log(`[ProfileManager] Migrating ${legacyKeys.length} legacy keys...`);
        // Migrate to german_learner profile (default)
        for (const key of legacyKeys) {
            const value = localStorage.getItem(key);
            const newKey = key.replace('bgde:', `bgde:${this.PROFILE_IDS.GERMAN_LEARNER}:`);
            if (value) {
                localStorage.setItem(newKey, value);
                console.log(`[ProfileManager] Migrated: ${key} → ${newKey}`);
            }
        }
        console.log('[ProfileManager] Legacy data migration complete');
    }
    /**
     * Get all profiles
     */
    getAllProfiles() {
        const profiles = localStorage.getItem(this.PROFILES_KEY);
        return profiles ? JSON.parse(profiles) : {};
    }
    /**
     * Get specific profile by ID
     */
    getProfile(profileId) {
        const profiles = this.getAllProfiles();
        return profiles[profileId] || null;
    }
    /**
     * Get active profile
     */
    getActiveProfile() {
        const activeId = localStorage.getItem(this.ACTIVE_PROFILE_KEY);
        return activeId ? this.getProfile(activeId) : null;
    }
    /**
     * Get active profile ID
     */
    getActiveProfileId() {
        return localStorage.getItem(this.ACTIVE_PROFILE_KEY) || this.PROFILE_IDS.GERMAN_LEARNER;
    }
    /**
     * Switch to a different profile
     */
    switchProfile(profileId) {
        const profile = this.getProfile(profileId);
        if (!profile) {
            console.error(`[ProfileManager] Profile not found: ${profileId}`);
            return false;
        }
        // Update last accessed timestamp
        const profiles = this.getAllProfiles();
        if (profiles[profileId]) {
            profiles[profileId].lastAccessedAt = new Date().toISOString();
            localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
        }
        // Switch active profile
        localStorage.setItem(this.ACTIVE_PROFILE_KEY, profileId);
        console.log(`[ProfileManager] Switched to profile: ${profile.displayName}`);
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('profile-switched', {
            detail: {
                profileId,
                profile,
                previousProfileId: this.getActiveProfileId()
            }
        }));
        return true;
    }
    /**
     * Update profile data
     */
    updateProfile(profileId, updates) {
        const profiles = this.getAllProfiles();
        if (!profiles[profileId]) {
            console.error(`[ProfileManager] Cannot update non-existent profile: ${profileId}`);
            return false;
        }
        profiles[profileId] = {
            ...profiles[profileId],
            ...updates,
            id: profileId // Ensure ID doesn't change
        };
        localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: { profileId, profile: profiles[profileId] }
        }));
        return true;
    }
    /**
     * Update profile statistics
     */
    updateStatistics(profileId, statUpdates) {
        const profile = this.getProfile(profileId);
        if (!profile)
            return false;
        const updatedProfile = {
            ...profile,
            statistics: {
                ...profile.statistics,
                ...statUpdates
            }
        };
        return this.updateProfile(profileId, updatedProfile);
    }
    /**
     * Add custom vocabulary to profile
     */
    addCustomVocabulary(profileId, vocabEntry) {
        const profile = this.getProfile(profileId);
        if (!profile)
            return false;
        const customVocab = profile.customVocabulary || [];
        // Generate unique ID for custom vocab
        const vocabId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        const entry = {
            id: vocabId,
            ...vocabEntry,
            addedAt: new Date().toISOString(),
            source: 'custom',
            enrichmentStatus: this.calculateEnrichmentStatus(vocabEntry)
        };
        customVocab.push(entry);
        return this.updateProfile(profileId, {
            customVocabulary: customVocab
        });
    }
    /**
     * Calculate enrichment status for vocabulary
     * Returns: 'complete', 'partial', 'minimal'
     */
    calculateEnrichmentStatus(vocabEntry) {
        let score = 0;
        // Required fields (always present)
        if (vocabEntry.bulgarian)
            score += 1;
        if (vocabEntry.german)
            score += 1;
        // Optional enrichment fields
        if (vocabEntry.category)
            score += 1;
        if (vocabEntry.level)
            score += 1;
        if (vocabEntry.examples && vocabEntry.examples.length > 0)
            score += 2;
        if (vocabEntry.notes)
            score += 1;
        if (vocabEntry.etymology)
            score += 1;
        if (vocabEntry.cultural_note)
            score += 1;
        if (score >= 7)
            return 'complete';
        if (score >= 4)
            return 'partial';
        return 'minimal';
    }
    /**
     * Get incomplete vocabulary count for profile
     */
    getIncompleteVocabularyCount(profileId) {
        const profile = this.getProfile(profileId);
        if (!profile)
            return 0;
        const customVocab = profile.customVocabulary || [];
        return customVocab.filter(v => v.enrichmentStatus === 'minimal' || v.enrichmentStatus === 'partial').length;
    }
    /**
     * Add custom tag to profile
     */
    addCustomTag(profileId, tag) {
        const profile = this.getProfile(profileId);
        if (!profile)
            return false;
        const customTags = profile.customTags || [];
        if (!customTags.includes(tag)) {
            customTags.push(tag);
            return this.updateProfile(profileId, { customTags });
        }
        return true;
    }
    /**
     * Add custom category to profile
     */
    addCustomCategory(profileId, category) {
        const profile = this.getProfile(profileId);
        if (!profile)
            return false;
        const customCategories = profile.customCategories || [];
        if (!customCategories.includes(category)) {
            customCategories.push(category);
            return this.updateProfile(profileId, { customCategories });
        }
        return true;
    }
    /**
     * Get namespaced localStorage key for profile
     * Usage: profileManager.getNamespacedKey('reviews')
     * Returns: 'bgde:german_learner:reviews'
     */
    getNamespacedKey(key, profileId = null) {
        const activeId = profileId || this.getActiveProfileId();
        return `bgde:${activeId}:${key}`;
    }
    /**
     * Get profile-specific data from localStorage
     */
    getProfileData(key, profileId = null) {
        const namespacedKey = this.getNamespacedKey(key, profileId);
        const data = localStorage.getItem(namespacedKey);
        return data ? JSON.parse(data) : null;
    }
    /**
     * Set profile-specific data in localStorage
     */
    setProfileData(key, value, profileId = null) {
        const namespacedKey = this.getNamespacedKey(key, profileId);
        localStorage.setItem(namespacedKey, JSON.stringify(value));
    }
    /**
     * Export profile data (for backup/transfer)
     */
    exportProfile(profileId) {
        const profile = this.getProfile(profileId);
        if (!profile)
            return null;
        // Gather all profile-specific data
        const exportData = {
            profile,
            reviews: this.getProfileData('reviews', profileId),
            statistics: this.getProfileData('statistics', profileId),
            streak: this.getProfileData('streak', profileId),
            session_history: this.getProfileData('session_history', profileId),
            exportedAt: new Date().toISOString()
        };
        return exportData;
    }
    /**
     * Import profile data (from backup/transfer)
     */
    importProfile(profileId, importData) {
        if (!this.getProfile(profileId)) {
            console.error(`[ProfileManager] Cannot import to non-existent profile: ${profileId}`);
            return false;
        }
        // Restore profile info
        if (importData.profile && typeof importData.profile === 'object') {
            this.updateProfile(profileId, importData.profile);
        }
        // Restore profile-specific data
        if (importData.reviews) {
            this.setProfileData('reviews', importData.reviews, profileId);
        }
        if (importData.statistics) {
            this.setProfileData('statistics', importData.statistics, profileId);
        }
        if (importData.streak) {
            this.setProfileData('streak', importData.streak, profileId);
        }
        if (importData.session_history) {
            this.setProfileData('session_history', importData.session_history, profileId);
        }
        console.log(`[ProfileManager] Imported profile data for: ${profileId}`);
        return true;
    }
    /**
     * Get summary statistics for both profiles (for comparison)
     */
    getProfileComparison() {
        const germanLearner = this.getProfile(this.PROFILE_IDS.GERMAN_LEARNER);
        const bulgarianLearner = this.getProfile(this.PROFILE_IDS.BULGARIAN_LEARNER);
        return {
            german_learner: {
                name: germanLearner?.displayName || 'German Learner',
                totalReviews: germanLearner?.statistics.totalReviews || 0,
                accuracy: germanLearner && germanLearner.statistics.totalReviews > 0
                    ? (germanLearner.statistics.totalCorrect / germanLearner.statistics.totalReviews * 100).toFixed(1)
                    : '0',
                streak: germanLearner?.statistics.streak || 0,
                lastAccessed: germanLearner?.lastAccessedAt || new Date().toISOString()
            },
            bulgarian_learner: {
                name: bulgarianLearner?.displayName || 'Bulgarian Learner',
                totalReviews: bulgarianLearner?.statistics.totalReviews || 0,
                accuracy: bulgarianLearner && bulgarianLearner.statistics.totalReviews > 0
                    ? (bulgarianLearner.statistics.totalCorrect / bulgarianLearner.statistics.totalReviews * 100).toFixed(1)
                    : '0',
                streak: bulgarianLearner?.statistics.streak || 0,
                lastAccessed: bulgarianLearner?.lastAccessedAt || new Date().toISOString()
            }
        };
    }
    /**
     * Clear all profile data (for testing/reset)
     */
    resetAllProfiles() {
        localStorage.removeItem(this.PROFILES_KEY);
        localStorage.removeItem(this.ACTIVE_PROFILE_KEY);
        // Clear all profile-namespaced keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('bgde:german_learner:') || key.startsWith('bgde:bulgarian_learner:'))) {
                keysToRemove.push(key);
            }
        }
        for (const key of keysToRemove)
            localStorage.removeItem(key);
        this.initializeProfiles();
        console.log('[ProfileManager] All profiles reset');
    }
}
// Export as ES6 module
export default ProfileManager;
//# sourceMappingURL=profile-manager.js.map