'use client';

import { useLayoutEffect, useRef } from 'react';
import type { Product } from '@lumea/types';
import { ProductCard, type ProductHeadingLevel } from './ProductCard';
import { LoadMore, type LoadMoreProps } from './LoadMore';

interface Props extends LoadMoreProps {
  products: Product[];
  label: string;
  compact?: boolean;
  preview?: boolean;
  headingLevel?: ProductHeadingLevel;
}

export function ProductRail({ products, label, compact = false, preview = false, headingLevel, ...pagination }: Props) {
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
    <div className={`min-w-0 shrink-0
      ${compact ? 'w-full' : '-ml-10 w-[calc(100%+40px)] -mt-7'}`}>
      <div ref={viewportRef} data-scroll-root role="region" aria-label={label} tabIndex={0}
        onScroll={(event) => sync(event.currentTarget, scrollbarRef.current)}
        className={`min-w-0 overflow-x-auto overscroll-x-contain snap-x snap-proximity
          ${compact ? 'scroll-pl-2.5' : 'overflow-y-hidden scroll-px-10'}
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden outline-none
          focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-muted)`}>
        <ul ref={contentRef} className={`flex w-max min-w-full list-none items-stretch
          ${compact ? 'gap-2 pl-2.5 pr-[22px] pt-[5px] pb-12' : 'gap-3 px-10 pt-8 pb-12'}`}>
          {products.map((product) => (
            <li key={product.id} className={`flex shrink-0 snap-start ${compact ? 'w-[160px]' : 'w-[264px]'}`}>
              <ProductCard product={product} compact={compact} preview={preview} headingLevel={headingLevel} />
            </li>
          ))}
          {pending && <li className={`flex shrink-0 ${compact ? 'w-[160px]' : preview ? 'w-[264px]' : 'min-h-[632px] w-[264px]'}`}><LoadMore {...pagination} /></li>}
        </ul>
      </div>
      {/* Друга нативна зона скролу ставить скролбар на 12px нижче карток,
          а їхнім тіням лишається 48px незрізаного простору. */}
      <div ref={scrollbarRef} aria-hidden="true" tabIndex={-1}
        style={{ visibility: 'hidden' }}
        onScroll={(event) => sync(event.currentTarget, viewportRef.current)}
        className={`relative z-10 h-3 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:thin]
          ${compact ? '-mt-10 ml-2.5' : '-mt-9 ml-10'}`}>
        <div ref={extentRef} className="h-px" />
      </div>
    </div>
  );
}
