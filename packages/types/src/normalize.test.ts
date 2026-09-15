import { describe, it, expect } from 'vitest';
import { normalizeProduct, normalizeProducts } from './normalize';

const raw = {
  id: 1, name: 'Serum', priceMode: 'single', price: '28.00',
  discountPercent: 15, discountedPrice: null,
  badges: [{ id: 7, name: 'Sale', order: 0 }],
  variations: [{ label: 'Size', values: [
    { label: '30 ml', priceOverride: null,
      discountPercent: null, discountedPrice: null },
  ] }],
  image: { url: '/uploads/a.png', alternativeText: 'Serum' },
  categories: [{ id: 3 }],
};

describe('normalizeProduct', () => {
  it('перетворює повний обʼєкт', () => {
    const p = normalizeProduct(raw)!;
    expect(p.name).toBe('Serum');
    expect(p.price).toBe(28);
    expect(p.badges.map((b) => b.name)).toEqual(['Sale']);
    expect(p.variations[0]!.values[0]!.label).toBe('30 ml');
    expect(p.imageUrl).toBe('/uploads/a.png');
    expect(p.categoryIds).toEqual([3]);
  });

  it('витримує відсутні варіації, badges і зображення', () => {
    const p = normalizeProduct({ id: 2, name: 'Bare', price: 10 })!;
    expect(p.variations).toEqual([]);
    expect(p.badges).toEqual([]);
    expect(p.imageUrl).toBeNull();
    expect(p.priceMode).toBe('single');
  });

  it('повертає null без назви або ціни', () => {
    expect(normalizeProduct({ id: 3, price: 10 })).toBeNull();
    expect(normalizeProduct({ id: 4, name: 'X' })).toBeNull();
    expect(normalizeProduct(null)).toBeNull();
  });

  it('приймає будь-яку назву мітки з CMS і сортує за порядком', () => {
    const p = normalizeProduct({ ...raw, badges: [
      { id: 2, name: 'Limited', order: 5 },
      { id: 1, name: 'Sale', order: 1 },
    ] })!;
    expect(p.badges.map((b) => b.name)).toEqual(['Sale', 'Limited']);
  });

  it('відкидає мітку без назви', () => {
    const p = normalizeProduct({ ...raw,
      badges: [{ id: 1, name: 'Sale' }, { id: 2 }] })!;
    expect(p.badges.map((b) => b.name)).toEqual(['Sale']);
  });

  it('читає режим ціни byVariation і не вимагає базової ціни', () => {
    const p = normalizeProduct({
      id: 8, name: 'Cream', priceMode: 'byVariation', price: null,
      variations: [{ label: 'Size', values: [
        { label: '50 ml', priceOverride: 28 },
        { label: '100 ml', priceOverride: 52 },
      ] }],
    })!;
    expect(p.priceMode).toBe('byVariation');
    expect(p.price).toBeNull();
  });

  it('відкидає byVariation без жодної ціни у варіантах', () => {
    expect(normalizeProduct({
      id: 9, name: 'Broken', priceMode: 'byVariation', price: null,
      variations: [{ label: 'Size', values: [{ label: '50 ml' }] }],
    })).toBeNull();
  });

  it('відкидає групу варіацій без значень', () => {
    const p = normalizeProduct({ ...raw,
      variations: [{ label: 'Empty', values: [] }] })!;
    expect(p.variations).toEqual([]);
  });
});

describe('normalizeProducts', () => {
  it('розгортає обгортку data і відсіює зламані записи', () => {
    const out = normalizeProducts({ data: [raw, { id: 9 }] });
    expect(out).toHaveLength(1);
  });

  it('повертає порожній масив на сміття', () => {
    expect(normalizeProducts(null)).toEqual([]);
    expect(normalizeProducts({})).toEqual([]);
  });
});
