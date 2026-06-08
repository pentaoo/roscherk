function initSearchMenu(searchMenu) {
  const surface = searchMenu.querySelector(".search-menu__surface");
  const input = searchMenu.querySelector(".search-menu__input");
  let closeTimer = null;

  const searchDuration = () => window.ShejiMotion.durationMs("--duration-search");
  const focusDelay = () => (window.ShejiMotion.reducedMotion ? 0 : 80);

  const openSearch = () => {
    window.clearTimeout(closeTimer);
    searchMenu.classList.remove("is-closing");
    searchMenu.classList.add("is-open");
    surface?.setAttribute("aria-expanded", "true");
    input?.removeAttribute("tabindex");

    window.setTimeout(() => {
      input?.focus();
    }, focusDelay());
  };

  const closeSearch = ({ restoreFocus = false } = {}) => {
    if (!searchMenu.classList.contains("is-open")) {
      return;
    }

    window.clearTimeout(closeTimer);
    searchMenu.classList.remove("is-open");
    searchMenu.classList.add("is-closing");
    surface?.setAttribute("aria-expanded", "false");
    input?.setAttribute("tabindex", "-1");
    input?.blur();

    closeTimer = window.setTimeout(() => {
      searchMenu.classList.remove("is-closing");

      if (restoreFocus) {
        surface?.focus();
      }
    }, searchDuration());
  };

  surface?.addEventListener("click", (event) => {
    if (searchMenu.classList.contains("is-open")) {
      return;
    }

    event.preventDefault();
    openSearch();
  });

  surface?.addEventListener("mouseleave", () => {
    if (searchMenu.classList.contains("is-open")) {
      closeSearch();
    }
  });

  surface?.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }

    if (event.key === "Escape") {
      closeSearch({ restoreFocus: true });
    }
  });
}

window.ShejiSearch = {
  initSearchMenu,
};
