import { createStrapi } from '@strapi/strapi';

// Підписи полів у Content Manager зберігаються в metadatas конфігурації типу —
// це те саме, що менеджер задає вручну через «Налаштувати вигляд».
// Імена полів у схемі й API не змінюються.
const LABELS: Record<string, string> = {
  name: 'Назва',
  volumeMode: 'Тип ємності',
  volume: 'Ємність',
  image: 'Фото',
  priceMode: 'Тип ціни',
  price: 'Ціна',
  discountPercent: 'Знижка, %',
  discountedPrice: 'Ціна зі знижкою',
  stock: 'Кількість на складі',
  badges: 'Мітки',
  variations: 'Варіації',
  categories: 'Категорії',

  label: 'Назва варіанта',
  values: 'Варіанти',
  priceOverride: 'Ціна варіанта',
  subLabel: 'Назва вкладеної групи',
  subValues: 'Вкладені варіанти',

  slug: 'Ідентифікатор',
  order: 'Порядок',

  customerName: 'Імʼя покупця',
  phone: 'Телефон',
  email: 'Email',
  comment: 'Коментар',
  status: 'Статус',
  items: 'Позиції',
  total: 'Сума',
  product: 'Товар',
  productName: 'Назва товару',
  options: 'Обрані варіанти',
  quantity: 'Кількість',
  unitPrice: 'Ціна за одиницю',

  text: 'Текст',
  messages: 'Повідомлення',
};

const UIDS = [
  'api::product.product',
  'api::category.category',
  'api::badge.badge',
  'api::order.order',
  'api::announcement-bar.announcement-bar',
];

const COMPONENTS = [
  'product.variation',
  'product.variation-value',
  'product.sub-value',
  'order.item',
  'shared.announcement-message',
];

type Meta = Record<string, { edit?: Record<string, unknown>; list?: Record<string, unknown> }>;

/** Проставляє label у metadatas, лишаючи решту налаштувань недоторканими. */
function relabel(metadatas: Meta): { next: Meta; changed: string[] } {
  const next: Meta = {};
  const changed: string[] = [];

  for (const [field, meta] of Object.entries(metadatas)) {
    const label = LABELS[field];
    if (label === undefined) {
      next[field] = meta;
      continue;
    }
    next[field] = {
      ...meta,
      edit: { ...(meta.edit ?? {}), label },
      list: { ...(meta.list ?? {}), label },
    };
    changed.push(`${field} → ${label}`);
  }
  return { next, changed };
}

let app: Awaited<ReturnType<typeof createStrapi>> | undefined;

async function run() {
  app = await createStrapi({ appDir: process.cwd(), distDir: './dist' }).load();
  const store = app.store;

  for (const uid of UIDS) {
    const config = await store({ type: 'plugin', name: 'content_manager_configuration', key: `content_types::${uid}` }).get({}) as
      { metadatas?: Meta } | null;

    if (config === null || config.metadatas === undefined) {
      console.log(`− ${uid}: конфігурації ще немає`);
      continue;
    }
    const { next, changed } = relabel(config.metadatas);
    if (changed.length === 0) { console.log(`= ${uid}: нічого міняти`); continue; }

    await store({ type: 'plugin', name: 'content_manager_configuration', key: `content_types::${uid}` })
      .set({ value: { ...config, metadatas: next } });
    console.log(`✓ ${uid}: ${changed.length} полів`);
  }

  for (const uid of COMPONENTS) {
    const config = await store({ type: 'plugin', name: 'content_manager_configuration', key: `components::${uid}` }).get({}) as
      { metadatas?: Meta } | null;

    if (config === null || config.metadatas === undefined) {
      console.log(`− ${uid}: конфігурації ще немає`);
      continue;
    }
    const { next, changed } = relabel(config.metadatas);
    if (changed.length === 0) { console.log(`= ${uid}: нічого міняти`); continue; }

    await store({ type: 'plugin', name: 'content_manager_configuration', key: `components::${uid}` })
      .set({ value: { ...config, metadatas: next } });
    console.log(`✓ ${uid}: ${changed.length} полів`);
  }

  console.log('set-field-labels: готово');
  await app.destroy();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  await app?.destroy();
  process.exit(1);
});
