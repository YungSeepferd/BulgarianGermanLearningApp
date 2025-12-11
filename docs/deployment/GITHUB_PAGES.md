# GitHub Pages Deployment Guide

This guide explains how the Bulgarian-German Learning App is deployed to GitHub Pages using GitHub Actions.

## 🚀 Deployment Overview

The application is deployed as a static site (SPA) to GitHub Pages.
- **URL**: `https://<username>.github.io/BulgarianApp-Fresh/`
- **Build Tool**: Vite + SvelteKit (`adapter-static`)
- **CI/CD**: GitHub Actions

## 🛠️ Configuration

### 1. SvelteKit Adapter (`svelte.config.js`)
We use `@sveltejs/adapter-static` to generate a static site.
```javascript
adapter: adapter({
  pages: 'build',
  assets: 'build',
  fallback: '404.html', // Required for SPA routing on GitHub Pages
  strict: false
})
```

### 2. Base Path (`svelte.config.js`)
The base path is configured for the repository subdirectory:
```javascript
paths: {
  base: process.env.NODE_ENV === 'production' ? '/BulgarianApp-Fresh' : ''
}
```

### 3. Asset Handling (`src/app.html`)
Static assets in HTML must use the `%sveltekit.assets%` placeholder to respect the base path:
```html
<link rel="icon" href="%sveltekit.assets%/logo/logo-icon.svg" />
```

## 📦 Deployment Workflow

The deployment is automated via the `.github/workflows/deploy.yml` workflow.

### Trigger
- Pushes to the `main` branch

### Steps
1. **Checkout**: Checks out the code.
2. **Setup**: Sets up Node.js and pnpm.
3. **Install**: Installs dependencies.
4. **Build**: Runs `pnpm build:gh-pages`.
5. **Deploy**: Uploads the `build` directory to the `gh-pages` branch (or via GitHub Pages action).

## 💻 Manual Deployment (Local Test)

To test the deployment build locally:

1. **Build**
   ```bash
   pnpm build:gh-pages
   ```

2. **Preview**
   ```bash
   pnpm preview
   ```
   Note: The preview URL will effectively simulate the base path logic.

## ⚠️ Troubleshooting

- **404 on Refresh**: Ensure `fallback: '404.html'` is set in `svelte.config.js`.
- **Broken Images/Styles**: Verify `base` path in `svelte.config.js` and use `%sveltekit.assets%` in HTML templates.
- **Routing Issues**: GitHub Pages doesn't natively support SPA routing; the `404.html` fallback handles this by reloading the app, which then handles the route client-side.

## 📝 Post-Deployment Checklist

- [ ] Verify homepage loads at `/BulgarianApp-Fresh/`
- [ ] Check console for 404 errors on assets
- [ ] Test navigation (deep linking)
- [ ] Verify language switching persistence