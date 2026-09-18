import type {
  Badge, Category, PriceMode, Product, SubtitleMode, SubValue, Variation,
  VariationValue,
} from './product';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const str = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v : null;

function toSubValue(raw: unknown): SubValue | null {
  if (!isRecord(raw)) return null;
  const label = str(raw.label);
  if (label === null) return null;
  return {
    label,
    priceOverride: num(raw.priceOverride),
    discountPercent: num(raw.discountPercent),
    discountedPrice: num(raw.discountedPrice),
    stock: num(raw.stock),
  };
}

function toValue(raw: unknown): VariationValue | null {
  if (!isRecord(raw)) return null;
  const label = str(raw.label);
  if (label === null) return null;
  const subValues = (Array.isArray(raw.subValues) ? raw.subValues : [])
    .map(toSubValue)
    .filter((v): v is SubValue => v !== null);
  const image = isRecord(raw.image) ? raw.image : null;
  return {
    label,
    imageUrl: image ? str(image.url) : null,
    priceOverride: num(raw.priceOverride),
    discountPercent: num(raw.discountPercent),
    discountedPrice: num(raw.discountedPrice),
    stock: num(raw.stock),
    subLabel: subValues.length > 0 ? str(raw.subLabel) : null,
    subValues,
  };
}

function toVariation(raw: unknown): Variation | null {
  if (!isRecord(raw)) return null;
  const label = str(raw.label);
  if (label === null) return null;
  const values = (Array.isArray(raw.values) ? raw.values : [])
    .map(toValue)
    .filter((v): v is VariationValue => v !== null);
  return values.length > 0 ? { label, values } : null;
}

function toBadge(raw: unknown): Badge | null {
  if (!isRecord(raw)) return null;
  const name = str(raw.name);
  if (name === null) return null;
  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    name,
    order: num(raw.order) ?? 0,
  };
}

export function normalizeProduct(raw: unknown): Product | null {
  if (!isRecord(raw)) return null;
  const name = str(raw.name);
  if (name === null) return null;

  const priceMode: PriceMode =
    raw.priceMode === 'byVariation' ? 'byVariation' : 'single';

  const subtitleMode: SubtitleMode =
    raw.subtitleMode === 'byVariation' ? 'byVariation' : 'single';

  const variations = (Array.isArray(raw.variations) ? raw.variations : [])
    .map(toVariation)
    .filter((v): v is Variation => v !== null);

  const price = num(raw.price);

  const hasVariationPrice = variations.some((v) =>
    v.values.some((value) =>
      value.priceOverride !== null
      || value.subValues.some((sub) => sub.priceOverride !== null)));
  if (priceMode === 'single' && price === null) return null;
  if (priceMode === 'byVariation' && !hasVariationPrice) return null;

  const image = isRecord(raw.image) ? raw.image : null;

  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    name,
    imageUrl: image ? str(image.url) : null,
    imageAlt: image ? str(image.alternativeText) : null,
    subtitleMode,
    subtitle: subtitleMode === 'single' ? str(raw.subtitle) : null,
    priceMode,
    price,
    discountPercent: num(raw.discountPercent),
    discountedPrice: num(raw.discountedPrice),
    stock: num(raw.stock),
    badges: (Array.isArray(raw.badges) ? raw.badges : [])
      .map(toBadge)
      .filter((b): b is Badge => b !== null)
      .sort((a, b) => a.order - b.order),
    variations,
    categoryIds: (Array.isArray(raw.categories) ? raw.categories : [])
      .map((c) => (isRecord(c) && typeof c.id === 'number' ? c.id : null))
      .filter((id): id is number => id !== null),
  };
}

export function normalizeCategory(raw: unknown): Category | null {
  if (!isRecord(raw)) return null;
  const name = str(raw.name);
  if (name === null) return null;
  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    name,
    slug: str(raw.slug) ?? String(raw.id ?? ''),
    order: num(raw.order) ?? 0,
  };
}

const unwrap = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw;
  if (isRecord(raw) && Array.isArray(raw.data)) return raw.data;
  return [];
};

export const normalizeProducts = (raw: unknown): Product[] =>
  unwrap(raw).map(normalizeProduct)
    .filter((p): p is Product => p !== null);

export const normalizeCategories = (raw: unknown): Category[] =>
  unwrap(raw).map(normalizeCategory)
    .filter((c): c is Category => c !== null)
    .sort((a, b) => a.order - b.order);
