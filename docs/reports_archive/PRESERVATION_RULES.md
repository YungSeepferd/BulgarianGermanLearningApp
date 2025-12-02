# Preservation Rules for Root-Level Files

## Overview

This document defines which files should remain in the root directory versus which should be archived. These rules ensure that essential configuration and active development files stay accessible while historical reports and completed analysis are properly archived.

## Files to Preserve in Root Directory

### Configuration Files (Essential - Keep in Root)
These files are required for the development environment and build processes:

```
.eslintrc.json          # ESLint configuration
.gitignore             # Git ignore rules
.gitmodules            # Git submodules configuration
.lintstagedrc.json     # Lint-staged configuration
.mcp.json              # MCP server configuration
.prettierignore        # Prettier ignore rules
.prettierrc.json       # Prettier configuration
.stylelintrc.json      # Stylelint configuration
.tsbuildinfo           # TypeScript build information
jest.config.js         # Jest testing configuration
lighthouserc.js        # Lighthouse CI configuration
package-lock.json      # NPM dependency lock file
package.json           # NPM package configuration
playwright.config.js   # Playwright testing configuration
tsconfig.json          # TypeScript configuration
vscode-settings.json   # VS Code settings
workbox-config.js      # Workbox PWA configuration
```

### Core Documentation (Essential - Keep in Root)
These files provide essential project information and should remain easily accessible:

```
README.md              # Main project documentation
CONTRIBUTING.md        # Contribution guidelines
SECURITY.md            # Security policy and reporting
```

### Build and Setup Scripts (Essential - Keep in Root)
These scripts are used for project setup and building:

```
build.sh               # Main build script
setup.sh               # Project setup script
```

### Static Assets (Essential - Keep in Root)
These files serve specific technical purposes:

```
404.html               # Custom 404 error page
```

## Files to Archive

### Technical Reports (Archive - Move to docs/reports_archive/)
These are analysis and reporting documents that are valuable for reference but not needed in daily development:

```
technical-debt-report.json          # → docs/reports_archive/audit/
technical-debt-report.html          # → docs/reports_archive/audit/
technical-debt-history.json         # → docs/reports_archive/audit/
validation-summary.md               # → docs/reports_archive/audit/
ci-simulation-results.json          # → docs/reports_archive/deployment/
dependency-validation-results.json  # → docs/reports_archive/deployment/
diagnostic-report.md                # → docs/reports_archive/deployment/
final-remediation-plan.md           # → docs/reports_archive/remediation/
remediation-plan.md                 # → docs/reports_archive/remediation/
implementation-summary.md           # → docs/reports_archive/remediation/
build-process-optimization.md       # → docs/reports_archive/architecture/
configuration-updates.md            # → docs/reports_archive/architecture/
optimized-sveltekit-structure.md    # → docs/reports_archive/architecture/
path-mapping-strategy.md            # → docs/reports_archive/architecture/
data-migration-strategy.md          # → docs/reports_archive/migration/
dependency-resolution-implementation.md # → docs/reports_archive/migration/
CLEANUP_SUMMARY.md                  # → docs/reports_archive/project-management/
```

## Decision Criteria

### Keep in Root If:
1. **Active Development Use**: File is referenced or used in daily development workflows
2. **Build Process Required**: File is essential for building, testing, or deploying the application
3. **Configuration Management**: File contains active configuration that may need frequent updates
4. **Team Accessibility**: File needs to be immediately visible and accessible to all team members
5. **External Tool Integration**: File is required by external tools (CI/CD, IDEs, linters, etc.)

### Archive If:
1. **Historical Reference**: File documents completed analysis, past issues, or historical decisions
2. **Infrequent Access**: File is referenced occasionally for reference but not daily use
3. **Project Phase Completion**: File relates to a completed project phase or initiative
4. **Documentation Nature**: File is primarily documentation rather than configuration or code
5. **Large Volume**: File contributes to root directory clutter without providing immediate value

## Special Cases and Exceptions

### Development Tool Configurations
- **Keep in Root**: IDE settings, linting configs, build tool configs
- **Archive**: Development process documentation, tool usage guides

### Documentation
- **Keep in Root**: Core project docs (README, CONTRIBUTING, SECURITY)
- **Archive**: Technical reports, analysis documents, implementation plans

### Scripts
- **Keep in Root**: Active build/deploy/setup scripts
- **Archive**: One-time utility scripts, analysis tools, migration scripts

### Data Files
- **Keep in Root**: Active configuration data, environment templates
- **Archive**: Historical analysis data, report outputs, diagnostic results

## Maintenance Guidelines

### Regular Review Schedule
- **Monthly**: Review new files added to root for archival candidates
- **Quarterly**: Assess archived files for continued relevance
- **Annually**: Evaluate preservation rules effectiveness

### Archival Process
1. **Identify**: New report files or analysis documents in root
2. **Categorize**: Determine appropriate archive category
3. **Migrate**: Use `git mv` to preserve history
4. **Document**: Update archive README files
5. **Verify**: Ensure accessibility and functionality

### Quality Assurance
- **Accessibility**: Ensure archived files remain easily accessible
- **Organization**: Maintain logical categorization structure
- **Documentation**: Keep archive documentation up to date
- **History**: Preserve Git history through proper migration

## Benefits of This Approach

### 1. Improved Developer Experience
- Cleaner root directory reduces cognitive load
- Essential files remain immediately accessible
- Faster navigation and file discovery

### 2. Better Organization
- Logical separation of active vs. historical files
- Consistent categorization system
- Scalable structure for future growth

### 3. Maintained Accessibility
- All files remain accessible through organized structure
- Clear navigation via README files
- Preserved Git history for traceability

### 4. Enhanced Maintainability
- Clear criteria for future file placement decisions
- Reduced clutter in version control
- Improved project structure comprehension

## Risk Mitigation

### Data Loss Prevention
- All migrations use `git mv` to preserve file history
- Comprehensive backup before major changes
- Verification steps after each migration

### Accessibility Maintenance
- Archive structure with clear navigation
- All files maintain original content and formatting
- Logical categorization aids discovery

### Future Compatibility
- Scalable rules accommodate new file types
- Clear criteria support automated decisions
- Flexible structure adapts to project evolution

## Review and Updates

### Periodic Review
- **Frequency**: Quarterly review of preservation rules
- **Participants**: Development team and project stakeholders
- **Focus**: Effectiveness of current rules and identification of improvements

### Rule Updates
- **Documentation**: Update this file when rules change
- **Communication**: Notify team of significant rule changes
- **Training**: Ensure team understands preservation criteria

### Feedback Integration
- **Team Input**: Collect feedback on file organization
- **Usage Analytics**: Monitor file access patterns
- **Continuous Improvement**: Adjust rules based on experience

This preservation rules framework ensures that the root directory remains focused on active development while maintaining access to valuable historical documentation through a well-organized archive structure.