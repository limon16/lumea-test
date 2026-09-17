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
  const [activeUrl, setActiveUrl] = useState<string | null>(initial?.error ? null : url);
  const load = useCallback(async (key: string, retry = false) => {
    const previous = cache.current[key] ?? emptyPage<T>();
    if (requests.current.has(key) || (previous.page > 0 && previous.page >= previous.pageCount)) return;
    const controller = new AbortController();
    requests.current.set(key, controller);
    const startedAt = Date.now();
    const publish = (entry: Entry<T>) => {
      cache.current = { ...cache.current, [key]: entry };
      setEntries(cache.current);
    };
    publish({ ...previous, loading: true, error: retry ? previous.error : undefined });
    try {
      const response = await fetch(`${key}&page=${previous.page + 1}`, { signal: controller.signal });
      if (!response.ok) throw new Error('Unable to load the catalogue. Please try again.');
      const next: CatalogPage<T> = await response.json();
      if (controller.signal.aborted) return;
      if (next.error) throw new Error(next.error);
      const merged = new Map(previous.items.map((item) => [item.id, item]));
      next.items.forEach((item) => merged.set(item.id, item));
      // Keep a fast empty response from flashing the initial loader.
      const remaining = 300 - (Date.now() - startedAt);
      if (merged.size === 0 && remaining > 0) {
        await new Promise<void>((resolve) => {
          const finish = () => {
            clearTimeout(timer);
            controller.signal.removeEventListener('abort', finish);
            resolve();
          };
          const timer = setTimeout(finish, remaining);
          controller.signal.addEventListener('abort', finish, { once: true });
        });
      }
      if (controller.signal.aborted) return;
      publish({ ...next, items: [...merged.values()], loading: false });
    } catch (error) {
      if (!controller.signal.aborted) publish({ ...previous, loading: false, error: error instanceof Error ? error.message : 'Unable to load products.' });
    } finally {
      if (requests.current.get(key) === controller) requests.current.delete(key);
    }
  }, []);
  useEffect(() => {
    const changed = activeUrl !== url;
    if (changed) setActiveUrl(url);
    const cached = cache.current[url];
    if (!cached || (changed && cached.error) || (cached.loading && !requests.current.has(url))) void load(url);
  }, [url, load, activeUrl]);
  useEffect(() => {
    const pending = requests.current;
    return () => { pending.forEach((controller) => controller.abort()); pending.clear(); };
  }, []);
  const cached = entries[url];
  // Do not briefly display an old failure before the category's new request starts.
  const entry = cached && !(activeUrl !== url && cached.error)
    ? cached : { ...emptyPage<T>(), loading: true };
  const loadMore = useCallback(() => { void load(url, true); }, [load, url]);
  return { ...entry, hasMore: entry.page < entry.pageCount, loadMore };
}
