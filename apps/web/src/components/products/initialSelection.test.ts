import { describe, expect, it } from 'vitest';
import type { Variation } from '@lumea/types';

import { initialSelection } from './initialSelection';

const value = (label: string, over = {}) => ({
  label,
  imageUrl: null,
  priceOverride: null,
  discountPercent: null,
  discountedPrice: null,
  stock: null,
  subLabel: null,
  subValues: [],
  ...over,
});

const sub = (label: string) => ({
  label,
  priceOverride: null,
  discountPercent: null,
  discountedPrice: null,
  stock: null,
});

describe('initialSelection', () => {
  it('picks the first value of each group', () => {
    const variations: Variation[] = [
      { label: 'Skin type', values: [value('Dry'), value('Oily')] },
      { label: 'Size', values: [value('30 ml'), value('50 ml'), value('100 ml')] },
    ];

    expect(initialSelection(variations)).toEqual({
      'Skin type': 'Dry',
      Size: '30 ml',
    });
  });

  it('returns an empty map for a product without variations', () => {
    expect(initialSelection([])).toEqual({});
  });

  it('skips a group whose values array is empty rather than storing undefined', () => {
    const variations: Variation[] = [
      { label: 'Size', values: [] },
      { label: 'Skin type', values: [value('Dry')] },
    ];

    const result = initialSelection(variations);
    expect(result).toEqual({ 'Skin type': 'Dry' });
    expect(Object.prototype.hasOwnProperty.call(result, 'Size')).toBe(false);
  });

  it('does not hardcode group names — works with arbitrary CMS labels', () => {
    const variations: Variation[] = [
      { label: 'Choose formula', values: [value('Gel')] },
      { label: 'Fragrance', values: [value('Unscented'), value('Rose')] },
    ];

    expect(initialSelection(variations)).toEqual({
      'Choose formula': 'Gel',
      Fragrance: 'Unscented',
    });
  });

  it('seeds the first nested option of every value', () => {
    const variations: Variation[] = [
      { label: 'Skin type', values: [
        value('Dry', { subLabel: 'Size', subValues: [sub('40 ml')] }),
        value('Normal', { subLabel: 'Size', subValues: [sub('50 ml'), sub('100 ml')] }),
      ] },
    ];

    expect(initialSelection(variations)).toEqual({
      'Skin type': 'Dry',
      'Skin type>Dry': '40 ml',
      'Skin type>Normal': '50 ml',
    });
  });

  it('keeps groups independent — one groups first value does not leak into another', () => {
    const variations: Variation[] = [
      { label: 'A', values: [value('A1'), value('A2')] },
      { label: 'B', values: [value('B1'), value('B2')] },
    ];

    const result = initialSelection(variations);
    expect(result.A).toBe('A1');
    expect(result.B).toBe('B1');
  });
});
