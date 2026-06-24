# Collection Mini Games ExecPlan

## Goal

Add a hidden mini-game layer to expanded collection cards. The game is unlocked from the designer face/badge inside the expanded card. The first implementation must be additive, reversible, and non-destructive.

The mini-games are not retention games and not a checkout gimmick. They are collection personality glitches: each game should communicate the mood of the designer collection, then return the user to shopping and product discovery without losing state.

This is a concept and implementation plan only. Do not implement expressive animation without explicit animation approval, because `ai-context/project/AGENTS_Sheji.md` requires user approval before changing collection-card animation behavior.

## Non-Goals

- Do not create new routes or separate game pages.
- Do not redesign collection cards.
- Do not rewrite the existing collection-card expansion system.
- Do not change existing expand/collapse animation behavior.
- Do not remove or recreate expanded card content during game mode.
- Do not implement rewards, checkout discounts, accounts, or persistent commerce incentives in the first slice.
- Do not add expressive morph, glitch, burst, or content-to-stage transitions until separately approved.

## Implementation Constraints

Implementation must be additive and non-destructive:

- Keep the existing `.collection-card` positioning, fixed expanded mode, scroll lock, z-index, pointer-events, and animation classes intact.
- Add game mode as a separate layer controlled by separate classes, for example `is-game-arming`, `is-game-opening`, and `is-game-active`.
- The original expanded content must remain mounted or be restorable without data refetch.
- The game shell may overlay or visually replace the expanded content, but must not destroy product/list state, scroll context, lazy image state, or event handlers.
- The first implementation should use an instant switch or minimal opacity transition. Expressive card mutation can be a later approved animation task.
- Only one mini-game can be active at a time.

## Product Idea

Each expanded collection becomes a playable "designer arcade" state:

- The user opens a collection card normally.
- A designer face/badge appears in the expanded card header.
- Repeated activation unlocks the game.
- The game uses Sheji colors, Oswald typography, thick black outlines, yellow fields, green action states, and pink danger/noise.
- Game over offers score, restart, and exit.
- Exit returns to the same expanded collection card without losing scroll, product, or checkout state.
- After first unlock, the collection remembers unlocked state for the current browser session and shows a small `PLAY AGAIN` sticker on the designer face.

## Trigger Design

Primary trigger:

- Target: `.collection-card__designer-face`.
- Element type: real `<button>`, not a decorative image.
- Threshold: 5 activations.
- Timeout: 2800ms, refreshed after every activation.
- Keyboard: Enter/Space count toward unlock; keyboard users should get a more forgiving timeout or no timeout after the first intentional activation.
- Reset: if timeout expires before threshold, return to `locked`.

The trigger should stay semi-secret, not completely invisible:

- The face reacts on hover/focus/tap with a small non-expressive state change.
- Microcopy can read `DO NOT TAP THE DESIGNER`.
- After the first activation, show a sticker-counter so users understand progress.
- After 2-3 activations, the card can add suspicious visual response, but only with approved animation.
- On desktop, cursor/title hints can imply interactivity without explaining the full unlock.

Accessibility and focus:

- Face button label example: `Unlock Fruity mini game`.
- On unlock, move focus to the game container or exit button.
- On exit, return focus to the designer face button.
- Escape exits game mode; decide separately whether Escape should then also close the expanded card.
- The original content should be inert or semantically hidden while game mode is active.
- Use `aria-live` only for important state changes such as unlocked/game over, not every score tick.
- Reduced motion skips jitter, morph, and suspicious feedback, not only the final game opening.
- HUD must show keyboard controls when keyboard focus enters the game.

## Shared Game Shell

Add a reusable game layer inside the collection card, not a separate route:

```html
<section class="collection-game" hidden>
  <header class="collection-game__hud">
    <p class="collection-game__title"></p>
    <p class="collection-game__score"></p>
    <p class="collection-game__controls"></p>
    <button class="collection-game__exit" type="button">Exit</button>
  </header>
  <div class="collection-game__stage"></div>
  <div class="collection-game__end" hidden>
    <p class="collection-game__result"></p>
    <button class="collection-game__restart" type="button">Restart</button>
    <button class="collection-game__end-exit" type="button">Exit</button>
  </div>
</section>
```

Recommended modules:

- `data/collection-games.js`: collection-to-game metadata.
- `js/collection-games.js`: trigger, shell state machine, lifecycle, input routing.
- `js/collection-game-modules.js`: concrete game implementations, or one file per game if size grows.
- `styles.css`: shared game shell and per-game visual skins.

Data model example:

