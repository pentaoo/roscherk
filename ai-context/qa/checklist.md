# QA Checklist

Run through this before marking implementation work complete.

## Visual

- Layout matches the intended Figma structure.
- Text does not overflow or overlap at common desktop and mobile widths.
- Icons render at the expected size and align with text or controls.

## Accessibility

- Icon-only controls have `aria-label`.
- Decorative icons have empty `alt`.
- Interactive elements are keyboard reachable.

## Technical

- No broken local asset paths.
- No unnecessary external dependencies.
- Browser console has no relevant runtime errors.

