#!/usr/bin/env node

/**
 * Generate comprehensive coverage report for SvelteKit components
 * This script processes coverage data from Playwright tests and generates
 * detailed reports in multiple formats
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COVERAGE_DIR = path.join(process.cwd(), 'coverage');
const REPORTS_DIR = path.join(COVERAGE_DIR, 'reports');
const THRESHOLDS = {
  statements: 80,
  branches: 80,
  functions: 80,
  lines: 80
};

/**
 * Ensure coverage directory exists
 */
function ensureCoverageDir() {
  if (!fs.existsSync(COVERAGE_DIR)) {
    fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

/**
 * Read coverage summary from coverage files
 */
function readCoverageSummary() {
  const summaryFile = path.join(COVERAGE_DIR, 'coverage-summary.json');
  
  if (!fs.existsSync(summaryFile)) {
    console.error('Coverage summary file not found. Run tests with coverage first.');
    process.exit(1);
  }

  try {
    const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    return summary;
  } catch (error) {
    console.error('Error reading coverage summary:', error.message);
    process.exit(1);
  }
}

/**
 * Generate HTML coverage report
 */
function generateHtmlReport(summary) {
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SvelteKit Coverage Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
        }
        .metric {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .metric.good { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        .metric.warning { background: #fff3cd; border-color: #ffeaa7; color: #856404; }
        .metric.danger { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .details {
            padding: 0 30px 30px;
        }
        .file-list {
            list-style: none;
            padding: 0;
        }
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
            transition: background-color 0.2s;
        }
        .file-item:hover {
            background-color: #f8f9fa;
        }
        .file-name {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
            color: #495057;
        }
        .file-metrics {
            display: flex;
            gap: 15px;
        }
        .file-metric {
            text-align: center;
            min-width: 60px;
        }
        .file-metric-value {
            font-weight: bold;
            font-size: 0.9em;
        }
        .file-metric-label {
            font-size: 0.7em;
            color: #6c757d;
            text-transform: uppercase;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }
        .timestamp {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 SvelteKit Coverage Report</h1>
            <p>Comprehensive test coverage analysis for Bulgarian-German Learning App</p>
        </div>
        
        <div class="summary">
            <div class="metric ${getMetricClass(summary.total.statements.pct)}">
                <div class="metric-value">${summary.total.statements.pct}%</div>
                <div class="metric-label">Statements</div>
            </div>
            <div class="metric ${getMetricClass(summary.total.branches.pct)}">
                <div class="metric-value">${summary.total.branches.pct}%</div>
                <div class="metric-label">Branches</div>
            </div>
            <div class="metric ${getMetricClass(summary.total.functions.pct)}">
                <div class="metric-value">${summary.total.functions.pct}%</div>
                <div class="metric-label">Functions</div>
            </div>
            <div class="metric ${getMetricClass(summary.total.lines.pct)}">
                <div class="metric-value">${summary.total.lines.pct}%</div>
                <div class="metric-label">Lines</div>
            </div>
        </div>
        
        <div class="details">
            <h2>File Coverage Details</h2>
            <ul class="file-list">
                ${generateFileList(summary)}
            </ul>
        </div>
        
        <div class="footer">
            <div class="timestamp">Generated on ${new Date().toISOString()}</div>
            <div>Bulgarian-German Learning App • SvelteKit Frontend</div>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(REPORTS_DIR, 'coverage-report.html');
  fs.writeFileSync(reportPath, htmlReport);
  console.log(`✅ HTML report generated: ${reportPath}`);
}

/**
 * Get CSS class for metric based on threshold
 */
function getMetricClass(percentage) {
  if (percentage >= 90) return 'good';
  if (percentage >= 70) return 'warning';
  return 'danger';
}

/**
 * Generate file list for HTML report
 */
function generateFileList(summary) {
  const files = Object.keys(summary)
    .filter(key => key !== 'total')
    .map(key => ({
      name: key,
      ...summary[key]
    }))
    .sort((a, b) => b.statements.pct - a.statements.pct);

  return files.map(file => `
    <li class="file-item">
        <span class="file-name">${file.name}</span>
        <div class="file-metrics">
            <div class="file-metric">
                <div class="file-metric-value">${file.statements.pct}%</div>
                <div class="file-metric-label">Stmt</div>
            </div>
            <div class="file-metric">
                <div class="file-metric-value">${file.branches.pct}%</div>
                <div class="file-metric-label">Br</div>
            </div>
            <div class="file-metric">
                <div class="file-metric-value">${file.functions.pct}%</div>
                <div class="file-metric-label">Fn</div>
            </div>
            <div class="file-metric">
                <div class="file-metric-value">${file.lines.pct}%</div>
                <div class="file-metric-label">Ln</div>
            </div>
        </div>
    </li>
  `).join('');
}

/**
 * Generate JSON report for CI/CD integration
 */
function generateJsonReport(summary) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: summary.total,
      thresholds: THRESHOLDS,
      passed: checkThresholds(summary.total)
    },
    files: Object.keys(summary)
      .filter(key => key !== 'total')
      .map(key => ({
        file: key,
        ...summary[key],
        passed: checkThresholds(summary[key])
      }))
  };

  const reportPath = path.join(REPORTS_DIR, 'coverage-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ JSON report generated: ${reportPath}`);
}

/**
 * Check if coverage meets thresholds
 */
function checkThresholds(coverage) {
  return {
    statements: coverage.statements.pct >= THRESHOLDS.statements,
    branches: coverage.branches.pct >= THRESHOLDS.branches,
    functions: coverage.functions.pct >= THRESHOLDS.functions,
    lines: coverage.lines.pct >= THRESHOLDS.lines,
    overall: Object.values({
      statements: coverage.statements.pct >= THRESHOLDS.statements,
      branches: coverage.branches.pct >= THRESHOLDS.branches,
      functions: coverage.functions.pct >= THRESHOLDS.functions,
      lines: coverage.lines.pct >= THRESHOLDS.lines
    }).every(Boolean)
  };
}

/**
 * Generate markdown report for GitHub
 */
function generateMarkdownReport(summary) {
  const report = `# 🧪 SvelteKit Coverage Report

## Summary

| Metric | Coverage | Threshold | Status |
|--------|----------|-----------|--------|
| Statements | ${summary.total.statements.pct}% | ${THRESHOLDS.statements}% | ${summary.total.statements.pct >= THRESHOLDS.statements ? '✅' : '❌'} |
| Branches | ${summary.total.branches.pct}% | ${THRESHOLDS.branches}% | ${summary.total.branches.pct >= THRESHOLDS.branches ? '✅' : '❌'} |
| Functions | ${summary.total.functions.pct}% | ${THRESHOLDS.functions}% | ${summary.total.functions.pct >= THRESHOLDS.functions ? '✅' : '❌'} |
| Lines | ${summary.total.lines.pct}% | ${THRESHOLDS.lines}% | ${summary.total.lines.pct >= THRESHOLDS.lines ? '✅' : '❌'} |

## File Coverage

${generateMarkdownFileList(summary)}

---

*Report generated on ${new Date().toISOString()}*`;

  const reportPath = path.join(REPORTS_DIR, 'coverage-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`✅ Markdown report generated: ${reportPath}`);
}

/**
 * Generate file list for markdown report
 */
function generateMarkdownFileList(summary) {
  const files = Object.keys(summary)
    .filter(key => key !== 'total')
    .map(key => ({
      name: key,
      ...summary[key]
    }))
    .sort((a, b) => b.statements.pct - a.statements.pct);

  return files.map(file => {
    const status = file.statements.pct >= THRESHOLDS.statements ? '✅' : '❌';
    return `| ${status} | \`${file.name}\` | ${file.statements.pct}% | ${file.branches.pct}% | ${file.functions.pct}% | ${file.lines.pct}% |`;
  }).join('\n');
}

/**
 * Generate coverage badge
 */
function generateCoverageBadge(summary) {
  const percentage = Math.round(summary.total.statements.pct);
  const color = percentage >= 90 ? '4caf50' : percentage >= 70 ? 'ffeb3b' : 'f44336';
  
  const badge = {
    schemaVersion: 1,
    label: 'coverage',
    message: `${percentage}%`,
    color: color
  };

  const badgePath = path.join(REPORTS_DIR, 'coverage-badge.json');
  fs.writeFileSync(badgePath, JSON.stringify(badge, null, 2));
  console.log(`✅ Coverage badge generated: ${badgePath}`);
}

/**
 * Main execution
 */
function main() {
  console.log('🧪 Generating SvelteKit coverage report...');
  
  try {
    ensureCoverageDir();
    const summary = readCoverageSummary();
    
    generateHtmlReport(summary);
    generateJsonReport(summary);
    generateMarkdownReport(summary);
    generateCoverageBadge(summary);
    
    console.log('\n📊 Coverage Summary:');
    console.log(`  Statements: ${summary.total.statements.pct}%`);
    console.log(`  Branches: ${summary.total.branches.pct}%`);
    console.log(`  Functions: ${summary.total.functions.pct}%`);
    console.log(`  Lines: ${summary.total.lines.pct}%`);
    
    const thresholdCheck = checkThresholds(summary.total);
    if (thresholdCheck.overall) {
      console.log('\n✅ All coverage thresholds met!');
    } else {
      console.log('\n⚠️  Some coverage thresholds not met:');
      if (!thresholdCheck.statements) console.log(`  Statements: ${summary.total.statements.pct}% < ${THRESHOLDS.statements}%`);
      if (!thresholdCheck.branches) console.log(`  Branches: ${summary.total.branches.pct}% < ${THRESHOLDS.branches}%`);
      if (!thresholdCheck.functions) console.log(`  Functions: ${summary.total.functions.pct}% < ${THRESHOLDS.functions}%`);
      if (!thresholdCheck.lines) console.log(`  Lines: ${summary.total.lines.pct}% < ${THRESHOLDS.lines}%`);
    }
    
    console.log(`\n📁 Reports available in: ${REPORTS_DIR}`);
    console.log(`🌐 View HTML report: file://${path.join(REPORTS_DIR, 'coverage-report.html')}`);
    
  } catch (error) {
    console.error('❌ Error generating coverage report:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateHtmlReport,
  generateJsonReport,
  generateMarkdownReport,
  generateCoverageBadge,
  checkThresholds
};