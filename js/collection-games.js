const COLLECTION_GAME_EVENTS = {
  unlockStarted: "collection_game_unlock_started",
  unlocked: "collection_game_unlocked",
  started: "collection_game_started",
  over: "collection_game_over",
  exit: "collection_game_exit",
  replay: "collection_game_replay",
};

const COLLECTION_GAME_CLASSES = [
  "is-game-arming",
  "is-game-opening",
  "is-game-active",
  "is-game-paused",
  "is-game-ended",
];

const collectionGameStateByCard = new WeakMap();
const unlockedCollectionIds = new Set();
let activeGameState = null;
let globalsBound = false;

function collectionGameSlugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectionGameText(key, params = {}, fallback = key) {
  return window.ShejiI18n?.t?.(key, params, fallback) || fallback;
}

function getCollectionGameConfig(collection) {
  const games = window.SHEJI_COLLECTION_GAMES || {};
  const collectionId = collection?.id || collectionGameSlugify(collection?.title);
  return games[collectionId] || games[collectionGameSlugify(collection?.title)] || null;
}

function getDesignerInitials(collection) {
  return String(collection?.designer || collection?.title || "DG")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getShellNode(state, selector) {
  return state.shell?.querySelector(selector) || null;
}

function emitCollectionGameEvent(name, state, details = {}) {
  const payload = {
    collectionId: state.config.collectionId,
    gameId: state.config.id,
    ...details,
  };

  window.dispatchEvent(
    new CustomEvent(`sheji:${name}`, {
      detail: payload,
    }),
  );

  window.ShejiAnalytics?.track?.(name, payload);
}

function setCollectionGameProgress(state) {
  if (!state.sticker) {
    return;
  }

  if (state.unlocked) {
    state.sticker.hidden = false;
    state.sticker.textContent = collectionGameText("collectionGame.playAgain", {}, "PLAY AGAIN");
    return;
  }

  if (state.tapCount > 0) {
    state.sticker.hidden = false;
    state.sticker.textContent = collectionGameText(
      "collectionGame.progress",
      {
        count: state.tapCount,
        total: state.config.unlockTaps,
      },
      `${state.tapCount}/${state.config.unlockTaps}`,
    );
    return;
  }

  state.sticker.hidden = true;
  state.sticker.textContent = "";
}

function setCollectionGameScore(state, value) {
  state.lastScore = value;
  if (!state.scoreEl) {
    return;
  }

  const label = collectionGameText(state.config.scoreLabelKey, {}, "SCORE");
  state.scoreEl.textContent = `${label} ${String(value).padStart(3, "0")}`;
}

function refreshCollectionGameLabels(root = document) {
  root.querySelectorAll(".collection-card").forEach((card) => {
    const state = collectionGameStateByCard.get(card);
    if (!state) {
      return;
    }

    const title = window.ShejiI18n?.collectionTitle?.(state.collection) || state.collection.title;
    const gameTitle = collectionGameText(state.config.titleKey, {}, state.config.title);
    state.faceButton?.setAttribute(
      "aria-label",
      collectionGameText(
        state.config.ariaLabelKey,
        {
          title,
          gameTitle,
        },
        `Unlock ${title} mini game`,
      ),
    );
    state.faceButton?.setAttribute("title", collectionGameText("collectionGame.hint", {}, "Do not tap the designer"));

    if (state.faceCopy) {
      state.faceCopy.textContent = collectionGameText("collectionGame.hintShort", {}, "DO NOT TAP THE DESIGNER");
    }

    if (state.faceImage && state.config.faceSrc) {
      state.faceImage.hidden = false;
      state.faceImage.src = state.config.faceSrc;
      state.faceMark?.classList.remove("is-fallback");
    } else {
      state.faceImage?.removeAttribute("src");
      if (state.faceImage) {
        state.faceImage.hidden = true;
      }
      state.faceMark?.classList.add("is-fallback");
    }

    if (state.faceInitials) {
      state.faceInitials.textContent = getDesignerInitials(state.collection);
    }

    if (state.titleEl) {
      state.titleEl.textContent = gameTitle;
    }

    if (state.controlsEl) {
      state.controlsEl.textContent = collectionGameText(state.config.controlsKey, {}, "Tap / Space");
    }

    state.exitButtons.forEach((button) => {
      button.textContent = collectionGameText("collectionGame.exit", {}, "Exit");
    });

    if (state.restartButton) {
      state.restartButton.textContent = collectionGameText(state.config.restartKey, {}, collectionGameText("collectionGame.restart", {}, "Restart"));
    }

    setCollectionGameProgress(state);
    setCollectionGameScore(state, state.lastScore || 0);

    if (state.lastResult && state.resultEl) {
      renderCollectionGameResult(state, state.lastResult);
    }
  });
}

function resetCollectionGameArming(state) {
  window.clearTimeout(state.unlockTimer);
  state.unlockTimer = null;
  state.tapCount = 0;

  if (state.phase === "arming") {
    state.phase = "locked";
  }

  state.card.classList.remove("is-game-arming");
  setCollectionGameProgress(state);
}

function scheduleCollectionGameArmingReset(state, inputType) {
  window.clearTimeout(state.unlockTimer);
  state.unlockTimer = null;

  if (inputType === "keyboard") {
    return;
  }

  state.unlockTimer = window.setTimeout(() => {
    resetCollectionGameArming(state);
  }, state.config.unlockTimeoutMs || 2800);
}

function setCollectionCardContentInert(state, inert) {
  state.inertTargets.forEach((target) => {
    if (!target) {
      return;
    }

    if (inert) {
      target.dataset.collectionGamePreviousAriaHidden = target.getAttribute("aria-hidden") || "";
      target.setAttribute("aria-hidden", "true");
      if ("inert" in target) {
        target.inert = true;
      }
      return;
    }

    const previous = target.dataset.collectionGamePreviousAriaHidden;
    if (previous) {
      target.setAttribute("aria-hidden", previous);
    } else {
      target.removeAttribute("aria-hidden");
    }
    delete target.dataset.collectionGamePreviousAriaHidden;
    if ("inert" in target) {
      target.inert = false;
    }
  });
}

function buildCollectionGameContext(state) {
  return {
    collection: state.collection,
    card: state.card,
    setScore(value) {
      setCollectionGameScore(state, value);
    },
    endGame(result = {}) {
      endCollectionGame(state, result);
    },
    emit(eventName, details = {}) {
      emitCollectionGameEvent(eventName, state, details);
    },
    isReducedMotion() {
      return Boolean(window.ShejiMotion?.reducedMotion);
    },
    getStageSize() {
      const rect = state.stage.getBoundingClientRect();
      return {
        width: rect.width || state.stage.clientWidth,
        height: rect.height || state.stage.clientHeight,
      };
    },
  };
}

function destroyCollectionGameModule(state) {
  try {
    state.module?.destroy?.();
  } finally {
    state.module = null;
    if (state.stage) {
      state.stage.innerHTML = "";
    }
  }
}

function renderCollectionGameResult(state, result = {}) {
  state.lastResult = result;

  if (!state.resultEl) {
    return;
  }

  const resultText =
    result.resultText ||
    collectionGameText(result.resultKey || state.config.gameOverKey, {}, "GAME OVER");
  const scoreText = collectionGameText(
    "collectionGame.resultScore",
    { score: result.score ?? state.lastScore ?? 0 },
    `Score ${result.score ?? state.lastScore ?? 0}`,
  );

  state.resultEl.textContent = `${resultText} / ${scoreText}`;
}

function endCollectionGame(state, result = {}) {
  if (activeGameState !== state || state.phase === "closing") {
    return;
  }

  state.phase = "active";
  state.card.classList.add("is-game-ended");
  state.endEl.hidden = false;
  state.module?.pause?.();
  renderCollectionGameResult(state, result);
  state.liveEl.textContent = collectionGameText("collectionGame.overLive", {}, "Mini game over.");
  emitCollectionGameEvent(COLLECTION_GAME_EVENTS.over, state, {
    score: result.score ?? state.lastScore ?? 0,
    result: state.resultEl?.textContent || "",
  });
  state.restartButton?.focus?.({ preventScroll: true });
}

function startCollectionGameModule(state) {
  destroyCollectionGameModule(state);

  const moduleFactory = window.ShejiCollectionGameModules?.[state.config.module];
  if (typeof moduleFactory !== "function") {
    endCollectionGame(state, {
      resultText: collectionGameText("collectionGame.unavailable", {}, "GAME MODULE MISSING"),
      score: 0,
    });
    return;
  }

  state.module = moduleFactory({
    config: state.config,
    collection: state.collection,
  });
  state.lastResult = null;
  state.endEl.hidden = true;
  state.card.classList.remove("is-game-ended");
  setCollectionGameScore(state, 0);
  state.module.init(state.stage, buildCollectionGameContext(state));
  state.module.start();
}

function openCollectionGame(state, { isReplay = false } = {}) {
  if (!state.config || !state.card.classList.contains("is-expanded")) {
    return;
  }

  if (activeGameState && activeGameState !== state) {
    closeCollectionGame(activeGameState, { focusFace: false });
  }

  window.clearTimeout(state.unlockTimer);
  state.unlockTimer = null;
  state.tapCount = 0;
  state.unlocked = true;
  unlockedCollectionIds.add(state.config.collectionId);
  setCollectionGameProgress(state);

  state.phase = "opening";
  activeGameState = state;
  state.card.classList.remove("is-game-arming");
  state.card.classList.add("is-game-opening");
  state.shell.hidden = false;
  state.shell.setAttribute("aria-hidden", "false");
  state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : state.faceButton;
  setCollectionCardContentInert(state, true);
  refreshCollectionGameLabels(state.card);

  window.requestAnimationFrame(() => {
    if (activeGameState !== state || state.phase !== "opening") {
      return;
    }

    state.phase = "active";
    state.card.classList.remove("is-game-opening");
    state.card.classList.add("is-game-active");
    state.shell.focus({ preventScroll: true });
    startCollectionGameModule(state);
    state.liveEl.textContent = collectionGameText("collectionGame.startedLive", {}, "Mini game started.");
    emitCollectionGameEvent(isReplay ? COLLECTION_GAME_EVENTS.replay : COLLECTION_GAME_EVENTS.started, state);
  });
}

function closeCollectionGame(state, { focusFace = true } = {}) {
  if (!state || state.phase === "locked") {
    return;
  }

  const hadActiveShell = activeGameState === state || !state.shell.hidden;
  state.phase = "closing";
  destroyCollectionGameModule(state);
  window.clearTimeout(state.unlockTimer);
  state.unlockTimer = null;
  state.tapCount = 0;
  state.lastResult = null;
  state.shell.hidden = true;
  state.shell.setAttribute("aria-hidden", "true");
  state.endEl.hidden = true;
  state.liveEl.textContent = "";
  setCollectionCardContentInert(state, false);
  state.card.classList.remove(...COLLECTION_GAME_CLASSES);
  state.phase = "locked";
  setCollectionGameProgress(state);

  if (activeGameState === state) {
    activeGameState = null;
  }

  if (hadActiveShell) {
    emitCollectionGameEvent(COLLECTION_GAME_EVENTS.exit, state, {
      score: state.lastScore || 0,
    });
  }

  if (focusFace) {
    window.requestAnimationFrame(() => {
      state.faceButton?.focus?.({ preventScroll: true });
    });
  }
}

function restartCollectionGame(state) {
  if (activeGameState !== state || state.shell.hidden) {
    return;
  }

  emitCollectionGameEvent(COLLECTION_GAME_EVENTS.replay, state, {
    score: state.lastScore || 0,
  });
  startCollectionGameModule(state);
  state.shell.focus({ preventScroll: true });
}

function handleCollectionGameActivation(state, event, inputType) {
  event.preventDefault();
  event.stopPropagation();

  if (!state.card.classList.contains("is-expanded")) {
    resetCollectionGameArming(state);
    return;
  }

  if (activeGameState) {
    return;
  }

  if (state.unlocked || unlockedCollectionIds.has(state.config.collectionId)) {
    state.unlocked = true;
    openCollectionGame(state, { isReplay: true });
    return;
  }

  if (state.phase !== "locked" && state.phase !== "arming") {
    return;
  }

  if (state.phase !== "arming") {
    state.phase = "arming";
    state.card.classList.add("is-game-arming");
    emitCollectionGameEvent(COLLECTION_GAME_EVENTS.unlockStarted, state);
  }

  state.tapCount += 1;
  setCollectionGameProgress(state);

  if (state.tapCount >= (state.config.unlockTaps || 5)) {
    emitCollectionGameEvent(COLLECTION_GAME_EVENTS.unlocked, state);
    state.liveEl.textContent = collectionGameText("collectionGame.unlockedLive", {}, "Mini game unlocked.");
    openCollectionGame(state);
    return;
  }

  scheduleCollectionGameArmingReset(state, inputType);
}

function mapCollectionGameKey(key) {
  if (key === " " || key === "Spacebar") {
    return "action";
  }

  if (key === "Enter") {
    return "action";
  }

  if (key === "ArrowUp" || key.toLowerCase() === "w") {
    return "up";
  }

  if (key === "ArrowDown" || key.toLowerCase() === "s") {
    return "down";
  }

  if (key === "ArrowLeft" || key.toLowerCase() === "a") {
    return "left";
  }

  if (key === "ArrowRight" || key.toLowerCase() === "d") {
    return "right";
  }

  return null;
}

function handleGlobalCollectionGameKeydown(event) {
  if (!activeGameState) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    closeCollectionGame(activeGameState);
    return;
  }

  if (event.target instanceof Element && event.target.closest(".collection-game button")) {
    return;
  }

  const action = mapCollectionGameKey(event.key);
  if (!action) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  activeGameState.module?.handleInput?.({
    type: "key",
    action,
    key: event.key,
  });
}

