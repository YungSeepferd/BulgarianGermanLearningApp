/**
 * Service Worker Registration and Management
 *
 * Handles PWA functionality, offline support, and cache management for the
 * Bulgarian-German learning application. This module provides a comprehensive
 * service worker management system with update notifications, install prompts,
 * connection status monitoring, and background sync capabilities.
 *
 * Features:
 * - Automatic service worker registration and updates
 * - PWA install prompts and notifications
 * - Offline/online connection status monitoring
 * - Background sync for offline data
 * - Cache management and prefetching
 * - Update notifications with user choice
 * - Periodic update checks
 *
 * @example
 * ```typescript
 * import serviceWorkerManager from './modules/service-worker.js';
 *
 * // Service worker is automatically registered
 * // Check if PWA is installed
 * if (serviceWorkerManager.isInstalled()) {
 *   console.log('App is installed as PWA');
 * }
 *
 * // Check for updates
 * if (serviceWorkerManager.hasUpdateAvailable) {
 *   console.log('Update available');
 * }
 *
 * // Clear cache if needed
 * await serviceWorkerManager.clearCache();
 * ```
 *
 * @since 1.0.0
 */
/**
 * Service Worker Manager class
 *
 * Manages the complete service worker lifecycle including registration,
 * updates, PWA installation prompts, offline support, and background sync.
 * This class provides a high-level API for service worker operations
 * with automatic error handling and user notifications.
 *
 * @class ServiceWorkerManager
 *
 * @example
 * ```typescript
 * // Service worker manager is automatically instantiated
 * // and registers the service worker on page load
 *
 * // Check service worker status
 * if (serviceWorkerManager.isServiceWorkerReady) {
 *   console.log('Service worker is active');
 * }
 *
 * // Check connection status
 * if (!serviceWorkerManager.isAppOnline) {
 *   console.log('App is offline, using cached content');
 * }
 *
 * // Handle PWA installation
 * if (!serviceWorkerManager.isInstalled()) {
 *   // Show install prompt will appear automatically
 * }
 * ```
 *
 * @since 1.0.0
 */
