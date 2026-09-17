'use client';

import { useEffect, useRef } from 'react';

import type { Category, Product } from '@lumea/types';

import { optionKeys } from '@/components/ui/optionKeys';
import { CatalogContent } from './CatalogContent';
import type { LoadMoreProps } from './LoadMore';

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
  productPagination?: LoadMoreProps;
  categoryPagination?: LoadMoreProps;
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
  productPagination,
  categoryPagination,
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

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
      className="sheet bg-(--color-paper) backdrop:bg-black/40"
    >
      {/* Бічних падінгів немає навмисно: скрол-смуги всередині самі тримають
          відступи, інакше overflow обрізав би тіні карток і вкладок. */}
      <div className="relative flex h-full flex-col overflow-y-auto pt-[60px] pb-8">
        <h3 className="mb-4 text-center text-[24px]/[1.2] font-bold text-(--color-ink)">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close products"
          className="absolute right-5 top-5 flex size-8 items-center justify-center
                     rounded-full bg-(--color-surface) text-(--color-ink)
                     transition-colors hover:bg-(--color-border)
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-(--color-accent)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
            <path
              d="M5 5l14 14M19 5L5 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <CatalogContent products={products} categories={categories} activeId={activeCategoryId} compact
          onSelect={onCategoryChange} productPagination={productPagination} categoryPagination={categoryPagination} />

        <div className="mt-auto flex shrink-0 flex-col gap-4 px-3">
          <p className="text-center text-[18px]/[1.3] font-medium text-[#858585]">
            Shop products for:
          </p>
          <ul role="radiogroup" onKeyDown={optionKeys} aria-label="Care step"
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
                    tabIndex={isActive ? 0 : -1}
                    className={`flex h-[35px] w-full items-center justify-start
                                gap-2.5 rounded-[12px] border px-3 py-1.5
                                text-[18px]/[1.3] shadow-soft
                                transition-colors focus-visible:outline-2
                                focus-visible:outline-offset-2
                                focus-visible:outline-(--color-accent)
                                ${isActive
                                  ? 'border-transparent bg-(--color-ink) text-(--color-paper)'
                                  : 'border-[#d9e1e2] bg-white text-(--color-ink)'}`}
                  >
                    <span
                      aria-hidden="true"
                      className="relative block h-5 w-[42px] shrink-0 overflow-hidden
                                 text-center text-[38px]/[1] font-medium tracking-[-0.02em] text-[#bfbfbf]"
                    >
                      {/* Цифра більша за рамку і зсунута вгору — у макеті так само,
                          верхівка зрізається і лишається характерний знак. */}
                      <span className="absolute inset-x-0 top-[-5.2px]">
                        {step.number}
                      </span>
                    </span>
                    <span className="font-bold">{step.title}</span>
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
