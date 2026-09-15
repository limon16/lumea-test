'use client';

import { useEffect, useRef } from 'react';

import type { Category, Product } from '@lumea/types';

import { CategoryTabs } from './CategoryTabs';
import { filterByCategory } from './filterByCategory';
import { ProductCard } from './ProductCard';

interface StepOption {
  number: string;
  title: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  products: Product[];
  categories: Category[];
  activeCategoryId: number;
  onCategoryChange: (id: number) => void;
  steps: readonly StepOption[];
  activeStepIndex: number;
  onStepChange: (index: number) => void;
}

export function MobileSheet({
  open,
  onClose,
  title,
  products,
  categories,
  activeCategoryId,
  onCategoryChange,
  steps,
  activeStepIndex,
  onStepChange,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;

    const previous = document.body.style.overflow;
    const syncLock = () => {
      document.body.style.overflow = dialog.open ? 'hidden' : previous;
    };

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    syncLock();

    dialog.addEventListener('close', syncLock);
    return () => {
      dialog.removeEventListener('close', syncLock);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const visible = filterByCategory(products, activeCategoryId);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
      className="sheet rounded-t-[32px] bg-(--color-paper) backdrop:bg-black/40"
    >
      <div className="flex max-h-[90vh] flex-col gap-6 overflow-y-auto p-5 pb-8">
        <div className="flex items-start justify-between gap-4">
          {}
          <h3 className="text-[24px]/[1.1] font-bold text-(--color-ink)">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close products"
            className="flex h-8 w-8 shrink-0 items-center justify-center
                       rounded-full text-(--color-muted) transition-colors
                       hover:text-(--color-ink) focus-visible:outline-2
                       focus-visible:outline-offset-2
                       focus-visible:outline-(--color-accent)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                d="M5 5l14 14M19 5L5 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            activeId={activeCategoryId}
            onSelect={onCategoryChange}
          />
        )}

        {visible.length > 0 ? (
          <ul
            className="-mx-5 flex list-none gap-3 overflow-x-auto px-5 pb-2"
            style={{ scrollSnapType: 'x proximity' }}
          >
            {visible.map((product) => (
              <li
                key={product.id}
                className="flex shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex min-h-[200px] items-center justify-center
                        rounded-(--radius-md) bg-(--color-surface) px-6
                        text-center text-[16px]/[1.4] font-medium
                        text-(--color-muted)">
            {categories.length === 0 || products.length === 0
              ? 'Products are unavailable right now. Please check back later.'
              : 'No products in this category yet.'}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <p className="text-[18px]/[1.2] font-medium text-(--color-muted)">
            Shop products for:
          </p>
          <ul role="radiogroup" aria-label="Care step"
              className="grid list-none grid-cols-2 gap-1.5">
            {steps.map((step, index) => {
              const isActive = index === activeStepIndex;
              return (
                <li key={step.number}>
                  <button
                    type="button"
                    onClick={() => onStepChange(index)}
                    role="radio"
                    aria-checked={isActive}
                    className={`flex h-[35px] w-full items-center justify-center
                                gap-1.5 rounded-xl text-[14px]/[1] font-bold
                                transition-colors focus-visible:outline-2
                                focus-visible:outline-offset-2
                                focus-visible:outline-(--color-accent)
                                ${isActive
                                  ? 'bg-(--color-ink) text-(--color-paper)'
                                  : 'bg-(--color-paper) text-(--color-ink) ring-1 ring-(--color-border)'}`}
                  >
                    <span>{step.number}</span>
                    <span>{step.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
