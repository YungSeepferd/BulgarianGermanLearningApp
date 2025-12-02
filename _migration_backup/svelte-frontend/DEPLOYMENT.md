# GitHub Pages Deployment Guide

This guide explains how to deploy your SvelteKit application to GitHub Pages.

## Prerequisites

- GitHub repository: `BulgarianGermanLearningApp`
- SvelteKit application configured for static site generation
- GitHub account with repository access

## Configuration Status

✅ **Configuration Complete**
- Static adapter configured with `fallback: '404.html'`
- Base path set to `/BulgarianGermanLearningApp` for production
- Prerendering enabled with `trailingSlash: 'always'`
- Build process tested and working

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: svelte-frontend/package-lock.json
        
    - name: Install dependencies
      run: |
        cd svelte-frontend
        npm ci
        
    - name: Build
      run: |
        cd svelte-frontend
        npm run build
      env:
        NODE_ENV: production
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./svelte-frontend/build
```

### Method 2: Manual Deployment

```bash
# Build the site
cd svelte-frontend
npm run build

# Create and push to gh-pages branch
git checkout --orphan gh-pages
git --work-tree build add --all
git commit -m "Deploy to GitHub Pages"
git push origin HEAD:gh-pages --force
git checkout main
```

### Method 3: Using GitHub Pages from main branch

If you prefer to deploy from the main branch:

1. Build the site: `cd svelte-frontend && npm run build`
2. Commit the build directory to main branch
3. In GitHub repository settings → Pages:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /svelte-frontend/build

## Repository Settings

1. Go to your GitHub repository: `BulgarianGermanLearningApp`
2. Navigate to **Settings** → **Pages**
3. Configure:
   - **Source**: GitHub Actions (if using Method 1) or Branch (if using Method 2/3)
   - **Branch**: `gh-pages` (Method 2) or `main` (Method 3)
   - **Folder**: `/` (root)

## Testing Deployment

After deployment, visit:
- **Production URL**: `https://[username].github.io/BulgarianGermanLearningApp/`
- **Test navigation**: Verify all routes work
- **Check assets**: Ensure CSS/JS files load correctly
- **Test 404 handling**: Try accessing non-existent routes

## Troubleshooting

### Common Issues

1. **Assets not loading**
   - Verify `paths.base` is correctly set in production
   - Check that assets are in the correct location

2. **404 errors on page refresh**
   - Ensure `fallback: '404.html'` is configured
   - Verify GitHub Pages is serving from the correct directory

3. **Routing issues**
   - Check that `trailingSlash: 'always'` is set
   - Verify all routes are properly prerendered

### Build Verification

```bash
# Test build locally
cd svelte-frontend
npm run build
npm run preview

# Check build structure
ls -la build/
# Should contain: index.html, 404.html, _app/, practice/, etc.
```

## Environment Variables

The build automatically handles environment-specific configurations:

- **Development**: Base path is empty (`''`)
- **Production**: Base path is `/BulgarianGermanLearningApp`

## Custom Domain (Optional)

To use a custom domain:

1. Create `static/CNAME` file:
   ```
   your-domain.com
   ```

2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings to use custom domain

## Monitoring

After deployment, monitor:
- ✅ All pages load correctly
- ✅ Navigation works (client-side routing)
- ✅ Assets (CSS, JS) load without errors
- ✅ 404 pages are handled properly
- ✅ Production URL: `https://[username].github.io/BulgarianGermanLearningApp/`

## Support

If you encounter issues:
1. Check the build logs in GitHub Actions
2. Verify the build directory structure
3. Test locally with `npm run preview`
4. Check browser console for errors

---

**Last Updated**: December 2025  
**SvelteKit Version**: 2.48.5  
**Static Adapter**: 3.0.10