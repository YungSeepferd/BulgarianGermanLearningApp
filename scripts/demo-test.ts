/**
 * Comprehensive Demo Test Script for Bulgarian-German Learning App
 *
 * This script provides a structured approach to testing all application functionalities
 * before GitHub Pages deployment. It includes both automated checks and manual test
 * instructions for comprehensive coverage.
 */

import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  headless: false,
  slowMo: 500,
  timeout: 30000,
  testDataDir: path.join(__dirname, '../reports/test-output'),
  screenshotsDir: path.join(__dirname, '../reports/test-output/screenshots')
};

// Ensure test directories exist
function setupTestDirectories() {
  if (!fs.existsSync(TEST_CONFIG.testDataDir)) {
    fs.mkdirSync(TEST_CONFIG.testDataDir, { recursive: true });
  }
  if (!fs.existsSync(TEST_CONFIG.screenshotsDir)) {
    fs.mkdirSync(TEST_CONFIG.screenshotsDir, { recursive: true });
  }
}

// Test report structure
interface TestReport {
  timestamp: string;
  environment: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage: number;
  };
}

interface TestResult {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped' | 'manual';
  error?: string;
  screenshot?: string;
  notes?: string;
  timestamp: string;
}

// Initialize test report
function createTestReport(): TestReport {
  return {
    timestamp: new Date().toISOString(),
    environment: 'Development',
    results: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      coverage: 0
    }
  };
}

// Save test report
function saveTestReport(report: TestReport) {
  const reportPath = path.join(TEST_CONFIG.testDataDir, `demo-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Test report saved to ${reportPath}`);
}

