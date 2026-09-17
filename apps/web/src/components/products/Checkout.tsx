'use client';

import { useState } from 'react';
import { formatPrice } from '@lumea/types';
import { Button } from '@/components/ui/Button';
import { submitOrder, type CheckoutDetails } from '@/lib/orders';
import type { CartItem } from './shopContext';

interface Props {
  cart: CartItem[];
  total: number;
  onPlaced: () => void;
  onBack: () => void;
}

const EMPTY: CheckoutDetails = { customerName: '', phone: '', email: '', comment: '' };

const FIELD_CLASS = 'rounded-2xl border border-(--color-border) bg-(--color-paper)'
  + ' px-4 py-3 font-normal text-(--color-ink)'
  + ' focus-visible:outline-2 focus-visible:outline-offset-2'
  + ' focus-visible:outline-(--color-accent)';

export function Checkout({ cart, total, onPlaced, onBack }: Props) {
  const [details, setDetails] = useState<CheckoutDetails>(EMPTY);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof CheckoutDetails) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setDetails((current) => ({ ...current, [field]: event.target.value }));

  const ready = details.customerName.trim() !== '' && details.phone.trim() !== '';

  async function place(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || sending) return;
    setSending(true);
    setError('');
    const result = await submitOrder(cart, details);
    setSending(false);
    if (result.ok) onPlaced();
    else setError(result.error ?? 'Could not place the order.');
  }

  return (
    <form onSubmit={place} className="flex flex-col gap-5">
      <ul className="flex flex-col gap-2">
        {cart.map((item) => (
          <li key={item.key} className="flex justify-between gap-3 text-[15px]">
            <span>
              {item.product.name}
              {Object.values(item.selected).length > 0 && (
                <span className="text-(--color-muted)">
                  {' '}· {Object.values(item.selected).join(' · ')}
                </span>
              )}
              {' '}× {item.quantity}
            </span>
            <span className="shrink-0 font-bold">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xl font-bold">Total: {formatPrice(total)}</p>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 font-bold">
          Name*
          <input
            required
            maxLength={100}
            autoComplete="name"
            value={details.customerName}
            onChange={set('customerName')}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5 font-bold">
          Phone*
          <input
            required
            type="tel"
            maxLength={30}
            autoComplete="tel"
            value={details.phone}
            onChange={set('phone')}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5 font-bold">
          Email
          <input
            type="email"
            maxLength={120}
            autoComplete="email"
            value={details.email}
            onChange={set('email')}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5 font-bold">
          Comment
          <textarea
            rows={3}
            maxLength={500}
            value={details.comment}
            onChange={set('comment')}
            className={`${FIELD_CLASS} resize-none`}
          />
        </label>
      </div>

      {error !== '' && (
        <p role="alert" className="rounded-2xl bg-[#fdecea] p-3 text-[15px] text-[#b4381f]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          variant="card"
          disabled={!ready || sending}
          size="dialog"
          className="w-full sm:w-auto px-8 disabled:cursor-not-allowed
                     disabled:bg-(--color-border) disabled:text-(--color-muted)"
        >
          {sending ? 'Placing order…' : 'Place order'}
        </Button>
        <Button
          variant="cardGhost"
          onClick={onBack}
          disabled={sending}
          size="dialog"
          className="w-full sm:w-auto px-8"
        >
          Back to bag
        </Button>
      </div>
    </form>
  );
}
