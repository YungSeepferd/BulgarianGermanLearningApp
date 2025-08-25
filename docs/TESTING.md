# Testing Guide - Bulgarian-German Learning App

## Overview

This document provides comprehensive testing guidelines for the Bulgarian-German Learning App, including setup, execution, and best practices.

## Testing Framework

The project uses the **optimal testing framework** for Rust/WASM applications:

- **`wasm-bindgen-test`**: Industry standard for WASM-specific testing
- **`cargo test`**: Standard Rust testing for core logic
- **Browser-based testing**: Real browser environment testing

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   └── basic_flow.rs       # User journey tests
├── integration/            # Integration tests
└── unit/                   # Unit tests (in src/ alongside code)

apps/web/tests/             # Web-specific tests
├── integration_test.rs     # Web integration tests
└── audio.rs               # Audio functionality tests

packages/core/tests/        # Core library tests
├── models_test.rs         # Data model tests
└── spaced_rep_test.rs     # Algorithm tests
```

## Running Tests

### Quick Test (Recommended)
```bash
./test-runner.sh
```

### Manual Testing

#### Core Library Tests
```bash
cd packages/core
cargo test
```

#### Web Application Tests
```bash
cd apps/web

# Standard Rust tests
cargo test

# WASM tests in browser
wasm-pack test --headless --chrome
```

#### Integration Tests
```bash
cargo test --test integration
```

## Test Categories

### 1. Unit Tests
- **Location**: Alongside source code in `src/` directories
- **Purpose**: Test individual functions and components
- **Framework**: Standard `cargo test`

### 2. Integration Tests
- **Location**: `apps/web/tests/` and `tests/integration/`
- **Purpose**: Test component interactions
- **Framework**: `wasm-bindgen-test`

### 3. End-to-End Tests
- **Location**: `tests/e2e/`
- **Purpose**: Test complete user workflows
- **Framework**: `wasm-bindgen-test` with browser automation

## Writing Tests

### Unit Test Example
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vocabulary_item_creation() {
        let item = VocabularyItem {
            word: "Здравей".to_string(),
            translation: "Hallo".to_string(),
            category: "Greetings".to_string(),
            level: "A1".to_string(),
            notes: Some("Formal greeting".to_string()),
        };
        
        assert_eq!(item.word, "Здравей");
        assert_eq!(item.translation, "Hallo");
    }
}
```

### WASM Test Example
```rust
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_local_storage_integration() {
    use gloo_storage::{LocalStorage, Storage};
    
    let test_data = "test_value";
    LocalStorage::set("test_key", test_data).unwrap();
    
    let retrieved: String = LocalStorage::get("test_key").unwrap();
    assert_eq!(test_data, retrieved);
    
    LocalStorage::delete("test_key");
}
```

## Test Coverage Goals

- **Core Logic**: 90%+ coverage
- **State Management**: 85%+ coverage  
- **UI Components**: 70%+ coverage
- **Integration**: Key user flows covered

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled daily runs

## Performance Testing

### Benchmarks
```bash
cd packages/core
cargo bench
```

### WASM Bundle Size
```bash
cd apps/web
wasm-pack build --release
ls -la pkg/*.wasm
```

## Browser Compatibility Testing

Supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Debugging Tests

### Enable Debug Logging
```bash
RUST_LOG=debug cargo test
```

### Browser DevTools
For WASM tests, use browser developer tools to inspect:
- Console logs
- Network requests
- Local storage
- Performance metrics

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Test Organization**: Group related tests in modules
3. **Mock Data**: Use realistic test data in Bulgarian/German
4. **Async Testing**: Properly handle async operations in WASM tests
5. **Cleanup**: Always clean up test data (local storage, etc.)

## Common Issues

### WASM Test Failures
- Ensure browser is available for headless testing
- Check CORS policies for local development
- Verify WASM target is installed: `rustup target add wasm32-unknown-unknown`

### State Persistence Tests
- Clear local storage between tests
- Use unique keys for test data
- Handle browser storage quotas

## Future Enhancements

- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Performance benchmarking
- [ ] Cross-browser automated testing
- [ ] Mobile device testing
