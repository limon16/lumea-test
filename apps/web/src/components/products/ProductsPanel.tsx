'use client';

import type { Category, Product } from '@lumea/types';

import { ProductCard } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';
import { filterByCategory } from './filterByCategory';

interface Props {
  products: Product[];
  categories: Category[];
  activeId: number;
  onSelect: (id: number) => void;
}

export function ProductsPanel({
  products,
  categories,
  activeId,
  onSelect,
}: Props) {
  const activeCategory = categories.find((c) => c.id === activeId) ?? null;
  const visibleProducts = activeCategory !== null
    ? filterByCategory(products, activeCategory.id)
    : [];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="text-[16px]/[1.2] font-bold text-(--color-ink)">
        {activeCategory !== null ? `Shop ${activeCategory.name}` : 'Shop products'}
      </p>

      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeId={activeId}
          onSelect={onSelect}
        />
      )}

      <div className="min-w-0 overflow-x-auto [scrollbar-width:thin]" style={{ scrollSnapType: 'x proximity' }}>
        {visibleProducts.length > 0 ? (
          <ul className="flex list-none gap-3 pb-2">
            {visibleProducts.map((product) => (
              <li key={product.id} className="flex shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="flex min-h-[420px] w-full items-center justify-center rounded-(--radius-md)
                       bg-(--color-surface) px-6 text-center text-[16px]/[1.4] font-medium
                       text-(--color-muted)"
          >
            {}
            {categories.length === 0 || products.length === 0
              ? 'Products are unavailable right now. Please check back later.'
              : 'No products in this category yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
