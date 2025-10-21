// Service Worker for Bulgarian-German Learning App
// Provides offline functionality and performance optimization

const CACHE_NAME = 'bgde-app-v1.3.0';
const DATA_CACHE_NAME = 'bgde-data-v1.0.0';

// Critical assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/offline/',
  '/vocabulary/',
  '/grammar/',
  '/practice/',
  '/manifest.webmanifest'
];

// Data endpoints to cache with different strategy
const DATA_URLS = [
  '/search-index.json',
  '/data/vocabulary.json',
  '/data/grammar.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_CACHE_URLS.map(url => new Request(url, {
          cache: 'reload' // Ensure fresh content during install
        })));
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service worker activated and ready');
      
      // Notify all clients about the update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_NAME
          });
        });
      });
    })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except for known CDNs)
  if (url.origin !== location.origin && !isTrustedOrigin(url.origin)) {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (isDataRequest(request.url)) {
    event.respondWith(handleDataRequest(request));
  } else if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Handle data requests (JSON files) with stale-while-revalidate
async function handleDataRequest(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch fresh data
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        // Clone and cache the fresh response
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.warn('[SW] Failed to fetch data:', request.url, error);
      return null;
    });
  
  // Return cached version immediately if available, otherwise wait for network
  if (cachedResponse) {
    // Update cache in background
    fetchPromise.catch(() => {}); // Ignore errors for background update
    return cachedResponse;
  } else {
    const networkResponse = await fetchPromise;
    return networkResponse || createOfflineResponse('Data temporarily unavailable');
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Failed to fetch static asset:', request.url, error);
    
    // Return offline fallback for critical assets
    if (request.url.includes('.css')) {
      return new Response('/* Offline - CSS unavailable */', {
        headers: { 'Content-Type': 'text/css' }
      });
    } else if (request.url.includes('.js')) {
      return new Response('// Offline - JS unavailable', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    return new Response('Asset unavailable offline', { status: 503 });
  }
}

// Handle page requests with network-first, fallback to cache, then offline page
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful page responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network failed for page:', request.url, error);
    
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    const offlinePage = await cache.match('/offline/');
    return offlinePage || createOfflineResponse('Page unavailable offline');
  }
}

// Handle generic requests with network-first strategy
async function handleGenericRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses for future use
    if (networkResponse.ok && request.url.startsWith(location.origin)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network failed for request:', request.url, error);
    
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    return cachedResponse || new Response('Resource unavailable offline', { status: 503 });
  }
}

// Utility functions
function isDataRequest(url) {
  return DATA_URLS.some(dataUrl => url.includes(dataUrl)) || 
         url.includes('.json') || 
         url.includes('/api/');
}

function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf', '.eot', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
  return staticExtensions.some(ext => url.includes(ext)) || url.includes('/static/');
}

function isPageRequest(request) {
  const acceptHeader = request.headers.get('Accept') || '';
  return acceptHeader.includes('text/html');
}

function isTrustedOrigin(origin) {
  const trustedOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ];
  return trustedOrigins.includes(origin);
}

function createOfflineResponse(message) {
  return new Response(JSON.stringify({
    error: 'Offline',
    message: message,
    timestamp: new Date().toISOString()
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Received skip waiting message');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        version: CACHE_NAME,
        dataVersion: DATA_CACHE_NAME
      });
      break;
      
    case 'CLEAR_CACHE':
      console.log('[SW] Clearing caches...');
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch((error) => {
        event.ports[0].postMessage({ success: false, error: error.message });
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
      console.log('[SW] Unknown message type:', type);
  }
});

// Prefetch vocabulary items for offline use
async function prefetchVocabularyItems(items) {
  const cache = await caches.open(DATA_CACHE_NAME);
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
  
  console.log('[SW] Prefetch completed for', items.length, 'vocabulary items');
}

// Periodic cache cleanup (runs when SW is idle)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(performCacheCleanup());
  }
});

async function performCacheCleanup() {
  const cache = await caches.open(DATA_CACHE_NAME);
  const requests = await cache.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (now - responseDate > maxAge) {
          await cache.delete(request);
          console.log('[SW] Cleaned up old cache entry:', request.url);
        }
      }
    }
  }
}
