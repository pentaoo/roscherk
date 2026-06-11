function getShows() {
  return window.SHEJI_SHOWS || [];
}

function getShowHref(show) {
  return `show.html?id=${encodeURIComponent(show.id)}`;
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
  link.setAttribute("aria-label", `Open ${show.title}`);

  const thumb = document.createElement("span");
  thumb.className = "shows-menu__thumb";
  thumb.setAttribute("aria-hidden", "true");

  const copy = document.createElement("span");
  copy.className = "shows-menu__event-copy";

  const date = document.createElement("span");
  date.className = "shows-menu__date";
  date.textContent = show.date;

  const title = document.createElement("span");
  title.className = "shows-menu__title";
  title.textContent = show.title;

  const meta = document.createElement("span");
  meta.className = "shows-menu__meta";
  meta.textContent = `${show.venue} / ${show.city}`;

  const arrow = document.createElement("img");
  arrow.className = "shows-menu__arrow";
  arrow.src = "source/icons/east.svg";
  arrow.alt = "";

  copy.append(date, title, meta);
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
    empty.textContent = "No shows yet.";
    list.append(empty);
  }

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

function renderShowPhotoGrid(gallery, count) {
  gallery.innerHTML = "";

  Array.from({ length: count }).forEach((_, index) => {
    const photo = document.createElement("span");
    photo.className = "show-detail__photo-placeholder";
    photo.setAttribute("aria-label", `Event photo placeholder ${index + 1}`);
    gallery.append(photo);
  });
}

function initShowDetail(detail, shows = getShows()) {
  const show = getInitialShow(shows);

  if (!show) {
    return;
  }

  const title = detail.querySelector("[data-show-title]");
  const date = detail.querySelector("[data-show-date]");
  const venue = detail.querySelector("[data-show-venue]");
  const city = detail.querySelector("[data-show-city]");
  const summary = detail.querySelector("[data-show-summary]");
  const details = detail.querySelector("[data-show-details]");
  const gallery = detail.querySelector("[data-show-gallery]");

  document.title = `${show.title} - Sheji Shows`;
  syncShowUrl(show.id);

  if (title) {
    title.textContent = show.title;
  }

  if (date) {
    date.textContent = show.date;
  }

  if (venue) {
    venue.textContent = show.venue;
  }

  if (city) {
    city.textContent = show.city;
  }

  if (summary) {
    summary.textContent = show.summary;
  }

  if (details) {
    details.innerHTML = "";
    show.details.forEach((paragraph) => {
      const item = document.createElement("p");
      item.textContent = paragraph;
      details.append(item);
    });
  }

  if (gallery) {
    renderShowPhotoGrid(gallery, show.photoCount || 4);
  }
}

window.ShejiShows = {
  initShowDetail,
  initShowsMenu,
};
