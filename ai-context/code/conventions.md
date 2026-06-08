# Code Conventions

## General

- Keep the site static unless a feature requires a build tool.
- Prefer small, readable changes over broad rewrites.
- Keep file paths relative and portable.
- Do not introduce dependencies for simple HTML, CSS, or JavaScript behavior.

## HTML

- Use semantic elements where they fit.
- Add accessible names to icon-only buttons.
- Keep decorative image icons with empty `alt`.

## CSS

- Keep shared values near the top when CSS variables are introduced.
- Avoid styling that depends on fragile DOM depth.
- Prefer reusable utility-like classes only when they reduce repeated CSS.
- For open/close or morphing animations, animate one stable outer shell and reveal inner blocks inside it. See `project/AGENTS_Sheji.md#animation-structure`.

## JavaScript

- Keep behavior unobtrusive.
- Do not depend on external libraries unless the feature needs them.
- Guard DOM lookups when scripts may run before an element exists.
- For reversible transitions, set the shell's initial geometry before applying the target geometry, and keep transition cleanup resilient to missed `transitionend` events.
