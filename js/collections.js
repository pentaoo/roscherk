const SLOT_CLASS_MAP = {
  active: "is-menu-active",
  next: "is-menu-next",
  prev: "is-menu-prev",
  hidden: "is-menu-hidden",
};

const STACK_CLASS_MAP = {
  above: "is-hidden-above",
  below: "is-hidden-below",
};

const CTA_LABELS = {
  collapsed: "Check it",
  expanded: "Read more",
};

const COLLECTION_PHASES = {
  idle: "idle",
  expandingShell: "expanding-shell",
  expandingContent: "expanding-content",
  expanded: "expanded",
  collapsingContent: "collapsing-content",
  collapsingShell: "collapsing-shell",
};

const COLLECTION_MEDIA = [
  {
    src: "assets/clothes/hats/190974504_541699203516699_183373111195965728_n-... 2.png",
    alt: "Sunglasses from the Sheji visual archive",
    caption: "Lookbook crop: polished black lenses against the yellow collection field.",
  },
  {
    src: "assets/clothes/pants/cdg-painter-pants 2.png",
    alt: "Paint-splattered pants from the Sheji visual archive",
    caption: "Material note: paint marks, heavy cotton, and a graphic product silhouette.",
  },
  {
    src: "assets/clothes/top/kp_woven_vest_blue_1600x-jpg-v-1569996245 2.png",
    alt: "Blue woven vest from the Sheji visual archive",
    caption: "Surface study: woven blue texture with a compact outerwear shape.",
  },
  {
    src: "assets/clothes/top/lightweight-suede-leather-overshirt-chocolate-b... 2.png",
    alt: "Brown suede overshirt from the Sheji visual archive",
    caption: "Styling frame: suede shell, oversized volume, and outdoor references.",
  },
  {
    src: "assets/clothes/hats/217702833_492815288678751_852093036610599298_n-... 2.png",
    alt: "Green bucket hat from the Sheji visual archive",
    caption: "Accessory close-up: saturated green, soft crown, and embroidered graphics.",
  },
  {
    src: "assets/clothes/top/screenshot-png 2.png",
    alt: "Orange puffer jacket from the Sheji visual archive",
    caption: "Drop reference: inflated orange panels and high-contrast street styling.",
  },
];

const OVERLAY_OPEN_PHASES = new Set([
  COLLECTION_PHASES.expandingShell,
  COLLECTION_PHASES.expandingContent,
  COLLECTION_PHASES.expanded,
  COLLECTION_PHASES.collapsingContent,
]);

const FULL_SIZE_PHASES = new Set([
  COLLECTION_PHASES.expandingContent,
  COLLECTION_PHASES.expanded,
  COLLECTION_PHASES.collapsingContent,
]);

const COLLECTION_WHEEL_THRESHOLD = 8;
const COLLECTION_WHEEL_LOCK_BUFFER = 260;

function normalizeIndex(index, count) {
  return ((index % count) + count) % count;
}

function getCardSlots(activeIndex, count) {
  const half = Math.floor(count / 2);

  return Array.from({ length: count }, (_, index) => {
    const isActive = index === activeIndex;
    const isNext = index === normalizeIndex(activeIndex - 1, count);
    const isPrev = index === normalizeIndex(activeIndex + 1, count);
    const isVisible = isActive || isNext || isPrev;
    const forwardDistance = normalizeIndex(index - activeIndex, count);
    const isHiddenBelow = forwardDistance > 0 && forwardDistance <= half;

    let role = "hidden";
    if (isActive) {
      role = "active";
    } else if (isNext) {
      role = "next";
    } else if (isPrev) {
      role = "prev";
    }

    return {
      index,
      role,
      stack: isVisible ? null : isHiddenBelow ? "below" : "above",
      ariaHidden: !isVisible,
    };
  });
}

function renderCollectionCards(menu, collections) {
  const template = document.getElementById("collection-card-template");
  if (!template) {
    return [];
  }

  collections.forEach((collection, index) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".collection-card");

    card.dataset.cardIndex = String(index);
    card.querySelector(".collection-card__title").textContent = collection.title;
    card.querySelector(".collection-card__meta strong").textContent = collection.designer;
    card.querySelector(".collection-card__description").textContent = collection.description;
    setExpandedCopy(card, collection, index);

    menu.appendChild(fragment);
  });

  return Array.from(menu.querySelectorAll(".collection-card"));
}

