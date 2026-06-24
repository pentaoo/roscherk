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

const CTA_LABEL_KEYS = {
  collapsed: "collection.checkIt",
  expanded: "collection.readMore",
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
    key: "sunglasses",
    src: "assets/clothes/hats/190974504_541699203516699_183373111195965728_n-... 2.png",
    alt: "Sunglasses from the Sheji visual archive",
    caption: "Lookbook crop: polished black lenses against the yellow collection field.",
  },
  {
    key: "painterPants",
    src: "assets/clothes/pants/cdg-painter-pants 2.png",
    alt: "Paint-splattered pants from the Sheji visual archive",
    caption: "Material note: paint marks, heavy cotton, and a graphic product silhouette.",
  },
  {
    key: "wovenVest",
    src: "assets/clothes/top/kp_woven_vest_blue_1600x-jpg-v-1569996245 2.png",
    alt: "Blue woven vest from the Sheji visual archive",
    caption: "Surface study: woven blue texture with a compact outerwear shape.",
  },
  {
    key: "suedeOvershirt",
    src: "assets/clothes/top/lightweight-suede-leather-overshirt-chocolate-b... 2.png",
    alt: "Brown suede overshirt from the Sheji visual archive",
    caption: "Styling frame: suede shell, oversized volume, and outdoor references.",
  },
  {
    key: "bucketHat",
    src: "assets/clothes/hats/217702833_492815288678751_852093036610599298_n-... 2.png",
    alt: "Green bucket hat from the Sheji visual archive",
    caption: "Accessory close-up: saturated green, soft crown, and embroidered graphics.",
  },
  {
    key: "orangePuffer",
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
const COLLECTION_STACK_DESKTOP_ACTIVE_Y = 295;
const COLLECTION_STACK_DESKTOP_GAP = 33;
const COLLECTION_STACK_DESKTOP_HIDDEN_GAP = 360;
const COLLECTION_STACK_MOBILE_ACTIVE_X = "7vw";
const COLLECTION_STACK_MOBILE_NEIGHBOR_Y = 18;
const COLLECTION_STACK_MOBILE_NEIGHBOR_SCALE = 0.86;
const COLLECTION_STACK_MOBILE_HIDDEN_Y = 22;
const COLLECTION_STACK_MOBILE_HIDDEN_SCALE = 0.8;
const COLLECTION_LAYOUT_MOTION_SELECTORS = [
  ".collection-card__title",
  ".collection-card__meta",
  ".collection-card__description",
];
const COLLECTION_LAYOUT_MOTION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const COLLECTION_TITLE_FIT_GAP_DESKTOP = 8;
const COLLECTION_TITLE_FIT_GAP_MOBILE = 6;

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

function getCtaLabel(state) {
  const labelKey = CTA_LABEL_KEYS[state];
  const fallback = state === "expanded" ? "Read more" : "Take a look";
  return window.ShejiI18n?.t?.(labelKey, {}, fallback) || fallback;
}

function getCollectionMediaText(media, field) {
  return window.ShejiI18n?.t?.(`collectionMedia.${media.key}.${field}`, {}, media[field]) || media[field];
}

function updateCollectionCardContent(card, collection, index) {
  card.querySelector(".collection-card__title").textContent =
    window.ShejiI18n?.collectionTitle?.(collection) || collection.title;
  card.querySelector(".collection-card__meta strong").textContent = collection.designer;
  card.querySelector(".collection-card__description").textContent =
    window.ShejiI18n?.collectionField?.(collection, "description") || collection.description;
  setExpandedCopy(card, collection, index);
  setCtaLabel(card, card.classList.contains("is-expanded") ? getCtaLabel("expanded") : getCtaLabel("collapsed"));
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
    card.dataset.collectionId = collection.id || "";
    updateCollectionCardContent(card, collection, index);
    window.ShejiI18n?.applyTranslations?.(card);

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

function getCollectionCardHeight(card) {
  if (!card) {
    return 0;
  }

  return Math.ceil(card.offsetHeight);
}

function measureCollectionTitleWidth(title, titleStyle) {
  if (!document.body) {
    return title.scrollWidth;
  }

  const clone = title.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "-10000px";
  clone.style.width = "max-content";
  clone.style.minWidth = "0";
  clone.style.maxWidth = "none";
  clone.style.visibility = "hidden";
  clone.style.pointerEvents = "none";
  clone.style.fontSize = titleStyle.fontSize;
  clone.style.whiteSpace = "nowrap";
  document.body.append(clone);

  const width = Math.ceil(clone.getBoundingClientRect().width || clone.scrollWidth);
  clone.remove();

  return width;
}

function syncCollectionCardTitleFit(cards, { isMobile = false } = {}) {
  cards.forEach((card) => {
    const title = card.querySelector(".collection-card__title");
    const meta = card.querySelector(".collection-card__meta");

    if (!title || card.classList.contains("is-expanded") || card.classList.contains("is-animating")) {
      card.style.removeProperty("--collection-card-title-size");
      return;
    }

    const previousTransition = title.style.transition;
    title.style.transition = "none";
    card.style.removeProperty("--collection-card-title-size");
    title.offsetWidth;

    const titleStyle = window.getComputedStyle(title);
    const currentSize = Number.parseFloat(titleStyle.fontSize);
    const safetyGap = isMobile ? COLLECTION_TITLE_FIT_GAP_MOBILE : COLLECTION_TITLE_FIT_GAP_DESKTOP;
    const titleRect = title.getBoundingClientRect();
    const metaRect = meta?.getBoundingClientRect?.();
    const availableWidth = Math.max(
      0,
      metaRect && metaRect.left > titleRect.left
        ? metaRect.left - titleRect.left - safetyGap
        : title.clientWidth - safetyGap,
    );
    const titleWidth = measureCollectionTitleWidth(title, titleStyle);

    if (currentSize && availableWidth && titleWidth > availableWidth) {
      const minSize = isMobile ? 36 : 60;
      const nextSize = Math.max(minSize, Math.floor((currentSize * availableWidth) / titleWidth));
      card.style.setProperty("--collection-card-title-size", `${nextSize}px`);
    }

    title.offsetWidth;
    window.requestAnimationFrame(() => {
      if (title.isConnected) {
        title.style.transition = previousTransition;
      }
    });
  });
}

function setCollectionCardStack(card, { x = "0px", y = "0px", scale = 1 }) {
  card.style.setProperty("--collection-card-x", x);
  card.style.setProperty("--collection-card-y", y);
  card.style.setProperty("--collection-card-scale", String(scale));
}

function syncCollectionCardStack(cards, { isMobile = false } = {}) {
  const menu = cards[0]?.closest(".collection-menu");
  const activeCard = cards.find((card) => card.classList.contains("is-menu-active")) || cards[0];
  const activeHeight = getCollectionCardHeight(activeCard);

  if (isMobile) {
    if (menu) {
      menu.style.setProperty("--collection-menu-height", `${activeHeight + COLLECTION_STACK_MOBILE_NEIGHBOR_Y}px`);
    }

    cards.forEach((card) => {
      if (card.classList.contains("is-menu-active")) {
        setCollectionCardStack(card, { x: COLLECTION_STACK_MOBILE_ACTIVE_X, y: "0px", scale: 1 });
      } else if (card.classList.contains("is-menu-next")) {
        setCollectionCardStack(card, {
          x: "-74vw",
          y: `${COLLECTION_STACK_MOBILE_NEIGHBOR_Y}px`,
          scale: COLLECTION_STACK_MOBILE_NEIGHBOR_SCALE,
        });
      } else if (card.classList.contains("is-menu-prev")) {
        setCollectionCardStack(card, {
          x: "74vw",
          y: `${COLLECTION_STACK_MOBILE_NEIGHBOR_Y}px`,
          scale: COLLECTION_STACK_MOBILE_NEIGHBOR_SCALE,
        });
      } else if (card.classList.contains("is-hidden-above")) {
        setCollectionCardStack(card, {
          x: "-112vw",
          y: `${COLLECTION_STACK_MOBILE_HIDDEN_Y}px`,
          scale: COLLECTION_STACK_MOBILE_HIDDEN_SCALE,
        });
      } else {
        setCollectionCardStack(card, {
          x: "112vw",
          y: `${COLLECTION_STACK_MOBILE_HIDDEN_Y}px`,
          scale: COLLECTION_STACK_MOBILE_HIDDEN_SCALE,
        });
      }
    });

    return;
  }

  if (menu) {
    menu.style.setProperty("--collection-menu-height", "1080px");
  }

  cards.forEach((card) => {
    const cardHeight = getCollectionCardHeight(card);

    if (card.classList.contains("is-menu-active")) {
      setCollectionCardStack(card, { y: `${COLLECTION_STACK_DESKTOP_ACTIVE_Y}px` });
    } else if (card.classList.contains("is-menu-next")) {
      setCollectionCardStack(card, {
        y: `${COLLECTION_STACK_DESKTOP_ACTIVE_Y - cardHeight - COLLECTION_STACK_DESKTOP_GAP}px`,
      });
    } else if (card.classList.contains("is-menu-prev")) {
      setCollectionCardStack(card, {
        y: `${COLLECTION_STACK_DESKTOP_ACTIVE_Y + activeHeight + COLLECTION_STACK_DESKTOP_GAP}px`,
      });
    } else if (card.classList.contains("is-hidden-above")) {
      setCollectionCardStack(card, {
        y: `${COLLECTION_STACK_DESKTOP_ACTIVE_Y - cardHeight - COLLECTION_STACK_DESKTOP_HIDDEN_GAP}px`,
      });
    } else {
      setCollectionCardStack(card, {
        y: `${COLLECTION_STACK_DESKTOP_ACTIVE_Y + activeHeight + COLLECTION_STACK_DESKTOP_HIDDEN_GAP}px`,
      });
    }
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

function captureCollectionLayout(card) {
  return COLLECTION_LAYOUT_MOTION_SELECTORS.map((selector) => {
    const node = card.querySelector(selector);
    if (!node) {
      return null;
    }

    return {
      node,
      rect: node.getBoundingClientRect(),
    };
  }).filter(Boolean);
}

function playCollectionLayoutTransition(layout, duration) {
  if (window.ShejiMotion?.reducedMotion || !duration) {
    return;
  }

  layout.forEach(({ node, rect: firstRect }) => {
    if (!node?.isConnected || typeof node.animate !== "function") {
      return;
    }

    const lastRect = node.getBoundingClientRect();
    const deltaX = firstRect.left - lastRect.left;
    const deltaY = firstRect.top - lastRect.top;
    const scaleX = firstRect.width > 0 && lastRect.width > 0
      ? Math.max(0.2, Math.min(3, firstRect.width / lastRect.width))
      : 1;
    const scaleY = firstRect.height > 0 && lastRect.height > 0
      ? Math.max(0.2, Math.min(3, firstRect.height / lastRect.height))
      : 1;
    const hasLayoutDelta =
      Math.abs(deltaX) > 0.5 ||
      Math.abs(deltaY) > 0.5 ||
      Math.abs(scaleX - 1) > 0.01 ||
      Math.abs(scaleY - 1) > 0.01;

    if (!hasLayoutDelta) {
      return;
    }

    node.animate(
      [
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
        },
        {
          transform: "translate3d(0, 0, 0) scale(1, 1)",
          transformOrigin: "top left",
        },
      ],
      {
        duration,
        easing: COLLECTION_LAYOUT_MOTION_EASING,
      },
    );
  });
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
      alt: getCollectionMediaText(firstMedia, "alt"),
      caption:
        window.ShejiI18n?.t?.("collection.detailCaption", {
          title: window.ShejiI18n?.collectionTitle?.(collection) || collection.title,
          caption: getCollectionMediaText(firstMedia, "caption"),
        }) || `${collection.title} detail. ${firstMedia.caption}`,
    },
    {
      type: "text",
      text: window.ShejiI18n?.collectionField?.(collection, "expandedCopy") || collection.expandedCopy,
    },
    {
      type: "media",
      ...secondMedia,
      alt: getCollectionMediaText(secondMedia, "alt"),
      caption:
        window.ShejiI18n?.t?.("collection.stylingCaption", {
          title: window.ShejiI18n?.collectionTitle?.(collection) || collection.title,
          caption: getCollectionMediaText(secondMedia, "caption"),
        }) || `${collection.title} styling reference. ${secondMedia.caption}`,
    },
    {
      type: "text",
      text:
        window.ShejiI18n?.t?.("collection.fullDrop", {
          description: window.ShejiI18n?.collectionField?.(collection, "description") || collection.description,
        }) ||
        `${collection.description} The full drop keeps the same visual language across product shots, labels, trims, and the way each piece sits on the body.`,
    },
  ];
}

function setExpandedCopy(card, collection, index) {
  const container = card.querySelector(".collection-card__expanded-copy");

  if (!container) {
    return;
  }

  container.innerHTML = "";
  const blocks = getCollectionLongread(collection, index);
  const mediaBlocks = blocks.filter((block) => block.type === "media");
  const textBlocks = blocks.filter((block) => block.type !== "media");

  if (mediaBlocks.length > 0) {
    const slider = document.createElement("div");
    slider.className = "collection-card__slider";
    slider.setAttribute("aria-label", window.ShejiI18n?.t?.("collection.mediaSlider", {}, "Collection images") || "Collection images");

    mediaBlocks.forEach((block) => {
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
      slider.append(figure);
    });

    container.append(slider);
  }

  textBlocks.forEach((block) => {
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

  const merchandising = window.ShejiRuntime.getMerchandisingData();
  const viewModel = createCollectionViewModel(cards.length);
  const { state } = viewModel;
  const mobileCollectionQuery = window.matchMedia("(max-width: 767px)");
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
    syncCollectionCardTitleFit(cards, { isMobile: mobileCollectionQuery.matches });
    syncCollectionCardStack(cards, { isMobile: mobileCollectionQuery.matches });
    window.ShejiRuntime.emitCollectionChange(state.activeIndex);
  };

  const syncStackLayout = () => {
    syncCollectionCardTitleFit(cards, { isMobile: mobileCollectionQuery.matches });
    syncCollectionCardStack(cards, { isMobile: mobileCollectionQuery.matches });
  };

  const scheduleStackSync = () => {
    if (state.phase !== COLLECTION_PHASES.idle) {
      return;
    }

    syncStackLayout();
    window.requestAnimationFrame(() => {
      if (state.phase === COLLECTION_PHASES.idle) {
        syncStackLayout();
      }
    });
    window.setTimeout(() => {
      if (state.phase === COLLECTION_PHASES.idle) {
        syncStackLayout();
      }
    }, contentDuration() + 120);
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
    syncStackLayout();
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
      const layout = captureCollectionLayout(card);
      card.classList.add("is-expanded");
      setCtaLabel(card, getCtaLabel("expanded"));
      playCollectionLayoutTransition(layout, contentDuration());
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
      return false;
    }

    applySlots();

    window.setTimeout(() => {
      viewModel.finishCycle();
      syncStackLayout();
    }, cycleDuration());

    return true;
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
    syncStackLayout();

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
    if (state.expandedCard) {
      window.ShejiCollectionGames?.closeCardGame?.(state.expandedCard);
    }

    const card = viewModel.beginClose();
    if (!card) {
      return;
    }

    card.classList.add("is-animating", "is-collapsing-content");
    commitCardGeometry(card);

    requestAnimationFrame(() => {
      const layout = captureCollectionLayout(card);
      card.classList.remove("is-expanded");
      resetCtaClickCollapse(card);
      setCtaLabel(card, getCtaLabel("collapsed"));
      playCollectionLayoutTransition(layout, contentDuration());
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
        event.target.closest(".collection-card__back") ||
        event.target.closest(".collection-card__designer-face") ||
        event.target.closest(".collection-game")
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
    if (state.expandedCard && viewModel.isFullSize()) {
      setExpandedGeometry(state.expandedCard);
      return;
    }

    scheduleStackSync();
  });

  window.ShejiI18n?.onChange?.(() => {
    cards.forEach((card, index) => {
      const collection = merchandising.getCollectionByIndex(index);
      if (collection) {
        updateCollectionCardContent(card, collection, index);
      }
    });
    window.ShejiI18n?.applyTranslations?.(menu);
    window.ShejiCollectionGames?.refreshLabels?.(menu);
    scheduleStackSync();
  });

  window.ShejiRuntime?.onCollectionNavigate?.(({ activeIndex = null, direction = 0 }) => {
    if (state.phase !== COLLECTION_PHASES.idle) {
      return;
    }

    const nextIndex =
      typeof activeIndex === "number"
        ? normalizeIndex(activeIndex, cards.length)
        : normalizeIndex(state.activeIndex + Number(direction || 0), cards.length);

    if (cycleTo(nextIndex)) {
      selectCollection(nextIndex);
    }
  });

  applySlots();
  window.ShejiCollectionGames?.initCollectionGames?.(menu);

  scheduleStackSync();

  document.fonts?.ready?.then(() => {
    scheduleStackSync();
  });
}

window.ShejiCollections = {
  createCollectionViewModel,
  getCardSlots,
  renderCollectionCards,
  initCollectionExperience,
};
