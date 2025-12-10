# GitHub Pages Deployment Guide

This document provides comprehensive instructions for deploying the Bulgarian-German Learning App to GitHub Pages.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Configuration](#deployment-configuration)
- [Build Process](#build-process)
- [Deployment Methods](#deployment-methods)
  - [Manual Deployment](#manual-deployment)
  - [GitHub Actions Deployment](#github-actions-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🔧 Prerequisites

Before deploying to GitHub Pages, ensure you have:

1. **GitHub Account**: A GitHub account with access to the repository
2. **Repository**: The project repository hosted on GitHub
3. **Node.js**: Node.js v18+ installed locally
4. **PNPM**: PNPM package manager installed (`npm install -g pnpm`)
5. **Build Tools**: All project dependencies installed (`pnpm install`)

## ⚙️ Deployment Configuration

### Vite Configuration

The project uses Vite for building and bundling. The configuration is set up for GitHub Pages compatibility:

```typescript
// vite.config.ts
export default defineConfig({
  // Build configuration
  build: {
    target: 'es2020',
    outDir: 'build',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    emptyOutDir: true
  }
});
```

### Package.json Scripts

The following scripts are configured for GitHub Pages deployment:

```json
{
  "scripts": {
    "build": "vite build",
    "build:gh-pages": "vite build --base /BulgarianApp-Fresh/",
    "preview": "vite preview"
  }
}
```

## 🏗️ Build Process

### Production Build

To create a production build for GitHub Pages:

```bash
# Create production build with GitHub Pages base path
pnpm build:gh-pages
```

This will:
- Create optimized production assets
- Set the correct base path for GitHub Pages (`/BulgarianApp-Fresh/`)
- Output files to the `build` directory
- Generate source maps for debugging

### Local Preview

Before deploying, test the production build locally:

```bash
# Preview the production build
pnpm preview
```

The preview server will be available at `http://localhost:4173`.

## 🚀 Deployment Methods

### Manual Deployment

#### Step 1: Create Production Build

```bash
pnpm build:gh-pages
```

#### Step 2: Deploy to GitHub Pages

1. **Using gh-pages package** (recommended):

```bash
# Install gh-pages if not already installed
pnpm add -D gh-pages

# Add deployment script to package.json
"scripts": {
  "deploy": "gh-pages -d build -b gh-pages"
}

# Run deployment
pnpm deploy
```

2. **Manual Git Deployment**:

```bash
# Initialize git repository in build directory
cd build
git init
git checkout -b gh-pages
git add .
git commit -m "GitHub Pages deployment"
git remote add origin https://github.com/your-username/BulgarianApp-Fresh.git
git push -f origin gh-pages
```

#### Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

### GitHub Actions Deployment

Create a GitHub Actions workflow for automated deployment:

1. Create the workflow file:

```bash
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
```

2. Add the following content to `.github/workflows/deploy.yml`:

```yaml
name: GitHub Pages Deployment

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build for GitHub Pages
        run: pnpm build:gh-pages

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## ✅ Post-Deployment Verification

After deployment, verify the application works correctly:

1. **Access the deployed application**:
   - URL: `https://your-username.github.io/BulgarianApp-Fresh/`

2. **Test critical functionality**:
   - Application loads without errors
   - Navigation works correctly
   - Language switching works
   - Dashboard loads and displays progress
   - Lessons and practice exercises work

3. **Check console for errors**:
   - Open browser developer tools
   - Verify no 404 errors for assets
   - Check for any JavaScript errors

4. **Test on multiple devices**:
   - Desktop browsers
   - Mobile devices
   - Tablets

## 🛠️ Troubleshooting

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **404 errors for assets** | Incorrect base path | Ensure `--base /BulgarianApp-Fresh/` is used in build command |
| **Blank page** | JavaScript errors | Check browser console for errors, verify build completed successfully |
| **Routing issues** | GitHub Pages doesn't support SPA routing | Ensure 404.html is present in build directory |
| **CSS not loading** | Incorrect asset paths | Verify base path configuration in vite.config.ts |
| **API calls failing** | CORS or incorrect URLs | Ensure all API calls use relative paths or correct absolute URLs |
| **Translation files missing** | Incorrect paths in production | Verify translation files are included in build output |

### Debugging Tips

1. **Check build output**:
   ```bash
   ls -la build/
   ```

2. **Test locally before deploying**:
   ```bash
   pnpm preview
   ```

3. **Verify base path**:
   - Check `index.html` in build directory
   - Ensure all asset paths start with `/BulgarianApp-Fresh/`

4. **Check GitHub Pages settings**:
   - Verify correct branch and folder are selected
   - Ensure GitHub Pages is enabled

## 🏆 Best Practices

1. **Test thoroughly before deployment**:
   - Run all tests: `pnpm test:all`
   - Test locally: `pnpm preview`

2. **Use GitHub Actions for CI/CD**:
   - Automate testing and deployment
   - Ensure only tested code gets deployed

3. **Monitor deployment status**:
   - Check GitHub Actions workflow runs
   - Monitor GitHub Pages build status

4. **Keep dependencies updated**:
   - Regularly update dependencies: `pnpm update`
   - Test after updates

5. **Maintain backup branches**:
   - Keep a stable `main` branch
   - Use feature branches for development

6. **Document deployment process**:
   - Keep this guide updated
   - Document any custom configurations

7. **Monitor application performance**:
   - Use browser developer tools
   - Check loading times and asset sizes

## 📝 Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass (`pnpm test:all`)
- [ ] Local preview works without errors (`pnpm preview`)
- [ ] Build completes successfully (`pnpm build:gh-pages`)
- [ ] Base path is correctly set (`/BulgarianApp-Fresh/`)
- [ ] GitHub Pages is configured (branch: `gh-pages`, folder: `/`)
- [ ] All critical functionality works in local preview
- [ ] No console errors in local preview
- [ ] Translation files are included in build
- [ ] 404.html is present in build directory
- [ ] GitHub Actions workflow is set up (if using CI/CD)