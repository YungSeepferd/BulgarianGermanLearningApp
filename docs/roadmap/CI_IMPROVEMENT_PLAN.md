# CI Improvement Roadmap

## 🎯 Objective
To transform the current `scripts/simulate-ci.js` into a robust, modular, and maintainable CI system that provides reliable feedback and integrates seamlessly with GitHub Actions.

---

## 📅 Phases

### **Phase 1: Immediate Improvements (Completed ✅)**
*   **Goal**: Stabilize the CI simulation script and prevent hanging processes.
*   **Actions**:
    *   Replaced `exec` with `spawn` for better process control.
    *   Implemented configurable timeouts for each step.
    *   Added error handling for process crashes.
    *   Ensured proper exit codes are returned.
*   **Outcome**: A reliable base script that doesn't hang indefinitely.

### **Phase 2: Enhanced Error Reporting & Diagnostics**
*   **Goal**: Make it easier to understand *why* a step failed without digging through raw logs.
*   **Actions**:
    *   Capture `stderr` separately and display it prominently on failure.
    *   Parse output from common tools (ESLint, Vitest, tsc) to show summary statistics (e.g., "5 errors, 2 warnings").
    *   Create a "Diagnostics" section in the results JSON file.
*   **Technical Spec**:
    *   Wrap `spawn` in a helper that buffers `stderr`.
    *   Regex matchers for tool output patterns.

### **Phase 3: Modular CI Pipeline Design**
*   **Goal**: Allow running specific parts of the CI pipeline to speed up local development.
*   **Actions**:
    *   Refactor `scripts/simulate-ci.js` to accept arguments (e.g., `--only lint`, `--skip build`).
    *   Decouple steps into standalone functions or separate modules.
    *   Implement a "watch mode" for specific steps (e.g., `test:unit`).
*   **Technical Spec**:
    *   Use `commander` or `yargs` (or simple `process.argv` parsing) for CLI arguments.
    *   Define a `Step` interface: `name`, `command`, `dependencies`, `run()`.

### **Phase 4: Integration with GitHub Actions**
*   **Goal**: Ensure parity between local and remote CI and leverage GitHub Actions features.
*   **Actions**:
    *   Update `.github/workflows/ci.yml` (or create if missing) to mirror the local steps.
    *   Configure caching for `pnpm` and `Playwright` binaries.
    *   Set up parallel jobs for independent steps (Unit Tests vs. Linting).
    *   Implement artifact upload for test reports.
*   **Technical Spec**:
    *   GitHub Actions matrix strategy for multi-browser testing (if needed).
    *   `actions/cache` configuration.

### **Phase 5: Monitoring and Maintenance**
*   **Goal**: Proactively identify CI issues and performance regressions.
*   **Actions**:
    *   Track build and test durations over time.
    *   Set up alerts for consecutive CI failures on `main`.
    *   Regularly update dependency versions and tool configurations.
*   **Technical Spec**:
    *   Simple dashboard or report based on `ci-simulation-results.json` history (if stored).
    *   GitHub Actions workflow status badge in `README.md`.

---

## 🛤️ Implementation Timeline

| Phase | Estimated Effort | Priority | Dependencies |
| :--- | :--- | :--- | :--- |
| **Phase 2** | 2 Days | High | Phase 1 |
| **Phase 3** | 3 Days | Medium | Phase 2 |
| **Phase 4** | 2 Days | High | Phase 3 |
| **Phase 5** | Ongoing | Low | Phase 4 |

---

## 📋 Success Criteria

1.  **Parity**: Local simulation passes if and only if Remote CI passes.
2.  **Speed**: Local simulation of "lint + unit tests" takes < 2 minutes.
3.  **Clarity**: Error messages point directly to the failing file/line.
4.  **Reliability**: CI flakiness is < 1%.

---

## 🔗 References
*   [CI Workflow Design](../ci-cd/CI_WORKFLOW.md)
*   [CI Best Practices](../development/CI_BEST_PRACTICES.md)