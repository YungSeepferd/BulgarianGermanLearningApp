import { defineConfig, devices } from '@playwright/experimental-ct-svelte';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

/**
 * Playwright Component Testing Configuration for Svelte 5
 * @file playwright-ct.config.ts
 * @description Configuration for testing Svelte 5 components with Playwright
 * @version 2.0.0
 * @updated December 2025
 */

export default defineConfig({
  // Test directory for component tests
  testDir: './tests/components',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: './playwright-ct-report' }],
    ['json', { outputFile: './test-results/ct-results.json' }],
    ['junit', { outputFile: './test-results/ct-junit.xml' }],
    ['list'],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Global timeout for each action
    actionTimeout: 10000,
    
    // Global timeout for navigation
    navigationTimeout: 30000,
    
    // Svelte 5 specific configuration
    ctViteConfig: {
      plugins: [
        svelte({
          compilerOptions: {
            runes: true, // Enable Svelte 5 runes
            dev: true,
          },
        }),
      ],
      resolve: {
        alias: {
          $lib: resolve('./src/lib'),
          $app: resolve('./src/app'),
        },
      },
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global setup and teardown
  // globalSetup: './tests/ct-global-setup.ts',
  
  // Test timeout
  timeout: 30000,
  
  // Expect timeout
  expect: {
    timeout: 5000,
  },
});