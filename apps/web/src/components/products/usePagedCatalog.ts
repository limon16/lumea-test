'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { emptyPage, type CatalogPage } from '@/lib/catalog';

type Entry<T> = CatalogPage<T> & { loading?: boolean };

// У кожної категорії власний кеш і запит: пізня відповідь не підмінить
// вибрану категорію. Desktop і mobile працюють з одним станом хука.
export function usePagedCatalog<T extends { id: number }>(url: string, initial?: CatalogPage<T>, initialUrl = url) {
  const [entries, setEntries] = useState<Record<string, Entry<T>>>(() => initial ? { [initialUrl]: initial } : {});
  const cache = useRef(entries);
  const requests = useRef(new Map<string, AbortController>());
  // Останній url, для якого вже вирішено, чи потрібен запит. Початкова
  // серверна помилка має перевірятися заново, тому не вважається вирішеною.
  const decidedUrl = useRef<string | null>(initial?.error ? null : url);
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
      // Швидка порожня відповідь не має блимати початковим лоадером.
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
      if (retry && previous.error) window.dispatchEvent(new Event('lumea:catalog-recovered'));
    } catch (error) {
      if (!controller.signal.aborted) publish({ ...previous, loading: false, error: error instanceof Error ? error.message : 'Unable to load products.' });
    } finally {
      if (requests.current.get(key) === controller) requests.current.delete(key);
    }
  }, []);
  // Layout-ефект: стан «завантаження» публікується до першого кадру, тож
  // стара помилка категорії не встигає промайнути перед новим запитом.
  useLayoutEffect(() => {
    const changed = decidedUrl.current !== url;
    decidedUrl.current = url;
    const cached = cache.current[url];
    if (!cached || (changed && cached.error) || (cached.loading && !requests.current.has(url))) void load(url);
  }, [url, load]);
  useEffect(() => {
    const pending = requests.current;
    return () => { pending.forEach((controller) => controller.abort()); pending.clear(); };
  }, []);
  const entry = entries[url] ?? { ...emptyPage<T>(), loading: true };
  const loadMore = useCallback(() => { void load(url, true); }, [load, url]);
  return { ...entry, hasMore: entry.page < entry.pageCount, loadMore };
}