function handleGlobalCollectionGameVisibility() {
  if (!activeGameState) {
    return;
  }

  if (document.hidden && activeGameState.phase === "active") {
    activeGameState.phase = "paused";
    activeGameState.card.classList.add("is-game-paused");
    activeGameState.module?.pause?.();
    return;
  }

  if (!document.hidden && activeGameState.phase === "paused") {
    activeGameState.phase = "active";
    activeGameState.card.classList.remove("is-game-paused");
    activeGameState.module?.resume?.();
  }
}

function handleGlobalCollectionGameBlur() {
  if (!activeGameState || activeGameState.phase !== "active") {
    return;
  }

  activeGameState.phase = "paused";
  activeGameState.card.classList.add("is-game-paused");
  activeGameState.module?.pause?.();
}

function handleGlobalCollectionGameFocus() {
  if (!activeGameState || activeGameState.phase !== "paused" || document.hidden) {
    return;
  }

  activeGameState.phase = "active";
  activeGameState.card.classList.remove("is-game-paused");
  activeGameState.module?.resume?.();
}

function handleGlobalCollectionGameResize() {
  activeGameState?.module?.resize?.();
}

function bindCollectionGameGlobals() {
  if (globalsBound) {
    return;
  }

  globalsBound = true;
  window.addEventListener("keydown", handleGlobalCollectionGameKeydown, true);
  document.addEventListener("visibilitychange", handleGlobalCollectionGameVisibility);
  window.addEventListener("blur", handleGlobalCollectionGameBlur);
  window.addEventListener("focus", handleGlobalCollectionGameFocus);
  window.addEventListener("resize", handleGlobalCollectionGameResize);
  window.ShejiI18n?.onChange?.(() => refreshCollectionGameLabels(document));
}

