# Development Guide

This document outlines the development setup, workflow, and recent fixes for the Bulgarian-German Learning App.

## Prerequisites

- Hugo Extended (v0.128.0+)
- Go (v1.19+)
- Node.js (v16+)
- Git

## Recent Fixes and Improvements

### Hugo SCSS Compilation Issues (Fixed)

**Problem**: Hugo v0.148.2 deprecated `resources.ToCSS` method, causing SCSS compilation failures.

**Solution**: Updated `layouts/_default/baseof.html` to use the new `css.Sass` method:

```html
{{ $style := resources.Get "scss/main.scss" | css.Sass | resources.Minify | resources.Fingerprint }}
```

**Key Changes Made**:

1. Fixed SCSS variable definitions in `assets/scss/_variables.scss`
2. Updated font variable references from `$font-family-sans` to `$font-sans`
3. Added missing `$font-mono` variable for code blocks
4. Cleaned up duplicate configuration sections in `hugo.toml`
5. Updated Hugo template to use modern SCSS processing

### Code Block Enhancements

**Added Features**:

- Custom code block rendering with syntax highlighting
- Copy-to-clipboard functionality
- Responsive code block styling
- Language indicator display

**Files Modified**:

- `layouts/_default/_markup/render-codeblock.html`
- `assets/scss/components/_code.scss`
- `assets/js/code.js`

## Local Development

### Setup

1. Clone the repository
2. Install Hugo Extended (v0.128.0+)
3. Run development server:
   ```bash
   hugo server -D --logLevel=debug
   ```
4. Visit `http://localhost:1313/BulgarianApp-Fresh/`

### Project Structure

```
├── content/           # Markdown content files (vocabulary, grammar)
├── layouts/           # Hugo templates and partials
│   ├── _default/      # Default layouts
│   └── _markup/       # Custom markdown renderers
├── assets/            # SCSS, JS, and other assets
│   ├── scss/          # SCSS stylesheets
│   └── js/            # JavaScript files
├── static/            # Static files (audio, images)
├── data/              # Data files (vocabulary.json, grammar.json)
└── themes/learn/      # Hugo Learn theme
```

## Build Process

### Development Build
```bash
hugo server -D --logLevel=debug
```

### Production Build
```bash
hugo --minify
```

### Asset Processing
- SCSS files are processed using Hugo's built-in Sass compiler
- JavaScript files are minified and fingerprinted
- All assets include integrity hashes for security

## Testing and Validation

### Local Testing Checklist
- [ ] Hugo server starts without errors
- [ ] SCSS compilation succeeds
- [ ] JavaScript files load correctly
- [ ] Code blocks display with copy functionality
- [ ] Responsive design works on mobile
- [ ] Search functionality operates
- [ ] Audio files play correctly

### Build Validation
```bash
# Test SCSS compilation
hugo build --logLevel=debug

# Validate JavaScript syntax
node -c assets/js/app.js
node -c assets/js/code.js

# Check generated assets
find public -name "*.css" -o -name "*.js"
```

## Deployment

The site is deployed to GitHub Pages using GitHub Actions. The workflow is defined in `.github/workflows/deploy.yml`.

### Deployment Process
1. Push to main branch
2. GitHub Actions builds the site
3. Generated files are deployed to `gh-pages` branch
4. Site is available at the configured GitHub Pages URL

## Technologies Used

### Core Technologies
- **Hugo**: Static site generator (v0.148.2+)
- **SCSS**: CSS preprocessing
- **JavaScript**: Client-side functionality
- **Markdown**: Content authoring

### Key Features
- Responsive design with mobile-first approach
- Progressive Web App (PWA) capabilities
- Search functionality with JSON index
- Audio pronunciation support
- Spaced repetition learning algorithm
- Multi-level content organization (A1, A2, etc.)

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Test locally using `hugo server -D`
4. Ensure all assets compile correctly
5. Submit a pull request with detailed description

## Troubleshooting

### Common Issues and Solutions

**SCSS Compilation Errors**
- Ensure Hugo Extended is installed
- Check SCSS variable definitions
- Verify import paths in SCSS files

**Template Errors**
- Check Hugo template syntax
- Validate partial template paths
- Ensure proper variable scoping

**Build Failures**
- Review Hugo logs with `--logLevel=debug`
- Check for missing dependencies
- Validate configuration syntax

**JavaScript Issues**
- Test syntax with `node -c filename.js`
- Check browser console for runtime errors
- Verify asset paths and loading

### Performance Optimization

**Asset Optimization**
- SCSS is minified and fingerprinted
- JavaScript files are minified
- Images should be optimized before adding
- Use Hugo's image processing for responsive images

**Caching Strategy**
- Assets include fingerprints for cache busting
- Static files are cached by GitHub Pages
- Use appropriate cache headers for different content types

## Development Workflow

1. **Start Development**: `hugo server -D`
2. **Make Changes**: Edit content, templates, or assets
3. **Test Changes**: Verify in browser at `localhost:1313`
4. **Build for Production**: `hugo --minify`
5. **Deploy**: Push to main branch for automatic deployment

## Implementation Requirements

**IMPORTANT**: This project must be implemented using **Go and Hugo only**. No other frameworks or languages should be used for the core functionality.

### Approved Technology Stack
- **Backend Logic**: Go (for spaced repetition algorithms, data processing)
- **Frontend**: Hugo static site generator with Go templates
- **Styling**: SCSS (processed by Hugo)
- **Interactivity**: Minimal JavaScript with Hugo's built-in capabilities
- **Data Storage**: JSON files processed by Hugo's data pipeline
- **Build Tools**: Hugo CLI and Go toolchain

### Next Steps for Go/Hugo Implementation

1. **Implement Go-based spaced repetition service** in `tools/` directory
2. **Create Hugo shortcodes** for interactive vocabulary components
3. **Build Go data processors** to generate practice sessions from JSON
4. **Use Hugo's data pipeline** to create dynamic vocabulary pages
5. **Implement Go backend services** for progress tracking (if needed)
6. **Leverage Hugo Pipes** for asset processing and optimization

## Resources

See `docs/PROGRAMMING_LINKS.md` for comprehensive links to:
- Hugo documentation and best practices
- Go programming resources
- Frontend development guides
- Community support channels

## Project Structure

- `apps/web` - Web application source code
- `packages/core` - Shared core logic
- `packages/ui` - Shared UI components
- `public` - Static assets and build output
- `tests` - Integration and E2E tests

### Creating a New Component

1. Create a new file in `apps/web/src/components/`
2. Export the component in `apps/web/src/components/mod.rs`
3. Import and use the component in your views

### Adding a New Feature

1. Create a new module in `apps/web/src/features/`
2. Add the module to `apps/web/src/lib.rs`
3. Create corresponding tests
4. Update the documentation

### Running Tests

```bash
# Run unit tests
cargo test

# Run web tests
wasm-pack test --headless --firefox

# Run integration tests
cargo test --test integration
```

## Code Style

- Follow the Rust Style Guide
- Use `rustfmt` for code formatting
- Run `cargo clippy` for linting

## Git Workflow

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Run tests
4. Create a pull request
5. Request a code review
6. Merge after approval

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.
