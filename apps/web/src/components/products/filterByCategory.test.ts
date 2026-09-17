import { describe, expect, it } from 'vitest';
import type { Product } from '@lumea/types';

import { filterByCategory } from './filterByCategory';

const product = (id: number, categoryIds: number[]): Product => ({
  id,
  name: `Product ${id}`,
  volumeMode: 'single',
  volume: '30 ml',
  priceMode: 'single',
  stock: null,
  imageUrl: null,
  imageAlt: null,
  price: 100,
  discountPercent: null,
  discountedPrice: null,
  badges: [],
  variations: [],
  categoryIds,
});

describe('filterByCategory', () => {
  it('includes a product tagged with several categories in every one of them', () => {
    const products = [product(1, [10, 20]), product(2, [20])];

    expect(filterByCategory(products, 10)).toEqual([products[0]]);
    expect(filterByCategory(products, 20)).toEqual(products);
  });

  it('returns an empty list for a category no product is tagged with', () => {
    const products = [product(1, [10]), product(2, [10])];

    expect(filterByCategory(products, 999)).toEqual([]);
  });

  it('returns an empty list when the active category id matches nothing (unknown category)', () => {
    const products = [product(1, [10]), product(2, [30])];

    expect(filterByCategory(products, 20)).toEqual([]);
  });

  it('returns an empty list when there are no products at all (e.g. Strapi unreachable)', () => {
    expect(filterByCategory([], 10)).toEqual([]);
  });

  it('excludes a product that is not tagged with the active category, even if tagged with others', () => {
    const products = [product(1, [10, 20]), product(2, [30])];

    expect(filterByCategory(products, 30)).toEqual([products[1]]);
  });
});
