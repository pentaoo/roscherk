# AGENTS.md — Sheji site context for Codex / Cursor

## Project identity

The project is called **Sheji**.

Sheji is a real e-commerce fashion brand. The brand curates and presents **10 collections by Chinese designers** for the international market.

The website should not behave like a neutral fashion storefront. It should feel like an interactive, slightly provocative fashion platform that plays with the user and presents unusual clothing in a strange, loud, graphic way.

Important: this project is **Sheji**, not NOSOK. Do not use NOSOK references, naming, tone, colors, logic, or previous brand assumptions in this codebase.

## Core concept

Sheji is a curated gateway for Chinese fashion designers.

The website should communicate:

- curation;
- international fashion context;
- unusual garments;
- designer-driven collections;
- playful interface behavior;
- provocative, freaky, controversial visual energy;
- a commercial store that also behaves like an art object.

The site is a real shop, but it should not look like a generic Shopify template.

## Visual direction

The visual direction is closer to **MSCHF** than to clean luxury fashion.

Keywords:

- bright;
- controversial;
- strange;
- freaky;
- kitsch;
- loud;
- playful;
- commercial;
- aggressive;
- weird fashion;
- interactive.

Avoid turning the interface into:

- minimal luxury;
- clean SaaS;
- neutral e-commerce;
- quiet editorial;
- generic streetwear;
- standard marketplace UI.

The interface should remain usable, but it is allowed to feel visually strange and intentionally excessive.

## Brand colors

Use this palette as the main visual system:

```css
:root {
  --sheji-yellow: #FFD014;
  --sheji-green: #62DC11;
  --sheji-pink: #F61DA0;
  --sheji-black: #000000;
  --sheji-white: #FFFFFF;
}
```

### Color rules

- Yellow `#FFD014` is the main page/background color.
- Green `#62DC11` is the main button/action color.
- Pink `#F61DA0` is used for sale labels, commercial noise, diagonal banners, alerts, loud promotional elements.
- Black is used for typography, outlines, icons, and visual grounding.
- White can be used for image zones, product photo backgrounds, empty space, and contrast.
- Do not introduce new brand colors unless explicitly requested.
- Avoid soft pastel colors.
- Avoid luxury beige/gray palettes.
- Avoid gradients unless explicitly requested.

## Typography

Primary font: **Oswald**.

Use Oswald as the main typeface for:

- headings;
- buttons;
- product labels;
- navigation;
- filter labels;
- collection cards;
- sale banners;
- interface copy.

Typography should feel condensed, loud, poster-like, and commercial.

### Typography rules

- Use large compressed headings.
- Use strong contrast between huge titles and tiny product metadata.
- Keep button text clear and readable.
- Small text may feel slightly compressed, but important commerce information must remain readable.
- Avoid replacing Oswald with generic UI fonts like Inter, Roboto, or SF Pro unless used only as a fallback.
- Avoid overly elegant serif typography unless explicitly requested for a specific collection.

Recommended font stack:

```css
font-family: "Oswald", Arial, sans-serif;
```

## Current page structure

The current website direction includes:

- a top hero / collection preview area;
- collection cards;
- large visual area with clothing photos;
- diagonal pink commercial slogan/banner;
- floating green navigation buttons;
- catalogue section titled “All Clothing”;
- filter buttons: Size, Colour, Price;
- search button;
- 3-column product grid on desktop;
- product cutout images on yellow background;
- green price pills;
- pink sale labels;
- heart/favorite icons;
- cart interactions.

## Layout rules

The desktop product grid should remain **3 columns**.

The catalogue should feel spacious enough to show the clothes clearly, but the page should still feel loud and active.

### Product grid

- Desktop: 3 columns.
- Product images should remain large and visible.
- Product cards should not become conventional white cards unless explicitly requested.
- Product layout can feel sparse and poster-like.
- Keep the yellow background visible around products.
- Preserve unusual positioning, commercial badges, and graphic rhythm.

### Hero area

- The gray placeholder blocks in the current design represent **photos of clothing**.
- Replace placeholders with real clothing imagery or image components when assets are available.
- The hero should help present collections and unusual garments.
- Collection cards may overlap, stack, or behave like stickers.
- Do not make the hero look like a standard clean fashion carousel without approval.

## Required functionality

This is a real e-commerce website, so the following features should be functional, not only decorative:

- product listing;
- filters;
- search;
- cart;
- product detail page;
- collection navigation.

### Filters

Filters must work:

- Size;
- Colour;
- Price.

The UI can look playful and exaggerated, but the logic should be reliable.

### Cart

The cart must be real/functional.

It may be implemented as:

- a cart drawer;
- a cart page;
- a floating cart state;
- another approved interaction pattern.

Do not treat the cart as a purely decorative icon.

### Product page

A real product page is required.

Product pages should include at minimum:

- product images;
- product name;
- price;
- size options;
- color information;
- add to cart;
- product/collection context.

The visual style should still feel Sheji: strange, bright, and MSCHF-like.

## Collections

Sheji curates 10 collections by Chinese designers.

The current names such as Fruity / Stone / Water are not final.

Do not assume final collection names unless they are provided.

Collection logic should support:

- multiple designers;
- multiple collections;
- collection-specific pages or sections;
- products assigned to collections;
- collection descriptions;
- unusual visual presentation.

## Interaction and motion rules

The site should play with the user, but animation decisions are sensitive.

**Important rule: always consult the user before working on animations of elements.**

