function getShows() {
  return window.SHEJI_SHOWS || [];
}

function getProducts() {
  return window.ShejiRuntime?.getMerchandisingData?.().products || window.SHEJI_PRODUCTS || [];
}

function getShowHref(show) {
  return `show.html?id=${encodeURIComponent(show.id)}`;
}

function getProductHref(product) {
  return `product.html?id=${encodeURIComponent(product.id)}`;
}

function getProductById(productId, products = getProducts()) {
  return products.find((product) => product.id === productId);
}

function getProductDisplayName(product) {
  return window.ShejiI18n?.productDisplayName?.(product) ||
    [product.collection, product.name].filter(Boolean).join(" ");
}

function getShowField(show, field) {
  return window.ShejiI18n?.showField?.(show, field) || show?.[field] || "";
}

function getShowArrayField(show, field) {
  const value = window.ShejiI18n?.showField?.(show, field) || show?.[field] || [];
  return Array.isArray(value) ? value : [];
}

function getInitialShow(shows) {
  const showId = new URLSearchParams(window.location.search).get("id");

  if (showId) {
    const matchedShow = shows.find((show) => show.id === showId);

    if (matchedShow) {
      return matchedShow;
    }
  }

  return shows[0] || null;
}

function syncShowUrl(showId) {
  const url = new URL(window.location.href);
  url.searchParams.set("id", showId);
  window.history.replaceState({}, "", url);
}

function createShowsMenuItem(show) {
  const link = document.createElement("a");
  link.className = "shows-menu__event";
  link.href = getShowHref(show);
  link.setAttribute(
    "aria-label",
    window.ShejiI18n?.t?.("shows.open", { title: show.title }) || `Open ${show.title}`,
  );

  const thumb = document.createElement("span");
  thumb.className = "shows-menu__thumb";

  if (show.heroImage) {
    const image = document.createElement("img");
    image.src = show.heroImage;
    image.alt = "";
    image.loading = "lazy";
    thumb.append(image);
  }

  const copy = document.createElement("span");
  copy.className = "shows-menu__event-copy";

  const badge = document.createElement("span");
  badge.className = "shows-menu__badge";
  badge.textContent = getShowField(show, "badge");

  const date = document.createElement("span");
  date.className = "shows-menu__date";
  date.textContent = window.ShejiI18n?.formatDate?.(show.date) || show.date;

  const title = document.createElement("span");
  title.className = "shows-menu__title";
  title.textContent = show.title;

  const meta = document.createElement("span");
  meta.className = "shows-menu__meta";
  meta.textContent =
    window.ShejiI18n?.t?.("shows.meta", { venue: show.venue, city: show.city }) ||
    `${show.venue} / ${show.city}`;

  const summary = document.createElement("span");
  summary.className = "shows-menu__summary-line";
  summary.textContent = getShowField(show, "summary");

  const arrow = document.createElement("img");
  arrow.className = "shows-menu__arrow";
  arrow.src = "source/icons/east.svg";
  arrow.alt = "";

  copy.append(badge, date, title, meta, summary);
  link.append(thumb, copy, arrow);
  return link;
}

function initShowsMenu(menu, shows = getShows()) {
  const list = menu.querySelector("[data-shows-list]");
  const trigger = menu.querySelector("[data-shows-trigger]");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  shows.slice(0, 4).forEach((show) => {
    list.append(createShowsMenuItem(show));
  });

  if (list.children.length === 0) {
    const empty = document.createElement("p");
    empty.className = "shows-menu__empty";
    empty.textContent = window.ShejiI18n?.t?.("shows.empty") || "No shows yet.";
    list.append(empty);
  }

  window.ShejiI18n?.onChange?.(() => {
    list.innerHTML = "";
    shows.slice(0, 4).forEach((show) => {
      list.append(createShowsMenuItem(show));
    });

    if (list.children.length === 0) {
      const empty = document.createElement("p");
      empty.className = "shows-menu__empty";
      empty.textContent = window.ShejiI18n?.t?.("shows.empty") || "No shows yet.";
      list.append(empty);
    }
  });

  const setOpen = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    trigger?.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  trigger?.addEventListener("click", () => {
    setOpen(!menu.classList.contains("is-open"));
  });

  menu.addEventListener("pointerenter", () => {
    setOpen(true);
  });

  menu.addEventListener("pointerleave", () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setOpen(false);
    }
  });

  menu.addEventListener("focusin", () => {
    setOpen(true);
  });

  menu.addEventListener("focusout", (event) => {
    if (!event.relatedTarget || !menu.contains(event.relatedTarget)) {
      setOpen(false);
    }
  });
}

function createShowGalleryFigure({ image, alt, caption, className = "" }) {
  const figure = document.createElement("figure");
  figure.className = ["show-detail__gallery-item", className].filter(Boolean).join(" ");

  const photo = document.createElement("img");
  photo.src = image;
  photo.alt = alt;
  photo.loading = "lazy";

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = caption;

  figure.append(photo, figcaption);
  return figure;
}

function renderShowGallery(gallery, show, products) {
  gallery.innerHTML = "";

  if (show.heroImage) {
    gallery.append(
      createShowGalleryFigure({
        image: show.heroImage,
        alt: getShowField(show, "heroAlt") || show.heroAlt || show.title,
        caption: getShowField(show, "atmosphere") || show.atmosphere || show.title,
        className: "is-event-photo",
      }),
    );
  }

  (show.productIds || []).slice(0, 5).forEach((productId) => {
    const product = getProductById(productId, products);

    if (!product) {
      return;
    }

    gallery.append(
      createShowGalleryFigure({
        image: product.image,
        alt: window.ShejiI18n?.productField?.(product, "alt") || product.alt,
        caption: getProductDisplayName(product),
      }),
    );
  });
}