// Take screenshot
async function takeScreenshot(page: Page, name: string): Promise<string> {
  const screenshotPath = path.join(TEST_CONFIG.screenshotsDir, `${name}-${new Date().getTime()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

// Add test result
function addTestResult(report: TestReport, result: Omit<TestResult, 'timestamp'>): TestReport {
  const testResult: TestResult = {
    ...result,
    timestamp: new Date().toISOString()
  };

  report.results.push(testResult);
  report.summary.total++;

  if (result.status === 'passed') {
    report.summary.passed++;
  } else if (result.status === 'failed') {
    report.summary.failed++;
  } else if (result.status === 'skipped') {
    report.summary.skipped++;
  }

  report.summary.coverage = Math.round((report.summary.passed / report.summary.total) * 100);

  return report;
}

// Core functionality tests
async function testCoreFunctionality(page: Page, report: TestReport): Promise<TestReport> {
  console.log('\n🌐 Testing Core Functionality...');

  // Test 1: Application loads successfully
  try {
    await page.goto(TEST_CONFIG.baseUrl);
    await page.waitForSelector('text=Bulgarisch-Deutsch Lernapp', { timeout: 10000 });
    const screenshot = await takeScreenshot(page, 'app-loaded');
    report = addTestResult(report, {
      id: 'core-001',
      name: 'Application Load',
      description: 'Verify application loads successfully',
      category: 'Core Functionality',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'core-001',
      name: 'Application Load',
      description: 'Verify application loads successfully',
      category: 'Core Functionality',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 2: Navigation tabs work correctly
  try {
    const navItems = ['Home', 'Lernen', 'Vokabeln', 'Grammatik', 'Üben', 'Dashboard', 'Einstellungen'];
    for (const item of navItems) {
      await page.click(`text=${item}`);
      await page.waitForTimeout(500);
    }
    const screenshot = await takeScreenshot(page, 'navigation-working');
    report = addTestResult(report, {
      id: 'core-002',
      name: 'Navigation Tabs',
      description: 'Verify all navigation tabs work correctly',
      category: 'Core Functionality',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'core-002',
      name: 'Navigation Tabs',
      description: 'Verify all navigation tabs work correctly',
      category: 'Core Functionality',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 3: Language switching (manual test)
  report = addTestResult(report, {
    id: 'core-003',
    name: 'Language Switching',
    description: 'Test language switching between DE_BG ↔ BG_DE (manual verification)',
    category: 'Core Functionality',
    status: 'manual',
    notes: 'Look for language direction indicators and verify content changes appropriately'
  });

  // Test 4: Language preference persistence (manual test)
  report = addTestResult(report, {
    id: 'core-004',
    name: 'Language Preference Persistence',
    description: 'Verify language preference persists across page reloads (manual verification)',
    category: 'Core Functionality',
    status: 'manual',
    notes: 'Switch language, reload page, and verify the selected language is maintained'
  });

  return report;
}

// Learning features tests
async function testLearningFeatures(page: Page, report: TestReport): Promise<TestReport> {
  console.log('\n📚 Testing Learning Features...');

  // Navigate to Lernen section
  try {
    await page.click('text=Lernen');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Could not navigate to Lernen section, skipping learning features tests');
    return report;
  }

  // Test 1: Vocabulary lessons generate correctly
  try {
    await page.click('text=Vokabeln');
    await page.waitForSelector('text=Vokabelliste', { timeout: 5000 });
    const screenshot = await takeScreenshot(page, 'vocabulary-lesson');
    report = addTestResult(report, {
      id: 'learn-001',
      name: 'Vocabulary Lessons',
      description: 'Verify vocabulary lessons generate correctly',
      category: 'Learning Features',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'learn-001',
      name: 'Vocabulary Lessons',
      description: 'Verify vocabulary lessons generate correctly',
      category: 'Learning Features',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 2: Grammar lessons generate correctly
  try {
    await page.click('text=Grammatik');
    await page.waitForSelector('text=Grammatikregeln', { timeout: 5000 });
    const screenshot = await takeScreenshot(page, 'grammar-lesson');
    report = addTestResult(report, {
      id: 'learn-002',
      name: 'Grammar Lessons',
      description: 'Verify grammar lessons generate correctly',
      category: 'Learning Features',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'learn-002',
      name: 'Grammar Lessons',
      description: 'Verify grammar lessons generate correctly',
      category: 'Learning Features',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 3: Mixed lessons generate correctly
  try {
    await page.click('text=Gemischt');
    await page.waitForSelector('text=Gemischte Lektion', { timeout: 5000 });
    const screenshot = await takeScreenshot(page, 'mixed-lesson');
    report = addTestResult(report, {
      id: 'learn-003',
      name: 'Mixed Lessons',
      description: 'Verify mixed lessons generate correctly',
      category: 'Learning Features',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'learn-003',
      name: 'Mixed Lessons',
      description: 'Verify mixed lessons generate correctly',
      category: 'Learning Features',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 4: Lesson content adapts to language direction (manual test)
  report = addTestResult(report, {
    id: 'learn-004',
    name: 'Lesson Content Adaptation',
    description: 'Verify lesson content adapts to language direction (manual verification)',
    category: 'Learning Features',
    status: 'manual',
    notes: 'Switch language direction and verify lesson content updates appropriately'
  });

  return report;
}

// Practice features tests
async function testPracticeFeatures(page: Page, report: TestReport): Promise<TestReport> {
  console.log('\n🎯 Testing Practice Features...');

  // Navigate to Üben section
  try {
    await page.click('text=Üben');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Could not navigate to Üben section, skipping practice features tests');
    return report;
  }

  // Test 1: Tandem practice works correctly
  try {
    await page.click('text=Tandem');
    await page.waitForSelector('text=Tandemübung', { timeout: 5000 });
    const screenshot = await takeScreenshot(page, 'tandem-practice');
    report = addTestResult(report, {
      id: 'practice-001',
      name: 'Tandem Practice',
      description: 'Verify tandem practice works correctly',
      category: 'Practice Features',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'practice-001',
      name: 'Tandem Practice',
      description: 'Verify tandem practice works correctly',
      category: 'Practice Features',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 2: Flashcard functionality works
  try {
    await page.click('text=Karteikarten');
    await page.waitForSelector('text=Karteikarte', { timeout: 5000 });
    const screenshot = await takeScreenshot(page, 'flashcards');
    report = addTestResult(report, {
      id: 'practice-002',
      name: 'Flashcard Functionality',
      description: 'Verify flashcard functionality works',
      category: 'Practice Features',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'practice-002',
      name: 'Flashcard Functionality',
      description: 'Verify flashcard functionality works',
      category: 'Practice Features',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 3: Quiz controller works (manual test)
  report = addTestResult(report, {
    id: 'practice-003',
    name: 'Quiz Controller',
    description: 'Verify quiz controller works (manual verification)',
    category: 'Practice Features',
    status: 'manual',
    notes: 'Test quiz functionality including question navigation, answer submission, and scoring'
  });

  // Test 4: Progress tracking works (manual test)
  report = addTestResult(report, {
    id: 'practice-004',
    name: 'Progress Tracking',
    description: 'Verify progress tracking works (manual verification)',
    category: 'Practice Features',
    status: 'manual',
    notes: 'Complete practice exercises and verify progress is tracked in the dashboard'
  });

  // Test 5: Feedback messages display correctly (manual test)
  report = addTestResult(report, {
    id: 'practice-005',
    name: 'Feedback Messages',
    description: 'Verify feedback messages display correctly (manual verification)',
    category: 'Practice Features',
    status: 'manual',
    notes: 'Test various practice scenarios and verify appropriate feedback messages appear'
  });

  return report;
}

// Dashboard features tests
async function testDashboardFeatures(page: Page, report: TestReport): Promise<TestReport> {
  console.log('\n📊 Testing Dashboard Features...');

  // Navigate to Dashboard section
  try {
    await page.click('text=Dashboard');
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('Could not navigate to Dashboard section, skipping dashboard features tests');
    return report;
  }

  // Test 1: Progress dashboard displays correctly
  try {
    await page.waitForSelector('text=Dein Fortschritt', { timeout: 10000 });
    const screenshot = await takeScreenshot(page, 'progress-dashboard');
    report = addTestResult(report, {
      id: 'dashboard-001',
      name: 'Progress Dashboard Display',
      description: 'Verify progress dashboard displays correctly',
      category: 'Dashboard Features',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'dashboard-001',
      name: 'Progress Dashboard Display',
      description: 'Verify progress dashboard displays correctly',
      category: 'Dashboard Features',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 2: Statistics update correctly (manual test)
  report = addTestResult(report, {
    id: 'dashboard-002',
    name: 'Statistics Updates',
    description: 'Verify statistics update correctly (manual verification)',
    category: 'Dashboard Features',
    status: 'manual',
    notes: 'Complete some practice exercises and verify dashboard statistics update'
  });

  // Test 3: Gamification elements work (manual test)
  report = addTestResult(report, {
    id: 'dashboard-003',
    name: 'Gamification Elements',
    description: 'Verify gamification elements work (XP, levels, etc.) (manual verification)',
    category: 'Dashboard Features',
    status: 'manual',
    notes: 'Test level progression, XP accumulation, and any gamification features'
  });

  // Test 4: Error handling for dashboard data (manual test)
  report = addTestResult(report, {
    id: 'dashboard-004',
    name: 'Dashboard Error Handling',
    description: 'Verify error handling works for dashboard data (manual verification)',
    category: 'Dashboard Features',
    status: 'manual',
    notes: 'Test with corrupted or missing progress data to verify graceful error handling'
  });

  return report;
}

// Bilingual support tests
async function testBilingualSupport(page: Page, report: TestReport): Promise<TestReport> {
  console.log('\n🌍 Testing Bilingual Support...');

  // Test 1: All UI elements are properly localized (manual test)
  report = addTestResult(report, {
    id: 'bilingual-001',
    name: 'UI Localization',
    description: 'Verify all UI elements are properly localized (manual verification)',
    category: 'Bilingual Support',
    status: 'manual',
    notes: 'Switch between languages and verify all UI elements are translated appropriately'
  });

  // Test 2: Language switching updates all components (manual test)
  report = addTestResult(report, {
    id: 'bilingual-002',
    name: 'Language Switching',
    description: 'Verify language switching updates all components (manual verification)',
    category: 'Bilingual Support',
    status: 'manual',
    notes: 'Test language switching and verify all components update to reflect the new language'
  });

  // Test 3: Special characters render correctly
  try {
    await page.goto(TEST_CONFIG.baseUrl);
    await page.waitForSelector('text=Български', { timeout: 5000 });
    await page.waitForSelector('text=Deutsch', { timeout: 5000 });
    const screenshot = await takeScreenshot(page, 'special-characters');
    report = addTestResult(report, {
      id: 'bilingual-003',
      name: 'Special Characters',
      description: 'Verify special characters render correctly',
      category: 'Bilingual Support',
      status: 'passed',
      screenshot
    });
  } catch (error) {
    report = addTestResult(report, {
      id: 'bilingual-003',
      name: 'Special Characters',
      description: 'Verify special characters render correctly',
      category: 'Bilingual Support',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 4: Translation fallback works for missing strings (manual test)
  report = addTestResult(report, {
    id: 'bilingual-004',
    name: 'Translation Fallback',
    description: 'Verify translation fallback works for missing strings (manual verification)',
    category: 'Bilingual Support',
    status: 'manual',
    notes: 'Test with incomplete translation files to verify fallback to default language'
  });

  // Test 5: Language direction indicators display correctly (manual test)
  report = addTestResult(report, {
    id: 'bilingual-005',
    name: 'Language Direction Indicators',
    description: 'Verify language direction indicators display correctly (manual verification)',
    category: 'Bilingual Support',
    status: 'manual',
    notes: 'Verify indicators show the current language direction (DE→BG or BG→DE)'
  });

  return report;
}

// Edge case tests
async function testEdgeCases(page: Page, report: TestReport): Promise<TestReport> {
  console.log('\n🧪 Testing Edge Cases...');

  // Test 1: Error handling for missing data (manual test)
  report = addTestResult(report, {
    id: 'edge-001',
    name: 'Missing Data Handling',
    description: 'Verify error handling for missing data (manual verification)',
    category: 'Edge Cases',
    status: 'manual',
    notes: 'Test with missing or corrupted data files to verify graceful error handling'
  });

  // Test 2: Network error handling (manual test)
  report = addTestResult(report, {
    id: 'edge-002',
    name: 'Network Error Handling',
    description: 'Verify network error handling (manual verification)',
    category: 'Edge Cases',
    status: 'manual',
    notes: 'Simulate network errors and verify the application handles them gracefully'
  });

  // Test 3: Invalid input handling (manual test)
  report = addTestResult(report, {
    id: 'edge-003',
    name: 'Invalid Input Handling',
    description: 'Verify invalid input handling (manual verification)',
    category: 'Edge Cases',
    status: 'manual',
    notes: 'Test with invalid inputs in forms and practice exercises'
  });

  // Test 4: Mobile responsiveness (manual test)
  report = addTestResult(report, {
    id: 'edge-004',
    name: 'Mobile Responsiveness',
    description: 'Verify mobile responsiveness (manual verification)',
    category: 'Edge Cases',
    status: 'manual',
    notes: 'Test the application on various screen sizes and mobile devices'
  });

  // Test 5: Accessibility compliance (manual test)
  report = addTestResult(report, {
    id: 'edge-005',
    name: 'Accessibility Compliance',
    description: 'Verify accessibility compliance (manual verification)',
    category: 'Edge Cases',
    status: 'manual',
    notes: 'Test keyboard navigation, screen reader compatibility, and accessibility features'
  });

  return report;
}

// Build and deployment tests
async function testBuildAndDeployment(page: Page, report: TestReport): Promise<TestReport> {
  console.log('\n🚀 Testing Build and Deployment...');

  // Test 1: Verify build configuration (manual test)
  report = addTestResult(report, {
    id: 'deploy-001',
    name: 'Build Configuration',
    description: 'Verify build configuration for GitHub Pages (manual verification)',
    category: 'Build and Deployment',
    status: 'manual',
    notes: 'Check vite.config.ts and other build configuration files for GitHub Pages compatibility'
  });

  // Test 2: Test production build locally (manual test)
  report = addTestResult(report, {
    id: 'deploy-002',
    name: 'Production Build Test',
    description: 'Test the production build locally (manual verification)',
    category: 'Build and Deployment',
    status: 'manual',
    notes: 'Run pnpm build and pnpm preview to test the production build locally'
  });

  // Test 3: Verify static assets (manual test)
  report = addTestResult(report, {
    id: 'deploy-003',
    name: 'Static Assets',
    description: 'Verify static assets are properly referenced (manual verification)',
    category: 'Build and Deployment',
    status: 'manual',
    notes: 'Check that all static assets are properly referenced with correct paths'
  });

  return report;
}

// Manual test instructions
function printManualTestInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL TEST INSTRUCTIONS');
  console.log('='.repeat(60));

  console.log(`
1. **Language Switching Test (core-003)**
   - Click on the language switcher in the navigation
   - Verify the language direction changes (DE→BG ↔ BG→DE)
   - Check that all content updates to reflect the new language direction
   - Verify language indicators show the correct direction

2. **Language Preference Persistence (core-004)**
   - Switch to a different language
   - Reload the page
   - Verify the selected language is maintained after reload

3. **Lesson Content Adaptation (learn-004)**
   - Navigate to the Lernen section
   - Switch language direction
   - Verify lesson content updates appropriately for the new direction
   - Test with vocabulary, grammar, and mixed lessons

4. **Quiz Controller (practice-003)**
   - Navigate to the Üben section
   - Start a quiz
   - Test question navigation (next, previous)
   - Submit answers and verify scoring
   - Check feedback messages for correct/incorrect answers

5. **Progress Tracking (practice-004)**
   - Complete several practice exercises
   - Navigate to the Dashboard
   - Verify progress statistics update correctly
   - Check that XP and other metrics reflect your activity

6. **Feedback Messages (practice-005)**
   - Test various practice scenarios:
     - Correct answers
     - Incorrect answers
     - Partial completions
     - Skipping questions
   - Verify appropriate feedback messages appear for each scenario

7. **Statistics Updates (dashboard-002)**
   - Complete some practice exercises
   - Navigate to the Dashboard
   - Verify statistics update in real-time
   - Check all metrics (XP, level, streak, etc.)

8. **Gamification Elements (dashboard-003)**
   - Test level progression by earning XP
   - Verify level-up notifications appear
   - Check that achievements are awarded appropriately
   - Test any other gamification features

9. **Dashboard Error Handling (dashboard-004)**
   - Simulate corrupted progress data (clear localStorage)
   - Verify the dashboard handles the error gracefully
   - Check that fallback content is displayed

10. **UI Localization (bilingual-001)**
    - Switch between all available languages
    - Verify all UI elements are translated
    - Check that no elements remain in the wrong language

11. **Language Switching Updates (bilingual-002)**
    - Switch languages while on different pages
    - Verify all components update to reflect the new language
    - Test with complex components like lessons and quizzes

12. **Translation Fallback (bilingual-004)**
    - Temporarily remove some translation strings
    - Switch to the language with missing strings
    - Verify fallback to default language works correctly

13. **Language Direction Indicators (bilingual-005)**
    - Switch between language directions
    - Verify indicators show the correct direction (DE→BG or BG→DE)
    - Check that indicators are visible in all relevant components

14. **Missing Data Handling (edge-001)**
    - Simulate missing or corrupted data files
    - Verify the application handles errors gracefully
    - Check that fallback content or error messages are displayed

15. **Network Error Handling (edge-002)**
    - Simulate network errors (offline mode, slow network)
    - Verify the application handles network issues gracefully
    - Check that appropriate error messages are displayed

16. **Invalid Input Handling (edge-003)**
    - Test with invalid inputs in forms:
      - Empty fields
      - Invalid characters
      - Out-of-range values
    - Verify appropriate validation messages appear

17. **Mobile Responsiveness (edge-004)**
    - Test on various screen sizes:
      - Mobile phones (320px - 480px)
      - Tablets (768px - 1024px)
      - Desktop (1024px+)
    - Verify all components are usable and properly laid out

18. **Accessibility Compliance (edge-005)**
    - Test keyboard navigation:
      - Tab through all interactive elements
      - Verify focus indicators are visible
      - Test keyboard shortcuts
    - Test screen reader compatibility
    - Verify color contrast meets accessibility standards

19. **Build Configuration (deploy-001)**
    - Review vite.config.ts for GitHub Pages compatibility
    - Check base path configuration
    - Verify all necessary build plugins are configured

20. **Production Build Test (deploy-002)**
    - Run: pnpm build
    - Run: pnpm preview
    - Test the production build locally
    - Verify all features work in production mode

21. **Static Assets (deploy-003)**
    - Check that all static assets are properly referenced
    - Verify asset paths are correct for GitHub Pages
    - Test that all assets load correctly in production
`);
}

// Main test function
async function runDemoTests() {
  setupTestDirectories();
  const report = createTestReport();
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('🚀 Starting Bulgarian-German Learning App Demo Test');
    console.log('='.repeat(60));

    // Launch browser
    browser = await chromium.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo
    });

    page = await browser.newPage();

    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // Run automated tests
    report = await testCoreFunctionality(page, report);
    report = await testLearningFeatures(page, report);
    report = await testPracticeFeatures(page, report);
    report = await testDashboardFeatures(page, report);
    report = await testBilingualSupport(page, report);
    report = await testEdgeCases(page, report);
    report = await testBuildAndDeployment(page, report);

    // Print manual test instructions
    printManualTestInstructions();

    // Save test report
    saveTestReport(report);

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Skipped: ${report.summary.skipped}`);
    console.log(`Manual: ${report.results.filter(r => r.status === 'manual').length}`);
    console.log(`Coverage: ${report.summary.coverage}%`);
    console.log('='.repeat(60));

    if (report.summary.failed > 0) {
      console.log('⚠️  Some tests failed. Check the test report for details.');
    } else {
      console.log('✅ All automated tests passed!');
    }

    console.log('\n📋 Manual tests required. Follow the instructions above to complete testing.');

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    if (report) {
      report = addTestResult(report, {
        id: 'global-001',
        name: 'Test Execution',
        description: 'Overall test execution',
        category: 'Global',
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      });
      saveTestReport(report);
    }
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Run the tests
runDemoTests().catch(console.error);