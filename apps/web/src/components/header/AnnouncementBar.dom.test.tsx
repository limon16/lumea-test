import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnnouncementBar } from './AnnouncementBar';
import { usePagedCatalog } from '../products/usePagedCatalog';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('announcement recovery', () => {
  it('reserves space and reloads only after a successful manual catalogue retry', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 1 }], page: 1, pageCount: 1, total: 1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ['Get 15% off'] });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<AnnouncementBar messages={[]} />);
    expect(container.firstElementChild?.classList.contains('min-h-11')).toBe(true);
    expect(container.firstElementChild?.classList.contains('invisible')).toBe(true);
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const { result } = renderHook(() => usePagedCatalog('/api/catalog?kind=products'));
    await act(async () => {});
    expect(result.current.error).toBeTruthy();
    await act(async () => { result.current.loadMore(); });
    expect(result.current.error).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(screen.queryByText('Get 15% off')).toBeNull();
    await act(async () => { result.current.loadMore(); });
    expect(result.current.error).toBeUndefined();
    expect(screen.getByText('Get 15% off')).toBeTruthy();
    expect(container.firstElementChild?.classList.contains('invisible')).toBe(false);
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('stops requesting after a successful empty response', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<AnnouncementBar messages={[]} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    await act(async () => { window.dispatchEvent(new Event('lumea:catalog-recovered')); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(container.firstElementChild?.classList.contains('invisible')).toBe(true);
  });

  it('cancels a pending request on unmount', async () => {
    const fetchMock = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    const { unmount } = render(<AnnouncementBar messages={[]} />);
    const signal = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].signal;
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('does not retry network failures automatically and removes the listener on unmount', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);
    const { unmount } = render(<AnnouncementBar messages={['Existing offer']} />);
    await act(async () => {});
    expect(screen.getByText('Existing offer')).toBeTruthy();
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    unmount();
    window.dispatchEvent(new Event('lumea:catalog-recovered'));
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
