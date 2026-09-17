'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@lumea/types';
import { usePagedCatalog } from './usePagedCatalog';
import { ProductRail } from './ProductRail';
import { CatalogState } from './CatalogState';

export function SearchProducts() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  const results = usePagedCatalog<Product>(`/api/catalog?kind=products&search=${encodeURIComponent(search)}`);
  const loading = query.trim() !== search || results.loading;
  return (
    <div className="search-products flex min-h-0 min-w-0 flex-1 flex-col gap-5 [container-type:size] [--preview-image-height:clamp(0px,calc(100cqh-340px),160px)]">
      <label className="flex shrink-0 flex-col gap-2 font-bold">
        Product name
        <input autoFocus type="search" maxLength={100} value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find your skincare essentials"
          className="w-full rounded-full border border-(--color-border) bg-white px-5 py-4 text-[16px] font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)" />
      </label>
      {loading && results.items.length === 0 || query.trim() !== search ? <CatalogState state="loading" />
        : results.items.length === 0 ? <CatalogState state={results.error ? 'unavailable' : 'empty'} onRetry={results.error ? results.loadMore : undefined} />
        : <ProductRail key={search} products={results.items} label="Search results" preview
            loading={results.loading} error={results.error} hasMore={results.hasMore} onLoadMore={results.loadMore} />}
    </div>
  );
}
