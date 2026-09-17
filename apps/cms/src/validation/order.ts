import { errors } from '@strapi/utils';
import type { Core } from '@strapi/strapi';

const { ApplicationError } = errors;

type Data = Record<string, unknown>;
const object = (value: unknown): value is Data =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const list = (value: unknown): Data[] => Array.isArray(value) ? value.filter(object) : [];
const text = (value: unknown, max: number): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' || trimmed.length > max ? null : trimmed;
};

const POPULATE = { variations: { populate: { values: { populate: ['subValues'] } } } };
const round2 = (n: number): number => Math.round(n * 100) / 100;

export interface OrderLine {
  productId: number;
  /** Мітки обраних варіантів, у порядку від верхньої групи до вкладеної. */
  labels: string[];
  quantity: number;
}

/** Ціна після знижки: відсоток має пріоритет над кінцевою ціною. */
function finalPrice(base: number, source: Data): number {
  const percent = Number(source.discountPercent);
  if (Number.isFinite(percent) && percent > 0) return round2(base * (1 - percent / 100));
  const discounted = Number(source.discountedPrice);
  if (Number.isFinite(discounted) && discounted > 0) return round2(discounted);
  return round2(base);
}

/**
 * Знаходить у товарі варіант за мітками. Повертає ціну, залишок і шлях,
 * яким його знайдено — щоб потім списати залишок саме там, де він ведеться.
 */
function resolveVariant(product: Data, labels: string[]) {
  const groups = list(product.variations);
  let price = Number(product.price);
  let stockSource: Data = product;
  let path: { group: number; value: number; sub: number | null } | null = null;
  const options: string[] = [];

  groups.forEach((group, groupIndex) => {
    const values = list(group.values);
    const value = values.find((v) => labels.includes(String(v.label))) ?? values[0];
    if (value === undefined) return;
    options.push(String(value.label));

    const override = Number(value.priceOverride);
    if (Number.isFinite(override) && override > 0) price = override;
    if (value.stock !== null && value.stock !== undefined) stockSource = value;
    path = { group: groupIndex, value: values.indexOf(value), sub: null };

    const subValues = list(value.subValues);
    if (subValues.length === 0) return;
    const sub = subValues.find((s) => labels.includes(String(s.label))) ?? subValues[0];
    if (sub === undefined) return;
    options.push(String(sub.label));

    const subOverride = Number(sub.priceOverride);
    if (Number.isFinite(subOverride) && subOverride > 0) price = subOverride;
    if (sub.stock !== null && sub.stock !== undefined) stockSource = sub;
    path = { group: groupIndex, value: values.indexOf(value), sub: subValues.indexOf(sub) };
  });

  if (!Number.isFinite(price)) {
    throw new ApplicationError(`Не вдалося визначити ціну товару «${String(product.name)}».`);
  }

  const rawStock = stockSource.stock;
  return {
    unitPrice: finalPrice(price, stockSource === product ? product : stockSource),
    stock: rawStock === null || rawStock === undefined ? null : Number(rawStock),
    stockSource,
    path,
    options: options.join(' · '),
  };
}

/** Розбирає тіло запиту, не довіряючи жодному числу з клієнта. */
export function parseOrderInput(raw: unknown) {
  if (!object(raw)) throw new ApplicationError('Некоректні дані замовлення.');

  const customerName = text(raw.customerName, 100);
  if (customerName === null) throw new ApplicationError('Вкажіть імʼя.');

  const phone = text(raw.phone, 30);
  if (phone === null) throw new ApplicationError('Вкажіть телефон.');

  const email = raw.email === undefined || raw.email === null || raw.email === ''
    ? null : text(raw.email, 120);
  if (email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApplicationError('Некоректний email.');
  }

  const comment = raw.comment === undefined || raw.comment === null || raw.comment === ''
    ? null : text(raw.comment, 500);

  const items = list(raw.items).map((item): OrderLine => {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(productId) || productId < 1) {
      throw new ApplicationError('Некоректний товар у замовленні.');
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) {
      throw new ApplicationError('Некоректна кількість товару.');
    }
    const labels = (Array.isArray(item.labels) ? item.labels : [])
      .filter((label): label is string => typeof label === 'string')
      .slice(0, 10);
    return { productId, labels, quantity };
  });

  if (items.length === 0) throw new ApplicationError('Кошик порожній.');
  if (items.length > 50) throw new ApplicationError('Забагато позицій у замовленні.');

  return { customerName, phone, email, comment, items };
}

