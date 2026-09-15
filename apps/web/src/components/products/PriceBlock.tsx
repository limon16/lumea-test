import { formatPrice, type PriceResult } from '@lumea/types';

interface Props {
  price: PriceResult;
}

export function PriceBlock({ price }: Props) {
  return (
    <div
      className="relative flex min-h-11 flex-col justify-center
                 rounded-(--radius-lg) bg-(--color-surface) px-6 py-1"
    >
      {price.hasDiscount && (
        <span
          className="text-[14px]/[1] font-bold text-(--color-muted) line-through"
          style={{ letterSpacing: '-2%' }}
        >
          {formatPrice(price.base)}
        </span>
      )}

      <div className="flex items-center gap-1.5">
        <span className="text-[16px]/[1.1] font-bold text-(--color-ink)">
          Price
        </span>
        <span className="text-[18px]/[1.2] font-bold text-(--color-ink)">
          {formatPrice(price.final)}
        </span>
      </div>

      {price.hasDiscount && price.discountPercent !== null && (
        <span
          className="absolute right-6 top-1/2 flex h-[30px] w-[54px]
                     items-center justify-center rounded-(--radius-pill-lg)
                     bg-(--color-ink) text-[14px]/[1.3] font-bold
                     text-(--color-paper)"
          style={{ transform: 'translateY(-50%) rotate(-3deg)' }}
        >
          -{price.discountPercent}%
        </span>
      )}
    </div>
  );
}