function applyCardSlots(cards, slots) {
  const allClasses = [
    ...Object.values(SLOT_CLASS_MAP),
    ...Object.values(STACK_CLASS_MAP),
  ];

  slots.forEach((slot) => {
    const card = cards[slot.index];
    if (!card) {
      return;
    }

    card.classList.remove(...allClasses);
    card.classList.add(SLOT_CLASS_MAP[slot.role]);

    if (slot.stack) {
      card.classList.add(STACK_CLASS_MAP[slot.stack]);
    }

    card.setAttribute("aria-hidden", slot.ariaHidden ? "true" : "false");
  });
}

function setCardGeometry(card, rect) {
  card.style.left = `${rect.left}px`;
  card.style.top = `${rect.top}px`;
  card.style.width = `${rect.width}px`;
  card.style.height = `${rect.height}px`;
}

function setExpandedGeometry(card) {
  card.style.left = "0";
  card.style.top = "0";
  card.style.width = window.ShejiMotion.expandedWidth();
  card.style.height = window.ShejiMotion.expandedHeight();
}

function clearCardGeometry(card) {
  card.style.left = "";
  card.style.top = "";
  card.style.width = "";
  card.style.height = "";
}

function commitCardGeometry(card) {
  card.getBoundingClientRect();
}

function setCtaLabel(card, label) {
  const labelNode = card.querySelector(".collection-card__cta-label");
  if (labelNode) {
    labelNode.textContent = label;
  }
}

function getCollectionLongread(collection, index) {
  const firstMedia = COLLECTION_MEDIA[index % COLLECTION_MEDIA.length];
  const secondMedia = COLLECTION_MEDIA[(index + 2) % COLLECTION_MEDIA.length];

  return [
    {
      type: "media",
      ...firstMedia,
      caption: `${collection.title} detail. ${firstMedia.caption}`,
    },
    {
      type: "text",
      text: collection.expandedCopy,
    },
    {
      type: "media",
      ...secondMedia,
      caption: `${collection.title} styling reference. ${secondMedia.caption}`,
    },
    {
      type: "text",
      text: `${collection.description} The full drop keeps the same visual language across product shots, labels, trims, and the way each piece sits on the body.`,
    },
  ];
}

function setExpandedCopy(card, collection, index) {
  const container = card.querySelector(".collection-card__expanded-copy");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  getCollectionLongread(collection, index).forEach((block) => {
    if (block.type === "media") {
      const figure = document.createElement("figure");
      figure.className = "collection-card__figure";

      const image = document.createElement("img");
      image.className = "collection-card__image";
      image.src = block.src;
      image.alt = block.alt;
      image.loading = "lazy";

      const caption = document.createElement("figcaption");
      caption.className = "collection-card__caption";
      caption.textContent = block.caption;

      figure.append(image, caption);
      container.append(figure);
      return;
    }

    const paragraph = document.createElement("p");
    paragraph.className = "collection-card__expanded-paragraph";
    paragraph.textContent = block.text;
    container.append(paragraph);
  });
}

function replayCtaHover(card) {
  const cta = card.querySelector(".collection-card__cta");
  if (!cta) {
    return;
  }

  cta.classList.remove("is-label-replay");
  void cta.offsetWidth;
  cta.classList.add("is-label-replay");

  const duration = window.ShejiMotion.durationMs("--duration-cta-replay");
  window.setTimeout(() => {
    cta.classList.remove("is-label-replay");
  }, duration);
}

function playCtaClickCollapse(cta) {
  cta.classList.remove("is-label-replay", "is-click-collapse");
  void cta.offsetWidth;
  cta.classList.add("is-click-collapse");
}

function resetCtaClickCollapse(card) {
  card.querySelector(".collection-card__cta")?.classList.remove("is-click-collapse");
}

