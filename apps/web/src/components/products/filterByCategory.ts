import type { Product } from '@lumea/types';

export function filterByCategory(products: Product[], activeCategoryId: number): Product[] {
  return products.filter((product) => product.categoryIds.includes(activeCategoryId));
}
