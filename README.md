# Bulgarian-German Learning App

A comprehensive web application for learning Bulgarian and German languages with flashcards, spaced repetition, and interactive exercises.

![CI](https://github.com/your-username/bulgarian-german-app/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/your-username/bulgarian-german-app/branch/main/graph/badge.svg)
![Lighthouse](https://github.com/your-username/bulgarian-german-app/workflows/Lighthouse/badge.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![Accessibility](https://img.shields.io/badge/Accessibility-95%25-brightgreen)

## 🚀 Features

- **Bilingual Learning**: Learn Bulgarian to German and German to Bulgarian
- **Spaced Repetition**: Optimized learning schedule with SM-2 algorithm
- **Interactive Flashcards**: Engaging flashcard system with progress tracking
- **Performance Monitoring**: Real-time performance metrics and analytics
- **PWA Support**: Installable progressive web app with offline capabilities
- **Accessibility First**: WCAG 2.1 AA compliant with 95%+ Lighthouse accessibility score
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Frontend
- **SvelteKit**: Modern framework for building web applications
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Workbox**: Service worker for PWA functionality

### Backend
- **SvelteKit API Routes**: Server-side API endpoints
- **Static Data**: JSON-based vocabulary and grammar data

### Development Tools
- **ESLint**: Code linting with jsx-a11y accessibility rules
- **Prettier**: Code formatting
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing
- **Lighthouse CI**: Automated performance and accessibility testing

## 📱 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bulgarian-german-app.git
   cd bulgarian-german-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Component Tests
```bash
npm run test:component
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Coverage Reports
```bash
npm run test:coverage
```

## 📊 Quality Gates

This project maintains high code quality standards:

### ESLint
- **0 errors, minimal warnings**
- jsx-a11y plugin for accessibility compliance
- Automated fixing with `npm run lint:fix`

### Test Coverage
- **80%+ coverage requirement**
- Coverage diff checks in CI to prevent regression
- Detailed coverage reports with `npm run test:coverage`

### Lighthouse
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+

### PWA
- **Service Worker**: Workbox-powered caching
- **Offline Support**: Core functionality available offline
- **Installable**: Add to home screen capability

## 🏗️ Architecture

### SvelteKit Structure
```
svelte-frontend/
├── src/
│   ├── lib/
│   │   ├── api/          # API client functions
│   │   ├── components/   # Reusable Svelte components
│   │   ├── stores/       # Svelte stores for state management
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   ├── routes/
│   │   ├── api/          # API routes
│   │   └── +layout.svelte # Root layout
│   └── app.html          # HTML template
├── tests/                # Test files
└── package.json
```

### API Endpoints

- `GET /api/vocabulary/all` - Load all vocabulary items
- `GET /api/vocabulary/chunk/[chunkName]` - Load vocabulary chunk
- `GET /api/vocabulary/filtered` - Load filtered vocabulary
- `GET /api/vocabulary/due` - Load due cards for spaced repetition
- `GET /api/vocabulary/metadata` - Get vocabulary metadata
- `GET /api/vocabulary/search` - Search vocabulary items

### Data Structure

Each vocabulary item includes:
- Bulgarian and German words
- Pronunciation guides
- Cultural context
- Example sentences
- Difficulty level
- Frequency rating
- Learning notes

## 🔄 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Critical fixes

### CI/CD Pipeline

1. **Linting** - ESLint with accessibility rules
2. **Testing** - Unit, component, and E2E tests
3. **Coverage** - Code coverage with diff checks
4. **Audit** - Security vulnerability scanning
5. **Build** - Production build verification
6. **Lighthouse** - Performance and accessibility testing

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: jsx-a11y accessibility rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks
- **lint-staged**: Staged file linting

## 📈 Performance

### Optimization Strategies
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker with Workbox
- **Bundle Analysis**: Regular bundle size monitoring
- **Virtual Scrolling**: Efficient list rendering

### Monitoring
- **Performance Metrics**: Load time, interaction metrics
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Learning progress tracking

## 🌐 Accessibility

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: 4.5:1 minimum contrast ratio
- **Focus Management**: Visible focus indicators
- **Text Scaling**: 200% zoom support

### Testing
- **Automated**: Lighthouse accessibility testing
- **Manual**: Keyboard-only navigation testing
- **Screen Reader**: NVDA and VoiceOver testing

## 🔒 Security

### Measures
- **Content Security Policy**: Restrictive CSP headers
- **Dependency Auditing**: Regular npm audit checks
- **HTTPS Only**: Production deployment over HTTPS
- **Input Validation**: Server-side validation
- **XSS Prevention**: Content sanitization

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Technical Debt](docs/TECH_DEBT.md)
- [Migration Guide](docs/MIGRATION_TO_SVELTEKIT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bulgarian and German language learners
- Open source community
- Accessibility advocates
- Language education experts

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues

---

**Built with ❤️ for language learners everywhere**