function createCollectionViewModel(cardCount) {
  const state = {
    activeIndex: Math.min(1, cardCount - 1),
    phase: COLLECTION_PHASES.idle,
    expandedCard: null,
    isCycling: false,
    isAnimating: false,
    sourceRect: null,
    animationFallback: null,
    pendingPhaseEnd: null,
    pointerOverStack: false,
    wheelLockUntil: 0,
  };

  return {
    state,
    beginClose() {
      if (
        state.isAnimating ||
        state.phase !== COLLECTION_PHASES.expanded ||
        !state.expandedCard ||
        !state.sourceRect
      ) {
        return null;
      }

      state.isAnimating = true;
      state.phase = COLLECTION_PHASES.collapsingContent;
      return state.expandedCard;
    },
    beginContentExpand(card) {
      if (state.phase !== COLLECTION_PHASES.expandingShell) {
        return false;
      }

      state.phase = COLLECTION_PHASES.expandingContent;
      return true;
    },
    beginOpen(card, sourceRect) {
      if (
        state.isAnimating ||
        state.phase !== COLLECTION_PHASES.idle ||
        !card.classList.contains("is-menu-active")
      ) {
        return false;
      }

      state.isAnimating = true;
      state.expandedCard = card;
      state.sourceRect = sourceRect;
      state.phase = COLLECTION_PHASES.expandingShell;
      return true;
    },
    beginShellCollapse() {
      if (state.phase !== COLLECTION_PHASES.collapsingContent) {
        return false;
      }

      state.phase = COLLECTION_PHASES.collapsingShell;
      return true;
    },
    canHandleWheel(now, isOverCollectionCard) {
      const isLocked = now < state.wheelLockUntil;
      return state.phase === COLLECTION_PHASES.idle && (isLocked || isOverCollectionCard);
    },
    cycleTo(nextIndex) {
      const normalizedIndex = normalizeIndex(nextIndex, cardCount);

      if (
        state.isCycling ||
        state.phase !== COLLECTION_PHASES.idle ||
        normalizedIndex === state.activeIndex
      ) {
        return false;
      }

      state.isCycling = true;
      state.activeIndex = normalizedIndex;
      return true;
    },
    finishClose() {
      if (!state.expandedCard || state.phase !== COLLECTION_PHASES.collapsingShell) {
        return null;
      }

      const card = state.expandedCard;
      state.isAnimating = false;
      state.phase = COLLECTION_PHASES.idle;
      state.expandedCard = null;
      state.sourceRect = null;
      return card;
    },
    finishCycle() {
      state.isCycling = false;
    },
    finishOpen() {
      state.phase = COLLECTION_PHASES.expanded;
      state.isAnimating = false;
    },
    isBodyClosing() {
      return state.phase === COLLECTION_PHASES.collapsingShell;
    },
    isBodyOpen() {
      return OVERLAY_OPEN_PHASES.has(state.phase);
    },
    isFullSize() {
      return FULL_SIZE_PHASES.has(state.phase);
    },
    lockWheel(duration) {
      state.wheelLockUntil = window.performance.now() + duration + COLLECTION_WHEEL_LOCK_BUFFER;
    },
    setPointerOverStack(value) {
      state.pointerOverStack = value;
    },
  };
}

