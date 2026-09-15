'use client';

import type { Category, Product } from '@lumea/types';
import { CatalogContent } from './CatalogContent';
import type { LoadMoreProps } from './LoadMore';

interface Props {
  products: Product[];
  categories: Category[];
  activeId: number;
  onSelect: (id: number) => void;
  productPagination?: LoadMoreProps;
  categoryPagination?: LoadMoreProps;
}

export function ProductsPanel({ products, categories, activeId, onSelect, productPagination, categoryPagination }: Props) {
  const category = categories.find((item) => item.id === activeId);
  return (
    <div id="shop-products" className="flex w-full min-w-0 max-w-full flex-col gap-3">
      <h3 className="text-[16px]/[1.1] font-bold text-(--color-ink)">
        {category ? `Shop ${category.name}` : 'Shop products'}
      </h3>
      <CatalogContent products={products} categories={categories} activeId={activeId}
        onSelect={onSelect} productPagination={productPagination} categoryPagination={categoryPagination} />
    </div>
  );
}
