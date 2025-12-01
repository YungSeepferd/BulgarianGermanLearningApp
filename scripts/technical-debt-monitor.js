#!/usr/bin/env node

/**
 * Technical Debt Monitoring Script
 * 
 * This script monitors ESLint problems and tracks technical debt trends
 * across the codebase. It generates reports and can be integrated into CI/CD.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  eslintPaths: [
    'assets/js/**/*.ts',
    'scripts/**/*.ts'
  ],
  reportPath: './technical-debt-report.json',
  historyPath: './technical-debt-history.json',
  htmlReportPath: './technical-debt-report.html'
};

// Rule categories for better organization
const RULE_CATEGORIES = {
  'Type Safety': [
    '@typescript-eslint/no-explicit-any',
    '@typescript-eslint/no-unsafe-assignment',
    '@typescript-eslint/no-unsafe-return',
    '@typescript-eslint/no-unsafe-call',
    '@typescript-eslint/no-unsafe-member-access',
    '@typescript-eslint/no-unsafe-argument'
  ],
  'Code Quality': [
    '@typescript-eslint/no-unused-vars',
    'no-console',
    'no-debugger',
    'prefer-const'
  ],
  'Best Practices': [
    '@typescript-eslint/no-non-null-assertion',
    '@typescript-eslint/no-unnecessary-condition',
    '@typescript-eslint/no-unnecessary-type-assertion',
    '@typescript-eslint/no-floating-promises',
    '@typescript-eslint/require-await'
  ],
  'Style': [
    'indent',
    'quotes',
    'semi',
    'comma-dangle',
    'object-curly-spacing'
  ]
};

/**
 * Execute ESLint and parse results
 */
function runEslint() {
  try {
    const output = execSync(
      `npx eslint ${CONFIG.eslintPaths.join(' ')} --format=json`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return JSON.parse(output);
  } catch (error) {
    // ESLint returns non-zero exit code when problems are found
    // The output is still available in error.stdout
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (parseError) {
        console.error('Failed to parse ESLint output:', parseError.message);
        return [];
      }
    }
    console.error('ESLint execution failed:', error.message);
    return [];
  }
}

/**
 * Categorize and count problems
 */
function analyzeProblems(eslintResults) {
  const problems = {
    total: 0,
    byCategory: {},
    byRule: {},
    byFile: {},
    severity: { error: 0, warning: 0 }
  };

  // Initialize categories
  Object.keys(RULE_CATEGORIES).forEach(category => {
    problems.byCategory[category] = 0;
  });

  eslintResults.forEach(fileResult => {
    const filePath = fileResult.filePath;
    problems.byFile[filePath] = {
      total: 0,
      byCategory: {},
      byRule: {}
    };

    // Initialize file categories
    Object.keys(RULE_CATEGORIES).forEach(category => {
      problems.byFile[filePath].byCategory[category] = 0;
    });

    fileResult.messages.forEach(message => {
      const ruleId = message.ruleId;
      const severity = message.severity === 2 ? 'error' : 'warning';

      problems.total++;
      problems.severity[severity]++;

      // Count by rule
      problems.byRule[ruleId] = (problems.byRule[ruleId] || 0) + 1;
      problems.byFile[filePath].byRule[ruleId] = 
        (problems.byFile[filePath].byRule[ruleId] || 0) + 1;

      // Count by category
      const category = getCategoryForRule(ruleId);
      if (category) {
        problems.byCategory[category]++;
        problems.byFile[filePath].byCategory[category]++;
      }

      problems.byFile[filePath].total++;
    });
  });

  return problems;
}

/**
 * Get category for a rule
 */
function getCategoryForRule(ruleId) {
  for (const [category, rules] of Object.entries(RULE_CATEGORIES)) {
    if (rules.includes(ruleId)) {
      return category;
    }
  }
  return 'Other';
}

/**
 * Calculate type safety score
 */
function calculateTypeSafetyScore(problems) {
  const typeSafetyIssues = problems.byCategory['Type Safety'] || 0;
  const totalIssues = problems.total;
  
  if (totalIssues === 0) return 100;
  
  // Score is 100 - (percentage of type safety issues)
  const typeSafetyPercentage = (typeSafetyIssues / totalIssues) * 100;
  return Math.max(0, 100 - typeSafetyPercentage);
}

/**
 * Load historical data
 */
