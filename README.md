# LUMEA

Storefront-вітрина косметичного бренду LUMEA: hero-секція та інтерактивний
блок «How it works» (4 кроки догляду за шкірою) з панеллю товарів, що
підвантажує дані з Strapi. Контент (товари, категорії, мітки, повідомлення
announcement bar) керується з Strapi CMS; ціни, знижки й залишки рахуються
на фронті за єдиною моделлю варіацій. Сторінка рендериться на кожен запит
(SSR), тому дані завжди актуальні.

## Що реалізовано

- Адаптивний Header з навігацією, hover-станами та announcement bar
  (дані з CMS, ротація повідомлень).
- Hero-секція за макетом Figma (адаптивний layout, зображення, промо-плашка).
- Секція «How it works»: 4 картки кроків зі scroll-накладанням
  (sticky-стек через `position: sticky` + `IntersectionObserver`, без
  scroll-джанку), панель товарів праворуч (десктоп) і overlay-шторка знизу
  (мобільний).
- Панель товарів: категорії-таби, картки товарів, вибір варіацій
  (Size / Skin type / інше — назви не захардкоджені, приходять з CMS),
  вкладені варіації (ємності залежать від обраного типу шкіри),
  розрахунок ціни й знижки на льоту.
- Залишки на складі: статус на картці («In stock» / «Only N left» /
  «Out of stock») і блокування кнопки «Add to bag», коли залишку немає.
- Модель товарів/категорій/міток/announcement bar у Strapi 5 (PostgreSQL),
  інтерфейс адмінки — українською.
- `packages/types` — спільні типи, нормалізація відповідей Strapi, логіка
  розрахунку ціни/знижки/залишку (покрита тестами).
- SEO: метадані, Open Graph, коректна структура заголовків (h1 → h2 → h3…).
- Публічні права на читання API видаються кодом при старті Strapi.

### Зображення — плейсхолдери

Усі зображення (hero, промо-плашка, картки кроків, OG-превʼю) — тимчасові
SVG/PNG-заглушки в `apps/web/public/`. Вони мають ті самі пропорції, що й
макет, тому заміна на фінальну графіку не потребує змін у верстці.

Зображення товарів приходять зі Strapi: у поточних seed-даних їх немає, тому
картки показують нейтральний плейсхолдер. Щойно зображення завантажено в
адмінці, воно зʼявляється на картці автоматично.

## Стек

| Шар | Технологія | Версія |
|---|---|---|
| Frontend | Next.js (App Router, Turbopack) | 16.3.4 |
| | React | 19.2.8 |
| | Tailwind CSS | 4.x |
| | TypeScript | 5.x |
| | Vitest + Testing Library | 5.x / 16.x |
| CMS | Strapi | 5.52.3 |
| | Node (для Strapi) | >=20.0.0 <=26.x |
| БД | PostgreSQL (Docker, `postgres:16-alpine`) | 16 |
| Монорепо | pnpm workspaces | pnpm 11.0.9 |

Структура — монорепо на pnpm workspaces: `apps/web` (Next.js), `apps/cms`
(Strapi), `packages/types` (спільні типи й логіка цін).

### Особливості монорепо на pnpm

pnpm ізолює залежності: пакет бачить тільки те, що оголосив сам. Next
подекуди розраховує на плоский `node_modules` (як у npm), тому два місця
налаштовані явно.

**`overrides` у `pnpm-workspace.yaml`** фіксують `@types/react` (19.2.18) і
`@types/react-dom` (19.2.7) на одній версії. Next і Strapi живуть на різних
мажорах React; `next` не оголошує `@types/react` своєю залежністю і
підхоплював копію 18 від Strapi — у компіляції опинялися два різні
`ReactNode`, і збірка падала. Зведено лише типи, рантайм роздільний.

**`turbopack.root` у `apps/web/next.config.ts`** явно вказує корінь монорепо,
щоб Turbopack не визначав його самостійно й не помилявся з областю стеження
за файлами.

## Вимоги

- Node.js **>= 22.13.0** (перевірено на 22.x; Strapi також підтримує до 26.x)
- pnpm **11** (`packageManager: pnpm@11.0.9` у `package.json`, рекомендовано
  вмикати через corepack: `corepack enable`)
