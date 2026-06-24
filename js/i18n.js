const SHEJI_I18N_CONFIG = {
  defaultLanguage: "en",
  supportedLanguages: ["en", "ru"],
  plannedLanguages: ["zh"],
  storageKey: "sheji-language",
  languageChangeEvent: "sheji:languagechange",
};

const SHEJI_TRANSLATIONS = {
  en: {
    languageSwitcher: {
      label: "Language",
      en: "English",
      ru: "Russian",
      zh: "Chinese language slot",
      zhTitle: "Chinese can be added later",
    },
    page: {
      homeTitle: "Sheji",
      productTitle: "Sheji Product",
      cartTitle: "Sheji Cart",
      favoritesTitle: "Sheji Favorites",
      showsTitle: "Sheji Shows",
      productTitleWithName: "{name} - Sheji",
      showTitleWithName: "{name} - Sheji Shows",
    },
    collection: {
      featuredAria: "Featured collection",
      menuAria: "Collections",
      lookAria: "Featured collection look",
      eyebrow: "collection",
      lore: "collection lore",
      madeBy: "drop made by",
      curatedBy: "drop curated by",
      back: "Go back",
      checkIt: "Take a look",
      readMore: "Read more",
      detailCaption: "{title} detail. {caption}",
      stylingCaption: "{title} styling reference. {caption}",
      fullDrop:
        "{description} The full drop keeps the same visual language across product shots, labels, trims, and the way each piece sits on the body.",
    },
    collectionGame: {
      shellAria: "Collection mini game",
      hint: "Do not tap the designer",
      hintShort: "DO NOT TAP THE DESIGNER",
      progress: "{count}/{total}",
      playAgain: "PLAY AGAIN",
      exit: "Exit",
      restart: "Restart",
      resultScore: "Score {score}",
      unavailable: "GAME MODULE MISSING",
      startedLive: "Mini game started.",
      unlockedLive: "Mini game unlocked.",
      overLive: "Mini game over.",
      fruity: {
        title: "Label Bird",
        unlockAria: "Unlock Fruity mini game",
        scoreLabel: "LOOK VALUE",
        controls: "Tap, click, or Space to flap. Avoid scanner tags.",
        gameOver: "ITEM MISLABELED",
        restart: "RE-STICK",
      },
      stone: {
        title: "Erosion Pong",
        unlockAria: "Unlock Stone mini game",
        scoreLabel: "EROSION INDEX",
        controls: "Move with arrows or pointer. Keep the slab alive.",
        gameOver: "SLAB DROPPED",
      },
      water: {
        title: "Drip Runner",
        unlockAria: "Unlock Water mini game",
        scoreLabel: "FLOW",
        controls: "Tap or Space to jump. Down ducks under heat.",
        gameOver: "DRIED OUT",
      },
      bloom: {
        title: "Petal Tennis",
        unlockAria: "Unlock Bloom mini game",
        scoreLabel: "RALLY BLOOM",
        controls: "Move with pointer or Up/Down. Return the pollen ball.",
        gameOver: "PETAL FAULT",
      },
      chrome: {
        title: "Mirror Lane",
        unlockAria: "Unlock Chrome mini game",
        scoreLabel: "NOA",
        controls: "Switch lanes with arrows or tap a lane. Collect shine.",
        gameOver: "REFLECTION BROKEN",
      },
    },
    collectionMedia: {
      sunglasses: {
        alt: "Sunglasses from the Sheji visual archive",
        caption: "Lookbook crop: polished black lenses against the yellow collection field.",
      },
      painterPants: {
        alt: "Paint-splattered pants from the Sheji visual archive",
        caption: "Material note: paint marks, heavy cotton, and a graphic product silhouette.",
      },
      wovenVest: {
        alt: "Blue woven vest from the Sheji visual archive",
        caption: "Surface study: woven blue texture with a compact outerwear shape.",
      },
      suedeOvershirt: {
        alt: "Brown suede overshirt from the Sheji visual archive",
        caption: "Styling frame: suede shell, oversized volume, and outdoor references.",
      },
      bucketHat: {
        alt: "Green bucket hat from the Sheji visual archive",
        caption: "Accessory close-up: saturated green, soft crown, and embroidered graphics.",
      },
      orangePuffer: {
        alt: "Orange puffer jacket from the Sheji visual archive",
        caption: "Drop reference: inflated orange panels and high-contrast street styling.",
      },
    },
    banner: {
      quiet: "Nothing in clothes is quiet",
    },
    nav: {
      home: "Home navigation",
      shows: "Shows",
      latestEvents: "latest events",
      search: "Search",
      searchClothing: "Search clothing",
      catalogue: "View all clothing",
      backToTop: "Back to top",
      allClothing: "All Clothing",
      catalogueControls: "Catalogue controls",
    },
    commerce: {
      navigation: "Shopping and favorites",
    },
    search: {
      homePrompt: "Lemme help you..",
      cataloguePrompt: "Find the weird piece..",
      shirtPlaceholder: "Shirt",
      jacketPlaceholder: "Jacket",
      suggestionHelp: "Lemme help you..",
      stone: "stone",
      sale: "sale",
    },
    filters: {
      size: "Size",
      colour: "Colour",
      price: "Price",
      priceUnder100: "Under 100$",
      price100To300: "100$ - 300$",
      priceOver300: "Over 300$",
    },
    cart: {
      label: "Cart",
      title: "Cart",
      eyebrow: "sheji bag",
      open: "Open cart, {count} {items}",
      itemOne: "item",
      itemFew: "items",
      itemMany: "items",
      itemOther: "items",
      empty: "Cart is empty.",
      findClothes: "Find clothes",
      clear: "Clear cart",
      total: "Total",
      remove: "Remove",
      removeOne: "Remove one {name}",
      addOne: "Add one {name}",
      popoverLine: "{name} x {quantity}",
      itemMeta: "{colour} / {sizes}",
    },
    favorites: {
      label: "Favorites",
      title: "Favorites",
      eyebrow: "liked pieces",
      open: "Open favorites, {count} {items}",
      itemOne: "item",
      itemFew: "items",
      itemMany: "items",
      empty: "No favorites yet.",
      findClothes: "Find clothes",
      remove: "Remove from favorites",
      removeNamed: "Remove {name} from favorites",
    },
    product: {
      detail: "Product detail",
      previous: "Previous product",
      next: "Next product",
      size: "Size",
      addToCart: "Add to cart",
      addNamedToCart: "Add {name} to cart",
      addNamedToCartForPrice: "Add {name} to cart for {price}",
      favorite: "Favorite {name}",
      viewDetail: "View {name} product detail",
      view: "View {name}",
      recommendations: "Recommended products",
      saleRail: "{badge} SALE! SALE! SALE!",
      emptyFilter: "No clothes survived that filter.",
      open: "Open product",
      openForPrice: "Open {name} for {price}",
    },
    shows: {
      latest: "latest show",
      title: "Shows",
      date: "Date",
      venue: "Venue",
      city: "City",
      gallery: "Event photos",
      time: "Time",
      format: "Format",
      collection: "Collection",
      atmosphere: "Room note",
      program: "Run of show",
      shownPieces: "Shown pieces",
      archive: "More shows",
      archiveEyebrow: "archive rail",
      heroPhoto: "Event hero photo",
      open: "Open {title}",
      openProduct: "Open {name}",
      empty: "No shows yet.",
      photoPlaceholder: "Event photo placeholder {number}",
      meta: "{venue} / {city}",
    },
    options: {
      colour: {
        black: "black",
        blue: "blue",
        brown: "brown",
        green: "green",
        olive: "olive",
        orange: "orange",
        pink: "pink",
        white: "white",
      },
    },
  },
  ru: {
    languageSwitcher: {
      label: "Язык",
      en: "Английский",
      ru: "Русский",
      zh: "Место под китайский язык",
      zhTitle: "Китайский можно добавить позже",
    },
    page: {
      homeTitle: "Sheji",
      productTitle: "Sheji: товар",
      cartTitle: "Sheji: корзина",
      favoritesTitle: "Sheji: избранное",
      showsTitle: "Sheji: показы",
      productTitleWithName: "{name} - Sheji",
      showTitleWithName: "{name} - показы Sheji",
    },
    collection: {
      featuredAria: "Избранная коллекция",
      menuAria: "Коллекции",
      lookAria: "Образ избранной коллекции",
      eyebrow: "коллекция",
      lore: "легенда коллекции",
      madeBy: "дроп от",
      curatedBy: "дроп собран",
      back: "Назад",
      checkIt: "Смотреть",
      readMore: "Подробнее",
      detailCaption: "{title}: деталь. {caption}",
      stylingCaption: "{title}: стайлинг. {caption}",
      fullDrop:
        "{description} Весь дроп удерживает один визуальный язык: в съемке вещей, ярлыках, отделке и в том, как каждая вещь сидит на теле.",
    },
    collectionGame: {
      shellAria: "Мини-игра коллекции",
      hint: "Не трогай дизайнера",
      hintShort: "НЕ ТРОГАЙ ДИЗАЙНЕРА",
      progress: "{count}/{total}",
      playAgain: "ИГРАТЬ ЕЩЕ",
      exit: "Выйти",
      restart: "Заново",
      resultScore: "Счет {score}",
      unavailable: "ИГРОВОЙ МОДУЛЬ ПОТЕРЯН",
      startedLive: "Мини-игра запущена.",
      unlockedLive: "Мини-игра открыта.",
      overLive: "Мини-игра закончена.",
      fruity: {
        title: "Label Bird",
        unlockAria: "Открыть мини-игру Fruity",
        scoreLabel: "LOOK VALUE",
        controls: "Тап, клик или Space: взлет. Уходи от сканеров.",
        gameOver: "ITEM MISLABELED",
        restart: "RE-STICK",
      },
      stone: {
        title: "Erosion Pong",
        unlockAria: "Открыть мини-игру Stone",
        scoreLabel: "EROSION INDEX",
        controls: "Стрелки или pointer двигают плиту. Не урони сляб.",
        gameOver: "SLAB DROPPED",
      },
      water: {
        title: "Drip Runner",
        unlockAria: "Открыть мини-игру Water",
        scoreLabel: "FLOW",
        controls: "Тап или Space: прыжок. Вниз: пригнуться.",
        gameOver: "DRIED OUT",
      },
      bloom: {
        title: "Petal Tennis",
        unlockAria: "Открыть мини-игру Bloom",
        scoreLabel: "RALLY BLOOM",
        controls: "Pointer или Up/Down двигают лепесток. Отбивай пыльцу.",
        gameOver: "PETAL FAULT",
      },
      chrome: {
        title: "Mirror Lane",
        unlockAria: "Открыть мини-игру Chrome",
        scoreLabel: "NOA",
        controls: "Стрелки или тап по полосе. Собирай блеск.",
        gameOver: "REFLECTION BROKEN",
      },
    },
    collectionMedia: {
      sunglasses: {
        alt: "Солнцезащитные очки из визуального архива Sheji",
        caption: "Кадр лукбука: полированные черные линзы на желтом поле коллекции.",
      },
      painterPants: {
        alt: "Брюки с пятнами краски из визуального архива Sheji",
        caption: "Заметка о материале: следы краски, плотный хлопок и графичный силуэт вещи.",
      },
      wovenVest: {
        alt: "Синий тканый жилет из визуального архива Sheji",
        caption: "Исследование поверхности: синяя тканая фактура и компактная форма верхнего слоя.",
      },
      suedeOvershirt: {
        alt: "Коричневая замшевая овершерт-куртка из визуального архива Sheji",
        caption: "Кадр стайлинга: замшевая оболочка, увеличенный объем и outdoor-референсы.",
      },
      bucketHat: {
        alt: "Зеленая панама из визуального архива Sheji",
        caption: "Крупный план аксессуара: насыщенный зеленый, мягкая тулья и вышитая графика.",
      },
      orangePuffer: {
        alt: "Оранжевая пуховая куртка из визуального архива Sheji",
        caption: "Референс дропа: объемные оранжевые панели и контрастный street-стайлинг.",
      },
    },
    banner: {
      quiet: "В одежде нет тишины",
    },
    nav: {
      home: "Навигация главной страницы",
      shows: "Показы",
      latestEvents: "последние события",
      search: "Поиск",
      searchClothing: "Поиск одежды",
      catalogue: "Смотреть всю одежду",
      backToTop: "Вернуться наверх",
      allClothing: "Вся одежда",
      catalogueControls: "Управление каталогом",
    },
    commerce: {
      navigation: "Корзина и избранное",
    },
    search: {
      homePrompt: "Помогу найти вещь..",
      cataloguePrompt: "Найди странную вещь..",
      shirtPlaceholder: "Рубашка",
      jacketPlaceholder: "Куртка",
      suggestionHelp: "Помогу найти вещь..",
      stone: "stone",
      sale: "sale",
    },
    filters: {
      size: "Размер",
      colour: "Цвет",
      price: "Цена",
      priceUnder100: "До 100 $",
      price100To300: "100 $ - 300 $",
      priceOver300: "От 300 $",
    },
    cart: {
      label: "Корзина",
      title: "Корзина",
      eyebrow: "сумка sheji",
      open: "Открыть корзину, {count} {items}",
      itemOne: "товар",
      itemFew: "товара",
      itemMany: "товаров",
      empty: "Корзина пуста.",
      findClothes: "Найти одежду",
      clear: "Очистить",
      total: "Итого",
      remove: "Убрать",
      removeOne: "Убрать один {name}",
      addOne: "Добавить один {name}",
      popoverLine: "{name} x {quantity}",
      itemMeta: "{colour} / {sizes}",
    },
    favorites: {
      label: "Избранное",
      title: "Избранное",
      eyebrow: "понравившиеся вещи",
      open: "Открыть избранное, {count} {items}",
      itemOne: "товар",
      itemFew: "товара",
      itemMany: "товаров",
      empty: "Избранного пока нет.",
      findClothes: "Найти одежду",
      remove: "Убрать из избранного",
      removeNamed: "Убрать {name} из избранного",
    },
    product: {
      detail: "Детали товара",
      previous: "Предыдущий товар",
      next: "Следующий товар",
      size: "Размер",
      addToCart: "В корзину",
      addNamedToCart: "Добавить {name} в корзину",
      addNamedToCartForPrice: "Добавить {name} в корзину за {price}",
      favorite: "В избранное: {name}",
      viewDetail: "Смотреть детали товара {name}",
      view: "Смотреть {name}",
      recommendations: "Рекомендованные товары",
      saleRail: "{badge} SALE! SALE! SALE!",
      emptyFilter: "Под этот фильтр ничего не выжило.",
      open: "Открыть товар",
      openForPrice: "Открыть {name} за {price}",
    },
    shows: {
      latest: "последний показ",
      title: "Показы",
      date: "Дата",
      venue: "Место",
      city: "Город",
      gallery: "Фотографии события",
      time: "Время",
      format: "Формат",
      collection: "Коллекция",
      atmosphere: "Заметка зала",
      program: "Ход показа",
      shownPieces: "Вещи в показе",
      archive: "Еще показы",
      archiveEyebrow: "архивная рейка",
      heroPhoto: "Главное фото события",
      open: "Открыть {title}",
      openProduct: "Открыть {name}",
      empty: "Показов пока нет.",
      photoPlaceholder: "Заглушка фотографии события {number}",
      meta: "{venue} / {city}",
    },
    options: {
      colour: {
        black: "черный",
        blue: "синий",
        brown: "коричневый",
        green: "зеленый",
        olive: "оливковый",
        orange: "оранжевый",
        pink: "розовый",
        white: "белый",
      },
    },
    content: {
      collections: {
        fruity: {
          title: "Фруктовый",
          description:
            "Носки, вдохновленные рыночными фруктовыми наклейками, мягкими сетчатыми вставками и яркой летней упаковкой.",
          expandedCopy:
            "Fruity превращает повседневные носки в громкие продуктовые стикеры: кислотный зеленый, спелый красный, помятый фиолетовый и мелкие детали, похожие на штрихкоды.",
        },
        stone: {
          title: "Камень",
          description:
            "Коллекция Stone — это одежда, собранная как архитектурный объект: вес, плотность и форма, будто вещи вырезаны из цельного каменного блока.",
          expandedCopy:
            "Каждый предмет выглядит как артефакт: массивные швы, утилитарные детали, холодная графичность и минимализм без декоративности.",
        },
        water: {
          title: "Вода",
          description:
            "Прозрачные синие оттенки, волнистые полосы и прохладная пряжа для легкого движения.",
          expandedCopy:
            "Water использует текучую полоску и мягкий синий контраст, чтобы создать дышащую летнюю вещь с почти прозрачным ритмом.",
        },
        bloom: {
          title: "Цветение",
          description:
            "Цветочная спортивная графика, манжеты как лепестки и насыщенные цветовые блоки.",
          expandedCopy:
            "Bloom смешивает графику цветочного магазина с техническим рубчиком и плотным пружинящим хлопком.",
        },
        chrome: {
          title: "Хром",
          description:
            "Серебристые отражающие метки, черная база и глянцевые гоночные референсы.",
          expandedCopy:
            "Chrome звучит резко и быстро: отражающие нити, глубокие манжеты и контрастные ярлыки.",
        },
        salt: {
          title: "Соль",
          description:
            "Белое на белом, кристаллические точки и выстиранные прибрежные нейтрали.",
          expandedCopy:
            "Salt остается бледной, но тактильной: зернистые стежки и тонкая прибрежная типографика.",
        },
        moss: {
          title: "Мох",
          description:
            "Влажные зеленые оттенки, пушистая махра и утилитарные outdoor-полосы.",
          expandedCopy:
            "Moss держится на мягких ворсистых поверхностях и hiking-sock структуре для тихих зеленых сочетаний.",
        },
        ash: {
          title: "Пепел",
          description:
            "Дымчатые градиенты, угольные манжеты и типографика выжженного ярлыка.",
          expandedCopy:
            "Ash сжимает черный, серый и пыльно-белый в резкий повседневный набор.",
        },
        glass: {
          title: "Стекло",
          description:
            "Матовые синие оттенки, чистые прозрачные линии и четкие геометрические ярлыки.",
          expandedCopy:
            "Glass ощущается холодной и точной: бледные контрастные панели и тонкие графические метки.",
        },
        pulse: {
          title: "Пульс",
          description:
            "Неоновые удары, полосы как звуковая волна и энергия спортивной компрессии.",
          expandedCopy:
            "Pulse — самый громкий набор: эластичные спортивные полосы, электрические зеленые акценты и быстрый логотип.",
        },
      },
      products: {
        "fruity-glasses-1": { alt: "Черные солнцезащитные очки с зелеными вкраплениями" },
        "fruity-vest-1": { alt: "Синий тканый жилет" },
        "fruity-pants-1": { alt: "Сложенные черные брюки" },
        "fruity-tote-1": { alt: "Большая зеленая сумка-тоут с белой надписью" },
        "fruity-belt-1": { alt: "Черный ремень с D-кольцом" },
        "stone-bucket-1": { alt: "Зеленая панама с вышитой графикой голов" },
        "stone-overshirt-1": { alt: "Коричневая замшевая овершерт-куртка" },
        "stone-painter-pants-1": { alt: "Оливковые painter pants с разноцветными следами краски" },
        "stone-frame-bag-1": { alt: "Зеленая структурная frame bag" },
        "stone-braided-belt-1": { alt: "Коричневый плетеный кожаный ремень" },
        "water-glasses-1": { alt: "Черные солнцезащитные очки с зелеными вкраплениями" },
        "water-puffer-1": { alt: "Оранжевая пуховая куртка" },
        "water-aw00-pants-1": { alt: "Темные брюки с узором" },
        "water-backpack-1": { alt: "Черный технический рюкзак" },
        "water-d-ring-belt-1": { alt: "Черный ремень с D-кольцом" },
        "bloom-pink-tee-1": { alt: "Розовая графичная футболка с принтом карты мира" },
        "bloom-badknees-top-1": { alt: "Графичный топ Bad Knees" },
        "bloom-pants-1": { alt: "Оливковые painter pants с разноцветными следами краски" },
        "bloom-jil-tote-1": { alt: "Светлая сумка-тоут shopper" },
        "bloom-bucket-1": { alt: "Зеленая панама с вышитой графикой голов" },
        "bloom-braided-belt-1": { alt: "Коричневый плетеный кожаный ремень" },
        "chrome-glasses-1": { alt: "Черные солнцезащитные очки с зелеными вкраплениями" },
        "chrome-bomber-1": { alt: "Черный переработанный бомбер" },
        "chrome-folded-pants-1": { alt: "Сложенные черные брюки" },
        "chrome-junya-jacket-1": { alt: "Графичная куртка Supreme Junya Watanabe" },
        "chrome-frame-bag-1": { alt: "Зеленая структурная frame bag" },
        "salt-scorched-top-1": { alt: "Графичный топ Scorched" },
        "moss-dreaded-path-top-1": { alt: "Зеленый графичный топ" },
        "ash-supreme-coat-1": { alt: "Длинное пальто Supreme Junya Watanabe" },
        "glass-palace-top-1": { alt: "Топ Jean-Charles de Castelbajac Palace capsule" },
        "pulse-telfar-top-1": { alt: "Графичный топ Telfar" },
      },
      shows: {
        "stone-room-pop-up": {
          badge: "зал 01",
          collection: "Камень",
          format: "Поп-ап примерочная",
          atmosphere: "жесткий свет / пронумерованные рейлы / бетонные блоки",
          heroAlt: "Индустриальная студия с бетонными блоками и рейлами одежды для показа Stone",
          summary:
            "Сырая примерочная для коллекции Stone: блочные рейлы, жесткий свет и архивные вещи только на одну ночь.",
          details: [
            "Гости проходили через три комнаты: первые образы, измененные сэмплы и финальный рейл пронумерованных вещей Stone.",
            "Событие строилось вокруг веса, поверхности и тихих конструктивных деталей, а не вокруг дистанции подиума.",
          ],
          program: [
            "Проход по первому рейлу",
            "Примерка измененных сэмплов",
            "Релиз пронумерованного архива Stone",
          ],
        },
        "garage-market-fit": {
          badge: "маркет 02",
          collection: "Смешанный сток",
          format: "Ремонтный маркет-показ",
          atmosphere: "гаражный флуоресцент / рабочие столы / пересобранные образы",
          heroAlt: "Модный маркет в парковочном гараже с рейлами, рабочими столами и стилистами за пересборкой образов",
          summary:
            "Поздний market show, где SHEJI смешала актуальные вещи со старым стоком, ремонтными сэмплами и тестовой графикой.",
          details: [
            "Рейлы с одеждой стояли рядом с рабочими столами, чтобы посетители могли трогать ткани, ярлыки и отделку.",
            "Каждый образ пересобирался прямо по ходу ночи, поэтому показ ощущался скорее мастерской, чем фиксированной презентацией.",
          ],
          program: [
            "Открытый рейл market edit",
            "Стайлинг ремонтных сэмплов",
            "Пересборка образов на одном столе",
          ],
        },
        "fruity-label-session": {
          badge: "ярлык 03",
          collection: "Фруктовый",
          format: "Графическая лаборатория",
          atmosphere: "стикеры / носки / открытые боксы / flash color",
          heroAlt: "Яркий рабочий стол с носками и ярлыками для сессии Fruity",
          summary:
            "Компактная сессия про графику Fruity: яркие ярлыки, эксперименты с носками и быстрые стайлинг-тесты.",
          details: [
            "Фокус был на мелких деталях продукта: манжетах, стикерной графике и высоконасыщенных акцентах.",
            "Посетители собирали образы из открытых боксов перед каждым мини-показом.",
          ],
          program: [
            "Выбор листов с ярлыками",
            "Стайлинг из бокса с носками",
            "Мини-презентации каждые 30 минут",
          ],
        },
        "chrome-night-line": {
          badge: "ночь 04",
          collection: "Хром",
          format: "Ночное превью",
          atmosphere: "движущийся свет / отражающие полосы / черный пол",
          heroAlt: "Ночной шоурум под эстакадой с отражающей одеждой и световыми полосами",
          summary:
            "Ночной превью-показ Chrome с отражающими метками, черной базой и быстрым шоурумным темпом.",
          details: [
            "Вместо фиксированной сцены использовался проходящий свет, поэтому отражающие поверхности менялись вместе с движением людей.",
            "Показали только прототипный стайлинг, оставив финальные правки продукта открытыми для следующих дропов.",
          ],
          program: [
            "Reflective check-in",
            "Превью в движущемся свете",
            "Проход прототипного стайлинга",
          ],
        },
      },
    },
  },
};

