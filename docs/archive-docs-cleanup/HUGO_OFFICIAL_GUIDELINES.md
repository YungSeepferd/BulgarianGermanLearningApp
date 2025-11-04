# Hugo Implementation Guidelines (Official Documentation Digest)

This digest summarizes best practices from the official Hugo documentation at [https://gohugo.io/documentation/](https://gohugo.io/documentation/). Use it alongside `docs/HUGO_GUIDELINES.md`, which captures lessons learned from community experience. Each section links back to authoritative references for deeper detail.

## Project Setup and Configuration

- **Install Hugo Extended** for SCSS and image processing support. Follow the platform-specific instructions under [https://gohugo.io/installation/](https://gohugo.io/installation/).
- **Initialize structure** with `hugo new site mysite`. Understand the default directory layout explained in [https://gohugo.io/getting-started/directory-structure/](https://gohugo.io/getting-started/directory-structure/).
- **Choose configuration format** (`config.toml`, `.yaml`, `.json`). Keep environment-specific overrides in `config/_default/` (recommended pattern in [https://gohugo.io/getting-started/configuration/](https://gohugo.io/getting-started/configuration/)).
- **Set baseURL explicitly**—critical for subpath deployments such as GitHub Pages.

## Content Authoring

- Use `hugo new section/name.md` so artifacts inherit archetype front matter. See [https://gohugo.io/content-management/archetypes/](https://gohugo.io/content-management/archetypes/).
- Respect the **page bundle** model: `index.md` with assets beside it (`leaf` bundles) or `_index.md` for list content (`branch` bundles). Details at [https://gohugo.io/content-management/page-bundles/](https://gohugo.io/content-management/page-bundles/).
- Manage publication flags (`draft`, `publishDate`, `expiryDate`) as described in [https://gohugo.io/content-management/organization/](https://gohugo.io/content-management/organization/).
- Use Hugo taxonomies instead of ad hoc tags—configure under `[taxonomies]` and reference [https://gohugo.io/content-management/taxonomies/](https://gohugo.io/content-management/taxonomies/).

## Templates and Layouts

- Understand the **lookup order** so overrides live under `layouts/` while keeping the theme untouched. Reference [https://gohugo.io/templates/lookup-order/](https://gohugo.io/templates/lookup-order/).
- Wrap page templates with `baseof.html` and define content blocks for consistency ([https://gohugo.io/templates/base/](https://gohugo.io/templates/base/)).
- Organize reusable chunks as partials (`layouts/partials/*.html`) and call via `{{ partial "name" . }}`—see [https://gohugo.io/templates/partials/](https://gohugo.io/templates/partials/).
- Delegate logic to Go template functions carefully; rely on built-in `where`, `range`, and `dict` operations. Review [https://gohugo.io/templates/intro/](https://gohugo.io/templates/intro/).

## Shortcodes and Markdown Rendering

- Store custom shortcodes in `layouts/shortcodes/`. Default set documented at [https://gohugo.io/content-management/shortcodes/](https://gohugo.io/content-management/shortcodes/).
- Configure Goldmark (Markdown renderer) in `[markup.goldmark]` to enable raw HTML if needed ([https://gohugo.io/getting-started/configuration-markup/](https://gohugo.io/getting-started/configuration-markup/)).
- Use shortcodes to encapsulate complex HTML or script hooks; avoid raw HTML in Markdown when you can provide a structured shortcode API.

## Data, Assets, and Pipelines

- Load structured data from `data/` via `.Site.Data`. JSON/YAML/TOML supported; see [https://gohugo.io/templates/data-templates/](https://gohugo.io/templates/data-templates/).
- Leverage Hugo Pipes for SCSS, JS bundling, and image processing. Pipeline docs: [https://gohugo.io/hugo-pipes/](https://gohugo.io/hugo-pipes/).
- Cache-bust fingerprints with `resources.Fingerprint` before referencing assets in templates.
- Use `assets/` for pipeline inputs, `static/` for pass-through files. Reference [https://gohugo.io/getting-started/directory-structure/](https://gohugo.io/getting-started/directory-structure/).

## Menus, Navigation, and Translations

- Configure menus either in content front matter (via `menu:`) or in config under `[menu]`. Guidance at [https://gohugo.io/content-management/menus/](https://gohugo.io/content-management/menus/).
- For multilingual sites, enable `defaultContentLanguage` and `languages` maps, plus translation bundles. Details at [https://gohugo.io/content-management/multilingual/](https://gohugo.io/content-management/multilingual/).

## Build, Test, and Deployment

- Use `hugo server --disableFastRender` while debugging templates; the default fast render skips some rebuilds ([https://gohugo.io/commands/hugo_server/](https://gohugo.io/commands/hugo_server/)).
- Run production builds with `hugo --minify --gc` to clean unused assets. Flags documented at [https://gohugo.io/getting-started/usage/](https://gohugo.io/getting-started/usage/).
- Enable **deployment targets** via `hugo deploy`. Configure in `config.toml` per [https://gohugo.io/hosting-and-deployment/hugo-deploy/](https://gohugo.io/hosting-and-deployment/hugo-deploy/).
- Automate with CI—official GitHub Actions guide at [https://gohugo.io/hosting-and-deployment/hosting-on-github/](https://gohugo.io/hosting-and-deployment/hosting-on-github/).

## Debugging and Diagnostics

- Enable `hugo --verbose --debug` to surface template evaluation logs.
- Use `--printUnusedTemplates` and `--printPathWarnings` for cleanup (see [https://gohugo.io/troubleshooting/](https://gohugo.io/troubleshooting/)).
- Inspect `hugo --templateMetrics --templateMetricsHints` output to chase slow layouts.
- Validate JSON/TOML/YAML front matter with `hugo --verifyConfig`.

## Recommended Workflow for This Project

1. **Bootstrap content** with project archetypes, then localize as required for Bulgarian/German flows.
2. **Keep templates modular**—store shared logic in partials, call from both vocabulary and grammar layouts.
3. **Process SCSS via Hugo Pipes** to ensure fingerprints align with service worker caching.
4. **Gate content rollout** using `publishDate` instead of removing files—preserves permalinks and taxonomy relations.
5. **Document overrides**: whenever shadowing theme templates, note them in `docs/HUGO_GUIDELINES.md` and/or `docs/DEVELOPMENT.md` to prevent regressions.

Consult the official documentation for deeper references and command syntax. This digest is maintained to keep key practices discoverable inside the repository.
