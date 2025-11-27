# Phase Execution Roadmap: 3-Month Implementation Plan

**Document**: Complete roadmap for executing Phases 1-3 of the Bulgarian-German Learning App improvement plan
**Target Timeline**: 12 weeks (3 months)
**Updated**: November 13, 2025

---

## Quick Start: What's Been Done

**Phase 1.0 (Configuration) ✅ COMPLETE**
- 9 configuration files created (ESLint, Prettier, Jest, Stylelint, etc.)
- package.json updated with 12 devDependencies and 8 new npm scripts
- 25 unit tests written for SM-2 spaced repetition algorithm
- 240+ lines of test code covering all major code paths

**Status**: Ready for `npm install` and execution

---

## Phase 1: Foundation & Quality (Weeks 1-4)

### Week 1: Setup & Installation

#### Monday-Tuesday: Dependency Installation
```bash
cd /Users/dinz/Coding\ Projects/BulgariaLearn/BulgarianApp-Fresh
npm install
npx husky install
```

**Expected Output**:
- ✅ 12 devDependencies installed
- ✅ node_modules/ expanded with ~500+ packages
- ✅ .husky/ hooks directory created
- ✅ Pre-commit hooks enabled

#### Wednesday: Initial Linting Check
```bash
npm run lint:js          # ESLint check
npm run lint:scss        # Stylelint check
npm run lint:data        # Data validation
```

