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

function formatLookPrice(price) {
  return `${price}$`;
}

function getProductDisplayName(product) {
  return [product.collection, product.name].filter(Boolean).join(" ");
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
    createLookText("look-item__collection", product.collection),
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
  link.textContent = "Open product";

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

function createLookItem({ product, desktop, mobile, parallax }, index, state) {
  const item = document.createElement("a");
  item.className = "collage-card look-item";
  item.href = getProductHref(product);
  item.dataset.productId = product.id;
  item.dataset.parallax = String(parallax || 36);
  item.setAttribute(
    "aria-label",
    `Open ${getProductDisplayName(product)} for ${formatLookPrice(product.price)}`,
  );

  setLayoutVars(item, desktop, "desktop");
  setLayoutVars(item, mobile || desktop, "mobile");

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.alt;
  image.draggable = false;

  item.append(image, createLookInfo(product));

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
    activeProductId: null,
    enabled: desktopQuery.matches && !motionQuery.matches,
    generation: 0,
    mouseX: 0,
    mouseY: 0,
    rafId: 0,
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

      mobilePanel.collection.textContent = product.collection;
      mobilePanel.name.textContent = product.name;
      mobilePanel.price.textContent = formatLookPrice(product.price);
      mobilePanel.link.href = getProductHref(product);
      mobilePanel.link.setAttribute("aria-label", `Open ${getProductDisplayName(product)}`);
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

  const scheduleCursorRender = () => {
    if (state.rafId) {
      return;
    }

    state.rafId = window.requestAnimationFrame(renderCursor);
  };

  const renderLook = (collection, activeIndex = 0) => {
    if (!collection || collection.id === state.activeCollectionId) {
      return;
    }

    state.generation += 1;
    state.activeCollectionId = collection.id;
    state.clearMobileProduct();

    const generation = state.generation;
    const lookItems = resolveLookItems(collection, merchandising);
    const nodes = lookItems.map((lookItem, index) => createLookItem(lookItem, index, state));

    collage.dataset.collectionIndex = String(activeIndex);
    collage.dataset.collectionId = collection.id;
    stage.replaceChildren(...nodes);
    resetCursor();

    window.requestAnimationFrame(() => {
      if (state.generation !== generation) {
        return;
      }

      nodes.forEach(settleEntryState);

      window.setTimeout(() => {
        if (state.generation !== generation) {
          return;
        }

        nodes.forEach((node) => {
          node.style.setProperty("--look-delay", "0ms");
        });
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

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      state.clearMobileProduct();
    }
  });

  window.ShejiRuntime.onCollectionChange(({ activeIndex = 0, collection }) => {
    renderLook(collection || merchandising.getCollectionByIndex(activeIndex), activeIndex);
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
