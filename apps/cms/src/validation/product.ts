import { errors } from '@strapi/utils';

const { ApplicationError } = errors;
type Data = Record<string, unknown>;
const object = (value: unknown): value is Data => value !== null && typeof value === 'object' && !Array.isArray(value);
const list = (value: unknown): Data[] => Array.isArray(value) ? value.filter(object) : [];
const filled = (value: unknown) => value !== undefined && value !== null && value !== '';

// Оновлення repeatable-компонента може містити лише id та змінені поля.
// Перед валідацією зіставляємо за id, а не вважаємо пропущені поля порожніми.
export function mergeProduct(previous: unknown, update: unknown): unknown {
  if (Array.isArray(update)) {
    const old = list(previous);
    return update.map((item) => object(item) ? mergeProduct(old.find((entry) => item.id !== undefined && entry.id === item.id), item) : item);
  }
  if (!object(update)) return update;
  const result: Data = object(previous) ? { ...previous } : {};
  for (const [key, value] of Object.entries(update)) {
    if (value !== undefined) result[key] = mergeProduct(result[key], value);
  }
  return result;
}

const SIZE_GROUP = /size|volume|ємніст/i;
const label = (source: Data, key: string) => typeof source[key] === 'string' ? source[key] : '';

function validateVolume(input: Data, groups: Data[], values: Data[]): void {
  const mode = input.volumeMode ?? 'single';
  const hasSizeGroup = groups.some((group) => SIZE_GROUP.test(label(group, 'label')))
    || values.some((value) => SIZE_GROUP.test(label(value, 'subLabel')));

  if (mode === 'single') {
    if (!filled(input.volume)) throw new ApplicationError('Вкажіть ємність товару, напр. «30 ml».');
    if (hasSizeGroup) throw new ApplicationError('Товар має варіацію ємності — переставте тип ємності на «Ємність залежить від варіації».');
  } else if (mode === 'byVariation') {
    if (filled(input.volume)) throw new ApplicationError('У режимі byVariation приберіть поле ємності — її задають варіанти.');
    if (!hasSizeGroup) throw new ApplicationError('Додайте варіацію ємності («Size») або переставте тип ємності на «Одна ємність».');
  } else throw new ApplicationError('Некоректний тип ємності.');
}

export function validateProduct(input: unknown): void {
  if (!object(input)) throw new ApplicationError('Некоректні дані товару.');
  const mode = input.priceMode ?? 'single';
  const groups = list(input.variations);
  const values = groups.flatMap((group) => list(group.values));
  validateVolume(input, groups, values);
  const sources = [input, ...values, ...values.flatMap((value) => list(value.subValues))];
  for (const source of sources) {
    for (const field of ['price', 'priceOverride', 'discountedPrice', 'discountPercent', 'stock']) {
      if (!filled(source[field])) continue;
      const number = Number(source[field]);
      if (!Number.isFinite(number) || number < 0 || (field === 'discountPercent' && number > 100)
          || (['stock', 'discountPercent'].includes(field) && !Number.isInteger(number))) {
        throw new ApplicationError(`Некоректне значення поля ${field}.`);
      }
    }
  }
  if (mode === 'single') {
    if (!filled(input.price)) throw new ApplicationError('Вкажіть ціну товару.');
    if (sources.slice(1).some((value) => filled(value.priceOverride))) throw new ApplicationError('У режимі single ціна задається лише на товарі.');
  } else if (mode === 'byVariation') {
    if (filled(input.price)) throw new ApplicationError('У режимі byVariation приберіть ціну товару та задайте ціни варіантів.');
    if (values.length === 0 || groups.some((group) => list(group.values).length === 0)) throw new ApplicationError('Додайте варіації з цінами.');
    for (const value of values) {
      const subValues = list(value.subValues);
      if (!filled(value.priceOverride) && (subValues.length === 0 || subValues.some((sub) => !filled(sub.priceOverride)))) {
        throw new ApplicationError(`Вкажіть ціну для кожного варіанта «${String(value.label ?? '')}».`);
      }
    }
  } else throw new ApplicationError('Некоректний тип ціни.');
}
