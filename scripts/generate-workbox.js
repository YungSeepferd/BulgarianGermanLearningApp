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
    
    // Verify background sync functionality
    await verifyBackgroundSync();
    
  } catch (error) {
    console.error('❌ Failed to generate Workbox service worker:', error);
    process.exit(1);
  }
}

async function enhanceServiceWorker() {
  const swPath = path.join(process.cwd(), 'static/sw.js');
  const customSwPath = path.join(process.cwd(), 'static/sw-workbox.js');
  
  if (!fs.existsSync(swPath)) {
    console.error('❌ Generated service worker file not found:', swPath);
    return;
  }
  
  if (!fs.existsSync(customSwPath)) {
    console.error('❌ Custom service worker template not found:', customSwPath);
    return;
  }
  
  // Read the generated Workbox service worker
  const generatedSwContent = fs.readFileSync(swPath, 'utf8');
  
  // Read our custom service worker template
  const customSwContent = fs.readFileSync(customSwPath, 'utf8');
  
  // Extract the precache manifest from the generated service worker
  const precacheMatch = generatedSwContent.match(/e\.precacheAndRoute\((\[.*?])\)/);
  let precacheManifest = '[]';
  
  if (precacheMatch) {
    precacheManifest = precacheMatch[1];
    console.log(`📦 Extracted precache manifest with ${precacheManifest.split(',').length} entries`);
  }
  
  // Create the final service worker by combining custom template with generated manifest
  let finalSwContent = customSwContent;
  
  // Replace the placeholder precache manifest with the actual one
  finalSwContent = finalSwContent.replace(
    /workbox(?:\.precache){2}AndRoute\(\[\s*\/{2}.*\s*]\)/,
    `workbox.precaching.precacheAndRoute(${precacheManifest})`
  );
  
  // Write the final service worker
  fs.writeFileSync(swPath, finalSwContent, 'utf8');
  console.log('✅ Enhanced service worker with background sync functionality');
}

async function verifyBackgroundSync() {
  const swPath = path.join(process.cwd(), 'static/sw.js');
  
  if (!fs.existsSync(swPath)) {
    console.error('❌ Service worker file not found for verification');
    return;
  }
  
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  // Check if background sync is properly imported
  if (swContent.includes('workbox-background-sync.prod.js')) {
    console.log('✅ Background sync module imported');
  } else {
    console.warn('⚠️  Background sync module not imported');
  }
  
  // Check if background sync queues are created
  if (swContent.includes('new workbox.backgroundSync.Queue')) {
    console.log('✅ Background sync queues created');
  } else {
    console.warn('⚠️  Background sync queues not found');
  }
  
  // Check if sync event listeners are present
  if (swContent.includes("addEventListener('sync'")) {
    console.log('✅ Sync event listeners present');
  } else {
    console.warn('⚠️  Sync event listeners not found');
  }
  
  // Check if API routes are registered with background sync
  const apiRoutes = ['/api/progress', '/api/vocabulary/progress', '/api/user/preferences'];
  let apiRoutesRegistered = 0;
  
  for (const route of apiRoutes) {
    if (swContent.includes(route)) {
      apiRoutesRegistered++;
    }
  }
  
  if (apiRoutesRegistered === apiRoutes.length) {
    console.log('✅ All API routes registered with background sync');
  } else {
    console.warn(`⚠️  Only ${apiRoutesRegistered}/${apiRoutes.length} API routes registered`);
  }
  
  console.log('✅ Background sync verification completed');
}

// Run the generator
generateWorkboxServiceWorker().catch(console.error);