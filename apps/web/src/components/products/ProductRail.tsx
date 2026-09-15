'use client';

import { useLayoutEffect, useRef } from 'react';
import type { Product } from '@lumea/types';
import { ProductCard } from './ProductCard';
import { LoadMore, type LoadMoreProps } from './LoadMore';

interface Props extends LoadMoreProps {
  products: Product[];
  label: string;
  compact?: boolean;
  emptyMessage?: string;
}

export function ProductRail({ products, label, compact = false, emptyMessage = 'No products found.', ...pagination }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const extentRef = useRef<HTMLDivElement>(null);
  const pending = pagination.loading || pagination.error || pagination.hasMore;
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const scrollbar = scrollbarRef.current;
    const extent = extentRef.current;
    if (!viewport || !scrollbar || !extent) return;
    const resize = () => {
      const distance = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      extent.style.width = `${scrollbar.clientWidth + distance}px`;
      scrollbar.style.visibility = distance > 0 ? 'visible' : 'hidden';
      scrollbar.scrollLeft = viewport.scrollLeft;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    if (contentRef.current) observer.observe(contentRef.current);
    resize();
    return () => observer.disconnect();
  }, [products.length, pending]);
  const sync = (from: HTMLDivElement, to: HTMLDivElement | null) => {
    if (to && Math.abs(to.scrollLeft - from.scrollLeft) > 1) to.scrollLeft = from.scrollLeft;
  };
  return (
    <div className={`-ml-10 w-[calc(100%+40px)] min-w-0 shrink-0 ${compact ? '' : '-mt-7'}`}>
      <div ref={viewportRef} data-scroll-root role="region" aria-label={label} tabIndex={0}
        onScroll={(event) => sync(event.currentTarget, scrollbarRef.current)}
        className="min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-proximity scroll-px-10
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden outline-none
          focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-muted)">
        {products.length > 0 || pending ? (
          <ul ref={contentRef} className="flex w-max min-w-full list-none items-stretch gap-3 px-10 pt-8 pb-12">
            {products.map((product) => (
              <li key={product.id} className="flex w-[264px] shrink-0 snap-start">
                <ProductCard product={product} />
              </li>
            ))}
            {pending && <li className="flex min-h-[632px] w-[264px] shrink-0"><LoadMore {...pagination} /></li>}
          </ul>
        ) : (
          <p className="ml-10 mt-8 mb-12 flex min-h-48 items-center justify-center rounded-3xl bg-(--color-surface) px-6 text-center">
            {emptyMessage}
          </p>
        )}
      </div>
      {/* A second native scroll surface places the scrollbar 12px below the
          cards while their shadows retain 48px of unclipped painting space. */}
      <div ref={scrollbarRef} aria-hidden="true" tabIndex={-1}
        onScroll={(event) => sync(event.currentTarget, viewportRef.current)}
        className="relative z-10 -mt-9 ml-10 h-3 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:thin]">
        <div ref={extentRef} className="h-px" />
      </div>
    </div>
  );
}
