# Hugo Survival Notes

> Adapted from Janert's "A Hugo Survival Guide" ([gist](https://gist.github.com/janert/4e22671044ffb06ee970b04709dd7d81)). This summary highlights the conventions and debugging tactics most relevant to the Bulgarian–German Learning App.

## Core Operating Model

- **Static files map 1:1 to URLs**
  - Every public URL must resolve to an actual file (`index.html`) or directory in `public/`.
  - Avoid assuming dynamic routing—missing files surface as 404s that Hugo cannot intercept.
- **Strict directory hierarchy**
  - Hugo expects a tree of directories. A folder either renders as a list page or acts as a bundle for a single page.
  - `content/foo/bar.md` → `public/foo/bar/index.html` (single page).
  - `content/foo/bar/index.md` → same output, but treat as bundle (images live beside `index.md`).
- **Single vs. list pages**
  - Files become *single* pages rendered with `single.html`.
  - Directories become *list* pages rendered with `list.html`; add `_index.md` to inject custom copy or front matter.

## Input Authoring Guidelines

- **Front matter is configuration**
  - `draft`, `date`, `slug`, `url`, `aliases`, `layout`, and `weight` directly control routing and visibility.
  - Leave `draft` out unless you intend to hide content; `hugo server -D` is required to preview drafts.
- **Markdown limitations**
  - Emphasis cannot span paragraphs; protect script-friendly markup (MathJax, underscores) with inline HTML or shortcodes.
  - Enable embedded HTML by setting `unsafe = true` under `[markup.goldmark.renderer]` in `config.toml`.
- **Shortcodes**
  - Hugo shortcodes live in `layouts/shortcodes/` and provide richer markup than Markdown alone.
  - Use paired shortcodes (`{{< callout >}}`) to wrap content with custom classes or layout.

## Template Layout & Overrides

- **Templates resolve by specificity**
  1. Hugo determines page kind (`home`, `section`, `taxonomy`, `single`, `list`).
  2. It searches `layouts/<section>/<kind>.html`, falling back to `layouts/_default/`.
  3. If absent, it checks the active theme using the same hierarchy.
  4. Override theme templates by mirroring the path inside project-level `layouts/`.
- **Base templates and partials**
  - `layouts/_default/baseof.html` defines the page shell; `{{ block "main" . }}` yields to child templates.
  - Partial templates in `layouts/partials/` encapsulate reusable markup and can be called from any template via `{{ partial "name" . }}`.

## Directory Cheat Sheet

- **`content/`**
  - Source Markdown/HTML with front matter.
  - Use `_index.md` to customize list pages.
- **`static/`**
  - Copied verbatim to the site root (good for manifest, service worker, fonts).
- **`assets/`**
  - Source files processed by Hugo Pipes (SCSS, JS pipelines, image transforms).
- **`data/`**
  - JSON/YAML/TOML data accessible via `.Site.Data`. Use for vocab/grammar dictionaries.
- **`layouts/`**
  - Project-specific templates, partials, base templates, shortcodes.
- **`themes/<theme>/`**
  - Upstream theme templates. Override by shadowing files in project `layouts/`.

## Workflow Best Practices

- **Start from the theme's example site**
  - Copy `exampleSite/config.*` and `archetypes/` into the project before customizing.
  - Themes often rely on specific params or menu definitions.
- **Use `hugo new` for content**
  - Keeps front matter consistent with archetypes.
  - Remove `draft: true` when ready to publish.
- **Prefer bundles for content with assets**
  - Structure as `content/section/slug/index.md` and drop images beside it to keep paths self-contained.
- **Clean builds**
  - Delete `public/` and `resources/` when chasing layout issues—the CLI never removes stale files.
- **Local server tips**
  - `hugo server -D --logLevel=debug --disableFastRender` helps trace template reloads.
  - Use `--bind 0.0.0.0` for device testing on the LAN.

## Debugging & Troubleshooting Checklist

- **Missing page or 404**
  - Confirm the source file path matches the intended URL; check for `draft`, `expiryDate`, or future `date` values.
  - Ensure bundles use `index.md` and not arbitrary filenames.
- **Wrong template rendering**
  - Run `hugo --templateMetrics --templateMetricsHints` to inspect which template matched.
  - Verify the override path in `layouts/` mirrors the content path.
  - Check front matter `layout` overrides and section-specific templates (`layouts/<section>/single.html`).
- **List page missing content**
  - Ensure the directory lacks `index.md` (otherwise treated as leaf bundle).
  - Provide `_index.md` when custom copy is needed on list pages.
- **HTML stripped from Markdown**
  - Confirm `unsafe = true` in Goldmark config.
  - Wrap raw HTML inside shortcodes if sanitation is necessary.
- **Assets not loading**
  - Files under `static/` publish to root; verify references use absolute `/` paths.
  - For bundles, reference images relative to the page (`/section/slug/img.png`).
- **Theme upgrade regressions**
  - Keep track of overrides in project `layouts/`. Run `git diff themes/<theme>` after updates.

## Additional Resources

- **Official docs**: [https://gohugo.io/documentation/](https://gohugo.io/documentation/)
- **Template engine reference**: [https://pkg.go.dev/html/template](https://pkg.go.dev/html/template)
- **Goldmark config**: [https://gohugo.io/getting-started/configuration-markup/](https://gohugo.io/getting-started/configuration-markup/)

Keep this guide nearby when debugging template routing, URL mismatches, or theme overrides—the majority of Hugo issues stem from directory structure assumptions and front matter defaults.
