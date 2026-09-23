import { useEffect, useRef, useState } from 'react';
import { labelsOf } from '@/lib/orders';
import type { CartItem } from './shopContext';

type Quote = {
  promoCode: string | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  unavailableItems: { index: number; productId: number }[];
};
export function usePromoCode(cart: CartItem[]) {
  const [code, setCode] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; quote?: Quote; error?: string } | null>(null);
  const [lastQuote, setLastQuote] = useState<{ items: string; quote: Quote } | null>(null);
  const submittedCode = useRef<string | null>(null);
  const items = JSON.stringify(cart.map(item => ({ productId: item.product.id, labels: labelsOf(item), quantity: item.quantity })));
  const key = JSON.stringify([code, items, attempt]);
  useEffect(() => {
    if (items === '[]') return;
    const controller = new AbortController();
    async function check() {
      try {
        const response = await fetch('/api/orders/quote', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promoCode: code, items: JSON.parse(items) }), signal: controller.signal,
        });
        const payload = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          submittedCode.current = null;
          setResult({ key, error: payload.error ?? 'Could not apply this code.' });
        } else {
          setLastQuote({ items, quote: payload.data });
          setResult({ key, quote: payload.data });
        }
      } catch {
        if (!controller.signal.aborted) {
          submittedCode.current = null;
          setResult({ key, error: 'Could not check this code. Please try again.' });
        }
      }
    }
    void check();
    return () => controller.abort();
  }, [code, items, key]);
  const current = result?.key === key ? result : null;
  // Поки код для цього кошика перевіряється, показуємо останні підтверджені суми.
  // Оформлення все одно вимагає свіжої успішної відповіді через `ready` нижче.
  const previousQuote = lastQuote?.items === items ? lastQuote.quote : undefined;
  const displayQuote = current?.quote ?? (previousQuote && !code
    ? { ...previousQuote, promoCode: null, discountAmount: 0, total: previousQuote.subtotal }
    : previousQuote);
  const unavailableIndexes = new Set(displayQuote?.unavailableItems.map(item => item.index) ?? []);
  cart.forEach((item, index) => {
    if (item.stock !== null && item.stock < item.quantity) unavailableIndexes.add(index);
  });
  return {
    code,
    apply: (value: string) => {
      const normalized = value.trim().toUpperCase();
      if (!normalized || submittedCode.current === normalized) return;
      submittedCode.current = normalized;
      setCode(normalized);
      setAttempt(n => n + 1);
    },
    remove: () => { submittedCode.current = null; setCode(''); setResult(null); },
    applied: Boolean(code && lastQuote?.quote.promoCode === code && !current?.error),
    pending: Boolean(cart.length && !current),
    error: current?.error,
    quote: cart.length ? current?.quote : undefined,
    displayQuote: cart.length ? displayQuote : undefined,
    unavailableIndexes,
    ready: Boolean(cart.length && current?.quote && unavailableIndexes.size === 0),
  };
}
