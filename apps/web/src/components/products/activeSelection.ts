import { subKey, type Product } from '@lumea/types';

export function activeSelection(product: Product, selected: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const group of product.variations) {
    const value = group.values.find((item) => item.label === selected[group.label]) ?? group.values[0];
    if (!value) continue;
    result[group.label] = value.label;
    const key = subKey(group.label, value.label);
    const sub = value.subValues.find((item) => item.label === selected[key]) ?? value.subValues[0];
    if (sub) result[key] = sub.label;
  }
  return result;
}
