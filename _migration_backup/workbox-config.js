/**
 * Workbox configuration for BulgarianGermanLearningApp PWA
 * Generates service worker with precaching and runtime caching strategies
 */

module.exports = {
  // Glob patterns to include in precache manifest
  globDirectory: 'public/',
  globPatterns: [
    '**/*.{html,css,js,json,png,jpg,jpeg,svg,gif,ico,webp,woff,woff2,ttf,eot}',
    'manifest.webmanifest'
  ],
  
  // Files to ignore in precache
  globIgnores: [
    '**/node_modules/**',
    '**/tests/**',
    '**/coverage/**',
    '**/docs/**',
    '**/scripts/**',
    '**/web/**',
    '**/workbox-*.js'
  ],
  
  // Additional files to precache (not matched by glob patterns)
  additionalManifestEntries: [
    {
      url: '/offline.html',
      revision: 'offline-v1'
    }
  ],
  
  // Cache ID for versioning
  cacheId: 'bgde-learn-app',
  
  // Maximum cache size (in MB)
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  
  // Service worker destination
  swDest: 'public/sw.js',
  
  // Skip waiting and claim clients immediately
  skipWaiting: true,
  clientsClaim: true,
  
  // Runtime caching strategies
  runtimeCaching: [
    {
      // Google Fonts - network first strategy
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        },
        networkTimeoutSeconds: 3
      }
    },
    {
      // API requests - network first with fallback
      urlPattern: /\.json$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-data',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 // 1 day
        },
        networkTimeoutSeconds: 3
      }
    },
    {
      // Images - cache first strategy
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    {
      // CSS and JS - stale while revalidate
      urlPattern: /\.(?:css|js)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    }
  ],
  
  // Navigation fallback for SPA-like behavior
  navigateFallback: '/offline.html',
  navigateFallbackAllowlist: [/^(?!\/__)/], // Allow all except __ paths
  
  // Source maps for debugging
  sourcemap: false,
  
  // Mode (development or production)
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
};