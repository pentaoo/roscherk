# File Map

## Root

- `index.html` — page structure, collection card `<template>`, script boot order.
- `styles.css` — visual styling and motion tokens.
- `script.js` — site bootstrap through `ShejiRuntime`.

## Data

- `data/collections.js` — Sheji collection drop content (10 designer collections).
- `data/products.js` — Sheji product records for the catalogue.

## JavaScript modules

- `js/motion.js` — reads CSS motion tokens (`ShejiMotion`).
- `js/merchandising.js` — normalized Sheji product and collection records (`ShejiMerchandising`).
- `js/runtime.js` — boot ordering and shared runtime events (`ShejiRuntime`).
- `js/collections.js` — carousel slot model, card rendering, unified collection experience (`ShejiCollections`).
- `js/search-menu.js` — search panel open/close (`ShejiSearch`).
- `js/catalogue.js` — catalogue commerce state plus DOM rendering (`ShejiCatalogue`).

## Assets

- `source/icons/` — local SVG icons named to match Figma and Material icon names.

## AI Context

- `ai-context/` — Markdown knowledge base for AI assistants working on this project.
