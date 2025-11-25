/**
 * Profile System
 * Complete dual-profile system with UI for Bulgarian-German Learning App
 * Combines ProfileManager and ProfileSwitcherUI into a single file for Hugo compatibility
 */

import type { Profile, CustomVocabularyEntry } from './types.js';

interface ProfileSwitchDetail {
  profileId: string;
  profile: Profile;
  previousProfileId: string;
}

interface ProfileIds {
  GERMAN_LEARNER: string;
  BULGARIAN_LEARNER: string;
}

interface ProfileManagerInstance {
  getAllProfiles(): Record<string, Profile>;
  getProfile(profileId: string): Profile | null;
  getActiveProfile(): Profile | null;
  getActiveProfileId(): string;
  switchProfile(profileId: string): boolean;
  getNamespacedKey(key: string, profileId?: string | null): string;
  onProfileChange(callback: () => void): void;
}

interface ProfileSwitcherUIInstance {
  // Add any public methods if needed
}

// ProfileManager Class
class ProfileManager {
  private PROFILES_KEY = 'bgde:profiles';
  private ACTIVE_PROFILE_KEY = 'bgde:active_profile';
  public PROFILE_IDS: ProfileIds = {
    GERMAN_LEARNER: 'german_learner',
    BULGARIAN_LEARNER: 'bulgarian_learner'
  };

  constructor() {
    this.initializeProfiles();
  }

  /**
   * Initialize profile system
   */
  private initializeProfiles(): void {
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
  private createDefaultProfiles(): void {
    const profiles: Record<string, Profile> = {
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
        customVocabulary: [] as CustomVocabularyEntry[],
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
        customVocabulary: [] as CustomVocabularyEntry[],
        customTags: [],
        customCategories: []
      }
    };

    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    console.log('[ProfileManager] Created default profiles');
  }

  /**
   * Migrate legacy localStorage data to profile system
   */
  private migrateLegacyData(): void {
    console.log('[ProfileManager] Checking for legacy data to migrate...');

    const legacyKeys: string[] = [];
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
  getAllProfiles(): Record<string, Profile> {
    const profiles = localStorage.getItem(this.PROFILES_KEY);
    return profiles ? JSON.parse(profiles) : {};
  }

  /**
   * Get specific profile by ID
   */
  getProfile(profileId: string): Profile | null {
    const profiles = this.getAllProfiles();
    return profiles[profileId] || null;
  }

  /**
   * Get active profile
   */
  getActiveProfile(): Profile | null {
    const activeId = localStorage.getItem(this.ACTIVE_PROFILE_KEY);
    return activeId ? this.getProfile(activeId) : null;
  }

  /**
   * Get active profile ID
   */
  getActiveProfileId(): string {
    return localStorage.getItem(this.ACTIVE_PROFILE_KEY) || this.PROFILE_IDS.GERMAN_LEARNER;
  }

  /**
   * Switch to a different profile
   */
  switchProfile(profileId: string): boolean {
    const profileObj = this.getProfile(profileId);

    if (!profileObj) {
      console.error(`[ProfileManager] Profile not found: ${profileId}`);
      return false;
    }

    // Update last accessed timestamp
    const profiles = this.getAllProfiles();
    const profileToUpdate = profiles[profileId];
    if (profileToUpdate) {
      profileToUpdate.lastAccessedAt = new Date().toISOString();
      localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    }

    // Switch active profile
    localStorage.setItem(this.ACTIVE_PROFILE_KEY, profileId);

    console.log(`[ProfileManager] Switched to profile: ${profileObj.displayName}`);

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('profile-switched', {
      detail: {
        profileId,
        profile: profileObj || undefined,
        previousProfileId: this.getActiveProfileId()
      }
    }));

    return true;
  }

  /**
   * Get namespaced localStorage key for profile
   */
  getNamespacedKey(key: string, profileId: string | null = null): string {
    const activeId = profileId || this.getActiveProfileId();
    return `bgde:${activeId}:${key}`;
  }

