# Contributing to Bulgarian-German Learning App

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We're building this together!

## Getting Started

### Prerequisites
- Node.js 20+
- Go 1.23+
- Hugo Extended 0.128.0+
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   gh repo fork YungSeepferd/BulgarianGermanLearningApp --clone
   cd BulgarianGermanLearningApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   npx husky install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Verify setup** (should all pass)
   ```bash
   npm run lint
   npm run test:unit
   npm test
   ```

## Code Style & Quality

### JavaScript/SCSS
Follow these standards:
- **Linting**: ESLint + unicorn plugin
- **Formatting**: Prettier
- **SCSS**: Stylelint + standard config
- **Enforcement**: Pre-commit hooks (automatic)

### Run Locally
```bash
npm run lint              # Check for issues
npm run format            # Auto-fix formatting
npm run lint:js -- --fix  # Auto-fix ESLint issues
```

### Key Rules
- Semicolons required
- Single quotes for strings
- 100-character line limit
- 2-space indentation
- const/let (no var)
- === instead of ==

## Testing Requirements

### Unit Tests
```bash
npm run test:unit         # Run Jest unit tests
npm run test:unit:watch   # Watch mode
npm run test:coverage     # Generate coverage report
```

**Coverage Requirements**:
- Minimum: 70% (branches, functions, lines, statements)
- Target: 80%+
- Critical paths: 90%+

### End-to-End Tests
```bash
npm test                  # Run Playwright tests
npm run test:ui           # Interactive UI
npm run test:debug        # Debug mode
```

### Manual Testing
1. Start dev server: `npm run dev`
2. Test in browsers (Chrome, Firefox, Safari)
3. Test on mobile (360px width minimum)
4. Test offline (disable network)
5. Verify keyboard shortcuts work

## Commit Messages

Use clear, descriptive commit messages following this format:

```
type(scope): subject

body (if needed)

Closes #123
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (Prettier, ESLint)
- `test`: Test changes
- `chore`: Build, deps, tooling
- `refactor`: Code reorganization (no logic change)

### Examples
```
feat(vocabulary): add search filtering

Users can now filter vocabulary by CEFR level.
Implements #456.

docs(readme): update installation instructions

style: apply prettier formatting

test(spaced-repetition): add edge case tests

fix(flashcards): resolve card flip animation

Closes #789.
```

## Pull Request Process

### Before Creating PR
1. **Create feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** following code style above

3. **Run checks locally**
   ```bash
   npm run lint              # Must pass
   npm run format            # Run before committing
   npm run test:unit         # Must pass
   npm test                  # Must pass (if modified E2E)
   npm run build             # Must succeed
   ```

4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat(scope): clear description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feat/your-feature-name
   ```

### Creating the PR
1. Open PR on GitHub with descriptive title
2. Fill out the PR template completely:
   - Describe changes clearly
   - Link related issues
   - Include testing details
   - List any breaking changes
3. Wait for CI to complete (all checks must pass)
4. Request review from maintainers
5. Address feedback in new commits (don't rebase)

### Review Process
- At least one approval required
- All CI checks must pass
- All conversations must be resolved
- Commit history should be clean
- No direct commits to main allowed

### Merging
- Squash commits if history is cluttered
- Use "Rebase and merge" for linear history (preferred)
- Ensure PR template was filled out
- Verify CI passed on latest commit

## Feature Development

### New Features
1. **Discussion first** (open issue, discuss approach)
2. **Plan implementation** (comment on issue with design)
3. **Develop feature** (follow guidelines above)
4. **Test thoroughly** (unit + E2E + manual)
5. **Document changes** (README, docs/)
6. **Submit PR** (reference issue)

### Large Features
For large features (>500 lines code changes):
1. Create an RFC (Request for Comments) issue first
2. Get feedback before starting implementation
3. Break into multiple PRs if possible
4. Ensure backward compatibility

## Documentation

### Update README.md when:
- Adding new features
- Changing command syntax
- Updating installation steps
- Adding new development tools

### Create docs/ files when:
- Adding significant new behavior
- Explaining complex subsystems
- Providing usage examples
- Documenting APIs

### Comment code when:
- Logic is non-obvious
- Algorithm is complex (SM-2)
- Edge cases exist
- External dependencies used

Use JSDoc style comments for functions:
```javascript
/**
 * Calculate next review interval using SM-2 algorithm
 * @param {Object} state - Review state
 * @param {number} grade - Response grade (0-5)
 * @returns {Object} Updated review state
 */
function scheduleNext(state, grade) {
  // implementation
}
```

## Architecture Decisions

Before making significant architectural changes:

1. **Check existing patterns** - Follow established conventions
2. **Discuss in issue** - Get feedback from maintainers
3. **Document rationale** - Explain why this approach
4. **No breaking changes** - Must maintain backward compatibility
5. **Test thoroughly** - Changes affect many areas

## Performance Considerations

When contributing:
- Avoid large dependency additions
- Keep bundle size in mind
- Test on slow networks
- Verify offline functionality
- Measure performance impact (Lighthouse)

## Accessibility

All changes must:
- Maintain keyboard navigation
- Follow ARIA guidelines
- Use semantic HTML
- Support screen readers
- Pass axe-core tests (when available)

### Test Accessibility
- Keyboard: Tab, Enter, Space, arrow keys
- Screen reader: Test with at least one
- Color contrast: WCAG AA minimum
- Focus indicators: Always visible

## Questions?

- **Code questions?** Open an issue or discussion
- **Need help getting started?** Comment on easy-label issues
- **Want to contribute but not sure how?** Reach out!

## Recognition

Contributors are recognized in:
- Release notes for significant contributions
- README.md contributors section (if applicable)
- Commit history (preserved in git)

Thank you for contributing! 🎉

---

## Additional Resources

- [README.md](README.md) - Project overview
- [SECURITY.md](SECURITY.md) - Security policy
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Current development status
- [PHASE_EXECUTION_ROADMAP.md](PHASE_EXECUTION_ROADMAP.md) - Future roadmap

**Last Updated**: November 13, 2025
