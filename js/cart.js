(function initCartPage() {
  const root = document.querySelector("[data-cart-page]");

  if (!root || !window.ShejiCatalogue) {
    return;
  }

  window.ShejiRuntime?.init?.();

  const commerce = window.ShejiCatalogue.createCatalogueCommerce();
  const list = root.querySelector("[data-cart-list]");
  const empty = root.querySelector("[data-cart-empty]");
  const footer = root.querySelector("[data-cart-footer]");
  const summary = root.querySelector("[data-cart-summary]");
  const total = root.querySelector("[data-cart-total]");
  const formatPrice = window.ShejiCatalogue.formatPrice || ((price) => `${price}$`);

  function getProductName(product) {
    return [product.collection, product.name].filter(Boolean).join(" ");
  }

  function getItemLabel(count) {
    return `${count} ${count === 1 ? "item" : "items"}`;
  }

  function createQuantityButton(action, productId, label, text) {
    const button = document.createElement("button");
    button.className = "cart-item__quantity-button";
    button.type = "button";
    button.dataset.cartAction = action;
    button.dataset.productId = productId;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    return button;
  }

  function createCartRow({ product, quantity, lineTotal }) {
    const row = document.createElement("article");
    row.className = "cart-item";
    row.dataset.productId = product.id;

    const imageLink = document.createElement("a");
    imageLink.className = "cart-item__media";
    imageLink.href = `product.html?id=${encodeURIComponent(product.id)}`;

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.alt;
    image.loading = "lazy";
    imageLink.append(image);

    const copy = document.createElement("div");
    copy.className = "cart-item__copy";

    const eyebrow = document.createElement("p");
    eyebrow.className = "cart-item__eyebrow";
    eyebrow.textContent = product.collection;

    const title = document.createElement("h2");
    title.className = "cart-item__title";
    title.textContent = product.name;

    const meta = document.createElement("p");
    meta.className = "cart-item__meta";
    meta.textContent = `${product.colour} / ${product.sizes.join(", ")}`;

    copy.append(eyebrow, title, meta);

    const controls = document.createElement("div");
    controls.className = "cart-item__controls";

    const quantityControl = document.createElement("div");
    quantityControl.className = "cart-item__quantity";
    quantityControl.append(
      createQuantityButton("decrement", product.id, `Remove one ${getProductName(product)}`, "-"),
    );

    const quantityValue = document.createElement("span");
    quantityValue.className = "cart-item__quantity-value";
    quantityValue.textContent = String(quantity);
    quantityControl.append(
      quantityValue,
      createQuantityButton("increment", product.id, `Add one ${getProductName(product)}`, "+"),
    );

    const price = document.createElement("strong");
    price.className = "cart-item__price";
    price.textContent = formatPrice(lineTotal);

    const remove = document.createElement("button");
    remove.className = "cart-item__remove";
    remove.type = "button";
    remove.dataset.cartAction = "remove";
    remove.dataset.productId = product.id;
    remove.textContent = "Remove";

    controls.append(quantityControl, price, remove);
    row.append(imageLink, copy, controls);
    return row;
  }

  function render() {
    const rows = commerce.getCartRows();
    const count = commerce.getCartCount();

    if (list) {
      list.innerHTML = "";
      rows.forEach((row) => {
        list.append(createCartRow(row));
      });
    }

    if (summary) {
      summary.textContent = getItemLabel(count);
    }

    if (total) {
      total.textContent = formatPrice(commerce.getCartTotal());
    }

    const hasRows = rows.length > 0;
    empty.hidden = hasRows;
    footer.hidden = !hasRows;
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");

    if (!button) {
      return;
    }

    const { cartAction, productId } = button.dataset;
    const currentQuantity = commerce.getCartQuantity(productId);

    if (cartAction === "increment") {
      commerce.setCartQuantity(productId, currentQuantity + 1);
    }

    if (cartAction === "decrement") {
      commerce.setCartQuantity(productId, currentQuantity - 1);
    }

    if (cartAction === "remove") {
      commerce.setCartQuantity(productId, 0);
    }

    if (cartAction === "clear") {
      commerce.clearCart();
    }
  });

  commerce.subscribe(render);
  render();
})();
