# Complete Hugo Framework Guide

**Comprehensive guide for Hugo development in the Bulgarian-German Learning App**  
*Consolidates: HUGO_GUIDELINES.md, HUGO_OFFICIAL_GUIDELINES.md, HUGO_DEVELOPMENT_ISSUES.md*

---

## Overview

This guide covers all aspects of Hugo development for our language learning app, from basic setup to advanced optimization techniques. Hugo Extended is required for SCSS processing and optimal performance.

## Quick Start

### Prerequisites
- **Hugo Extended v0.128.0+** (critical for SCSS support)
- **Go v1.21+** (for tools/ directory utilities)  
- **Node.js v18+** (for npm scripts and optional tooling)

### Local Development
```bash
# Start development server
hugo server -D --logLevel=debug
# or via npm
npm run dev

# Production build
hugo --gc --minify
# or via npm  
npm run build
```

---

## Core Operating Model

### Static Files Architecture
- **1:1 URL mapping**: Every public URL resolves to an actual file (`index.html`) or directory
- **No dynamic routing**: Missing files result in 404s that Hugo cannot intercept
- **Strict hierarchy**: Directories become list pages, files become single pages

### Content Structure
```text
content/
├── vocabulary/           # Section (list page)
│   ├── _index.md        # List page content
│   └── beginner.md      # Single page
├── practice/
│   └── index.md         # Page bundle (assets beside index.md)
└── grammar/
    ├── _index.md        # Branch bundle
    └── cases/
        └── nominative.md
```

### Page Types
- **Single pages**: `single.html` layout (individual content)
- **List pages**: `list.html` layout (section overviews)
- **Home page**: `index.html` layout (site landing)

---

## Configuration Best Practices

### hugo.toml Structure
```toml
# Essential settings
baseURL = 'https://yoursite.com'
languageCode = 'en-us'
title = 'Bulgarian-German Learning App'
theme = 'relearn'

# Required for SCSS
[module]
  [module.hugoVersion]
    extended = true
    min = "0.128.0"

# Asset processing
[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true  # Allow HTML in Markdown

# Build optimization
[build]
  writeStats = true
  useResourceCacheWhen = "fallback"
```

### Environment-Specific Config
```text
config/
├── _default/
│   ├── hugo.toml        # Base configuration
│   └── params.toml      # Site parameters
├── development/
│   └── hugo.toml        # Dev overrides
└── production/
    └── hugo.toml        # Production overrides
```

---

## Content Authoring Guidelines

### Front Matter Standards
```yaml
---
title: "Vocabulary: Family"
date: 2025-10-28
draft: false              # Omit to publish immediately
weight: 10               # Sort order in lists
categories: ["vocabulary"]
tags: ["family", "A1"]
layout: "custom"         # Override default layout
---
```

### Markdown Best Practices
- **Emphasis limitations**: Cannot span paragraphs
- **Script protection**: Use shortcodes for MathJax, complex markup
- **HTML embedding**: Enabled via `unsafe = true` configuration
- **Asset references**: Use relative paths for page bundles

### Shortcodes Usage
```html
<!-- Vocabulary flashcard shortcode -->
{{< flashcards data="family-vocab" >}}

<!-- Custom callout -->
{{< callout type="warning" >}}
Remember: Bulgarian uses different word order!
{{< /callout >}}

<!-- Embed vocabulary data -->
{{< vocab-grid category="family" level="A1" >}}
```

---

## Templates and Layouts

### Layout Hierarchy
```text
layouts/
├── _default/
│   ├── baseof.html      # Base template
│   ├── single.html      # Single page layout
│   └── list.html        # List page layout
├── vocabulary/
│   └── single.html      # Vocabulary-specific layout
├── partials/
│   ├── head.html        # <head> content
│   └── navigation.html  # Site navigation
└── shortcodes/
    ├── flashcards.html  # Flashcard component
    └── vocab-grid.html  # Vocabulary grid
```

### Template Development
```html
<!-- baseof.html structure -->
<!DOCTYPE html>
<html>
<head>
  {{ partial "head.html" . }}
</head>
<body>
  {{ partial "navigation.html" . }}
  <main>
    {{ block "main" . }}{{ end }}
  </main>
  {{ partial "scripts.html" . }}
</body>
</html>

<!-- single.html content -->
{{ define "main" }}
<article>
  <h1>{{ .Title }}</h1>
  <div class="content">
    {{ .Content }}
  </div>
</article>
{{ end }}
```

---

## Asset Processing

### SCSS Pipeline
```html
<!-- In baseof.html -->
{{ $scss := resources.Get "scss/main.scss" }}
{{ $css := $scss | resources.ToCSS | resources.Minify | resources.Fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}">
```

### JavaScript Modules
```html
<!-- ES modules with fingerprinting -->
{{ $js := resources.Get "js/flashcards.js" }}
{{ $jsMin := $js | resources.Minify | resources.Fingerprint }}
<script src="{{ $jsMin.RelPermalink }}" type="module"></script>
```

