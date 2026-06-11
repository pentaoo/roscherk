const productDetailInstances = new Set();

function getProductDisplayName(product) {
  return [product.collection, product.name].filter(Boolean).join(" ");
}

function getProductList(commerce) {
  if (commerce?.getProducts) {
    return commerce.getProducts();
  }

  return window.ShejiRuntime?.getMerchandisingData?.().products || window.SHEJI_PRODUCTS || [];
}

function getInitialProductId(products) {
  const productId = new URLSearchParams(window.location.search).get("id");

  if (productId && products.some((product) => product.id === productId)) {
    return productId;
  }

  return products[0]?.id || null;
}

function syncProductUrl(productId) {
  const url = new URL(window.location.href);
  url.searchParams.set("id", productId);
  window.history.replaceState({}, "", url);
}

function createRecommendationCard(product, selectedProductId) {
  const card = document.createElement("button");
  card.className = "product-recommendation-card";
  card.type = "button";
  card.dataset.recommendedProduct = product.id;
  card.dataset.tone = product.imageTone || "object";
  card.classList.toggle("is-active", product.id === selectedProductId);
  card.setAttribute("aria-label", `View ${getProductDisplayName(product)}`);

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.alt;
  image.loading = "lazy";

  card.append(image);
  return card;
}

function initProductDetail(detail, commerce) {
  const products = getProductList(commerce);
  const title = detail.querySelector("[data-product-title]");
  const image = detail.querySelector("[data-product-image]");
  const addButton = detail.querySelector("[data-product-add]");
  const previousButton = detail.querySelector("[data-product-prev]");
  const nextButton = detail.querySelector("[data-product-next]");
  const recommendations = detail.querySelector("[data-product-recommendations]");
  const backLink = detail.querySelector(".product-detail__back");
  const sizeSelector = detail.querySelector("[data-size-selector]");
  const sizeTrigger = detail.querySelector("[data-size-trigger]");
  const sizeLabel = detail.querySelector("[data-size-label]");
  const cartButton = detail.querySelector(".cart-status");
  const cartCount = detail.querySelector("[data-cart-count]");

  if (!products.length || !image || !addButton || !recommendations) {
    return null;
  }

  let selectedProductId = detail.dataset.initialProduct || getInitialProductId(products);
  let selectedSize = null;

  const getProduct = (productId) =>
    commerce?.getProduct?.(productId) || products.find((product) => product.id === productId) || products[0];

  const scrollToDetail = () => {
    detail.scrollIntoView({
      behavior: window.ShejiMotion?.reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const setSizeSelectorOpen = (isOpen) => {
    sizeSelector?.classList.toggle("is-open", isOpen);
    sizeTrigger?.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  const selectSize = (size) => {
    selectedSize = size;
    detail.dataset.selectedSize = size;

    if (sizeLabel) {
      sizeLabel.textContent = size;
    }

    sizeSelector?.querySelectorAll("[data-size-value]").forEach((button) => {
      const isSelected = button.dataset.sizeValue === size;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  };

  const renderSizeOptions = (product) => {
    if (!sizeSelector || !sizeTrigger) {
      return;
    }

    sizeSelector.querySelectorAll("[data-size-value]").forEach((button) => {
      button.remove();
    });

    product.sizes.forEach((size) => {
      const option = document.createElement("button");
      option.className = "size-selector__option";
      option.type = "button";
      option.dataset.sizeValue = size;
      option.setAttribute("aria-pressed", "false");
      option.textContent = size;

      option.addEventListener("click", () => {
        selectSize(size);
        setSizeSelectorOpen(false);
      });

      sizeSelector.insertBefore(option, sizeTrigger);
    });

    selectSize(product.sizes.includes(selectedSize) ? selectedSize : product.sizes[0]);
  };

  const render = () => {
    const selectedProduct = getProduct(selectedProductId);
    const productName = getProductDisplayName(selectedProduct);
    const recommendedProducts =
      commerce?.getRecommendations?.(selectedProduct.id, 5) ||
      products.filter((product) => product.id !== selectedProduct.id).slice(0, 5);

    selectedProductId = selectedProduct.id;
    detail.dataset.selectedProduct = selectedProduct.id;
    detail.dataset.tone = selectedProduct.imageTone || "object";
    syncProductUrl(selectedProduct.id);
    renderSizeOptions(selectedProduct);

    if (title) {
      title.textContent = productName;
    }

    document.title = `${productName} - Sheji`;

    image.src = selectedProduct.image;
    image.alt = selectedProduct.alt;
    addButton.dataset.productId = selectedProduct.id;
    addButton.dataset.selectedSize = selectedSize || "";
    addButton.setAttribute("aria-label", `Add ${productName} to cart`);

    recommendations.innerHTML = "";
    recommendedProducts.forEach((product) => {
      recommendations.append(createRecommendationCard(product, selectedProduct.id));
    });
  };

  const updateCartStatus = () => {
    const cartTotal = commerce?.getCartCount?.() || 0;

    if (cartCount) {
      cartCount.textContent = String(cartTotal);
    }

    cartButton?.setAttribute(
      "aria-label",
      `Open cart, ${cartTotal} ${cartTotal === 1 ? "item" : "items"}`,
    );
  };

  const selectProduct = (productId, { scroll = false } = {}) => {
    selectedProductId = productId;
    render();

    if (scroll) {
      scrollToDetail();
    }
  };

  const moveProduct = (direction) => {
    const currentIndex = products.findIndex((product) => product.id === selectedProductId);
    const nextIndex = (currentIndex + direction + products.length) % products.length;
    selectProduct(products[nextIndex].id);
  };

  addButton.addEventListener("click", () => {
    addButton.dataset.selectedSize = selectedSize || "";
    commerce?.addToCart?.(selectedProductId);
    updateCartStatus();
  });

  commerce?.subscribe?.((change) => {
    if (change.type === "cart") {
      updateCartStatus();
    }
  });

  sizeTrigger?.addEventListener("click", () => {
    setSizeSelectorOpen(!sizeSelector?.classList.contains("is-open"));
  });

  sizeSelector?.addEventListener("mouseleave", () => {
    setSizeSelectorOpen(false);
  });

  previousButton?.addEventListener("click", () => {
    moveProduct(-1);
  });

  nextButton?.addEventListener("click", () => {
    moveProduct(1);
  });

  recommendations.addEventListener("click", (event) => {
    const card = event.target.closest("[data-recommended-product]");

    if (!card) {
      return;
    }

    selectProduct(card.dataset.recommendedProduct, { scroll: true });
  });

  backLink?.addEventListener("click", (event) => {
    const catalogue = document.getElementById("catalogue");

    if (!catalogue) {
      return;
    }

    event.preventDefault();
    catalogue.scrollIntoView({
      behavior: window.ShejiMotion?.reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });

  const instance = {
    openProduct(productId) {
      selectProduct(productId, { scroll: true });
    },
  };

  productDetailInstances.add(instance);
  render();
  updateCartStatus();
  return instance;
}

function openProduct(productId) {
  productDetailInstances.forEach((instance) => {
    instance.openProduct(productId);
  });
}

window.ShejiProductDetail = {
  initProductDetail,
  openProduct,
};
