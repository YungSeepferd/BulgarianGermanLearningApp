# Security & Dependency Audit

Last Updated: 2025-10-19

## Scope

Review project dependencies (Node, Go, Hugo) and security posture for the Bulgarian-German Learning App. Analyze service worker caching, HTTP headers, external resources, and CI safeguards to identify vulnerabilities and maintenance risks.

## Summary Findings

- **Minimal dependency surface:** `package.json` lists only dev dependencies (`sass@^1.69.0`, `@playwright/test@^1.40.0`). Go module (`tools/go.mod`) pulls `urfave/cli/v2@2.25.7` and `fsnotify@1.7.0`; both current and actively maintained as of Oct 2025.
- **Service worker cache mismatch:** `static/sw.js` caches hard-coded paths (`/scss/main.min.css`, `/js/app.min.js`, `/images/favicon.png`, `/fonts/Inconsolata.woff2`) that no longer exist (CSS/JS now fingerprinted via Hugo Pipes). Risk of install failure and offline shell breakage. Cache version `bgde-app-v1.2.0` outdated relative to asset names.
- **Security headers partially covered:** `layouts/partials/head.html` sets legacy meta headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`). Missing modern `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), and `Permissions-Policy`. Since these are meta tags, enforcement varies; best practice is server-side headers.
- **External resources:** Preconnect to Google Fonts and optional Google Analytics. No CSP whitelist, so script/style injection risk if GA enabled. Ensure privacy compliance (GDPR) via consent before `gtag` load.
- **Dependency monitoring gap:** No `npm audit` or `go list -m -u` checks in CI; rely on manual updates. `ci.yml` installs dependencies and runs lints/tests but no security scanning.
- **PWA security:** Service worker accepts messages for cache clearing/prefetch; no origin validation. Prefetch feature caches arbitrary URLs provided via `PREFETCH_VOCABULARY`, though invocation requires trusted code path (main app). Data cache stores responses without expiration metadata aside from manual cleanup.
- **Lack of credentials handling:** No `.env` files or secrets in repo; safe. Ensure analytics keys stored in `hugo.toml` remain sanitized.

## Dependency Inventory

### Node (`package.json`)

| Package | Version | Type | Notes |
| --- | --- | --- | --- |
| `sass` | ^1.69.0 | devDependency | Used for SCSS builds; monitor for CVEs (recent CVE-2023-1567 fixed in 1.63+). |
| `@playwright/test` | ^1.40.0 | devDependency | E2E runner; frequent updates (~monthly). Recommend staying within latest minor to receive security patches. |

_No production npm dependencies present._

### Go (`tools/go.mod`)

| Module | Version | Purpose | Notes |
| --- | --- | --- | --- |
| `github.com/urfave/cli/v2` | v2.25.7 | CLI tooling (`hugo-bg-de`, etc.) | Current as of Oct 2025. |
| `github.com/fsnotify/fsnotify` | v1.7.0 | File watching | Up-to-date. |
| Indirect deps | `x/sys v0.4.0`, `go-md2man`, `blackfriday`, `smetrics` | Used by CLI docs generation | Check for updates if CLI expands. |

## Security Posture Analysis

- **Service Worker (`static/sw.js`):** Hard-coded asset paths and offline routes out of sync with actual build output (`resources.Get` generates fingerprinted assets). Without dynamic manifest injection, offline caching fails, potentially leaving stale caches and 404 responses. Need to align with Hugo pipeline or generate manifest during build.
- **Cache Scope:** `STATIC_CACHE_URLS` includes `/offline/`, `/vocabulary/`, `/grammar/`, `/practice/`. If these pages rely on dynamic data, caching raw HTML could expose outdated content. Use versioning and `cache.delete` to avoid stale data.
- **Data Caching:** `DATA_URLS` caches `/data/vocabulary.json` and `/data/grammar.json`. Ensure these endpoints are publicly accessible and sanitized; they contain learner content only (no PII). Stale data acceptable but consider ETag checking.
- **Meta Security Headers:** Use of meta tags for headers is limited; real HTTP headers should be configured via GitHub Pages or reverse proxy. Add `Content-Security-Policy` to mitigate XSS. Example: `default-src 'self'; img-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' https://www.googletagmanager.com` (adjust for analytics).
- **External Scripts/Fonts:** Rely on Google CDN; ensure fallback if offline. Provide privacy notice for GA tracking.
- **LocalStorage / Data Storage:** All keys under `bgde:` (per data audit) contain educational data. No sensitive info, but consider `localStorage.clear()` message handler security—currently any client controlled script can trigger `CLEAR_CACHE`. Since SW only listens to messages from same origin, risk minimal.
- **CI/CD Security:** `.github/workflows/ci.yml` uses official actions (`actions/checkout@v4`, `setup-node`, `peaceiris/actions-hugo`, `setup-go`). No pinned SHAs for third-party action `peaceiris/actions-hugo@v2`. Consider pinning to commit SHA to mitigate supply chain risk. No secret usage.

## Recommendations

- **Align service worker with fingerprinted assets:** Generate asset manifest during Hugo build (e.g., via templated `sw.js` or injecting hashed file list using Hugo `resources`). Remove hard-coded `/scss/main.min.css` references in favor of runtime-managed manifest. Increment cache versions upon deploy.
- **Add CSP & HSTS:** Configure `Content-Security-Policy`, `Strict-Transport-Security`, and `Permissions-Policy` via meta tags (limited) or, preferably, server headers (GitHub Pages supports `_headers` file). Document required directives in `docs/DEPLOYMENT_STATUS.md`.
- **Implement dependency scanning:** Add CI steps running `npm audit --production --omit=dev` (even though dev-only, catches references) and `go list -m -u all` or `go install golang.org/x/vuln/cmd/govulncheck`. Enable Dependabot (if not already) for npm/go modules.
- **Pin GitHub Actions:** Replace floating `@v2`, `@v4` tags with commit SHAs for `actions/checkout`, `setup-node`, `peaceiris/actions-hugo`, `setup-go` to reduce supply chain risk. Alternatively enable Dependabot for workflows.
- **Document SW security practices:** Update `docs/DEVELOPMENT.md` or new `docs/PWA_SECURITY.md` describing cache versioning, message handling, and offline data scope.
- **Analytics consent:** If using Google Analytics (`.Site.Params.googleAnalytics` set), ensure user consent is required before loading script. Add note to `docs/ARCHITECTURE.md`.

## Next Steps

Pending approval, move on to **Audit Slice 9: Refactoring roadmap assembly**. Address service worker caching fixes and security header enhancements in upcoming refactor tasks.
