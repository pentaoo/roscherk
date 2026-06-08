# File Map

## Root

- `index.html` — page structure, collection card `<template>`, script boot order.
- `styles.css` — visual styling and motion tokens.
- `script.js` — site bootstrap (search + collection init).

## Data

- `data/collections.js` — Sheji collection drop content (10 designer collections).

## JavaScript modules

- `js/motion.js` — reads CSS motion tokens (`ShejiMotion`).
- `js/collections.js` — carousel slot model, card rendering, unified collection experience (`ShejiCollections`).
- `js/search-menu.js` — search panel open/close (`ShejiSearch`).

## Assets

- `source/icons/` — local SVG icons named to match Figma and Material icon names.

## AI Context

- `ai-context/` — Markdown knowledge base for AI assistants working on this project.
