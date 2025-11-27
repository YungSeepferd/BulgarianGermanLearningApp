/**
 * Playwright Component Testing Configuration for SvelteKit
 * @file playwright-ct.config.ts
 * @description Playwright configuration for testing SvelteKit components
 * @version 1.0.0
 * @updated November 2025
 */

import { defineConfig, devices } from '@playwright/experimental-ct-core';

export default defineConfig({
  // Test directory for component tests
  testDir: './tests',
  
  // Component testing specific settings
  use: {
    // Base URL for component testing
    baseURL: 'http://localhost:4173',
    
    // Component testing specific options
    ctPort: 3100,
    ctTemplateDir: './playwright',
    ctViteConfig: {
      // Use the dedicated component testing Vite config
      configFile: './vite.component-test.config.ts',
    },
    
    // Trace collection for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Web server for component testing
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});