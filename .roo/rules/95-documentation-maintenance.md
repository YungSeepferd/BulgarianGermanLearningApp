# Documentation Maintenance Rules

## 📚 Purpose
This document establishes rules for maintaining a clean, organized, and up-to-date documentation structure in the `/docs` directory. The goal is to ensure documentation remains a single source of truth for the project, facilitating onboarding, development, and maintenance.

---

## 📁 Directory Structure

### **/docs**
```
docs/
├── architecture/           # Technical architecture documentation
│   ├── ARCHITECTURE.md     # System architecture overview
│   ├── DATA_ARCHITECTURE.md # Data architecture and schemas
│   ├── UI_ARCHITECTURE.md  # UI component architecture
│   └── API_ARCHITECTURE.md # API design and endpoints (future)
│
├── development/            # Development and contribution guides
│   ├── COMPONENT_GUIDE.md  # Component development guidelines
│   ├── DEVELOPER_ONBOARDING.md # Developer onboarding guide
│   ├── TESTING.md          # Testing strategy and guidelines
│   ├── BEST_PRACTICES.md   # Coding best practices
│   └── ACCESSIBILITY.md    # Accessibility guidelines
│
├── roadmap/                # Project roadmap and planning
│   ├── ROADMAP.md          # High-level project roadmap
│   ├── DETAILED_ROADMAP.md # Detailed implementation roadmap
│   ├── NEXT_PHASE_PLAN.md  # Next phase development plan
│   └── NEXT_STEPS.md       # Immediate next steps
│
├── design/                 # Design and UX documentation
│   ├── DESIGN_CONCEPT.md   # Design concept and strategy
│   ├── STYLE_GUIDE.md      # Visual style guide
│   └── ACCESSIBILITY.md    # Accessibility design guidelines
│
├── migration/              # Migration guides
│   ├── MIGRATION.md        # Migration guide from legacy systems
│   └── VERSION_MIGRATION.md # Version migration guides
│
├── ci-cd/                  # CI/CD and deployment documentation
│   ├── CI_WORKFLOW.md      # CI workflow design
│   ├── QUALITY_GATES.md    # CI quality gates
│   └── DEPLOYMENT.md       # Deployment guide
│
└── archive/                # Archived documentation (read-only)
    └── ...                 # Legacy documentation
```

---

## 📝 File Naming Conventions
- **Primary Documents**: `UPPERCASE.md` (e.g., `ARCHITECTURE.md`, `ROADMAP.md`)
- **Secondary Documents**: `Capitalized.md` (e.g., `DeveloperOnboarding.md`, `ComponentGuide.md`)
- **Specific Topics**: `lowercase-hyphenated.md` (e.g., `data-loading-strategy.md`, `state-management.md`)
- **Prefixes**:
  - `PHASE_`: Implementation phases (e.g., `PHASE_3_DATA_ARCHITECTURE.md`)
  - `STRATEGIC_`: Strategic documents (e.g., `STRATEGIC_ARCHITECTURE.md`)

---

## 🔄 Maintenance Rules

### **1. Single Source of Truth**
- **Rule**: All documentation must be consolidated in `/docs` with no duplicate content.
- **Constraint**: No documentation files outside `/docs` except `README.md` and configuration files.
- **Exception**: Configuration files (e.g., `eslint.config.js`) may contain minimal documentation.

### **2. Root README.md**
- **Rule**: `README.md` in the root directory must contain:
  - Project overview and quick start guide
  - Links to all major documentation in `/docs`
  - Installation and setup instructions
  - Key commands and usage examples
- **Constraint**: Keep root `README.md` concise (max 300 lines).

### **3. Documentation Updates**
- **Rule**: Documentation must be updated **before** or **immediately after** any code change.
- **Constraint**: PRs that modify functionality must include corresponding documentation updates.
- **Rule**: Use GitHub issues to track documentation tasks.

### **4. File Organization**
- **Rule**: Merge related documents rather than creating multiple small files.
- **Constraint**: If a document grows beyond 500 lines, consider splitting it into logical sections within the same file or creating sub-documents in a dedicated subdirectory.
- **Rule**: Use subdirectories to group related documents (e.g., `architecture/`, `development/`).

### **5. Documentation Review**
- **Rule**: Documentation must be reviewed during code reviews.
- **Constraint**: PRs that modify documentation must be reviewed by at least one team member.
- **Rule**: Schedule quarterly documentation reviews to ensure accuracy and completeness.

### **6. Deprecation and Archiving**
- **Rule**: Outdated documentation must be moved to `/docs/archive/` with a deprecation notice.
- **Constraint**: Include a link to the new documentation in the deprecated file.
- **Rule**: Archive directories must be read-only (no modifications).

