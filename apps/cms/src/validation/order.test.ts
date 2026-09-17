import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Core } from '@strapi/strapi';
import { buildOrder, parseOrderInput } from './order';

const unavailable = {
  id: 1,
  documentId: 'unavailable',
  name: 'Unavailable product',
  price: 40,
  stock: 0,
  variations: [],
  categories: [],
  badges: [],
};

const available = {
  id: 2,
  documentId: 'available',
  name: 'Available product',
  price: 20,
  stock: null,
  variations: [],
  categories: [],
  badges: [],
};

const strapi = {
  documents: () => ({
    findMany: async ({ filters }: { filters: { id: number } }) =>
      filters.id === 1 ? [unavailable] : filters.id === 2 ? [available] : [],
  }),
} as unknown as Core.Strapi;

const input = parseOrderInput({
  customerName: 'Quote',
  phone: 'Quote',
  items: [
    { productId: 1, quantity: 1, labels: [] },
    { productId: 2, quantity: 2, labels: [] },
  ],
});

test('quote excludes unavailable products from its total and reports their indexes', async () => {
  const result = await buildOrder(strapi, input, { skipUnavailable: true });
  assert.equal(result.total, 40);
  assert.deepEqual(result.unavailableItems, [{ index: 0, productId: 1 }]);
  assert.equal(result.items.length, 1);
});

test('order creation still rejects a cart containing an unavailable product', async () => {
  await assert.rejects(buildOrder(strapi, input), /доступно лише 0 шт/);
});
