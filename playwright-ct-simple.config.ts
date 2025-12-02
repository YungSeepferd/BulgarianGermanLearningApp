/**
 * Simple Playwright Component Testing Configuration for Svelte Components
 * @file playwright-ct-simple.config.ts
 * @description Simplified configuration for testing individual Svelte components
 * @version 1.0.0
 * @updated November 2025
 */

import { defineConfig, devices } from '@playwright/experimental-ct-svelte';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // Test directory for component tests
  testDir: './tests',
  
  // Component testing specific settings
  use: {
    // Base URL for component testing
    baseURL: 'http://localhost:4173',
    
    // Component testing specific options
    ctPort: 3100,
    
    // Use the dedicated Vite config for component testing
    ctViteConfig: './vite.component-test.config.ts',
    
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
  ],

  // Don't start a web server for component testing
  // Components are tested in isolation

  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});