# LUMEA

Hero-секція та інтерактивний блок «How it works» з каталогом товарів.
Контент (товари, категорії, мітки, announcement bar) керується зі Strapi.

## Технології

| | |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| CMS | Strapi 5 |
| База | PostgreSQL 16 (Docker) |
| Пакети | pnpm 11, монорепо |
| Анімації | GSAP ScrollTrigger |

## Структура

```
apps/web      — Next.js фронтенд
apps/cms      — Strapi CMS
packages/types — спільні типи, нормалізація, розрахунок цін
```

## Запуск

Потрібні Node 22.13+, pnpm 11 і Docker.

```bash
pnpm install
cp apps/cms/.env.example apps/cms/.env
pnpm dev
```

`pnpm dev` піднімає PostgreSQL у Docker і запускає обидва застосунки:

- фронтенд — http://localhost:3000
- адмінка Strapi — http://localhost:1337/admin

При першому запуску Strapi попросить створити адміністратора.

### Наповнити тестовими даними

```bash
pnpm --filter cms build
pnpm --filter cms seed
```

Додасть 6 товарів, 3 категорії, мітки й повідомлення announcement bar.

## Команди

```bash
pnpm dev      # база + фронтенд + CMS
pnpm build    # зібрати все
pnpm test     # тести
pnpm db:up    # лише база
pnpm stop     # зупинити базу
```

## Змінні оточення

`apps/cms/.env` — з `.env.example` (ключі Strapi, доступ до бази).

Для фронтенду за потреби:

- `NEXT_PUBLIC_STRAPI_URL` — адреса CMS, типово `http://127.0.0.1:1337`
- `IMAGE_ORIGINS` — додаткові домени для зображень