let currentLanguage = SHEJI_I18N_CONFIG.defaultLanguage;
let currentSource = "default";

function getPathValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function interpolate(value, params = {}) {
  return String(value).replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? params[key] : match,
  );
}

function normalizeLanguage(language) {
  const baseLanguage = String(language || "").trim().toLowerCase().split("-")[0];
  return SHEJI_I18N_CONFIG.supportedLanguages.includes(baseLanguage) ? baseLanguage : null;
}

function getLanguageFromUrl(pathname = window.location.pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map(normalizeLanguage).find(Boolean) || null;
}

function getStoredLanguage() {
  try {
    return normalizeLanguage(window.localStorage.getItem(SHEJI_I18N_CONFIG.storageKey));
  } catch {
    return null;
  }
}

function getBrowserLanguage() {
  const languages = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];

  return languages.map(normalizeLanguage).find(Boolean) || null;
}

function detectLanguage() {
  const urlLanguage = getLanguageFromUrl();
  if (urlLanguage) {
    return { language: urlLanguage, source: "url" };
  }

  const storedLanguage = getStoredLanguage();
  if (storedLanguage) {
    return { language: storedLanguage, source: "stored" };
  }

  const browserLanguage = getBrowserLanguage();
  if (browserLanguage) {
    return { language: browserLanguage, source: "browser" };
  }

  return { language: SHEJI_I18N_CONFIG.defaultLanguage, source: "default" };
}