function renderShowProgram(programRoot, show) {
  programRoot.innerHTML = "";

  const header = document.createElement("div");
  header.className = "show-detail__program-header";

  const heading = document.createElement("h2");
  heading.textContent = window.ShejiI18n?.t?.("shows.program") || "Run of show";

  const time = document.createElement("span");
  time.textContent = show.time;

  header.append(heading, time);

  const list = document.createElement("ol");
  getShowArrayField(show, "program").forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.append(listItem);
  });

  programRoot.append(header, list);
}

function renderShowPieces(piecesRoot, show, products) {
  piecesRoot.innerHTML = "";

  (show.productIds || []).forEach((productId) => {
    const product = getProductById(productId, products);

    if (!product) {
      return;
    }

    const link = document.createElement("a");
    link.className = "show-detail__piece";
    link.href = getProductHref(product);
    link.setAttribute(
      "aria-label",
      window.ShejiI18n?.t?.("shows.openProduct", { name: getProductDisplayName(product) }) ||
        `Open ${getProductDisplayName(product)}`,
    );

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = window.ShejiI18n?.productField?.(product, "alt") || product.alt;
    image.loading = "lazy";

    const copy = document.createElement("span");
    copy.className = "show-detail__piece-copy";

    const name = document.createElement("span");
    name.className = "show-detail__piece-name";
    name.textContent = getProductDisplayName(product);

    const meta = document.createElement("span");
    meta.className = "show-detail__piece-meta";
    meta.textContent = [
      window.ShejiI18n?.colourLabel?.(product.colour) || product.colour,
      window.ShejiI18n?.formatPrice?.(product.price) || `${product.price}$`,
    ]
      .filter(Boolean)
      .join(" / ");

    copy.append(name, meta);
    link.append(image, copy);
    piecesRoot.append(link);
  });
}

function renderShowArchive(archiveRoot, activeShow, shows) {
  archiveRoot.innerHTML = "";

  shows
    .filter((show) => show.id !== activeShow.id)
    .forEach((show) => {
      const link = document.createElement("a");
      link.className = "show-detail__archive-card";
      link.href = getShowHref(show);

      const image = document.createElement("img");
      image.src = show.heroImage;
      image.alt = "";
      image.loading = "lazy";

      const copy = document.createElement("span");
      copy.className = "show-detail__archive-copy";

      const date = document.createElement("span");
      date.textContent = window.ShejiI18n?.formatDate?.(show.date) || show.date;

      const title = document.createElement("strong");
      title.textContent = show.title;

      copy.append(date, title);
      link.append(image, copy);
      archiveRoot.append(link);
    });
}

function initShowDetail(detail, shows = getShows()) {
  const show = getInitialShow(shows);
  const products = getProducts();

  if (!show) {
    return;
  }

  const badge = detail.querySelector("[data-show-badge]");
  const title = detail.querySelector("[data-show-title]");
  const date = detail.querySelector("[data-show-date]");
  const venue = detail.querySelector("[data-show-venue]");
  const city = detail.querySelector("[data-show-city]");
  const format = detail.querySelector("[data-show-format]");
  const summary = detail.querySelector("[data-show-summary]");
  const details = detail.querySelector("[data-show-details]");
  const hero = detail.querySelector("[data-show-hero]");
  const atmosphere = detail.querySelector("[data-show-atmosphere]");
  const collection = detail.querySelector("[data-show-collection]");
  const program = detail.querySelector("[data-show-program]");
  const pieces = detail.querySelector("[data-show-pieces]");
  const gallery = detail.querySelector("[data-show-gallery]");
  const archive = detail.querySelector("[data-show-archive]");

  const render = () => {
    document.title =
      window.ShejiI18n?.t?.("page.showTitleWithName", { name: show.title }) ||
      `${show.title} - Sheji Shows`;
    syncShowUrl(show.id);
    detail.dataset.showId = show.id;

    if (title) {
      title.textContent = show.title;
    }

    if (badge) {
      badge.textContent = getShowField(show, "badge");
    }

    if (date) {
      date.textContent = window.ShejiI18n?.formatDate?.(show.date) || show.date;
    }

    if (venue) {
      venue.textContent = show.venue;
    }

    if (city) {
      city.textContent = show.city;
    }

    if (format) {
      format.textContent = getShowField(show, "format");
    }

    if (summary) {
      summary.textContent = getShowField(show, "summary");
    }

    if (details) {
      details.innerHTML = "";
      (window.ShejiI18n?.showDetails?.(show) || show.details).forEach((paragraph) => {
        const item = document.createElement("p");
        item.textContent = paragraph;
        details.append(item);
      });
    }

    if (hero) {
      hero.src = show.heroImage || "";
      hero.alt = getShowField(show, "heroAlt") || show.heroAlt || show.title;
    }

    if (atmosphere) {
      atmosphere.textContent = getShowField(show, "atmosphere");
    }

    if (collection) {
      collection.textContent = getShowField(show, "collection");
    }

    if (program) {
      renderShowProgram(program, show);
    }

    if (pieces) {
      renderShowPieces(pieces, show, products);
    }

    if (gallery) {
      renderShowGallery(gallery, show, products);
    }

    if (archive) {
      renderShowArchive(archive, show, shows);
    }
  };

  window.ShejiI18n?.onChange?.(render);
  render();
}

window.ShejiShows = {
  initShowDetail,
  initShowsMenu,
};