- Docker + Docker Compose (для локального PostgreSQL)

## Локальний запуск від нуля

```bash
# 1. Клон і залежності
git clone <repo-url> lumea
cd lumea
pnpm install

# 2. Postgres у Docker
docker compose up -d
# або: pnpm db:up

# 3. Змінні оточення
cp .env.example apps/cms/.env
cp .env.example apps/web/.env.local
```

Далі відредагуй два файли, які щойно з'явились:

- **`apps/cms/.env`** — залиш блок Postgres (`DATABASE_*`) як є (збігається
  з `docker-compose.yml`); згенеруй секрети Strapi:

  ```bash
  # виконати 5 разів (APP_KEYS приймає список через кому — 4 значення)
  openssl rand -base64 32
  ```

  Заповни `APP_KEYS` (4 значення через кому), `API_TOKEN_SALT`,
  `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`
  цими значеннями. Прибери рядки `NEXT_PUBLIC_*` — вони для
  `apps/web/.env.local`, а не для CMS.

- **`apps/web/.env.local`** — залиш лише:

  ```
  NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```

```bash
# 4. Запустити Strapi
pnpm dev:cms
```

Відкрий `http://localhost:1337/admin` — при першому запуску Strapi
попросить створити першого адміністратора. У цьому репозиторії вже
використовуються (і задокументовані нижче) дані:

- **Email:** `admin@lumea.test`
- **Пароль:** `Admin1234!`

Онови dev-сервер (Ctrl+C, знову `pnpm dev:cms`), якщо реєстрація адміна
вимагала рестарту — зазвичай не потрібно.

```bash
# 5. Заповнити демо-даними (товари, категорії, announcement bar)
pnpm --filter cms seed
```

Скрипт ідемпотентний — повторний запуск не створює дублікатів.

```bash
# 6. Запустити фронтенд (в іншому терміналі, Strapi має вже працювати)
pnpm dev:web
```

Відкрий `http://localhost:3000`.

### Щоденний запуск: одна команда

Після першого налаштування все піднімається разом — Postgres, Strapi і
фронтенд:

```bash
pnpm dev
```

Логи обох процесів ідуть в один термінал із префіксами `dev:web` і
`dev:cms`. Зупинка — `Ctrl+C`; щоб зупинити ще й базу:

```bash
pnpm stop
```

Strapi стартує довше за фронтенд (~30 с). До того моменту сторінка
відкривається, але без товарів — це штатний fallback, не помилка.

Публічні права на читання API (product, category, badge, announcement-bar)
видаються автоматично при старті Strapi — вмикати їх кліками в адмінці не
треба, ні локально, ні на новому середовищі.

## Структура проєкту

```
lumea/
├── apps/
│   ├── web/                      # Next.js фронтенд
│   │   ├── src/app/               # App Router: layout, page
│   │   ├── src/components/        # header, hero, steps, products, ui
│   │   ├── src/lib/strapi.ts      # fetch-обгортка над Strapi REST API
│   │   └── public/                 # статичні файли, зображення, og-image.png
│   └── cms/                       # Strapi CMS
│       ├── src/api/                # product, category, badge,
│       │                            # announcement-bar
│       ├── src/components/         # variation, variation-value, sub-value,
│       │                            # announcement-message
│       ├── src/index.ts            # bootstrap: публічні права на читання
│       ├── scripts/seed.ts         # демо-дані (ідемпотентний)
│       └── config/                 # server, database, admin, plugins
├── packages/
│   └── types/                     # спільні типи, normalize.ts, pricing.ts
├── docker-compose.yml              # PostgreSQL
└── .env.example                    # шаблон змінних оточення
```

## Змінні оточення

### `apps/cms/.env`

