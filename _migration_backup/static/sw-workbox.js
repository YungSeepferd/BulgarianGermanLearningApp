// Workbox-powered Service Worker for Bulgarian-German Learning App
// Provides enhanced caching strategies and offline functionality

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-background-sync.prod.js');

// Configure Workbox
workbox.setConfig({
  debug: false,
  modulePathPrefix: 'https://storage.googleapis.com/workbox-cdn/releases/7.4.0/'
});

// Set cache name details
workbox.core.setCacheNameDetails({
  prefix: 'bgde-app',
  suffix: 'v1.4.0'
});

// Skip waiting and claim clients immediately
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// Precache critical assets
workbox.precaching.precacheAndRoute([
  // These will be automatically populated by the build process
  // The actual precache manifest is injected during build
]);

// Network-first strategy for HTML pages
workbox.routing.registerRoute(
  /\.html$/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-pages',
    networkTimeoutSeconds: 3,
    plugins: [
      {
        cacheWillUpdate: async ({ request, response, event, state }) => {
          // Only cache successful responses
          return response && response.status === 200 ? response : null;
        }
      }
    ]
  })
);

// Cache-first strategy for static assets
workbox.routing.registerRoute(
  /\.(?:css|js|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      {
        cacheWillUpdate: async ({ request, response, event, state }) => {
          // Only cache successful responses
          return response && response.status === 200 ? response : null;
        },
        cacheKeyWillBeUsed: async ({ request, mode }) => {
          // Use URL without query parameters as cache key
          return request.url.split('?')[0];
        }
      },
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      })
    ]
  })
);

// Stale-while-revalidate for JSON data
workbox.routing.registerRoute(
  /\.json$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'data-cache',
    plugins: [
      {
        cacheWillUpdate: async ({ request, response, event, state }) => {
          // Only cache successful responses
          return response && response.status === 200 ? response : null;
        }
      },
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true
      })
    ]
  })
);

// Network-first for API requests
workbox.routing.registerRoute(
  /\/api\//,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      {
        cacheWillUpdate: async ({ request, response, event, state }) => {
          // Only cache successful responses
          return response && response.status === 200 ? response : null;
        }
      }
    ]
  })
);

// Cache Google Fonts
workbox.routing.registerRoute(
  /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
      })
    ]
  })
);

// Cache CDN assets
workbox.routing.registerRoute(
  /^https:\/\/cdn\.jsdelivr\.net\/.*/,
  new workbox.strategies.CacheFirst({
    cacheName: 'cdn-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Background sync queues for offline data
const progressQueue = new workbox.backgroundSync.Queue('progress-queue', {
  maxRetentionTime: 24 * 60 * 60, // 24 hours
  onSync: async ({ queue }) => {
    console.log('[Background Sync] Processing progress queue');
    const entries = await queue.getAll();
    for (const entry of entries) {
      try {
        const response = await fetch(entry.request, {
          method: 'POST',
          body: entry.request.body,
          headers: entry.request.headers
        });
        
        if (response.ok) {
          await queue.delete(entry.request);
          console.log('[Background Sync] Progress update synced:', entry.request.url);
          
          // Notify clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              data: { type: 'progress', url: entry.request.url }
            });
          });
        } else {
          console.warn('[Background Sync] Failed to sync progress:', response.status);
        }
      } catch (error) {
        console.error('[Background Sync] Error syncing progress:', error);
      }
    }
  }
});

const vocabularyProgressQueue = new workbox.backgroundSync.Queue('vocabulary-progress-queue', {
  maxRetentionTime: 7 * 24 * 60 * 60, // 7 days
  onSync: async ({ queue }) => {
    console.log('[Background Sync] Processing vocabulary progress queue');
    const entries = await queue.getAll();
    for (const entry of entries) {
      try {
        const response = await fetch(entry.request, {
          method: 'POST',
          body: entry.request.body,
          headers: {
            'Content-Type': 'application/json',
            ...entry.request.headers
          }
        });
        
        if (response.ok) {
          await queue.delete(entry.request);
          console.log('[Background Sync] Vocabulary progress synced:', entry.request.url);
          
          // Notify clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              data: { type: 'vocabulary-progress', url: entry.request.url }
            });
          });
        } else {
          console.warn('[Background Sync] Failed to sync vocabulary progress:', response.status);
        }
      } catch (error) {
        console.error('[Background Sync] Error syncing vocabulary progress:', error);
      }
    }
  }
});

