const SHEJI_EVENTS = {
  collectionChange: "sheji:collectionchange",
  collectionSelect: "sheji:collectionselect",
};

function getMerchandisingData() {
  if (!window.ShejiMerchandising?.data) {
    return {
      collections: window.SHEJI_COLLECTIONS || [],
      products: window.SHEJI_PRODUCTS || [],
      getCollectionByIndex(index) {
        return this.collections[index] || null;
      },
      getProduct(productId) {
        return this.products.find(({ id }) => id === productId) || null;
      },
    };
  }

  return window.ShejiMerchandising.data;
}

function emitCollectionChange(activeIndex) {
  const merchandising = getMerchandisingData();

  window.dispatchEvent(
    new CustomEvent(SHEJI_EVENTS.collectionChange, {
      detail: {
        activeIndex,
        collection: merchandising.getCollectionByIndex(activeIndex),
      },
    }),
  );
}

function emitCollectionSelect(activeIndex) {
  const merchandising = getMerchandisingData();

  window.dispatchEvent(
    new CustomEvent(SHEJI_EVENTS.collectionSelect, {
      detail: {
        activeIndex,
        collection: merchandising.getCollectionByIndex(activeIndex),
      },
    }),
  );
}

function onCollectionChange(callback) {
  const listener = (event) => callback(event.detail || {});
  window.addEventListener(SHEJI_EVENTS.collectionChange, listener);
  return () => {
    window.removeEventListener(SHEJI_EVENTS.collectionChange, listener);
  };
}

function onCollectionSelect(callback) {
  const listener = (event) => callback(event.detail || {});
  window.addEventListener(SHEJI_EVENTS.collectionSelect, listener);
  return () => {
    window.removeEventListener(SHEJI_EVENTS.collectionSelect, listener);
  };
}

function init() {
  window.ShejiMotion.init();
}

window.ShejiRuntime = {
  events: SHEJI_EVENTS,
  emitCollectionChange,
  emitCollectionSelect,
  getMerchandisingData,
  init,
  onCollectionChange,
  onCollectionSelect,
};
