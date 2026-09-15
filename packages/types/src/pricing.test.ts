import { describe, it, expect } from 'vitest';
import {
  resolvePrice, formatPrice, subKey, resolveStock, isInStock,
} from './pricing';
import type { Product } from './product';

const base = (over: Partial<Product> = {}): Product => ({
  id: 1, name: 'Serum', imageUrl: null, imageAlt: null,
  priceMode: 'single', price: 32, discountPercent: null, discountedPrice: null,
  stock: null, badges: [], variations: [], categoryIds: [], ...over,
});

const value = (label: string, over = {}) => ({
  label, priceOverride: null, discountPercent: null,
  discountedPrice: null, stock: null, subLabel: null, subValues: [], ...over,
});

const sub = (label: string, over = {}) => ({
  label, priceOverride: null, discountPercent: null,
  discountedPrice: null, stock: null, ...over,
});

describe('resolvePrice', () => {
  it('повертає базову ціну, коли знижки немає', () => {
    expect(resolvePrice(base(), {})).toEqual({
      base: 32, final: 32, hasDiscount: false, discountPercent: null,
    });
  });

  it('застосовує відсоткову знижку товару', () => {
    expect(resolvePrice(base({ discountPercent: 15 }), {})).toEqual({
      base: 32, final: 27.2, hasDiscount: true, discountPercent: 15,
    });
  });

  it('обчислює відсоток зі знижененої ціни', () => {
    const r = resolvePrice(base({ price: 40, discountedPrice: 30 }), {});
    expect(r.final).toBe(30);
    expect(r.discountPercent).toBe(25);
  });

  it('віддає пріоритет discountPercent, коли задані обидва поля', () => {
    const r = resolvePrice(
      base({ discountPercent: 10, discountedPrice: 5 }), {});
    expect(r.final).toBe(28.8);
    expect(r.discountPercent).toBe(10);
  });

  it('бере priceOverride обраного значення як базу', () => {
    const p = base({ variations: [{ label: 'Size',
      values: [value('30 ml'), value('50 ml', { priceOverride: 48 })] }] });
    expect(resolvePrice(p, { Size: '50 ml' }).base).toBe(48);
  });

  it('застосовує знижку обраного значення', () => {
    const p = base({ variations: [{ label: 'Size',
      values: [value('30 ml'), value('50 ml', { discountPercent: 10 })] }] });
    const r = resolvePrice(p, { Size: '50 ml' });
    expect(r.final).toBeCloseTo(28.8, 2);
    expect(r.discountPercent).toBe(10);
  });

  it('не застосовує знижку до значення без неї', () => {
    const p = base({ variations: [{ label: 'Size',
      values: [value('30 ml'), value('50 ml', { discountPercent: 10 })] }] });
    expect(resolvePrice(p, { Size: '30 ml' }).hasDiscount).toBe(false);
  });

  it('знижка значення перекриває знижку товару', () => {
    const p = base({ discountPercent: 15, variations: [{ label: 'Size',
      values: [value('50 ml', { discountPercent: 10 })] }] });
    expect(resolvePrice(p, { Size: '50 ml' }).discountPercent).toBe(10);
  });

  it('падає назад на знижку товару, коли у значення її немає', () => {
    const p = base({ discountPercent: 15, variations: [{ label: 'Size',
      values: [value('30 ml')] }] });
    expect(resolvePrice(p, { Size: '30 ml' }).discountPercent).toBe(15);
  });

  it('обирає максимальну знижку з кількох груп', () => {
    const p = base({ variations: [
      { label: 'Size', values: [value('50 ml', { discountPercent: 10 })] },
      { label: 'Skin type', values: [value('Dry', { discountPercent: 20 })] },
    ] });
    const r = resolvePrice(p, { Size: '50 ml', 'Skin type': 'Dry' });
    expect(r.discountPercent).toBe(20);
  });

  it('без вибору бере перше значення кожної групи', () => {
    const p = base({ variations: [{ label: 'Size',
      values: [value('30 ml', { priceOverride: 20 }), value('50 ml')] }] });
    expect(resolvePrice(p, {}).base).toBe(20);
  });

  it('ігнорує неіснуючий вибір', () => {
    const p = base({ variations: [{ label: 'Size',
      values: [value('30 ml')] }] });
    expect(resolvePrice(p, { Size: 'нема такого' }).base).toBe(32);
  });

  it('ігнорує від\'ємну discountedPrice з CMS (некоректні дані)', () => {
    const r = resolvePrice(base({ price: 20, discountedPrice: -5 }), {});
    expect(r).toEqual({
      base: 20, final: 20, hasDiscount: false, discountPercent: null,
    });
  });

  it('ігнорує discountedPrice, що перевищує базову ціну (регресія)', () => {
    const r = resolvePrice(base({ price: 20, discountedPrice: 25 }), {});
    expect(r).toEqual({
      base: 20, final: 20, hasDiscount: false, discountPercent: null,
    });
  });

  it('коректно обробляє нульову ціну без ділення на нуль', () => {
    const r = resolvePrice(base({ price: 0, discountedPrice: null }), {});
    expect(r).toEqual({
      base: 0, final: 0, hasDiscount: false, discountPercent: null,
    });
  });
});