| Змінна | Опис | Приклад |
|---|---|---|
| `HOST` | Хост Strapi-сервера | `0.0.0.0` |
| `PORT` | Порт Strapi-сервера | `1337` |
| `APP_KEYS` | 4 ключі сесій, через кому | `openssl rand -base64 32` × 4 |
| `API_TOKEN_SALT` | Сіль для API-токенів | `openssl rand -base64 32` |
| `ADMIN_JWT_SECRET` | Секрет JWT адмінки | `openssl rand -base64 32` |
| `TRANSFER_TOKEN_SALT` | Сіль для transfer-токенів | `openssl rand -base64 32` |
| `JWT_SECRET` | Секрет JWT users-permissions | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Ключ шифрування | `openssl rand -base64 32` |
| `DATABASE_CLIENT` | Драйвер БД | `postgres` |
| `DATABASE_HOST` | Хост Postgres | `127.0.0.1` |
| `DATABASE_PORT` | Порт Postgres | `5432` |
| `DATABASE_NAME` | Назва БД | `lumea` |
| `DATABASE_USERNAME` | Користувач БД | `lumea` |
| `DATABASE_PASSWORD` | Пароль БД | `lumea` |
| `DATABASE_SSL` | SSL до БД | `false` (локально), `true` (прод, залежно від хостингу) |

### `apps/web/.env.local`

| Змінна | Опис | Приклад |
|---|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | Базовий URL Strapi REST API | `http://127.0.0.1:1337` |
| `NEXT_PUBLIC_SITE_URL` | Канонічний URL фронтенду (для метаданих/Open Graph) | `http://localhost:3000` |

`NEXT_PUBLIC_*` змінні потрапляють у клієнтський бандл — не клади туди
нічого чутливого.

## Рендеринг: SSR без кешу

Усі запити до Strapi в `apps/web/src/lib/strapi.ts` ідуть з
`cache: 'no-store'`, тому сторінка рендериться на сервері на кожен запит
(SSR).

Причина — залишки на складі. Це інтернет-магазин: `stock` зменшується при
покупці, а не при редагуванні в CMS, тому кеш показував би «In stock» на
вже проданому товарі. При SSR і контент, і залишки завжди свіжі.

SEO не страждає — пошуковик отримує готовий HTML, згенерований на сервері.

## Керування контентом

### Додати товар

Strapi Admin → **Content Manager → Товар → Create new entry**:

- **name** — назва без ємності, напр. «Daily Moisturiser». Ємність
  задається варіацією «Size».
- **image** — фото товару.
- **priceMode** — тип ціни, `single` або `byVariation` (див. розділ про
  модель цін нижче). Від нього залежить, які поля ціни видно в адмінці.