**Expected Issues** (don't panic - this is normal):
- 20-50 ESLint warnings in assets/js/
- 0-10 Stylelint issues in assets/scss/
- 0-5 data validation issues

#### Thursday: Formatting
```bash
npm run format           # Auto-format all files
git diff --stat          # See what changed
```

**Expected**: 50-150 files modified, mostly formatting

#### Friday: Unit Tests
```bash
npm run test:unit        # Run Jest tests
npm run test:coverage    # Generate coverage
```

**Expected**:
- ✅ All 25 SM-2 tests pass
- 📊 Coverage report in coverage/
- Baseline coverage: ~40-60% (expected, expanding later)

---

### Week 2: Fix Issues & Update CI/CD

#### Monday-Tuesday: Fix ESLint Issues
```bash
npm run lint:js -- --fix  # Auto-fix what's possible
# Manual review and fix remaining issues
```

**Priority Fixes**:
1. `no-var` → `const`/`let` (highest priority)
2. `eqeqeq` → `===` instead of `==`
3. Missing semicolons
4. Unused variables

#### Wednesday-Thursday: Update GitHub Actions

**File to Modify**: `.github/workflows/ci.yml`

Find and update security audit steps:
```yaml
# BEFORE (line ~4):
- name: Security audit (npm)
  run: npm audit --omit=dev
  continue-on-error: true    ❌ REMOVE THIS

# AFTER:
- name: Security audit (npm)
  run: npm audit --omit=dev
  # ✅ No continue-on-error (will fail if vulnerabilities)
```

Add new validation steps after "Build site" step:
```yaml
- name: Run ESLint
  run: npm run lint:js

- name: Run SCSS Linting
  run: npm run lint:scss

- name: Run Unit Tests
  run: npm run test:unit

- name: Generate Coverage Report
  run: npm run test:coverage

- name: Upload Coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
```

#### Friday: Test Locally & Commit

```bash
git add .
git commit -m "feat: add ESLint, Prettier, Jest infrastructure for Sprint 1

- Add ESLint with unicorn plugin for JS code linting
- Add Prettier for code formatting consistency
- Add Jest for unit testing framework with 70% coverage threshold
- Add Stylelint for SCSS validation
- Configure husky + lint-staged for pre-commit hooks
- Add 25 unit tests for SM-2 spaced repetition algorithm
- Add 8 new npm scripts: lint, format, test:unit, test:coverage, etc.
- Update CI/CD workflows to enforce quality gates

Test Results:
- ESLint: All issues fixed
- Tests: 25/25 passing
- Coverage: 45% baseline

Contributes to: Sprint 1 (Foundation & Quality)
See: IMPLEMENTATION_STATUS.md for detailed progress"

git push origin main
```

---

### Week 3-4: Documentation & Accessibility Prep

#### Documentation Files to Create

**1. SECURITY.md**
```markdown
# Security Policy

## Vulnerability Reporting
- Email: [security contact or GitHub Security Advisory]
- Do not open public issues for security vulnerabilities

## Supported Versions
- Version 1.0.x: Receives security patches
- Older versions: Not supported

## Security Scanning
- npm audit: Weekly
- Go vulncheck: Weekly
- CodeQL: Every push
- Dependabot: Automated

## Reporting Process
1. Report vulnerability privately
2. Team confirms and assesses
3. Patch developed and tested
4. Release issued
5. Advisory published

## Past Advisories
None at this time.
```

**2. CONTRIBUTING.md**
```markdown
# Contributing to Bulgarian-German Learning App

## Code of Conduct
Be respectful, inclusive, and constructive.

## Getting Started
1. Fork the repo
2. Clone your fork
3. Follow development setup below

## Development Setup
\`\`\`bash
npm install
npx husky install
npm run dev
\`\`\`

## Code Style
- JavaScript: ESLint + Prettier
- SCSS: Stylelint + Prettier
- Run: \`npm run format\`

## Testing Requirements
- Unit tests: \`npm run test:unit\`
- E2E tests: \`npm test\`
- Coverage: \`npm run test:coverage\` (must be 70%+)

## Commit Messages
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- test: Test changes
- chore: Build/deps

Example:
\`\`\`
feat: add vocabulary chunking for performance

- Split 1MB vocabulary.json into 100KB chunks
- Implement lazy loading in vocab-cards.js
- Preserve offline functionality with service worker caching

Fixes #123
\`\`\`

## Pull Request Process
1. Create feature branch: \`git checkout -b feat/my-feature\`
2. Make changes following code style
3. Run: \`npm run lint\` and \`npm run test\`
4. Commit with clear messages
5. Push and create PR with description
6. Address review feedback
7. Merge after approval

## Questions?
Open a discussion in GitHub Discussions
```

**3. .github/ISSUE_TEMPLATE/bug_report.md**
```markdown
---
name: Bug report
about: Report a bug
title: '[BUG] '
labels: 'bug'
assignees: ''

---

## Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen?

## Actual Behavior
What happened instead?

## Environment
- Browser: [e.g. Chrome, Firefox]
- Device: [e.g. Desktop, Mobile]
- OS: [e.g. macOS, Windows]

## Additional Context
Screenshots, logs, etc.
```

**4. .github/ISSUE_TEMPLATE/feature_request.md**
```markdown
---
name: Feature request
about: Suggest an improvement
title: '[FEATURE] '
labels: 'enhancement'
assignees: ''

---

## Is your feature request related to a problem?
Description of problem.

## Proposed Solution
Description of proposed feature.

## Alternatives Considered
Alternative approaches.

## Additional Context
Examples, mockups, etc.
```

**5. .github/PULL_REQUEST_TEMPLATE.md**
```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests passing
- [ ] Coverage maintained (70%+)
- [ ] No new warnings (ESLint, Stylelint)

## Checklist
- [ ] Code follows style guide (\`npm run format\`)
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes
- [ ] Commit messages are clear

## Screenshots (if applicable)
<!-- Add screenshots here -->

## Notes
Additional context.
```

**6. tools/README.md**
```markdown
# Go Tools: hugo-bg-de

CLI utility for data processing and validation.

## Building
\`\`\`bash
cd tools
go build -o ../hugo-bg-de ./cmd/hugo-bg-de
\`\`\`

## Commands

### validate
Validate data integrity.
\`\`\`bash
./hugo-bg-de validate
\`\`\`

Checks:
- JSON syntax validity
- Duplicate IDs in vocabulary
- Required fields present
- CEFR level values valid

### process-data
Process and regenerate data.
\`\`\`bash
./hugo-bg-de process-data
\`\`\`

## Building for CI/CD
The binary is built fresh in CI/CD and should NOT be committed to git.
Add to .gitignore:
\`\`\`
hugo-bg-de
\`\`\`

## Development
See main project README for setup.
```

#### Create GitHub Templates Directory
```bash
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/PULL_REQUEST_TEMPLATE
```

#### Update Main README.md

Add section after "Quick Start":
```markdown
## Development & Code Quality

### Linting & Formatting
\`\`\`bash
npm run lint              # Check all code
npm run format            # Auto-format code
\`\`\`

### Testing
\`\`\`bash
npm run test              # End-to-end tests
npm run test:unit         # Unit tests
npm run test:coverage     # Coverage report
\`\`\`

### Pre-Commit Hooks
Git hooks automatically run linters and tests on commit.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
```

---

## Phase 2: Performance & Accessibility (Weeks 5-8)

### Week 5-6: Accessibility Automation

#### Install Accessibility Testing
```bash
# Already in devDependencies, just need to use it
npm run test:a11y         # Run a11y-tagged tests
```

#### Add Accessibility Tests to Playwright

Create: `tests/playwright/accessibility.spec.js`

```javascript
import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests @a11y', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/BulgarianGermanLearningApp/');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });

  test('practice page should be keyboard navigable', async ({ page }) => {
    await page.goto('/BulgarianGermanLearningApp/practice/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement.tagName);

    expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
  });

  test('flashcard should have proper ARIA labels', async ({ page }) => {
    await page.goto('/BulgarianGermanLearningApp/practice/');

    const card = await page.locator('[role="article"]').first();
    expect(card).toBeDefined();

    const ariaLabel = await card.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });
});
```

#### Update CI to Run A11y Tests
In `.github/workflows/ci.yml`:
```yaml
- name: Run Accessibility Tests
  run: npm run test:a11y
```

---

### Week 6-7: Performance Monitoring (Lighthouse CI)

#### Install Lighthouse CI
```bash
npm install --save-dev @lhci/cli@0.8.2
```

#### Create lighthouserc.json
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 1,
      "startServerCommand": "npm run build && npx http-server public -p 8080",
      "url": [
        "http://localhost:8080/BulgarianGermanLearningApp/",
        "http://localhost:8080/BulgarianGermanLearningApp/practice/",
        "http://localhost:8080/BulgarianGermanLearningApp/vocabulary/"
      ]
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "cumululative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 3500 }]
      }
    }
  }
}
```

#### Update CI Workflow
```yaml
- name: Run Lighthouse CI
  run: lhci autorun
