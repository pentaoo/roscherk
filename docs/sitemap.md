# SHEJI Sitemap

## 0. Visual sitemap

![SHEJI visual sitemap](/Users/penta/GitHub/roscherk/docs/sitemap-visual.svg)

```text
Главная
├── Главная + каталог
│   ├── Коллекции
│   ├── Фильтры / поиск
│   └── Мини-игры
├── Шоу
│   ├── Событие
│   └── Товары из показа
├── Карточка товара
│   ├── Размер
│   ├── Рекомендации
│   └── В корзину
├── Корзина
│   ├── Количество
│   └── Итого
└── Избранное
```

Коротко для презентации:

- `index.html` - главная, коллекции, каталог, фильтры, поиск, мини-игры.
- `show.html?id=<show-id>` - страница шоу с товарами из показа.
- `product.html?id=<product-id>` - карточка товара.
- `cart.html` - корзина.
- `favorites.html` - избранное.

## 1. High-level structure

```text
SHEJI
├── Home / Collections / Catalogue
│   └── index.html
│       ├── Language switcher: EN, RU, disabled ZH placeholder
│       ├── Hero Stage
│       │   ├── Collection Menu: Fruity, Stone, Water, Bloom, Chrome
│       │   ├── Expanded Collection Longread
│       │   ├── Collection Mini Games
│       │   │   ├── Fruity: Label Bird
│       │   │   ├── Stone: Erosion Pong
│       │   │   ├── Water: Drip Runner
│       │   │   ├── Bloom: Petal Tennis
│       │   │   └── Chrome: Mirror Lane
│       │   ├── Home Collage / Featured Look
│       │   ├── Shows Menu
│       │   ├── Cart/Favorites Status
│       │   └── Jump to Catalogue
│       └── Catalogue
│           ├── Collection-filtered catalogue state
│           ├── Size / Colour / Price filters
│           ├── Search panel and suggestions
│           ├── Product grid
│           └── Empty filtered state
├── Product Detail
│   └── product.html?id=<product-id>
│       ├── Product image stage
│       ├── Previous / Next product controls
│       ├── Size selector
│       ├── Add to cart
│       └── Recommended products
├── Cart
│   └── cart.html
│       ├── Empty cart state
│       ├── Cart item list
│       ├── Quantity controls
│       ├── Remove / Clear cart
│       └── Total
├── Favorites
│   └── favorites.html
│       ├── Empty favorites state
│       ├── Favorite item list
│       ├── Open product
│       └── Remove from favorites
└── Show Detail
    └── show.html?id=<show-id>
        ├── Event overview
        ├── Run of show
        ├── Shown pieces
        ├── Event photos
        └── More shows archive
```

Implemented dynamic content:

- Collections in data: Fruity, Stone, Water, Bloom, Chrome, Salt, Moss, Ash, Glass, Pulse.
- Hero collection menu renders only the first 5 collections: Fruity, Stone, Water, Bloom, Chrome.
- Products in data: 31 product detail URLs via `product.html?id=<product-id>`.
- Shows in data: 4 show detail URLs via `show.html?id=<show-id>`.
- Persistent local states: `sheji-cart`, `sheji-favorites`, `sheji-language`.

Potential issues:

- Salt, Moss, Ash, Glass, and Pulse exist in data and catalogue products, but are not reachable from the hero collection carousel because `script.js` slices collections to the first 5.
- Only the first 5 collections have mini-game configs.
- There is no checkout page or checkout action after cart total.
- Product size selection is UI-only for cart purposes: cart stores product quantity, not selected size.
- `ZH` is visible in the language switcher, but disabled by design as a future slot.

## 2. Page-by-page map

### `index.html` - Home / Collections / Catalogue

Purpose:

- Main entry page for brand browsing, collection discovery, catalogue filtering, product discovery, cart preview, favorites entry, and shows entry.

Main sections:

- `language-switcher`
  - EN and RU are supported.
  - ZH is shown but disabled.
  - Selected language is stored in `localStorage` as `sheji-language`.
