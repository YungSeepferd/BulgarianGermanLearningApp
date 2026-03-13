# Bun MCP Server Setup

**Date**: January 28, 2026
**Version**: Bun 1.3.7, mcp-bun 1.3.0

## Overview

The Bun MCP server has been successfully installed and configured for this project. Bun is a fast JavaScript runtime compatible with Node.js that can significantly improve build times and execution performance.

## Installation Details

### What Was Installed

1. **Bun Runtime** (v1.3.7)
   - Location: `local-bun/bun`
   - Platform: macOS ARM64 (Apple Silicon)
   - Downloaded from: https://github.com/oven-sh/bun/releases/latest

2. **mcp-bun MCP Server** (v1.3.0)
   - Location: `mcp-bun/src/mcp-bun.ts`
   - Repository: https://github.com/carlosedp/mcp-bun
   - Run from source with Bun runtime

### Configuration

The MCP server is configured in `.vscode/mcp.json`:

```json
{
  "servers": {
    "bun": {
      "command": "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/local-bun/bun",
      "args": ["run", "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/mcp-bun/src/mcp-bun.ts"],
      "env": {
        "DISABLE_NOTIFICATIONS": "true"
      }
    }
  }
}
```

## Available Tools

### Core Execution Tools

- **run-bun-script-file**: Execute JavaScript/TypeScript files with Bun
- **run-bun-eval**: Execute code directly with Bun eval

### Package Management

- **run-bun-install**: Install dependencies using Bun's package manager
- **run-bun-script**: Execute npm scripts with Bun

### Build & Optimization

- **run-bun-build**: Build and optimize projects with Bun's bundler
- **run-bun-test**: Execute tests with Bun's fast test runner

### Performance Analysis

- **analyze-bun-performance**: Analyze project performance
- **benchmark-bun-script**: Benchmark script performance

### Server Management

- **start-bun-server**: Start optimized Bun servers
- **start-node-server**: Start Node.js servers for compatibility
- **list-servers**: List all running servers
- **stop-server**: Stop running servers
- **get-server-logs**: Retrieve server logs

### Version Management

- **get-bun-version**: Get current Bun version
- **list-bun-versions**: List available installations
- **select-bun-version**: Select specific Bun version

## Bun vs Node.js Performance

### Key Benefits of Bun

1. **Speed**: Bun is typically 2-4x faster than Node.js
2. **Package Manager**: Bun's package manager is 20x faster than npm
3. **TypeScript Support**: Runs TypeScript directly without compilation
4. **Compatibility**: Drop-in replacement for most Node.js projects
5. **Built-in Test Runner**: Fast test execution with built-in tools
6. **Bundling**: Built-in bundler for production builds

### Performance Comparison

- **Install dependencies**: Bun ~20x faster than npm
- **Run scripts**: Bun ~2-4x faster than Node
- **Test execution**: Bun ~10x faster than Jest
- **Build time**: Significantly faster with built-in bundler

## Migration to Bun

### Current Package Manager

The project currently uses **pnpm**. You can gradually migrate to Bun:

```bash
# Install dependencies with Bun (faster)
./local-bun/bun install

# Run scripts with Bun (faster)
./local-bun/bun run dev
./local-bun/bun run build
./local-bun/bun run test

# Run tests with Bun (much faster)
./local-bun/bun test
```

### Gradual Migration Strategy

1. **Phase 1**: Use Bun for development (dev, build, test)
2. **Phase 2**: Switch package manager to Bun (bun install)
3. **Phase 3**: Update CI/CD pipelines to use Bun
4. **Phase 4**: Remove pnpm dependency completely

## Usage Examples

### Running Scripts

```bash
# Instead of: pnpm run dev
./local-bun/bun run dev

# Instead of: pnpm run build
./local-bun/bun run build

# Instead of: pnpm run test
./local-bun/bun test
```

### Installing Dependencies

```bash
# Instead of: pnpm install
./local-bun/bun install

# Install specific package
./local-bun/bun add package-name
```

### Building for Production

```bash
# Use Bun's built-in bundler
./local-bun/bun build src/index.ts --outdir ./dist --target browser

# With minification
./local-bun/bun build src/index.ts --outdir ./dist --target browser --minify
```

### Running Tests

```bash
# Run all tests
./local-bun/bun test

# Run specific test file
./local-bun/bun test tests/unit/my-test.test.ts

# With coverage
./local-bun/bun test --coverage
```

## Project-Specific Considerations

### SvelteKit with Bun

SvelteKit projects work seamlessly with Bun:

```bash
# Development server
./local-bun/bun run dev

# Production build
./local-bun/bun run build

# Preview production build
./local-bun/bun run preview
```

### Compatibility with Existing Tools

- **Vitest**: Works with Bun test runner
- **Playwright**: Compatible, no changes needed
- **TypeScript**: Runs directly without compilation
- **Tailwind CSS**: No changes needed
- **ESLint/Prettier**: Works as expected

## Updating Bun

To update Bun to the latest version:

```bash
# Download latest version
curl -fsSL https://bun.sh/install | bash

# Or manually download from GitHub releases
# https://github.com/oven-sh/bun/releases/latest
```

## Troubleshooting

### Permission Issues

If you encounter permission issues:

```bash
# Make bun executable
chmod +x local-bun/bun
```

### MCP Server Not Responding

1. Check VSCode MCP client is running
2. Verify `.vscode/mcp.json` is configured correctly
3. Check Bun binary is executable
4. Restart VSCode MCP client

### Build Failures

If Bun build fails:

1. Ensure dependencies are installed: `./local-bun/bun install`
2. Check TypeScript types: `./local-bun/bun run check`
3. Try with Node.js as fallback: `pnpm run build`

## Documentation

- **Bun Documentation**: https://bun.sh/docs
- **mcp-bun Repository**: https://github.com/carlosedp/mcp-bun
- **MCP Protocol**: https://modelcontextprotocol.io/

## Next Steps

1. Test Bun with current development workflow
2. Benchmark build times vs Node.js
3. Consider migrating package manager to Bun
4. Update CI/CD pipelines to use Bun
5. Document any Bun-specific optimizations for the project
