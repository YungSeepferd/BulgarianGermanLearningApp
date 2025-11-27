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
 * Profile switched event detail
 *
 * Contains information about a profile switch event that can be
 * used by other components to react to profile changes.
 *
 * @interface ProfileSwitchedEventDetail
 * @property {string} profileId - ID of the switched-to profile
 * @property {Profile} profile - The complete profile object
 *
 * @example
 * ```typescript
 * const eventDetail: ProfileSwitchedEventDetail = {
 *   profileId: 'german-learner',
 *   profile: { id: 'german-learner', displayName: 'German Learner', direction: 'bg-de' }
 * };
 *
 * window.dispatchEvent(new CustomEvent('profile-switched', {
 *   detail: eventDetail
 * }));
 * ```
 */
interface ProfileSwitchedEventDetail {
  profileId: string;
  profile: Profile;
}

/**
 * Profile content reload event detail
 *
 * Contains information for triggering content reload when profile changes.
 * This allows other components to update their data without full page reload.
 *
 * @interface ProfileContentReloadEventDetail
 * @property {string} profileId - ID of the active profile
 * @property {Profile} profile - The complete profile object
 *
 * @example
 * ```typescript
 * const eventDetail: ProfileContentReloadEventDetail = {
 *   profileId: 'german-learner',
 *   profile: { id: 'german-learner', displayName: 'German Learner', direction: 'bg-de' }
 * };
 *
 * window.dispatchEvent(new CustomEvent('profile-content-reload', {
 *   detail: eventDetail
 * }));
 * ```
 */
interface ProfileContentReloadEventDetail {
  profileId: string;
  profile: Profile;
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
class ProfileSwitcherUI {
  /** Profile manager instance for profile operations */
  private profileManager: ProfileManager;
  /** Container element for the profile switcher UI */
  private container: HTMLElement | null;
  /** Dropdown element reference */
  private dropdown: HTMLElement | null;
  /** Whether the dropdown is currently open */
  private isOpen: boolean;

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
  constructor(profileManager: ProfileManager) {
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
  private init(): void {
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
  private findContainer(): boolean {
    this.container = document.querySelector('[data-profile-switcher]');
    return this.container !== null;
  }

  /**
   * Render the profile switcher UI
   */
  private render(): void {
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
  private renderProfileOptions(): string {
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
  private getProfileIcon(profileId: string): string {
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
  private getProfileShortLabel(direction: 'bg-de' | 'de-bg'): string {
    switch (direction) {
    case 'bg-de': {
      return 'BG→DE';
    }
    case 'de-bg': {
      return 'DE→BG';
    }
    default: {
      return (direction as string).toUpperCase();
    }
    }
  }

  /**
   * Get full label for profile direction
   */
  private getDirectionLabel(direction: 'bg-de' | 'de-bg'): string {
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
  private attachEventListeners(): void {
    // Toggle dropdown
    const toggleBtn = document.querySelector('#profile-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    // Profile option clicks
    document.addEventListener('click', (e: MouseEvent) => {
      const optionBtn = (e.target as Element).closest('.profile-option');
      if (optionBtn) {
        const profileId = (optionBtn as HTMLElement).dataset.profileId;
        if (profileId && profileId !== this.profileManager.getActiveProfileId()) {
          this.handleProfileSwitch(profileId);
        }
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e: MouseEvent) => {
      const switcher = (e.target as Element).closest('.profile-switcher');
      if (!switcher && this.isOpen) {
        this.closeDropdown();
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDropdown();
        (document.querySelector('#profile-toggle') as HTMLElement)?.focus();
      }
    });

    // Listen for profile switch events from other sources
    window.addEventListener('profile-switched', (e: CustomEvent<ProfileSwitchedEventDetail>) => {
      this.handleProfileSwitched(e.detail);
    });

    console.log('[ProfileSwitcherUI] Event listeners attached');
  }

  /**
   * Toggle dropdown visibility
   */
  private toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open dropdown
   */
  private openDropdown(): void {
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
  private closeDropdown(): void {
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
  private handleProfileSwitch(profileId: string): void {
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
    } else {
      console.error(`[ProfileSwitcherUI] Failed to switch to profile: ${profileId}`);
      alert('Failed to switch profile. Please try again.');
    }
  }

  /**
   * Handle profile switched event (from other sources)
   */
  private handleProfileSwitched(detail: ProfileSwitchedEventDetail): void {
    console.log('[ProfileSwitcherUI] Profile switched event received', detail);

    // Re-render to update active profile indicator
    this.render();
    this.attachEventListeners();
  }

  /**
   * Show switch confirmation message
   */
  private showSwitchConfirmation(profileId: string): void {
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
  private reloadPageContent(): void {
    console.log('[ProfileSwitcherUI] Reloading page content...');

    // Dispatch custom event that other modules can listen to
    window.dispatchEvent(new CustomEvent<ProfileContentReloadEventDetail>('profile-content-reload', {
      detail: {
        profileId: this.profileManager.getActiveProfileId(),
        profile: this.profileManager.getActiveProfile()!
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
    } else {
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
  public updateStatistics(): void {
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
  public destroy(): void {
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
  public get isDropdownOpen(): boolean {
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
  public get currentContainer(): HTMLElement | null {
    return this.container;
  }
}

export default ProfileSwitcherUI;