- `hero-stage`
  - `collection-menu`: dynamic collection cards rendered from `SHEJI_COLLECTIONS.slice(0, 5)`.
  - `collection-card-template`: card shell for each rendered collection.
  - `home-collage`: dynamic featured look for the active collection.
  - `diagonal-banner`: decorative repeated message.
  - `home-actions`: Shows menu plus cart/favorites status.
  - `home-catalogue-link`: scrolls to catalogue.
- `catalogue`
  - Toolbar with Back to top / Back to all clothing behavior.
  - Filters: Size, Colour, Price.
  - Search panel with input and hardcoded suggestions: `stone`, `sale`.
  - Product grid rendered from merchandising data.

Key elements:

- Collection cards
  - Stacked carousel states: active, next, previous, hidden above, hidden below.
  - CTA label changes from `Take a look` to `Read more`.
  - Expanded collection state opens a full-screen longread-like card with media and text.
  - `Go back` closes the expanded card.
  - Clicking the active card selects that collection for the catalogue filter.
  - Clicking neighbor cards cycles carousel and selects the clicked collection.
  - Mouse wheel over the collection stack cycles cards.
  - Mobile pointer swipe cycles cards.
- Collection mini-game trigger
  - Designer face appears on game-supported collection cards.
  - 5 fast taps/clicks unlock the mini-game.
  - Game states: locked, arming, opening, active, paused, ended, closing.
  - Game shell includes HUD, score, controls text, canvas stage, Exit, Restart, and end result.
- Home collage
  - Renders look items from the active collection's `look` config or fallback products.
  - Desktop click on a look item opens `product.html?id=<product-id>`.
  - Mobile tap selects the item and opens a bottom panel with collection, name, price, and `Open product`.
  - Swipe on collage navigates collection looks.
  - Escape clears the selected mobile product panel.
- Shows menu
  - Opens on click, hover, or focus.
  - Lists up to 4 events.
  - Event links go to `show.html?id=<show-id>`.
- Cart/Favorites status
  - Cart link goes to `cart.html`.
  - Favorites link goes to `favorites.html`.
  - Cart count updates from stored cart.
  - On home/catalogue, cart hover/focus opens a cart preview popover.
- Catalogue filters
  - Size options are generated from all product sizes.
  - Colour options are generated from all product colours.
  - Price options: under 100, 100-300, over 300.
  - Clicking an active filter option toggles it off.
  - Empty state appears when no products match.
- Catalogue search
  - Search surface opens an animated search panel.
  - Input filters products in memory.
  - Suggestions set search query to `stone` or `sale`.
  - Enter is prevented. Escape closes the search panel.
- Product cards
  - Heart button toggles favorite state.
  - Image/detail link opens `product.html?id=<product-id>`.
  - Price pill adds product to cart.
  - Sale products use a sale rail instead of the normal name pill.

Transitions:

- `home-catalogue-link` -> `#catalogue` via smooth scroll.
- `catalogue__back` -> `#top` normally.
- `catalogue__back` in collection-filtered state -> clears collection filter instead of scrolling.
- Collection selection -> filters catalogue by collection.
- Product card detail link -> `product.html?id=<product-id>`.
- Product card price pill -> cart state update only.
- Product card favorite button -> favorites state update only.
- Cart icon -> `cart.html`.
- Favorites icon -> `favorites.html`.
- Show item -> `show.html?id=<show-id>`.

Potential issues:

- The catalogue includes products from all 10 collections, but the collection carousel exposes only 5 collections.
- Search does not create a URL query or submit to a results page.
- There is no global "clear all filters" button.
- Cart preview is informational only. The cart icon itself is the navigation target.
- The active collection filter can be set by interacting with the collection carousel, but the page does not automatically scroll to catalogue after collection selection.

### `product.html?id=<product-id>` - Product Detail

Purpose:

- Detail view for one product from the 31 product records.

Main sections:

- Language switcher.
- Back toolbar.
- Cart/Favorites status.
- Product stage with previous/next buttons.
- Size selector.
- Add to cart button.
- Recommended products rail.

Key elements:

- Product selection
  - Reads `id` from the URL query string.
  - If the ID is missing or invalid, falls back to the first product.
  - Calls `history.replaceState` to sync the URL to the selected product ID.
- Product stage
  - Shows only the product image as the main visible product content.
  - Previous and Next cycle through all products and update the URL.
