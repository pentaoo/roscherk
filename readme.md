# SHEJI

**DO NOT TAP THE DESIGNER.**

Sheji - статический fashion e-commerce сайт с характером арт-объекта: желтые collection cards, резкий черный typography, кислотные акценты, product collage, каталог, корзина, избранное, страницы показов и скрытые мини-игры внутри раскрытых карточек коллекций.

[Открыть GitHub Pages](https://pentaoo.github.io/roscherk/)

## Что Это

Sheji сделан как storefront без backend и без сборщика: обычные `HTML`, `CSS` и vanilla `JavaScript`, но с ощущением полноценного магазина.

Проект держится на трех идеях:

- **commerce first** - каталог, карточки товара, корзина, избранное и фильтры работают как магазин;
- **visual noise with rules** - яркий, странный, громкий интерфейс, но с устойчивыми токенами, состояниями и layout-ограничениями;
- **AI-readable codebase** - проект документирован так, чтобы следующая AI-сессия могла продолжить работу без угадывания.

## Витрина

- Hero carousel коллекций: `Fruity`, `Stone`, `Water`, `Bloom`, `Chrome`.
- Раскрываемые карточки коллекций с longread, media slider и CTA.
- Product collage справа от hero, связанный с активной коллекцией.
- Каталог с фильтрами, поиском, избранным и cart interactions.
- Product detail pages с рекомендациями.
- Cart page с сохранением состояния в `localStorage`.
- Favorites page.
- Shows pages и event data.
- EN/RU локализация без внешней библиотеки.
- Скрытые collection mini-games через designer face.

## Стек

```text
HTML
CSS custom properties
Vanilla JavaScript
localStorage
GitHub Pages
```

Без React, без Next, без сборщика, без runtime-зависимостей.

## Коллекции

Данные коллекций лежат в `data/collections.js`, товары - в `data/products.js`. Поверх них работает легкий слой нормализации в `js/merchandising.js`: коллекции получают стабильные `id`, продукты связываются через `collectionId`, а поиск использует подготовленный `searchableText`.

```text
Fruity  -> YI CORE
Stone   -> LEE JING
Water   -> XUAN BING
Bloom   -> MEI FANG
Chrome  -> NIKO RAY
```

## Скрытая Игра

В раскрытой карточке коллекции появляется designer face. Если быстро нажать на него несколько раз, открывается мини-игра коллекции.

Первые игры:

- `Label Bird` для Fruity;
- `Erosion Pong` для Stone;
- `Drip Runner` для Water;
- `Petal Tennis` для Bloom;
- `Mirror Lane` для Chrome.

Состояния мини-игр спроектированы как controlled state machine: `locked`, `arming`, `opening`, `active`, `paused`, `closing`, `ended`. Это помогает не ломать expanded card, focus management и cleanup listeners.

## Архитектура

Основные модули:

- `js/runtime.js` - общий runtime и события коллекций.
- `js/motion.js` - чтение motion-токенов из CSS.
- `js/merchandising.js` - нормализация данных.
- `js/collections.js` - collection carousel и expanded state.
- `js/collage.js` - product collage активной коллекции.
- `js/catalogue.js` - каталог, фильтры, поиск, избранное, cart actions.
- `js/product-detail.js` - product page.
- `js/cart.js` - cart page и totals.
- `js/favorites.js` - favorites page.
- `js/search-menu.js` - search overlay.
- `js/shows.js` - show/event pages.
- `js/i18n.js` - локализация.
- `js/collection-games.js` - shell мини-игр.
- `js/collection-game-modules.js` - конкретные игровые модули.

Связь между частями сайта идет через `ShejiRuntime` и события:

```text
sheji:collectionchange
sheji:collectionnavigate
sheji:collectionselect
```

## Motion Rules

В Sheji анимации не случайные. Длительности лежат в CSS custom properties, JavaScript читает их через `ShejiMotion`, а интерфейс учитывает `prefers-reduced-motion`.

Важный принцип: **анимировать одну стабильную оболочку**. Collection card не пересобирается на лету, а меняет геометрию одного владельца состояния. Так open/close остается обратимым и менее ломким.

## AI Context

В проекте есть отдельный слой документации `ai-context/`. Это не декоративная папка, а память проекта для будущих AI-сессий.

Что там лежит:

- `ai-context/project/overview.md` - суть проекта и ограничения.
- `ai-context/project/AGENTS_Sheji.md` - продуктовая и визуальная спецификация.
- `ai-context/design/tokens.md` - цвета, motion и визуальные правила.
- `ai-context/design/figma-notes.md` - Figma-заметки.
- `ai-context/code/file-map.md` - карта файлов.
- `ai-context/code/conventions.md` - кодовые соглашения.
- `ai-context/decisions/decision-log.md` - журнал решений.
- `ai-context/tasks/collection-mini-games.execPlan.md` - план мини-игр.
- `ai-context/qa/checklist.md` - QA-чеклист.

AI использовался не как единственный источник истины, а как рабочий инструмент: для design-to-code, архитектурной декомпозиции, локализации, sitemap-документации, UX-планирования, accessibility и контроля ограничений.

## Pages

Проект рассчитан на GitHub Pages: все пути относительные, сборка не нужна.

```bash
python3 -m http.server 4173
```

После запуска локально:

```text
http://localhost:4173/
```

## QA

Перед публикацией проверяются:

- desktop и mobile состояния главной страницы;
- раскрытие и закрытие collection cards;
- отсутствие видимых элементов мини-игры на закрытых карточках;
- каталог, фильтры и поиск;
- корзина и избранное;
- EN/RU переключение;
- keyboard focus и `aria-label`;
- reduced motion;
- отсутствие console errors.

## Ограничения

- Нет backend и реального checkout.
- Cart хранится в `localStorage`.
- Размер товара выбирается визуально, но не превращается в отдельную SKU-строку.
- Первые 5 коллекций участвуют в hero carousel и mini-game configs.
- Search не создает URL-query.

## Project Mood

Sheji не пытается выглядеть как спокойный luxury-магазин.

Он громкий, желтый, черный, зеленый, розовый, немного странный и при этом функциональный.

**All clothing. Check it. Do not tap the designer.**
