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
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3">
      <p className="text-[16px]/[1.1] font-bold text-(--color-ink)">
        {activeCategory !== null ? `Shop ${activeCategory.name}` : 'Shop products'}
      </p>

      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeId={activeId}
          onSelect={onSelect}
        />
      )}

      <div
        key={activeId}
        role="region"
        aria-label={activeCategory !== null
          ? `${activeCategory.name} products`
          : 'Products'}
        tabIndex={0}
        className={`${visibleProducts.length > 0 ? '-mt-7' : 'mt-1'} -ml-10 w-[calc(100%+40px)] min-w-0 shrink-0 overflow-x-auto overflow-y-hidden
                   overscroll-x-contain snap-x snap-proximity
                   scroll-px-10 outline-none
                   [&::-webkit-scrollbar]:h-2
                   [&::-webkit-scrollbar-track]:ml-10
                   [&::-webkit-scrollbar-track]:rounded-full
                   [&::-webkit-scrollbar-track]:bg-(--color-surface)
                   [&::-webkit-scrollbar-thumb]:rounded-full
                   [&::-webkit-scrollbar-thumb]:bg-(--color-subtle)`}
      >
        {visibleProducts.length > 0 ? (
          <ul className="flex w-max min-w-full list-none gap-3 px-10 pt-8 pb-3">
            {visibleProducts.map((product) => (
              <li key={product.id} className="flex w-[264px] shrink-0 snap-start">
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
            {categories.length === 0 || products.length === 0
              ? 'Products are unavailable right now. Please check back later.'
              : 'No products in this category yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