describe('resolvePrice — режим byVariation', () => {
  /** Товар продається в кількох ємностях: ціна живе тільки у варіантах. */
  const byVolume = (over = {}) => base({
    priceMode: 'byVariation', price: null,
    variations: [{ label: 'Size', values: [
      value('50 ml', { priceOverride: 28 }),
      value('100 ml', { priceOverride: 52 }),
    ] }],
    ...over,
  });

  it('бере ціну обраної ємності', () => {
    expect(resolvePrice(byVolume(), { Size: '100 ml' }).base).toBe(52);
    expect(resolvePrice(byVolume(), { Size: '50 ml' }).base).toBe(28);
  });

  it('знижка на одну ємність не зачіпає іншу', () => {
    const p = base({
      priceMode: 'byVariation', price: null,
      variations: [{ label: 'Size', values: [
        value('50 ml', { priceOverride: 28, discountPercent: 10 }),
        value('100 ml', { priceOverride: 52 }),
      ] }],
    });
    const small = resolvePrice(p, { Size: '50 ml' });
    expect(small.final).toBeCloseTo(25.2, 2);
    expect(small.discountPercent).toBe(10);

    const large = resolvePrice(p, { Size: '100 ml' });
    expect(large.hasDiscount).toBe(false);
    expect(large.final).toBe(52);
  });

  it('знижку можна перенести на іншу ємність без зміни коду', () => {
    const tomorrow = base({
      priceMode: 'byVariation', price: null,
      variations: [{ label: 'Size', values: [
        value('50 ml', { priceOverride: 28 }),
        value('100 ml', { priceOverride: 52, discountPercent: 25 }),
      ] }],
    });
    expect(resolvePrice(tomorrow, { Size: '50 ml' }).hasDiscount).toBe(false);
    expect(resolvePrice(tomorrow, { Size: '100 ml' }).final).toBe(39);
  });

  it('рахує відсоток зі знижененої ціни варіанта', () => {
    const p = base({
      priceMode: 'byVariation', price: null,
      variations: [{ label: 'Size', values: [
        value('100 ml', { priceOverride: 52, discountedPrice: 39 }),
      ] }],
    });
    const r = resolvePrice(p, { Size: '100 ml' });
    expect(r.discountPercent).toBe(25);
    expect(r.final).toBe(39);
  });

  it('ігнорує товарну знижку — у цьому режимі її в CMS немає', () => {
    const p = byVolume({ discountPercent: 40 });
    expect(resolvePrice(p, { Size: '50 ml' }).hasDiscount).toBe(false);
  });
});

