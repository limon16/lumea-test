export interface CatalogPage<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
  error?: string;
}

export function emptyPage<T>(error?: string): CatalogPage<T> {
  return { items: [], page: 0, pageCount: 1, total: 0, error };
}
