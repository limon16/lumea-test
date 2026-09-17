import { formatPrice, type PriceResult } from '@lumea/types';

interface Props {
  price: PriceResult;
  compact?: boolean;
}

export function PriceBlock({ price, compact = false }: Props) {
  return (
    <div
      className={`relative flex flex-col justify-center
                 ${compact
                   ? 'gap-1 py-1'
                   : 'min-h-11 rounded-(--radius-lg) bg-(--color-surface) px-6 py-1'}`}
    >
      {price.hasDiscount && !compact && (
        <span
          className="text-[14px]/[1] font-bold text-(--color-muted) line-through"
          style={{ letterSpacing: '-0.02em' }}
        >
          {formatPrice(price.base)}
        </span>
      )}

      <div className={`flex items-center ${compact ? 'gap-0.5' : 'gap-1.5'}`}>
        <span className={`font-bold text-(--color-ink)
                          ${compact ? 'text-[16px]/[1.2]' : 'text-[16px]/[1.1]'}`}>
          Price
        </span>
        <span className={`font-bold text-(--color-ink)
                          ${compact ? 'text-[16px]/[1.2]' : 'text-[18px]/[1.2]'}`}>
          {formatPrice(price.final)}
        </span>
      </div>

      {price.hasDiscount && price.discountPercent !== null && (
        <span
          className={`absolute top-1/2 flex items-center justify-center
                     rounded-(--radius-pill-lg) bg-(--color-ink) font-bold
                     text-(--color-paper)
                     ${compact
                       ? 'right-0 px-2 py-1 text-[16px]/[1.2]'
                       : 'right-6 h-[30px] w-[54px] text-[14px]/[1.3]'}`}
          style={{ transform: 'translateY(-50%) rotate(-3deg)' }}
        >
          -{price.discountPercent}%
        </span>
      )}
    </div>
  );
}
