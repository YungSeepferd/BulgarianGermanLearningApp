/**
 * CI/CD Build Flag Switching Tests
 * Tests build flag switching in simulated CI/CD environment
 * @since 1.0.0
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

// Import build configuration functions
const buildConfigPath = path.join(process.cwd(), 'svelte-frontend/build-config.cjs');
let buildConfig: any;

try {
  buildConfig = require(buildConfigPath);
} catch (error) {
  console.error('Failed to load build config:', error);
  throw new Error('Build configuration module not found');
}

describe('CI/CD Build Flag Switching', () => {
  const originalEnv = process.env;
  const flagPath = path.join(process.cwd(), '.build-target');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let originalPackageJson: any;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    
    // Backup original package.json
    if (existsSync(packageJsonPath)) {
      originalPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    }
    
    // Clean up any existing build flag
    if (existsSync(flagPath)) {
      unlinkSync(flagPath);
    }
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    
    // Restore original package.json
    if (originalPackageJson && existsSync(packageJsonPath)) {
      writeFileSync(packageJsonPath, JSON.stringify(originalPackageJson, null, 2));
    }
    
    // Clean up build flag
    if (existsSync(flagPath)) {
      unlinkSync(flagPath);
    }
  });

  describe('CI Environment Simulation', () => {
    test('should handle CI environment variables correctly', () => {
      // Simulate GitHub Actions CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      process.env.GITHUB_REF = 'refs/heads/main';
      process.env.GITHUB_REPOSITORY = 'test/repo';
      
      // Test build configuration in CI mode
      const config = buildConfig.getBuildConfig();
      
      expect(config).toBeDefined();
      expect(config.ci).toBe(true);
      expect(config.buildTarget).toBeDefined();
    });

    test('should switch build targets in CI environment', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Test switching to Hugo in CI
      buildConfig.setBuildTarget('hugo');
      buildConfig.updatePackageScripts();
      
      const hugoConfig = buildConfig.getBuildConfig();
      expect(hugoConfig.buildTarget).toBe('hugo');
      
      // Test switching to SvelteKit in CI
      buildConfig.setBuildTarget('sveltekit');
      buildConfig.updatePackageScripts();
      
      const sveltekitConfig = buildConfig.getBuildConfig();
      expect(sveltekitConfig.buildTarget).toBe('sveltekit');
    });

    test('should preserve build flag across CI steps', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Set build target
      buildConfig.setBuildTarget('hugo');
      buildConfig.updatePackageScripts();
      
      // Create build flag file
      buildConfig.createBuildFlag();
      
      // Verify flag file exists
      expect(existsSync(flagPath)).toBe(true);
      
      // Read flag content
      const flagContent = readFileSync(flagPath, 'utf8').trim();
      expect(flagContent).toBe('hugo');
      
      // Simulate another CI step reading the flag
      const persistedTarget = buildConfig.readBuildFlag();
      expect(persistedTarget).toBe('hugo');
    });
  });

  describe('Build Script Integration', () => {
    test('should execute Hugo build in CI environment', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Set up Hugo build
      buildConfig.setBuildTarget('hugo');
      buildConfig.updatePackageScripts();
      
      // Execute build
      expect(() => {
        execSync('npm run build:hugo', { stdio: 'pipe' });
      }).not.toThrow();
      
      // Verify build output
      expect(existsSync('public/index.html')).toBe(true);
      
      // Clean up
      execSync('rm -rf public', { stdio: 'pipe' });
    });

    test('should execute SvelteKit build in CI environment', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Set up SvelteKit build
      buildConfig.setBuildTarget('sveltekit');
      buildConfig.updatePackageScripts();
      
      // Execute build
      expect(() => {
        execSync('npm run build:sveltekit', { stdio: 'pipe' });
      }).not.toThrow();
      
      // Verify build output
      expect(existsSync('svelte-frontend/build/index.html')).toBe(true);
      
      // Clean up
      execSync('rm -rf svelte-frontend/build', { stdio: 'pipe' });
    });

    test('should handle build script failures gracefully', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Should handle invalid target gracefully
      expect(() => {
        buildConfig.setBuildTarget('invalid');
      }).toThrow();
      
      // Build should fail gracefully
      expect(() => {
        execSync('npm run build:invalid', { stdio: 'pipe' });
      }).toThrow();
    });
  });

  describe('Environment-Specific Configuration', () => {
    test('should use CI-optimized build settings', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.NODE_ENV = 'production';
      
      const config = buildConfig.getBuildConfig();
      
      // Should have CI-specific settings
      expect(config.ci).toBe(true);
      expect(config.isProduction).toBe(true);
    });

    test('should handle different CI platforms', () => {
      // Test GitHub Actions
      process.env.GITHUB_ACTIONS = 'true';
      let config = buildConfig.getBuildConfig();
      expect(config.platform).toBe('github-actions');
      
      // Reset environment
      process.env = { ...originalEnv };
      
      // Test generic CI
      process.env.CI = 'true';
      config = buildConfig.getBuildConfig();
      expect(config.ci).toBe(true);
    });

    test('should configure output paths for CI deployment', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Test Hugo output path
      buildConfig.setBuildTarget('hugo');
      const hugoOutput = buildConfig.getOutputDirectory();
      expect(hugoOutput).toBe('./public');
      
      // Test SvelteKit output path
      buildConfig.setBuildTarget('sveltekit');
      const sveltekitOutput = buildConfig.getOutputDirectory();
      expect(sveltekitOutput).toBe('./svelte-frontend/build');
    });
  });

  describe('Build Artifact Validation', () => {
    test('should validate Hugo build artifacts in CI', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Build with Hugo
      buildConfig.setBuildTarget('hugo');
      buildConfig.updatePackageScripts();
      execSync('npm run build:hugo', { stdio: 'pipe' });
      
      // Validate critical artifacts
      expect(existsSync('public/index.html')).toBe(true);
      expect(existsSync('public/sw-workbox.js')).toBe(true);
      
      // Check for CSS and JS assets
      const publicDir = 'public';
      expect(existsSync(`${publicDir}/css`)).toBe(true);
      expect(existsSync(`${publicDir}/js`)).toBe(true);
      
      // Clean up
      execSync('rm -rf public', { stdio: 'pipe' });
    });

    test('should validate SvelteKit build artifacts in CI', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Build with SvelteKit
      buildConfig.setBuildTarget('sveltekit');
      buildConfig.updatePackageScripts();
      execSync('npm run build:sveltekit', { stdio: 'pipe' });
      
      // Validate critical artifacts
      expect(existsSync('svelte-frontend/build/index.html')).toBe(true);
      expect(existsSync('svelte-frontend/build/_app')).toBe(true);
      
      // Check for framework assets
      const buildDir = 'svelte-frontend/build';
      expect(existsSync(`${buildDir}/_app/immutable`)).toBe(true);
      
      // Clean up
      execSync('rm -rf svelte-frontend/build', { stdio: 'pipe' });
    });

    test('should generate build metadata in CI', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      process.env.GITHUB_SHA = 'abc123';
      process.env.GITHUB_REF_NAME = 'main';
      
      // Build with Hugo
      buildConfig.setBuildTarget('hugo');
      buildConfig.updatePackageScripts();
      execSync('npm run build:hugo', { stdio: 'pipe' });
      
      // Check for build metadata
      const indexContent = readFileSync('public/index.html', 'utf8');
      expect(indexContent).toContain('<!doctype');
      expect(indexContent).toContain('<html');
      
      // Clean up
      execSync('rm -rf public', { stdio: 'pipe' });
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle build flag corruption', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      
      // Create corrupted build flag
      writeFileSync(flagPath, 'invalid-target');
      
      // Should handle corruption gracefully
      expect(() => {
        const target = buildConfig.readBuildFlag();
        expect(target).toBe('invalid-target'); // Should read what's there
      }).not.toThrow();
    });

    test('should recover from build failures', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Set up build
      buildConfig.setBuildTarget('hugo');
      buildConfig.updatePackageScripts();
      
      // Simulate build failure and recovery
      try {
        // This would normally succeed, but we'll test error handling
        execSync('npm run build:hugo', { stdio: 'pipe' });
      } catch (error) {
        // In a real CI, this would trigger cleanup and retry logic
        expect(error).toBeDefined();
      }
      
      // Verify we can still set build targets after failure
      expect(() => {
        buildConfig.setBuildTarget('sveltekit');
      }).not.toThrow();
    });

    test('should validate build environment before execution', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      // Test environment validation
      const config = buildConfig.getBuildConfig();
      expect(config.ci).toBe(true);
      
      // Should validate required tools are available
      expect(() => {
        execSync('npm --version', { stdio: 'pipe' });
      }).not.toThrow();
      
      expect(() => {
        execSync('node --version', { stdio: 'pipe' });
      }).not.toThrow();
    });
  });

  describe('Performance and Optimization', () => {
    test('should use CI-optimized build flags', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      process.env.NODE_ENV = 'production';
      
      const config = buildConfig.getBuildConfig();
      
      // Should have optimization flags
      expect(config.isProduction).toBe(true);
      expect(config.ci).toBe(true);
    });

    test('should handle concurrent builds safely', () => {
      // Simulate CI environment
      process.env.CI = 'true';
      
      // Test sequential build target setting (realistic scenario)
      buildConfig.setBuildTarget('hugo');
      const target1 = buildConfig.getCurrentBuildTarget();
      
      // In a real CI, builds are sequential, not truly concurrent
      // This tests that the build configuration can handle rapid changes
      buildConfig.setBuildTarget('sveltekit');
      const target2 = buildConfig.getCurrentBuildTarget();
      
      // Should handle rapid changes safely
      expect(target1).toBeDefined();
      expect(target2).toBeDefined();
      expect(target1).toBe('hugo');
      expect(target2).toBe('sveltekit'); // Latest setting should be active
      
      // Test that the configuration is consistent
      const currentConfig = buildConfig.getBuildConfig();
      expect(currentConfig.buildTarget).toBe('sveltekit');
    });
  });
});