# Hugo + Go Implementation Guide for Bulgarian-German Learning App

This guide provides step-by-step instructions for implementing the Bulgarian-German learning application using Hugo static site generator and Go backend tools.

## Prerequisites

- **Hugo Extended** (v0.128.0 or later) - [Installation Guide](https://gohugo.io/installation/)
- **Go** (v1.21 or later) - [Installation Guide](https://go.dev/doc/install)
- **Node.js** (v18 or later) - For asset processing
- **Git** - For version control and GitHub Pages deployment

## Quick Start

### 1. Initialize Hugo Site

```bash
# Create new Hugo site
hugo new site bulgarian-german-app
cd bulgarian-german-app

# Initialize Git repository
git init
git remote add origin https://github.com/yourusername/bulgarian-german-app.git
```

### 2. Project Structure

```
bulgarian-german-app/
├── archetypes/          # Content templates
├── assets/              # Source files (JS, SCSS)
├── content/             # Markdown content
├── data/                # JSON data files
├── layouts/             # HTML templates
├── static/              # Static assets
├── tools/               # Go build tools
├── hugo.toml           # Hugo configuration
├── package.json        # Node.js dependencies
└── .github/workflows/  # GitHub Actions
```

### 3. Configure Hugo

Create `hugo.toml`:

```toml
baseURL = 'https://yourusername.github.io/bulgarian-german-app'
languageCode = 'en-us'
title = 'Bulgarian-German Learning App'

[params]
  description = 'Learn Bulgarian and German with spaced repetition'
  enablePWA = true
  enableAudio = true
  defaultSessionLength = 20
  themeColor = '#4a6fa5'

[menu]
  [[menu.main]]
    name = 'Vocabulary'
    url = '/vocabulary/'
    weight = 10
  [[menu.main]]
    name = 'Grammar'
    url = '/grammar/'
    weight = 20
  [[menu.main]]
    name = 'Practice'
    url = '/practice/'
    weight = 30
```

## Implementation Phases

### Phase 1: Data Processing (Go Backend)

1. **Set up Go module** in `tools/` directory
2. **Implement data structures** for vocabulary and grammar
3. **Create spaced repetition algorithm** 
4. **Build CLI tool** for data processing
5. **Generate Hugo content files** from JSON data

### Phase 2: Hugo Templates

1. **Create base layout** (`layouts/_default/baseof.html`)
2. **Build vocabulary list template** (`layouts/vocabulary/list.html`)
3. **Create practice session template** (`layouts/practice/single.html`)
4. **Add grammar templates** (`layouts/grammar/`)
5. **Create partial templates** for reusable components

### Phase 3: Frontend JavaScript

1. **Implement practice session logic** (`assets/js/practice.js`)
2. **Add vocabulary filtering** (`assets/js/vocabulary.js`)
3. **Create search functionality** (`assets/js/search.js`)
4. **Build spaced repetition client** with localStorage
5. **Add audio support** using Web Speech API

### Phase 4: Styling

1. **Create main stylesheet** (`assets/scss/main.scss`)
2. **Style vocabulary cards** and filtering
3. **Design flashcard interface** with flip animations
4. **Add responsive design** for mobile devices
5. **Implement dark mode** (optional)

### Phase 5: GitHub Pages Deployment

1. **Create GitHub Actions workflow** (`.github/workflows/deploy.yml`)
2. **Configure repository settings** for GitHub Pages
3. **Set up automated deployment** on push to main
4. **Add PWA features** (manifest, service worker)
5. **Optimize for performance** (minification, compression)

## Key Features Implementation

### Spaced Repetition Algorithm (SM-2)

The core learning algorithm is implemented in Go and used both server-side for data processing and client-side via JavaScript:

```javascript
// Client-side implementation
calculateNextReview(correct, state) {
    const quality = correct ? 5 : 2;
    const newState = { ...state };
    
    if (quality < 3) {
        newState.repetitions = 0;
        newState.interval = 1;
    } else {
        newState.repetitions++;
        if (newState.repetitions === 1) {
            newState.interval = 1;
        } else if (newState.repetitions === 2) {
            newState.interval = 6;
        } else {
            newState.interval = Math.round(newState.interval * newState.ease_factor);
        }
    }
    
    newState.ease_factor = Math.max(1.3, 
        newState.ease_factor + (0.1 - (5.0 - quality) * (0.08 + (5.0 - quality) * 0.02))
    );
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newState.interval);
    newState.next_review = nextReview.toISOString();
    
    return newState;
}
```

### Data Structure

The app uses two main JSON files:

- `data/vocabulary.json` - Word pairs with categories and levels
- `data/grammar.json` - Grammar rules with examples and exercises

### Progressive Web App Features

- **Offline functionality** via service worker
- **App manifest** for installation
- **Local storage** for progress persistence
- **Responsive design** for mobile devices

## Deployment

### GitHub Pages Setup

1. **Enable GitHub Pages** in repository settings
2. **Set source to GitHub Actions**
3. **Configure custom domain** (optional)
4. **Add repository secrets** if needed

### Build Process

The automated build process:

1. **Processes JSON data** using Go tools
2. **Generates Hugo content files**
3. **Builds static site** with Hugo
4. **Optimizes assets** (minification, compression)
5. **Deploys to GitHub Pages**

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install
cd tools && go mod tidy

# Process data and start Hugo server
./hugo-bg-de dev
# or
hugo server --buildDrafts
```

### Adding Content

1. **Add vocabulary items** to `data/vocabulary.json`
2. **Add grammar rules** to `data/grammar.json`
3. **Run data processor** to generate content files
4. **Test locally** before committing

### Customization

- **Modify templates** in `layouts/` directory
- **Update styles** in `assets/scss/`
- **Add JavaScript features** in `assets/js/`
- **Configure Hugo** in `hugo.toml`

## Performance Optimization

- **Static site generation** for fast loading
- **Asset minification** and compression
- **Lazy loading** for images and heavy content
- **Service worker** for offline caching
- **CDN delivery** via GitHub Pages

This implementation provides a fast, scalable, and maintainable language learning application that can be easily deployed to GitHub Pages and extended with additional features.