- Size selector
  - Options are generated from the current product's `sizes`.
  - First available size is auto-selected.
  - Opens/closes as an inline selector.
- Add to cart
  - Adds current product ID to cart storage.
  - Updates cart status count.
- Recommendations
  - Shows up to 5 products.
  - Prefers unique images first, then duplicates.
  - Clicking a recommendation switches the PDP in place and updates the URL.

Transitions:

- Back link -> `index.html#catalogue`.
- Cart icon -> `cart.html`.
- Favorites icon -> `favorites.html`.
- Previous / Next -> same page, new `?id`, no full page navigation.
- Recommendation -> same page, new `?id`, no full page navigation.
- Add to cart -> cart state update only.

Implemented product URLs:

- `product.html?id=fruity-glasses-1`
- `product.html?id=fruity-vest-1`
- `product.html?id=fruity-pants-1`
- `product.html?id=fruity-tote-1`
- `product.html?id=fruity-belt-1`
- `product.html?id=stone-bucket-1`
- `product.html?id=stone-overshirt-1`
- `product.html?id=stone-painter-pants-1`
- `product.html?id=stone-frame-bag-1`
- `product.html?id=stone-braided-belt-1`
- `product.html?id=water-glasses-1`
- `product.html?id=water-puffer-1`
- `product.html?id=water-aw00-pants-1`
- `product.html?id=water-backpack-1`
- `product.html?id=water-d-ring-belt-1`
- `product.html?id=bloom-pink-tee-1`
- `product.html?id=bloom-badknees-top-1`
- `product.html?id=bloom-pants-1`
- `product.html?id=bloom-jil-tote-1`
- `product.html?id=bloom-bucket-1`
- `product.html?id=bloom-braided-belt-1`
- `product.html?id=chrome-glasses-1`
- `product.html?id=chrome-bomber-1`
- `product.html?id=chrome-folded-pants-1`
- `product.html?id=chrome-junya-jacket-1`
- `product.html?id=chrome-frame-bag-1`
- `product.html?id=salt-scorched-top-1`
- `product.html?id=moss-dreaded-path-top-1`
- `product.html?id=ash-supreme-coat-1`
- `product.html?id=glass-palace-top-1`
- `product.html?id=pulse-telfar-top-1`

Potential issues:

- Selected size is not saved to the cart. Cart rows display all available sizes for a product.
- Missing or invalid product IDs silently fall back to the first product instead of showing a not-found state.
- There is no favorite toggle on the PDP itself, only a link to Favorites.
- Product detail page loads some scripts that do not render visible UI on this page, such as collection/collage modules.

### `cart.html` - Cart

Purpose:

- Review and edit products stored in the local cart.

Main sections:

- Language switcher.
- Back toolbar.
- Cart header and item count.
- Empty cart state.
- Cart item list.
- Cart footer with Clear cart and Total.

Key elements:

- Empty state
  - Shows `Cart is empty`.
  - `Find clothes` links to `index.html#catalogue`.
- Cart rows
  - Product image links to `product.html?id=<product-id>`.
  - Collection, product name, colour, and available sizes.
  - Quantity decrement and increment.
  - Remove single row.
  - Line total.
- Footer
  - `Clear cart` clears all stored cart rows.
  - Total updates from current row totals.

Transitions:

- Back link -> `index.html#catalogue`.
- Find clothes -> `index.html#catalogue`.
- Product image -> `product.html?id=<product-id>`.
- Quantity buttons -> cart state update only.
- Remove -> cart state update only.
- Clear cart -> cart state update only.

Potential issues:

- No checkout, shipping, payment, or order confirmation flow is implemented.
- Cart stores product quantity by product ID, not chosen size.
- Cart row grouping is based on collection, name, price, and colour. If two distinct future products share those fields, they could visually merge.

### `favorites.html` - Favorites

Purpose:

- Review and remove liked products stored in local favorites.

Main sections:

- Language switcher.
- Back toolbar.
- Favorites header and item count.
- Empty favorites state.
- Favorites list.

Key elements:

- Default favorites
  - If no `sheji-favorites` storage exists, products marked `liked: true` are preselected.
  - Current defaults: `fruity-tote-1`, `water-puffer-1`.
