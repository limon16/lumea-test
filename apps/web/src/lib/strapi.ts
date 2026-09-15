import { emptyPage, type CatalogPage } from './catalog';
import {
  normalizeCategories, normalizeProducts,
  type Category, type Product,
} from '@lumea/types';

const BASE = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://127.0.0.1:1337';

async function fetchJson(path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${process.env.STRAPI_URL ?? BASE}/api${path}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getProductPage(page = 1, categoryId?: number, search = ''): Promise<CatalogPage<Product>> {
  const params = new URLSearchParams({
    'pagination[page]': String(page), 'pagination[pageSize]': '12',
    'sort[0]': 'id:asc', 'populate[image]': 'true',
    'populate[badges]': 'true', 'populate[categories]': 'true',
    'populate[variations][populate][values][populate][subValues]': 'true',
  });
  if (categoryId !== undefined) params.set('filters[categories][id][$eq]', String(categoryId));
  if (search.trim()) params.set('filters[name][$containsi]', search.trim());
  return paged(await fetchJson(`/products?${params}`), normalizeProducts, page);
}

export async function getCategoryPage(page = 1): Promise<CatalogPage<Category>> {
  return paged(await fetchJson(`/categories?sort[0]=order:asc&sort[1]=id:asc&pagination[page]=${page}&pagination[pageSize]=12`), normalizeCategories, page);
}

function paged<T>(json: unknown, normalize: (value: unknown) => T[], page: number): CatalogPage<T> {
  if (json === null) return emptyPage('The catalogue is unavailable. Please try again.');
  const pagination = (json as { meta?: { pagination?: { pageCount?: number; total?: number } } }).meta?.pagination;
  const items = normalize(json);
  return { items, page, pageCount: pagination?.pageCount ?? page, total: pagination?.total ?? items.length };
}

export async function getAnnouncements(): Promise<string[]> {
  const json = await fetchJson('/announcement-bar?populate=messages');
  const data = (json as { data?: { messages?: unknown } } | null)?.data;
  const list = Array.isArray(data?.messages) ? data.messages : [];
  return list
    .map((m) => (m && typeof m === 'object'
      ? (m as { text?: unknown; order?: unknown }) : null))
    .filter((m): m is { text: string; order?: number } =>
      m !== null && typeof m.text === 'string' && m.text.trim() !== '')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((m) => m.text);
}

export function strapiMedia(url: string | null): string | null {
  if (url === null) return null;
  return url.startsWith('http') ? url : `${BASE}${url}`;
}