function getPluralKey(count, oneKey, fewKey, manyKey) {
  if (currentLanguage !== "ru") {
    return count === 1 ? oneKey : manyKey;
  }

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return oneKey;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return fewKey || manyKey;
  }

  return manyKey;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function t(key, params = {}, fallback = key) {
  const value =
    getPathValue(SHEJI_TRANSLATIONS[currentLanguage], key) ??
    getPathValue(SHEJI_TRANSLATIONS[SHEJI_I18N_CONFIG.defaultLanguage], key) ??
    fallback;

  return interpolate(value, params);
}

function contentValue(scope, id, field, fallback) {
  return (
    getPathValue(SHEJI_TRANSLATIONS[currentLanguage], `content.${scope}.${id}.${field}`) ??
    getPathValue(SHEJI_TRANSLATIONS[SHEJI_I18N_CONFIG.defaultLanguage], `content.${scope}.${id}.${field}`) ??
    fallback
  );
}

function getCollectionId(collectionOrTitle) {
  if (typeof collectionOrTitle === "string") {
    return slugify(collectionOrTitle);
  }

  return collectionOrTitle?.id || slugify(collectionOrTitle?.title);
}

function collectionField(collection, field) {
  return contentValue("collections", getCollectionId(collection), field, collection?.[field] || "");
}

