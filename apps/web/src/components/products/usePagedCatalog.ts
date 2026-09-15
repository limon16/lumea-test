'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyPage, type CatalogPage } from '@/lib/catalog';

type Entry<T> = CatalogPage<T> & { loading?: boolean };

// Each category has its own cache and request. Late responses cannot replace
// the currently selected category; desktop and mobile share this hook's state.
export function usePagedCatalog<T extends { id: number }>(url: string, initial?: CatalogPage<T>, initialUrl = url) {
  const cache = useRef<Record<string, Entry<T>>>(initial ? { [initialUrl]: initial } : {});
  const requests = useRef(new Map<string, AbortController>());
  const [entries, setEntries] = useState(cache.current);
  const load = useCallback(async (key: string) => {
    const previous = cache.current[key] ?? emptyPage<T>();
    if (requests.current.has(key) || (previous.page > 0 && previous.page >= previous.pageCount)) return;
    const controller = new AbortController();
    requests.current.set(key, controller);
    const publish = (entry: Entry<T>) => {
      cache.current = { ...cache.current, [key]: entry };
      setEntries(cache.current);
    };
    publish({ ...previous, loading: true, error: undefined });
    try {
      const response = await fetch(`${key}&page=${previous.page + 1}`, { signal: controller.signal });
      if (!response.ok) throw new Error('Unable to load the catalogue. Please try again.');
      const next: CatalogPage<T> = await response.json();
      if (controller.signal.aborted) return;
      const merged = new Map(previous.items.map((item) => [item.id, item]));
      next.items.forEach((item) => merged.set(item.id, item));
      publish({ ...next, items: [...merged.values()], loading: false });
    } catch (error) {
      if (!controller.signal.aborted) publish({ ...previous, loading: false, error: error instanceof Error ? error.message : 'Unable to load products.' });
    } finally {
      if (requests.current.get(key) === controller) requests.current.delete(key);
    }
  }, []);
  useEffect(() => {
    if (!cache.current[url] || (cache.current[url].loading && !requests.current.has(url))) void load(url);
  }, [url, load]);
  useEffect(() => {
    const pending = requests.current;
    return () => { pending.forEach((controller) => controller.abort()); pending.clear(); };
  }, []);
  const entry = entries[url] ?? { ...emptyPage<T>(), loading: true };
  const loadMore = useCallback(() => { void load(url); }, [load, url]);
  return { ...entry, hasMore: entry.page < entry.pageCount, loadMore };
}
