'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  isInStock, resolvePrice, resolveStock, subKey, type Product,
} from '@lumea/types';

import { strapiMedia } from '@/lib/strapi';
import { HeartIcon } from '@/components/header/icons';
import { ArrowUpRight } from '@/components/ui/ArrowUpRight';
import { Button } from '@/components/ui/Button';
import { PriceBlock } from './PriceBlock';
import { VariationGroup } from './VariationGroup';
import { initialSelection } from './initialSelection';

interface Props {
  product: Product;
}

const LOW_STOCK = 5;

const CARD_SHADOW = [
  '1px 2px 4px 0px #9CB6BA1A',
  '2px 6px 7px 0px #9CB6BA17',
  '5px 14px 9px 0px #9CB6BA0D',
  '8px 26px 11px 0px #9CB6BA03',
  '13px 40px 12px 0px #9CB6BA00',
  '-12px -8px 16px 0px #9AADA729',
].join(', ');

export function ProductCard({ product }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    initialSelection(product.variations),
  );

  const sizeLabel = pickSizeLabel(product, selected);
  const title = sizeLabel === null
    ? product.name
    : `${product.name} ${sizeLabel}`;
  const price = resolvePrice(product, selected);
  const stock = resolveStock(product, selected);
  const available = isInStock(product, selected);
  const image = strapiMedia(product.imageUrl);

  return (
    <article
      className="flex h-full max-h-[632px] w-[264px] shrink-0 flex-col gap-4
                 rounded-(--radius-md) bg-(--color-paper) p-2"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="relative h-[248px] w-full shrink-0 overflow-hidden
                      rounded-(--radius-md) bg-(--color-surface)">
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
          <ul className="absolute left-1 top-1 flex flex-wrap gap-1">
            {product.badges.map((badge) => (
              <li
                key={badge.id}
                className="flex h-[39px] items-center justify-center
                           whitespace-nowrap rounded-(--radius-sm) bg-(--color-ink)
                           px-3 py-2 text-center text-[18px]/[1.3] font-bold
                           text-(--color-paper)"
                style={{ boxShadow: CARD_SHADOW }}
              >
                {badge.name}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center
                     rounded-(--radius-pill-lg) bg-(--color-surface) transition-colors
                     hover:bg-(--color-border) focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)"
        >
          <HeartIcon className="h-8 w-8 text-(--color-ink)" />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 pb-1">
        <div className="flex flex-col gap-3">
          <h4 className="flex h-11 items-start text-[18px]/[1.2] font-bold
                         text-(--color-ink)">
            {title}
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

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <StockLine stock={stock} available={available} />
          <PriceBlock price={price} />

          <div className="flex flex-col gap-1.5">
            <Button
              variant="card"
              disabled={!available}
              className="justify-start disabled:cursor-not-allowed
                         disabled:bg-(--color-border)
                         disabled:text-(--color-muted)"
            >
              {available ? 'Add to bag' : 'Out of stock'}
              <ArrowUpRight className="size-5" />
            </Button>
            <Button variant="cardGhost" className="justify-start">
              View details
            </Button>
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

const SIZE_GROUP = /size|volume|\u0454\u043c\u043d\u0456\u0441\u0442/i;

function pickSizeLabel(
  product: Product,
  selected: Record<string, string>,
): string | null {
  for (const variation of product.variations) {
    const value = variation.values.find((v) => v.label === selected[variation.label])
      ?? variation.values[0];
    if (value === undefined) continue;

    if (SIZE_GROUP.test(variation.label)) return value.label;

    if (value.subValues.length > 0 && SIZE_GROUP.test(value.subLabel ?? '')) {
      const sub = value.subValues.find(
        (item) => item.label === selected[subKey(variation.label, value.label)],
      ) ?? value.subValues[0];
      if (sub !== undefined) return sub.label;
    }
  }
  return null;
}
