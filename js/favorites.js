(function initFavoritesPage() {
  const root = document.querySelector("[data-favorites-page]");

  if (!root || !window.ShejiCatalogue) {
    return;
  }

  window.ShejiRuntime?.init?.();

  const commerce = window.ShejiCatalogue.createCatalogueCommerce();
  const list = root.querySelector("[data-favorites-list]");
  const empty = root.querySelector("[data-favorites-empty]");
  const summary = root.querySelector("[data-favorites-summary]");
  const formatPrice = window.ShejiCatalogue.formatPrice || window.ShejiI18n?.formatPrice || ((price) => `${price}$`);

  if (!list || !empty || !summary) {
    return;
  }

  function getProductName(product) {
    return window.ShejiI18n?.productDisplayName?.(product) ||
      [product.collection, product.name].filter(Boolean).join(" ");
  }

  function getItemLabel(count) {
    return window.ShejiI18n?.formatFavoriteItemCount?.(count) ||
      `${count} ${count === 1 ? "item" : "items"}`;
  }

  function createFavoriteRow(product) {
    const row = document.createElement("article");
    row.className = "cart-item favorite-item";
    row.dataset.productId = product.id;

    const imageLink = document.createElement("a");
    imageLink.className = "cart-item__media";
    imageLink.href = `product.html?id=${encodeURIComponent(product.id)}`;

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = window.ShejiI18n?.productField?.(product, "alt") || product.alt;
    image.loading = "lazy";
    imageLink.append(image);

    const copy = document.createElement("div");
    copy.className = "cart-item__copy";

    const eyebrow = document.createElement("p");
    eyebrow.className = "cart-item__eyebrow";
    eyebrow.textContent = product.collectionRecord
      ? window.ShejiI18n?.collectionTitle?.(product.collectionRecord) || product.collection
      : window.ShejiI18n?.collectionTitle?.(product.collection) || product.collection;

    const title = document.createElement("h2");
    title.className = "cart-item__title";
    title.textContent = product.name;

    const meta = document.createElement("p");
    meta.className = "cart-item__meta";
    meta.textContent =
      window.ShejiI18n?.t?.("cart.itemMeta", {
        colour: window.ShejiI18n?.translateColour?.(product.colour) || product.colour,
        sizes: product.sizes.join(", "),
      }) || `${product.colour} / ${product.sizes.join(", ")}`;

    copy.append(eyebrow, title, meta);

    const controls = document.createElement("div");
    controls.className = "cart-item__controls favorite-item__controls";

    const price = document.createElement("strong");
    price.className = "cart-item__price";
    price.textContent = formatPrice(product.price);

    const view = document.createElement("a");
    view.className = "cart-detail__shop-link favorite-item__view";
    view.href = `product.html?id=${encodeURIComponent(product.id)}`;
    view.textContent = window.ShejiI18n?.t?.("product.open") || "Open product";
    view.setAttribute(
      "aria-label",
      window.ShejiI18n?.t?.("product.view", { name: getProductName(product) }) ||
        `View ${getProductName(product)}`,
    );

    const remove = document.createElement("button");
    remove.className = "cart-item__remove";
    remove.type = "button";
    remove.dataset.favoriteRemove = product.id;
    remove.textContent = window.ShejiI18n?.t?.("favorites.remove") || "Remove from favorites";
    remove.setAttribute(
      "aria-label",
      window.ShejiI18n?.t?.("favorites.removeNamed", { name: getProductName(product) }) ||
        `Remove ${getProductName(product)} from favorites`,
    );

    controls.append(price, view, remove);
    row.append(imageLink, copy, controls);
    return row;
  }

  function render() {
    const rows = commerce.getFavoriteRows?.() || [];
    const count = commerce.getFavoriteCount?.() || rows.length;

    list.innerHTML = "";
    rows.forEach((product) => {
      list.append(createFavoriteRow(product));
    });

    summary.textContent = getItemLabel(count);
    empty.hidden = rows.length > 0;
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-remove]");

    if (!button) {
      return;
    }

    commerce.toggleFavorite(button.dataset.favoriteRemove);
  });

  commerce.subscribe(render);
  window.ShejiI18n?.onChange?.(render);
  render();
})();
