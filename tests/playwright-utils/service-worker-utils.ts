/**
 * Service Worker Testing Utilities
 * Provides helper methods for testing service worker functionality
 */

import { Page } from '@playwright/test';

export class ServiceWorkerManager {
  private page: Page;
  private serviceWorkerRegistration: any = null;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for service worker to be registered and active
   */
  async waitForServiceWorker(): Promise<void> {
    await this.page.waitForFunction(() => {
      return navigator.serviceWorker && navigator.serviceWorker.ready;
    }, { timeout: 10000 });

    this.serviceWorkerRegistration = await this.page.evaluate(() => {
      return navigator.serviceWorker.ready;
    });

    console.log('Service worker is active and ready');
  }

  /**
   * Get the current service worker registration
   */
  async getRegistration(): Promise<any> {
    if (!this.serviceWorkerRegistration) {
      await this.waitForServiceWorker();
    }
    return this.serviceWorkerRegistration;
  }

  /**
   * Get the active service worker instance
   */
  async getActiveWorker(): Promise<any> {
    const registration = await this.getRegistration();
    return registration.active;
  }

  /**
   * Send a message to the service worker
   */
  async sendMessage(type: string, data?: any): Promise<any> {
    const worker = await this.getActiveWorker();
    
    return await this.page.evaluate(async ({ worker, messageType, messageData }) => {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        worker.postMessage(
          { type: messageType, data: messageData },
          [messageChannel.port2]
        );
      });
    }, { worker, messageType: type, messageData: data });
  }

  /**
   * Get sync status from service worker
   */
  async getSyncStatus(): Promise<any> {
    return await this.sendMessage('GET_SYNC_STATUS');
  }

  /**
   * Trigger manual sync
   */
  async triggerSync(): Promise<any> {
    return await this.sendMessage('SYNC_NOW');
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<any> {
    return await this.sendMessage('CLEAR_CACHE');
  }

  /**
   * Get service worker version
   */
  async getVersion(): Promise<any> {
    return await this.sendMessage('GET_VERSION');
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    const worker = await this.getActiveWorker();
    await this.page.evaluate(async ({ worker }) => {
      worker.postMessage({ type: 'SKIP_WAITING' });
    }, { worker });
  }

  /**
   * Restart the service worker
   */
  async restartServiceWorker(): Promise<void> {
    // Unregister the current service worker
    await this.page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
    });

    // Wait for unregistration
    await this.page.waitForTimeout(1000);

    // Reload the page to re-register
    await this.page.reload();

    // Wait for new service worker to be active
    await this.waitForServiceWorker();
  }

  /**
   * Check if service worker is controlling the page
   */
  async isControllingPage(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });
  }

  /**
   * Get all cache names
   */
  async getCacheNames(): Promise<string[]> {
    return await this.page.evaluate(async () => {
      return await caches.keys();
    });
  }

  /**
   * Get cache contents for debugging
   */
  async getCacheContents(cacheName: string): Promise<any[]> {
    return await this.page.evaluate(async ({ name }) => {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      const contents = [];
      
      for (const request of requests) {
        const response = await cache.match(request);
        contents.push({
          url: request.url,
          status: response?.status,
          headers: Object.fromEntries(response?.headers.entries() || [])
        });
      }
      
      return contents;
    }, { name: cacheName });
  }

  /**
   * Simulate network conditions
   */
  async simulateNetworkCondition(condition: 'offline' | 'slow-3g' | 'fast-3g'): Promise<void> {
    await this.page.route('**/*', (route) => {
      if (condition === 'offline') {
        route.abort();
      } else if (condition === 'slow-3g') {
        // Simulate slow 3G network
        setTimeout(() => {
          route.continue();
        }, 1000 + Math.random() * 500);
      } else {
        // Fast 3G
        setTimeout(() => {
          route.continue();
        }, 100 + Math.random() * 100);
      }
    });
  }

  /**
   * Reset network conditions
   */
  async resetNetworkConditions(): Promise<void> {
    // Remove all network intercepts
    await this.page.unroute('**/*');
  }

  /**
   * Monitor service worker events
   */
  async monitorEvents(eventTypes: string[]): Promise<Map<string, any[]>> {
    const events = new Map<string, any[]>();
    
    for (const eventType of eventTypes) {
      events.set(eventType, []);
      
      await this.page.exposeFunction(`recordEvent_${eventType}`, (eventData: any) => {
        events.get(eventType)!.push(eventData);
      });
    }

    await this.page.evaluate(async ({ eventTypes }) => {
      const registration = await navigator.serviceWorker.ready;
      const worker = registration.active || registration.installing || registration.waiting;
      
      if (worker) {
        for (const eventType of eventTypes) {
          worker.addEventListener(eventType, (event) => {
            window[`recordEvent_${eventType}`]({
              type: event.type,
              timestamp: Date.now(),
              data: event.data || null
            });
          });
        }
      }
    }, { eventTypes });

    return events;
  }

  /**
   * Wait for specific event
   */
  async waitForEvent(eventType: string, timeout: number = 5000): Promise<any> {
    return await this.page.waitForFunction(
      ({ eventType }) => {
        return new Promise((resolve) => {
          const registration = navigator.serviceWorker.ready;
          const worker = registration.active || registration.installing || registration.waiting;
          
          if (worker) {
            worker.addEventListener(eventType, (event) => {
              resolve({
                type: event.type,
                timestamp: Date.now(),
                data: event.data || null
              });
            });
          }
        });
      },
      { eventType },
      { timeout }
    );
  }

  /**
   * Get service worker logs for debugging
   */
  async getLogs(): Promise<string[]> {
    return await this.page.evaluate(() => {
      // This would require custom logging setup in the service worker
      return [];
    });
  }

  /**
   * Test background sync functionality
   */
  async testBackgroundSync(): Promise<{
    canSync: boolean;
    periodicSyncSupported: boolean;
    syncTags: string[];
  }> {
    return await this.page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      
      return {
        canSync: 'sync' in registration,
        periodicSyncSupported: 'periodicSync' in registration,
        syncTags: [] // Would need to be tracked by the service worker
      };
    });
  }

  /**
   * Register periodic sync (if supported)
   */
  async registerPeriodicSync(tag: string, minInterval: number): Promise<boolean> {
    return await this.page.evaluate(async ({ syncTag, interval }) => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('periodicSync' in registration) {
          await registration.periodicSync.register(syncTag, {
            minInterval: interval
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to register periodic sync:', error);
        return false;
      }
    }, { syncTag: tag, interval: minInterval });
  }

  /**
   * Unregister periodic sync
   */
  async unregisterPeriodicSync(tag: string): Promise<boolean> {
    return await this.page.evaluate(async ({ syncTag }) => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('periodicSync' in registration) {
          await registration.periodicSync.unregister(syncTag);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to unregister periodic sync:', error);
        return false;
      }
    }, { syncTag: tag });
  }
}