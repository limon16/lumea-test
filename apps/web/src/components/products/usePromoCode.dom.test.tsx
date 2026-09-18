import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Product } from '@lumea/types';
import { usePromoCode } from './usePromoCode';
import { PromoCodeField } from './PromoCodeField';
import type { CartItem } from './shopContext';

const product: Product = { id: 1, name: 'Cleanser', subtitleMode: 'single', subtitle: null, priceMode: 'single', stock: null, imageUrl: null, imageAlt: null, price: 100, discountPercent: null, discountedPrice: null, badges: [], variations: [], categoryIds: [] };
const cart = (quantity = 1): CartItem[] => [{ key: '1', product, selected: {}, quantity, unitPrice: 100, stock: null }];
const response = (total = 85, code: string | null = 'SAVE15', unavailableItems: { index: number; productId: number }[] = []) => ({ ok: true, json: async () => ({ data: { promoCode: code, subtotal: total / .85, discountAmount: total / .85 - total, total, unavailableItems } }) });
function deferred() { let resolve!: (value: ReturnType<typeof response>) => void; const promise = new Promise<ReturnType<typeof response>>(r => { resolve = r; }); return { promise, resolve }; }
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('checks availability immediately, then applies a code using server pricing', async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(response(100, null)).mockResolvedValueOnce(response()); vi.stubGlobal('fetch', fetchMock);
  const { result } = renderHook(() => usePromoCode(cart()));
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).promoCode).toBe('');
  act(() => result.current.apply(' save15 '));
  expect(result.current.pending).toBe(true); expect(result.current.ready).toBe(false);
  await waitFor(() => expect(result.current.quote?.total).toBe(85));
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ promoCode: 'SAVE15', items: [{ productId: 1, labels: [], quantity: 1 }] });
  expect(result.current.ready).toBe(true);
});
it('invalidates the previous quote immediately when quantities change', async () => {
  const pending = deferred();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(100, null)).mockResolvedValueOnce(response()).mockReturnValueOnce(pending.promise));
  const { result, rerender } = renderHook(({ quantity }) => usePromoCode(cart(quantity)), { initialProps: { quantity: 1 } });
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.apply('SAVE15'));
  await waitFor(() => expect(result.current.ready).toBe(true));
  rerender({ quantity: 2 });
  expect(result.current.quote).toBeUndefined(); expect(result.current.ready).toBe(false);
  await act(async () => { pending.resolve(response(170)); });
  expect(result.current.quote?.total).toBe(170);
});
it('ignores a late response from a replaced code', async () => {
  const pending = deferred();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(100, null)).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(response(80, 'NEWCODE')));
  const { result } = renderHook(() => usePromoCode(cart()));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.apply('SAVE15')); act(() => result.current.apply('NEWCODE'));
  await waitFor(() => expect(result.current.quote?.promoCode).toBe('NEWCODE'));
  await act(async () => { pending.resolve(response()); });
  expect(result.current.quote?.promoCode).toBe('NEWCODE');
});
it('rejects invalid codes and allows retrying the same code', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(100, null)).mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Expired' }) }).mockResolvedValueOnce(response()));
  const { result } = renderHook(() => usePromoCode(cart()));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.apply('SAVE15'));
  await waitFor(() => expect(result.current.error).toBe('Expired'));
  expect(result.current.ready).toBe(false);
  act(() => result.current.apply('SAVE15'));
  await waitFor(() => expect(result.current.quote?.total).toBe(85));
  expect(result.current.error).toBeUndefined();
});
it('removing a pending code ignores its response and enables normal checkout', async () => {
  const pending = deferred(); vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(100, null)).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(response(100, null)));
  const { result } = renderHook(() => usePromoCode(cart()));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.apply('SAVE15')); act(() => result.current.remove());
  await act(async () => { pending.resolve(response()); });
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.quote?.promoCode).toBeNull(); expect(result.current.code).toBe('');
});
it('handles network failures without leaving checkout pending', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(100, null)).mockRejectedValueOnce(new Error('offline')));
  const { result } = renderHook(() => usePromoCode(cart()));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => result.current.apply('SAVE15'));
  await waitFor(() => expect(result.current.error).toContain('Could not check'));
  expect(result.current.pending).toBe(false); expect(result.current.ready).toBe(false);
});
it('excludes unavailable products and blocks checkout until they are removed', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(0, null, [{ index: 0, productId: 1 }])).mockResolvedValueOnce(response(0, 'SAVE15', [{ index: 0, productId: 1 }])));
  const { result } = renderHook(() => usePromoCode(cart()));
  await waitFor(() => expect(result.current.pending).toBe(false));
  expect(result.current.quote?.total).toBe(0);
  expect(result.current.unavailableIndexes.has(0)).toBe(true);
  expect(result.current.ready).toBe(false);
  act(() => result.current.apply('SAVE15'));
  await waitFor(() => expect(result.current.quote?.promoCode).toBe('SAVE15'));
  expect(result.current.ready).toBe(false);
});

it('preserves displayed amounts and unavailable items during validation and errors', async () => {
  let reject!: (error: Error) => void;
  const pending = new Promise<never>((_, fail) => { reject = fail; });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(0, null, [{ index: 0, productId: 1 }])).mockReturnValueOnce(pending));
  const { result } = renderHook(() => usePromoCode(cart()));
  await waitFor(() => expect(result.current.pending).toBe(false));
  act(() => result.current.apply('SAVE15'));
  expect(result.current.displayQuote?.total).toBe(0);
  expect(result.current.unavailableIndexes.has(0)).toBe(true);
  expect(result.current.ready).toBe(false);
  await act(async () => { reject(new Error('Offline')); });
  expect(result.current.displayQuote?.total).toBe(0);
  expect(result.current.unavailableIndexes.has(0)).toBe(true);
});

it('ignores duplicate submissions both during and after applying a code', async () => {
  const pending = deferred();
  const fetchMock = vi.fn().mockResolvedValueOnce(response(100, null)).mockReturnValueOnce(pending.promise);
  vi.stubGlobal('fetch', fetchMock);
  const { result } = renderHook(() => usePromoCode(cart()));
  await waitFor(() => expect(result.current.ready).toBe(true));
  act(() => { result.current.apply('SAVE15'); result.current.apply(' save15 '); });
  act(() => result.current.apply('SAVE15'));
  expect(fetchMock).toHaveBeenCalledTimes(2);
  await act(async () => { pending.resolve(response()); });
  act(() => result.current.apply('SAVE15'));
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(result.current.applied).toBe(true);
});

it('replaces Apply with Remove and locks the confirmed code until removal', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(100, null)).mockResolvedValueOnce(response()).mockResolvedValueOnce(response(100, null)));
  function Field() { const promo = usePromoCode(cart()); return <PromoCodeField promo={promo} />; }
  render(<Field />);
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Checking promo code' })).toBeNull());
  const input = screen.getByLabelText('Promo code') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'save15' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  await screen.findByRole('button', { name: 'Remove' });
  expect(screen.queryByRole('button', { name: 'Apply' })).toBeNull();
  expect(input.readOnly).toBe(true);
  expect(input.value).toBe('SAVE15');
  fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
  await screen.findByRole('button', { name: 'Apply' });
  expect(input.readOnly).toBe(false);
  expect(input.value).toBe('');
});
