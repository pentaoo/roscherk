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

const COLLECTION_MEDIA = [
  {
    src: "assets/clothes/190974504_541699203516699_183373111195965728_n-... 1.png",
    alt: "Sunglasses from the Sheji visual archive",
    caption: "Lookbook crop: polished black lenses against the yellow collection field.",
  },
  {
    src: "assets/clothes/image-as-object 1.png",
    alt: "Folded pants from the Sheji visual archive",
    caption: "Material note: heavy folds, clean seams, and a graphic product silhouette.",
  },
  {
    src: "assets/clothes/kp_woven_vest_blue_1600x-jpg-v-1569996245 1.png",
    alt: "Blue woven vest from the Sheji visual archive",
    caption: "Surface study: woven blue texture with a compact outerwear shape.",
  },
  {
    src: "assets/clothes/217702833_492815288678751_852093036610599298_n-... 1.png",
    alt: "Olive jacket from the Sheji visual archive",
    caption: "Styling frame: olive shell, oversized volume, and outdoor references.",
  },
  {
    src: "assets/clothes/413395-fd3a96ac4c26484e86b07d7bcf1b0b6c-png-q-1... 1.png",
    alt: "Green cap from the Sheji visual archive",
    caption: "Accessory close-up: saturated green, soft crown, and casual branding.",
  },
  {
    src: "assets/clothes/screenshot-png 1.png",
    alt: "Orange puffer jacket from the Sheji visual archive",
    caption: "Drop reference: inflated orange panels and high-contrast street styling.",
  },
];

const OVERLAY_OPEN_PHASES = new Set([
  "expanding-shell",
  "expanding-content",
  "expanded",
  "collapsing-content",
]);

const FULL_SIZE_PHASES = new Set([
  "expanding-content",
  "expanded",
  "collapsing-content",
]);

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