function getCollectionGamePointerPosition(stage, event) {
  const rect = stage.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function createFallbackCollectionGameShell(card) {
  const shell = document.createElement("section");
  shell.className = "collection-game";
  shell.hidden = true;
  shell.setAttribute("tabindex", "-1");
  shell.setAttribute("aria-hidden", "true");
  shell.innerHTML = `
    <header class="collection-game__hud">
      <div class="collection-game__copy">
        <p class="collection-game__title"></p>
        <p class="collection-game__score"></p>
      </div>
      <p class="collection-game__controls"></p>
      <button class="collection-game__exit" type="button" data-collection-game-exit>Exit</button>
    </header>
    <div class="collection-game__stage"></div>
    <div class="collection-game__end" hidden>
      <p class="collection-game__result"></p>
      <div class="collection-game__end-actions">
        <button class="collection-game__restart" type="button">Restart</button>
        <button class="collection-game__end-exit" type="button" data-collection-game-exit>Exit</button>
      </div>
    </div>
    <p class="collection-game__live visually-hidden" aria-live="polite"></p>
  `;
  card.append(shell);
  return shell;
}

function createCollectionGameState(card, collection, config) {
  const shell = card.querySelector("[data-collection-game-shell]") || createFallbackCollectionGameShell(card);
  const state = {
    card,
    collection,
    config,
    phase: "locked",
    tapCount: 0,
    unlockTimer: null,
    unlocked: unlockedCollectionIds.has(config.collectionId),
    module: null,
    lastScore: 0,
    lastResult: null,
    lastFocus: null,
    shell,
    faceButton: card.querySelector(".collection-card__designer-face"),
    faceMark: card.querySelector(".collection-card__designer-mark"),
    faceImage: card.querySelector(".collection-card__designer-image"),
    faceInitials: card.querySelector(".collection-card__designer-initials"),
    faceCopy: card.querySelector(".collection-card__designer-copy"),
    sticker: card.querySelector("[data-collection-game-sticker]"),
    titleEl: shell.querySelector(".collection-game__title"),
    scoreEl: shell.querySelector(".collection-game__score"),
    controlsEl: shell.querySelector(".collection-game__controls"),
    stage: shell.querySelector(".collection-game__stage"),
    endEl: shell.querySelector(".collection-game__end"),
    resultEl: shell.querySelector(".collection-game__result"),
    restartButton: shell.querySelector(".collection-game__restart"),
    exitButtons: Array.from(shell.querySelectorAll("[data-collection-game-exit]")),
    liveEl: shell.querySelector(".collection-game__live"),
    inertTargets: [
      card.querySelector(".collection-card__content"),
      card.querySelector(".collection-card__expanded-actions"),
      card.querySelector(".collection-card__cta"),
    ],
    lastActivationInput: "pointer",
  };

  shell.setAttribute("aria-hidden", "true");
  shell.setAttribute("tabindex", "-1");

  return state;
}

function bindCollectionGameState(state) {
  const designer = state.card.querySelector(".collection-card__designer");
  if (designer) {
    designer.hidden = false;
  }

  state.faceButton?.addEventListener("pointerdown", () => {
    state.lastActivationInput = "pointer";
  });

  state.faceButton?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      state.lastActivationInput = "keyboard";
    }
  });

  state.faceButton?.addEventListener("click", (event) => {
    handleCollectionGameActivation(state, event, state.lastActivationInput || (event.detail === 0 ? "keyboard" : "pointer"));
    state.lastActivationInput = "pointer";
  });

  state.exitButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeCollectionGame(state);
    });
  });

  state.restartButton?.addEventListener("click", (event) => {
    event.preventDefault();
    restartCollectionGame(state);
  });

  state.stage?.addEventListener("pointerdown", (event) => {
    if (activeGameState !== state || !state.endEl.hidden) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    state.stage.setPointerCapture?.(event.pointerId);
    state.stage.focus?.({ preventScroll: true });
    state.module?.handleInput?.({
      type: "pointer",
      action: "action",
      pointerType: event.pointerType,
      ...getCollectionGamePointerPosition(state.stage, event),
    });
  });

  state.stage?.addEventListener("pointermove", (event) => {
    if (activeGameState !== state || !state.endEl.hidden) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    state.module?.handleInput?.({
      type: "pointer",
      action: "move",
      pointerType: event.pointerType,
      ...getCollectionGamePointerPosition(state.stage, event),
    });
  });

  state.stage?.addEventListener("pointerup", (event) => {
    state.stage.releasePointerCapture?.(event.pointerId);
  });

  state.stage?.addEventListener("pointercancel", (event) => {
    state.stage.releasePointerCapture?.(event.pointerId);
  });
}

