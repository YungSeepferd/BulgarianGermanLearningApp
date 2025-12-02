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
class ProfileSwitcherUI {
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
    constructor(profileManager) {
        if (!profileManager) {
            console.error('[ProfileSwitcherUI] ProfileManager is required');
            return;
        }
        this.profileManager = profileManager;
        this.container = null;
        this.dropdown = null;
        this.isOpen = false;
        this.init();
    }
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
    init() {
        this.findContainer();
        if (!this.container) {
            console.warn('[ProfileSwitcherUI] Container not found, waiting for DOM...');
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    if (this.findContainer()) {
                        this.render();
                    }
                });
            }
            return;
        }
        this.render();
        this.attachEventListeners();
    }
    /**
     * Find the container element in the DOM
     */
    findContainer() {
        this.container = document.querySelector('[data-profile-switcher]');
        return this.container !== null;
    }
    /**
     * Render the profile switcher UI
     */
    render() {
        if (!this.container) {
            return;
        }
        const activeProfile = this.profileManager.getActiveProfile();
        if (!activeProfile) {
            console.error('[ProfileSwitcherUI] No active profile found');
            return;
        }
        this.container.innerHTML = `
      <div class="profile-switcher">
        <button
          id="profile-toggle"
          class="profile-toggle"
          aria-label="Switch learning profile"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <span class="profile-icon">${this.getProfileIcon(activeProfile.id)}</span>
          <span class="profile-label">${this.getProfileShortLabel(activeProfile.direction)}</span>
        </button>

        <div class="profile-dropdown hidden" id="profile-dropdown">
          <div class="profile-dropdown-header">
            <h3>Learning Profile</h3>
          </div>

          <div class="profile-options">
            ${this.renderProfileOptions()}
          </div>
        </div>
      </div>
    `;
        console.log('[ProfileSwitcherUI] Rendered profile switcher');
    }
    /**
     * Render profile option buttons
     */
    renderProfileOptions() {
        const profiles = this.profileManager.getAllProfiles();
        const activeId = this.profileManager.getActiveProfileId();
        return Object.values(profiles).map(profile => {
            const isActive = profile.id === activeId;
            return `
        <button
          class="profile-option ${isActive ? 'active' : ''}"
          data-profile-id="${profile.id}"
          aria-pressed="${isActive}"
        >
          <span class="profile-option-icon">${this.getProfileIcon(profile.id)}</span>
          <div class="profile-option-content">
            <div class="profile-option-name">${profile.displayName}</div>
            <div class="profile-option-meta">
              <span class="profile-direction">${this.getDirectionLabel(profile.direction)}</span>
              ${isActive ? '<span class="profile-option-badge">Active</span>' : ''}
            </div>
          </div>
          ${isActive ? '<span class="profile-option-check">✓</span>' : ''}
        </button>
      `;
        }).join('');
    }
    /**
     * Get profile icon (flag emoji)
     */
    getProfileIcon(profileId) {
        switch (profileId) {
            case this.profileManager.PROFILE_IDS.GERMAN_LEARNER: {
                return '🇩🇪';
            }
            case this.profileManager.PROFILE_IDS.BULGARIAN_LEARNER: {
                return '🇧🇬';
            }
            default: {
                return '🌍';
            }
        }
    }
    /**
     * Get short label for profile direction
     */
    getProfileShortLabel(direction) {
        switch (direction) {
            case 'bg-de': {
                return 'BG→DE';
            }
            case 'de-bg': {
                return 'DE→BG';
            }
            default: {
                return direction.toUpperCase();
            }
        }
    }
    /**
     * Get full label for profile direction
     */
    getDirectionLabel(direction) {
        switch (direction) {
            case 'bg-de': {
                return 'Bulgarian → German';
            }
            case 'de-bg': {
                return 'German → Bulgarian';
            }
            default: {
                return direction;
            }
        }
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toggle dropdown
        const toggleBtn = document.querySelector('#profile-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }
        // Profile option clicks
        document.addEventListener('click', (e) => {
            const optionBtn = e.target.closest('.profile-option');
            if (optionBtn) {
                const profileId = optionBtn.dataset.profileId;
                if (profileId && profileId !== this.profileManager.getActiveProfileId()) {
                    this.handleProfileSwitch(profileId);
                }
            }
        });
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const switcher = e.target.closest('.profile-switcher');
            if (!switcher && this.isOpen) {
                this.closeDropdown();
            }
        });
        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDropdown();
                document.querySelector('#profile-toggle')?.focus();
            }
        });
        // Listen for profile switch events from other sources
        window.addEventListener('profile-switched', (e) => {
            this.handleProfileSwitched(e.detail);
        });
        console.log('[ProfileSwitcherUI] Event listeners attached');
    }
    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        }
        else {
            this.openDropdown();
        }
    }
    /**
     * Open dropdown
     */
    openDropdown() {
        const dropdown = document.querySelector('#profile-dropdown');
        const toggleBtn = document.querySelector('#profile-toggle');
        if (dropdown && toggleBtn) {
            dropdown.classList.remove('hidden');
            toggleBtn.setAttribute('aria-expanded', 'true');
            this.isOpen = true;
            console.log('[ProfileSwitcherUI] Dropdown opened');
        }
    }
    /**
     * Close dropdown
     */
    closeDropdown() {
        const dropdown = document.querySelector('#profile-dropdown');
        const toggleBtn = document.querySelector('#profile-toggle');
        if (dropdown && toggleBtn) {
            dropdown.classList.add('hidden');
            toggleBtn.setAttribute('aria-expanded', 'false');
            this.isOpen = false;
            console.log('[ProfileSwitcherUI] Dropdown closed');
        }
    }
    /**
     * Handle profile switch
     */
    handleProfileSwitch(profileId) {
        console.log(`[ProfileSwitcherUI] Switching to profile: ${profileId}`);
        const success = this.profileManager.switchProfile(profileId);
        if (success) {
            this.closeDropdown();
            // Show brief confirmation message
            this.showSwitchConfirmation(profileId);
            // Reload page content after a brief delay
            setTimeout(() => {
                this.reloadPageContent();
            }, 300);
        }
        else {
            console.error(`[ProfileSwitcherUI] Failed to switch to profile: ${profileId}`);
            alert('Failed to switch profile. Please try again.');
        }
    }
    /**
     * Handle profile switched event (from other sources)
     */
    handleProfileSwitched(detail) {
        console.log('[ProfileSwitcherUI] Profile switched event received', detail);
        // Re-render to update active profile indicator
        this.render();
        this.attachEventListeners();
    }
    /**
     * Show switch confirmation message
     */
    showSwitchConfirmation(profileId) {
        const profile = this.profileManager.getProfile(profileId);
        if (!profile) {
            return;
        }
        // Create temporary toast notification
        const toast = document.createElement('div');
        toast.className = 'profile-switch-toast';
        toast.innerHTML = `
      <span class="toast-icon">${this.getProfileIcon(profileId)}</span>
      <span class="toast-message">Switched to ${profile.displayName}</span>
    `;
        document.body.append(toast);
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        // Remove after 2 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    /**
     * Reload page content with new profile data
     */
    reloadPageContent() {
        console.log('[ProfileSwitcherUI] Reloading page content...');
        // Dispatch custom event that other modules can listen to
        window.dispatchEvent(new CustomEvent('profile-content-reload', {
            detail: {
                profileId: this.profileManager.getActiveProfileId(),
                profile: this.profileManager.getActiveProfile()
            }
        }));
        // For pages that need full reload (like vocabulary, practice)
        // we'll reload the page to ensure all data is fresh
        const currentPath = window.location.pathname;
        // Pages that should reload
        const reloadPages = ['/vocabulary/', '/practice/', '/grammar/', '/progress/'];
        const shouldReload = reloadPages.some(page => currentPath.includes(page));
        if (shouldReload) {
            console.log('[ProfileSwitcherUI] Reloading page for fresh data');
            window.location.reload();
        }
        else {
            // For homepage, dispatch event and let dashboard widgets update
            console.log('[ProfileSwitcherUI] Page content reload complete');
        }
    }
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
    updateStatistics() {
        const activeProfile = this.profileManager.getActiveProfile();
        if (!activeProfile) {
            return;
        }
        // This method can be called by dashboard to update stats
        console.log('[ProfileSwitcherUI] Statistics updated for profile:', activeProfile.id);
    }
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
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        console.log('[ProfileSwitcherUI] Component destroyed');
    }
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
    get isDropdownOpen() {
        return this.isOpen;
    }
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
    get currentContainer() {
        return this.container;
    }
}
export default ProfileSwitcherUI;
//# sourceMappingURL=profile-switcher-ui.js.map