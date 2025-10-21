// Service Worker Registration and Management
// Handles PWA functionality, offline support, and cache management

class ServiceWorkerManager {
  constructor() {
    this.swRegistration = null;
    this.updateAvailable = false;
    this.isOnline = navigator.onLine;
    
    this.init();
  }

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
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[SW Manager] Service Worker registered successfully');

      // Set up event listeners
      this.setupEventListeners();
      
      // Check for updates
      this.checkForUpdates();
      
      // Set up periodic update checks
      this.setupPeriodicUpdateCheck();

    } catch (error) {
      console.error('[SW Manager] Service Worker registration failed:', error);
    }
  }

  setupEventListeners() {
    // Listen for service worker updates
    this.swRegistration.addEventListener('updatefound', () => {
      const newWorker = this.swRegistration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          this.updateAvailable = true;
          this.showUpdateNotification();
        }
      });
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
      case 'SW_ACTIVATED':
        console.log('[SW Manager] Service Worker activated, version:', data.version);
        this.hideUpdateNotification();
        break;
        
      case 'CACHE_UPDATED':
        console.log('[SW Manager] Cache updated for:', data.url);
        break;
        
      default:
        console.log('[SW Manager] Unknown message from SW:', data);
    }
  }

  async checkForUpdates() {
    if (!this.swRegistration) return;

    try {
      await this.swRegistration.update();
    } catch (error) {
      console.error('[SW Manager] Failed to check for updates:', error);
    }
  }

  setupPeriodicUpdateCheck() {
    // Check for updates every 30 minutes
    setInterval(() => {
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

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById('sw-update-btn').addEventListener('click', () => {
      this.applyUpdate();
    });

    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
      this.hideUpdateNotification();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideUpdateNotification();
    }, 10000);
  }

  hideUpdateNotification() {
    const notification = document.getElementById('sw-update-notification');
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
    const dismissedRecently = lastDismissed && (now - parseInt(lastDismissed)) < 7 * 24 * 60 * 60 * 1000; // 7 days

    if (dismissedRecently) return;

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

    document.body.appendChild(prompt);

    // Add event listeners
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      try {
        await event.prompt();
        const choiceResult = await event.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('[SW Manager] User accepted PWA install');
        } else {
          console.log('[SW Manager] User dismissed PWA install');
        }
        
        this.hideInstallPrompt();
      } catch (error) {
        console.error('[SW Manager] PWA install failed:', error);
      }
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      localStorage.setItem('bgde:pwa-install-dismissed', now.toString());
      this.hideInstallPrompt();
    });

    // Auto-hide after 15 seconds
    setTimeout(() => {
      this.hideInstallPrompt();
    }, 15000);
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('pwa-install-prompt');
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
    const existing = document.getElementById('connection-notification');
    if (existing) existing.remove();

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

    document.body.appendChild(notification);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      const notif = document.getElementById('connection-notification');
      if (notif) notif.remove();
    }, 3000);
  }

  async syncWhenOnline() {
    if (!this.swRegistration || !this.isOnline) return;

    try {
      // Trigger background sync if supported
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        await this.swRegistration.sync.register('background-sync');
      }
      
      // Prefetch vocabulary data
      await this.prefetchVocabularyData();
      
    } catch (error) {
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
    } catch (error) {
      console.warn('[SW Manager] Failed to prefetch vocabulary:', error);
    }
  }

  // Public API methods
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
      
      this.swRegistration.active.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  async getVersion() {
    if (!this.swRegistration || !this.swRegistration.active) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      this.swRegistration.active.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }

  isSupported() {
    return 'serviceWorker' in navigator;
  }

  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
}

// Create and export singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

export default serviceWorkerManager;

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.serviceWorkerManager = serviceWorkerManager;
}
