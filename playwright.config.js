// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    // Hugo serves under a subpath per current config
    baseURL: 'http://127.0.0.1:1313/BulgarianGermanLearningApp/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'hugo server --buildDrafts --buildFuture --bind 127.0.0.1 --baseURL http://127.0.0.1:1313/BulgarianGermanLearningApp/ --disableLiveReload --watch=false',
    url: 'http://127.0.0.1:1313/BulgarianGermanLearningApp/',
    reuseExistingServer: process.env.PW_REUSE_SERVER === '1',
    timeout: 120 * 1000,
  },
});
