'use client';

import { useLayoutEffect, useRef } from 'react';
import type { Product } from '@lumea/types';
import { ProductCard, type ProductHeadingLevel } from './ProductCard';
import { LoadMore, type LoadMoreProps } from './LoadMore';
import { DESKTOP_QUERY } from './sheetState';

interface Props extends LoadMoreProps {
  products: Product[];
  label: string;
  compact?: boolean;
  preview?: boolean;
  detachedShadows?: boolean;
  headingLevel?: ProductHeadingLevel;
}

export function ProductRail({ products, label, compact = false, preview = false, detachedShadows = false, headingLevel, ...pagination }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const extentRef = useRef<HTMLDivElement>(null);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const separateShadows = detachedShadows && !compact && !preview;
  const pending = pagination.loading || pagination.error || pagination.hasMore;
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!separateShadows || !viewport) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    let drag: { x: number; scrollLeft: number } | null = null;
    let dragged = false;
    const stop = () => {
      drag = null;
      viewport.style.removeProperty('cursor');
    };
    const down = (event: MouseEvent) => {
      dragged = false;
      if (!desktop.matches || event.button !== 0 || viewport.scrollWidth <= viewport.clientWidth) return;
      drag = { x: event.clientX, scrollLeft: viewport.scrollLeft };
    };
    const move = (event: MouseEvent) => {
      if (!drag) return;
      if (!(event.buttons & 1)) { stop(); return; }
      const delta = event.clientX - drag.x;
      if (!dragged && Math.abs(delta) < 5) return;
      dragged = true;
      event.preventDefault();
      viewport.style.cursor = 'grabbing';
      viewport.scrollLeft = Math.max(0, Math.min(
        viewport.scrollWidth - viewport.clientWidth, drag.scrollLeft - delta,
      ));
    };
    const click = (event: MouseEvent) => {
      // A drag starting on a button must not also activate that button.
      if (!dragged || event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };
    const nativeDrag = (event: DragEvent) => {
      if (drag) event.preventDefault();
    };
    viewport.addEventListener('mousedown', down);
    viewport.addEventListener('click', click, true);
    viewport.addEventListener('dragstart', nativeDrag);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    window.addEventListener('blur', stop);
    return () => {
      stop();
      viewport.removeEventListener('mousedown', down);
      viewport.removeEventListener('click', click, true);
      viewport.removeEventListener('dragstart', nativeDrag);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('blur', stop);
    };
  }, [separateShadows]);
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
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!separateShadows || !viewport || !content) return;

    // Only visible card silhouettes cast shadows; card content stays clipped
    // by the native scroller. The shadow layer itself can extend into the gap.
    const updateShadows = () => {
      const bounds = viewport.getBoundingClientRect();
      const cards = Array.from(content.children).slice(0, products.length);
      cards.forEach((card, index) => {
        const shadow = shadowRefs.current[index];
        if (!shadow) return;
        const rect = card.getBoundingClientRect();
        const left = Math.max(0, rect.left - bounds.left);
        const right = Math.min(bounds.width, rect.right - bounds.left);
        shadow.style.display = right > left ? 'block' : 'none';
        shadow.style.left = `${left}px`;
        shadow.style.top = `${rect.top - bounds.top}px`;
        shadow.style.width = `${Math.max(0, right - left)}px`;
        shadow.style.height = `${rect.height}px`;
      });
    };
    const observer = new ResizeObserver(updateShadows);
    observer.observe(viewport);
    observer.observe(content);
    Array.from(content.children).forEach((card) => observer.observe(card));
    viewport.addEventListener('scroll', updateShadows, { passive: true });
    updateShadows();
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', updateShadows);
    };
  }, [separateShadows, products.length, pending]);

  const sync = (from: HTMLDivElement, to: HTMLDivElement | null) => {
    if (to && Math.abs(to.scrollLeft - from.scrollLeft) > 1) to.scrollLeft = from.scrollLeft;
  };
  return (
    <div className={`relative isolate min-w-0 shrink-0 w-full
      ${compact ? '-mt-[27px]' : '-mt-7'}`}>
      {separateShadows && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden lg:block [clip-path:inset(-48px_0_-48px_-40px)]">
          {products.map((product, index) => (
            <div key={product.id} ref={(node) => { shadowRefs.current[index] = node; }}
              className="absolute rounded-(--radius-md) shadow-soft" />
          ))}
        </div>
      )}
      <div ref={viewportRef} data-scroll-root role="region" aria-label={label} tabIndex={0}
        onScroll={(event) => sync(event.currentTarget, scrollbarRef.current)}
        className={`min-w-0 overflow-x-auto overscroll-x-contain snap-x snap-proximity
          ${compact ? '-ml-3 scroll-pl-[22px]' : 'overflow-y-hidden scroll-px-10'}
          ${separateShadows ? 'lg:scroll-pl-0 lg:snap-none lg:cursor-grab lg:select-none' : ''}
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden outline-none
          focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-muted)`}>
        <ul ref={contentRef} className={`flex w-max min-w-full list-none items-stretch
          ${compact ? 'gap-2 pl-[22px] pt-8 pb-12' : 'gap-3 px-2.5 pt-8 pb-12'}
          ${separateShadows ? 'lg:pl-0 lg:[&>li>article]:shadow-none' : ''}`}>
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
          ${compact ? '-mt-10 ml-2.5' : '-mt-9 mx-2.5'}
          ${separateShadows ? 'lg:ml-0' : ''}`}>
        <div ref={extentRef} className="h-px" />
      </div>
    </div>
  );
}
