/**
 * Profile System
 * Complete dual-profile system with UI for Bulgarian-German Learning App
 * Combines ProfileManager and ProfileSwitcherUI into a single file for Hugo compatibility
 */

// ProfileManager Class
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
   */
  migrateLegacyData() {
    console.log('[ProfileManager] Checking for legacy data to migrate...');

    const legacyKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('bgde:') &&
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
    legacyKeys.forEach(key => {
      const value = localStorage.getItem(key);
      const newKey = key.replace('bgde:', `bgde:${this.PROFILE_IDS.GERMAN_LEARNER}:`);
      localStorage.setItem(newKey, value);
      console.log(`[ProfileManager] Migrated: ${key} → ${newKey}`);
    });

    console.log('[ProfileManager] Legacy data migration complete');
  }

  /**
   * Get all profiles
   */
  getAllProfiles() {
    const profiles = JSON.parse(localStorage.getItem(this.PROFILES_KEY));
    return profiles || {};
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
    return this.getProfile(activeId);
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
    profiles[profileId].lastAccessedAt = new Date().toISOString();
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));

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
   * Get namespaced localStorage key for profile
   */
  getNamespacedKey(key, profileId = null) {
    const activeId = profileId || this.getActiveProfileId();
    return `bgde:${activeId}:${key}`;
  }
}

// ProfileSwitcherUI Class
class ProfileSwitcherUI {
  constructor(profileManager) {
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
  init() {
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
  findContainer() {
    this.container = document.querySelector('[data-profile-switcher]');
    return this.container !== null;
  }

  /**
   * Render the profile switcher UI
   */
  render() {
    if (!this.container) return;

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
      case this.profileManager.PROFILE_IDS.GERMAN_LEARNER:
        return '🇩🇪';
      case this.profileManager.PROFILE_IDS.BULGARIAN_LEARNER:
        return '🇧🇬';
      default:
        return '🌍';
    }
  }

  /**
   * Get short label for profile direction
   */
  getProfileShortLabel(direction) {
    switch (direction) {
      case 'bg-de':
        return 'BG→DE';
      case 'de-bg':
        return 'DE→BG';
      default:
        return direction.toUpperCase();
    }
  }

  /**
   * Get full label for profile direction
   */
  getDirectionLabel(direction) {
    switch (direction) {
      case 'bg-de':
        return 'Bulgarian → German';
      case 'de-bg':
        return 'German → Bulgarian';
      default:
        return direction;
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle dropdown
    const toggleBtn = document.getElementById('profile-toggle');
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
        document.getElementById('profile-toggle')?.focus();
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
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open dropdown
   */
  openDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    const toggleBtn = document.getElementById('profile-toggle');

    if (dropdown && toggleBtn) {
      dropdown.classList.remove('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
      this.isOpen = true;
    }
  }

  /**
   * Close dropdown
   */
  closeDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    const toggleBtn = document.getElementById('profile-toggle');

    if (dropdown && toggleBtn) {
      dropdown.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
      this.isOpen = false;
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
    if (!profile) return;

    // Create temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'profile-switch-toast';
    toast.innerHTML = `
      <span class="toast-icon">${this.getProfileIcon(profileId)}</span>
      <span class="toast-message">Switched to ${profile.displayName}</span>
    `;

    document.body.appendChild(toast);

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
    window.profileManager = new ProfileManager();
    window.profileSwitcherUI = new ProfileSwitcherUI(window.profileManager);
    console.log('[ProfileSystem] Initialized');
  });
} else {
  window.profileManager = new ProfileManager();
  window.profileSwitcherUI = new ProfileSwitcherUI(window.profileManager);
  console.log('[ProfileSystem] Initialized');
}