  /**
   * Register callback for profile change events
   */
  onProfileChange(callback: () => void): void {
    window.addEventListener('profile-switched', callback);
  }
}

// ProfileSwitcherUI Class
class ProfileSwitcherUI {
  private profileManager: ProfileManager | undefined;
  private container: HTMLElement | null = null;
  private isOpen: boolean = false;

  constructor(profileManager: ProfileManager) {
    if (!profileManager) {
      console.error('[ProfileSwitcherUI] ProfileManager is required');
      return;
    }

    this.profileManager = profileManager;
    this.container = null;
    this.isOpen = false;

    this.init();
  }

  /**
   * Initialize the UI component
   */
  private init(): void {
    this.findContainer();

    if (!this.container) {
      console.warn('[ProfileSwitcherUI] Container not found, waiting for DOM...');
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.findContainer() && this.render());
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

    const activeProfile = this.profileManager?.getActiveProfile();
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
    if (!this.profileManager) return '';
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
    case this.profileManager?.PROFILE_IDS.GERMAN_LEARNER: {
      return '🇩🇪';
    }
    case this.profileManager?.PROFILE_IDS.BULGARIAN_LEARNER: {
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
  private getProfileShortLabel(direction: string): string {
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
  private getDirectionLabel(direction: string): string {
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
      toggleBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    // Profile option clicks
    document.addEventListener('click', (e: Event) => {
      const optionBtn = (e.target as HTMLElement).closest('.profile-option');
      if (optionBtn) {
        const profileId = optionBtn.dataset.profileId;
        if (profileId && profileId !== this.profileManager?.getActiveProfileId()) {
          this.handleProfileSwitch(profileId);
        }
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e: Event) => {
      const switcher = (e.target as HTMLElement).closest('.profile-switcher');
      if (!switcher && this.isOpen) {
        this.closeDropdown();
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDropdown();
        const toggleBtn = document.querySelector('#profile-toggle') as HTMLElement | null;
        toggleBtn?.focus();
      }
    });

    // Listen for profile switch events from other sources
    window.addEventListener('profile-switched', (e: CustomEvent<ProfileSwitchDetail>) => {
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
    }
  }

  /**
   * Handle profile switch
   */
  private handleProfileSwitch(profileId: string): void {
    console.log(`[ProfileSwitcherUI] Switching to profile: ${profileId}`);

    const success = this.profileManager?.switchProfile(profileId);

    if (success) {
      this.closeDropdown();

      // Show brief confirmation message
      this.showSwitchConfirmation(profileId);

      // Reload page content after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      console.error(`[ProfileSwitcherUI] Failed to switch to profile: ${profileId}`);
      alert('Failed to switch profile. Please try again.');
    }
  }

  /**
   * Handle profile switched event (from other sources)
   */
  private handleProfileSwitched(detail: ProfileSwitchDetail): void {
    console.log('[ProfileSwitcherUI] Profile switched event received', detail);

    // Re-render to update active profile indicator
    this.render();
    this.attachEventListeners();
  }

  /**
   * Show switch confirmation message
   */
  private showSwitchConfirmation(profileId: string): void {
    if (!this.profileManager) return;
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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const profileManager = new ProfileManager();
    const profileSwitcherUI = new ProfileSwitcherUI(profileManager);
    (window as unknown as { profileManager: ProfileManagerInstance }).profileManager = profileManager;
    (window as unknown as { profileSwitcherUI: ProfileSwitcherUIInstance }).profileSwitcherUI = profileSwitcherUI;
    console.log('[ProfileSystem] Initialized');
  });
} else {
  const profileManager = new ProfileManager();
  const profileSwitcherUI = new ProfileSwitcherUI(profileManager);
  (window as unknown as { profileManager: ProfileManagerInstance }).profileManager = profileManager;
  (window as unknown as { profileSwitcherUI: ProfileSwitcherUIInstance }).profileSwitcherUI = profileSwitcherUI;
  console.log('[ProfileSystem] Initialized');
}

export { ProfileManager, ProfileSwitcherUI    };
export { type ProfileStatistics, type ProfileSettings, type Profile } from './types.js';