```js
window.SHEJI_COLLECTION_GAMES = {
  fruity: {
    id: "fruity-label-bird",
    title: "Label Bird",
    collectionId: "fruity",
    ariaLabel: "Unlock Fruity mini game",
    module: "labelBird",
    unlockTaps: 5,
    unlockTimeoutMs: 2800,
  },
};
```

Game module contract:

```js
{
  id: "fruity-label-bird",
  title: "Label Bird",
  init(stageEl, context) {},
  start() {},
  pause() {},
  resume() {},
  destroy() {},
  handleInput(event) {},
}
```

`context` should provide:

- `collection`
- `card`
- `setScore(value)`
- `endGame(result)`
- `emit(eventName, details)`
- `isReducedMotion()`
- `getStageSize()`

## State Model

State transitions:

| From | To | Trigger |
|------|----|---------|
| `locked` | `arming` | First designer-face activation |
| `arming` | `locked` | Unlock timeout expires |
| `arming` | `opening` | Activation threshold reached |
| `opening` | `active` | Shell is visible and game module starts |
| `active` | `paused` | Document hidden, card no longer visible, or page loses focus |
| `paused` | `active` | Document/card becomes visible again |
| `active` | `closing` | Exit, Escape, card close, or game cleanup request |
| `opening` | `closing` | Escape or card close during opening |
| `closing` | `locked` | Shell hidden, content restored, game destroyed |
| Any | `locked` | Card destroyed, collection page unmounted, unrecoverable error |

Rules:

- If another card opens while a game is active, close and destroy the current game first.
- If the user closes the expanded card during game mode, game cleanup must run before or during card close.
- Resize should update stage dimensions without restarting the game unless the module cannot preserve state.
- Repeated unlock after session unlock should show `PLAY AGAIN` and open the game directly or with one activation.

## Game End State

Every game needs a complete end loop:

- Game over or win condition is required.
- End screen shows score/result, restart, and exit.
- Restart reuses the same mounted shell when possible.
- Exit restores expanded card content.
- No checkout/product state should be lost.
- High score persistence is optional and should not be implemented until explicitly approved.
- During the current session, unlocked state is remembered per collection.

## Rendering Approach

Start with visual integration, not physics complexity:

- Use DOM/CSS/SVG-like positioned elements for the first implementation unless Canvas clearly simplifies the game.
- Use DOM for HUD, buttons, tap counter, end screen, labels, and accessibility.
- Canvas is acceptable for active gameplay loops that need collision, DPR scaling, or many moving objects.
- Avoid external game libraries for the first slice.
- Prefer transforms over repeated `top`/`left` updates for moving DOM objects.
- Avoid repeated `getBoundingClientRect()` calls inside animation frames.

## Mobile and Touch

Mobile is a first-class constraint:

- Stage must remain playable in the expanded card's narrow layout.
- Minimum usable stage height: 320px. If unavailable, show a compact fallback or resize the game area.
- Use one-hand controls: tap stage, swipe lane, or drag paddle depending on game.
- During active game, prevent accidental page scroll only inside the game stage.
- Add `touch-action: none` or a more specific value on `.collection-game__stage` only when needed.
- Do not block page scroll globally outside active game mode.
- Touch input must not leak into collection carousel, search, cart, or catalogue controls.

## Performance and Cleanup

Required runtime behavior:

- Use `requestAnimationFrame` for loops.
- Stop loop on exit.
- Pause loop on `document.visibilitychange`.
- Destroy listeners on card close.
- Do not run games for hidden cards.
- Only one game can be active at a time.
- Leave no timers after exit.
- Avoid layout thrashing.
- Clean up pointer, keyboard, resize, and visibility listeners in `destroy()`.

## Analytics Hooks

Do not wire real analytics in the first slice unless infrastructure already exists. Add local hook functions or TODOs for:

- `collection_game_unlock_started`
- `collection_game_unlocked`
- `collection_game_started`
- `collection_game_over`
- `collection_game_exit`
- `collection_game_replay`

Each event should include `collectionId`, `gameId`, and relevant score/result details when available.

## Visual System

Shared rules:

- Use only existing brand colors unless new collection-specific colors are explicitly approved.
- The game should look like a bootleg promotional arcade embedded inside a fashion commerce card, not like a generic polished mobile game.
- Keep black outlines thick: default 4-6px for controls and 2-4px for in-game shapes.
- Use hard-edged fills, labels, stickers, stamped text, and commercial noise.
- Avoid soft gradients and luxury/pastel palettes.
- Shadows should be blunt and graphic if used, not soft app-card shadows.
- Product cutout assets can appear as collectible stickers or background fragments.
- Use Oswald for all HUD and labels.
- Buttons should inherit the existing Sheji button language: green action fills, black text/outlines, condensed labels.

