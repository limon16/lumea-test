import type { Category, Product } from '@lumea/types';
import { CategoryTabs } from './CategoryTabs';
import { CatalogState } from './CatalogState';
import { ProductRail } from './ProductRail';
import type { LoadMoreProps } from './LoadMore';

interface Props {
  products: Product[];
  categories: Category[];
  activeId: number;
  onSelect: (id: number) => void;
  productPagination?: LoadMoreProps;
  categoryPagination?: LoadMoreProps;
}

export function CatalogContent({ products, categories, activeId, onSelect, productPagination, categoryPagination }: Props) {
  if (categories.length === 0) {
    return <CatalogState
      state={categoryPagination?.loading ? 'loading' : categoryPagination?.error ? 'unavailable' : 'empty'}
      onRetry={categoryPagination?.error ? categoryPagination.onLoadMore : undefined} />;
  }
  const category = categories.find((item) => item.id === activeId);
  const initialState = products.length === 0 && (productPagination?.loading || productPagination?.error || !productPagination?.hasMore);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <CategoryTabs categories={categories} activeId={activeId} onSelect={onSelect} {...categoryPagination} />
      {initialState ? (
        <div className="mt-1">
          <CatalogState
            state={productPagination?.loading ? 'loading' : productPagination?.error ? 'unavailable' : 'empty'}
            onRetry={productPagination?.error ? productPagination.onLoadMore : undefined} />
        </div>
      ) : (
        <ProductRail key={activeId} products={products}
          label={category ? `${category.name} products` : 'Products'} {...productPagination} />
      )}
    </div>
  );
}
