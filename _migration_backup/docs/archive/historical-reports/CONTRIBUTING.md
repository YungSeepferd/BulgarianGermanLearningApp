# Contributing to Bulgarian-German Learning App

Thank you for your interest in contributing to the Bulgarian-German Learning App! This document provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment (see [DEVELOPMENT.md](./DEVELOPMENT.md))

## Development Workflow

### Branch Naming

Use the following branch naming conventions:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests

### Pull Requests

1. Create a new branch for your changes
2. Make your changes
3. Add tests if applicable
4. Update documentation
5. Run tests and ensure they pass
6. Submit a pull request to the `main` branch

## Code Style

### Rust

- Follow the [Rust Style Guide](https://doc.rust-lang.org/1.0.0/style/)
- Run `cargo fmt` before committing
- Run `cargo clippy` to check for common mistakes

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- Use ESLint and Prettier for code formatting

## Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a PR
- Update tests when changing functionality

## Reporting Issues

When reporting issues, please include:
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (browser, OS, etc.)
- Any relevant error messages

## Feature Requests

For feature requests, please:
1. Check if a similar request already exists
2. Describe the feature and why it would be valuable
3. Include any relevant use cases

## Code Review Process

1. A maintainer will review your PR
2. You may be asked to make changes
3. Once approved, a maintainer will merge your PR

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE).
