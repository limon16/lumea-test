'use client';

import { useState } from 'react';
import Image from 'next/image';
import { isInStock, resolvePrice, resolveStock, type Product } from '@lumea/types';

import { strapiMedia } from '@/lib/strapi';
import { HeartIcon } from '@/components/header/icons';
import { PriceBlock } from './PriceBlock';
import { VariationGroup } from './VariationGroup';
import { initialSelection } from './initialSelection';

interface Props {
  product: Product;
}

const LOW_STOCK = 5;

export function ProductCard({ product }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    initialSelection(product.variations),
  );

  const price = resolvePrice(product, selected);
  const stock = resolveStock(product, selected);
  const available = isInStock(product, selected);
  const image = strapiMedia(product.imageUrl);

  return (
    <article
      className="flex h-full w-full max-w-[264px] shrink-0 flex-col gap-4 rounded-(--radius-md)
                 bg-(--color-paper) p-0"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-(--radius-md)
                      bg-(--color-surface)">
        {image !== null ? (
          <Image
            src={image}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(min-width: 768px) 264px, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center
                       text-[14px]/[1] font-bold text-(--color-muted)"
          >
            No image
          </div>
        )}

        {product.badges.length > 0 && (
          <ul className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.badges.map((badge) => (
              <li
                key={badge.id}
                className="flex h-[39px] min-w-[62px] items-center justify-center
                           whitespace-nowrap rounded-(--radius-sm) bg-(--color-ink)
                           px-2 text-center text-[18px]/[1.3] font-bold
                           text-(--color-paper)"
              >
                {badge.name}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center
                     rounded-(--radius-pill-lg) bg-(--color-surface) transition-colors
                     hover:bg-(--color-border) focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)"
        >
          <HeartIcon className="h-8 w-8 text-(--color-ink)" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-3">
          <h4 className="text-[18px]/[1.2] font-bold text-(--color-ink)">
            {product.name}
          </h4>

          {product.variations.length > 0 && (
            <div className="flex flex-col gap-3">
              {product.variations.map((variation) => (
                <VariationGroup
                  key={variation.label}
                  variation={variation}
                  selected={selected}
                  onSelect={(key, value) =>
                    setSelected((s) => ({ ...s, [key]: value }))}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <StockLine stock={stock} available={available} />
          <PriceBlock price={price} />

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              disabled={!available}
              className="flex h-11 w-full items-center justify-center rounded-(--radius-pill)
                         bg-(--color-accent) text-[16px]/[1.2] font-bold text-(--color-ink)
                         transition-transform duration-200 will-change-transform
                         hover:-translate-y-0.5 focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)
                         active:translate-y-0 motion-reduce:transform-none
                         disabled:cursor-not-allowed disabled:bg-(--color-border)
                         disabled:text-(--color-muted) disabled:hover:translate-y-0"
            >
              {available ? 'Add to bag' : 'Out of stock'}
            </button>
            <button
              type="button"
              className="flex h-[42px] w-full items-center justify-center
                         rounded-(--radius-pill) bg-(--color-surface) text-[16px]/[1.2]
                         font-bold text-(--color-ink) transition-colors
                         hover:bg-(--color-border) focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

interface StockProps {
  stock: number | null;
  available: boolean;
}

function StockLine({ stock, available }: StockProps) {
  if (stock === null) return null;

  if (!available) {
    return (
      <p className="text-[14px]/[1] font-bold text-(--color-muted)">
        Out of stock
      </p>
    );
  }

  return stock <= LOW_STOCK ? (
    <p className="text-[14px]/[1] font-bold text-[#b4381f]">
      Only {stock} left
    </p>
  ) : (
    <p className="text-[14px]/[1] font-bold text-[#1b3829]">In stock</p>
  );
}