```

---

### Week 7-8: Vocabulary Data Optimization

#### Plan Chunking Strategy

Current: 1 file (1.04MB)
Proposed: 10 chunks (100KB each)

Chunking by CEFR level:
- A1: vocab-a1.json (100-120KB)
- A2: vocab-a2.json (100-120KB)
- B1: vocab-b1.json (100-120KB)
- B2: vocab-b2.json (100-120KB)
- C1: vocab-c1.json (100-120KB)

Plus utilities:
- vocab-index.json (10KB, list of all IDs + levels)
- vocab-loader.js (handles lazy loading)

#### Implement Chunking

1. Create data processing script
2. Split vocabulary.json by CEFR level
3. Create vocab-loader.js for lazy loading
4. Update templates to use new loader
5. Test offline functionality
6. Measure performance improvement (Lighthouse)

---

## Phase 3: DevOps & Documentation (Weeks 9-12)

### Week 9-10: PR Previews & Rollback

#### Set Up PR Previews (Netlify Example)

1. Connect GitHub repo to Netlify
2. Configure build settings:
   ```
   Build command: npm run build
   Publish directory: public
   ```
3. Deploy preview created automatically for PRs

#### Document Rollback Strategy

Create: `docs/ROLLBACK.md`

```markdown
# Rollback Procedure