/**
 * Збирає замовлення за даними з БД і списує залишки.
 * Ціни рахуються тут, а не приймаються від клієнта.
 */
export async function buildOrder(strapi: Core.Strapi, input: ReturnType<typeof parseOrderInput>) {
  const items: Data[] = [];
  const stockUpdates: { documentId: string; data: Data }[] = [];
  let total = 0;

  for (const line of input.items) {
    const found = await strapi.documents('api::product.product').findMany({
      filters: { id: line.productId },
      populate: { ...POPULATE, categories: true, badges: true },
    } as never) as Data[];
    const product = found[0];

    if (product === undefined) {
      throw new ApplicationError('Товар із замовлення більше не доступний.');
    }

    const variant = resolveVariant(product, line.labels);

    if (variant.stock !== null && variant.stock < line.quantity) {
      throw new ApplicationError(
        `«${String(product.name)}»: доступно лише ${variant.stock} шт.`,
      );
    }

    items.push({
      product: Number(product.id),
      productName: String(product.name),
      options: variant.options === '' ? null : variant.options,
      quantity: line.quantity,
      unitPrice: variant.unitPrice,
    });
    total = round2(total + variant.unitPrice * line.quantity);

    if (variant.stock !== null) {
      stockUpdates.push({
        documentId: String(product.documentId),
        data: applyStock(product, variant.path, variant.stock - line.quantity),
      });
    }
  }

  return { items, total, stockUpdates };
}

/** Повертає товари скасованого замовлення на склад. */
export async function restoreStock(
  strapi: Core.Strapi,
  order: { items?: unknown },
): Promise<void> {
  for (const item of list(order.items)) {
    const productId = object(item.product) ? Number(item.product.id) : Number(item.product);
    // Товар міг втратити звʼязок — тоді шукаємо за збереженою назвою.
    const filters = Number.isSafeInteger(productId) && productId > 0
      ? { id: productId }
      : { name: String(item.productName ?? '') };

    const found = await strapi.documents('api::product.product').findMany({
      filters,
      populate: { ...POPULATE, categories: true, badges: true },
    } as never) as Data[];
    const product = found[0];
    if (product === undefined) continue;

    const labels = String(item.options ?? '').split('·').map((part) => part.trim()).filter(Boolean);
    const variant = resolveVariant(product, labels);
    if (variant.stock === null) continue;

    await strapi.documents('api::product.product').update({
      documentId: String(product.documentId),
      data: applyStock(product, variant.path, variant.stock + Number(item.quantity ?? 0)) as never,
    });
  }
}

/** Повертає повний обʼєкт товару зі зміненим залишком у потрібному місці. */
function applyStock(
  product: Data,
  path: { group: number; value: number; sub: number | null } | null,
  nextStock: number,
): Data {
  if (path === null) return { stock: nextStock };

  const variations = list(product.variations).map((group, groupIndex) => {
    if (groupIndex !== path.group) return group;
    return {
      ...group,
      values: list(group.values).map((value, valueIndex) => {
        if (valueIndex !== path.value) return value;
        if (path.sub === null) return { ...value, stock: nextStock };
        return {
          ...value,
          subValues: list(value.subValues).map((sub, subIndex) =>
            subIndex === path.sub ? { ...sub, stock: nextStock } : sub),
        };
      }),
    };
  });

  // Relations передаємо явно — інакше update() їх обнулить.
  return {
    variations,
    categories: list(product.categories).map((c) => Number(c.id)),
    badges: list(product.badges).map((b) => Number(b.id)),
  };
}
