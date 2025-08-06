# Bulgarian-German Learning App (Rust Rewrite)

This repository is being refactored into a Rust-powered vocabulary and grammar trainer.
The project targets both the web (via WebAssembly) and native desktops while sharing a
common library for data models and learning logic.

## Project Layout

```
.
├── Cargo.toml            # Workspace definition
├── lib/                  # Shared library crate
├── web/                  # Yew-based web frontend (WASM)
├── desktop/              # Desktop application (egui/eframe placeholder)
├── data/                 # Vocabulary and grammar data
└── README.md
```

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- WASM target: `rustup target add wasm32-unknown-unknown`
- (optional) [Trunk](https://trunkrs.dev/) for bundling the web frontend

## Building

### Web (WASM)
```bash
cd web
trunk serve # or `trunk build --release`
```

### Desktop
```bash
cargo run -p bglg_app_desktop
```

## Testing

Run checks across the workspace:
```bash
cargo test
```

---
This is a work in progress as the codebase migrates from JavaScript to Rust.