### Image Processing
```html
<!-- Responsive images -->
{{ $image := resources.Get "images/vocabulary-card.jpg" }}
{{ $imageSmall := $image.Resize "480x" }}
{{ $imageLarge := $image.Resize "960x" }}

<picture>
  <source media="(max-width: 480px)" srcset="{{ $imageSmall.RelPermalink }}">
  <img src="{{ $imageLarge.RelPermalink }}" alt="Vocabulary card">
</picture>
```

---

## Data Management

### Data Files Structure
```text
data/
├── vocabulary.json      # Main vocabulary database
├── cultural-grammar.json # Grammar rules
└── site-config.yaml    # Site-wide configuration
```

### Accessing Data in Templates
```html
<!-- Loop through vocabulary -->
{{ range .Site.Data.vocabulary }}
  <div class="vocab-card" data-id="{{ .id }}">
    <h3>{{ .word }}</h3>
    <p>{{ .translation }}</p>
  </div>
{{ end }}

<!-- Access specific data -->
{{ $config := .Site.Data.site-config }}
{{ $welcomeMessage := $config.messages.welcome }}
```

---

## Performance Optimization

### Build Performance
```bash
# Fast development builds
hugo server --disableFastRender=false

# Optimized production builds
hugo --gc --minify --enableGitInfo

# Profile build performance
hugo --templateMetrics --templateMetricsHints
```

### Asset Optimization
- **Fingerprinting**: Automatic cache busting for CSS/JS
- **Minification**: Built-in minification for production
- **Image processing**: Automatic WebP conversion and resizing
- **Bundle splitting**: Separate critical and non-critical CSS

### Caching Strategy
```toml
[caches]
  [caches.assets]
    dir = ":resourceDir/_gen"
    maxAge = "720h"
  [caches.getjson]
    dir = ":cacheDir/:project"
    maxAge = "1h"
```

---

## Development Workflow

### Daily Development
1. **Start server**: `npm run dev`
2. **Check console**: No template errors or warnings
3. **Test changes**: Browser hot-reload verification
4. **Lint code**: `npm run lint:esm` for JS modules
5. **Build test**: `npm run build` before commits

### Debugging Techniques
```bash
# Verbose output
hugo server --logLevel=debug --verbose

# Template debugging
hugo server --templateMetrics

# Build analysis
hugo --templateMetricsHints --verbose
```

### Common Issues & Solutions

**Problem**: SCSS compilation fails  
**Solution**: Ensure Hugo Extended is installed and version >= 0.128.0

**Problem**: Template not found errors  
**Solution**: Check layout hierarchy and file naming conventions

**Problem**: Asset fingerprinting not working  
**Solution**: Verify Hugo Pipes configuration in templates

**Problem**: Slow build times  
**Solution**: Enable caching and use `--disableFastRender` for development

---

## Advanced Features

### Multilingual Setup
```toml
[languages]
  [languages.en]
    languageName = 'English'
    weight = 1
  [languages.bg]
    languageName = 'Български'
    weight = 2
  [languages.de]
    languageName = 'Deutsch'
    weight = 3
```

### Custom Output Formats
```toml
[outputFormats]
  [outputFormats.vocabulary]
    mediaType = 'application/json'
    baseName = 'vocab'
    isPlainText = true
```

### Taxonomies for Learning Content
```toml
[taxonomies]
  level = 'levels'          # A1, A2, B1, B2
  category = 'categories'   # nouns, verbs, etc.
  difficulty = 'difficulties'
```

---

## Production Deployment

### GitHub Pages Setup
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.128.0'
          extended: true
      - name: Build
        run: hugo --gc --minify
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

### SEO & Performance
- **Robots.txt**: Auto-generated for production
- **Sitemap**: Built-in XML sitemap generation
- **JSON-LD**: Structured data for language learning content
- **PWA support**: Service worker and manifest integration

---

## Troubleshooting

### Common Errors

**"SCSS processing failed"**
- Install Hugo Extended version
- Check SCSS syntax in source files
- Verify import paths in SCSS files

**"Layout not found"**
- Check file naming conventions
- Verify layout hierarchy in layouts/ directory
- Ensure correct front matter layout specification

**"Asset not found"**
- Verify file exists in assets/ directory
- Check resource.Get path spelling
- Ensure proper directory structure

### Debug Commands
```bash
# Check Hugo version and features
hugo version

# Validate configuration
hugo config

# List all pages
hugo list all

# Check template execution
hugo server --templateMetrics --logLevel=debug
```

---

## Migration Notes

### From Standard Hugo to Extended
1. Uninstall standard Hugo: `brew uninstall hugo`
2. Install extended: `brew install hugo`
3. Verify: `hugo version` should show "extended"
4. Update CI/CD to use extended version

### Theme Updates
- Always test theme updates in development first
- Check for breaking changes in theme documentation
- Backup customizations before upgrading
- Test all custom shortcodes after theme updates

---

This comprehensive guide consolidates all Hugo-related documentation and serves as the single source of truth for Hugo development in our language learning application.