function initCollectionExperience(menu) {
  const cards = Array.from(menu.querySelectorAll(".collection-card"));
  if (cards.length === 0) {
    return;
  }

  const state = {
    activeIndex: Math.min(1, cards.length - 1),
    phase: "idle",
    expandedCard: null,
    isCycling: false,
    isAnimating: false,
    sourceRect: null,
    animationFallback: null,
    pendingPhaseEnd: null,
  };

  const cycleDuration = () => window.ShejiMotion.durationMs("--duration-menu-cycle");
  const shellDuration = () => window.ShejiMotion.durationMs("--duration-expand");
  const shellBuffer = () => window.ShejiMotion.durationMs("--duration-expand-buffer");
  const contentDuration = () => window.ShejiMotion.durationMs("--duration-expand-content");
  const contentBuffer = () => window.ShejiMotion.durationMs("--duration-expand-content-buffer");

  const applyViewPhase = () => {
    document.body.classList.toggle("collection-view-open", OVERLAY_OPEN_PHASES.has(state.phase));
    document.body.classList.toggle("collection-view-closing", state.phase === "collapsing-shell");
  };

  const applySlots = () => {
    applyCardSlots(cards, getCardSlots(state.activeIndex, cards.length));
    window.dispatchEvent(
      new CustomEvent("sheji:collectionchange", {
        detail: {
          activeIndex: state.activeIndex,
          collection: window.SHEJI_COLLECTIONS?.[state.activeIndex] || null,
        },
      }),
    );
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
    if (!state.expandedCard || state.phase !== "collapsing-shell") {
      return;
    }

    const card = state.expandedCard;
    resetCtaClickCollapse(card);
    clearAnimationTimer();
    state.isAnimating = false;
    state.phase = "idle";
    state.expandedCard = null;
    state.sourceRect = null;

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
    state.phase = "expanded";
    state.isAnimating = false;
    card.classList.remove("is-animating", "is-expanding-content");
  };

  const beginContentExpand = (card) => {
    if (state.phase !== "expanding-shell") {
      return;
    }

    state.phase = "expanding-content";
    card.classList.add("is-expanding-content");
    commitCardGeometry(card);

    requestAnimationFrame(() => {
      card.classList.add("is-expanded");
      setCtaLabel(card, CTA_LABELS.expanded);
      replayCtaHover(card);
    });

    schedulePhaseEnd("expanding-content", contentDuration() + contentBuffer(), () => {
      finishOpen(card);
    });
  };

  const beginShellCollapse = (card) => {
    if (state.phase !== "collapsing-content") {
      return;
    }

    state.phase = "collapsing-shell";
    applyViewPhase();
    card.classList.remove("is-expanded");
    setExpandedGeometry(card);
    commitCardGeometry(card);

    requestAnimationFrame(() => {
      card.classList.add("is-collapsing-shell");
      setCardGeometry(card, state.sourceRect);
    });

    schedulePhaseEnd("collapsing-shell", shellDuration() + shellBuffer(), () => {
      finishClose();
    });
  };

  const handleShellTransitionEnd = (card, event) => {
    if (event.target !== card || event.propertyName !== "width") {
      return;
    }

    if (state.pendingPhaseEnd === "expanding-shell") {
      clearAnimationTimer();
      beginContentExpand(card);
      return;
    }

    if (state.pendingPhaseEnd === "collapsing-shell") {
      clearAnimationTimer();
      finishClose();
    }
  };

  const cycleTo = (nextIndex) => {
    if (state.isCycling || state.phase !== "idle" || nextIndex === state.activeIndex) {
      return;
    }

    state.isCycling = true;
    state.activeIndex = normalizeIndex(nextIndex, cards.length);
    applySlots();

    window.setTimeout(() => {
      state.isCycling = false;
    }, cycleDuration());
  };

  const cycleByScroll = (deltaY) => {
    const direction = deltaY > 0 ? 1 : -1;
    cycleTo(normalizeIndex(state.activeIndex + direction, cards.length));
  };

  const openCard = (card) => {
    if (
      state.isAnimating ||
      state.phase !== "idle" ||
      !card.classList.contains("is-menu-active")
    ) {
      return false;
    }

    state.isAnimating = true;
    state.expandedCard = card;
    state.sourceRect = card.getBoundingClientRect();
    setCardGeometry(card, state.sourceRect);
    card.classList.add("is-animating");
    commitCardGeometry(card);

    state.phase = "expanding-shell";
    applyViewPhase();

    requestAnimationFrame(() => {
      setExpandedGeometry(card);
    });

    schedulePhaseEnd("expanding-shell", shellDuration() + shellBuffer(), () => {
      beginContentExpand(card);
    });

    return true;
  };

  const closeCard = () => {
    if (
      state.isAnimating ||
      state.phase !== "expanded" ||
      !state.expandedCard ||
      !state.sourceRect
    ) {
      return;
    }

    const card = state.expandedCard;
    state.isAnimating = true;
    state.phase = "collapsing-content";
    card.classList.add("is-animating", "is-collapsing-content");
    commitCardGeometry(card);

    requestAnimationFrame(() => {
      card.classList.remove("is-expanded");
      resetCtaClickCollapse(card);
      setCtaLabel(card, CTA_LABELS.collapsed);
      replayCtaHover(card);
    });

    schedulePhaseEnd("collapsing-content", contentDuration() + contentBuffer(), () => {
      beginShellCollapse(card);
    });
  };

  cards.forEach((card, index) => {
    card.addEventListener("transitionend", (event) => {
      handleShellTransitionEnd(card, event);
    });

    card.querySelector(".collection-card__cta")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (state.phase === "idle" && openCard(card)) {
        playCtaClickCollapse(event.currentTarget);
      }
    });

    card.querySelector(".collection-card__back")?.addEventListener("click", (event) => {
      event.preventDefault();
      closeCard();
    });

    card.addEventListener("click", (event) => {
      if (
        state.phase !== "idle" ||
        index === state.activeIndex ||
        event.target.closest(".collection-card__cta") ||
        event.target.closest(".collection-card__back")
      ) {
        return;
      }

      const isNeighbor =
        index === normalizeIndex(state.activeIndex - 1, cards.length) ||
        index === normalizeIndex(state.activeIndex + 1, cards.length);

      if (isNeighbor) {
        cycleTo(index);
      }
    });
  });

  menu.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) < 8) {
        return;
      }

      event.preventDefault();
      cycleByScroll(event.deltaY);
    },
    { passive: false },
  );

  window.addEventListener("resize", () => {
    if (!state.expandedCard || !FULL_SIZE_PHASES.has(state.phase)) {
      return;
    }

    setExpandedGeometry(state.expandedCard);
  });

  applySlots();
}

window.ShejiCollections = {
  getCardSlots,
  renderCollectionCards,
  initCollectionExperience,
};