Do not add, rewrite, or heavily change animations without asking first.

This includes:

- hover motion;
- scrolling effects;
- glitch effects;
- marquee movement;
- hero transitions;
- collection card animations;
- product hover animations;
- cart animation;
- filter animation;
- page transitions.

Micro-interaction states such as basic `:hover`, `:focus`, and `:active` color/scale feedback may be implemented if they are small and necessary for usability, but any expressive animation should be approved first.

### Animation structure

When an element changes state, animate one stable outer element. Do not build the transition from multiple separate blocks that appear, disappear, or move independently.

The outer element should keep ownership of the animated geometry: `width`, `height`, `left`, `top`, `border-radius`, `transform`, `opacity`, or related transition properties. Inner blocks may appear, disappear, clip, or crossfade inside that same element, but they should not become separate animated containers unless the user explicitly asks for that behavior.

Use the final search button/search panel pattern as the reference: one button/panel shell animates open and closed, while prompt text, input rows, dividers, icons, and suggestion blocks reveal inside it. This prevents visual jumps, keeps the motion reversible, and makes the component feel like a single object.

For stateful open/close UI:

- preserve one DOM node as the animated shell;
- set the shell's start geometry before changing it to the target geometry;
- make opening and closing use the same properties and durations;
- delay or crossfade inner content if needed, instead of replacing the shell;
- keep fallback cleanup in JavaScript for transition-end edge cases.

When asking for approval, describe:

1. which element will animate;
2. what the animation will do;
3. why it helps the Sheji experience;
4. whether it affects performance or accessibility.

## Technical stack

Final stack:

- HTML;
- CSS;
- JavaScript.

Do not migrate the project to React, Next.js, Vue, Svelte, Tailwind, TypeScript, or any framework unless explicitly requested.

Use clean vanilla JS and modular CSS/HTML patterns.

### Coding expectations

Code should be clean even when the interface is visually chaotic.

Prefer:

- semantic HTML where practical;
- reusable CSS classes;
- CSS custom properties;
- small focused JS modules/functions;
- predictable naming;
- clear state management for filters/cart/product data;
- data-driven rendering for products where useful.

Avoid:

- duplicated product markup where JS data rendering would be cleaner;
- inline styles unless necessary;
- hardcoded repeated values;
- uncontrolled global variables;
- framework-like complexity without need;
- dependencies unless explicitly approved.

## Suggested file organization

This is a suggested structure, not a requirement:

```txt
/
  index.html
  product.html
  cart.html
  css/
    base.css
    variables.css
    layout.css
    components.css
    catalogue.css
    product.css
  js/
    data.js
    products.js
    filters.js
    cart.js
    product-page.js
    search.js
  assets/
    images/
    icons/
```

For a small project, fewer files are acceptable. Keep the structure understandable.

## Component / pattern vocabulary

Use reusable patterns for:

- `sheji-button`
- `sheji-icon-button`
- `filter-pill`
- `collection-card`
- `product-card`
- `price-pill`
- `sale-badge`
- `cart-button`
- `favorite-button`
- `hero-collage`
- `diagonal-banner`

The visual language should be consistent across these components.

## UI rules

### Buttons

Buttons should be large, green, rounded, tactile, and graphic.

They may feel exaggerated.

Typical button traits:

- bright green background;
- black text;
- black/darker outline;
- rounded pill shape;
- strong presence;
- clear click target.

### Sale badges

Sale/promotion elements should use pink `#F61DA0`.

They can feel loud, cheap, commercial, and intentionally excessive.

### Hearts / favorites

Heart icons can use red or black depending on state, but avoid introducing a new wide color system.

### Product cards

Product cards should not feel like ordinary marketplace cards.

The clothes should sit directly in the visual field of the page. Product metadata can be minimal, but commerce-critical information must be accessible.

## Copywriting tone

Copy should be short, strange, direct, and brand-specific.

Avoid generic e-commerce copy such as:

- “Discover our latest collection”
- “Premium quality”
- “Shop now”
- “New arrivals”
- “Designed for everyone”

Prefer copy that feels more like Sheji:

- sharp;
- weird;
- fashion-aware;
- slightly provocative;
- direct;
- commercial but not generic.

## Accessibility and usability

The site can be visually loud, but core commerce flows must remain usable.

Maintain:

- readable product prices;
- usable filter buttons;
- visible cart state;
- keyboard-accessible buttons/links where practical;
- adequate color contrast;
- clear product page actions;
- no interaction that traps the user.

Do not sacrifice the ability to buy products for decorative chaos.

## Performance

Use simple, robust front-end implementation.

Avoid heavy animation libraries and large dependencies.

Optimize images where possible.

Since this is vanilla HTML/CSS/JS, prefer native browser capabilities.

## What the agent must not do

Do not:

- rename Sheji back to NOSOK;
- use NOSOK brand context;
- replace the visual style with minimal luxury;
- change the core palette without approval;
- replace Oswald without approval;
- change the 3-column desktop product grid without approval;
- turn filters/cart/product page into fake decorative elements;
- add expressive animations without consulting the user;
- migrate the project to another stack;
- add frameworks or libraries without approval;
- remove the MSCHF-like strange/kitsch energy;
- make the site look like a generic Shopify theme.

## Default decision rule

When unsure, choose the option that keeps Sheji:

- stranger;
- brighter;
- more controversial;
- more graphic;
- more MSCHF-like;
- still functional as a real shop.

The code should be calm and maintainable.  
The interface should not be calm.
