const LOOK_FALLBACK_LAYOUTS = [
  {
    desktop: { x: 49, y: 12, w: 33, z: 5, rotate: -2 },
    mobile: { x: 50, y: 13, w: 45, z: 5, rotate: -2, from: "left" },
    parallax: 44,
  },
  {
    desktop: { x: 48, y: 38, w: 41, z: 3, rotate: 1 },
    mobile: { x: 50, y: 40, w: 59, z: 3, rotate: 1, from: "right" },
    parallax: 30,
  },
  {
    desktop: { x: 47, y: 71, w: 33, z: 1, rotate: -3 },
    mobile: { x: 48, y: 69, w: 45, z: 1, rotate: -3, from: "left" },
    parallax: 20,
  },
  {
    desktop: { x: 67, y: 58, w: 34, z: 4, rotate: 7 },
    mobile: { x: 70, y: 58, w: 43, z: 4, rotate: 7, from: "right" },
    parallax: 52,
  },
  {
    desktop: { x: 37, y: 42, w: 30, z: 2, rotate: -8 },
    mobile: { x: 34, y: 44, w: 40, z: 2, rotate: -8, from: "left" },
    parallax: 38,
  },
];

const LOOK_HOTSPOT_VISIBLE_RATIO = 0.56;
const LOOK_HOTSPOT_MIN_PERCENT = 18;
const LOOK_HOTSPOT_MAX_PERCENT = 72;
const LOOK_HOTSPOT_ALPHA_THRESHOLD = 18;
const LOOK_SWIPE_THRESHOLD = 32;
const LOOK_HOTSPOT_CACHE = new Map();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeIndex(index, count) {
  if (count <= 0) {
    return 0;
  }

  return ((index % count) + count) % count;
}

function formatLookPrice(price) {
  return window.ShejiI18n?.formatPrice?.(price) || `${price}$`;
}

function getProductDisplayName(product) {
  return window.ShejiI18n?.productDisplayName?.(product) ||
    [product.collection, product.name].filter(Boolean).join(" ");
}

function getProductHref(product) {
  return `product.html?id=${encodeURIComponent(product.id)}`;
}

function setLayoutVars(node, layout, prefix) {
  node.style.setProperty(`--look-x-${prefix}`, `${layout.x}%`);
  node.style.setProperty(`--look-y-${prefix}`, `${layout.y}%`);
  node.style.setProperty(`--look-w-${prefix}`, `${layout.w}%`);
  node.style.setProperty(`--look-z-${prefix}`, String(layout.z));
  node.style.setProperty(`--look-rotate-${prefix}`, `${layout.rotate || 0}deg`);
}

function createLookText(className, text) {
  const node = document.createElement("span");
  node.className = className;
  node.textContent = text;
  return node;
}

function createLookInfo(product) {
  const info = document.createElement("span");
  info.className = "look-item__info";
  info.setAttribute("aria-hidden", "true");
  info.append(
    createLookText(
      "look-item__collection",
      product.collectionRecord
        ? window.ShejiI18n?.collectionTitle?.(product.collectionRecord) || product.collection
        : window.ShejiI18n?.collectionTitle?.(product.collection) || product.collection,
    ),
    createLookText("look-item__name", product.name),
    createLookText("look-item__price", formatLookPrice(product.price)),
  );
  return info;
}

function createMobilePanel() {
  const panel = document.createElement("div");
  panel.className = "look-mobile-panel";
  panel.hidden = true;

  const copy = document.createElement("div");
  copy.className = "look-mobile-panel__copy";

  const collection = createLookText("look-mobile-panel__collection", "");
  const name = createLookText("look-mobile-panel__name", "");
  const price = createLookText("look-mobile-panel__price", "");

  const link = document.createElement("a");
  link.className = "look-mobile-panel__link";
  link.textContent = window.ShejiI18n?.t?.("product.open") || "Open product";

  copy.append(collection, name, price);
  panel.append(copy, link);

  return {
    node: panel,
    collection,
    name,
    price,
    link,
  };
}

