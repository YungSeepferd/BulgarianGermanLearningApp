# Bulgarian-German Learning App (Rust Rewrite)

This repository contains a Rust-powered vocabulary and grammar trainer.
The project targets the web via WebAssembly while sharing a common library for data
models and learning logic.

## Project Layout

```
.
├── Cargo.toml            # Workspace definition
├── lib/                  # Shared library crate
├── web/                  # Yew-based web frontend (WASM)
└── README.md
```

## Audio

Audio playback is implemented in Rust and exposed to the browser via WebAssembly. The
`web/src/audio.rs` module uses the Web Speech API for text‑to‑speech, allowing users to
select language, rate, and volume without relying on legacy JavaScript code.

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- WASM target: `rustup target add wasm32-unknown-unknown`
- (optional) [Trunk](https://trunkrs.dev/) for bundling the web frontend

## Building

### Web (WASM)
```bash
wasm-pack build --target web web
```

The repository includes a GitHub Actions workflow that builds the WebAssembly package
and deploys it to GitHub Pages on every push to `main`.

## Testing

Run checks across the workspace:
```bash
cargo test
```

