# Go Tooling Documentation

**Purpose**: Command-line utilities for Bulgarian-German Learning App data processing and validation

---

## Overview

The `tools/` directory contains Go-based CLI utilities for processing JSON data files and validating the application build. These tools are **supplementary** to Hugo's build system and focus on data transformation tasks.

**Important**: Hugo handles all site generation and asset optimization. These tools only process data files.

---

## Installation

### Prerequisites

- Go 1.21+ (required)
- Hugo Extended 0.128.0+ (for building the site)

### Building the Tools

From the **repository root**:

```bash
# Build the CLI binary
npm run build-tools

# Or manually:
cd tools/
go build -o ../bin/hugo-bg-de ./cmd/hugo-bg-de
cd ..
```

Binary location: `bin/hugo-bg-de`

---

## Available Commands

### 1. process-data

Process vocabulary and grammar JSON files.

**Usage**:
```bash
./bin/hugo-bg-de process-data
```

**What it does**:
- Validates `data/vocabulary.json` schema
- Validates `data/grammar.json` schema  
- Generates search index at `data/search-index.json`
- Creates derived data files in `data/processed/` (if applicable)

**When to use**:
- After editing `data/vocabulary.json`
- After editing `data/grammar.json`
- Before committing data changes
- As part of CI/CD pipeline

**Example**:
```bash
# Edit vocabulary
vim data/vocabulary.json

# Process and validate
./bin/hugo-bg-de process-data

# Verify output
cat data/search-index.json | jq '.items | length'
```

---

### 2. validate

Validate data files and check required files exist.

**Usage**:
```bash
./bin/hugo-bg-de validate
```

**What it does**:
- Checks existence of required files (`data/vocabulary.json`, `data/grammar.json`, `hugo.toml`)
- Validates JSON syntax
- Reports schema violations

**When to use**:
- Before building the site
- In pre-commit hooks
- CI/CD validation stage

**Exit codes**:
- `0`: All validations passed
- `1`: Validation errors found

---

### 3. dev

Start development server with data file watching (⚠️ **Experimental**).

**Usage**:
```bash
./bin/hugo-bg-de dev
```

**What it does**:
- Processes data files initially
- Starts Hugo development server (`hugo server --buildDrafts --buildFuture`)
- Watches `data/` directory for changes
- Reprocesses data on file changes

**Known Issues**:
- File watcher may not work correctly in all environments
- Consider using `hugo server -D` directly instead

**Alternative** (recommended):
```bash
# Terminal 1: Start Hugo dev server
npm run dev

# Terminal 2: Watch and reprocess data manually
watch -n 5 ./bin/hugo-bg-de process-data
```

---

## ⚠️ Deprecated/Removed Commands

### build (Removed)

**Status**: ❌ **REMOVED** - Use Hugo directly

**Why removed**: Duplicated Hugo's functionality. The tool attempted to wrap `hugo --minify` and add post-processing, but:
- Hugo's built-in `--minify` handles CSS/JS minification
- Service worker generation should be separate
- Build complexity increased without benefit

**Migration**:
```bash
# Before (deprecated):
./bin/hugo-bg-de build

# After (current):
hugo --minify
# or
npm run build
```

---

## Architecture

### Project Structure

```
tools/
├── cmd/
│   └── hugo-bg-de/
│       └── main.go          # CLI entry point
├── internal/
│   └── processor/
│       ├── processor.go     # Data processing logic
│       ├── vocabulary.go    # Vocabulary processing
│       └── grammar.go       # Grammar processing
├── go.mod                   # Go module definition
└── go.sum                   # Dependency checksums
```

### Internal Packages

#### `processor.DataProcessor`

Core data processing engine.

**Methods**:
- `ProcessVocabularyData()` - Process vocabulary JSON
- `ProcessGrammarData()` - Process grammar JSON
- `GenerateSearchIndex()` - Create search index
- `LoadJSONData(path string)` - Load and validate JSON file

**Usage**:
```go
import "github.com/dinz/BulgarianApp-Fresh/tools/internal/processor"

proc := processor.NewDataProcessor("content/")
err := proc.ProcessVocabularyData()
```

---

## Data Processing Pipeline

```mermaid
graph LR
    A[data/vocabulary.json] --> B[Validator]
    B --> C[Processor]
    C --> D[data/search-index.json]
    C --> E[data/processed/*]
    E --> F[Hugo Templates]
    D --> F
```

**Steps**:

1. **Load**: Read JSON from `data/` directory
2. **Validate**: Check schema compliance (required fields, data types)
3. **Transform**: Generate derived data (search index, statistics)
4. **Write**: Output to `data/processed/` or update existing files
5. **Hugo Build**: Templates consume processed data

---

## npm Script Integration

The tools are integrated into npm scripts for convenience:

| npm Script | Command | Purpose |
|------------|---------|---------|
| `npm run build-tools` | Build Go binary | Compile CLI tool |
| `npm run process-data` | `./bin/hugo-bg-de process-data` | Process data files |
| `npm run validate` | `./bin/hugo-bg-de validate` | Validate data |

**See**: `package.json` for full definitions

---

## Development

### Adding New Commands

1. Add command to `cmd/hugo-bg-de/main.go`:

```go
app := &cli.App{
    Commands: []*cli.Command{
        {
            Name:   "my-command",
            Usage:  "Description of command",
            Action: myCommandFunc,
        },
    },
}

func myCommandFunc(c *cli.Context) error {
    // Implementation
    return nil
}
```

2. Rebuild:
```bash
npm run build-tools
```

3. Test:
```bash
./bin/hugo-bg-de my-command
```

### Adding Data Processors

Create new file in `internal/processor/`:

```go
// internal/processor/example.go
package processor

func (p *DataProcessor) ProcessExampleData() error {
    // Load data
    data, err := p.LoadJSONData("data/example.json")
    if err != nil {
        return err
    }
    
    // Process
    // ...
    
    return nil
}
```

---

## Testing

### Unit Tests

From `tools/` directory:

```bash
cd tools/
go test ./...
```

### Integration Tests

```bash
# Process test data
./bin/hugo-bg-de process-data

# Validate output exists
test -f data/search-index.json && echo "PASS" || echo "FAIL"

# Build site with processed data
hugo --logLevel debug -D
```

---

## Known TODOs

From `tools/cmd/hugo-bg-de/main.go`:

| Line | Function | TODO | Priority | Action |
|------|----------|------|----------|--------|
| 355 | `minifyCSSFile` | Implement CSS minification | N/A | **REMOVE** - Hugo handles this |
| 361 | `minifyJSFile` | Implement JS minification | N/A | **REMOVE** - Hugo handles this |
| N/A | `generateServiceWorker` | Service worker generation | Low | Move to separate tool |
| N/A | `watchDataFiles` | File watcher reliability | Medium | Fix or document limitations |

**See**: `docs/REPOSITORY_AUDIT_AND_CLEANUP_PLAN.md` for cleanup plan

---

## Troubleshooting

### "required file missing: data/vocabulary.json"

**Solution**: Ensure you're running from repository root, not `tools/` directory.

```bash
# Wrong:
cd tools/
go run ./cmd/hugo-bg-de validate

# Correct:
./bin/hugo-bg-de validate
```

### "failed to write search index"

**Cause**: Permission issues or `data/` directory doesn't exist.

**Solution**:
```bash
mkdir -p data/processed
chmod u+w data/
./bin/hugo-bg-de process-data
```

### "vocabulary.json validation failed"

**Cause**: JSON syntax error or schema violation.

**Solution**:
1. Validate JSON syntax: `jq . data/vocabulary.json`
2. Check schema: See `docs/API.md` for required fields
3. Review error message for specific field issues

### Build fails: "cannot find package"

**Cause**: Go modules not downloaded.

**Solution**:
```bash
cd tools/
go mod download
go mod tidy
cd ..
npm run build-tools
```

---

## Performance

### Typical Processing Times

| Operation | File Size | Time | Notes |
|-----------|-----------|------|-------|
| Validate vocabulary.json | ~1MB | <100ms | 1000+ entries |
| Generate search index | ~1MB | <200ms | Full text indexing |
| Process grammar.json | ~500KB | <50ms | 100+ rules |

**Benchmarks**: Run on M1 Mac, Go 1.21

### Optimization Tips

- Use `go build -ldflags="-s -w"` to reduce binary size
- Process data only when JSON files change (use `make` or file hashing)
- Consider parallel processing for large datasets

---

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install Go
  uses: actions/setup-go@v4
  with:
    go-version: '1.21'

- name: Build Go tools
  run: npm run build-tools

- name: Validate data files
  run: ./bin/hugo-bg-de validate

- name: Process data
  run: ./bin/hugo-bg-de process-data

- name: Build site
  run: hugo --minify
```

**See**: `.github/workflows/deploy.yml` for full workflow

---

## Dependencies

From `tools/go.mod`:

| Package | Version | Purpose |
|---------|---------|---------|
| `urfave/cli/v2` | v2.x | CLI framework |
| `fsnotify/fsnotify` | v1.x | File watching |

**License**: All dependencies are MIT or compatible licenses.

---

## Maintenance

### Updating Dependencies

```bash
cd tools/
go get -u ./...
go mod tidy
cd ..
npm run build-tools
```

### Release Checklist

- [ ] Update version in `main.go`
- [ ] Test all commands
- [ ] Update this README with new features
- [ ] Rebuild binary: `npm run build-tools`
- [ ] Commit binary to `bin/` (optional)

---

## Future Enhancements

Potential additions (not prioritized):

- [ ] **Audio processing**: Generate TTS audio for vocabulary
- [ ] **Statistics**: Export learning progress data
- [ ] **Import/Export**: Convert between JSON and CSV formats
- [ ] **Schema validation**: JSON Schema based validation
- [ ] **Performance profiling**: Add benchmarking commands
- [ ] **Database export**: Convert to SQLite for large datasets

**See**: `docs/notes/NEXT.md` for roadmap

---

**Last Updated**: October 17, 2025  
**Maintained By**: Development Team  
**See Also**:
- `docs/DEVELOPMENT.md` - Development workflow
- `docs/API.md` - Data schema documentation
- `docs/REPOSITORY_AUDIT_AND_CLEANUP_PLAN.md` - Cleanup plan
