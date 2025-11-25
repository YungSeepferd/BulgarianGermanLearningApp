#!/usr/bin/env node

/**
 * Workbox Service Worker Generator
 * Generates a Workbox-powered service worker for the Bulgarian-German Learning App
 */

const { generateSW } = require('workbox-build');
const fs = require('node:fs');
const path = require('node:path');

async function generateWorkboxServiceWorker() {
  console.log('🔧 Generating Workbox service worker...');
  
  try {
    // Check if static directory exists
    const staticDir = path.join(process.cwd(), 'static');
    if (!fs.existsSync(staticDir)) {
      console.error('❌ Static directory not found.');
      process.exit(1);
    }
    
    // Generate the service worker using Workbox
    const { count, size, warnings } = await generateSW({
      // Use the configuration from workbox-config.js
      ...require('../workbox-config.js'),
      
      // Additional configuration for better integration
      manifestTransforms: [
        // Transform manifest entries to work with Hugo's asset fingerprinting
        (manifestEntries) => {
          const manifest = manifestEntries.map(entry => {
            // Handle Hugo's fingerprinted assets
            if (/\.\w{8}\./.test(entry.url)) {
              // Remove revision parameter for fingerprinted files
              return { ...entry, revision: null };
            }
            return entry;
          });
          
          console.log(`📦 Precaching ${manifest.length} files`);
          return { manifest, warnings: [] };
        }
      ]
    });
    
    // Log results
    console.log('✅ Workbox service worker generated successfully!');
    console.log(`📊 Precached ${count} files, total size: ${(size / 1024 / 1024).toFixed(2)} MB`);
    
    if (warnings.length > 0) {
      console.warn('⚠️  Warnings:');
      for (const warning of warnings) {
        console.warn(`   ${warning}`);
      }
    }
    
    // Add custom logic to the generated service worker
    await enhanceServiceWorker();
    
  } catch (error) {
    console.error('❌ Failed to generate Workbox service worker:', error);
    process.exit(1);
  }
}

async function enhanceServiceWorker() {
  const swPath = path.join(process.cwd(), 'static/sw.js');
  
  if (!fs.existsSync(swPath)) {
    console.error('❌ Service worker file not found:', swPath);
    return;
  }
  
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Add custom message handling for backward compatibility
  const customMessageHandling = `
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
    const vocabUrl = \`/vocabulary/\${item.id}/\`;
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
const originalActivate = self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Call original activation logic
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
`;

  // Find the position to inject custom code (after Workbox's main logic)
  const injectionPoint = swContent.lastIndexOf('workbox.precaching.precacheAndRoute');
  
  if (injectionPoint === -1) {
    console.warn('⚠️  Could not find injection point for custom code');
  } else {
    // Find the next line after the precache call
    const nextLineIndex = swContent.indexOf('\n', injectionPoint) + 1;
    
    // Inject custom code
    swContent = swContent.slice(0, nextLineIndex) + customMessageHandling + swContent.slice(nextLineIndex);
    
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log('✅ Enhanced service worker with custom functionality');
  }
}

// Run the generator
generateWorkboxServiceWorker().catch(console.error);