function initCollectionExperience(menu) {
  const cards = Array.from(menu.querySelectorAll(".collection-card"));
  if (cards.length === 0) {
    return;
  }

  const viewModel = createCollectionViewModel(cards.length);
  const { state } = viewModel;
  const mobileCollectionQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
  const swipeState = {
    pointerId: null,
    startX: 0,
    startY: 0,
  };

  const cycleDuration = () => window.ShejiMotion.durationMs("--duration-menu-cycle");
  const shellDuration = () => window.ShejiMotion.durationMs("--duration-expand");
  const shellBuffer = () => window.ShejiMotion.durationMs("--duration-expand-buffer");
  const contentDuration = () => window.ShejiMotion.durationMs("--duration-expand-content");
  const contentBuffer = () => window.ShejiMotion.durationMs("--duration-expand-content-buffer");

  const applyViewPhase = () => {
    document.body.classList.toggle("collection-view-open", viewModel.isBodyOpen());
    document.body.classList.toggle("collection-view-closing", viewModel.isBodyClosing());
  };

  const applySlots = () => {
    applyCardSlots(cards, getCardSlots(state.activeIndex, cards.length));
    window.ShejiRuntime.emitCollectionChange(state.activeIndex);
  };

  const clearAnimationTimer = () => {
    window.clearTimeout(state.animationFallback);
    state.animationFallback = null;
    state.pendingPhaseEnd = null;
  };

  const schedulePhaseEnd = (phaseName, duration, callback) => {
    clearAnimationTimer();
    state.pendingPhaseEnd = phaseName;

    state.animationFallback = window.setTimeout(() => {
      if (state.pendingPhaseEnd !== phaseName) {
        return;
      }

      state.pendingPhaseEnd = null;
      callback();
    }, duration);
  };

  const finishClose = () => {
    const card = viewModel.finishClose();
    if (!card) {
      return;
    }

    resetCtaClickCollapse(card);
    clearAnimationTimer();

    card.classList.add("is-restoring-menu");
    card.classList.remove(
      "is-animating",
      "is-collapsing-content",
      "is-collapsing-shell",
      "is-expanding-content",
    );
    applyViewPhase();
    clearCardGeometry(card);

    window.setTimeout(() => {
      card.classList.remove("is-restoring-menu");
    }, cycleDuration());
  };

  const finishOpen = (card) => {
    clearAnimationTimer();
    viewModel.finishOpen();
    card.classList.remove("is-animating", "is-expanding-content");
  };

  const beginContentExpand = (card) => {
    if (!viewModel.beginContentExpand(card)) {
      return;
    }

    card.classList.add("is-expanding-content");
    commitCardGeometry(card);

    requestAnimationFrame(() => {
      card.classList.add("is-expanded");
      setCtaLabel(card, CTA_LABELS.expanded);
      replayCtaHover(card);
    });

    schedulePhaseEnd(COLLECTION_PHASES.expandingContent, contentDuration() + contentBuffer(), () => {
      finishOpen(card);
    });
  };

  const beginShellCollapse = (card) => {
    if (!viewModel.beginShellCollapse()) {
      return;
    }

    applyViewPhase();
    card.classList.remove("is-expanded");
    setExpandedGeometry(card);
    commitCardGeometry(card);

    requestAnimationFrame(() => {
      card.classList.add("is-collapsing-shell");
      setCardGeometry(card, state.sourceRect);
    });

    schedulePhaseEnd(COLLECTION_PHASES.collapsingShell, shellDuration() + shellBuffer(), () => {
      finishClose();
    });
  };

  const handleShellTransitionEnd = (card, event) => {
    if (event.target !== card || event.propertyName !== "width") {
      return;
    }

    if (state.pendingPhaseEnd === COLLECTION_PHASES.expandingShell) {
      clearAnimationTimer();
      beginContentExpand(card);
      return;
    }

    if (state.pendingPhaseEnd === COLLECTION_PHASES.collapsingShell) {
      clearAnimationTimer();
      finishClose();
    }
  };

  const cycleTo = (nextIndex) => {
    if (!viewModel.cycleTo(nextIndex)) {
      return;
    }

    applySlots();

    window.setTimeout(() => {
      viewModel.finishCycle();
    }, cycleDuration());
  };

  const selectCollection = (index = state.activeIndex) => {
    window.ShejiRuntime.emitCollectionSelect(index);
  };

  const cycleByScroll = (deltaY) => {
    const direction = deltaY > 0 ? 1 : -1;
    cycleTo(normalizeIndex(state.activeIndex + direction, cards.length));
  };

  const resetSwipeState = () => {
    swipeState.pointerId = null;
    swipeState.startX = 0;
    swipeState.startY = 0;
  };

  const handleSwipeStart = (event) => {
    if (!mobileCollectionQuery.matches || state.phase !== COLLECTION_PHASES.idle) {
      return;
    }

    swipeState.pointerId = event.pointerId;
    swipeState.startX = event.clientX;
    swipeState.startY = event.clientY;
  };

  const handleSwipeEnd = (event) => {
    if (swipeState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - swipeState.startX;
    const deltaY = event.clientY - swipeState.startY;
    resetSwipeState();

    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) {
      return;
    }

    event.preventDefault();
    cycleTo(normalizeIndex(state.activeIndex + (deltaX < 0 ? 1 : -1), cards.length));
  };

  const isEventTargetInCollection = (event) =>
    event.target instanceof Element &&
    Boolean(event.target.closest(".collection-menu, .collection-card"));

  const isPointOverVisibleCard = (event) =>
    cards.some((card) => {
      if (card.getAttribute("aria-hidden") === "true" || !card.matches(".collection-card")) {
        return false;
      }

      const rect = card.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    });

  const handleCollectionWheel = (event) => {
    const now = window.performance.now();
    const isOverCollectionCard =
      state.pointerOverStack || isEventTargetInCollection(event) || isPointOverVisibleCard(event);

    if (!viewModel.canHandleWheel(now, isOverCollectionCard)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (!isOverCollectionCard || Math.abs(event.deltaY) < COLLECTION_WHEEL_THRESHOLD) {
      return;
    }

    viewModel.lockWheel(cycleDuration());
    cycleByScroll(event.deltaY);
  };

  const openCard = (card) => {
    const sourceRect = card.getBoundingClientRect();
    if (!viewModel.beginOpen(card, sourceRect)) {
      return false;
    }

    setCardGeometry(card, state.sourceRect);
    card.classList.add("is-animating");
    commitCardGeometry(card);

    applyViewPhase();

    requestAnimationFrame(() => {
      setExpandedGeometry(card);
    });

    schedulePhaseEnd(COLLECTION_PHASES.expandingShell, shellDuration() + shellBuffer(), () => {
      beginContentExpand(card);
    });

    return true;
  };

  const closeCard = () => {
    const card = viewModel.beginClose();
    if (!card) {
      return;
    }

    card.classList.add("is-animating", "is-collapsing-content");
    commitCardGeometry(card);

    requestAnimationFrame(() => {
      card.classList.remove("is-expanded");
      resetCtaClickCollapse(card);
      setCtaLabel(card, CTA_LABELS.collapsed);
      replayCtaHover(card);
    });

    schedulePhaseEnd(COLLECTION_PHASES.collapsingContent, contentDuration() + contentBuffer(), () => {
      beginShellCollapse(card);
    });
  };

  cards.forEach((card, index) => {
    card.addEventListener("transitionend", (event) => {
      handleShellTransitionEnd(card, event);
    });

    card.addEventListener("pointerenter", () => {
      viewModel.setPointerOverStack(true);
    });

    card.addEventListener("pointerleave", () => {
      viewModel.setPointerOverStack(false);
    });

    card.querySelector(".collection-card__cta")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (state.phase === COLLECTION_PHASES.idle && openCard(card)) {
        selectCollection(index);
        playCtaClickCollapse(event.currentTarget);
      }
    });

    card.querySelector(".collection-card__back")?.addEventListener("click", (event) => {
      event.preventDefault();
      closeCard();
    });

    card.addEventListener("click", (event) => {
      if (
        state.phase !== COLLECTION_PHASES.idle ||
        event.target.closest(".collection-card__cta") ||
        event.target.closest(".collection-card__back")
      ) {
        return;
      }

      if (index === state.activeIndex) {
        selectCollection(index);
        return;
      }

      const isNeighbor =
        index === normalizeIndex(state.activeIndex - 1, cards.length) ||
        index === normalizeIndex(state.activeIndex + 1, cards.length);

      if (isNeighbor) {
        cycleTo(index);
        selectCollection(index);
      }
    });
  });

  window.addEventListener("wheel", handleCollectionWheel, {
    passive: false,
    capture: true,
  });

  menu.addEventListener("pointerdown", handleSwipeStart);
  menu.addEventListener("pointerup", handleSwipeEnd);
  menu.addEventListener("pointercancel", resetSwipeState);

  window.addEventListener("resize", () => {
    if (!state.expandedCard || !viewModel.isFullSize()) {
      return;
    }

    setExpandedGeometry(state.expandedCard);
  });

  applySlots();
}

window.ShejiCollections = {
  createCollectionViewModel,
  getCardSlots,
  renderCollectionCards,
  initCollectionExperience,
};
