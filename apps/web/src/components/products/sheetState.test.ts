import { describe, expect, it } from 'vitest';

import type { Category } from '@lumea/types';

import { initialCategoryId, sheetTitle } from './sheetState';

const category = (id: number, name: string, order: number): Category => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  order,
});

const STEPS = [
  { cta: 'Shop cleansers' },
  { cta: 'Shop treatments' },
  { cta: 'Shop moisturisers' },
  { cta: 'Shop SPF' },
];

describe('initialCategoryId', () => {
  it('picks the first category the CMS returns', () => {
    const categories = [
      category(7, 'Cleansers', 1),
      category(9, 'Face Wash', 2),
    ];
    expect(initialCategoryId(categories)).toBe(7);
  });

  it('falls back to a non-matching id when the catalogue is empty', () => {
    // No category can have id 0, so the sheet renders its empty state
    // instead of highlighting a tab that does not exist.
    expect(initialCategoryId([])).toBe(0);
  });
});

describe('sheetTitle', () => {
  it('uses the CTA of the step that opened the sheet', () => {
    expect(sheetTitle(STEPS, 0)).toBe('Shop cleansers');
    expect(sheetTitle(STEPS, 2)).toBe('Shop moisturisers');
  });

  it('keeps an accessible name when the index is out of range', () => {
    expect(sheetTitle(STEPS, 99)).toBe('Shop products');
    expect(sheetTitle([], 0)).toBe('Shop products');
  });

  it('never returns an empty string', () => {
    for (let i = -1; i < 6; i += 1) {
      expect(sheetTitle(STEPS, i).length).toBeGreaterThan(0);
    }
  });
});
