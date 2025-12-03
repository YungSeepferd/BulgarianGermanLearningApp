/**
 * Playwright Configuration for SvelteKit Component Testing
 * @file playwright.config.ts
 * @description Playwright configuration for testing SvelteKit components with accessibility and visual regression
 * @version 1.0.0
 * @updated November 2025
 */

import { defineConfig, devices } from '@playwright/test';
import type { TestOptions } from '@playwright/test';

// Extend TestOptions to include custom fixtures
interface ExtendedTestOptions extends TestOptions {
  // Custom test options can be added here
  accessibility?: boolean;
  visualRegression?: boolean;
}

export default defineConfig<ExtendedTestOptions>({
  // Test directory
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Use a fixed viewport for consistent visual tests
  use: {
    viewport: { width: 1280, height: 720 },
    // Base URL to use in actions like `await page.goto('/')`
    // Match the production base path if testing the built artifact
    baseURL: process.env.NODE_ENV === 'production' ? 'http://localhost:4173/BulgarianApp-Fresh' : 'http://localhost:4173',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global timeout for each action
    actionTimeout: 10000,
    
    // Global timeout for navigation
    navigationTimeout: 30000,
  },
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: './playwright-report' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['junit', { outputFile: './test-results/junit.xml' }],
    ['list'],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:4173',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global timeout for each action
    actionTimeout: 10000,
    
    // Global timeout for navigation
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
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
    
    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Global setup and teardown
  globalSetup: './tests/global-setup.ts',
  
  // Test timeout
  timeout: 30000,
  
  // Expect timeout
  expect: {
    timeout: 5000,
  },
});