- **price** — ціна товару. Видиме й обов'язкове лише при `priceMode:
  single`.
- **discountPercent** / **discountedPrice** — знижка на товар цілком.
  Видимі лише при `priceMode: single`.
- **stock** — залишок на складі. Заповнюй, коли товар продається без
  варіацій; інакше залишок ведеться на кожному варіанті окремо.
- **badges** — мітки, зв'язок із колекцією «Мітка», необов'язково.
- **variations** — групи варіацій (Size, Skin type тощо), див. нижче.
- **categories** — прив'язка до однієї чи кількох категорій.

Не забудь **Save** і **Publish** (якщо draft/publish увімкнено для типу —
за замовчуванням у цьому проєкті `draftAndPublish: false`, тобто Save одразу
публікує).

Якщо дані суперечать типу ціни (напр. заповнені і `price`, і ціни у
варіантах), lifecycle-хук
`apps/cms/src/api/product/content-types/product/lifecycles.ts` не дасть
зберегти запис і покаже помилку українською.

### Додати категорію

Strapi Admin → **Content Manager → Категорія → Create new entry**:
`name` (обов'язково), `slug` генерується автоматично з `name`, `order` —
порядок сортування на фронті (менше число — раніше).

### Додати мітку

Мітки — окремий collection type «Мітка» (`api::badge.badge`). Strapi Admin →
**Content Manager → Мітка → Create new entry**: `name` (унікальний текст на
картці, напр. «Sale», «New», «Limited») і `order` — порядок, коли на товарі
кілька міток. Створити можна будь-яку мітку, змінювати код не треба.
Прив'язка до товару — поле **badges** у картці товару (many-to-many).

### Додати варіацію з власною ціною і знижкою

У картці товару, поле **variations**, додай новий запис:

- **label** — назва групи, напр. «Size», «Skin type», «Choose formula».
  (Ці назви ніде не захардкоджені у фронтенді — вони повністю приходять
  з CMS, тому можна ввести будь-яку назву групи.)
- **values** — список опцій; для кожної:
  - **label** — напр. «50 ml».
  - **priceOverride** — власна ціна ЦІЄЇ опції замість базової ціни товару
    (лишити порожнім, якщо опція коштує як базова ціна або якщо ціну
    задають вкладені варіанти).
  - **discountPercent** / **discountedPrice** — знижка ЦІЄЇ опції.
  - **stock** — залишок цієї опції. Не заповнюй, якщо є вкладені
    варіанти — тоді залишок ведеться на кожному з них.
  - **subLabel** / **subValues** — вкладена група, див. нижче.

### Вкладені варіації (два рівні)

Коли ємності залежать від іншої характеристики — «Dry» випускається лише в
40 ml, а «Normal» у 50 і 100 ml — другий рівень вкладається в перший. Так
покупець не може обрати комбінацію, якої не існує.

У значенні варіації заповни:

- **subLabel** — назва вкладеної групи, напр. «Size».
- **subValues** — варіанти, доступні ТІЛЬКИ для цього значення. У кожного
  свої **label**, **priceOverride**, **discountPercent** /
  **discountedPrice**, **stock**.

Приклад: «Skin type» → `Dry` має `subValues: [40 ml]`, `Normal` —
`[50 ml, 100 ml]`. На фронті список ємностей перебудовується разом зі
зміною типу шкіри, і неможливу комбінацію обрати не можна.

### Залишки на складі

Поле `stock` існує на трьох рівнях: товар, значення варіації, вкладений
варіант. Виграє найглибший заповнений рівень: вкладений варіант перекриває
значення, значення — товар.

Порожнє поле означає, що облік на цьому рівні не ведеться; якщо залишку
немає на жодному рівні, товар вважається доступним. Значення `0` — це
«немає в наявності».

На картці показується «In stock», «Only N left» (при залишку ≤ 5) або
«Out of stock»; при нульовому залишку кнопка «Add to bag» блокується.

### Додати повідомлення в announcement bar

Strapi Admin → **Content Manager → Смуга оголошень** (single type) →
поле **messages** → **Add an entry**: `text` (сам текст) і `order`
(порядок показу в ротації).

## Модель цін і знижок — детально

Найтонше місце моделі, тож пояснення максимально по кроках з реальними
прикладами із seed-даних.

**Головна ідея:** поле `priceMode` каже, ДЕ живе ціна, і одна й та сама ціна
ніколи не задається у двох місцях одночасно.

- `single` — одна ціна на весь товар, у полі `price`. Варіації тоді не
  мають власних цін (можуть мати лише знижки).
- `byVariation` — поле `price` порожнє, ціну несе кожне значення варіації
  (або кожен вкладений варіант) у своєму `priceOverride`.

У адмінці поля `price`, `discountPercent`, `discountedPrice` ховаються, коли
обрано `byVariation`, а lifecycle-хук не дає зберегти суперечливі дані.

Ієрархія (від переможця до програвшого):

1. **Ціна:** виграє найглибше джерело із заповненим `priceOverride` —
   вкладений варіант перекриває значення варіації, значення перекриває
   товар. Якщо `priceOverride` немає ніде — беремо `price` товару.
2. **Знижка:** якщо в обраному варіанті заповнено `discountPercent` (або
   `discountedPrice`, якщо відсоток не задано) — використовується ВОНА,
   і товарна знижка ігнорується. Товарна знижка застосовується лише тоді,
   коли ЖОДЕН обраний варіант не має власної (і лише при `priceMode:
   single` — у режимі `byVariation` товарних полів знижки взагалі немає).
   Якщо знижку задано в кількох обраних варіантах — виграє БІЛЬША.
3. `discountPercent` завжди має пріоритет над `discountedPrice` в межах
   одного джерела — `discountedPrice` лише зручний спосіб задати відсоток
   через кінцеву ціну, відсоток порахується сам.

**Приклад 1 — `single`** (`apps/cms/scripts/seed.ts`, «Hyaluronic Acid
Serum»): `price: 28`, `discountPercent: 15`, варіація «Choose formula» без
власних цін → будь-яка формула коштує **£23.80**.

**Приклад 2 — `byVariation` із вкладеними варіаціями** («Daily
Moisturiser»): поля `price` немає, група «Skin type» → кожне значення має
власну вкладену групу «Size»:

- `Dry` → `40 ml`: `priceOverride: 24`, `stock: 0` → **£24**, «Out of stock».
- `Normal` → `50 ml`: `priceOverride: 32`, `discountPercent: 10`,
  `stock: 3` → **£28.80**, «Only 3 left».
- `Normal` → `100 ml`: `priceOverride: 52` → **£52**.
- `Sensitive` → `50 ml`: `priceOverride: 34` → **£34**.

Тобто кожна комбінація повністю самостійна: своя ціна, своя знижка, свій
залишок — незалежно від сусідніх варіантів. І список ємностей у «Size»
залежить від обраного типу шкіри, тому пари «Dry + 100 ml» просто не існує.

Якщо потрібно, щоб УВЕСЬ товар (незалежно від обраного варіанта) мав
загальну знижку — обери `priceMode: single`, заповни
`discountPercent`/`discountedPrice` на самому товарі, а поля знижки у
варіантах залиш порожніми.

## Тести

```bash
pnpm test
```

Запускає тести в усіх пакетах воркспейсу (`pnpm -r test`):
- `packages/types` — нормалізація, розрахунок ціни/знижки/залишку.
- `apps/web` — компоненти, sticky-логіка, вибір варіацій тощо.

Збірка:

```bash
pnpm build            # усі пакети
pnpm --filter web build  # лише фронтенд
```

## Деплой

### Frontend — Vercel

1. Створити проєкт у Vercel, підключити цей репозиторій.
2. **Root Directory:** `apps/web` (обов'язково — це монорепо, Vercel має
   білдити лише пакет `web`).
3. Vercel сам визначить Next.js і команду білду (`next build`); за потреби
   вкажи вручну **Build Command:** `pnpm build` (з кореня — pnpm workspace
   резолвить `@lumea/types` автоматично) і **Install Command:**
   `pnpm install`.
4. Environment Variables (Production):
   - `NEXT_PUBLIC_STRAPI_URL` — публічний URL Strapi на Render.
   - `NEXT_PUBLIC_SITE_URL` — фінальний домен на Vercel
     (напр. `https://lumea.vercel.app` або кастомний домен).