function resolveLookItems(collection, merchandising) {
  const products = merchandising.products || [];
  const explicitLook = Array.isArray(collection?.look) ? collection.look : [];

  if (explicitLook.length > 0) {
    return explicitLook
      .map((lookItem, index) => {
        const product = merchandising.getProduct?.(lookItem.productId);

        if (!product) {
          return null;
        }

        return {
          ...LOOK_FALLBACK_LAYOUTS[index % LOOK_FALLBACK_LAYOUTS.length],
          ...lookItem,
          product,
        };
      })
      .filter(Boolean);
  }

  return products
    .filter((product) => product.collectionId === collection?.id || product.collection === collection?.title)
    .slice(0, LOOK_FALLBACK_LAYOUTS.length)
    .map((product, index) => ({
      ...LOOK_FALLBACK_LAYOUTS[index % LOOK_FALLBACK_LAYOUTS.length],
      product,
    }));
}

function getEntryOffset(layout, index, isMobile, reducedMotion) {
  if (reducedMotion) {
    return { x: "0px", y: "0px" };
  }

  if (!isMobile) {
    return {
      x: "46vw",
      y: `${(index % 2 === 0 ? -1 : 1) * (18 + index * 4)}px`,
    };
  }

  const side = layout.mobile?.from || (index % 2 === 0 ? "left" : "right");

  return {
    x: side === "left" ? "-56vw" : "56vw",
    y: `${(index % 2 === 0 ? 1 : -1) * 22}px`,
  };
}

function applyEntryState(item, offset, index) {
  item.style.setProperty("--entry-x", offset.x);
  item.style.setProperty("--entry-y", offset.y);
  item.style.setProperty("--entry-opacity", "0");
  item.style.setProperty("--look-delay", `${index * 95}ms`);
}

function settleEntryState(item) {
  item.style.setProperty("--entry-x", "0px");
  item.style.setProperty("--entry-y", "0px");
  item.style.setProperty("--entry-opacity", "1");
}

function waitForAnimationFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(resolve);
  });
}

function waitForImageDecode(image) {
  if (!image) {
    return Promise.resolve();
  }

  if (typeof image.decode === "function") {
    return image.decode().catch(() => {});
  }

  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

function waitForLookImages(nodes) {
  return Promise.all(nodes.map((node) => waitForImageDecode(node.querySelector("img"))));
}

function getImageOpaqueBounds(image) {
  const width = image?.naturalWidth || 0;
  const height = image?.naturalHeight || 0;

  if (!width || !height) {
    return null;
  }

  const cacheKey = image.currentSrc || image.src;
  if (LOOK_HOTSPOT_CACHE.has(cacheKey)) {
    return LOOK_HOTSPOT_CACHE.get(cacheKey);
  }

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const step = Math.max(1, Math.floor(Math.max(width, height) / 420));
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    if (!context) {
      return null;
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0);

    const pixels = context.getImageData(0, 0, width, height).data;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alpha = pixels[(y * width + x) * 4 + 3];

        if (alpha <= LOOK_HOTSPOT_ALPHA_THRESHOLD) {
          continue;
        }

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (minX > maxX || minY > maxY) {
      return null;
    }

    const bounds = {
      centerX: ((minX + maxX) / 2 / width) * 100,
      centerY: ((minY + maxY) / 2 / height) * 100,
      width: ((maxX - minX + step) / width) * 100,
      height: ((maxY - minY + step) / height) * 100,
    };

    LOOK_HOTSPOT_CACHE.set(cacheKey, bounds);
    return bounds;
  } catch (error) {
    LOOK_HOTSPOT_CACHE.set(cacheKey, null);
    return null;
  }
}

function setLookHotspot(item, bounds) {
  const hotspotWidth = clamp(
    (bounds?.width || 100) * LOOK_HOTSPOT_VISIBLE_RATIO,
    LOOK_HOTSPOT_MIN_PERCENT,
    LOOK_HOTSPOT_MAX_PERCENT,
  );
  const hotspotHeight = clamp(
    (bounds?.height || 100) * LOOK_HOTSPOT_VISIBLE_RATIO,
    LOOK_HOTSPOT_MIN_PERCENT,
    LOOK_HOTSPOT_MAX_PERCENT,
  );

  item.dataset.hotspotWidth = String(hotspotWidth);
  item.dataset.hotspotHeight = String(hotspotHeight);
  item.style.setProperty("--hotspot-x", `${bounds?.centerX || 50}%`);
  item.style.setProperty("--hotspot-y", `${bounds?.centerY || 50}%`);
  item.style.setProperty("--hotspot-w", `${hotspotWidth}%`);
  item.style.setProperty("--hotspot-h", `${hotspotHeight}%`);
  item.style.setProperty("--hotspot-current-w", `${hotspotWidth}%`);
  item.style.setProperty("--hotspot-current-h", `${hotspotHeight}%`);
  item.style.setProperty("--hotspot-scale", "1");
  item.style.setProperty("--hotspot-info-offset", `${hotspotWidth / 2}%`);
}

