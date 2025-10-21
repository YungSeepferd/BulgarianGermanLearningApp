const { test, expect } = require('@playwright/test');

test('debug navigation paths', async ({ page }) => {
  console.log('\n=== Testing different navigation paths ===\n');
  
  // Test 1: Relative path
  console.log('1. Testing: page.goto("practice/")');
  await page.goto('practice/');
  await page.waitForTimeout(2000);
  const url1 = page.url();
  const title1 = await page.title();
  console.log(`   URL: ${url1}`);
  console.log(`   Title: ${title1}`);
  console.log(`   Has flashcard: ${await page.locator('#flashcard').count() > 0}`);
  
  // Test 2: Absolute path
  console.log('\n2. Testing: page.goto("/practice/")');
  await page.goto('/practice/');
  await page.waitForTimeout(2000);
  const url2 = page.url();
  const title2 = await page.title();
  console.log(`   URL: ${url2}`);
  console.log(`   Title: ${title2}`);
  console.log(`   Has flashcard: ${await page.locator('#flashcard').count() > 0}`);
  
  // Test 3: With beforeEach pattern
  console.log('\n3. Testing: goto("/") then clear, then goto("/practice/")');
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/practice/');
  await page.waitForTimeout(2000);
  const url3 = page.url();
  const title3 = await page.title();
  console.log(`   URL: ${url3}`);
  console.log(`   Title: ${title3}`);
  console.log(`   Has flashcard: ${await page.locator('#flashcard').count() > 0}`);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-navigation.png', fullPage: true });
});