### **7. Documentation Quality**
- **Rule**: All documentation must be:
  - Clear and concise
  - Free of grammatical errors
  - Well-structured with headings and subheadings
  - Updated with the latest information
- **Constraint**: Use Markdown formatting consistently (tables, code blocks, lists).

### **8. Documentation Ownership**
- **Rule**: Assign documentation owners for each major document.
- **Constraint**: Document owners are responsible for keeping their documents up-to-date.
- **Rule**: Rotate documentation owners annually to ensure fresh perspectives.

---

## 🛠️ Tools and Automation

### **1. Documentation Validation**
- **Tool**: `markdownlint` for Markdown style checking
- **Integration**: Run as part of CI pipeline
- **Configuration**: `.markdownlint.json` in project root

**Example `.markdownlint.json`**:
```json
{
  "default": true,
  "MD013": { "line_length": 120 },
  "MD024": { "siblings_only": true },
  "MD025": { "level": 1 },
  "MD033": { "allowed_elements": ["details", "summary", "br"] },
  "MD041": false
}
```

### **2. Link Checking**
- **Tool**: `lychee` or `markdown-link-check`
- **Integration**: Run monthly via GitHub Actions
- **Configuration**: Check all internal and external links

**Example GitHub Action**:
```yaml
name: Check Documentation Links

on:
  schedule:
    - cron: '0 0 1 * *' # Run on the 1st of every month
  workflow_dispatch:

jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check links in documentation
        uses: lycheeverse/lychee-action@v1
        with:
          args: --verbose --no-progress './docs/**/*.md' './README.md'
          fail: true
```

### **3. Documentation Coverage**
- **Tool**: Custom script to ensure all major features are documented
- **Integration**: Run during CI pipeline
- **Configuration**: Track coverage of features vs. documentation

**Example Coverage Script**:
```javascript
// scripts/check-docs-coverage.js
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

async function checkDocsCoverage() {
  try {
    // Get all documentation files
    const docFiles = await glob('docs/**/*.md');

    // Get all source files (simplified example)
    const sourceFiles = await glob('src/**/*.{svelte,ts}');

    // Analyze documentation coverage
    const coverage = {
      components: new Set(),
      features: new Set(),
      apis: new Set()
    };

    // Extract documented items from documentation
    for (const file of docFiles) {
      const content = await fs.readFile(file, 'utf-8');
      // Simple pattern matching - can be enhanced
      const componentMatches = content.match(/##\s+(.+)\s+Component/g);
      if (componentMatches) {
        componentMatches.forEach(match => {
          const component = match.replace('## ', '').replace(' Component', '');
          coverage.components.add(component);
        });
      }
    }

    // Extract components from source files
    const sourceComponents = new Set();
    for (const file of sourceFiles) {
      if (file.includes('components/')) {
        const componentName = path.basename(file).replace('.svelte', '');
        sourceComponents.add(componentName);
      }
    }

    // Calculate coverage
    const documentedComponents = Array.from(coverage.components);
    const totalComponents = Array.from(sourceComponents);
    const undocumentedComponents = totalComponents.filter(
      comp => !documentedComponents.includes(comp)
    );

    console.log(`Documentation Coverage Report`);
    console.log(`--------------------------------`);
    console.log(`Total components: ${totalComponents.length}`);
    console.log(`Documented components: ${documentedComponents.length}`);
    console.log(`Undocumented components: ${undocumentedComponents.length}`);
    console.log(`Coverage: ${Math.round((documentedComponents.length / totalComponents.length) * 100)}%`);

    if (undocumentedComponents.length > 0) {
      console.log(`\nUndocumented components:`);
      undocumentedComponents.forEach(comp => console.log(`- ${comp}`));
    }

    // Fail if coverage is below threshold
    const MIN_COVERAGE = 80;
    if ((documentedComponents.length / totalComponents.length) * 100 < MIN_COVERAGE) {
      console.error(`\nError: Documentation coverage is below ${MIN_COVERAGE}%`);
      process.exit(1);
    }

    console.log(`\nDocumentation coverage check passed`);
  } catch (error) {
    console.error('Error checking documentation coverage:', error);
    process.exit(1);
  }
}

checkDocsCoverage();
```

---

## 📅 Maintenance Schedule

| Frequency   | Task |
|-------------|------|
| **Daily**   | Update documentation for code changes |
| **Weekly**  | Review documentation for accuracy and completeness |
| **Monthly** | Run link checker and documentation validation |
| **Quarterly** | Full documentation review and reorganization |

---

## 🚀 Enforcement
- **CI Pipeline**: Documentation changes must pass `markdownlint` checks.
- **PR Requirements**: Documentation updates required for all feature changes.
- **Documentation Issues**: Track documentation tasks with GitHub issues.
- **Documentation Owners**: Assign and rotate ownership for major documents.

