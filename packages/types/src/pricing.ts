import type { Priced, Product, VariationValue } from './product';

export interface PriceResult {
  base: number;
  final: number;
  hasDiscount: boolean;
  discountPercent: number | null;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export const subKey = (groupLabel: string, valueLabel: string): string =>
  `${groupLabel}>${valueLabel}`;

function selectedValues(
  product: Product,
  selected: Record<string, string>,
): { group: string; value: VariationValue }[] {
  return product.variations
    .map((group) => {
      const match = group.values.find((v) => v.label === selected[group.label]);
      const value = match ?? group.values[0];
      return value === undefined ? null : { group: group.label, value };
    })
    .filter((v): v is { group: string; value: VariationValue } => v !== null);
}

function activeSources(
  product: Product,
  selected: Record<string, string>,
): Priced[] {
  return selectedValues(product, selected).flatMap(({ group, value }) => {
    if (value.subValues.length === 0) return [value];
    const chosenLabel = selected[subKey(group, value.label)];
    const sub = value.subValues.find((s) => s.label === chosenLabel)
      ?? value.subValues[0];
    return sub === undefined ? [value] : [sub, value];
  });
}

const clampPercent = (percent: number): number =>
  Math.min(100, Math.max(0, percent));

type Discountable = Pick<Priced, 'discountPercent' | 'discountedPrice'>;

function percentOf(source: Discountable, base: number): number | null {
  if (source.discountPercent !== null && source.discountPercent > 0) {
    return clampPercent(source.discountPercent);
  }
  if (source.discountedPrice !== null && source.discountedPrice >= 0
      && base > 0 && source.discountedPrice < base) {
    return clampPercent((1 - source.discountedPrice / base) * 100);
  }
  return null;
}

export function resolvePrice(
  product: Product,
  selected: Record<string, string>,
): PriceResult {
  const sources = activeSources(product, selected);

  const override = sources.find((s) => s.priceOverride !== null);
  const base = override?.priceOverride ?? product.price ?? 0;

  const fromSources = sources
    .map((s) => percentOf(s, base))
    .filter((p): p is number => p !== null);

  const productPercent = product.priceMode === 'single'
    ? percentOf(product, base)
    : null;

  const percent = fromSources.length > 0
    ? Math.max(...fromSources)
    : productPercent;

  if (percent === null || percent <= 0) {
    return { base, final: base, hasDiscount: false, discountPercent: null };
  }

  return {
    base,
    final: Math.max(0, round2(base * (1 - percent / 100))),
    hasDiscount: true,
    discountPercent: Math.round(percent),
  };
}

export function formatPrice(value: number): string {
  return `£${Math.round(value).toString()}`;
}

export function resolveStock(
  product: Product,
  selected: Record<string, string>,
): number | null {
  const source = activeSources(product, selected)
    .find((s) => s.stock !== null);
  return source?.stock ?? product.stock;
}

export function isInStock(
  product: Product,
  selected: Record<string, string>,
): boolean {
  const stock = resolveStock(product, selected);
  return stock === null || stock > 0;
}
