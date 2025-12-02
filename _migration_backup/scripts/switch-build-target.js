#!/usr/bin/env node

/**
 * Script to switch between Hugo and SvelteKit build targets
 * Usage: node scripts/switch-build-target.js [hugo|sveltekit]
 */

const path = require('node:path');
const { setBuildTarget, updatePackageScripts, createBuildFlag } = require('../svelte-frontend/build-config.cjs');

const target = process.argv[2];

if (!target) {
  console.error('Usage: node scripts/switch-build-target.js [hugo|sveltekit]');
  process.exit(1);
}

try {
  // Set the build target
  setBuildTarget(target);
  
  // Update package.json scripts
  updatePackageScripts();
  
  // Create build flag file
  createBuildFlag();
  
  console.log(`\n✅ Successfully switched to ${target} build target`);
  console.log('\nNext steps:');
  console.log(`- Run 'npm run build' to build with ${target}`);
  console.log(`- Run 'npm run dev' to develop with ${target}`);
  
} catch (error) {
  console.error('❌ Failed to switch build target:', error.message);
  process.exit(1);
}