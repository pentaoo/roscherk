function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createCollectionRecord(collection, index) {
  const title = collection.title || `Collection ${index + 1}`;

  return {
    ...collection,
    id: collection.id || slugify(title) || `collection-${index + 1}`,
    title,
    index,
  };
}

function createProductRecord(product, index, collectionsByTitle) {
  const collectionTitle = product.collection || "";
  const collectionRecord = collectionsByTitle.get(collectionTitle.toLowerCase()) || null;
  const collectionId = collectionRecord?.id || slugify(collectionTitle);
  const searchableText = [
    product.name,
    collectionRecord?.title || collectionTitle,
    collectionRecord?.designer,
    product.colour,
    product.price,
    product.sale ? "sale" : "",
    ...(product.sizes || []),
  ]
    .join(" ")
    .toLowerCase();

  return {
    ...product,
    id: product.id || `product-${index + 1}`,
    collection: collectionRecord?.title || collectionTitle,
    collectionId,
    collectionRecord,
    searchableText,
    sizes: product.sizes || [],
  };
}

function createMerchandisingData({
  collections = window.SHEJI_COLLECTIONS || [],
  products = window.SHEJI_PRODUCTS || [],
} = {}) {
  const collectionRecords = collections.map(createCollectionRecord);
  const collectionsById = new Map(collectionRecords.map((collection) => [collection.id, collection]));
  const collectionsByTitle = new Map(
    collectionRecords.map((collection) => [collection.title.toLowerCase(), collection]),
  );
  const productRecords = products.map((product, index) =>
    createProductRecord(product, index, collectionsByTitle),
  );
  const productsById = new Map(productRecords.map((product) => [product.id, product]));

  return {
    collections: collectionRecords,
    products: productRecords,
    collectionsById,
    productsById,
    getCollectionByIndex(index) {
      return collectionRecords[index] || null;
    },
    getProduct(productId) {
      return productsById.get(productId) || null;
    },
  };
}

window.ShejiMerchandising = {
  createMerchandisingData,
  data: createMerchandisingData(),
};
