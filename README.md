# Bulgarian-German Learning Application

A modern tandem learning platform for mastering Bulgarian and German, built with Svelte 5 and SvelteKit.

## 📚 Documentation
- [**Architecture Guide**](docs/ARCHITECTURE.md) - Technical stack, state management, and data flow.
- [**Roadmap**](docs/ROADMAP.md) - Project phases and implementation plan.

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

## 🛠️ Development

### Key Commands
| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start local dev server |
| `pnpm run build` | Build for production (Static) |
| `pnpm run test` | Run Playwright E2E tests |
| `pnpm run check` | Run Svelte/TypeScript checks |
| `pnpm run lint` | Run ESLint |

### Project Structure
- `src/lib/state/` - Global state (Svelte 5 Runes)
- `src/lib/components/` - UI Components
- `static/data/` - JSON Data files

## 🤝 Contribution
Please refer to the [Roadmap](docs/ROADMAP.md) for current priorities. When contributing:
1. Use `pnpm` for package management.
2. Follow Svelte 5 patterns (Runes over Stores).
3. Ensure strict type safety.

## License
MIT