## Five Game Concepts

### 1. Fruity - Label Bird

Mechanic:

- Flappy-style tap game, but framed as a care-label misprint test.
- The player controls a care-label bird/sock creature.
- Tap/click/Space gives upward impulse.
- Avoid price-tag scanners, barcode gates, and oversized produce stickers.

Visualization:

- Yellow background with repeating fruit-label stickers.
- Obstacles are pink receipt/scanner columns with black outlines.
- Player is a green sock/care-label hybrid with a fruit sticker head.
- Score appears as `LOOK VALUE`.
- Game over copy: `ITEM MISLABELED`.
- Restart copy: `RE-STICK`.
- Collision splashes labels across the stage instead of blood/explosion.

Why it fits:

- Fruity already references market labels, summer packaging, and acidic color.
- The mechanic is instantly understandable and works well in a narrow expanded card.

### 2. Stone - Erosion Pong

Mechanic:

- One-player Pong/Breakout hybrid.
- Player moves a heavy folded-trouser slab paddle left/right.
- A black stone ball chips away garment slabs.
- Some slabs require multiple hits and visibly crack.

Visualization:

- Stage looks like a construction diagram over Sheji yellow.
- Paddle is a brutal black folded-garment rectangle with rough pixel edges.
- Blocks are stone-washed panels with product silhouettes stamped into them.
- Every hit leaves a small black crack decal.
- Score label: `EROSION INDEX`.
- Game over copy: `SLAB DROPPED`.

Why it fits:

- Stone is about weight, density, construction, and industrial fashion.
- The game ties the stone metaphor back to clothing through folded slabs and garment panels.

### 3. Water - Drip Runner

Mechanic:

- Side-scrolling endless runner.
- The player is a droplet wearing a transparent garment silhouette, rendered with brand colors and black hatch lines.
- Jump over drying cracks, duck under wave gates, collect water rings.

Visualization:

- Yellow field with black wave contour lines.
- Obstacles are pink heat lamps and black cracked floor strips.
- Collectibles are green D-ring bubbles.
- The player leaves a short trail made from black outline droplets.
- HUD uses a tide gauge: `FLOW 012`.
- Game over copy: `DRIED OUT`.

Why it fits:

- Water already has fluid striping, translucent rhythm, and light movement.
- Runner input is simple enough for desktop and mobile.

### 4. Bloom - Petal Tennis

Mechanic:

- Tiny tennis game against the card itself.
- Player controls a flower-petal racket.
- Bounce a pollen ball past a moving opponent wall.
- Rally count is the score.

Visualization:

- Court is Sheji yellow with black tennis lines and pink flower-shop stamps.
- Ball is a pink pollen dot with a black outline.
- Player racket is a green petal/fan shape.
- Opponent is a stack of moving product tags.
- On long rallies, the background grows loud floral sticker overlays.
- Score label: `RALLY BLOOM`.
- Game over copy: `PETAL FAULT`.

Why it fits:

- Bloom mixes floral graphics with sports energy.
- Tennis gives the collection a readable sport reference without becoming a normal sports UI.

### 5. Chrome - Mirror Lane

Mechanic:

- Lane-switch reflex game.
- Player controls a reflective bag/cartridge icon moving through three lanes.
- Switch lanes to avoid black racing barriers and collect green shine markers.
- Speed increases every 10 points.

Visualization:

- High-contrast racing grid using black, yellow, green, pink, and white highlights only.
- Chrome is represented through hard white highlights and black outline shapes, not gradients.
- Obstacles are pink warning panels and black tire-mark bars.
- Score is displayed as a glossy race number: `NOA-027`.
- At high speed, lane lines flicker through CSS class changes, not heavy canvas effects.
- Game over copy: `REFLECTION BROKEN`.

Why it fits:

- Chrome already references reflective silver marks, racing, black grounding, and speed.
- Three-lane input is reliable on both keyboard and touch.

## Acceptance Criteria

- Expanded collection cards still open and close exactly as before.
- Designer face is a button and supports mouse, touch, Enter, and Space.
- Five activations unlock the correct collection game.
- Tap counter resets after timeout and visibly communicates progress after the first activation.
- Only one mini-game can be active at a time.
- Escape exits game mode and restores the expanded card.
- Exiting game does not reset collection scroll/product state.
- Game loop stops on exit, card close, and tab visibility hidden.
- Reduced motion skips expressive transition and jitter effects.
- No game input leaks into catalogue, search, cart, or carousel controls.
- No console errors after repeated open/play/restart/exit cycles.

## Implementation Plan

### Phase 1 - Data and Static Shell

