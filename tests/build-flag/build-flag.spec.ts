/**
 * Build Flag Integration Tests
 * Tests the build flag switching system between Hugo and SvelteKit
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
  // Dynamic import for CommonJS module
  buildConfig = require(buildConfigPath);
} catch (error) {
  console.error('Failed to load build config:', error);
  throw new Error('Build configuration module not found');
}

describe('Build Flag System', () => {
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

  describe('Build Target Management', () => {
    test('should default to Hugo when no flag is set', () => {
      const target = buildConfig.getBuildTarget();
      expect(target).toBe('hugo');
    });

    test('should set build target to Hugo', () => {
      buildConfig.setBuildTarget('hugo');
      expect(buildConfig.getBuildTarget()).toBe('hugo');
      expect(process.env.BUILD_TARGET).toBe('hugo');
    });

    test('should set build target to SvelteKit', () => {
      buildConfig.setBuildTarget('sveltekit');
      expect(buildConfig.getBuildTarget()).toBe('sveltekit');
      expect(process.env.BUILD_TARGET).toBe('sveltekit');
    });

    test('should throw error for invalid build target', () => {
      expect(() => {
        buildConfig.setBuildTarget('invalid');
      }).toThrow('Invalid build target: invalid. Must be \'hugo\' or \'sveltekit\'');
    });

    test('should read build target from environment variable', () => {
      process.env.BUILD_TARGET = 'sveltekit';
      const target = buildConfig.getBuildTarget();
      expect(target).toBe('sveltekit');
    });
  });

  describe('Build Flag File Operations', () => {
    test('should create build flag file', () => {
      buildConfig.setBuildTarget('sveltekit');
      buildConfig.createBuildFlag();
      
      expect(existsSync(flagPath)).toBe(true);
      const flagContent = readFileSync(flagPath, 'utf8').trim();
      expect(flagContent).toBe('sveltekit');
    });

    test('should read build flag from file', () => {
      writeFileSync(flagPath, 'sveltekit');
      const target = buildConfig.readBuildFlag();
      expect(target).toBe('sveltekit');
    });

    test('should default to Hugo when flag file does not exist', () => {
      const target = buildConfig.readBuildFlag();
      expect(target).toBe('hugo');
    });
  });

  describe('Base Path Configuration', () => {
    test('should return correct base path for Hugo', () => {
      buildConfig.setBuildTarget('hugo');
      const basePath = buildConfig.getBasePath();
      expect(basePath).toBe('/BulgarianApp-Fresh/');
    });

    test('should return correct base path for SvelteKit', () => {
      buildConfig.setBuildTarget('sveltekit');
      const basePath = buildConfig.getBasePath();
      expect(basePath).toBe('/BulgarianApp-Fresh/svelte/');
    });
  });

  describe('Output Directory Configuration', () => {
    test('should return correct output directory for Hugo', () => {
      buildConfig.setBuildTarget('hugo');
      const outputDir = buildConfig.getOutputDirectory();
      expect(outputDir).toBe('./public');
    });

    test('should return correct output directory for SvelteKit', () => {
      buildConfig.setBuildTarget('sveltekit');
      const outputDir = buildConfig.getOutputDirectory();
      expect(outputDir).toBe('./svelte-frontend/build');
    });
  });

  describe('Package Script Updates', () => {
    test('should update package scripts for Hugo target', () => {
      buildConfig.setBuildTarget('hugo');
      buildConfig.updatePackageScripts();
      
      const updatedPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      expect(updatedPackageJson.scripts.build).toBe('npm run build:hugo');
      expect(updatedPackageJson.scripts.dev).toBe('npm run dev:hugo');
      expect(updatedPackageJson.scripts.preview).toBe('npm run preview:hugo');
    });

    test('should update package scripts for SvelteKit target', () => {
      buildConfig.setBuildTarget('sveltekit');
      buildConfig.updatePackageScripts();
      
      const updatedPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      expect(updatedPackageJson.scripts.build).toBe('npm run build:sveltekit');
      expect(updatedPackageJson.scripts.dev).toBe('npm run dev:sveltekit');
      expect(updatedPackageJson.scripts.preview).toBe('npm run preview:sveltekit');
    });

    test('should preserve existing scripts when updating', () => {
      buildConfig.setBuildTarget('hugo');
      buildConfig.updatePackageScripts();
      
      const updatedPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      expect(updatedPackageJson.scripts['build:hugo']).toBeDefined();
      expect(updatedPackageJson.scripts['build:sveltekit']).toBeDefined();
      expect(updatedPackageJson.scripts['lint']).toBeDefined();
    });
  });

  describe('Migration Status', () => {
    test('should return migration status', () => {
      const status = buildConfig.getMigrationStatus();
      expect(status).toHaveProperty('completed');
      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('progress');
      expect(typeof status.progress).toBe('number');
    });

    test('should check if migration is complete', () => {
      const isComplete = buildConfig.isMigrationComplete();
      expect(typeof isComplete).toBe('boolean');
    });
  });

  describe('Build Configuration Object', () => {
    test('should export build configuration', () => {
      const config = buildConfig.buildConfig;
      expect(config).toHaveProperty('target');
      expect(config).toHaveProperty('githubPages');
      expect(config).toHaveProperty('directories');
      expect(config).toHaveProperty('migration');
    });

    test('should have correct GitHub Pages configuration', () => {
      const config = buildConfig.buildConfig;
      expect(config.githubPages.repository).toBe('BulgarianApp-Fresh');
      expect(config.githubPages.basePaths.hugo).toBe('/BulgarianApp-Fresh/');
      expect(config.githubPages.basePaths.sveltekit).toBe('/BulgarianApp-Fresh/svelte/');
    });

    test('should have correct directory configuration', () => {
      const config = buildConfig.buildConfig;
      expect(config.directories.hugo.source).toBe('./');
      expect(config.directories.hugo.output).toBe('./public');
      expect(config.directories.sveltekit.source).toBe('./svelte-frontend');
      expect(config.directories.sveltekit.output).toBe('./svelte-frontend/build');
    });
  });
});

describe('Build Flag Switch Script', () => {
  const scriptPath = path.join(process.cwd(), 'scripts/switch-build-target.js');
  let originalPackageJson: any;

  beforeEach(() => {
    // Backup original package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      originalPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    }
  });

  afterEach(() => {
    // Restore original package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (originalPackageJson && existsSync(packageJsonPath)) {
      writeFileSync(packageJsonPath, JSON.stringify(originalPackageJson, null, 2));
    }
  });

  test('should switch to Hugo target', () => {
    expect(() => {
      execSync(`node "${scriptPath}" hugo`, { stdio: 'pipe' });
    }).not.toThrow();

    const flagPath = path.join(process.cwd(), '.build-target');
    expect(existsSync(flagPath)).toBe(true);
    
    const flagContent = readFileSync(flagPath, 'utf8').trim();
    expect(flagContent).toBe('hugo');
  });

  test('should switch to SvelteKit target', () => {
    expect(() => {
      execSync(`node "${scriptPath}" sveltekit`, { stdio: 'pipe' });
    }).not.toThrow();

    const flagPath = path.join(process.cwd(), '.build-target');
    expect(existsSync(flagPath)).toBe(true);
    
    const flagContent = readFileSync(flagPath, 'utf8').trim();
    expect(flagContent).toBe('sveltekit');
  });

  test('should throw error for invalid target', () => {
    expect(() => {
      execSync(`node "${scriptPath}" invalid`, { stdio: 'pipe' });
    }).toThrow();
  });

  test('should show usage when no target provided', () => {
    expect(() => {
      execSync(`node "${scriptPath}"`, { stdio: 'pipe' });
    }).toThrow();
  });
});

describe('Build Flag Integration with Build Process', () => {
  const flagPath = path.join(process.cwd(), '.build-target');

  beforeEach(() => {
    // Clean up any existing build flag
    if (existsSync(flagPath)) {
      unlinkSync(flagPath);
    }
  });

  afterEach(() => {
    // Clean up build flag
    if (existsSync(flagPath)) {
      unlinkSync(flagPath);
    }
  });

  test('should build with Hugo when flag is set to hugo', () => {
    // Set build target to Hugo
    buildConfig.setBuildTarget('hugo');
    buildConfig.createBuildFlag();

    // Verify flag is set
    expect(existsSync(flagPath)).toBe(true);
    expect(readFileSync(flagPath, 'utf8').trim()).toBe('hugo');

    // Verify build configuration
    expect(buildConfig.getBuildTarget()).toBe('hugo');
    expect(buildConfig.getBasePath()).toBe('/BulgarianApp-Fresh/');
    expect(buildConfig.getOutputDirectory()).toBe('./public');
  });

  test('should build with SvelteKit when flag is set to sveltekit', () => {
    // Set build target to SvelteKit
    buildConfig.setBuildTarget('sveltekit');
    buildConfig.createBuildFlag();

    // Verify flag is set
    expect(existsSync(flagPath)).toBe(true);
    expect(readFileSync(flagPath, 'utf8').trim()).toBe('sveltekit');

    // Verify build configuration
    expect(buildConfig.getBuildTarget()).toBe('sveltekit');
    expect(buildConfig.getBasePath()).toBe('/BulgarianApp-Fresh/svelte/');
    expect(buildConfig.getOutputDirectory()).toBe('./svelte-frontend/build');
  });

  test('should handle environment variable override', () => {
    // Set environment variable
    process.env.BUILD_TARGET = 'sveltekit';

    // Verify build target from environment
    expect(buildConfig.getBuildTarget()).toBe('sveltekit');

    // Create flag with different value
    buildConfig.setBuildTarget('hugo');
    buildConfig.createBuildFlag();

    // Environment should still take precedence
    expect(buildConfig.getBuildTarget()).toBe('hugo');
    expect(process.env.BUILD_TARGET).toBe('hugo');
  });
});

describe('Build Flag Error Handling', () => {
  test('should handle missing build config gracefully', () => {
    // Temporarily rename build config file
    const configPath = path.join(process.cwd(), 'svelte-frontend/build-config.js');
    const tempPath = configPath + '.backup';
    
    if (existsSync(configPath)) {
      execSync(`mv "${configPath}" "${tempPath}"`, { stdio: 'pipe' });
    }

    try {
      // Try to require the build config
      expect(() => {
        // Clear require cache to force module not found error
        delete require.cache[require.resolve(configPath)];
        require(configPath);
      }).toThrow();
    } finally {
      // Restore the file
      if (existsSync(tempPath)) {
        execSync(`mv "${tempPath}" "${configPath}"`, { stdio: 'pipe' });
      }
    }
  });

  test('should handle corrupted build flag file', () => {
    const flagPath = path.join(process.cwd(), '.build-target');
    
    // Write corrupted flag file
    writeFileSync(flagPath, 'invalid\0content');
    
    // Should still read something (not throw)
    expect(() => {
      buildConfig.readBuildFlag();
    }).not.toThrow();
  });

  test('should handle missing package.json gracefully', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const tempPath = packageJsonPath + '.backup';
    
    if (existsSync(packageJsonPath)) {
      execSync(`mv "${packageJsonPath}" "${tempPath}"`, { stdio: 'pipe' });
    }

    try {
      expect(() => {
        buildConfig.updatePackageScripts();
      }).toThrow();
    } finally {
      // Restore the file
      if (existsSync(tempPath)) {
        execSync(`mv "${tempPath}" "${packageJsonPath}"`, { stdio: 'pipe' });
      }
    }
  });
});