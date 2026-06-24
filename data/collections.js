/** @type {ReadonlyArray<{
 * title: string;
 * designer: string;
 * description: string;
 * expandedCopy: string;
 * look?: ReadonlyArray<{
 * productId: string;
 * desktop: { x: number; y: number; w: number; z: number; rotate?: number };
 * mobile: { x: number; y: number; w: number; z: number; rotate?: number; from?: "left" | "right" };
 * parallax?: number;
 * }>;
 * }>} */
window.SHEJI_COLLECTIONS = [
  {
    title: "Fruity",
    designer: "YI CORE",
    description:
      "Socks inspired by market fruit labels, soft mesh panels, and bright summer packaging.",
    expandedCopy:
      "Fruity turns everyday socks into loud produce stickers: acidic green, ripe red, bruised purple, and tiny barcode-like details.",
    look: [
      {
        productId: "fruity-glasses-1",
        desktop: { x: 49, y: 17, w: 34, z: 5, rotate: -3 },
        mobile: { x: 50, y: 13, w: 46, z: 5, rotate: -2, from: "left" },
        parallax: 44,
      },
      {
        productId: "fruity-vest-1",
        desktop: { x: 48, y: 37, w: 40, z: 3, rotate: 2 },
        mobile: { x: 50, y: 39, w: 58, z: 3, rotate: 2, from: "right" },
        parallax: 30,
      },
      {
        productId: "fruity-pants-1",
        desktop: { x: 46, y: 71, w: 33, z: 1, rotate: -4 },
        mobile: { x: 48, y: 69, w: 46, z: 1, rotate: -4, from: "left" },
        parallax: 22,
      },
      {
        productId: "fruity-tote-1",
        desktop: { x: 68, y: 59, w: 34, z: 4, rotate: 9 },
        mobile: { x: 70, y: 58, w: 43, z: 4, rotate: 8, from: "right" },
        parallax: 56,
      },
      {
        productId: "fruity-belt-1",
        desktop: { x: 48, y: 50, w: 24, z: 6, rotate: -8 },
        mobile: { x: 50, y: 50, w: 34, z: 6, rotate: -8, from: "left" },
        parallax: 36,
      },
    ],
  },
  {
    title: "Stone",
    designer: "LEE JING",
    description:
      "The 石 collection treats clothing like architecture: weight, density, and form, as if each piece was cut from a single block of stone. Rough textures, rigid silhouettes, deep black, and burned white create an industrial-fashion mood where fabric becomes construction.",
    expandedCopy:
      "Each piece feels like an artifact: heavy seams, utilitarian details, cold graphics, and stripped-back minimalism. Stone is built around imperfect surfaces, material weight, and the feeling of a physical object.",
    look: [
      {
        productId: "fruity-glasses-1",
        desktop: { x: 47, y: 13, w: 36, z: 5, rotate: 0 },
        mobile: { x: 50, y: 13, w: 44, z: 5, rotate: 0, from: "right" },
        parallax: 44,
      },
      {
        productId: "water-puffer-1",
        desktop: { x: 46, y: 37, w: 46, z: 3, rotate: 0 },
        mobile: { x: 50, y: 39, w: 58, z: 3, rotate: 0, from: "left" },
        parallax: 28,
      },
      {
        productId: "stone-painter-pants-1",
        desktop: { x: 44, y: 71, w: 35, z: 1, rotate: -2 },
        mobile: { x: 48, y: 70, w: 43, z: 1, rotate: -2, from: "right" },
        parallax: 18,
      },
      {
        productId: "fruity-tote-1",
        desktop: { x: 64, y: 58, w: 37, z: 4, rotate: 7 },
        mobile: { x: 69, y: 58, w: 42, z: 4, rotate: 7, from: "left" },
        parallax: 54,
      },
    ],
  },
  {
    title: "Water",
    designer: "XUAN BING",
    description:
      "Transparent blues, wave stripes, and cool-touch yarns for lightweight movement.",
    expandedCopy:
      "Water uses fluid striping and soft blue contrast to make a breathable summer sock with an almost translucent rhythm.",
    look: [
      {
        productId: "water-glasses-1",
        desktop: { x: 48, y: 17, w: 32, z: 5, rotate: -4 },
        mobile: { x: 48, y: 14, w: 44, z: 5, rotate: -4, from: "left" },
        parallax: 42,
      },
      {
        productId: "water-aw00-pants-1",
        desktop: { x: 47, y: 68, w: 34, z: 1, rotate: 4 },
        mobile: { x: 48, y: 67, w: 46, z: 1, rotate: 4, from: "right" },
        parallax: 20,
      },
      {
        productId: "water-puffer-1",
        desktop: { x: 48, y: 39, w: 39, z: 3, rotate: -2 },
        mobile: { x: 50, y: 40, w: 57, z: 3, rotate: -2, from: "left" },
        parallax: 28,
      },
      {
        productId: "water-backpack-1",
        desktop: { x: 66, y: 58, w: 30, z: 4, rotate: -8 },
        mobile: { x: 69, y: 57, w: 40, z: 4, rotate: -8, from: "right" },
        parallax: 50,
      },
      {
        productId: "water-d-ring-belt-1",
        desktop: { x: 49, y: 52, w: 25, z: 6, rotate: 6 },
        mobile: { x: 51, y: 52, w: 35, z: 6, rotate: 6, from: "left" },
        parallax: 34,
      },
    ],
  },
  {
    title: "Bloom",
    designer: "KAI LUN",
    description:
      "Floral sports graphics, petal-like cuffs, and saturated color blocking.",
    expandedCopy:
      "Bloom mixes flower-shop graphics with technical ribbing and dense, springy cotton.",
    look: [
      {
        productId: "bloom-bucket-1",
        desktop: { x: 50, y: 17, w: 33, z: 5, rotate: 3 },
        mobile: { x: 51, y: 13, w: 45, z: 5, rotate: 3, from: "right" },
        parallax: 48,
      },
      {
        productId: "bloom-pink-tee-1",
        desktop: { x: 48, y: 39, w: 38, z: 3, rotate: -3 },
        mobile: { x: 50, y: 40, w: 58, z: 3, rotate: -3, from: "left" },
        parallax: 32,
      },
      {
        productId: "bloom-pants-1",
        desktop: { x: 47, y: 70, w: 32, z: 1, rotate: 2 },
        mobile: { x: 48, y: 68, w: 44, z: 1, rotate: 2, from: "right" },
        parallax: 20,
      },
      {
        productId: "bloom-jil-tote-1",
        desktop: { x: 67, y: 58, w: 31, z: 4, rotate: 10 },
        mobile: { x: 70, y: 58, w: 42, z: 4, rotate: 10, from: "left" },
        parallax: 54,
      },
      {
        productId: "bloom-braided-belt-1",
        desktop: { x: 48, y: 51, w: 27, z: 6, rotate: -4 },
        mobile: { x: 50, y: 51, w: 37, z: 6, rotate: -4, from: "right" },
        parallax: 34,
      },
    ],
  },
  {
    title: "Chrome",
    designer: "NOA VEGA",
    description:
      "Reflective silver marks, black grounding, and glossy racing references.",
    expandedCopy:
      "Chrome is sharp and fast, pairing reflective threads with deep cuffs and high-contrast labels.",
    look: [
      {
        productId: "chrome-glasses-1",
        desktop: { x: 49, y: 17, w: 34, z: 5, rotate: -1 },
        mobile: { x: 50, y: 13, w: 45, z: 5, rotate: -1, from: "left" },
        parallax: 44,
      },
      {
        productId: "chrome-bomber-1",
        desktop: { x: 48, y: 38, w: 41, z: 3, rotate: 1 },
        mobile: { x: 50, y: 40, w: 59, z: 3, rotate: 1, from: "right" },
        parallax: 30,
      },
      {
        productId: "chrome-folded-pants-1",
        desktop: { x: 47, y: 72, w: 33, z: 1, rotate: -3 },
        mobile: { x: 48, y: 69, w: 45, z: 1, rotate: -3, from: "left" },
        parallax: 20,
      },
      {
        productId: "chrome-frame-bag-1",
        desktop: { x: 66, y: 58, w: 32, z: 4, rotate: 6 },
        mobile: { x: 69, y: 58, w: 43, z: 4, rotate: 6, from: "right" },
        parallax: 52,
      },
      {
        productId: "chrome-junya-jacket-1",
        desktop: { x: 39, y: 43, w: 28, z: 2, rotate: -8 },
        mobile: { x: 35, y: 43, w: 40, z: 2, rotate: -8, from: "left" },
        parallax: 38,
      },
    ],
  },
  {
    title: "Salt",
    designer: "MIRA SEN",
    description:
      "White-on-white texture, tiny crystal dots, and washed seaside neutrals.",
    expandedCopy:
      "Salt keeps the palette pale but tactile, with granular stitches and subtle coastal lettering.",
  },
  {
    title: "Moss",
    designer: "ANA RHEE",
    description:
      "Damp greens, fuzzy terry details, and outdoor utility stripes.",
    expandedCopy:
      "Moss has soft brushed surfaces and hiking-sock structure, tuned for quiet green combinations.",
  },
  {
    title: "Ash",
    designer: "IKO MARS",
    description:
      "Smoky gradients, charcoal cuffs, and burnt-label typography.",
    expandedCopy:
      "Ash compresses black, gray, and dusty white into a stark everyday set.",
  },
  {
    title: "Glass",
    designer: "REN KO",
    description:
      "Frosted blues, clean transparent lines, and crisp geometric labels.",
    expandedCopy:
      "Glass feels cold and precise, with pale contrast panels and thin graphic marks.",
  },
  {
    title: "Pulse",
    designer: "YU NARI",
    description:
      "Neon beats, waveform bands, and compression-fit sport energy.",
    expandedCopy:
      "Pulse is the loudest set: elastic sport stripes, electric green hits, and fast logo placement.",
  },
];
