// Workbox-powered Service Worker for Bulgarian-German Learning App
// Provides enhanced caching strategies and offline functionality

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js');

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

// Background sync for offline data (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[Workbox SW] Background sync triggered');
    // Future: sync user progress when back online
  }
});

console.log('[Workbox SW] Service worker loaded successfully');