Сторінка рендериться на кожен запит (SSR), тому Vercel її не кешує.

### CMS — Render

1. Створити **Web Service** на Render із цього репозиторію,
   **Root Directory:** `apps/cms`.
2. **Build Command:** `pnpm install && pnpm build`.
3. **Start Command:** `pnpm start`.
4. Environment Variables — усі змінні з `apps/cms/.env` (див. таблицю
   вище), плюс `NODE_ENV=production`. `DATABASE_HOST`/`DATABASE_PORT`/
   `DATABASE_NAME`/`DATABASE_USERNAME`/`DATABASE_PASSWORD` — з Render
   Postgres (наступний пункт); `DATABASE_SSL=true`, якщо Render вимагає SSL.

### PostgreSQL — Render

1. Створити **PostgreSQL** інстанс на Render (той самий регіон, що й
   CMS-сервіс, для меншої затримки).
2. Скопіювати `Internal Database URL` / окремі поля підключення у змінні
   оточення CMS-сервісу (крок вище).
3. Після першого запуску Strapi сам створить потрібні таблиці й видасть
   ролі Public права на читання каталогу (bootstrap у
   `apps/cms/src/index.ts`) — фронт працює одразу, без кліків в адмінці.

### Після деплою

- Зайти на `<домен CMS>/admin`, створити адміністратора продакшена
  (окремий від локального `admin@lumea.test`, якщо клієнт хоче інший
  пароль на проді).
- Запустити `pnpm --filter cms seed` локально проти прод-БД (з тими самими
  `DATABASE_*` у `.env`) або внести контент вручну через адмінку.

---

Дані для входу в Strapi Admin (локально): **admin@lumea.test / Admin1234!**