class ServiceWorkerManager {
    /**
     * Creates a new ServiceWorkerManager instance
     *
     * @constructor
     *
     * @example
     * ```typescript
     * // Manager is automatically created and initialized
     * const manager = new ServiceWorkerManager();
     * ```
     */
    constructor() {
        this.swRegistration = null;
        this.updateAvailable = false;
        this.isOnline = navigator.onLine;
        this.periodicUpdateTimer = null;
        this.init();
    }
    /**
     * Initializes the service worker manager
     *
     * This method handles the complete initialization process:
     * 1. Checks for service worker support
     * 2. Skips registration in development environment
     * 3. Registers the service worker with proper scope
     * 4. Sets up event listeners for lifecycle events
     * 5. Checks for available updates
     * 6. Configures periodic update checking
     *
     * @private
     * @async
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Called automatically during constructor
     * await this.init();
     *
     * // Service worker is now registered and ready
     * ```
     */
    async init() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[SW Manager] Service Worker not supported');
            return;
        }
        const host = window.location.hostname;
        const isDev = host === 'localhost' || host === '127.0.0.1';
        if (isDev) {
            console.log('[SW Manager] Skipping registration in development environment');
            return;
        }
        try {
            // Register service worker
            this.swRegistration = await navigator.serviceWorker.register('/sw-workbox.js', {
                scope: '/'
            });
            console.log('[SW Manager] Service Worker registered successfully');
            // Set up event listeners
            this.setupEventListeners();
            // Check for updates
            this.checkForUpdates();
            // Set up periodic update checks
            this.setupPeriodicUpdateCheck();
        }
        catch (error) {
            console.error('[SW Manager] Service Worker registration failed:', error);
        }
    }
    setupEventListeners() {
        if (!this.swRegistration)
            return;
        // Listen for service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
            const newWorker = this.swRegistration.installing;
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        this.updateAvailable = true;
                        this.showUpdateNotification();
                    }
                });
            }
        });
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event.data);
        });
        // Listen for connection changes
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleConnectionChange(true);
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleConnectionChange(false);
        });
        // Listen for beforeinstallprompt (PWA install)
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            this.showInstallPrompt(event);
        });
        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            console.log('[SW Manager] PWA installed successfully');
            this.hideInstallPrompt();
        });
    }
    handleServiceWorkerMessage(data) {
        switch (data.type) {
            case 'SW_ACTIVATED': {
                console.log('[SW Manager] Service Worker activated, version:', data.version);
                this.hideUpdateNotification();
                break;
            }
            case 'CACHE_UPDATED': {
                console.log('[SW Manager] Cache updated for:', data.url);
                break;
            }
            default: {
                console.log('[SW Manager] Unknown message from SW:', data);
            }
        }
    }
    async checkForUpdates() {
        if (!this.swRegistration) {
            return;
        }
        try {
            await this.swRegistration.update();
        }
        catch (error) {
            console.error('[SW Manager] Failed to check for updates:', error);
        }
    }
    setupPeriodicUpdateCheck() {
        // Check for updates every 30 minutes
        this.periodicUpdateTimer = window.setInterval(() => {
            if (this.isOnline) {
                this.checkForUpdates();
            }
        }, 30 * 60 * 1000);
    }
    showUpdateNotification() {
        // Remove existing notification
        this.hideUpdateNotification();
        const notification = document.createElement('div');
        notification.id = 'sw-update-notification';
        notification.className = 'sw-notification update-available';
        notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">🔄</div>
        <div class="notification-text">
          <strong>Update Available</strong>
          <p>A new version of the app is ready. Refresh to update.</p>
        </div>
        <div class="notification-actions">
          <button id="sw-update-btn" class="btn btn-primary btn-sm">Update</button>
          <button id="sw-dismiss-btn" class="btn btn-secondary btn-sm">Later</button>
        </div>
      </div>
    `;
        document.body.append(notification);
        // Add event listeners
        const updateBtn = document.querySelector('#sw-update-btn');
        const dismissBtn = document.querySelector('#sw-dismiss-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                this.applyUpdate();
            });
        }
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hideUpdateNotification();
            });
        }
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideUpdateNotification();
        }, 10000);
    }
    hideUpdateNotification() {
        const notification = document.querySelector('#sw-update-notification');
        if (notification) {
            notification.remove();
        }
    }
    async applyUpdate() {
        if (!this.swRegistration || !this.swRegistration.waiting) {
            console.warn('[SW Manager] No update available to apply');
            return;
        }
        // Tell the waiting service worker to skip waiting
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        // Reload the page to activate the new service worker
        window.location.reload();
    }
    showInstallPrompt(event) {
        // Only show if not already installed and user hasn't dismissed recently
        const lastDismissed = localStorage.getItem('bgde:pwa-install-dismissed');
        const now = Date.now();
        const dismissedRecently = lastDismissed && (now - Number.parseInt(lastDismissed)) < 7 * 24 * 60 * 60 * 1000; // 7 days
        if (dismissedRecently) {
            return;
        }
        const prompt = document.createElement('div');
        prompt.id = 'pwa-install-prompt';
        prompt.className = 'sw-notification install-prompt';
        prompt.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">📱</div>
        <div class="notification-text">
          <strong>Install App</strong>
          <p>Add Bulgarian-German Learning to your home screen for quick access.</p>
        </div>
        <div class="notification-actions">
          <button id="pwa-install-btn" class="btn btn-primary btn-sm">Install</button>
          <button id="pwa-dismiss-btn" class="btn btn-secondary btn-sm">Not Now</button>
        </div>
      </div>
    `;
        document.body.append(prompt);
        // Add event listeners
        const installBtn = document.querySelector('#pwa-install-btn');
        const dismissBtn = document.querySelector('#pwa-dismiss-btn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                try {
                    await event.prompt();
                    const choiceResult = await event.userChoice;
                    if (choiceResult.outcome === 'accepted') {
                        console.log('[SW Manager] User accepted PWA install');
                    }
                    else {
                        console.log('[SW Manager] User dismissed PWA install');
                    }
                    this.hideInstallPrompt();
                }
                catch (error) {
                    console.error('[SW Manager] PWA install failed:', error);
                }
            });
        }
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                localStorage.setItem('bgde:pwa-install-dismissed', now.toString());
                this.hideInstallPrompt();
            });
        }
        // Auto-hide after 15 seconds
        setTimeout(() => {
            this.hideInstallPrompt();
        }, 15000);
    }
    hideInstallPrompt() {
        const prompt = document.querySelector('#pwa-install-prompt');
        if (prompt) {
            prompt.remove();
        }
    }
    handleConnectionChange(isOnline) {
        console.log('[SW Manager] Connection changed:', isOnline ? 'online' : 'offline');
        // Show connection status notification
        this.showConnectionNotification(isOnline);
        // Trigger cache sync when coming back online
        if (isOnline && this.swRegistration) {
            this.syncWhenOnline();
        }
    }
    showConnectionNotification(isOnline) {
        // Remove existing notification
        const existing = document.querySelector('#connection-notification');
        if (existing) {
            existing.remove();
        }
        const notification = document.createElement('div');
        notification.id = 'connection-notification';
        notification.className = `sw-notification connection-status ${isOnline ? 'online' : 'offline'}`;
        notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${isOnline ? '🟢' : '🔴'}</div>
        <div class="notification-text">
          <strong>${isOnline ? 'Back Online' : 'You\'re Offline'}</strong>
          <p>${isOnline ? 'All features are now available.' : 'Using cached content. Some features may be limited.'}</p>
        </div>
      </div>
    `;
        document.body.append(notification);
        // Auto-hide after 3 seconds
        setTimeout(() => {
            const notif = document.querySelector('#connection-notification');
            if (notif) {
                notif.remove();
            }
        }, 3000);
    }
    async syncWhenOnline() {
        if (!this.swRegistration || !this.isOnline) {
            return;
        }
        try {
            // Trigger background sync if supported
            if ('sync' in window.ServiceWorkerRegistration.prototype) {
                await this.swRegistration.sync.register('background-sync');
            }
            // Prefetch vocabulary data
            await this.prefetchVocabularyData();
        }
        catch (error) {
            console.error('[SW Manager] Sync failed:', error);
        }
    }
    async prefetchVocabularyData() {
        try {
            // Load vocabulary data and send to service worker for prefetching
            const response = await fetch('/search-index.json');
            if (response.ok) {
                const data = await response.json();
                if (this.swRegistration && this.swRegistration.active) {
                    this.swRegistration.active.postMessage({
                        type: 'PREFETCH_VOCABULARY',
                        data: { items: data.vocabulary || [] }
                    });
                }
            }
        }
        catch (error) {
            console.warn('[SW Manager] Failed to prefetch vocabulary:', error);
        }
    }
    /**
     * Clears the service worker cache
     *
     * This method sends a message to the active service worker
     * to clear all cached content. Useful for troubleshooting
     * or forcing fresh content retrieval.
     *
     * @public
     * @async
     * @returns {Promise<boolean>} True if cache was cleared successfully
     *
     * @example
     * ```typescript
     * const success = await serviceWorkerManager.clearCache();
     * if (success) {
     *   console.log('Cache cleared successfully');
     * } else {
     *   console.log('Failed to clear cache');
     * }
     * ```
     */
    async clearCache() {
        if (!this.swRegistration || !this.swRegistration.active) {
            console.warn('[SW Manager] No active service worker to clear cache');
            return false;
        }
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.success);
            };
            this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);
        });
    }
    /**
     * Gets the current service worker version
     *
     * This method retrieves version information from the active
     * service worker for debugging and display purposes.
     *
     * @public
     * @async
     * @returns {Promise<any>} Version information or null if not available
     *
     * @example
     * ```typescript
     * const version = await serviceWorkerManager.getVersion();
     * if (version) {
     *   console.log(`Service worker version: ${version.version}`);
     *   console.log(`Build date: ${version.buildDate}`);
     * }
     * ```
     */
    async getVersion() {
        if (!this.swRegistration || !this.swRegistration.active) {
            return null;
        }
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            this.swRegistration.active.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
        });
    }
    /**
     * Checks if service workers are supported in the current browser
     *
     * @public
     * @returns {boolean} True if service workers are supported
     *
     * @example
     * ```typescript
     * if (serviceWorkerManager.isSupported()) {
     *   console.log('Service workers are supported');
     * } else {
     *   console.log('Service workers not supported in this browser');
     * }
     * ```
     */
    isSupported() {
        return 'serviceWorker' in navigator;
    }
    /**
     * Checks if the app is installed as a PWA
     *
     * This method detects whether the app is running in standalone
     * mode, indicating it has been installed as a PWA.
     *
     * @public
     * @returns {boolean} True if app is installed as PWA
     *
     * @example
     * ```typescript
     * if (serviceWorkerManager.isInstalled()) {
     *   console.log('App is installed as PWA');
     *   // Hide install prompts, show PWA-specific features
     * } else {
     *   console.log('App running in browser');
     *   // Show install prompts
     * }
     * ```
     */
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
    }
    /**
     * Gets whether the service worker is registered and ready
     *
     * @public
     * @readonly
     * @type {boolean}
     * @returns {boolean} True if service worker is registered
     *
     * @example
     * ```typescript
     * if (serviceWorkerManager.isServiceWorkerReady) {
     *   console.log('Service worker is ready for operations');
     * } else {
     *   console.log('Service worker not yet registered');
     * }
     * ```
     */
    get isServiceWorkerReady() {
        return this.swRegistration !== null;
    }
    /**
     * Gets whether the app is currently online
     *
     * @public
     * @readonly
     * @type {boolean}
     * @returns {boolean} True if app has network connectivity
     *
     * @example
     * ```typescript
     * if (serviceWorkerManager.isAppOnline) {
     *   console.log('App is online - full functionality available');
     * } else {
     *   console.log('App is offline - using cached content');
     * }
     * ```
     */
    get isAppOnline() {
        return this.isOnline;
    }
    /**
     * Gets whether a service worker update is available
     *
     * @public
     * @readonly
     * @type {boolean}
     * @returns {boolean} True if update is available and waiting
     *
     * @example
     * ```typescript
     * if (serviceWorkerManager.hasUpdateAvailable) {
     *   console.log('Update available - user can refresh to get latest version');
     *   // Show update notification or prompt
     * }
     * ```
     */
    get hasUpdateAvailable() {
        return this.updateAvailable;
    }
    /**
     * Destroys the service worker manager and cleans up resources
     *
     * This method should be called when the page is unloading or
     * when the service worker manager is no longer needed. It:
     * 1. Clears the periodic update timer
     * 2. Removes any active notifications
     * 3. Cleans up event listeners and resources
     *
     * @public
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Clean up when leaving the page
     * serviceWorkerManager.destroy();
     *
     * // All timers are cleared and notifications removed
     * ```
     */
    destroy() {
        if (this.periodicUpdateTimer) {
            clearInterval(this.periodicUpdateTimer);
            this.periodicUpdateTimer = null;
        }
        this.hideUpdateNotification();
        this.hideInstallPrompt();
    }
}
// Create and export singleton instance
const serviceWorkerManager = new ServiceWorkerManager();
export default serviceWorkerManager;
// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
    window.serviceWorkerManager = serviceWorkerManager;
}
//# sourceMappingURL=service-worker.js.map