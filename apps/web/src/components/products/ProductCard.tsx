'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  isInStock, isSizeGroup, resolvePrice, resolveStock, subKey, type Product,
} from '@lumea/types';

import { strapiMedia } from '@/lib/strapi';
import { HeartIcon } from '@/components/header/icons';
import { ArrowUpRight } from '@/components/ui/ArrowUpRight';
import { Button } from '@/components/ui/Button';
import { PriceBlock } from './PriceBlock';
import { VariationGroup } from './VariationGroup';
import { useShop } from './shopContext';
import { activeSelection } from './activeSelection';
import { cartKey } from './cartKey';
import { initialSelection } from './initialSelection';

export type ProductHeadingLevel = 'h3' | 'h4';

interface Props {
  product: Product;
  initialSelected?: Record<string, string>;
  details?: boolean;
  compact?: boolean;
  preview?: boolean;
  /** Рівень заголовка назви: залежить від заголовка контейнера, у якому стоїть картка. */
  headingLevel?: ProductHeadingLevel;
}

const LOW_STOCK = 5;

const HEART_SHADOW = [
  '1px 2px 4px 0px #9CB6BA14',
  '-8px 12px 12px 0px #9CB6BA17',
  '12px 20px 16px 0px #9CB6BA17',
  '8px 26px 14px 0px #9CB6BA17',
  '-20px 40px 30px 0px #9CB6BA0F',
  '-12px -40px 30px 0px #9CB6BA1A',
].join(', ');