1. Add `data/collection-games.js` with collection-to-game metadata.
2. Add game script tag after `js/collections.js` in `index.html`.
3. Extend collection card rendering to include a designer face button, tap counter, and hidden game shell.
4. Use generated/stylized face badges until real designer portraits exist.
5. Add i18n keys for unlock labels, exit, restart, game over, score, controls, and fallback copy.

Acceptance:

- Expanded cards show a small designer face button.
- No game starts yet.
- Existing collection open/close behavior remains unchanged.

### Phase 2 - Unlock State

1. Implement tap counter in `js/collection-games.js`.
2. Use threshold `5` and timeout `2800ms`, refreshed after every activation.
3. Store per-card game state without mutating collection carousel state directly.
4. Add CSS classes for `is-game-arming`, `is-game-opening`, and `is-game-active`.
5. Add Escape and exit button support.
6. Pause or block unlock when collection card is not expanded.
7. Remember current-session unlock and show `PLAY AGAIN` after first unlock.

Acceptance:

- Five activations on designer face toggles the game shell.
- Exit returns to expanded card.
- Keyboard and touch work.
- Reduced-motion users do not receive expressive motion.

### Phase 3 - Shared Game Runtime

1. Add the shell state machine and transition table behavior.
2. Add input normalization for keyboard, pointer, and touch.
3. Add optional canvas helper only if the first game needs it: resize, DPR scaling, loop start/stop.
4. Provide common helpers for Sheji labels, outlined shapes, score text, and collision boxes.
5. Pause on `visibilitychange`, card close, or route/page navigation.
6. Add cleanup so no `requestAnimationFrame`, timeout, or listener keeps running after exit.

Acceptance:

- One placeholder game can start, run, pause, resume, and stop safely.
- No console errors after repeated open/play/exit cycles.

### Phase 4 - First Playable Game

1. Build `Fruity - Label Bird` first.
2. Keep assets procedural: shapes, text labels, barcode scanner columns.
3. Tune input for mouse, touch, and Space.
4. Add score, game over, restart, and exit.
5. Verify card lifecycle, exit, resize, mobile, and reduced motion before adding more games.

Acceptance:

- Fruity has a complete playable loop.
- The loop remains inside the expanded collection card.
- Restart and exit work repeatedly.

### Phase 5 - Remaining Games

1. Implement Stone Erosion Pong.
2. Implement Water Drip Runner.
3. Implement Bloom Petal Tennis.
4. Implement Chrome Mirror Lane.
5. Give every game a distinct fail state, score label, restart copy, and exit path.

Acceptance:

- First five visible collections have distinct games.
- Each game uses shared lifecycle hooks.
- No game leaks inputs into catalogue/search/cart controls.

### Phase 6 - Approved Expressive Transition

Only after explicit approval:

1. Add card mutation animation.
2. Add designer-face burst or suspicious response after repeated taps.
3. Add content-to-stage morph or glitch redraw.
4. Verify against the existing collection-card animation structure rule.

Acceptance:

- The transition uses one stable outer card shell.
- Existing expand/collapse remains unchanged.
- Reduced motion skips expressive animation.

### Phase 7 - QA

1. Manual QA on desktop Chrome/Safari.
2. Manual QA on mobile viewport and coarse pointer.
3. Verify reduced motion.
4. Verify language switch while game is inactive and active.
5. Verify card close while game is active.
6. Verify repeated unlock/play/restart/exit does not leave body locked or loops/listeners active.
7. Verify stage sizing at narrow widths and short viewport heights.

Acceptance:

- Existing collection carousel still works.
- Existing expanded card animation still works.
- Game mode is reversible.
- No major layout overlap in desktop or mobile screenshots.

## Open Decisions

- Confirm whether "designer face" should use real portraits, stylized generated faces, or abstract face badges.
- Confirm whether the semi-secret hint copy should be `DO NOT TAP THE DESIGNER` or something quieter.
- Confirm whether games should exist only for the first five visible collections or eventually all 10.
- Confirm whether high scores should persist in `localStorage`.
- Confirm whether session unlocks should survive page reload.
- Confirm whether Escape should only exit game mode or also close the expanded card when pressed again.

## Recommended First Slice

Build one vertical slice before implementing all five games:

1. Add designer face trigger and tap counter.
2. Add game shell without a real game.
3. Add reversible game mode with instant/minimal opacity switch.
4. Implement Fruity Label Bird only.
5. QA lifecycle, cleanup, resize, mobile, and reduced motion.

After that, add the other games as content modules. This keeps the risky part - the card-to-game shell, lifecycle cleanup, and integration with expanded cards - small and testable before multiplying game logic.
