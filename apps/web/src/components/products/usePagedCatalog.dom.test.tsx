import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePagedCatalog } from './usePagedCatalog';

const page = (items: { id: number }[] = []) => ({ items, page: 1, pageCount: items.length ? 1 : 0, total: items.length });
const response = (items: { id: number }[] = []) => ({ ok: true, json: async () => page(items) });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('catalogue request states', () => {
  it('revalidates an initial server failure without displaying it before the request', async () => {
    const pending = deferred<ReturnType<typeof response>>();
    vi.stubGlobal('fetch', vi.fn(() => pending.promise));
    const { result } = renderHook(() => usePagedCatalog('/api/catalog?category=2', {
      items: [], page: 0, pageCount: 1, total: 0, error: 'Server unavailable',
    }));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    await act(async () => { pending.resolve(response()); });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(false);
  });

  it('shows loading for a new category, then a successful empty result without an error', async () => {
    const pending = deferred<ReturnType<typeof response>>();
    vi.stubGlobal('fetch', vi.fn(() => pending.promise));
    const { result, rerender } = renderHook(({ url }) => usePagedCatalog(url, page([{ id: 1 }]), '/api/catalog?category=1'), { initialProps: { url: '/api/catalog?category=1' } });
    rerender({ url: '/api/catalog?category=2' });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    await act(async () => { pending.resolve(response()); });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeUndefined();
    expect(result.current.hasMore).toBe(false);
  });

  it('keeps the error during retry, prevents duplicate requests, and clears it on success', async () => {
    const pending = deferred<ReturnType<typeof response>>();
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false }).mockReturnValueOnce(pending.promise);
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => usePagedCatalog('/api/catalog?category=2'));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    act(() => { result.current.loadMore(); result.current.loadMore(); });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => { pending.resolve(response()); });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });

  it('retries a failed category on return and ignores another category’s late response', async () => {
    const pending = deferred<ReturnType<typeof response>>();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false }).mockReturnValueOnce(pending.promise));
    const { result, rerender } = renderHook(({ url }) => usePagedCatalog(url, page([{ id: 1 }]), '/api/catalog?category=1'), { initialProps: { url: '/api/catalog?category=2' } });
    await waitFor(() => expect(result.current.error).toBeTruthy());
    rerender({ url: '/api/catalog?category=1' });
    rerender({ url: '/api/catalog?category=2' });
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(true);
    rerender({ url: '/api/catalog?category=1' });
    await act(async () => { pending.resolve(response([{ id: 2 }])); });
    expect(result.current.items).toEqual([{ id: 1 }]);
    rerender({ url: '/api/catalog?category=2' });
    expect(result.current.items).toEqual([{ id: 2 }]);
  });
});
