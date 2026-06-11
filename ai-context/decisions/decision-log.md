# Decision Log

Record stable decisions here so future AI edits can preserve them.

## 2026-05-27

- Created `ai-context/` as a project-local Markdown knowledge base for AI assistants.
- Kept AI context separate from `source/`, because `source/` is for site assets.
- Documented local SVG icon usage in `assets/icons.md`.

## 2026-06-08

- Added `ShejiMerchandising` to normalize product and collection data while preserving the static no-build-step stack.
- Added `ShejiRuntime` as the boot and collection-change event seam for vanilla JS modules.
- Kept catalogue commerce rules behind `ShejiCatalogue.createCatalogueCommerce()` so product detail work can reuse cart, search, filter, and favorite behaviour.
