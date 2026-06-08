# Icons

## Location

All local Material SVG icons are stored in:

```text
source/icons/
```

## Naming

- Keep icon names aligned with Figma.
- Use lowercase file names with underscores when matching Material icon names.
- Reference icons by relative path from HTML or CSS, for example:

```html
<img src="./source/icons/search.svg" alt="">
```

## Usage Rules

- Use only icons that are needed by the UI.
- Prefer `alt=""` for decorative icons inside buttons or controls that already have text or `aria-label`.
- If icon color must be controlled by CSS, inline the SVG or ensure the SVG uses `currentColor`.
- Do not rename icons casually, because names are used as the bridge between Figma and implementation.

## Inventory

Current local SVG count: 1333.