- Favorite rows
  - Product image links to `product.html?id=<product-id>`.
  - Collection, product name, colour, sizes.
  - Price.
  - `Open product` link.
  - `Remove from favorites` button.

Transitions:

- Back link -> `index.html#catalogue`.
- Find clothes -> `index.html#catalogue`.
- Product image -> `product.html?id=<product-id>`.
- Open product -> `product.html?id=<product-id>`.
- Remove from favorites -> favorites state update only.

Potential issues:

- No add-to-cart action is available from Favorites.
- No "clear all favorites" action is available.

### `show.html?id=<show-id>` - Show Detail

Purpose:

- Detail view for one event/show.

Main sections:

- Language switcher.
- Back toolbar.
- Event body with badge, title, date, venue, city, format, summary, details, and program.
- Hero event photo.
- Shown pieces.
- Event photos gallery.
- More shows archive rail.

Key elements:

- Show selection
  - Reads `id` from URL query string.
  - If the ID is missing or invalid, falls back to the first show.
  - Calls `history.replaceState` to sync the URL.
- Shown pieces
  - Rendered from `productIds` on the show record.
  - Each product card links to the product detail page.
- Gallery
  - Includes event hero photo plus up to 5 product images.
- Archive rail
  - Links to all other shows.

Transitions:

- Back link -> `index.html#top`.
- Shown piece -> `product.html?id=<product-id>`.
- Archive card -> `show.html?id=<show-id>`.

Implemented show URLs:

- `show.html?id=stone-room-pop-up` - Stone Room Pop-Up.
- `show.html?id=garage-market-fit` - Garage Market Fit.
- `show.html?id=fruity-label-session` - Fruity Label Session.
- `show.html?id=chrome-night-line` - Chrome Night Line.

Potential issues:

- There is no separate all-shows page. Shows are accessed through the home dropdown, archive rail, or direct `show.html?id=...` URLs.
- Missing or invalid show IDs silently fall back to the first show instead of showing a not-found state.
- Archive links reload/navigate to the same page with a different query string rather than switching show content in place.

### Global UI states

- Language state
  - EN/RU supported.
  - ZH disabled.
  - Source priority: URL language segment, stored language, browser language, default EN.
- Cart state
  - Stored in `localStorage` as `sheji-cart`.
  - Used by catalogue, product detail, cart page, and cart status counters.
- Favorites state
  - Stored in `localStorage` as `sheji-favorites`.
  - Used by catalogue, favorites page, and favorites status.
- Reduced motion state
  - Read from `prefers-reduced-motion`.
  - Used to shorten animation durations and disable some parallax/transition effects.

## 3. User flows

### Browse collections

1. User opens `index.html`.
2. Hero renders the collection stack for Fruity, Stone, Water, Bloom, Chrome.
3. User scrolls wheel over the stack or swipes on mobile to cycle collections.
4. User clicks a neighbor card to make it active.
5. User clicks the active card or CTA.
6. Site selects that collection and filters the catalogue state.
7. If the CTA was used, the card expands into a longread state.
8. User clicks `Go back` to collapse the card.

### Browse catalogue and products

1. User clicks the down arrow.
2. Page smooth-scrolls to `#catalogue`.
3. Product grid renders all products, or products from the active collection if one was selected.
4. User clicks a product image/detail link.
5. Browser opens `product.html?id=<product-id>`.
6. User can return through `Go back` to `index.html#catalogue`.

### Filter products

1. User opens Size, Colour, or Price control.
2. Filter options are generated from product data.
3. User selects an option.
4. Product grid re-renders immediately.
5. Active filter option gets `is-active`; trigger gets `aria-pressed=true`.
6. Selecting the same option again clears that filter.
7. If no products match, `No clothes survived that filter.` appears.

### Search products

1. User clicks the catalogue search surface.
2. Search panel expands and focuses the input.
3. User types a query or clicks `stone` / `sale`.
4. Product grid re-renders in memory.
5. Enter is blocked; there is no search results route.
6. Escape closes the search panel.

### Add product to cart from catalogue

1. User clicks a product card price pill.
2. Product ID quantity increments in `sheji-cart`.
3. Cart count updates.
4. On home/catalogue, hover or focus on cart icon shows a cart preview popover.
5. User clicks cart icon.
6. Browser opens `cart.html`.

