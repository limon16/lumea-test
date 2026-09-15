import { formatPrice, type PriceResult } from '@lumea/types';

interface Props {
  price: PriceResult;
}

export function PriceBlock({ price }: Props) {
  return (
    <div
      className="flex h-11 items-center justify-between gap-2 rounded-(--radius-lg)
                 bg-(--color-surface) px-4"
    >
      <div className="flex items-baseline gap-2">
        {price.hasDiscount && (
          <span className="text-[14px]/[1] font-bold text-(--color-muted) line-through">
            {formatPrice(price.base)}
          </span>
        )}
        <span className="text-[18px]/[1] font-bold text-(--color-ink)">
          {formatPrice(price.final)}
        </span>
      </div>

      {price.hasDiscount && price.discountPercent !== null && (
        <span
          className="flex h-[30px] w-[54px] shrink-0 items-center justify-center
                     rounded-(--radius-pill-lg) bg-(--color-ink) text-[14px]/[1]
                     font-bold text-(--color-paper)"
        >
          -{price.discountPercent}%
        </span>
      )}
    </div>
  );
}