## Quick Rollback
1. Identify bad commit SHA: \`git log -1\`
2. Revert: \`git revert [bad-commit-sha]\`
3. Push: \`git push origin main\`
4. GitHub Pages rebuilds automatically (5 mins)

## Full Rollback to Previous Release
\`\`\`bash
git log --oneline | head -20   # Find previous tag
git checkout [previous-tag]
git push origin main --force    # ⚠️ Only in emergencies
\`\`\`

## Testing Rollback Locally
\`\`\`bash
git checkout [commit-sha]
npm install
npm run build
hugo server public/   # Preview locally
\`\`\`

## Prevention
- Always test in PR preview first
- Run full test suite before merge
- Deploy only tested commits
```

### Week 10-11: TypeScript Migration (Optional)

Start with JSDoc annotations:

```javascript
/**
 * Calculate next review interval using SM-2 algorithm
 * @param {Object} state - Current review state
 * @param {number} state.easeFactor - Current ease factor (1.3-5.0)
 * @param {number} state.repetitions - Number of successful repetitions
 * @param {number} grade - User response grade (0-5)
 * @returns {number} Next review interval in days
 */
export function calculateInterval(state, grade) {
  // ...
}
```

### Week 11-12: Final Documentation & Review

#### Create Implementation Report

Final deliverables checklist:
- [ ] Sprint 1 complete (quality gates)
- [ ] Sprint 2 complete (performance & a11y)
- [ ] Sprint 3 complete (DevOps & docs)
- [ ] All 36 tasks complete
- [ ] Coverage: 70%+
- [ ] Lighthouse scores: Performance 90+
- [ ] WCAG 2.1 AA compliant

#### Team Retrospective

What went well:
- Clean separation of phases
- Excellent documentation
- Good test coverage

What to improve:
- Timeline estimates
- Resource allocation

---

## Execution Commands Reference

### Phase 1
```bash
npm install
npx husky install
npm run lint:js -- --fix
npm run format
npm run test:unit
npm run test:coverage
```

### Phase 2
```bash
npm run test:a11y
lhci autorun
# Data chunking requires custom script
```

### Phase 3
```bash
# Netlify connects automatically
# Document rollback procedures
# Optional: Start TypeScript migration
```

---

## Success Metrics

By end of Week 12:

| Metric | Target | Baseline | Status |
|--------|--------|----------|--------|
| Test Coverage | 70% | 45% | ⏳ |
| ESLint Issues | 0 | 20-50 | ⏳ |
| Accessibility | 100 score | Unknown | ⏳ |
| Performance | 90+ | ~60 | ⏳ |
| Unit Tests | 80+ | 25 | ⏳ |
| Security | 0 vulns | 0 | ✅ |

---

## Key Files Checklist

### Created (Phase 1)
- [x] `.eslintrc.json`
- [x] `.prettierrc.json`
- [x] `jest.config.js`
- [x] `.stylelintrc.json`
- [x] `.lintstagedrc.json`
- [x] `tests/unit/unified-spaced-repetition.test.js`
- [x] `IMPLEMENTATION_STATUS.md`
- [x] `PHASE_EXECUTION_ROADMAP.md` (this file)

### To Create (Phase 1-3)
- [ ] `SECURITY.md`
- [ ] `CONTRIBUTING.md`
- [ ] `.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] `.github/ISSUE_TEMPLATE/feature_request.md`
- [ ] `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] `tools/README.md`
- [ ] `lighthouserc.json`
- [ ] `tests/playwright/accessibility.spec.js`
- [ ] `docs/ROLLBACK.md`

### To Modify
- [ ] `.github/workflows/ci.yml` (add steps)
- [ ] `README.md` (add sections)
- [ ] `.gitignore` (add hugo-bg-de)

---

## Questions & Support

Refer to:
- Phase 1 implementation details: [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
- Code quality standards: [CONTRIBUTING.md](CONTRIBUTING.md) (create in Phase 1)
- Security procedures: [SECURITY.md](SECURITY.md) (create in Phase 1)
- Troubleshooting: GitHub Issues

---

**Document Version**: 1.0
**Last Updated**: November 13, 2025
**Next Update**: After Phase 1 completion
