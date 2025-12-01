#!/usr/bin/env node

/**
 * Generate PR Comment Script
 * 
 * This script generates a technical debt summary comment for pull requests.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Get PR number from environment (set by GitHub Actions)
const prNumber = process.env.PR_NUMBER;
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER;
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];

if (!prNumber || !repoOwner || !repoName) {
  console.error('Missing required environment variables');
  process.exit(1);
}

try {
  const report = JSON.parse(fs.readFileSync('technical-debt-report.json', 'utf8'));
  const { problems, typeSafetyScore, summary } = report;
  
  const comment = `## 🔍 Technical Debt Report

**Summary:**
- 📁 Total Files: ${summary.totalFiles}
- 🚨 Total Problems: ${summary.totalProblems}
- ❌ Errors: ${summary.errorCount}
- ⚠️ Warnings: ${summary.warningCount}
- 📊 Type Safety Score: ${summary.typeSafetyScore}%

**Problems by Category:**
${Object.entries(problems.byCategory)
  .sort(([,a], [,b]) => b - a)
  .map(([category, count]) => {
    const percentage = ((count / problems.total) * 100).toFixed(1);
    return `- ${category}: ${count} (${percentage}%)`;
  }).join('\n')}

**Top Issues:**
${Object.entries(problems.byRule)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([rule, count]) => `- \`${rule}\`: ${count}`).join('\n')}

${typeSafetyScore < 50 ? '⚠️ **Type safety score is below 50%. Consider addressing type safety issues.**' : ''}
${summary.errorCount > 100 ? '🚨 **High error count detected. Immediate attention recommended.**' : ''}`;

  // Use GitHub CLI to create comment
  execSync(`gh issue comment ${prNumber} --repo ${repoOwner}/${repoName} --body "${comment.replace(/"/g, '\\"')}"`, {
    stdio: 'inherit'
  });
  
  console.log('✅ PR comment created successfully');
} catch (error) {
  console.error('Failed to generate PR comment:', error.message);
  process.exit(1);
}