function collectionTitle(collectionOrTitle) {
  const fallback = typeof collectionOrTitle === "string" ? collectionOrTitle : collectionOrTitle?.title;
  return contentValue("collections", getCollectionId(collectionOrTitle), "title", fallback || "");
}

function productField(product, field) {
  return contentValue("products", product?.id, field, product?.[field] || "");
}

function showField(show, field) {
  return contentValue("shows", show?.id, field, show?.[field] || "");
}

function showDetails(show) {
  return contentValue("shows", show?.id, "details", show?.details || []);
}

function colourLabel(colour) {
  return t(`options.colour.${colour}`, {}, colour);
}

function productDisplayName(product) {
  const collection = product?.collectionRecord
    ? collectionTitle(product.collectionRecord)
    : collectionTitle(product?.collection);

  return [collection, product?.name].filter(Boolean).join(" ");
}

function formatPrice(price) {
  return currentLanguage === "ru" ? `${price} $` : `${price}$`;
}

function formatCartItemCount(count) {
  const key = getPluralKey(count, "cart.itemOne", "cart.itemFew", "cart.itemMany");
  return `${count} ${t(key)}`;
}

function formatFavoriteItemCount(count) {
  const key = getPluralKey(count, "favorites.itemOne", "favorites.itemFew", "favorites.itemMany");
  return `${count} ${t(key)}`;
}

