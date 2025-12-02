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
declare class ServiceWorkerManager {
    /** Service worker registration instance */
    private swRegistration;
    /** Whether a service worker update is available */
    private updateAvailable;
    /** Current online/offline status */
    private isOnline;
    /** Timer for periodic update checks */
    private periodicUpdateTimer;
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
    constructor();
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
    private init;
    private setupEventListeners;
    private handleServiceWorkerMessage;
    private checkForUpdates;
    private setupPeriodicUpdateCheck;
    private showUpdateNotification;
    private hideUpdateNotification;
    private applyUpdate;
    private showInstallPrompt;
    private hideInstallPrompt;
    private handleConnectionChange;
    private showConnectionNotification;
    private syncWhenOnline;
    private prefetchVocabularyData;
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
    clearCache(): Promise<boolean>;
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
    getVersion(): Promise<any>;
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
    isSupported(): boolean;
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
    isInstalled(): boolean;
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
    get isServiceWorkerReady(): boolean;
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
    get isAppOnline(): boolean;
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
    get hasUpdateAvailable(): boolean;
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
    destroy(): void;
}
declare const serviceWorkerManager: ServiceWorkerManager;
export default serviceWorkerManager;
//# sourceMappingURL=service-worker.d.ts.map