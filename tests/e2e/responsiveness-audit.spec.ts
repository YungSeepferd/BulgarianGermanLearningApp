import { test, expect, Page } from '@playwright/test';

const BREAKPOINTS = [
  { name: 'Mobile Small (320px)', width: 320, height: 667 },
  { name: 'Mobile (375px)', width: 375, height: 667 },
  { name: 'Mobile Large (425px)', width: 425, height: 667 },
  { name: 'Tablet Portrait (768px)', width: 768, height: 1024 },
  { name: 'Tablet Landscape (1024px)', width: 1024, height: 768 },
  { name: 'Laptop (1366px)', width: 1366, height: 768 },
  { name: 'Desktop (1920px)', width: 1920, height: 1080 },
];

async function getScrollbarInfo(page: Page) {
  return await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      htmlClientWidth: html.clientWidth,
      htmlScrollWidth: html.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      hasHorizontalScroll: html.scrollWidth > html.clientWidth + 10 || body.scrollWidth > window.innerWidth + 10,
      hasVerticalScroll: html.scrollHeight > html.clientHeight + 10 || body.scrollHeight > window.innerHeight + 10,
      buttons: Array.from(document.querySelectorAll('button')).filter(b => (b as any).offsetParent !== null).length,
    };
  });
}

test.describe('🎯 Comprehensive Responsive Design Audit', () => {
  test('Baseline - Full Desktop (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    
    const info = await getScrollbarInfo(page);
    console.log('\n' + '='.repeat(60));
    console.log('🖥️  BASELINE: Full Desktop Screen');
    console.log('='.repeat(60));
    console.log(`  Window: ${info.windowWidth}×${info.windowHeight}px`);
    console.log(`  HTML Client Width: ${info.htmlClientWidth}px`);
    console.log(`  Body Scroll Width: ${info.bodyScrollWidth}px`);
    console.log(`  Horizontal Scroll: ${info.hasHorizontalScroll ? '❌ YES (ISSUE!)' : '✅ No'}`);
    console.log(`  Buttons Found: ${info.buttons}`);
    
    expect(info.hasHorizontalScroll).toBe(false);
  });

  test.describe('Horizontal Resizing Cascade', () => {
    BREAKPOINTS.forEach(bp => {
      test(`Responsive at ${bp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
        
        const info = await getScrollbarInfo(page);
        
        console.log(`\n📱 ${bp.name}`);
        console.log(`  Window: ${info.windowWidth}×${info.windowHeight}px`);
        console.log(`  HTML Width: ${info.htmlClientWidth}px`);
        console.log(`  Horizontal Scroll: ${info.hasHorizontalScroll ? '❌' : '✅'}`);
        console.log(`  Buttons: ${info.buttons}`);
        
        expect(info.hasHorizontalScroll, `Should not have horizontal scroll at ${bp.name}`).toBe(false);
      });
    });
  });

  test.describe('Multi-Page Testing', () => {
    const pages = [
      { route: '/', name: 'Home' },
      { route: '/vocabulary', name: 'Vocabulary' },
      { route: '/practice', name: 'Practice' },
      { route: '/learn', name: 'Learn' },
      { route: '/grammar', name: 'Grammar' },
    ];

    pages.forEach(({ route, name }) => {
      test(`${name} page responsiveness`, async ({ page }) => {
        console.log(`\n📖 Testing: ${name}`);
        
        const testBps = [BREAKPOINTS[0], BREAKPOINTS[3], BREAKPOINTS[6]];
        
        for (const bp of testBps) {
          await page.setViewportSize({ width: bp.width, height: bp.height });
          await page.goto(`http://localhost:5173${route}`, { waitUntil: 'domcontentloaded' });
          
          const info = await getScrollbarInfo(page);
          console.log(`  ${bp.name}: HScroll=${info.hasHorizontalScroll ? '❌' : '✅'}, Buttons=${info.buttons}`);
          
          expect(info.hasHorizontalScroll).toBe(false);
        }
      });
    });
  });

  test('Extreme Narrow (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    
    const info = await getScrollbarInfo(page);
    console.log('\n🚨 EXTREME: 320px Width');
    console.log(`  Horizontal Scroll: ${info.hasHorizontalScroll ? '❌' : '✅'}`);
    console.log(`  Buttons: ${info.buttons}`);
    
    expect(info.hasHorizontalScroll).toBe(false);
  });

  test('Real Device - iPhone 12 (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/vocabulary', { waitUntil: 'domcontentloaded' });
    
    const info = await getScrollbarInfo(page);
    console.log('\n📱 iPhone 12 (390×844px)');
    console.log(`  Horizontal Scroll: ${info.hasHorizontalScroll ? '❌' : '✅'}`);
    
    expect(info.hasHorizontalScroll).toBe(false);
  });

  test('Real Device - iPad Air (820x1180)', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('http://localhost:5173/vocabulary', { waitUntil: 'domcontentloaded' });
    
    const info = await getScrollbarInfo(page);
    console.log('\n📱 iPad Air (820×1180px)');
    console.log(`  Horizontal Scroll: ${info.hasHorizontalScroll ? '❌' : '✅'}`);
    
    expect(info.hasHorizontalScroll).toBe(false);
  });

  test('Vertical Shrinking (1024x500)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 500 });
    await page.goto('http://localhost:5173/practice', { waitUntil: 'domcontentloaded' });
    
    const info = await getScrollbarInfo(page);
    console.log('\n⬇️  Short Height (1024×500px)');
    console.log(`  Horizontal Scroll: ${info.hasHorizontalScroll ? '❌' : '✅'}`);
    console.log(`  Vertical Scroll: ${info.hasVerticalScroll ? '✅' : '❌'}`);
    
    expect(info.hasHorizontalScroll).toBe(false);
  });
});
