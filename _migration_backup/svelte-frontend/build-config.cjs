/**
 * Build configuration for switching between Hugo and SvelteKit outputs
 * This allows maintaining both build systems during migration
 */

const path = require('path');
const fs = require('fs');

// Build configuration
const buildConfig = {
  // Current build target: 'hugo' | 'sveltekit'
  target: process.env.BUILD_TARGET || 'hugo',
  
  // GitHub Pages configuration
  githubPages: {
    repository: 'BulgarianApp-Fresh',
    basePaths: {
      hugo: '/BulgarianApp-Fresh/',
      sveltekit: '/BulgarianApp-Fresh/svelte/'
    }
  },
  
  // Build directories
  directories: {
    hugo: {
      source: './',
      output: './public'
    },
    sveltekit: {
      source: './svelte-frontend',
      output: './svelte-frontend/build'
    }
  },
  
  // Migration status
  migration: {
    completed: [
      'typescript-interfaces',
      'vocabulary-api',
      'sveltekit-setup',
      'adapter-static',
      'mdsvex-config'
    ],
    pending: [
      'flashcard-components',
      'spaced-repetition-migration',
      'content-migration',
      'testing-setup',
      'documentation'
    ]
  }
};

/**
 * Get current build target
 */
function getBuildTarget() {
  return buildConfig.target;
}

/**
 * Set build target
 */
function setBuildTarget(target) {
  if (!['hugo', 'sveltekit'].includes(target)) {
    throw new Error(`Invalid build target: ${target}. Must be 'hugo' or 'sveltekit'`);
  }
  buildConfig.target = target;
  
  // Update environment variable
  process.env.BUILD_TARGET = target;
  
  // Update flag file to keep it in sync
  const flagPath = path.join(process.cwd(), '.build-target');
  fs.writeFileSync(flagPath, target);
  
  console.log(`Build target set to: ${target}`);
}

/**
 * Get base path for current build target
 */
function getBasePath() {
  const target = getBuildTarget();
  return buildConfig.githubPages.basePaths[target];
}

/**
 * Get output directory for current build target
 */
function getOutputDirectory() {
  const target = getBuildTarget();
  return buildConfig.directories[target].output;
}

/**
 * Check if migration is complete
 */
function isMigrationComplete() {
  return buildConfig.migration.pending.length === 0;
}

/**
 * Get migration status
 */
function getMigrationStatus() {
  return {
    completed: buildConfig.migration.completed,
    pending: buildConfig.migration.pending,
    progress: (buildConfig.migration.completed.length / 
              (buildConfig.migration.completed.length + buildConfig.migration.pending.length)) * 100
  };
}

/**
 * Update package.json scripts for current target
 */
function updatePackageScripts() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const target = getBuildTarget();
  
  if (target === 'sveltekit') {
    // Update scripts for SvelteKit
    packageJson.scripts = {
      ...packageJson.scripts,
      'build': 'npm run build:sveltekit',
      'build:hugo': 'hugo --minify',
      'build:sveltekit': 'cd svelte-frontend && npm run build',
      'dev': 'npm run dev:sveltekit',
      'dev:hugo': 'hugo server -D',
      'dev:sveltekit': 'cd svelte-frontend && npm run dev',
      'preview': 'npm run preview:sveltekit',
      'preview:hugo': 'hugo server -D --renderToDisk',
      'preview:sveltekit': 'cd svelte-frontend && npm run preview'
    };
  } else {
    // Update scripts for Hugo
    packageJson.scripts = {
      ...packageJson.scripts,
      'build': 'npm run build:hugo',
      'build:hugo': 'hugo --minify',
      'build:sveltekit': 'cd svelte-frontend && npm run build',
      'dev': 'npm run dev:hugo',
      'dev:hugo': 'hugo server -D',
      'dev:sveltekit': 'cd svelte-frontend && npm run dev',
      'preview': 'npm run preview:hugo',
      'preview:hugo': 'hugo server -D --renderToDisk',
      'preview:sveltekit': 'cd svelte-frontend && npm run preview'
    };
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Package scripts updated for ${target} target`);
}

/**
 * Create build flag file
 */
function createBuildFlag() {
  const flagPath = path.join(process.cwd(), '.build-target');
  fs.writeFileSync(flagPath, getBuildTarget());
  console.log(`Build flag created: ${getBuildTarget()}`);
}

/**
 * Read build flag
 */
function readBuildFlag() {
  const flagPath = path.join(process.cwd(), '.build-target');
  if (fs.existsSync(flagPath)) {
    return fs.readFileSync(flagPath, 'utf8').trim();
  }
  return 'hugo'; // Default to Hugo
}

/**
 * Get current build target (alias for readBuildFlag)
 */
function getCurrentBuildTarget() {
  return readBuildFlag();
}

/**
 * Get build configuration object with CI environment info
 */
function getBuildConfig() {
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  const platform = process.env.GITHUB_ACTIONS ? 'github-actions' : 
                   process.env.CI ? 'generic-ci' : 'local';
  
  return {
    ...buildConfig,
    ci: isCI,
    isProduction,
    platform,
    buildTarget: getBuildTarget(),
    environment: {
      CI: process.env.CI,
      GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
      GITHUB_REF: process.env.GITHUB_REF,
      GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
      GITHUB_SHA: process.env.GITHUB_SHA,
      GITHUB_REF_NAME: process.env.GITHUB_REF_NAME,
      NODE_ENV: process.env.NODE_ENV
    }
  };
}

// Initialize build configuration
if (process.env.BUILD_TARGET) {
  setBuildTarget(process.env.BUILD_TARGET);
} else {
  // Try to read from flag file
  try {
    const flagTarget = readBuildFlag();
    setBuildTarget(flagTarget);
  } catch (error) {
    console.log('No build flag found, defaulting to Hugo');
    setBuildTarget('hugo');
  }
}

module.exports = {
  getBuildTarget,
  setBuildTarget,
  getBasePath,
  getOutputDirectory,
  isMigrationComplete,
  getMigrationStatus,
  updatePackageScripts,
  createBuildFlag,
  readBuildFlag,
  getCurrentBuildTarget,
  getBuildConfig,
  buildConfig
};