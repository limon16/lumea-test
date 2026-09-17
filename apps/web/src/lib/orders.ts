import { subKey } from '@lumea/types';
import type { CartItem } from '@/components/products/shopContext';

export interface CheckoutDetails {
  customerName: string;
  phone: string;
  email: string;
  comment: string;
}

export interface OrderResult {
  ok: boolean;
  error?: string;
}

/**
 * Мітки обраних варіантів у порядку від верхньої групи до вкладеної —
 * сервер за ними знаходить варіант і бере його ціну з бази.
 */
export function labelsOf(item: CartItem): string[] {
  const labels: string[] = [];
  for (const variation of item.product.variations) {
    const chosen = item.selected[variation.label];
    if (chosen === undefined) continue;
    labels.push(chosen);
    const nested = item.selected[subKey(variation.label, chosen)];
    if (nested !== undefined) labels.push(nested);
  }
  return labels;
}

export async function submitOrder(
  cart: CartItem[],
  details: CheckoutDetails,
  promoCode = '',
): Promise<OrderResult> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promoCode,
        customerName: details.customerName,
        phone: details.phone,
        email: details.email,
        comment: details.comment,
        items: cart.map((item) => ({
          productId: item.product.id,
          labels: labelsOf(item),
          quantity: item.quantity,
        })),
      }),
    });

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = typeof payload === 'object' && payload !== null
        ? (payload as { error?: string }).error : undefined;
      return { ok: false, error: message ?? 'Could not place the order. Please try again.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}
