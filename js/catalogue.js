const PRICE_FILTERS = [
  {
    labelKey: "filters.priceUnder100",
    value: "under-100",
    matches: (product) => product.price < 100,
  },
  {
    labelKey: "filters.price100To300",
    value: "100-300",
    matches: (product) => product.price >= 100 && product.price <= 300,
  },
  {
    labelKey: "filters.priceOver300",
    value: "over-300",
    matches: (product) => product.price > 300,
  },
];

const CART_STORAGE_KEY = "sheji-cart";
const FAVORITES_STORAGE_KEY = "sheji-favorites";

function readStoredCart(productsById) {
  try {
    const storedRows = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]");

    if (!Array.isArray(storedRows)) {
      return new Map();
    }

    return new Map(
      storedRows
        .filter(([productId, quantity]) => productsById.has(productId) && Number.isFinite(quantity))
        .map(([productId, quantity]) => [productId, Math.max(1, quantity)]),
    );
  } catch {
    return new Map();
  }
}

function writeStoredCart(cart) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([...cart.entries()]));
  } catch {
    // Cart still works in memory if storage is unavailable.
  }
}

function getDefaultFavorites(products) {
  return new Set(products.filter((product) => product.liked).map((product) => product.id));
}

function readStoredFavorites(productsById, products) {
  try {
    const storedProductIds = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || "null");

    if (!Array.isArray(storedProductIds)) {
      return getDefaultFavorites(products);
    }

    return new Set(storedProductIds.filter((productId) => productsById.has(productId)));
  } catch {
    return getDefaultFavorites(products);
  }
}

function writeStoredFavorites(favorites) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites.values()]));
  } catch {
    // Favorites still work in memory if storage is unavailable.
  }
}

