# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in the Bulgarian-German Learning App, please follow responsible disclosure practices:

### Private Reporting
1. **GitHub Security Advisory**: Use GitHub's private reporting feature
   - Navigate to: Settings → Security → Report a vulnerability
   - This ensures secure, private communication

2. **Email** (if needed): Contact maintainers directly (see README for contact info)

3. **Do NOT open public issues** for security vulnerabilities

### Vulnerability Response Timeline
1. **Report**: Vulnerability reported privately
2. **Acknowledge** (24 hours): Team confirms receipt
3. **Assessment** (2-3 days): Severity and scope determined
4. **Fix** (3-7 days): Patch developed and tested
5. **Release** (7-14 days): Security release published
6. **Disclosure** (same day as release): Public advisory published

## Supported Versions

| Version | Status | Support Level |
|---------|--------|---|
| 1.0.x | Current | Full security support |
| <1.0 | Legacy | Best-effort (may not fix) |

## Security Scanning

The project implements multiple security layers:

### Automated Scanning
- **npm audit**: Weekly, on every commit (blocking on high/critical)
- **Go vulncheck**: Weekly, on every commit (blocking on high/critical)
- **GitHub CodeQL**: On every push (code quality + security)
- **Dependabot**: Automated dependency updates and alerts

### Manual Review
- Code review process for all PRs
- Focus on security implications
- OWASP Top 10 compliance review

## Security Best Practices for Users

### For Developers
1. Keep dependencies up-to-date: `npm audit fix`
2. Use npm ci instead of npm install in CI/CD
3. Enable pre-commit hooks: `npx husky install`
4. Run linters before committing: `npm run lint`

### For Contributors
1. Review CONTRIBUTING.md before contributing
2. All changes go through code review
3. Security features cannot be disabled
4. Report findings, don't exploit

## Known Security Considerations

### Offline-First Architecture
- **Strength**: No external API calls, reduced attack surface
- **Consideration**: Service worker caching requires careful cache management
- **Mitigation**: Content Security Policy headers recommended

### Client-Side JavaScript
- **Strength**: No sensitive backend operations
- **Consideration**: Data stored in localStorage
- **Mitigation**: LocalStorage uses bgde: prefix, encrypted session recommended

### Static Site Generation
- **Strength**: No database, no server vulnerabilities
- **Consideration**: Build-time data embedding
- **Mitigation**: Input validation in build process

## Dependency Management

### Frequency
- npm packages: Weekly reviews
- Go modules: Weekly reviews
- GitHub Actions: Monthly pin updates

### Process
1. Automatic alerts from Dependabot
2. Manual evaluation of severity
3. Update and test in staging
4. Release with patch version bump
5. Communication in release notes

## Future Security Enhancements

Planned security improvements:
- [ ] Content Security Policy (CSP) headers
- [ ] Subresource Integrity (SRI) for external assets
- [ ] Security.txt file (.well-known/security.txt)
- [ ] Bug bounty program (if applicable)

## Past Advisories

### 2025
- No security advisories to date

## Questions?

Security questions? Open an issue (non-sensitive) or reach out privately via GitHub.

For other support, see README.md.

---

**Last Updated**: November 13, 2025
**Policy Version**: 1.0
