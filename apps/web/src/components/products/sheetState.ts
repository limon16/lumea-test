import type { Category } from '@lumea/types';

export const DESKTOP_QUERY = '(min-width: 1024px)';

export function initialCategoryId(categories: readonly Category[]): number {
  return categories[0]?.id ?? 0;
}

export function sheetTitle(
  steps: readonly { cta: string }[],
  index: number,
): string {
  return steps[index]?.cta ?? 'Shop products';
}