function formatDate(value) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(currentLanguage === "ru" ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getProductSearchText(product) {
  return [
    product?.searchableText,
    productDisplayName(product),
    productField(product, "alt"),
    colourLabel(product?.colour),
    product?.sale ? t("search.sale") : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function updateLanguageSwitcher(root = document) {
  root.querySelectorAll("[data-language-switcher]").forEach((switcher) => {
    switcher.setAttribute("aria-label", t("languageSwitcher.label"));
  });

  root.querySelectorAll("[data-language-option]").forEach((option) => {
    const language = option.dataset.languageOption;
    const isActive = language === currentLanguage;
    const isSupported = SHEJI_I18N_CONFIG.supportedLanguages.includes(language);

    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-pressed", isActive ? "true" : "false");
    option.disabled = !isSupported;

    if (!isSupported) {
      option.setAttribute("aria-disabled", "true");
      option.title = t("languageSwitcher.zhTitle");
    } else {
      option.removeAttribute("aria-disabled");
      option.removeAttribute("title");
    }
  });
}

function applyTranslations(root = document) {
  document.documentElement.lang = currentLanguage;

  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n, {}, node.textContent);
  });

  [
    ["placeholder", "i18nPlaceholder"],
    ["alt", "i18nAlt"],
    ["title", "i18nTitle"],
    ["aria-label", "i18nAriaLabel"],
  ].forEach(([attribute, datasetKey]) => {
    root.querySelectorAll(`[data-${datasetKey.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}]`).forEach((node) => {
      node.setAttribute(attribute, t(node.dataset[datasetKey], {}, node.getAttribute(attribute) || ""));
    });
  });

  updateLanguageSwitcher(root);
}

