---
name: Deployment Setup
about: Track deployment infrastructure setup tasks
title: "[Deployment] Setup: "
labels: deployment, infrastructure
assignees: dinz

---

## Deployment Setup Task

### Description
This issue tracks the setup of deployment infrastructure for the Bulgarian-German Learning App.

### Tasks

#### 1. Branch Protection Implementation
- [ ] Enable branch protection for `main` branch
- [ ] Require pull request before merging
- [ ] Require approvals (minimum 1)
- [ ] Require status checks to pass
- [ ] Require CODEOWNERS review for critical paths
- [ ] Include administrators in restrictions

**Instructions for implementation**:
1. Go to Repository Settings → Branches → Branch protection rules
2. Click "Add rule"
3. Enter `main` as the branch name pattern
4. Enable the following options:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (set to 1)
   - ✅ Require status checks to pass before merging
   - ✅ Require review from Code Owners
   - ✅ Include administrators
5. Add the following required status checks:
   - `ci-quality-gates / lint-and-typecheck`
   - `ci-quality-gates / unit-tests`
   - `ci-quality-gates / deployment-ready`
6. Save the protection rule

#### 2. Staging Environment Setup
- [ ] Configure GitHub Pages for staging environment
- [ ] Set up custom domain for staging (staging.bulgarianapp.com)
- [ ] Configure DNS settings for staging domain
- [ ] Set up environment variables for staging
- [ ] Create GitHub environment for staging with protection rules

**Instructions for implementation**:
1. Go to Repository Settings → Environments
2. Click "New environment" and name it `staging`
3. Add environment protection rules:
   - ✅ Required reviewers (select team members)
   - ✅ Wait timer (optional)
4. Add environment variables:
   - `NODE_ENV=staging`
   - `BASE_PATH=/staging`
5. Configure GitHub Pages to deploy to the `staging` subdirectory
6. Set up DNS for staging domain (CNAME record pointing to GitHub Pages)

#### 3. Release Management Implementation
- [ ] Set up semantic release configuration
- [ ] Configure changelog generation
- [ ] Set up GitHub release creation
- [ ] Configure version bumping in package.json
- [ ] Set up release notes template

**Instructions for implementation**:
1. Install semantic release packages:
```bash
pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github
```

2. Create `.releaserc.json` configuration:
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ],
  "preset": "conventionalcommits"
}
```

3. Update `package.json` to include release script:
```json
{
  "scripts": {
    "release": "semantic-release"
  }
}
```

4. Create GitHub Actions workflow for automated releases

### Dependencies
- [ ] CI pipeline must be fully functional
- [ ] CODEOWNERS file must be in place
- [ ] Deployment workflow must be merged

### Acceptance Criteria
- [ ] Branch protection is enabled for main branch
- [ ] Staging environment is accessible at staging.bulgarianapp.com
- [ ] Production deployments require manual approval
- [ ] Automated releases are created for tags
- [ ] Changelog is automatically updated with each release

### Notes
- Coordinate with DevOps team for DNS configuration
- Test branch protection rules before enforcing
- Verify staging environment before enabling automated deployments