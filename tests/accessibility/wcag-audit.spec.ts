/**
 * WCAG 2.1 AA Accessibility Audit
 * 
 * Comprehensive accessibility testing across all key pages:
 * - Homepage (/)
 * - Vocabulary page (/vocabulary)
 * - Practice page (/practice)
 * - Learn page (/learn)
 * - Offline page (/offline)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ViolationReport {
  page: string;
  url: string;
  timestamp: string;
  violations: AxeViolation[];
  passes: number;
  violationsByImpact: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

interface AxeViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: ViolationNode[];
}

interface ViolationNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

interface SummaryReport {
  auditDate: string;
  totalPages: number;
  pages: string[];
  overallCompliance: number;
  totalViolations: number;
  violationsByImpact: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  pageResults: {
    page: string;
    url: string;
    violations: number;
    passes: number;
    compliance: number;
    criticalIssues: string[];
    seriousIssues: string[];
    moderateIssues: string[];
    minorIssues: string[];
  }[];
  recommendations: string[];
}

const PAGES_TO_TEST = [
  { name: 'Homepage', path: '/' },
  { name: 'Vocabulary', path: '/vocabulary' },
  { name: 'Practice', path: '/practice' },
  { name: 'Learn', path: '/learn' },
  { name: 'Offline', path: '/offline' }
];

async function runAxeAudit(page: any): Promise<any> {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  return accessibilityScanResults;
}

function categorizeViolations(violations: any[]): ViolationReport['violationsByImpact'] {
  return {
    critical: violations.filter(v => v.impact === 'critical').length,
    serious: violations.filter(v => v.impact === 'serious').length,
    moderate: violations.filter(v => v.impact === 'moderate').length,
    minor: violations.filter(v => v.impact === 'minor').length
  };
}

function formatViolationForReport(violation: any): AxeViolation {
  return {
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node: any) => ({
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary
    }))
  };
}

test.describe('WCAG 2.1 AA Accessibility Audit', () => {
  const reports: ViolationReport[] = [];

  test('Run comprehensive accessibility audit on all key pages', async ({ page }) => {
    console.log('\n=== Starting WCAG 2.1 AA Accessibility Audit ===\n');

    for (const pageInfo of PAGES_TO_TEST) {
      console.log(`\n📄 Testing: ${pageInfo.name} (${pageInfo.path})`);
      
      try {
        // Navigate to the page
        await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('domcontentloaded');
        
        // Give a moment for any dynamic content
        await page.waitForTimeout(1000);
        
        // Run axe accessibility audit
        const results = await runAxeAudit(page);
        
        // Format the report
        const report: ViolationReport = {
          page: pageInfo.name,
          url: pageInfo.path,
          timestamp: new Date().toISOString(),
          violations: results.violations.map(formatViolationForReport),
          passes: results.passes.length,
          violationsByImpact: categorizeViolations(results.violations)
        };
        
        reports.push(report);
        
        // Log summary
        console.log(`  ✅ Passes: ${report.passes}`);
        console.log(`  ❌ Violations: ${report.violations.length}`);
        console.log(`     - Critical: ${report.violationsByImpact.critical}`);
        console.log(`     - Serious: ${report.violationsByImpact.serious}`);
        console.log(`     - Moderate: ${report.violationsByImpact.moderate}`);
        console.log(`     - Minor: ${report.violationsByImpact.minor}`);
        
        // Take screenshot if there are critical violations
        if (report.violationsByImpact.critical > 0 || report.violationsByImpact.serious > 0) {
          await page.screenshot({ 
            path: `tests/accessibility/screenshots/${pageInfo.name.toLowerCase()}-violations.png`,
            fullPage: true 
          });
        }
        
      } catch (error) {
        console.error(`  ❌ Error testing ${pageInfo.name}:`, error);
        reports.push({
          page: pageInfo.name,
          url: pageInfo.path,
          timestamp: new Date().toISOString(),
          violations: [],
          passes: 0,
          violationsByImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 }
        });
      }
    }

    // Generate summary report
    const totalViolations = reports.reduce((sum, r) => sum + r.violations.length, 0);
    const totalPasses = reports.reduce((sum, r) => sum + r.passes, 0);
    const totalChecks = totalViolations + totalPasses;
    const compliancePercentage = totalChecks > 0 ? Math.round((totalPasses / totalChecks) * 100) : 0;

    const summaryReport: SummaryReport = {
      auditDate: new Date().toISOString(),
      totalPages: PAGES_TO_TEST.length,
      pages: PAGES_TO_TEST.map(p => p.name),
      overallCompliance: compliancePercentage,
      totalViolations,
      violationsByImpact: {
        critical: reports.reduce((sum, r) => sum + r.violationsByImpact.critical, 0),
        serious: reports.reduce((sum, r) => sum + r.violationsByImpact.serious, 0),
        moderate: reports.reduce((sum, r) => sum + r.violationsByImpact.moderate, 0),
        minor: reports.reduce((sum, r) => sum + r.violationsByImpact.minor, 0)
      },
      pageResults: reports.map(r => ({
        page: r.page,
        url: r.url,
        violations: r.violations.length,
        passes: r.passes,
        compliance: r.passes + r.violations.length > 0 
          ? Math.round((r.passes / (r.passes + r.violations.length)) * 100) 
          : 100,
        criticalIssues: r.violations.filter(v => v.impact === 'critical').map(v => `${v.id}: ${v.description}`),
        seriousIssues: r.violations.filter(v => v.impact === 'serious').map(v => `${v.id}: ${v.description}`),
        moderateIssues: r.violations.filter(v => v.impact === 'moderate').map(v => `${v.id}: ${v.description}`),
        minorIssues: r.violations.filter(v => v.impact === 'minor').map(v => `${v.id}: ${v.description}`)
      })),
      recommendations: generateRecommendations(reports)
    };

    // Save detailed reports
    const reportsDir = 'tests/accessibility/reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save individual page reports
    for (const report of reports) {
      const filename = `${reportsDir}/${report.page.toLowerCase()}-a11y-report.json`;
      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    }

    // Save summary report
    fs.writeFileSync(`${reportsDir}/wcag-summary-report.json`, JSON.stringify(summaryReport, null, 2));

    // Print summary to console
    console.log('\n\n=== WCAG 2.1 AA AUDIT SUMMARY ===\n');
    console.log(`📊 Overall Compliance: ${compliancePercentage}%`);
    console.log(`📄 Pages Tested: ${PAGES_TO_TEST.length}`);
    console.log(`✅ Total Passes: ${totalPasses}`);
    console.log(`❌ Total Violations: ${totalViolations}`);
    console.log(`   - Critical: ${summaryReport.violationsByImpact.critical}`);
    console.log(`   - Serious: ${summaryReport.violationsByImpact.serious}`);
    console.log(`   - Moderate: ${summaryReport.violationsByImpact.moderate}`);
    console.log(`   - Minor: ${summaryReport.violationsByImpact.minor}`);

    console.log('\n📋 Per-Page Results:\n');
    for (const result of summaryReport.pageResults) {
      console.log(`  ${result.page} (${result.url})`);
      console.log(`    Compliance: ${result.compliance}% | Violations: ${result.violations}`);
      if (result.criticalIssues.length > 0) {
        console.log(`    🔴 Critical: ${result.criticalIssues.length}`);
      }
      if (result.seriousIssues.length > 0) {
        console.log(`    🟠 Serious: ${result.seriousIssues.length}`);
      }
      if (result.moderateIssues.length > 0) {
        console.log(`    🟡 Moderate: ${result.moderateIssues.length}`);
      }
      if (result.minorIssues.length > 0) {
        console.log(`    🔵 Minor: ${result.minorIssues.length}`);
      }
    }

    console.log('\n📝 Recommendations:\n');
    summaryReport.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });

    console.log(`\n📁 Reports saved to: ${reportsDir}/`);
    console.log('\n=== Audit Complete ===\n');

    // Assert that there are no critical or serious violations
    const criticalAndSerious = summaryReport.violationsByImpact.critical + summaryReport.violationsByImpact.serious;
    expect(criticalAndSerious, `Found ${criticalAndSerious} critical/serious accessibility violations`).toBe(0);
  });
});

function generateRecommendations(reports: ViolationReport[]): string[] {
  const recommendations: string[] = [];
  const allViolationIds = new Set<string>();

  // Collect all unique violation IDs
  for (const report of reports) {
    for (const violation of report.violations) {
      allViolationIds.add(violation.id);
    }
  }

  // Generate specific recommendations based on violation types
  const violationTypeCounts = new Map<string, number>();
  for (const report of reports) {
    for (const violation of report.violations) {
      const count = violationTypeCounts.get(violation.id) || 0;
      violationTypeCounts.set(violation.id, count + 1);
    }
  }

  // Priority recommendations based on frequency and severity
  const priorityViolations = ['color-contrast', 'aria-required-attr', 'aria-valid-attr', 'image-alt', 'label', 'link-name'];
  
  for (const violationId of priorityViolations) {
    if (allViolationIds.has(violationId)) {
      const count = violationTypeCounts.get(violationId) || 0;
      switch (violationId) {
        case 'color-contrast':
          recommendations.push(`Fix color contrast issues (${count} instances) - Ensure text has 4.5:1 contrast ratio against background`);
          break;
        case 'aria-required-attr':
          recommendations.push(`Add required ARIA attributes (${count} instances) - Check interactive elements for required aria-* attributes`);
          break;
        case 'aria-valid-attr':
          recommendations.push(`Fix invalid ARIA attributes (${count} instances) - Validate all ARIA attribute names and values`);
          break;
        case 'image-alt':
          recommendations.push(`Add alt text to images (${count} instances) - Provide descriptive alt text for all meaningful images`);
          break;
        case 'label':
          recommendations.push(`Add form labels (${count} instances) - Ensure all form inputs have associated labels`);
          break;
        case 'link-name':
          recommendations.push(`Improve link accessibility (${count} instances) - Ensure links have discernible text`);
          break;
      }
    }
  }

  // Add general recommendations
  if (recommendations.length === 0) {
    recommendations.push('Maintain current accessibility standards');
    recommendations.push('Continue testing with screen readers (NVDA, VoiceOver)');
    recommendations.push('Test keyboard navigation regularly');
  } else {
    recommendations.push('Run keyboard navigation test to verify tab order');
    recommendations.push('Test with screen readers for comprehensive validation');
    recommendations.push('Review ARIA best practices at https://www.w3.org/WAI/ARIA/apg/');
  }

  return recommendations;
}