const userPreferencesQueue = new workbox.backgroundSync.Queue('user-preferences-queue', {
  maxRetentionTime: 30 * 24 * 60 * 60, // 30 days
  onSync: async ({ queue }) => {
    console.log('[Background Sync] Processing user preferences queue');
    const entries = await queue.getAll();
    for (const entry of entries) {
      try {
        const response = await fetch(entry.request, {
          method: 'PUT',
          body: entry.request.body,
          headers: {
            'Content-Type': 'application/json',
            ...entry.request.headers
          }
        });
        
        if (response.ok) {
          await queue.delete(entry.request);
          console.log('[Background Sync] User preferences synced:', entry.request.url);
          
          // Notify clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              data: { type: 'user-preferences', url: entry.request.url }
            });
          });
        } else {
          console.warn('[Background Sync] Failed to sync user preferences:', response.status);
        }
      } catch (error) {
        console.error('[Background Sync] Error syncing user preferences:', error);
      }
    }
  }
});

// Network-only strategies with background sync for API endpoints
workbox.routing.registerRoute(
  /\/api\/progress/,
  async ({ request }) => {
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      // Queue the request for background sync
      const clonedRequest = request.clone();
      await progressQueue.pushRequest({ request: clonedRequest });
      console.log('[Background Sync] Progress request queued for sync:', request.url);
      
      // Return a cached response or fallback
      return new Response(
        JSON.stringify({
          status: 'queued',
          message: 'Progress update will be synced when online'
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
);

workbox.routing.registerRoute(
  /\/api\/vocabulary\/progress/,
  async ({ request }) => {
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      // Queue the request for background sync
      const clonedRequest = request.clone();
      await vocabularyProgressQueue.pushRequest({ request: clonedRequest });
      console.log('[Background Sync] Vocabulary progress request queued for sync:', request.url);
      
      // Return a cached response or fallback
      return new Response(
        JSON.stringify({
          status: 'queued',
          message: 'Vocabulary progress will be synced when online'
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
);

workbox.routing.registerRoute(
  /\/api\/user\/preferences/,
  async ({ request }) => {
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      // Queue the request for background sync
      const clonedRequest = request.clone();
      await userPreferencesQueue.pushRequest({ request: clonedRequest });
      console.log('[Background Sync] User preferences request queued for sync:', request.url);
      
      // Return a cached response or fallback
      return new Response(
        JSON.stringify({
          status: 'queued',
          message: 'User preferences will be synced when online'
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
);

// Custom message handling for backward compatibility
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('[Workbox SW] Received skip waiting message');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({
        version: 'bgde-app-workbox',
        dataVersion: 'bgde-data-workbox'
      });
      break;
      
    case 'CLEAR_CACHE':
      console.log('[Workbox SW] Clearing all caches...');
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0]?.postMessage({ success: true });
      }).catch((error) => {
        event.ports[0]?.postMessage({ success: false, error: error.message });
      });
      break;
      
    case 'PREFETCH_VOCABULARY':
      if (data && data.items) {
        prefetchVocabularyItems(data.items);
      }
      break;
      
    case 'PRECACHE_URLS':
      if (data && Array.isArray(data.urls) && data.urls.length) {
        event.waitUntil(precacheRuntimeAssets(data.urls));
      }
      break;
      
    case 'SYNC_NOW':
      // Trigger immediate sync for all queues
      event.waitUntil(
        (async () => {
          try {
            await Promise.all([
              progressQueue.sync(),
              vocabularyProgressQueue.sync(),
              userPreferencesQueue.sync()
            ]);
            event.ports[0]?.postMessage({ success: true, message: 'Sync triggered' });
          } catch (error) {
            event.ports[0]?.postMessage({ success: false, error: error.message });
          }
        })()
      );
      break;
      
    case 'GET_SYNC_STATUS':
      // Get status of all sync queues
      event.waitUntil(
        (async () => {
          try {
            const status = {
              progress: await progressQueue.getAll(),
              vocabularyProgress: await vocabularyProgressQueue.getAll(),
              userPreferences: await userPreferencesQueue.getAll()
            };
            event.ports[0]?.postMessage({ success: true, status });
          } catch (error) {
            event.ports[0]?.postMessage({ success: false, error: error.message });
          }
        })()
      );
      break;
      
    default:
      console.log('[Workbox SW] Unknown message type:', type);
  }
});

// Prefetch vocabulary items for offline use
async function prefetchVocabularyItems(items) {
  const cache = await caches.open('data-cache');
  const prefetchPromises = [];
  
  items.forEach((item) => {
    // Prefetch audio files if available
    if (item.audio_url) {
      prefetchPromises.push(
        fetch(item.audio_url)
          .then((response) => {
            if (response.ok) {
              cache.put(item.audio_url, response.clone());
            }
          })
          .catch(() => {}) // Ignore prefetch errors
      );
    }
    
    // Prefetch individual vocabulary pages
    const vocabUrl = `/vocabulary/${item.id}/`;
    prefetchPromises.push(
      fetch(vocabUrl)
        .then((response) => {
          if (response.ok) {
            cache.put(vocabUrl, response.clone());
          }
        })
        .catch(() => {}) // Ignore prefetch errors
    );
  });
  
  // Limit concurrent prefetch requests
  const batchSize = 5;
  for (let i = 0; i < prefetchPromises.length; i += batchSize) {
    const batch = prefetchPromises.slice(i, i + batchSize);
    await Promise.allSettled(batch);
    
    // Small delay between batches to avoid overwhelming the network
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('[Workbox SW] Prefetch completed for', items.length, 'vocabulary items');
}

// Precache runtime assets
async function precacheRuntimeAssets(urls) {
  const cache = await caches.open('html-pages');
  const precachePromises = urls.map(url => 
    fetch(url)
      .then(response => {
        if (response.ok) {
          cache.put(url, response.clone());
        }
      })
      .catch(() => {}) // Ignore errors
  );
  
  await Promise.allSettled(precachePromises);
  console.log('[Workbox SW] Runtime precache completed for', urls.length, 'URLs');
}

// Enhanced activation with custom notifications
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const cachePromises = cacheNames.map((cacheName) => {
        if (!cacheName.startsWith('bgde-app-')) {
          console.log('[Workbox SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      });
      
      await Promise.all(cachePromises);
      
      // Claim clients
      await self.clients.claim();
      
      // Notify all clients about the update
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: 'bgde-app-workbox'
        });
      });
      
      console.log('[Workbox SW] Enhanced activation completed');
    })()
  );
});

// Background sync event listener
self.addEventListener('sync', (event) => {
  console.log('[Workbox SW] Background sync event triggered:', event.tag);
  
  // Handle different sync tags
  switch (event.tag) {
    case 'background-sync':
    case 'progress-sync':
      event.waitUntil(progressQueue.sync());
      break;
    case 'vocabulary-progress-sync':
      event.waitUntil(vocabularyProgressQueue.sync());
      break;
    case 'user-preferences-sync':
      event.waitUntil(userPreferencesQueue.sync());
      break;
    default:
      console.log('[Workbox SW] Unknown sync tag:', event.tag);
  }
});

// Periodic sync for background data (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('[Workbox SW] Periodic sync triggered:', event.tag);
    
    if (event.tag === 'periodic-background-sync') {
      event.waitUntil(
        (async () => {
          try {
            await Promise.all([
              progressQueue.sync(),
              vocabularyProgressQueue.sync(),
              userPreferencesQueue.sync()
            ]);
            console.log('[Workbox SW] Periodic sync completed successfully');
          } catch (error) {
            console.error('[Workbox SW] Periodic sync failed:', error);
          }
        })()
      );
    }
  });
}

console.log('[Workbox SW] Service worker loaded successfully');