function applyLookHotspots(nodes) {
  nodes.forEach((node) => {
    setLookHotspot(node, getImageOpaqueBounds(node.querySelector("img")));
  });
}

function doRectsOverlap(first, second) {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

function syncHotspotSeparation(nodes) {
  const hotspots = nodes
    .map((node) => ({
      node,
      hotspot: node.querySelector(".look-item__hotspot"),
      scale: 1,
    }))
    .filter(({ hotspot }) => Boolean(hotspot));

  hotspots.forEach(({ node }) => {
    node.style.setProperty("--hotspot-scale", "1");
    node.style.setProperty("--hotspot-current-w", `${Number(node.dataset.hotspotWidth || 62)}%`);
    node.style.setProperty("--hotspot-current-h", `${Number(node.dataset.hotspotHeight || 62)}%`);
    node.style.setProperty("--hotspot-info-offset", `${Number(node.dataset.hotspotWidth || 62) / 2}%`);
  });

  for (let pass = 0; pass < 8; pass += 1) {
    let changed = false;
    const rects = hotspots.map(({ hotspot }) => hotspot.getBoundingClientRect());

    for (let index = 0; index < rects.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < rects.length; nextIndex += 1) {
        if (!doRectsOverlap(rects[index], rects[nextIndex])) {
          continue;
        }

        hotspots[index].scale = Math.max(0.46, hotspots[index].scale * 0.88);
        hotspots[nextIndex].scale = Math.max(0.46, hotspots[nextIndex].scale * 0.88);
        changed = true;
      }
    }

    hotspots.forEach(({ node, scale }) => {
      const width = Number(node.dataset.hotspotWidth || 62);
      const height = Number(node.dataset.hotspotHeight || 62);
      node.style.setProperty("--hotspot-scale", String(scale));
      node.style.setProperty("--hotspot-current-w", `${width * scale}%`);
      node.style.setProperty("--hotspot-current-h", `${height * scale}%`);
      node.style.setProperty("--hotspot-info-offset", `${(width * scale) / 2}%`);
    });

    if (!changed) {
      break;
    }
  }
}