### Add product to cart from PDP

1. User opens `product.html?id=<product-id>`.
2. First product size is selected by default.
3. User may choose another size in the size selector.
4. User clicks Add to cart.
5. Product ID quantity increments in `sheji-cart`.
6. Cart status count updates.
7. Selected size is not stored in cart.

### Use cart

1. User opens `cart.html`.
2. If cart is empty, user sees empty state and `Find clothes`.
3. If cart has rows, user can increment, decrement, remove a row, or clear cart.
4. Total updates after each change.
5. Product image opens the PDP for that item.

### Use favorites

1. User toggles a heart on a catalogue product card.
2. Product ID is added to or removed from `sheji-favorites`.
3. User opens `favorites.html`.
4. User can open a product or remove it from favorites.

### Open product page and browse nearby products

1. User opens any product detail URL.
2. Previous and Next cycle across all products.
3. Recommended product buttons switch PDP content in place.
4. URL query is updated with `history.replaceState`.

### Browse shows

1. User opens the Shows menu on the home page.
2. Menu opens on click, hover, or focus.
3. User clicks a show.
4. Browser opens `show.html?id=<show-id>`.
5. User can open shown products or use archive cards to open another show.
6. `Go back` returns to `index.html#top`.

### Experimental mini-game flow

1. User opens a supported collection card into expanded state.
2. User taps/clicks the designer face 5 times before timeout.
3. Mini-game unlocks and opens inside the collection card.
4. User controls the canvas game with pointer, Space/Enter, arrows, or WASD depending on the module.
5. Escape or Exit closes the game.
6. If the game ends, the end screen shows result, score, Restart, and Exit.
7. Browser visibility/blur pauses the active game and focus/visibility resumes it.

Mini-game modules:

- Fruity: `Label Bird` - tap/click/Space to flap.
- Stone: `Erosion Pong` - pointer or left/right controls paddle.
- Water: `Drip Runner` - tap/Space to jump, Down to duck.
- Bloom: `Petal Tennis` - pointer or Up/Down to move paddle.
- Chrome: `Mirror Lane` - arrows or tap to switch lanes.

## 4. Navigation / links audit

