import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Perform any global setup tasks here, such as logging in or setting up test data

  await browser.close();
}

export default globalSetup;