function initCollectionGames(menu) {
  bindCollectionGameGlobals();

  const merchandising = window.ShejiRuntime?.getMerchandisingData?.();
  if (!merchandising) {
    return;
  }

  Array.from(menu.querySelectorAll(".collection-card")).forEach((card) => {
    if (collectionGameStateByCard.has(card)) {
      return;
    }

    const index = Number(card.dataset.cardIndex || 0);
    const collection = merchandising.getCollectionByIndex(index);
    const config = getCollectionGameConfig(collection);
    const designer = card.querySelector(".collection-card__designer");

    if (!collection || !config) {
      if (designer) {
        designer.hidden = true;
      }
      return;
    }

    card.dataset.collectionId = config.collectionId;
    const state = createCollectionGameState(card, collection, config);
    collectionGameStateByCard.set(card, state);
    bindCollectionGameState(state);
  });

  refreshCollectionGameLabels(menu);
}

function closeCardGame(card) {
  const state = collectionGameStateByCard.get(card);
  if (!state) {
    return;
  }

  if (state.phase === "arming") {
    resetCollectionGameArming(state);
    return;
  }

  closeCollectionGame(state, { focusFace: false });
}

function closeActiveGame({ exceptCard = null } = {}) {
  if (!activeGameState || activeGameState.card === exceptCard) {
    return;
  }

  closeCollectionGame(activeGameState, { focusFace: false });
}

window.ShejiCollectionGames = {
  closeActiveGame,
  closeCardGame,
  initCollectionGames,
  refreshLabels: refreshCollectionGameLabels,
};
