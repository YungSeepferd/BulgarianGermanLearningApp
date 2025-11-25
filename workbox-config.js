// Workbox configuration for Bulgarian-German Learning App
// Generates service worker with optimized caching strategies

module.exports = {
  // Glob patterns to precache during service worker installation
  globDirectory: 'static/',
  globPatterns: [
    '**/*.{html,css,js,json,webmanifest,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'
  ],
  
  // Additional files to precache that might not be matched by glob patterns
  globIgnores: [
    '**/sw.js', // Don't precache the service worker itself
    'sw.js',
    'workbox-*.js'
  ],
  
  // Maximum file size to precache (in bytes)
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  
  // Service worker file output
  swDest: 'static/sw.js',
  
  // Cache ID for versioning
  cacheId: 'bgde-app-workbox',
  
  // Skip waiting for activation
  skipWaiting: true,
  
  // Claim clients immediately
  clientsClaim: true,
  
  // Runtime caching strategies
  runtimeCaching: [
    // Network-first for HTML pages (always try network first, fallback to cache)
    {
      urlPattern: /\.html$/,
      handler: 'NetworkFirst',
      options: {
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
      }
    },
    
    // Cache-first for static assets (CSS, JS, images, fonts)
    {
      urlPattern: /\.(?:css|js|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
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
          }
        ]
      }
    },
    
    // Stale-while-revalidate for JSON data (vocabulary, grammar, search index)
    {
      urlPattern: /\.json$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'data-cache',
        plugins: [
          {
            cacheWillUpdate: async ({ request, response, event, state }) => {
              // Only cache successful responses
              return response && response.status === 200 ? response : null;
            }
          }
        ]
      }
    },
    
    // Network-first for API requests (if any future API endpoints are added)
    {
      urlPattern: /\/api\//,
      handler: 'NetworkFirst',
      options: {
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
      }
    },
    
    // Cache Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    
    // Cache CDN assets (jsDelivr, etc.)
    {
      urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cdn-assets',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    }
  ],
  
  // Navigation preload (improves performance for navigation requests)
  navigationPreload: true,
  
  // Ignore URL parameters for certain file types
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid$/,
    /^gclid$/,
    /^msclkid$/
  ],
  
  // Don't cache these file types
  dontCacheBustURLsMatching: /\.\w{8}\./, // Files with 8-character hashes
  
  // Source map configuration
  sourcemap: false, // Don't include source maps in service worker
  
  // Mode configuration
  mode: 'production'
};