| Source | Element | Target / action | Status |
| --- | --- | --- | --- |
| All pages | EN language button | Set language to EN, persist to `sheji-language` | Works |
| All pages | RU language button | Set language to RU, persist to `sheji-language` | Works |
| All pages | ZH language button | Disabled future language slot | Intentional partial |
| `index.html` | Home catalogue arrow | `#catalogue`, smooth scroll | Works |
| `index.html` | Catalogue back | `#top` when no collection filter is active | Works |
| `index.html` | Catalogue back | Clear active collection when collection-filtered | Works, non-obvious |
| `index.html` | Collection card CTA | Expanded collection longread state | Works |
| `index.html` | Expanded collection back | Collapse collection longread | Works |
| `index.html` | Active collection card click | Select collection and filter catalogue | Works |
| `index.html` | Neighbor collection card click | Cycle stack and select collection | Works |
| `index.html` | Designer face | 5 taps unlock mini-game | Works for first 5 collections |
| `index.html` | Game Exit | Close active mini-game | Works |
| `index.html` | Game Restart | Restart active mini-game | Works |
| `index.html` | Home collage item on desktop | `product.html?id=<product-id>` | Works |
| `index.html` | Home collage item on mobile | Opens mobile product panel | Works |
| `index.html` | Mobile collage panel Open product | `product.html?id=<product-id>` | Works |
| `index.html` | Home collage swipe | Navigate collection looks | Works |
| `index.html` | Shows trigger | Open/close shows dropdown | Works |
| `index.html` | Shows event item | `show.html?id=<show-id>` | Works |
| `index.html` | Cart status icon | `cart.html` | Works |
| `index.html` | Cart hover/focus | Cart preview popover | Works on home/catalogue |
| `index.html` | Favorites status icon | `favorites.html` | Works |
| `index.html` | Size filter trigger | Open size options | Works |
| `index.html` | Colour filter trigger | Open colour options | Works |
| `index.html` | Price filter trigger | Open price options | Works |
| `index.html` | Filter option | Toggle filter and rerender grid | Works |
| `index.html` | Search surface | Open search panel | Works |
| `index.html` | Search input | Filter product grid | Works |
| `index.html` | Search suggestion `stone` | Set search query to `stone` | Works |
| `index.html` | Search suggestion `sale` | Set search query to `sale` | Works |
| `index.html` | Product favorite button | Toggle favorite | Works |
| `index.html` | Product detail link | `product.html?id=<product-id>` | Works |
| `index.html` | Product price pill | Add to cart | Works |
| `product.html` | Back link | `index.html#catalogue` | Works |
| `product.html` | Cart icon | `cart.html` | Works |
| `product.html` | Favorites icon | `favorites.html` | Works |
| `product.html` | Previous product | Same page, previous product ID | Works |
| `product.html` | Next product | Same page, next product ID | Works |
| `product.html` | Size selector trigger | Open/close size options | Works |
| `product.html` | Size option | Select size visually | Works, not persisted to cart |
| `product.html` | Add to cart | Add current product to cart | Works |
| `product.html` | Recommendation card | Same page, recommended product ID | Works |
| `cart.html` | Back link | `index.html#catalogue` | Works |
| `cart.html` | Find clothes | `index.html#catalogue` | Works |
| `cart.html` | Product image | `product.html?id=<product-id>` | Works |
| `cart.html` | Quantity decrement | Decrease quantity, remove at 0 | Works |
| `cart.html` | Quantity increment | Increase quantity | Works |
| `cart.html` | Remove | Remove product from cart | Works |
| `cart.html` | Clear cart | Clear all cart rows | Works |
| `favorites.html` | Back link | `index.html#catalogue` | Works |
| `favorites.html` | Find clothes | `index.html#catalogue` | Works |
| `favorites.html` | Product image | `product.html?id=<product-id>` | Works |
| `favorites.html` | Open product | `product.html?id=<product-id>` | Works |
| `favorites.html` | Remove from favorites | Remove product from favorites | Works |
| `show.html` | Back link | `index.html#top` | Works |
| `show.html` | Shown piece | `product.html?id=<product-id>` | Works |
| `show.html` | Archive show card | `show.html?id=<show-id>` | Works |

Suspicious or incomplete links/states:

- No checkout target from cart.
- No all-shows page target.
- Search has no shareable results URL.
- Invalid product/show IDs do not show a not-found state.
- ZH language option is visible but intentionally disabled.
- Last 5 collections have catalogue products but no hero navigation cards or mini-games.

## 5. Presentation-ready version

Compact site tree:

```text
SHEJI
├── Home / Collections / Catalogue (index.html)
│   ├── Collection carousel: Fruity, Stone, Water, Bloom, Chrome
│   ├── Expanded collection story
│   ├── Hidden mini-games per first 5 collections
│   ├── Look collage -> Product Detail
│   ├── Shows dropdown -> Show Detail
│   ├── Cart/Favorites entry points
│   └── Catalogue: filters, search, product grid
├── Product Detail (product.html?id=<product-id>)
│   ├── Image, size selector, add to cart
│   ├── Previous / Next
│   └── Recommendations
├── Cart (cart.html)
│   ├── Empty / filled states
│   ├── Quantity edit, remove, clear
│   └── Total
├── Favorites (favorites.html)
│   ├── Empty / filled states
│   └── Open product / remove favorite
└── Show Detail (show.html?id=<show-id>)
    ├── Event story and program
    ├── Shown pieces -> Product Detail
    └── More shows archive
```

Key user flows:

1. Collection discovery: Home -> cycle collection cards -> expand collection story -> optional mini-game -> back.
2. Shopping browse: Home -> Catalogue -> filters/search -> Product Detail -> Add to cart -> Cart.
3. Favorites: Catalogue heart -> Favorites page -> Open product or remove.
4. Shows: Home Shows dropdown -> Show Detail -> Shown pieces -> Product Detail.
5. Mobile look flow: Home collage item -> mobile product panel -> Open product.

Presentation notes:

- Strongest implemented flows: collection browsing, catalogue filtering/search, PDP browsing, cart editing, favorites, show detail.
- Main gaps: no checkout, no not-found state, size is not persisted to cart, only first 5 collections are featured in hero/mini-games.
