#!/usr/bin/env node

/**
 * Generate Weekly Report Script
 * 
 * This script generates a weekly technical debt report and creates/updates a GitHub issue.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Get repository info from environment
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER;
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];

if (!repoOwner || !repoName) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Helper function to get category for rule
function getCategoryForRule(ruleId) {
  const categories = {
    'Type Safety': ['@typescript-eslint/no-explicit-any', '@typescript-eslint/no-unsafe-assignment', '@typescript-eslint/no-unsafe-return', '@typescript-eslint/no-unsafe-call', '@typescript-eslint/no-unsafe-member-access', '@typescript-eslint/no-unsafe-argument'],
    'Code Quality': ['@typescript-eslint/no-unused-vars', 'no-console', 'no-debugger', 'prefer-const'],
    'Best Practices': ['@typescript-eslint/no-non-null-assertion', '@typescript-eslint/no-unnecessary-condition', '@typescript-eslint/no-unnecessary-type-assertion', '@typescript-eslint/no-floating-promises', '@typescript-eslint/require-await'],
    'Style': ['indent', 'quotes', 'semi', 'comma-dangle', 'object-curly-spacing']
  };
  
  for (const [category, rules] of Object.entries(categories)) {
    if (rules.includes(ruleId)) {
      return category;
    }
  }
  return 'Other';
}

try {
  const report = JSON.parse(fs.readFileSync('technical-debt-report.json', 'utf8'));
  const locCount = fs.readFileSync('loc-count.txt', 'utf8');
  const { problems, typeSafetyScore, summary } = report;
  
  // Extract total lines of code
  const locMatch = locCount.match(/total\s+(\d+)/);
  const totalLines = locMatch ? locMatch[1] : 'Unknown';
  
  const issueTitle = `📊 Weekly Technical Debt Report - ${new Date().toLocaleDateString()}`;
  const issueBody = `# Weekly Technical Debt Report

**Generated on:** ${new Date().toLocaleDateString()}

## 📈 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Files Analyzed | ${summary.totalFiles} | 📁 |
| Total Problems | ${summary.totalProblems} | ${summary.errorCount > 500 ? '🚨' : summary.errorCount > 100 ? '⚠️' : '✅'} |
| Errors | ${summary.errorCount} | ${summary.errorCount > 500 ? '🚨' : summary.errorCount > 100 ? '⚠️' : '✅'} |
| Warnings | ${summary.warningCount} | ℹ️ |
| Type Safety Score | ${summary.typeSafetyScore}% | ${typeSafetyScore < 50 ? '🚨' : typeSafetyScore < 70 ? '⚠️' : '✅'} |
| Lines of Code | ${totalLines} | 📏 |

## 📂 Problem Breakdown

### By Category
${Object.entries(problems.byCategory)
  .sort(([,a], [,b]) => b - a)
  .map(([category, count]) => {
    const percentage = ((count / problems.total) * 100).toFixed(1);
    const status = count > 100 ? '🚨' : count > 50 ? '⚠️' : '✅';
    return `${status} **${category}**: ${count} (${percentage}%)`;
  }).join('\n')}

### Top 10 Problematic Rules
${Object.entries(problems.byRule)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([rule, count], index) => {
    const category = getCategoryForRule(rule);
    return `${index + 1}. \`${rule}\` - ${count} issues (${category})`;
  }).join('\n')}

## 🎯 Recommendations

${typeSafetyScore < 50 ? `
### 🚨 High Priority
- Type safety score is critically low. Focus on:
  - Replacing \`any\` types with proper TypeScript types
  - Adding type annotations where inference fails
  - Enabling stricter TypeScript compiler options
` : ''}

${summary.errorCount > 500 ? `
### ⚠️ Medium Priority
- Error count is high. Consider:
  - Addressing the most frequent rule violations first
  - Setting up automated fixes for simple issues
  - Creating sprint goals for reducing technical debt
` : ''}

### 📋 Next Steps
1. Review the full technical debt report
2. Prioritize fixes based on impact and effort
3. Update development guidelines to prevent future issues
4. Schedule regular technical debt reduction sessions

---
*This report is automatically generated weekly. For detailed analysis, check the technical debt monitoring workflow.*`;

  // Check if weekly report issue already exists
  try {
    const existingIssues = execSync(
      `gh issue list --repo ${repoOwner}/${repoName} --label "weekly-report,technical-debt" --state open --json number,title`,
      { encoding: 'utf8' }
    );
    
    const issues = JSON.parse(existingIssues);
    
    if (issues.length > 0) {
      // Update existing issue
      const issueNumber = issues[0].number;
      execSync(
        `gh issue edit ${issueNumber} --repo ${repoOwner}/${repoName} --title "${issueTitle}" --body "${issueBody.replace(/"/g, '\\"')}"`,
        { stdio: 'inherit' }
      );
      console.log('✅ Updated existing weekly report issue');
    } else {
      // Create new issue
      execSync(
        `gh issue create --repo ${repoOwner}/${repoName} --title "${issueTitle}" --body "${issueBody.replace(/"/g, '\\"')}" --label "weekly-report,technical-debt"`,
        { stdio: 'inherit' }
      );
      console.log('✅ Created new weekly report issue');
    }
  } catch (error) {
    console.error('Failed to create/update weekly report issue:', error.message);
    process.exit(1);
  }
  
} catch (error) {
  console.error('Failed to generate weekly report:', error.message);
  process.exit(1);
}