describe('resolvePrice — вкладені варіації', () => {
  /**
   * Dry існує лише в 40 ml, Normal — у 50 і 100 ml.
   * Неможливої комбінації Dry + 50 ml у даних просто немає.
   */
  const tree = (over = {}) => base({
    priceMode: 'byVariation', price: null,
    variations: [{ label: 'Skin type', values: [
      value('Dry', { subLabel: 'Size', subValues: [
        sub('40 ml', { priceOverride: 24 }),
      ] }),
      value('Normal', { subLabel: 'Size', subValues: [
        sub('50 ml', { priceOverride: 28 }),
        sub('100 ml', { priceOverride: 52 }),
      ] }),
    ] }],
    ...over,
  });

  it('бере ціну вкладеного варіанта', () => {
    const r = resolvePrice(tree(), {
      'Skin type': 'Normal',
      [subKey('Skin type', 'Normal')]: '100 ml',
    });
    expect(r.base).toBe(52);
  });

  it('без вибору бере перший вкладений варіант свого значення', () => {
    expect(resolvePrice(tree(), { 'Skin type': 'Dry' }).base).toBe(24);
    expect(resolvePrice(tree(), { 'Skin type': 'Normal' }).base).toBe(28);
  });

  it('знижка на одну комбінацію не зачіпає сусідню', () => {
    const p = base({
      priceMode: 'byVariation', price: null,
      variations: [{ label: 'Skin type', values: [
        value('Normal', { subLabel: 'Size', subValues: [
          sub('50 ml', { priceOverride: 28, discountPercent: 10 }),
          sub('100 ml', { priceOverride: 52 }),
        ] }),
      ] }],
    });
    const small = resolvePrice(p, {
      'Skin type': 'Normal', [subKey('Skin type', 'Normal')]: '50 ml',
    });
    expect(small.final).toBeCloseTo(25.2, 2);
    expect(small.discountPercent).toBe(10);

    const large = resolvePrice(p, {
      'Skin type': 'Normal', [subKey('Skin type', 'Normal')]: '100 ml',
    });
    expect(large.hasDiscount).toBe(false);
  });

  it('ціна вкладеного варіанта перекриває ціну свого значення', () => {
    const p = base({
      priceMode: 'byVariation', price: null,
      variations: [{ label: 'Skin type', values: [
        value('Dry', { priceOverride: 30, subLabel: 'Size', subValues: [
          sub('40 ml', { priceOverride: 24 }),
        ] }),
      ] }],
    });
    expect(resolvePrice(p, { 'Skin type': 'Dry' }).base).toBe(24);
  });

  it('падає назад на ціну значення, коли у вкладеного її немає', () => {
    const p = base({
      priceMode: 'byVariation', price: null,
      variations: [{ label: 'Skin type', values: [
        value('Dry', { priceOverride: 30, subLabel: 'Size', subValues: [
          sub('40 ml'),
        ] }),
      ] }],
    });
    expect(resolvePrice(p, { 'Skin type': 'Dry' }).base).toBe(30);
  });

  it('знижка значення діє, коли у вкладеного своєї немає', () => {
    const p = base({
      priceMode: 'byVariation', price: null,
      variations: [{ label: 'Skin type', values: [
        value('Dry', { discountPercent: 20, subLabel: 'Size', subValues: [
          sub('40 ml', { priceOverride: 30 }),
        ] }),
      ] }],
    });
    const r = resolvePrice(p, { 'Skin type': 'Dry' });
    expect(r.discountPercent).toBe(20);
    expect(r.final).toBe(24);
  });
});

describe('resolveStock / isInStock', () => {
  it('без обліку вважає товар доступним', () => {
    expect(resolveStock(base(), {})).toBeNull();
    expect(isInStock(base(), {})).toBe(true);
  });

  it('читає залишок товару без варіацій', () => {
    expect(resolveStock(base({ stock: 3 }), {})).toBe(3);
    expect(isInStock(base({ stock: 0 }), {})).toBe(false);
  });

  it('бере залишок обраної комбінації', () => {
    const p = base({
      priceMode: 'byVariation', price: null, stock: 99,
      variations: [{ label: 'Skin type', values: [
        value('Dry', { subLabel: 'Size', subValues: [
          sub('40 ml', { priceOverride: 24, stock: 0 }),
        ] }),
        value('Normal', { subLabel: 'Size', subValues: [
          sub('50 ml', { priceOverride: 32, stock: 5 }),
        ] }),
      ] }],
    });
    expect(isInStock(p, { 'Skin type': 'Dry' })).toBe(false);
    expect(isInStock(p, { 'Skin type': 'Normal' })).toBe(true);
    expect(resolveStock(p, { 'Skin type': 'Normal' })).toBe(5);
  });

  it('падає назад на залишок значення, коли у вкладеного його немає', () => {
    const p = base({
      variations: [{ label: 'Skin type', values: [
        value('Dry', { stock: 2, subLabel: 'Size', subValues: [sub('40 ml')] }),
      ] }],
    });
    expect(resolveStock(p, { 'Skin type': 'Dry' })).toBe(2);
  });

  it('падає назад на залишок товару, коли варіанти його не ведуть', () => {
    const p = base({
      stock: 7,
      variations: [{ label: 'Size', values: [value('30 ml')] }],
    });
    expect(resolveStock(p, { Size: '30 ml' })).toBe(7);
  });
});

describe('formatPrice', () => {
  it('форматує з фунтом і двома знаками', () => {
    expect(formatPrice(27.2)).toBe('£27.20');
  });
});
