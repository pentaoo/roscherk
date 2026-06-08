# Design Tokens

Stable design values shared between CSS and JavaScript. Source of truth is `:root` in `styles.css`.

## Brand colors

| Token | Value | Alias |
|-------|-------|-------|
| `--sheji-yellow` | `#FFD014` | `--yellow` |
| `--sheji-green` | `#62DC11` | `--green` |
| `--sheji-pink` | `#F61DA0` | `--pink` |
| `--sheji-black` | `#000000` | `--black` |
| `--sheji-white` | `#FFFFFF` | — |

Supporting greens: `--green-light`, `--green-hover`, `--green-dark`, `--yellow-light`, `--gray-card`.

## Motion

Read in JavaScript via `ShejiMotion.durationMs()` / `ShejiMotion.px()`.

Animation structure rule: animate one stable outer element and reveal internal blocks inside that element. Do not create state transitions by swapping or independently animating multiple sibling shells. The search button/search panel is the reference pattern.

| Token | Value | Used for |
|-------|-------|----------|
| `--duration-search` | `360ms` | Search panel open/close, button width |
| `--duration-menu-cycle` | `760ms` | Collection carousel transforms, JS cycle lock |
| `--duration-menu-fade` | `520ms` | Hidden card opacity |
| `--duration-expand` | `720ms` | Collection card expand/collapse |
| `--duration-expand-buffer` | `100ms` | JS animation fallback after expand |
| `--duration-view-transition` | `860ms` | Non-expanded cards during collection view |

Easing: `--spring`, `--smooth`.

## Layout

| Token | Value | Used for |
|-------|-------|----------|
| `--width-expanded-max` | `632px` | Expanded collection card max width |

## Reduced motion

When `prefers-reduced-motion: reduce` is active, all `--duration-*` tokens resolve to `0ms` in CSS and `ShejiMotion.reducedMotion` is `true` in JavaScript.