function uniqueValues(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function formatPrice(price) {
  return window.ShejiI18n?.formatPrice?.(price) || `${price}$`;
}

function getProductSearchText(product) {
  return [
    product.searchableText,
    window.ShejiI18n?.getProductSearchText?.(product),
    ...(product.sizes || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function createCatalogueCommerce(merchandising = window.ShejiRuntime?.getMerchandisingData?.()) {
  const products = merchandising?.products || window.SHEJI_PRODUCTS || [];
  const productsById =
    merchandising?.productsById || new Map(products.map((product) => [product.id, product]));
  const filters = {
    size: null,
    colour: null,
    price: null,
  };
  const favorites = readStoredFavorites(productsById, products);
  const cart = readStoredCart(productsById);
  const subscribers = new Set();

  const getProduct = (productId) =>
    merchandising?.getProduct?.(productId) || productsById.get(productId) || null;

  const notify = (change) => {
    subscribers.forEach((subscriber) => subscriber(change));
  };

  const productMatchesSearch = (product, query) => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return true;
    }

    return getProductSearchText(product).includes(normalized);
  };

  const productMatchesFilters = (product) => {
    if (filters.size && !product.sizes.includes(filters.size)) {
      return false;
    }

    if (filters.colour && product.colour !== filters.colour) {
      return false;
    }

    if (filters.price) {
      const priceFilter = PRICE_FILTERS.find(({ value }) => value === filters.price);

      if (priceFilter && !priceFilter.matches(product)) {
        return false;
      }
    }

    return true;
  };

  const state = {
    activeCollection: null,
    activeCollectionId: null,
    search: "",
  };

  const productMatchesCollection = (product) => {
    if (!state.activeCollectionId) {
      return true;
    }

    return product.collectionId === state.activeCollectionId;
  };

  return {
    addToCart(productId) {
      if (!getProduct(productId)) {
        return;
      }

      cart.set(productId, (cart.get(productId) || 0) + 1);
      writeStoredCart(cart);
      notify({ type: "cart", productId });
    },
    clearCart() {
      cart.clear();
      writeStoredCart(cart);
      notify({ type: "cart" });
    },
    getActiveFilter(group) {
      return filters[group] || null;
    },
    getCartCount() {
      return [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
    },
    getCartRows() {
      const rows = new Map();

      cart.forEach((quantity, productId) => {
        const product = getProduct(productId);

        if (!product) {
          return;
        }

        const displayKey = [product.collection, product.name, product.price, product.colour].join("|");
        const existingRow = rows.get(displayKey);

        if (existingRow) {
          existingRow.quantity += quantity;
          existingRow.lineTotal += product.price * quantity;
        } else {
          rows.set(displayKey, {
            product,
            quantity,
            lineTotal: product.price * quantity,
          });
        }
      });

      return [...rows.values()];
    },
    getCartQuantity(productId) {
      return cart.get(productId) || 0;
    },
    getCartTotal() {
      return this.getCartRows().reduce((sum, row) => sum + row.lineTotal, 0);
    },
    getFavoriteCount() {
      return favorites.size;
    },
    getFavoriteRows() {
      return products.filter((product) => favorites.has(product.id));
    },
    getFilterOptions(group) {
      if (group === "size") {
        return uniqueValues(products.flatMap((product) => product.sizes)).map((value) => ({
          label: value,
          value,
        }));
      }

      if (group === "colour") {
        return uniqueValues(products.map((product) => product.colour)).map((value) => ({
          label: window.ShejiI18n?.translateColour?.(value) || value,
          value,
        }));
      }

      return PRICE_FILTERS.map(({ labelKey, value }) => ({
        label: window.ShejiI18n?.t?.(labelKey) || labelKey,
        value,
      }));
    },
    getFilters() {
      return { ...filters };
    },
    getActiveCollection() {
      return state.activeCollection;
    },
    getProduct(productId) {
      return getProduct(productId);
    },
    getProducts() {
      return [...products];
    },
    getRecommendations(productId, limit = 5) {
      const selectedProduct = getProduct(productId);
      const seenImages = new Set(selectedProduct?.image ? [selectedProduct.image] : []);
      const uniqueProducts = [];
      const duplicateProducts = [];

      products.forEach((product) => {
        if (product.id === productId) {
          return;
        }

        if (seenImages.has(product.image)) {
          duplicateProducts.push(product);
          return;
        }

        seenImages.add(product.image);
        uniqueProducts.push(product);
      });

      return [...uniqueProducts, ...duplicateProducts].slice(0, limit);
    },
    getVisibleProducts() {
      return products.filter(
        (product) =>
          productMatchesCollection(product) &&
          productMatchesFilters(product) &&
          productMatchesSearch(product, state.search),
      );
    },
    isFavorite(productId) {
      return favorites.has(productId);
    },
    setFilter(group, value) {
      filters[group] = filters[group] === value ? null : value;
      notify({ type: "filter", group, value: filters[group] });
    },
    setActiveCollection(collection) {
      state.activeCollection = collection || null;
      state.activeCollectionId = collection?.id || null;
      notify({ type: "collection", collection: state.activeCollection });
    },
    setSearch(value) {
      state.search = value;
      notify({ type: "search", value });
    },
    setCartQuantity(productId, quantity) {
      if (!getProduct(productId)) {
        return;
      }

      const nextQuantity = Math.max(0, Math.floor(Number(quantity) || 0));

      if (nextQuantity === 0) {
        cart.delete(productId);
      } else {
        cart.set(productId, nextQuantity);
      }

      writeStoredCart(cart);
      notify({ type: "cart", productId });
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => {
        subscribers.delete(subscriber);
      };
    },
    toggleFavorite(productId) {
      if (!getProduct(productId)) {
        return;
      }

      if (favorites.has(productId)) {
        favorites.delete(productId);
      } else {
        favorites.add(productId);
      }

      writeStoredFavorites(favorites);
      notify({ type: "favorite", productId });
    },
  };
}

function createIcon(src, alt = "") {
  const icon = document.createElement("img");
  icon.src = src;
  icon.alt = alt;
  return icon;
}

function renderSaleRail(product) {
  const rail = document.createElement("div");
  rail.className = "product-card__sale-rail";

  const label = document.createElement("span");
  label.className = "product-card__sale-name";
  label.textContent = product.name;

  const line = document.createElement("span");
  line.className = "product-card__sale-line";
  line.setAttribute("aria-hidden", "true");
  const lineText = (
    window.ShejiI18n?.t?.("product.saleRail", { badge: "" }) ||
    "SALE! SALE! SALE!"
  ).replace(/\s+/g, " ").trim();

  for (let index = 0; index < 2; index += 1) {
    const group = document.createElement("span");
    group.className = "product-card__sale-group";
    group.textContent = lineText;
    line.append(group);
  }

  rail.append(line, label);
  return rail;
}

function renderNamePill(product) {
  const name = document.createElement("span");
  name.className = "product-card__name";
  name.textContent = product.name;
  return name;
}

function renderPriceButton(product) {
  const button = document.createElement("button");
  button.className = "price-pill";
  button.type = "button";
  button.dataset.addToCart = product.id;
  button.setAttribute(
    "aria-label",
    window.ShejiI18n?.t?.("product.addNamedToCartForPrice", {
      name: window.ShejiI18n?.productDisplayName?.(product) || product.name,
      price: formatPrice(product.price),
    }) || `Add ${product.name} to cart for ${formatPrice(product.price)}`,
  );

  button.append(
    createIcon("source/icons/shopping_cart.svg"),
    document.createTextNode(formatPrice(product.price)),
  );

  return button;
}

function renderProductCard(product, commerce) {
  const isFavorite = commerce.isFavorite(product.id);
  const card = document.createElement("article");
  card.className = `product-card${product.sale ? " product-card--sale" : ""}`;
  card.dataset.productId = product.id;
  card.dataset.tone = product.imageTone || "object";

  const favorite = document.createElement("button");
  favorite.className = "product-card__favorite";
  favorite.type = "button";
  favorite.dataset.favorite = product.id;
  favorite.setAttribute(
    "aria-label",
    window.ShejiI18n?.t?.("product.favorite", {
      name: window.ShejiI18n?.productDisplayName?.(product) || product.name,
    }) || `Favorite ${product.name}`,
  );
  favorite.setAttribute("aria-pressed", isFavorite ? "true" : "false");
  favorite.append(
    createIcon(isFavorite ? "source/icons/favorite.svg" : "source/icons/favorite_border.svg"),
  );

  const media = document.createElement("div");
  media.className = "product-card__media";

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = window.ShejiI18n?.productField?.(product, "alt") || product.alt;
  image.loading = "lazy";
  media.append(image);

  const detailLink = document.createElement("a");
  detailLink.className = "product-card__detail-link";
  detailLink.href = `product.html?id=${encodeURIComponent(product.id)}`;
  detailLink.dataset.viewProduct = product.id;
  detailLink.setAttribute(
    "aria-label",
    window.ShejiI18n?.t?.("product.viewDetail", {
      name: window.ShejiI18n?.productDisplayName?.(product) || product.name,
    }) || `View ${product.name} product detail`,
  );

  const footer = document.createElement("div");
  footer.className = "product-card__footer";
  footer.append(
    product.sale ? renderSaleRail(product) : renderNamePill(product),
    renderPriceButton(product),
  );

  card.append(favorite, detailLink, media, footer);
  return card;
}

function renderEmptyState(grid) {
  const empty = document.createElement("p");
  empty.className = "product-grid__empty";
  empty.textContent = window.ShejiI18n?.t?.("product.emptyFilter") || "No clothes survived that filter.";
  grid.append(empty);
}

function renderCartPopover(popover, cartRows, total) {
  popover.innerHTML = "";

  if (cartRows.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = window.ShejiI18n?.t?.("cart.empty") || "Cart is empty.";
    popover.append(empty);
    return;
  }

  cartRows.forEach(({ product, quantity, lineTotal }) => {
    const row = document.createElement("div");
    row.className = "cart-popover__row";

    const productName = window.ShejiI18n?.productDisplayName?.(product) ||
      [product.collection, product.name].filter(Boolean).join(" ");
    const productTitle = document.createElement("span");
    productTitle.textContent =
      window.ShejiI18n?.t?.("cart.popoverLine", { name: productName, quantity }) ||
      `${productName} x ${quantity}`;

    const price = document.createElement("span");
    price.textContent = formatPrice(lineTotal);
    row.append(productTitle, price);
    popover.append(row);
  });

  const totalRow = document.createElement("div");
  totalRow.className = "cart-popover__total";
  totalRow.textContent = `${window.ShejiI18n?.t?.("cart.total") || "Total"} ${formatPrice(total)}`;
  popover.append(totalRow);
}

function updateCommerceStatus(root, commerce) {
  const cartButton = root.querySelector?.(".cart-status") || document.querySelector(".cart-status");
  const favoriteButton = root.querySelector?.(".favorite-status") || document.querySelector(".favorite-status");
  const cartCount = cartButton?.querySelector("[data-cart-count]") || root.querySelector?.("[data-cart-count]");
  const cartTotal = commerce.getCartCount();
  const favoriteTotal = commerce.getFavoriteCount?.() || 0;
  const formattedCartItems =
    window.ShejiI18n?.formatCartItemCount?.(cartTotal) ||
    `${cartTotal} ${cartTotal === 1 ? "item" : "items"}`;
  const formattedFavoriteItems =
    window.ShejiI18n?.formatFavoriteItemCount?.(favoriteTotal) ||
    `${favoriteTotal} ${favoriteTotal === 1 ? "item" : "items"}`;
  const cartItems = formattedCartItems.replace(`${cartTotal} `, "");
  const favoriteItems = formattedFavoriteItems.replace(`${favoriteTotal} `, "");

  if (cartCount) {
    cartCount.textContent = String(cartTotal);
  }

  cartButton?.setAttribute(
    "aria-label",
    window.ShejiI18n?.t?.("cart.open", {
      count: cartTotal,
      items: cartItems,
    }) || `Open cart, ${cartTotal} ${cartTotal === 1 ? "item" : "items"}`,
  );

  favoriteButton?.setAttribute(
    "aria-label",
    window.ShejiI18n?.t?.("favorites.open", {
      count: favoriteTotal,
      items: favoriteItems,
    }) || `Open favorites, ${favoriteTotal} ${favoriteTotal === 1 ? "item" : "items"}`,
  );

  favoriteButton?.classList.toggle("has-favorites", favoriteTotal > 0);
}

function setFilterControlOpen(control, isOpen) {
  control.classList.toggle("is-open", isOpen);
  control.querySelector("[data-filter-trigger]")?.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function scrollToExpandedCollectionCard() {
  const target = document.querySelector(".collection-card.is-expanded") || document.querySelector(".hero-stage") || document.getElementById("top");

  target?.scrollIntoView({
    behavior: window.ShejiMotion?.reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

function renderFilterOptions(control, commerce, render) {
  const group = control.dataset.filterGroup;
  const trigger = control.querySelector("[data-filter-trigger]");

  if (!group || !trigger) {
    return;
  }

  commerce.getFilterOptions(group).forEach(({ label, value }) => {
    const option = document.createElement("button");
    option.className = "filter-control__option button-block";
    option.type = "button";
    option.dataset.filterValue = value;
    option.setAttribute("aria-pressed", commerce.getActiveFilter(group) === value ? "true" : "false");
    option.textContent = label;

    option.addEventListener("click", () => {
      commerce.setFilter(group, value);
      render();
    });

    control.insertBefore(option, trigger);
  });
}

function updateFilterOptionLabels(control, commerce) {
  const group = control.dataset.filterGroup;
  const options = commerce.getFilterOptions(group);

  control.querySelectorAll("[data-filter-value]").forEach((button) => {
    const matchedOption = options.find((option) => option.value === button.dataset.filterValue);
    if (matchedOption) {
      button.textContent = matchedOption.label;
    }
  });
}

function initCatalogue(catalogue, commerce = createCatalogueCommerce()) {
  const grid = catalogue.querySelector("[data-product-grid]");
  const filterControls = Array.from(catalogue.querySelectorAll("[data-filter-control][data-filter-group]"));
  const searchInput = catalogue.querySelector("[data-catalogue-search]");
  const cartButton = catalogue.querySelector(".cart-status") || document.querySelector(".home-actions .cart-status");
  const controls = catalogue.querySelector(".catalogue__controls");
  const cartMenu = cartButton?.closest(".cart-status-menu");
  const backLink = catalogue.querySelector(".catalogue__back");
  const headingTitle = catalogue.querySelector(".catalogue__heading h1");
  const headingMeta = catalogue.querySelector(".catalogue__heading p");

  if (!grid) {
    return;
  }

  const defaultHeading = {
    title: window.ShejiI18n?.t?.("nav.allClothing") || headingTitle?.textContent || "All Clothing",
    metaText: window.ShejiI18n?.t?.("collection.curatedBy") || "drop curated by",
    metaMark: "SHEJI",
    backLabel: window.ShejiI18n?.t?.("nav.backToTop") || backLink?.getAttribute("aria-label") || "Back to top",
  };

  const cartPopover = document.createElement("div");
  cartPopover.className = "cart-popover";
  cartPopover.id = "cart-preview";
  cartPopover.hidden = true;
  cartButton?.setAttribute("aria-controls", cartPopover.id);
  (cartMenu || controls)?.append(cartPopover);

  const updateFilterControls = () => {
    filterControls.forEach((control) => {
      const group = control.dataset.filterGroup;
      const activeValue = commerce.getActiveFilter(group);
      const trigger = control.querySelector("[data-filter-trigger]");
      const optionButtons = control.querySelectorAll("[data-filter-value]");

      updateFilterOptionLabels(control, commerce);
      control.classList.toggle("is-filtered", Boolean(activeValue));
      trigger?.setAttribute("aria-pressed", activeValue ? "true" : "false");

      optionButtons.forEach((option) => {
        const isActive = option.dataset.filterValue === activeValue;
        option.classList.toggle("is-active", isActive);
        option.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    });
  };

  const updateCart = () => {
    updateCommerceStatus(cartButton?.closest(".cart-status-menu") || catalogue, commerce);
    renderCartPopover(cartPopover, commerce.getCartRows(), commerce.getCartTotal());
  };

  const updateHeading = () => {
    const activeCollection = commerce.getActiveCollection?.() || null;

    catalogue.classList.toggle("is-collection-filtered", Boolean(activeCollection));

    if (headingTitle) {
      headingTitle.textContent = activeCollection
        ? window.ShejiI18n?.collectionTitle?.(activeCollection) || activeCollection.title
        : window.ShejiI18n?.t?.("nav.allClothing") || defaultHeading.title;
    }

    if (headingMeta) {
      const mark = document.createElement("mark");
      mark.textContent = activeCollection?.designer || defaultHeading.metaMark;

      headingMeta.replaceChildren(
        document.createTextNode(
          `${activeCollection
            ? window.ShejiI18n?.t?.("collection.madeBy") || "drop made by"
            : window.ShejiI18n?.t?.("collection.curatedBy") || defaultHeading.metaText} `,
        ),
        mark,
      );
    }

    backLink?.setAttribute(
      "aria-label",
      activeCollection
        ? window.ShejiI18n?.t?.("nav.backToCollection") || "Back to collection"
        : window.ShejiI18n?.t?.("nav.backToTop") || defaultHeading.backLabel,
    );
  };

  commerce.subscribe?.((change) => {
    if (change.type === "cart" || change.type === "favorite") {
      updateCart();
    }
  });

  window.ShejiI18n?.onChange?.(() => {
    render();
  });

  const setCartPreviewOpen = (isOpen) => {
    if (!cartButton) {
      return;
    }

    cartPopover.hidden = !isOpen;
    cartMenu?.classList.toggle("is-open", isOpen);
    cartButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  const render = () => {
    const visibleProducts = commerce.getVisibleProducts();

    grid.innerHTML = "";
    visibleProducts.forEach((product) => {
      grid.append(renderProductCard(product, commerce));
    });

    if (visibleProducts.length === 0) {
      renderEmptyState(grid);
    }

    updateFilterControls();
    updateHeading();
    updateCart();
  };

  window.ShejiRuntime?.onCollectionSelect?.(({ collection }) => {
    commerce.setActiveCollection(collection || null);
    render();
  });

  backLink?.addEventListener("click", (event) => {
    if (!commerce.getActiveCollection?.()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    scrollToExpandedCollectionCard();
  });

  filterControls.forEach((control) => {
    const trigger = control.querySelector("[data-filter-trigger]");
    let ignoreMouseLeave = false;

    renderFilterOptions(control, commerce, render);

    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      ignoreMouseLeave = true;
      setFilterControlOpen(control, true);

      window.setTimeout(() => {
        ignoreMouseLeave = false;
      }, 150);
    });

    control.addEventListener("mouseleave", () => {
      if (ignoreMouseLeave) {
        return;
      }

      setFilterControlOpen(control, false);
    });
  });

  searchInput?.addEventListener("input", (event) => {
    commerce.setSearch(event.currentTarget.value);
    render();
  });

  catalogue.querySelectorAll("[data-search-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.searchSuggestion || "";
      if (searchInput) {
        searchInput.value = value;
      }
      commerce.setSearch(value);
      render();
    });
  });

  grid.addEventListener("click", (event) => {
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) {
      commerce.toggleFavorite(favorite.dataset.favorite);
      render();
      return;
    }

    const cartTrigger = event.target.closest("[data-add-to-cart]");
    if (cartTrigger) {
      commerce.addToCart(cartTrigger.dataset.addToCart);
      updateCart();
      return;
    }
  });

  cartButton?.addEventListener("pointerenter", () => {
    setCartPreviewOpen(true);
  });

  cartMenu?.addEventListener("pointerleave", () => {
    setCartPreviewOpen(false);
  });

  cartButton?.addEventListener("focusin", () => {
    setCartPreviewOpen(true);
  });

  cartMenu?.addEventListener("focusout", (event) => {
    if (!event.relatedTarget || !cartMenu.contains(event.relatedTarget)) {
      setCartPreviewOpen(false);
    }
  });

  render();
}

window.ShejiCatalogue = {
  createCatalogueCommerce,
  formatPrice,
  initCatalogue,
  updateCommerceStatus,
};
