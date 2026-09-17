'use client';

import { useState } from 'react';
import { formatPrice } from '@lumea/types';
import { Button } from '@/components/ui/Button';
import type { usePromoCode } from './usePromoCode';

export function PromoCodeField({ promo }: { promo: ReturnType<typeof usePromoCode> }) {
  const [value, setValue] = useState(promo.code);
  return (
    <form onSubmit={event => { event.preventDefault(); if (value.trim() && !promo.pending && !promo.applied) promo.apply(value); }} className="flex shrink-0 flex-col gap-2">
      <div className="flex min-h-5 items-baseline justify-between gap-3">
        <label htmlFor="bag-promo-code" className="shrink-0 text-[14px] font-bold">Promo code</label>
        <span className="text-[13px]/5 text-[#38784f]">{promo.applied ? '✓ Applied' : ''}</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_104px] items-center gap-2">
        <input id="bag-promo-code" value={promo.applied ? promo.code : value} readOnly={promo.applied} onChange={event => setValue(event.target.value)} maxLength={40}
          placeholder="Enter your code" autoCapitalize="characters" autoComplete="off" spellCheck={false}
          aria-describedby="bag-promo-status"
          className="h-12 min-w-0 rounded-full border border-(--color-border) bg-white px-4 text-[16px] uppercase placeholder:normal-case read-only:border-[#b8d5c2] read-only:bg-[#ecf5ee] focus-visible:outline-2 focus-visible:outline-(--color-accent)" />
        {promo.applied ? (
          <Button type="button" size="dialog" variant="secondary" onClick={() => { promo.remove(); setValue(''); }}>Remove</Button>
        ) : (
          <Button type="submit" size="dialog" disabled={!value.trim() || promo.pending} aria-label={promo.pending ? 'Checking promo code' : 'Apply'}>
            {promo.pending ? <span aria-hidden="true" className="size-4 motion-safe:animate-spin rounded-full border-2 border-current border-r-transparent" /> : 'Apply'}
          </Button>
        )}
      </div>
      <div id="bag-promo-status" role="status" aria-live="polite" className="flex h-5 items-center justify-between gap-2 text-[13px]/5 text-[#68746b]">
        {promo.error ? (
          <span className="truncate text-[#b4381f]" title={promo.error}>{promo.error}</span>
        ) : <><span>Promo discount</span><span className="tabular-nums">−{formatPrice(promo.displayQuote?.discountAmount ?? 0)}</span></>}
      </div>
    </form>
  );
}
