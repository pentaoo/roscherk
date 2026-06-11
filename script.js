window.ShejiRuntime.init();

function initCatalogueJumpLink() {
  const link = document.querySelector(".home-catalogue-link");
  const topTarget = document.getElementById("top");
  const catalogue = document.getElementById("catalogue");
  const productDetail = document.getElementById("product-detail");

  if (!link || !topTarget || !catalogue) {
    return;
  }

  let isTicking = false;

  const isProductDetailView = () =>
    productDetail &&
    window.scrollY >= productDetail.offsetTop - Math.max(120, window.innerHeight * 0.35);

  const syncLinkState = () => {
    link.classList.toggle("is-docked", window.scrollY > 16);
    document.body.classList.toggle("is-product-detail-view", Boolean(isProductDetailView()));
    isTicking = false;
  };

  const requestSync = () => {
    if (isTicking) {
      return;
    }

    isTicking = true;
    window.requestAnimationFrame(syncLinkState);
  };

  link.addEventListener("click", (event) => {
    event.preventDefault();

    catalogue.scrollIntoView({
      behavior: window.ShejiMotion.reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });

  document.querySelectorAll('.catalogue__back[href="#top"]').forEach((backLink) => {
    backLink.addEventListener("click", (event) => {
      if (backLink.closest(".catalogue")?.classList.contains("is-collection-filtered")) {
        return;
      }

      event.preventDefault();

      topTarget.scrollIntoView({
        behavior: window.ShejiMotion.reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  window.addEventListener("hashchange", requestSync);
  window.addEventListener("load", requestSync);
  window.setTimeout(requestSync, 0);
  syncLinkState();
}

initCatalogueJumpLink();

const commerce = window.ShejiCatalogue.createCatalogueCommerce();

document.querySelectorAll(".search-menu").forEach((searchMenu) => {
  window.ShejiSearch.initSearchMenu(searchMenu);
});

document.querySelectorAll("[data-shows-menu]").forEach((menu) => {
  window.ShejiShows?.initShowsMenu(menu);
});

document.querySelectorAll("[data-show-detail]").forEach((detail) => {
  window.ShejiShows?.initShowDetail(detail);
});

document.querySelectorAll(".home-collage").forEach((collage) => {
  window.ShejiCollage.initHomeCollage(collage);
});

document.querySelectorAll(".catalogue").forEach((catalogue) => {
  window.ShejiCatalogue.initCatalogue(catalogue, commerce);
});

document.querySelectorAll("[data-product-detail]").forEach((detail) => {
  window.ShejiProductDetail.initProductDetail(detail, commerce);
});

document.querySelectorAll(".collection-menu").forEach((menu) => {
  const collections = window.ShejiRuntime.getMerchandisingData().collections.slice(0, 5);

  if (collections.length > 0 && menu.children.length === 0) {
    window.ShejiCollections.renderCollectionCards(menu, collections);
  }

  window.ShejiCollections.initCollectionExperience(menu);
});
