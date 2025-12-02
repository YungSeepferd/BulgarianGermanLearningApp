/**
 * Profile System
 * Complete dual-profile system with UI for Bulgarian-German Learning App
 * Combines ProfileManager and ProfileSwitcherUI into a single file for Hugo compatibility
 */
import type { Profile } from './types.js';
interface ProfileIds {
    GERMAN_LEARNER: string;
    BULGARIAN_LEARNER: string;
}
declare class ProfileManager {
    private PROFILES_KEY;
    private ACTIVE_PROFILE_KEY;
    PROFILE_IDS: ProfileIds;
    constructor();
    /**
     * Initialize profile system
     */
    private initializeProfiles;
    /**
     * Create default profile structure
     */
    private createDefaultProfiles;
    /**
     * Migrate legacy localStorage data to profile system
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
     * Get namespaced localStorage key for profile
     */
    getNamespacedKey(key: string, profileId?: string | null): string;
    /**
     * Register callback for profile change events
     */
    onProfileChange(callback: () => void): void;
}
declare class ProfileSwitcherUI {
    private profileManager;
    private container;
    private isOpen;
    constructor(profileManager: ProfileManager);
    /**
     * Initialize the UI component
     */
    private init;
    /**
     * Find the container element in the DOM
     */
    private findContainer;
    /**
     * Render the profile switcher UI
     */
    private render;
    /**
     * Render profile option buttons
     */
    private renderProfileOptions;
    /**
     * Get profile icon (flag emoji)
     */
    private getProfileIcon;
    /**
     * Get short label for profile direction
     */
    private getProfileShortLabel;
    /**
     * Get full label for profile direction
     */
    private getDirectionLabel;
    /**
     * Attach event listeners
     */
    private attachEventListeners;
    /**
     * Toggle dropdown visibility
     */
    private toggleDropdown;
    /**
     * Open dropdown
     */
    private openDropdown;
    /**
     * Close dropdown
     */
    private closeDropdown;
    /**
     * Handle profile switch
     */
    private handleProfileSwitch;
    /**
     * Handle profile switched event (from other sources)
     */
    private handleProfileSwitched;
    /**
     * Show switch confirmation message
     */
    private showSwitchConfirmation;
}
export { ProfileManager, ProfileSwitcherUI };
export { type ProfileStatistics, type ProfileSettings, type Profile } from './types.js';
//# sourceMappingURL=profile-system.d.ts.map