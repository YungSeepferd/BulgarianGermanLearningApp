# Bulgarian-German Learning Application

A modern tandem learning platform for mastering Bulgarian and German, built with Svelte 5 and SvelteKit.

## ✨ Features

- **🔄 Bidirectional Learning**: Instantly switch between German→Bulgarian and Bulgarian→German
- **🎯 Smart Practice**: Flashcard system with progress tracking and statistics
- **🔍 Advanced Search**: Real-time filtering by text, category, and tags
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **💾 Offline Capability**: Full functionality without internet connection
- **♿ Accessible**: WCAG 2.1 AA compliant with keyboard navigation
- **📊 Progress Tracking**: Detailed statistics, favorites, and practice history
- **⚡ Fast Performance**: Optimized bundle size and instant loading

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- `pnpm` (install via `npm install -g pnpm`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BulgarianApp-Fresh
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Development

### Key Commands
| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start local dev server |
| `pnpm run build` | Build for production (Static) |
| `pnpm run preview` | Preview production build |
| `pnpm run test` | Run Playwright E2E tests |
| `pnpm run test:unit` | Run Vitest unit tests |
| `pnpm run test:accessibility` | Run accessibility tests |
| `pnpm run test:all` | Run all tests |
| `pnpm run check` | Run Svelte/TypeScript checks |
| `pnpm run lint` | Run ESLint |

### Project Structure
```
src/
├── lib/
│   ├── components/     # UI Components (Svelte 5)
│   ├── data/          # Data loading & processing
│   ├── state/         # Global state (Svelte 5 Runes)
│   ├── types/         # TypeScript definitions
│   └── utils/         # Utility functions
├── routes/            # SvelteKit pages
└── app.html           # Root HTML template
```

### Technology Stack
- **Framework**: [SvelteKit](https://kit.svelte.dev/) with Svelte 5 Runes
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: TypeScript (strict mode)
- **Testing**: Playwright (E2E) + Vitest (Unit)
- **Deployment**: GitHub Pages (Static)

## 📚 Documentation
- [**Architecture Guide**](docs/ARCHITECTURE.md) - Technical stack, state management, and data flow
- [**Roadmap**](docs/ROADMAP.md) - Project phases and implementation plan
- [**Current Work Plan**](CURRENT_WORK_PLAN.md) - Development status and priorities
- [**Next Steps**](NEXT_STEPS_PLAN.md) - Immediate action items and deployment checklist

## 🧪 Testing

The application includes comprehensive test coverage:

```bash
# Run all tests
pnpm run test:all

# Run specific test suites
pnpm run test:unit          # Unit tests with Vitest
pnpm run test:e2e           # End-to-end tests with Playwright
pnpm run test:accessibility # Accessibility tests with Axe
pnpm run test:components    # Component tests
```

### Test Coverage
- ✅ Unit tests for state management and data loading
- ✅ E2E tests for critical user flows
- ✅ Accessibility tests for WCAG compliance
- ✅ Component tests for UI interactions
- ✅ Visual regression tests

## 🚀 Production Deployment

### Build for Production
```bash
pnpm run build
```

### Preview Production Build
```bash
pnpm run preview
```

### Deployment
The application is configured for deployment to GitHub Pages. The build process creates a static site that can be deployed to any static hosting service.

## 🤝 Contributing

We welcome contributions! Please refer to the [Roadmap](docs/ROADMAP.md) for current priorities.

### Development Guidelines
1. Use `pnpm` for package management
2. Follow Svelte 5 patterns (Runes over Stores)
3. Ensure strict type safety with TypeScript
4. Write tests for new features
5. Follow the existing code style and structure

### Code Quality
- ESLint configuration for code quality
- Prettier for code formatting
- Strict TypeScript mode enabled
- Comprehensive test coverage required

## 📊 Current Status

### ✅ Completed
- Svelte 5 migration with Runes
- Core learning functionality
- Responsive design
- Accessibility compliance
- Test suite implementation
- Performance optimization

### 🔄 In Progress
- CI/CD pipeline setup
- Production monitoring
- Advanced features development

## 🎯 Future Enhancements

- Spaced repetition algorithm
- Audio pronunciation support
- Grammar exercises
- Social learning features
- User accounts and sync

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for language learning applications.