function createLookItem({ product, desktop, mobile, parallax }, index, state) {
  const item = document.createElement("a");
  item.className = "collage-card look-item";
  item.href = getProductHref(product);
  item.dataset.productId = product.id;
  item.dataset.parallax = String(parallax || 36);
  item.setAttribute(
    "aria-label",
    window.ShejiI18n?.t?.("product.openForPrice", {
      name: getProductDisplayName(product),
      price: formatLookPrice(product.price),
    }) || `Open ${getProductDisplayName(product)} for ${formatLookPrice(product.price)}`,
  );

  setLayoutVars(item, desktop, "desktop");
  setLayoutVars(item, mobile || desktop, "mobile");

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = window.ShejiI18n?.productField?.(product, "alt") || product.alt;
  image.loading = "eager";
  image.decoding = "async";
  image.draggable = false;

  if ("fetchPriority" in image) {
    image.fetchPriority = index < 3 ? "high" : "auto";
  }

  const hotspot = document.createElement("span");
  hotspot.className = "look-item__hotspot";
  hotspot.setAttribute("aria-hidden", "true");

  item.append(image, hotspot, createLookInfo(product));

  item.addEventListener("click", (event) => {
    if (!state.isMobile()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    state.selectMobileProduct(product.id);
  });

  applyEntryState(
    item,
    getEntryOffset({ mobile }, index, state.isMobile(), state.reducedMotion()),
    index,
  );

  return item;
}

function initHomeCollage(collage) {
  const merchandising = window.ShejiRuntime.getMerchandisingData();
  const stage = document.createElement("div");
  const mobilePanel = createMobilePanel();
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopQuery = window.matchMedia("(min-width: 768px) and (pointer: fine)");
  const mobileQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");

  stage.className = "home-collage__stage";
  collage.replaceChildren(stage, mobilePanel.node);

  const state = {
    activeCollectionId: null,
    activeCollectionIndex: 0,
    activeProductId: null,
    enabled: desktopQuery.matches && !motionQuery.matches,
    generation: 0,
    mouseX: 0,
    mouseY: 0,
    rafId: 0,
    swipePointerId: null,
    swipeStartX: 0,
    swipeStartY: 0,
    swipeCurrentX: 0,
    swipeCurrentY: 0,
    swipeProductId: null,
    isMobile: () => mobileQuery.matches,
    reducedMotion: () => motionQuery.matches,
    selectMobileProduct(productId) {
      const product = merchandising.getProduct?.(productId);

      if (!product) {
        return;
      }

      state.activeProductId = product.id;
      stage.querySelectorAll(".collage-card").forEach((item) => {
        const isActive = item.dataset.productId === product.id;
        item.classList.toggle("is-selected", isActive);
        item.setAttribute("aria-current", isActive ? "true" : "false");
      });

      mobilePanel.collection.textContent = product.collectionRecord
        ? window.ShejiI18n?.collectionTitle?.(product.collectionRecord) || product.collection
        : window.ShejiI18n?.collectionTitle?.(product.collection) || product.collection;
      mobilePanel.name.textContent = product.name;
      mobilePanel.price.textContent = formatLookPrice(product.price);
      mobilePanel.link.href = getProductHref(product);
      mobilePanel.link.textContent = window.ShejiI18n?.t?.("product.open") || "Open product";
      mobilePanel.link.setAttribute(
        "aria-label",
        window.ShejiI18n?.t?.("product.view", { name: getProductDisplayName(product) }) ||
          `Open ${getProductDisplayName(product)}`,
      );
      mobilePanel.node.hidden = false;
    },
    clearMobileProduct() {
      state.activeProductId = null;
      mobilePanel.node.hidden = true;
      stage.querySelectorAll(".collage-card").forEach((item) => {
        item.classList.remove("is-selected");
        item.removeAttribute("aria-current");
      });
    },
  };

  const getItems = () => Array.from(stage.querySelectorAll(".collage-card"));
  const navigateLook = (direction) => {
    const count = merchandising.collections?.length || 0;

    if (count <= 1) {
      return;
    }

    window.ShejiRuntime?.emitCollectionNavigate?.({
      direction,
      activeIndex: normalizeIndex(state.activeCollectionIndex + direction, count),
    });
  };

  const resetSwipeState = () => {
    state.swipePointerId = null;
    state.swipeStartX = 0;
    state.swipeStartY = 0;
    state.swipeCurrentX = 0;
    state.swipeCurrentY = 0;
    state.swipeProductId = null;
  };

  const finishSwipe = (endX, endY, event) => {
    const deltaX = endX - state.swipeStartX;
    const deltaY = endY - state.swipeStartY;
    const pointerId = state.swipePointerId;
    const productId = state.swipeProductId;
    resetSwipeState();

    if (pointerId !== null) {
      try {
        collage.releasePointerCapture(pointerId);
      } catch {
        // Ignore release failures for pointers the browser already cancelled.
      }
    }

    if (Math.abs(deltaX) < LOOK_SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) {
      if (state.isMobile() && productId) {
        event?.preventDefault?.();
        state.selectMobileProduct(productId);
      } else if (productId) {
        const product = merchandising.getProduct?.(productId);

        if (product) {
          event?.preventDefault?.();
          window.location.href = getProductHref(product);
        }
      }

      return;
    }

    event?.preventDefault?.();
    navigateLook(deltaX < 0 ? 1 : -1);
  };

  const resetCursor = () => {
    getItems().forEach((item) => {
      item.style.setProperty("--cursor-x", "0px");
      item.style.setProperty("--cursor-y", "0px");
    });
  };

  const renderCursor = () => {
    state.rafId = 0;

    if (!state.enabled) {
      resetCursor();
      return;
    }

    getItems().forEach((item, index) => {
      const strength = Number(item.dataset.parallax) || 36;
      const direction = index % 2 === 0 ? 1 : -1;
      const verticalDirection = index % 3 === 0 ? -1 : 1;

      item.style.setProperty("--cursor-x", `${(state.mouseX * strength * direction).toFixed(2)}px`);
      item.style.setProperty(
        "--cursor-y",
        `${(state.mouseY * strength * 0.44 * verticalDirection).toFixed(2)}px`,
      );
    });
  };

  const syncHotspots = () => {
    const nodes = getItems();
    syncHotspotSeparation(nodes);
  };

  const scheduleCursorRender = () => {
    if (state.rafId) {
      return;
    }

    state.rafId = window.requestAnimationFrame(renderCursor);
  };

  const renderLook = (collection, activeIndex = 0, { force = false } = {}) => {
    if (!collection || (!force && collection.id === state.activeCollectionId)) {
      return;
    }

    state.generation += 1;
    state.activeCollectionId = collection.id;
    state.activeCollectionIndex = activeIndex;
    state.clearMobileProduct();

    const generation = state.generation;
    const lookItems = resolveLookItems(collection, merchandising);
    const nodes = lookItems.map((lookItem, index) => createLookItem(lookItem, index, state));

    collage.dataset.collectionIndex = String(activeIndex);
    collage.dataset.collectionId = collection.id;
    stage.replaceChildren(...nodes);
    resetCursor();

    waitForLookImages(nodes).then(async () => {
      applyLookHotspots(nodes);
      await waitForAnimationFrame();
      await waitForAnimationFrame();

      if (state.generation !== generation) {
        return;
      }

      syncHotspotSeparation(nodes);
      nodes.forEach(settleEntryState);

      window.setTimeout(() => {
        if (state.generation !== generation) {
          return;
        }

        nodes.forEach((node) => {
          node.style.setProperty("--look-delay", "0ms");
        });
        syncHotspotSeparation(nodes);
      }, 840 + nodes.length * 95);
    });
  };

  const updateEnabled = () => {
    state.enabled = desktopQuery.matches && !motionQuery.matches;

    if (!state.enabled) {
      resetCursor();
    }

    if (!state.isMobile()) {
      state.clearMobileProduct();
    }
  };

  const listenToQuery = (query, callback) => {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", callback);
      return;
    }

    query.addListener(callback);
  };

  collage.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target : null;

    if (event.button !== 0 || target?.closest(".look-mobile-panel__link")) {
      return;
    }

    state.swipePointerId = event.pointerId;
    state.swipeStartX = event.clientX;
    state.swipeStartY = event.clientY;
    state.swipeCurrentX = event.clientX;
    state.swipeCurrentY = event.clientY;
    state.swipeProductId = target?.closest(".collage-card")?.dataset.productId || null;

    if (state.isMobile() || event.pointerType !== "mouse") {
      try {
        collage.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture can fail if the browser has already cancelled the pointer.
      }
    }
  });

  collage.addEventListener("pointermove", (event) => {
    if (state.swipePointerId !== event.pointerId) {
      return;
    }

    state.swipeCurrentX = event.clientX;
    state.swipeCurrentY = event.clientY;
  });

  collage.addEventListener("pointerup", (event) => {
    if (state.swipePointerId !== event.pointerId) {
      return;
    }

    finishSwipe(event.clientX, event.clientY, event);
  });

  collage.addEventListener("pointercancel", (event) => {
    if (state.swipePointerId !== event.pointerId) {
      return;
    }

    finishSwipe(state.swipeCurrentX, state.swipeCurrentY, event);
  });

  window.addEventListener("pointermove", (event) => {
    if (!state.enabled) {
      return;
    }

    state.mouseX = event.clientX / window.innerWidth - 0.5;
    state.mouseY = event.clientY / window.innerHeight - 0.5;
    scheduleCursorRender();
  });

  window.addEventListener("pointerleave", () => {
    state.mouseX = 0;
    state.mouseY = 0;
    scheduleCursorRender();
  });

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(syncHotspots);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      state.clearMobileProduct();
    }
  });

  window.ShejiRuntime.onCollectionChange(({ activeIndex = 0, collection }) => {
    renderLook(collection || merchandising.getCollectionByIndex(activeIndex), activeIndex);
  });

  window.ShejiI18n?.onChange?.(() => {
    const activeProductId = state.activeProductId;
    const activeCollection =
      merchandising.collectionsById?.get(state.activeCollectionId) ||
      merchandising.getCollectionByIndex(Number(collage.dataset.collectionIndex) || 0);

    renderLook(activeCollection, Number(collage.dataset.collectionIndex) || 0, { force: true });

    if (activeProductId) {
      state.selectMobileProduct(activeProductId);
    }

    window.requestAnimationFrame(syncHotspots);
  });

  listenToQuery(desktopQuery, updateEnabled);
  listenToQuery(motionQuery, updateEnabled);
  listenToQuery(mobileQuery, updateEnabled);

  updateEnabled();
  renderLook(merchandising.getCollectionByIndex(Math.min(1, merchandising.collections.length - 1)), 1);
}

window.ShejiCollage = {
  initHomeCollage,
};
