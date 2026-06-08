window.ShejiMotion.init();

document.querySelectorAll(".search-menu").forEach((searchMenu) => {
  window.ShejiSearch.initSearchMenu(searchMenu);
});

document.querySelectorAll(".home-collage").forEach((collage) => {
  window.ShejiCollage.initHomeCollage(collage);
});

document.querySelectorAll(".collection-menu").forEach((menu) => {
  const collections = window.SHEJI_COLLECTIONS || [];

  if (collections.length > 0 && menu.children.length === 0) {
    window.ShejiCollections.renderCollectionCards(menu, collections);
  }

  window.ShejiCollections.initCollectionExperience(menu);
});
