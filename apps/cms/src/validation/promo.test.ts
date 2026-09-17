import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Core } from '@strapi/strapi';
import { applyPromo, normalizePromo, preparePromo } from './promo';

const active = { code: 'SAVE15', enabled: true, discountPercent: 15, singleUse: false, usedAt: null, minimumSubtotal: 0 };
function cms(promo: Record<string, unknown> | null = active) {
  const writes: unknown[] = [];
  return { writes, strapi: { documents: () => ({
    findMany: async ({ filters }: { filters: { code: string } }) => promo?.code === filters.code ? [promo] : [],
    update: (...args: unknown[]) => { writes.push(args); },
  }) } as unknown as Core.Strapi };
}

test('normalizes user codes and rejects invalid input', () => {
  assert.equal(normalizePromo(' save15 '), 'SAVE15');
  assert.equal(normalizePromo(undefined), '');
  for (const invalid of [12, {}, 'AB', 'A'.repeat(41), 'SAVE 15']) assert.throws(() => normalizePromo(invalid));
});
test('generates a code only when it is blank', () => {
  const data: Record<string, unknown> = { code: '' };
  preparePromo(data);
  assert.match(String(data.code), /^LUMEA-[A-F0-9]{12}$/);
  preparePromo(data);
  const manual = { code: ' custom15 ' };
  preparePromo(manual);
  assert.equal(manual.code, 'CUSTOM15');
});
test('rejects reversed validity dates', () => {
  assert.throws(() => preparePromo({ startsAt: '2030-01-02', expiresAt: '2030-01-01' }));
});
test('no code keeps the original subtotal', async () => {
  assert.deepEqual(await applyPromo(cms().strapi, '', 23.8), { promoCode: null, subtotal: 23.8, total: 23.8, discountAmount: 0 });
});
test('discounts the subtotal and rounds to pennies', async () => {
  assert.deepEqual(await applyPromo(cms().strapi, ' save15 ', 23.8), { promoCode: 'SAVE15', subtotal: 23.8, discountAmount: 3.57, total: 20.23 });
});
for (const [name, overrides] of Object.entries({
  disabled: { enabled: false },
  expired: { expiresAt: '2000-01-01' },
  future: { startsAt: '2999-01-01' },
  used: { singleUse: true, usedAt: '2020-01-01' },
  minimum: { minimumSubtotal: 50 },
  invalidPercent: { discountPercent: 101 },
})) test(`rejects ${name} promo codes`, async () => {
  await assert.rejects(applyPromo(cms({ ...active, ...overrides }).strapi, 'SAVE15', 40));
});
test('rejects nonexistent codes', async () => {
  await assert.rejects(applyPromo(cms(null).strapi, 'MISSING', 100));
});
test('allows the exact minimum subtotal and a free order', async () => {
  const result = await applyPromo(cms({ ...active, minimumSubtotal: 40, discountPercent: 100 }).strapi, 'SAVE15', 40);
  assert.equal(result.total, 0);
});
test('checking an unused single-use code never consumes it', async () => {
  const fixture = cms({ ...active, singleUse: true });
  for (let i = 0; i < 2; i++) assert.equal((await applyPromo(fixture.strapi, 'SAVE15', 100)).total, 85);
  assert.deepEqual(fixture.writes, []);
});
test('a reusable code can be checked repeatedly', async () => {
  const fixture = cms({ ...active, usedAt: '2020-01-01' });
  for (let i = 0; i < 2; i++) assert.equal((await applyPromo(fixture.strapi, 'SAVE15', 100)).total, 85);
});
