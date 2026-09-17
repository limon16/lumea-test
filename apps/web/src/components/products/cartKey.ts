import type { Selection } from './shopContext';

// Позиція кошика — це товар плюс конкретний набір обраних варіантів,
// тож 50 ml і 100 ml того самого товару рахуються окремо.
export function cartKey(productId: number, selected: Selection): string {
  const entries = Object.entries(selected).sort(([a], [b]) => a.localeCompare(b));
  return `${productId}:${JSON.stringify(entries)}`;
}