function loadHistory() {
  try {
    if (fs.existsSync(CONFIG.historyPath)) {
      return JSON.parse(fs.readFileSync(CONFIG.historyPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not load history file:', error.message);
  }
  return [];
}

/**
 * Save current results to history
 */
function saveToHistory(currentResults) {
  const history = loadHistory();
  
  // Add current results
  history.push({
    timestamp: new Date().toISOString(),
    ...currentResults
  });

  // Keep only last 30 entries
  if (history.length > 30) {
    history.splice(0, history.length - 30);
  }

  try {
    fs.writeFileSync(CONFIG.historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Could not save history:', error.message);
  }
}

/**
 * Generate HTML report
 */
function generateHtmlReport(currentResults, history) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Technical Debt Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #333; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .score-good { color: #28a745; }
        .score-warning { color: #ffc107; }
        .score-danger { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .chart { height: 200px; margin: 20px 0; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Technical Debt Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${currentResults.problems.total}</div>
                <div class="metric-label">Total Problems</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${currentResults.problems.severity.error}">${currentResults.problems.severity.error}</div>
                <div class="metric-label">Errors</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${currentResults.problems.severity.warning}">${currentResults.problems.severity.warning}</div>
                <div class="metric-label">Warnings</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${getScoreClass(currentResults.typeSafetyScore)}">${currentResults.typeSafetyScore.toFixed(1)}%</div>
                <div class="metric-label">Type Safety Score</div>
            </div>
        </div>

        <h2>Problems by Category</h2>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Progress</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(currentResults.problems.byCategory).map(([category, count]) => `
                    <tr>
                        <td>${category}</td>
                        <td>${count}</td>
                        <td>${((count / currentResults.problems.total) * 100).toFixed(1)}%</td>
                        <td>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(count / currentResults.problems.total) * 100}%; background: ${getCategoryColor(category)};"></div>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h2>Top Rules</h2>
        <table>
            <thead>
                <tr>
                    <th>Rule</th>
                    <th>Count</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(currentResults.problems.byRule)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([rule, count]) => `
                        <tr>
                            <td><code>${rule}</code></td>
                            <td>${count}</td>
                            <td>${getCategoryForRule(rule)}</td>
                        </tr>
                    `).join('')}
            </tbody>
        </table>

        ${history.length > 1 ? `
        <h2>Trend Analysis (Last 10 Reports)</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Errors</th>
                    <th>Type Safety Score</th>
                </tr>
            </thead>
            <tbody>
                ${history.slice(-10).reverse().map(entry => `
                    <tr>
                        <td>${new Date(entry.timestamp).toLocaleDateString()}</td>
                        <td>${entry.problems.total}</td>
                        <td>${entry.problems.severity.error}</td>
                        <td class="${getScoreClass(entry.typeSafetyScore)}">${entry.typeSafetyScore.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
    </div>

    <script>
        // Add interactive features
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Technical Debt Report loaded');
        });
    </script>
</body>
</html>`;

  try {
    fs.writeFileSync(CONFIG.htmlReportPath, html);
    console.log(`HTML report generated: ${CONFIG.htmlReportPath}`);
  } catch (error) {
    console.error('Could not generate HTML report:', error.message);
  }
}

/**
 * Helper functions for styling
 */
function getScoreClass(score) {
  if (score >= 80) return 'score-good';
  if (score >= 60) return 'score-warning';
  return 'score-danger';
}

function getCategoryColor(category) {
  const colors = {
    'Type Safety': '#dc3545',
    'Code Quality': '#ffc107',
    'Best Practices': '#17a2b8',
    'Style': '#28a745',
    'Other': '#6c757d'
  };
  return colors[category] || '#6c757d';
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Running Technical Debt Monitor...\n');

  // Run ESLint
  console.log('📊 Analyzing ESLint results...');
  const eslintResults = runEslint();
  
  // Analyze problems
  const problems = analyzeProblems(eslintResults);
  const typeSafetyScore = calculateTypeSafetyScore(problems);
  
  const currentResults = {
    problems,
    typeSafetyScore,
    summary: {
      totalFiles: eslintResults.length,
      totalProblems: problems.total,
      errorCount: problems.severity.error,
      warningCount: problems.severity.warning,
      typeSafetyScore: typeSafetyScore.toFixed(1)
    }
  };

  // Display summary
  console.log('\n📈 Summary:');
  console.log(`   Total Files: ${currentResults.summary.totalFiles}`);
  console.log(`   Total Problems: ${currentResults.summary.totalProblems}`);
  console.log(`   Errors: ${currentResults.summary.errorCount}`);
  console.log(`   Warnings: ${currentResults.summary.warningCount}`);
  console.log(`   Type Safety Score: ${currentResults.summary.typeSafetyScore}%`);

  // Display top categories
  console.log('\n📂 Problems by Category:');
  Object.entries(problems.byCategory)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percentage = ((count / problems.total) * 100).toFixed(1);
      console.log(`   ${category}: ${count} (${percentage}%)`);
    });

  // Save to history
  console.log('\n💾 Saving results...');
  saveToHistory(currentResults);

  // Generate HTML report
  const history = loadHistory();
  generateHtmlReport(currentResults, history);

  // Save JSON report
  try {
    fs.writeFileSync(CONFIG.reportPath, JSON.stringify(currentResults, null, 2));
    console.log(`📄 JSON report saved: ${CONFIG.reportPath}`);
  } catch (error) {
    console.error('Could not save JSON report:', error.message);
  }

  console.log('\n✅ Technical debt monitoring complete!');
  
  // Exit with error code if there are errors
  if (problems.severity.error > 0) {
    console.log(`\n⚠️  Found ${problems.severity.error} error(s) that should be addressed.`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  runEslint,
  analyzeProblems,
  calculateTypeSafetyScore,
  main
};