export function ProductCard({
  product, initialSelected, details = false, compact = false, preview = false, headingLevel: Heading = 'h4',
}: Props) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    initialSelected ?? initialSelection(product.variations),
  );

  const shop = useShop();
  const saved = shop.wishlist.some((item) => item.id === product.id);
  const subtitle = pickSubtitle(product, selected);
  const title = subtitle === null
    ? product.name
    : `${product.name} ${subtitle}`;
  const price = resolvePrice(product, selected);
  const stock = resolveStock(product, selected);
  const available = isInStock(product, selected);
  const image = strapiMedia(product.imageUrl);
  const inBag = shop.cart.find(
    (item) => item.key === cartKey(product.id, activeSelection(product, selected)),
  );

  if (preview) return (
    <article className="flex w-[264px] flex-col gap-3 rounded-2xl bg-white p-3 shadow-soft">
      <div className="relative h-[var(--preview-image-height,clamp(0px,calc(100dvh-420px),160px))] shrink-0 overflow-hidden rounded-xl bg-(--color-surface)">
        {image ? (
          <Image src={image} alt={product.imageAlt ?? product.name} fill sizes="240px" className="object-contain" />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-[14px]/[1] font-bold text-(--color-muted)">
            No image
          </div>
        )}
      </div>
      <div className="flex items-start gap-2">
        <Heading className="line-clamp-2 min-h-10 flex-1 text-[16px]/[1.25] font-bold" title={title}>{title}</Heading>
        <button type="button" aria-label={`Remove ${product.name} from wishlist`} onClick={() => shop.toggleWishlist(product)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--color-surface) text-(--color-ink) focus-visible:outline-2">
          <HeartIcon className="size-[22px] fill-current" />
        </button>
      </div>
      <PriceBlock price={price} />
      <Button size="dialog" onClick={() => shop.show({ product, selected })}>View details <ArrowUpRight className="size-5" /></Button>
    </article>
  );

  return (
    <article
      className={`flex shrink-0 flex-col break-words bg-(--color-paper) shadow-soft
                 ${compact
                   ? 'h-[355px] w-[160px] gap-3 rounded-[12px] border border-transparent px-1 pt-1 pb-3 [background:linear-gradient(var(--color-paper),var(--color-paper))_padding-box,linear-gradient(to_bottom,#f3f5f5,#f5fcfd)_border-box]'
                   : 'h-full min-h-[632px] w-[264px] gap-4 rounded-(--radius-md) p-2'}`}
    >
      <div className={`relative w-full shrink-0 overflow-hidden bg-(--color-surface)
                      ${compact
                        ? 'aspect-square rounded-[12px]'
                        : 'h-[248px] rounded-(--radius-md)'}`}>
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
                className={`flex items-center justify-center whitespace-nowrap
                           bg-(--color-ink) text-center text-(--color-paper) shadow-soft
                           ${compact
                             ? 'rounded-[8px] px-2 py-1 text-[16px]/[1.2]'
                             : 'h-[39px] rounded-(--radius-sm) px-3 py-2 text-[18px]/[1.3] font-bold'}`}
              >
                {badge.name}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={saved}
          onClick={() => shop.toggleWishlist(product)}
          style={{ boxShadow: HEART_SHADOW }}
          className={`absolute flex items-center justify-center
                     rounded-(--radius-pill-lg) bg-(--color-surface) transition-colors
                     hover:bg-(--color-border) focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)
                     ${compact ? 'bottom-1.5 right-1.5 size-8' : 'bottom-2 right-2 size-11'}`}
        >
          <HeartIcon className={`${compact ? 'size-5' : 'h-8 w-8'} ${saved ? 'fill-(--color-accent) text-(--color-accent)' : 'text-(--color-ink)'}`} />
        </button>
      </div>

      <div className={`flex flex-1 flex-col justify-between pb-1 ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <div className="flex flex-col gap-3">
          <Heading className={`flex flex-col text-(--color-ink)
                         ${compact
                           ? 'h-[57px] overflow-hidden text-[16px]/[1.2] font-medium'
                           : 'min-h-11 items-start text-[18px]/[1.2] font-bold'}`}
            title={title}>
            {/* Назва — не більше двох рядків, решта в «…»; підзаголовок
                (ємність, кількість у наборі тощо) завжди лишається
                видимим окремим рядком. */}
            <span className={compact ? 'line-clamp-2' : 'line-clamp-1'}>
              {product.name}
            </span>
            {subtitle !== null && <span className="shrink-0">{subtitle}</span>}
          </Heading>

          {!compact && product.variations.length > 0 && (
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

        <div className={`mt-auto flex flex-col ${compact ? 'gap-3' : 'gap-2 pt-3'}`}>
          {!compact && <StockLine stock={stock} available={available} />}
          <PriceBlock price={price} compact={compact} />

          <div className={`flex ${compact ? 'flex-col-reverse gap-3' : 'flex-col gap-1.5'}`}>
            {inBag !== undefined && available ? (
              <QuantityControl
                quantity={inBag.quantity}
                stock={stock}
                onDecrease={() => shop.decreaseInBag(inBag.key)}
                onIncrease={() => shop.addToBag(product, selected)}
                label={product.name}
              />
            ) : (
              <Button
                variant="card"
                onClick={() => shop.addToBag(product, selected)}
                disabled={!available}
                className={`disabled:cursor-not-allowed
                           disabled:bg-(--color-border)
                           disabled:text-(--color-muted)
                           ${compact
                             ? 'justify-center gap-1 whitespace-nowrap px-3'
                             : 'justify-start'}`}
              >
                {available ? 'Add to bag' : 'Out of stock'}
                {available && <ArrowUpRight className={compact ? 'size-[22px] shrink-0' : 'size-5'} />}
              </Button>
            )}
            {compact ? (
              <button
                type="button"
                onClick={() => details ? shop.show('cart') : shop.show({ product, selected })}
                className="self-start text-[14px]/[1.3] text-(--color-ink)
                           underline underline-offset-4 focus-visible:outline-2
                           focus-visible:outline-offset-2
                           focus-visible:outline-(--color-accent)"
              >
                {details ? 'View bag' : 'View details'}
              </button>
            ) : (
              <Button variant="cardGhost" className="justify-start" onClick={() => details ? shop.show('cart') : shop.show({ product, selected })}>
                {details ? 'View bag' : 'View details'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

interface QuantityProps {
  quantity: number;
  stock: number | null;
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
}

function QuantityControl({
  quantity, stock, label, onDecrease, onIncrease,
}: QuantityProps) {
  const atMax = stock !== null && quantity >= stock;

  return (
    <div className="flex h-11 w-full items-center justify-between gap-2
                    rounded-full bg-(--color-surface) px-2">
      <StepButton
        label={quantity > 1
          ? `Decrease quantity of ${label}`
          : `Remove ${label} from bag`}
        onClick={onDecrease}
      >
        −
      </StepButton>

      <span className="text-[16px]/[1.1] font-bold text-(--color-ink)">
        {quantity}
      </span>

      <StepButton
        label={`Increase quantity of ${label}`}
        onClick={onIncrease}
        disabled={atMax}
      >
        +
      </StepButton>
    </div>
  );
}

interface StepProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}

function StepButton({ label, onClick, disabled = false, children }: StepProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 shrink-0 items-center justify-center rounded-full
                 bg-(--color-paper) text-[18px]/[1] font-bold text-(--color-ink)
                 transition-colors hover:bg-(--color-border)
                 disabled:cursor-not-allowed disabled:text-(--color-muted)
                 disabled:hover:bg-(--color-paper)
                 focus-visible:outline-2 focus-visible:outline-offset-2
                 focus-visible:outline-(--color-accent)"
    >
      {children}
    </button>
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

function pickSubtitle(
  product: Product,
  selected: Record<string, string>,
): string | null {
  if (product.subtitleMode === 'single') return product.subtitle;

  for (const variation of product.variations) {
    const value = variation.values.find((v) => v.label === selected[variation.label])
      ?? variation.values[0];
    if (value === undefined) continue;

    if (isSizeGroup(variation.label)) return value.label;

    if (value.subValues.length > 0 && isSizeGroup(value.subLabel ?? '')) {
      const sub = value.subValues.find(
        (item) => item.label === selected[subKey(variation.label, value.label)],
      ) ?? value.subValues[0];
      if (sub !== undefined) return sub.label;
    }
  }
  return null;
}
