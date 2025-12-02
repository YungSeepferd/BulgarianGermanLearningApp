/**
 * Profile Switcher UI Module
 *
 * Provides UI controls for switching between learning profiles in the Bulgarian-German
 * learning application. This module handles the complete user interface for profile
 * management including dropdown controls, visual indicators, event handling, and
 * content reloading.
 *
 * Features:
 * - Dropdown selector with both learning profiles
 * - Visual indicators (flag emojis) for each profile
 * - Event handling for profile switches
 * - Page content reload on profile change
 * - Accessibility support with ARIA attributes
 * - Toast notifications for profile switches
 * - Keyboard navigation support
 *
 * @example
 * ```typescript
 * import ProfileSwitcherUI from './modules/profile-switcher-ui.js';
 * import profileManager from './modules/profile-manager.js';
 *
 * const profileSwitcher = new ProfileSwitcherUI(profileManager);
 *
 * // The UI will automatically render in the container with
 * // data-profile-switcher attribute
 * ```
 *
 * @since 1.0.0
 */
/**
 * Learning profile interface
 *
 * Represents a user learning profile with configuration for the
 * Bulgarian-German learning direction and display information.
 *
 * @interface Profile
 * @property {string} id - Unique profile identifier
 * @property {string} displayName - Human-readable profile name
 * @property {'bg-de'|'de-bg'} direction - Learning direction (Bulgarian→German or German→Bulgarian)
 *
 * @example
 * ```typescript
 * const profile: Profile = {
 *   id: 'german-learner',
 *   displayName: 'German Learner',
 *   direction: 'bg-de'
 * };
 * ```
 */
interface Profile {
    id: string;
    displayName: string;
    direction: 'bg-de' | 'de-bg';
}
/**
 * Profile manager interface
 *
 * Defines the contract for profile management operations including
 * profile retrieval, switching, and configuration access.
 *
 * @interface ProfileManager
 * @property {Object} PROFILE_IDS - Constants for profile identifiers
 * @property {string} PROFILE_IDS.GERMAN_LEARNER - ID for German learner profile
 * @property {string} PROFILE_IDS.BULGARIAN_LEARNER - ID for Bulgarian learner profile
 * @property {Function} getActiveProfile - Gets the currently active profile
 * @property {Function} getActiveProfileId - Gets the active profile ID
 * @property {Function} getAllProfiles - Gets all available profiles
 * @property {Function} getProfile - Gets a specific profile by ID
 * @property {Function} switchProfile - Switches to a different profile
 *
 * @example
 * ```typescript
 * const manager: ProfileManager = {
 *   PROFILE_IDS: {
 *     GERMAN_LEARNER: 'german-learner',
 *     BULGARIAN_LEARNER: 'bulgarian-learner'
 *   },
 *   getActiveProfile: () => ({ id: 'german-learner', displayName: 'German Learner', direction: 'bg-de' }),
 *   getActiveProfileId: () => 'german-learner',
 *   getAllProfiles: () => ({ 'german-learner': profile1, 'bulgarian-learner': profile2 }),
 *   getProfile: (id) => profiles[id] || null,
 *   switchProfile: (id) => true
 * };
 * ```
 */
interface ProfileManager {
    PROFILE_IDS: {
        GERMAN_LEARNER: string;
        BULGARIAN_LEARNER: string;
    };
    getActiveProfile(): Profile | null;
    getActiveProfileId(): string;
    getAllProfiles(): Record<string, Profile>;
    getProfile(profileId: string): Profile | null;
    switchProfile(profileId: string): boolean;
}
/**
 * Profile Switcher UI class
 *
 * Manages the user interface for switching between learning profiles.
 * This class handles dropdown rendering, event management, profile switching
 * logic, and content reloading. It provides an accessible interface with
 * keyboard navigation and visual feedback.
 *
 * @class ProfileSwitcherUI
 *
 * @example
 * ```typescript
 * // Basic usage
 * const profileSwitcher = new ProfileSwitcherUI(profileManager);
 *
 * // The component will automatically find the container element
 * // with data-profile-switcher attribute and render the UI
 *
 * // Access component state
 * console.log(profileSwitcher.isDropdownOpen); // false
 * console.log(profileSwitcher.currentContainer); // HTMLElement or null
 * ```
 *
 * @example
 * ```typescript
 * // Update statistics (called by dashboard)
 * profileSwitcher.updateStatistics();
 *
 * // Clean up when navigating away
 * profileSwitcher.destroy();
 * ```
 *
 * @since 1.0.0
 */
declare class ProfileSwitcherUI {
    /** Profile manager instance for profile operations */
    private profileManager;
    /** Container element for the profile switcher UI */
    private container;
    /** Dropdown element reference */
    private dropdown;
    /** Whether the dropdown is currently open */
    private isOpen;
    /**
     * Creates a new ProfileSwitcherUI instance
     *
     * @constructor
     * @param {ProfileManager} profileManager - Profile manager instance
     * @throws {Error} When profileManager is not provided
     *
     * @example
     * ```typescript
     * const profileSwitcher = new ProfileSwitcherUI(profileManager);
     *
     * // The UI will automatically initialize and render
     * // in the container with data-profile-switcher attribute
     * ```
     */
    constructor(profileManager: ProfileManager);
    /**
     * Initialize the UI component
     *
     * This method handles the initialization process by:
     * 1. Finding the container element in the DOM
     * 2. Handling cases where DOM is not ready yet
     * 3. Rendering the UI when container is found
     * 4. Setting up event listeners
     *
     * @private
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Called automatically during constructor
     * this.init();
     *
     * // Component will render when DOM is ready
     * ```
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
    /**
     * Reload page content with new profile data
     */
    private reloadPageContent;
    /**
     * Update profile statistics display
     *
     * This method can be called by the dashboard or other components
     * to refresh statistics display for the current profile. Currently
     * logs the update but can be extended to update UI elements.
     *
     * @public
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Called by dashboard when statistics change
     * profileSwitcher.updateStatistics();
     *
     * // Logs: Statistics updated for profile: german-learner
     * ```
     */
    updateStatistics(): void;
    /**
     * Destroy the UI component and perform cleanup
     *
     * This method should be called when navigating away from the page
     * or when the component is no longer needed. It:
     * 1. Clears the container content
     * 2. Removes event listeners
     * 3. Resets internal state
     *
     * @public
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Clean up when leaving the page
     * profileSwitcher.destroy();
     *
     * // Component is removed from DOM and resources are freed
     * ```
     */
    destroy(): void;
    /**
     * Gets whether the dropdown is currently open
     *
     * @public
     * @readonly
     * @type {boolean}
     * @returns {boolean} True if dropdown is open, false otherwise
     *
     * @example
     * ```typescript
     * if (profileSwitcher.isDropdownOpen) {
     *   console.log('Dropdown is currently open');
     * } else {
     *   console.log('Dropdown is closed');
     * }
     * ```
     */
    get isDropdownOpen(): boolean;
    /**
     * Gets the current container element
     *
     * @public
     * @readonly
     * @type {HTMLElement|null}
     * @returns {HTMLElement|null} The container element or null if not found
     *
     * @example
     * ```typescript
     * const container = profileSwitcher.currentContainer;
     * if (container) {
     *   console.log('Container found:', container.tagName);
     * } else {
     *   console.log('Container not found');
     * }
     * ```
     */
    get currentContainer(): HTMLElement | null;
}
export default ProfileSwitcherUI;
//# sourceMappingURL=profile-switcher-ui.d.ts.map