---

## 📜 Examples

### **Good Documentation Structure**
```
docs/
├── architecture/
│   ├── ARCHITECTURE.md
│   └── DATA_ARCHITECTURE.md
├── development/
│   ├── DEVELOPER_ONBOARDING.md
│   └── TESTING.md
└── roadmap/
    ├── ROADMAP.md
    └── DETAILED_ROADMAP.md
```

### **Bad Documentation Structure**
```
docs/
├── architecture.md
├── architecture-data.md
├── architecture-ui.md
├── developer-onboarding.md
├── testing.md
├── roadmap.md
├── roadmap-detailed.md
└── roadmap-next-phase.md
```

---

## 🔗 Related Documents
- [Coding Standards](/.roo/rules/20-tech-stack.md)
- [Workflow Rules](/.roo/rules/30-workflow.md)
- [Package Manager Rules](/.roo/rules/10-package-manager.md)

---

## 📋 Documentation Checklist

### **New Document Checklist**
- [ ] Document follows naming conventions
- [ ] Document is placed in the correct subdirectory
- [ ] Document has a clear title and purpose
- [ ] Document is well-structured with headings
- [ ] Document includes relevant examples
- [ ] Document is linked from appropriate index files
- [ ] Document has an assigned owner
- [ ] Document passes `markdownlint` checks

### **Document Update Checklist**
- [ ] Changes are accurate and up-to-date
- [ ] Examples are updated if needed
- [ ] Links are working and up-to-date
- [ ] Document structure is maintained
- [ ] Changes are reviewed by at least one team member
- [ ] Document passes `markdownlint` checks

### **Document Review Checklist**
- [ ] Document is clear and easy to understand
- [ ] Document covers all relevant topics
- [ ] Document is free of grammatical errors
- [ ] Document follows style guidelines
- [ ] Document has no broken links
- [ ] Document is properly formatted
- [ ] Document has an assigned owner

---

## 🛑 Deprecation Process

1. **Identify**: Determine that a document is outdated or no longer relevant
2. **Review**: Have at least two team members review the document
3. **Create Replacement**: Create new documentation if needed
4. **Update Links**: Update all references to point to new documentation
5. **Archive**: Move the document to `/docs/archive/`
6. **Add Notice**: Add a deprecation notice at the top of the archived document
7. **Announce**: Announce the deprecation in team communication channels

**Example Deprecation Notice**:
```markdown
# ⚠️ DEPRECATED

This document has been deprecated and moved to the archive. Please refer to the updated documentation:

- [New Documentation](./new-document.md)

Last updated: 2025-12-03
Deprecated: 2025-12-03
```

---

## 📊 Documentation Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Documentation coverage | 90% | Custom script comparing documented vs. implemented features |
| Broken links | 0 | `lychee` or `markdown-link-check` |
| Documentation updates | 100% of PRs | GitHub PR analysis |
| Documentation review completion | 100% | Quarterly review sign-off |
| Documentation quality score | 9/10 | Team survey |

---

## 🎯 Documentation Goals

1. **Completeness**: All major features and components are documented
2. **Accuracy**: Documentation reflects the current state of the codebase
3. **Accessibility**: Documentation is easy to find and understand
4. **Maintainability**: Documentation is easy to update and keep current
5. **Discoverability**: Documentation is well-organized and searchable

---

## 🤝 Team Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Tech Lead** | Ensure documentation aligns with architecture decisions |
| **Developers** | Update documentation with code changes |
| **QA Engineers** | Review documentation for accuracy and completeness |
| **Documentation Lead** | Oversee documentation structure and quality |
| **All Team Members** | Report documentation issues and suggest improvements |

---

## 🆘 Troubleshooting

### **Common Documentation Issues**

**Issue: Documentation is outdated**
- **Solution**: Assign documentation owners and schedule regular reviews
- **Prevention**: Update documentation with code changes

**Issue: Documentation is scattered**
- **Solution**: Consolidate documentation in `/docs` and enforce structure
- **Prevention**: Follow naming conventions and directory structure

**Issue: Documentation is hard to find**
- **Solution**: Improve organization and add search functionality
- **Prevention**: Use consistent naming and link documentation appropriately

**Issue: Documentation is incomplete**
- **Solution**: Identify gaps and create GitHub issues for missing documentation
- **Prevention**: Enforce documentation coverage checks in CI

**Issue: Documentation quality is poor**
- **Solution**: Implement documentation reviews and style guides
- **Prevention**: Use `markdownlint` and enforce quality standards

---

## 🔄 Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | Roo | Initial version |
| YYYY-MM-DD | Name | Description of change |