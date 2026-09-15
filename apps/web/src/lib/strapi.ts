import {
  normalizeCategories, normalizeProducts,
  type Category, type Product,
} from '@lumea/types';

const BASE = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://127.0.0.1:1337';

async function fetchJson(path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${BASE}/api${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  const json = await fetchJson('/products?populate[image]=true'
    + '&populate[badges]=true&populate[categories]=true'
    + '&populate[variations][populate][values][populate][subValues]=true');
  return normalizeProducts(json);
}

export async function getCategories(): Promise<Category[]> {
  const json = await fetchJson('/categories?sort=order:asc');
  return normalizeCategories(json);
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