function persistLanguage(language) {
  try {
    window.localStorage.setItem(SHEJI_I18N_CONFIG.storageKey, language);
  } catch {
    // Language still changes for the current page if storage is blocked.
  }
}

function setLanguage(language, { persist = false, source = "manual" } = {}) {
  const normalizedLanguage = normalizeLanguage(language) || SHEJI_I18N_CONFIG.defaultLanguage;

  if (persist) {
    persistLanguage(normalizedLanguage);
  }

  currentLanguage = normalizedLanguage;
  currentSource = source;
  applyTranslations();

  window.dispatchEvent(
    new CustomEvent(SHEJI_I18N_CONFIG.languageChangeEvent, {
      detail: { language: currentLanguage, source: currentSource },
    }),
  );
}

function initLanguageSwitcher(root = document) {
  root.querySelectorAll("[data-language-option]").forEach((option) => {
    option.addEventListener("click", () => {
      if (option.disabled) {
        return;
      }

      setLanguage(option.dataset.languageOption, { persist: true, source: "manual" });
    });
  });
}

function onChange(callback) {
  const listener = (event) => callback(event.detail || {});
  window.addEventListener(SHEJI_I18N_CONFIG.languageChangeEvent, listener);
  return () => {
    window.removeEventListener(SHEJI_I18N_CONFIG.languageChangeEvent, listener);
  };
}

function init() {
  const detected = detectLanguage();
  currentLanguage = detected.language;
  currentSource = detected.source;
  initLanguageSwitcher();
  applyTranslations();
}

window.ShejiI18n = {
  applyTranslations,
  collectionField,
  collectionTitle,
  config: SHEJI_I18N_CONFIG,
  detectLanguage,
  formatCartItemCount,
  formatFavoriteItemCount,
  formatDate,
  formatPrice,
  getBrowserLanguage,
  getCurrentLanguage: () => currentLanguage,
  getCurrentSource: () => currentSource,
  getLanguageFromUrl,
  getProductSearchText,
  init,
  onChange,
  productDisplayName,
  productField,
  setLanguage,
  showDetails,
  showField,
  t,
  translateColour: colourLabel,
  translations: SHEJI_TRANSLATIONS,
};

window.ShejiI18n.init();
